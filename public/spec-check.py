#!/usr/bin/env python3
"""Check a product spec written with the product spec template.

Usage:  python3 spec-check.py path/to/spec.md
Exits with 1 if it finds problems, so it can run in CI.

It checks the mechanical rules in Part 2 and Part 9 of the agent loop
instructions. It can't judge whether a rule is right; people do that.
"""
import re
import sys
from collections import Counter, defaultdict

RULE_PREFIXES = "REQ|DATA|SEC|OPS"
ALL_PREFIXES = "SPEC|F|REQ|STD|DATA|SEC|NFR|OPS|API|DEC|GOAL"
ID_RE = re.compile(rf"\b(?:{ALL_PREFIXES})-\d+(?:\.\d+)?\b")
SPEC_STATUSES = {"Draft", "Under review", "Approved", "Superseded"}
FEATURE_STATUSES = {"Proposed", "Approved", "Superseded"}
READINESS = {"Not ready", "Ready for planning", "Ready for implementation"}
PRIORITIES = {"Must", "Should", "Could"}
SECTIONS = ["Where things stand", "Summary", "Goals", "Users, roles and permissions",
            "Features at a glance", "How it fits together", "Boundaries", "Glossary",
            "Standard behaviors", "Data model and lifecycle", "Interfaces and integrations",
            "Security and privacy", "Quality targets", "Architecture and constraints",
            "Operations and release"]


def split_front_matter(text):
    """Return (top-level fields, every key/value pair, body, number of front matter lines)."""
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        return {}, [], text, 0
    top, pairs = {}, []
    for line in m.group(1).splitlines():
        kv = re.match(r"^(\s*)([a-z_]+):\s*(.*)$", line)
        if kv:
            value = kv.group(3).strip()
            pairs.append((kv.group(2), value))
            if not kv.group(1):
                top[kv.group(2)] = value.strip('"')
    return top, pairs, text[m.end():], m.group(0).count("\n")


def blank_code(text):
    """Blank out fenced blocks and inline code, keeping line numbers."""
    text = re.sub(r"```.*?```", lambda m: "\n" * m.group(0).count("\n"), text, flags=re.S)
    return re.sub(r"`[^`\n]*`", "", text)


def section(body, start):
    """Text under the heading that starts with `start`, up to the next heading at its level or above."""
    level = len(start) - len(start.lstrip("#"))
    m = re.search(rf"^{re.escape(start)}.*$", body, re.M)
    if not m:
        return None
    rest = body[m.end():]
    nxt = re.search(rf"^#{{1,{level}}} ", rest, re.M)
    return rest[: nxt.start()] if nxt else rest


def labelled_part(text, label):
    """Lines after a bold label such as **Blocking decisions** up to the next bold label or heading."""
    m = re.search(rf"^\*\*{re.escape(label)}[^\n]*$", text, re.M)
    if not m:
        return ""
    rest = text[m.end():]
    nxt = re.search(r"^(\*\*[^*\n]+\*\*|#)", rest, re.M)
    return rest[: nxt.start()] if nxt else rest


def table_rows(text):
    """Rows of the first Markdown table in text, as lists of cells, without header and separator."""
    rows = [l for l in text.splitlines() if l.startswith("|")]
    return [[c.strip() for c in r.strip("|").split("|")] for r in rows[2:]]


def main(path):
    text = open(path, encoding="utf-8").read()
    fm, fm_pairs, body, fm_lines = split_front_matter(text)
    plain = blank_code(body)
    lines = body.splitlines()
    problems = []

    def problem(msg):
        problems.append(msg)

    def lineno(i):
        return i + 1 + fm_lines

    # ---- Front matter -------------------------------------------------
    if not fm:
        problem("front matter (the --- block at the top) is missing")
    for key in ("spec_id", "product", "version", "status", "release", "readiness", "updated"):
        if fm and not fm.get(key):
            problem(f"front matter: '{key}' is missing")
    owners = {k: v for k, v in fm_pairs if k in ("decision", "product", "technical")}
    for role in ("decision", "product", "technical"):
        if fm and not owners.get(role, "").strip('"'):
            problem(f"front matter: owner '{role}' is missing")
    for key, value in fm_pairs:
        # A YAML list like [Ana, Ben] is fine; a quoted "[placeholder]" is not.
        if '"[' in value or (re.search(r"\[[^\]]*\]", value) and not value.startswith("[")):
            problem(f"front matter: '{key}' still has a placeholder")
    if fm.get("status") and fm["status"] not in SPEC_STATUSES:
        problem(f"front matter: status '{fm['status']}' isn't one of {sorted(SPEC_STATUSES)}")
    if fm.get("readiness") and fm["readiness"] not in READINESS:
        problem(f"front matter: readiness '{fm['readiness']}' isn't one of {sorted(READINESS)}")
    release = fm.get("release", "")

    # ---- Required sections --------------------------------------------
    for n, name in enumerate(SECTIONS, start=1):
        sec = section(body, f"### {n}. ")
        if sec is None:
            problem(f"section {n} ({name}) is missing")
        elif not re.sub(r"<!--.*?-->", "", sec, flags=re.S).strip():
            problem(f"section {n} ({name}) is empty; fill it in or write 'N/A: reason'")

    # ---- Section 1: status, decisions, checklist -------------------------
    s1 = section(body, "### 1. ") or ""
    head = re.search(r"\*\*Status: ([^.]+)\. Readiness: ([^.]+)\.\*\*", s1)
    if not head:
        problem("section 1: first line should read '**Status: X. Readiness: Y.**'")
    else:
        if head.group(1).strip() != fm.get("status"):
            problem(f"status differs: front matter '{fm.get('status')}', section 1 '{head.group(1)}'")
        if head.group(2).strip() != fm.get("readiness"):
            problem(f"readiness differs: front matter '{fm.get('readiness')}', section 1 '{head.group(2)}'")
    blocking = {}
    for row in table_rows(labelled_part(s1, "Blocking decision")):
        if len(row) < 5 or not re.match(r"DEC-\d{3}$", row[0]):
            continue
        blocking[row[0]] = row[2]
        if not re.match(r"(Planning|Implementation)\b", row[2]):
            problem(f"{row[0]}: 'Blocks' should start with Planning or Implementation")
        if not row[3]:
            problem(f"{row[0]}: blocking decision has no owner")
        if not row[4]:
            problem(f"{row[0]}: blocking decision has no due date")
    checklist = [c == "x" for c in re.findall(r"^- \[( |x)\] ", s1, re.M)]
    readiness = fm.get("readiness")
    if checklist:
        if readiness == "Ready for implementation" and not all(checklist):
            problem("readiness is 'Ready for implementation' but the checklist isn't all ticked")
        if readiness == "Ready for planning" and not all(checklist[:2]):
            problem("readiness is 'Ready for planning' but the first two checklist items aren't ticked")
        if fm.get("status") == "Approved" and not checklist[-1]:
            problem("status is 'Approved' but the approvals item isn't ticked")
        if len(checklist) >= 3:
            if checklist[1] and any(b.startswith("Planning") for b in blocking.values()):
                problem("checklist says nothing blocks planning, but a decision does")
            if checklist[2] and any(b.startswith("Implementation") for b in blocking.values()):
                problem("checklist says nothing blocks implementation, but a decision does")

    # ---- Definitions ----------------------------------------------------
    defined = Counter()
    if fm.get("spec_id"):
        defined[fm["spec_id"]] += 1
    rules, examples, tbd_rules = [], defaultdict(list), set()
    feature_rows, blocks = {}, {}
    api_used_by = {}
    superseded = set()
    exempt_lines = set()
    current_rule, in_superseded, in_id_changes = None, False, False
    for i, line in enumerate(lines):
        n = lineno(i)
        if line.startswith("**"):
            in_superseded = line.startswith("**Superseded items")
            in_id_changes = line.startswith("**ID changes")
        if line.startswith("#"):
            in_superseded = in_id_changes = False
        if in_id_changes:
            exempt_lines.add(i)
            continue
        m = re.match(rf"^- ((?:{ALL_PREFIXES})-\d+) \(added in v", line)
        if m and in_superseded:
            defined[m.group(1)] += 1
            superseded.add(m.group(1))
            continue
        m = re.match(rf"^- \*\*((?:{RULE_PREFIXES})-\d{{3}})\*\* ", line)
        if m:
            current_rule = m.group(1)
            defined[current_rule] += 1
            rules.append((current_rule, n))
            if "TBD(" in line:
                tbd_rules.add(current_rule)
            continue
        m = re.match(rf"^\s+- ((?:{RULE_PREFIXES})-\d{{3}})\.(\d+): (.*)$", line)
        if m:
            ex = f"{m.group(1)}.{m.group(2)}"
            defined[ex] += 1
            examples[m.group(1)].append(ex)
            if m.group(1) != current_rule:
                problem(f"line {n}: example {ex} sits under {current_rule}")
            if "TBD(DEC-" in m.group(3):
                tbd_rules.add(m.group(1))
            else:
                if not re.search(r"\(Verify: (auto|manual|ops)\b", line):
                    problem(f"{ex} (line {n}) doesn't say how it's verified")
                if "→" not in line:
                    problem(f"{ex} (line {n}) should read 'situation → expected result'")
            continue
        if re.match(r"^\s+- (Examples: )?TBD\(DEC-\d{3}\)", line) and current_rule:
            tbd_rules.add(current_rule)
            continue
        m = re.match(r"^### (F-\d{3}) ", line)
        if m:
            fid = m.group(1)
            rest = "\n".join(lines[i + 1:])
            nxt = re.search(r"^#{2,3} ", rest, re.M)
            blocks[fid] = rest[: nxt.start()] if nxt else rest
            continue
        m = re.match(r"^\| (F-\d{3}) \|", line)
        if m:
            cells = [c.strip() for c in line.strip("|").split("|")]
            if len(cells) >= 6:
                defined[m.group(1)] += 1
                feature_rows[m.group(1)] = dict(zip(["Goals", "Release", "Priority", "Status"], cells[2:6]))
            continue
        m = re.match(r"^\| (API-\d{3}) \|", line)
        if m:
            defined[m.group(1)] += 1
            cells = [c.strip() for c in line.strip("|").split("|")]
            api_used_by[m.group(1)] = set(re.findall(r"F-\d{3}", cells[-1])) if len(cells) >= 3 else set()
            continue
        m = re.match(r"^\| ((?:GOAL|STD|NFR|DEC)-\d+) \|", line)
        if m:
            defined[m.group(1)] += 1
            continue
        m = re.match(r"^- (DEC-\d{3}): ", line)
        if m:
            defined[m.group(1)] += 1

    for k, v in defined.items():
        if v > 1:
            problem(f"{k} is defined {v} times")

    # ---- References -------------------------------------------------------
    mermaid_ids = set()
    for block in re.findall(r"```mermaid\n(.*?)```", body, re.S):
        mermaid_ids |= set(ID_RE.findall(block))
    plain_lines = plain.splitlines()
    mentioned = set()
    for i, line in enumerate(plain_lines):
        if i not in exempt_lines:
            mentioned |= set(ID_RE.findall(line))
    for ref in sorted(mentioned | mermaid_ids):
        if ref not in defined:
            where = " (in a diagram)" if ref in mermaid_ids and ref not in mentioned else ""
            problem(f"{ref} is mentioned{where} but never defined")
    appendix_start = next((i for i, l in enumerate(lines) if l.startswith("## Appendix")), len(lines))
    s1_start = next((i for i, l in enumerate(lines) if l.startswith("### 1. ")), 0)
    s1_end = next((i for i, l in enumerate(lines) if l.startswith("### 2. ")), 0)
    for i, line in enumerate(plain_lines):
        # Allowed: section 1 ("What changed"), the appendix, and the italic note where the item was.
        if i >= appendix_start or s1_start <= i < s1_end or re.match(r"^\*[^*]", line):
            continue
        for ref in set(ID_RE.findall(line)) & superseded:
            problem(f"line {lineno(i)}: refers to superseded {ref}")

    # ---- Rules and examples ---------------------------------------------
    for rid, n in rules:
        if not examples.get(rid) and rid not in tbd_rules and rid not in superseded:
            problem(f"{rid} (line {n}) has no examples and no TBD")

    # ---- Features ----------------------------------------------------------
    for fid, row in feature_rows.items():
        if row["Priority"] not in PRIORITIES:
            problem(f"{fid}: priority '{row['Priority']}' isn't Must, Should or Could")
        if row["Status"] not in FEATURE_STATUSES:
            problem(f"{fid}: status '{row['Status']}' isn't Proposed, Approved or Superseded")
        if row["Release"] == release and row["Status"] != "Superseded" and fid not in blocks:
            problem(f"{fid} is in {release} but has no block in Part B")
    for fid, block in blocks.items():
        if fid not in feature_rows:
            problem(f"{fid} has a block but isn't in the section 5 table")
            continue
        header = next((l for l in block.splitlines() if l.strip()), "")
        fields = {k: v.strip() for k, v in
                  re.findall(r"\*\*(Release|Priority|Status|Goals):\*\* ([^·]+?)(?= ·|$)", header)}
        for key in ("Release", "Priority", "Status", "Goals"):
            if key not in fields:
                problem(f"{fid}: block header has no {key}")
            elif fields[key] != feature_rows[fid][key]:
                problem(f"{fid}: {key} is '{feature_rows[fid][key]}' in section 5 but '{fields[key]}' in its block")
        uses = re.search(r"^\*\*Uses:\*\* (.*)$", block, re.M)
        for api in set(re.findall(r"API-\d{3}", uses.group(1) if uses else "")):
            if api in api_used_by and fid not in api_used_by[api]:
                problem(f"{fid} uses {api}, but section 11 doesn't list {fid} under 'Used by'")
    for api, users in api_used_by.items():
        for fid in users:
            uses = re.search(r"^\*\*Uses:\*\* (.*)$", blocks.get(fid, ""), re.M)
            if fid in blocks and api not in (uses.group(1) if uses else ""):
                problem(f"section 11 lists {fid} under {api}, but {fid}'s 'Uses' line doesn't name it")

    # ---- Markers and leftovers ------------------------------------------
    for dec in sorted(set(re.findall(r"TBD\((DEC-\d{3})\)", plain))):
        if dec not in blocking:
            problem(f"TBD({dec}): {dec} isn't in the blocking table in section 1")
    if "<!--" in body:
        problem("template comments (<!-- -->) are still in the spec")
    for i, line in enumerate(plain_lines):
        n = lineno(i)
        for ph in re.findall(r"\[(?!x\]|X\]| \])[^\]\n]+\](?!\()", line):
            problem(f"line {n}: placeholder {ph} is left")
        if re.search(r"\bTODO\b", line):
            problem(f"line {n}: 'TODO' is left")
        if not line.startswith("- [") and re.search(r"\bTBD\b(?!\(DEC-\d{3}\))", line):
            problem(f"line {n}: TBD must name its decision, as TBD(DEC-###)")
        if re.search(r"\bN/A(\s*$|\s*\||\.|:\s*$|:\s*\|)", line):
            problem(f"line {n}: N/A needs a reason ('N/A: reason')")

    # ---- Length limits ---------------------------------------------------
    s2 = re.sub(r"<!--.*?-->", "", section(body, "### 2. ") or "", flags=re.S).strip()
    if len([s for s in re.split(r"(?<=[.!?])\s+", s2) if s]) > 5:
        problem("summary (section 2) is over 5 sentences")
    for fid, block in blocks.items():
        why = re.search(r"\*\*What and why:\*\* (.+?)(\n\s*\n|\Z)", block, re.S)
        if not why:
            problem(f"{fid}: 'What and why' is missing")
        elif len([s for s in re.split(r"(?<=[.!?])\s+", " ".join(why.group(1).split())) if s]) > 2:
            problem(f"{fid}: 'What and why' is over 2 sentences")
        flow = labelled_part(block, "Flow")
        steps = re.findall(r"^\d+\. ", blank_code(flow), re.M)
        if not steps:
            problem(f"{fid}: flow has no numbered steps")
        elif len(steps) > 7:
            problem(f"{fid}: flow has {len(steps)} steps (limit 7)")
        n_rules = len(re.findall(r"^- \*\*REQ-\d{3}\*\*", block, re.M))
        if n_rules > 8:
            problem(f"{fid}: {n_rules} rules (limit 8); consider splitting the feature")
        for label in ("Exceptions to standard behaviors", "Uses", "Open"):
            if f"**{label}:**" not in block:
                problem(f"{fid}: '{label}' line is missing")

    # ---- Report ------------------------------------------------------------
    print(path)
    print(f"  release {release or '?'} · {len(blocks)} feature blocks · {len(rules)} rules · "
          f"{sum(len(v) for v in examples.values())} examples · blocking decisions: "
          f"{', '.join(sorted(blocking)) or 'none'}")
    if problems:
        print(f"  {len(problems)} problem(s):")
        for p in problems:
            print(f"   - {p}")
        return 1
    print("  No problems found.")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    sys.exit(main(sys.argv[1]))
