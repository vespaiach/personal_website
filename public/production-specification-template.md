---
spec_id: "SPEC-[###]"
product: "[Product name]"
version: "0.1"
status: Draft
release: "[R1]"
readiness: Not ready
updated: "[YYYY-MM-DD]"
owners:
  decision: "[Name, role]"
  product: "[Name, role]"
  technical: "[Name, role]"
approvers: ["[Name]", "[Name]"]
links:
  design: "[URL, or N/A]"
  architecture_baseline: "[URL, or N/A]"
  repo_guidance: "[Path such as AGENTS.md, or N/A]"
  api_schema: "[Path, or N/A]"
---

<!-- Product spec template. The rules for filling it in are in Part 2 of product-spec-agent-loop.md. Remove every comment and [placeholder] in the finished spec. -->

# [Product name]: Product Specification

**How to read this spec**

- **IDs:** `F` feature, `REQ` feature rule, `STD` standard behavior, `DATA`, `SEC`, `NFR`, `OPS` and `API` system-wide items, `DEC` decision, `GOAL` goal. `REQ-007.2` is the second example of rule `REQ-007`.
- **Markers:** `TBD(DEC-###)` means it waits on that decision. `N/A:` means it doesn't apply, followed by the reason.
- **Verify:** `auto` is an automated test, `manual` is a person checking, `ops` is checked on the running system.
- **Defaults:** every feature follows the standard behaviors in section 9 unless its block lists an exception.

---

## Part A: Overview

### 1. Where things stand

<!-- Filled in last and updated on every revision. The front matter's status and readiness copy this section. -->

**Status: [Draft | Under review | Approved]. Readiness: [Not ready | Ready for planning | Ready for implementation].** [One sentence on what's needed to reach the next level.]

**Blocking decisions**

| ID | Question | Blocks | Owner | Due |
|---|---|---|---|---|
| DEC-[###] | [Question, with the options if known] | [Planning or Implementation]: [affected IDs] | [Name] | [Date] |

<!-- If nothing is blocking, replace the table with "None." -->

**Other open questions (not blocking)**

- DEC-[###]: [Question]. [Who decides it during the build, within the limits in section 14 | Only affects a later release: which feature]

**What changed in v[x.y]** (since v[x.y] on [date])

- [Added | Changed | Superseded] [ID]: [one line]

<!-- For the first version, write "First draft." instead of the list. -->

**Approvals for v[x.y]**

- [Name] ([role]): [approved on date | pending, and why]

**Readiness checklist**

- [ ] Owners, release and scope are set.
- [ ] No open decisions block planning.
- [ ] No open decisions block implementation.
- [ ] Every [release] feature still in scope is Approved.
- [ ] Nothing in [release] is marked TBD.
- [ ] Every [release] rule has at least one example and a way to verify it.
- [ ] Every Part C section is filled in or marked N/A with a reason.
- [ ] Every approver has approved this version.

<!-- Ready for planning needs the first two items ticked. Ready for implementation needs all of them. After an unticked item, say what's missing, for example *(DEC-004)*. -->

### 2. Summary

[At most 5 sentences: who has the problem, how they deal with it today, what that costs them, what we'll build, and why now.]

### 3. Goals and success metrics

| ID | Goal | Metric and target | How measured |
|---|---|---|---|
| GOAL-1 | [Outcome] | [A number and a deadline] | [Source, and how often] |

### 4. Users, roles and permissions

| Role | Who |
|---|---|
| [Role] | [How someone gets this role] |

| Action | [Role] | [Role] | [Role] |
|---|---|---|---|
| [Something a role can do or see] | [Yes, No, or a scope such as "Own team"] | […] | […] |

<!-- Include what each role can see, not only what it can do. Feature rules point to this table instead of repeating it. -->

### 5. Features at a glance

| ID | Feature | Goals | Release | Priority | Status |
|---|---|---|---|---|---|
| F-001 | [Name] | [GOAL IDs, or None] | [R1 or Later] | [Must, Should or Could] | [Proposed or Approved] |

Features planned for later get a block in Part B once they're scheduled for a release.

<!-- Explain here any feature that serves no goal. Release, Priority, Status and Goals copy each feature block's header line: change both together. -->

### 6. How it fits together

<!-- For journeys that cross features: a short numbered list or a Mermaid flowchart, where each step names the feature that owns it. If no journey crosses features, write "N/A: [reason]". -->

[Journey]

### 7. Boundaries

**Out of scope**

- [Something we won't build, even later]

**Assumptions**

- [What we believe is true, and how and by when it gets confirmed]

**Dependencies**

- [What we need from someone else, who provides it, and by when]

**Known limitations in [release]**

- [What won't work yet, and the decision or later feature that covers it]

### 8. Glossary

- **[Term]:** [Meaning. Use this word everywhere and avoid synonyms.]

---

## Part B: Features

<!-- One block per feature in the current release, Must features first. -->

### F-001 [Feature name]

**Release:** [R1] · **Priority:** [Must] · **Status:** [Proposed] · **Goals:** [GOAL-1] · **Design:** [Link, or N/A: reason]

**What and why:** [At most 2 sentences: what this lets someone do, and what it replaces or improves.]

**Flow**

1. [Someone does something.]
2. [The system responds.]

<!-- Normal path only, at most 7 steps. Rules and edge cases go below. -->

**Rules and examples**

- **REQ-001** [When / While / If / Where …, the system shall …]
  - REQ-001.1: [Normal situation with real values] → [expected result]. (Verify: auto)
  - REQ-001.2: [Edge or failure situation] → [expected result]. (Verify: auto)

<!-- At most 8 rules. A rule used by two or more features belongs in Part C.
A rule waiting on a decision:  - **REQ-00X** When …, the system shall TBD(DEC-###).
                                 - Examples: TBD(DEC-###)
Where a rule was superseded, leave one line:  *REQ-00X was superseded in v[x.y] (see Appendix B).* -->

**Exceptions to standard behaviors:** [None, or which STD works differently here and how]
**Uses:** [Entities · API IDs · DATA, SEC or NFR IDs]
**Open:** [None, or TBD(DEC-###) and what's waiting]

---

## Part C: System

### 9. Standard behaviors

Every feature follows these unless its block lists an exception.

| ID | Situation | What happens |
|---|---|---|
| STD-1 | Not signed in | [What the user sees, and what the API returns] |
| STD-2 | Not allowed | [Message, API response, and whether it reveals that the item exists] |
| STD-3 | Invalid input | [Where errors show, whether input is kept, and the API response] |
| STD-4 | Item not found | [Message and API response] |
| STD-5 | Same action sent twice | [How duplicates are prevented] |
| STD-6 | Someone else changed it first | [What happens to the save, and the API response] |
| STD-7 | A service we depend on fails | [Retries, message, logging, and what happens to side effects] |
| STD-8 | Every screen | [Loading, empty and error states, plus the accessibility and device targets in section 13] |
| STD-9 | Every change | [What gets recorded, and for how long] |

Verify: [How the standard behaviors are tested]

<!-- Mark rows that can't happen as N/A with a reason (for example "N/A: no user interface"), and add any the product needs. -->

### 10. Data model and lifecycle

| Entity | What it holds | Notes |
|---|---|---|
| [Entity] | [Main fields] | [Where it comes from, and key constraints] |

<!-- Optional: a Mermaid stateDiagram-v2 for anything with a lifecycle. -->

**Rules and examples**

- **DATA-001** [A rule about data that several features share: calculations, retention and deletion, dates and time zones, what happens when source data changes, imports]
  - DATA-001.1: [Situation] → [result]. (Verify: auto)

### 11. Interfaces and integrations

**[Product name] API**

[Who calls it, where the full schemas live, and how its errors follow the standard behaviors.]

| ID | Call | Used by |
|---|---|---|
| API-001 | [`METHOD /path`, or an event name] | [F-###] |

**Versioning:** [The rules, or N/A: reason]

**Outside systems**

| System | Used for | If it fails | Owner |
|---|---|---|---|
| [System] | [Purpose] | [What happens, and which rule or alert covers it] | [Team] |

### 12. Security and privacy

<!-- Cover sign-in, permission checks, sensitive data, admin rights, encryption, and abuse or rate limits. Mark what doesn't apply as N/A with a reason. -->

- **SEC-001** [Rule]
  - SEC-001.1: [Situation] → [result]. (Verify: auto)

**Threats**

| Threat | Handled by |
|---|---|
| [What could go wrong] | [IDs of the rules that prevent it] |

### 13. Quality targets

| ID | Area | Target | How measured |
|---|---|---|---|
| NFR-001 | [Speed, availability, accessibility, devices, recovery or cost] | [A number] | [Tool or method, and when] |

**Language:** [Languages, and any date or time zone rules]

### 14. Architecture and constraints

- **Stack:** [Languages, frameworks, database and hosting, or a link to the architecture baseline]
- **Build, test and lint commands:** [Where they live, such as AGENTS.md. Don't copy them here.]
- **Boundaries:** [Which part owns what, and coupling that isn't allowed]
- **Sources of truth:** [Which system owns which data]
- **Environments:** [Local, staging and production, and how they differ]
- **Configuration:** [What's configurable, where it lives, and who changes it]
- **Limits for delegated decisions:** [DEC-### (topic): the limits the person deciding must stay within. Or None.]

### 15. Operations and release

**Monitoring**

- **OPS-001** [An alert or operational rule]
  - OPS-001.1: [Situation] → [result]. (Verify: ops)
- [Logs: format, and what they must never contain]
- [Dashboard: what it shows]

**Release plan**

1. [Step, including data migration and who signs off]

**Rollback:** [When to roll back, how, and who decides]

**If [product name] is down:** [What people do instead]

**After launch:** [What to watch, and for how long]

---

## Appendix

### A. Decision history

Resolved decisions and the reasons behind them, so nobody undoes them by accident. Open decisions are in section 1.

| ID | Decision | Why | Decided |
|---|---|---|---|
| DEC-[###] | [What was decided] | [The reason] | [Who, and the date] |

### B. Revision history

| Version | Date | Author | Summary | Approval |
|---|---|---|---|---|
| 0.1 | [Date] | [Name] | First draft | [None, or who and when] |

**Superseded items**

- [ID] (added in v[x.y], superseded in v[x.y] by [DEC-### or reason]): "[Original text]"

<!-- If nothing has been superseded yet, write "None." -->

<!-- Only for a spec converted from another format, add:

**ID changes**

- [Old ID] → [New ID or place]

-->
