import { type InlineSpan, inlineSpans, parseFrontmatter } from "../lib/markdown.ts";
import { renderSourceFooter } from "../lib/markedFragment.ts";

interface ResumeHead {
  name: string;
  role: string;
  contact: string[];
  updated: string;
}

interface ResumeSection {
  title: string;
  lines: string[];
}

interface SkillRow {
  label: string;
  value: string;
}

interface Role {
  title: string;
  company: string;
  meta: string;
  bullets: string[];
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseResume(raw: string): { head: ResumeHead; sections: ResumeSection[] } {
  const rows = raw.replace(/\r/g, "").split("\n");
  const firstSection = rows.findIndex((row) => /^##\s+/.test(row.trim()));
  const headRows = (firstSection < 0 ? rows : rows.slice(0, firstSection))
    .map((row) => row.trim())
    .filter(Boolean);

  const nameMatch = headRows[0]?.match(/^#\s+(.*)$/);
  const [role = "", ...details] = nameMatch ? headRows.slice(1) : headRows;

  const sections: ResumeSection[] = [];
  for (const row of firstSection < 0 ? [] : rows.slice(firstSection)) {
    const title = row.trim().match(/^##\s+(.*)$/);
    if (title) sections.push({ title: title[1].trim(), lines: [] });
    else sections.at(-1)?.lines.push(row);
  }

  return {
    head: {
      name: nameMatch ? nameMatch[1].trim() : "",
      role,
      contact: details.filter((row) => !/^updated\b/i.test(row)),
      updated: details.find((row) => /^updated\b/i.test(row)) ?? "",
    },
    sections,
  };
}

function contactHref(value: string): string | null {
  if (value.indexOf("@") > 0 && /\.[a-z]{2,}$/i.test(value)) return `mailto:${value}`;
  if (/^[+(]?\d[\d()\s.-]{6,}$/.test(value)) return `tel:${value.replace(/[^\d+]/g, "")}`;
  if (/^(https?:\/\/|www\.)/i.test(value) || /^[a-z0-9-]+(\.[a-z0-9-]+)+\//i.test(value)) {
    return /^https?:/i.test(value) ? value : `https://${value}`;
  }
  return null;
}

function renderContactItem(value: string, isFirst: boolean): string {
  const href = contactHref(value);
  const content = href
    ? `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${escapeHtml(value)}</a>`
    : `<span class="resume-view__contact-text">${escapeHtml(value)}</span>`;
  const separator = isFirst ? "" : '<span class="resume-view__contact-separator">·</span>';
  return `<span class="resume-view__contact-item">${separator}${content}</span>`;
}

function renderContactRow(row: string): string {
  const items = row
    .split(/\s+·\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item, index) => renderContactItem(item, index === 0))
    .join("");
  return `<div class="resume-view__contact-row">${items}</div>`;
}

function renderHeader(head: ResumeHead, eyebrow: string): string {
  const updated = head.updated ? `<div class="resume-view__updated">${escapeHtml(head.updated)}</div>` : "";
  return (
    '<header class="resume-view__header">' +
    `<div class="view-eyebrow">${escapeHtml(eyebrow)}</div>` +
    `<h1 class="resume-view__name">${escapeHtml(head.name)}</h1>` +
    `<div class="resume-view__role">${escapeHtml(head.role)}</div>` +
    `<div class="resume-view__contact">${head.contact.map(renderContactRow).join("")}</div>` +
    `${updated}` +
    "</header>"
  );
}

function renderSpan(span: InlineSpan): string {
  const text = escapeHtml(span.text);
  switch (span.kind) {
    case "text":
      return text;
    case "code":
      return `<code>${text}</code>`;
    case "strong":
      return `<strong>${text}</strong>`;
    case "em":
      return `<em>${text}</em>`;
    case "link":
      return `<a href="${escapeHtml(span.href)}" target="_blank" rel="noreferrer">${text}</a>`;
  }
}

function renderInline(text: string): string {
  return inlineSpans(text).map(renderSpan).join("");
}

function parseSkillRows(lines: string[]): SkillRow[] {
  const rows: SkillRow[] = [];
  for (const line of lines) {
    const match = line.match(/^\s*[-*]\s+\*\*\s*(.+?)\s*:?\s*\*\*\s*:?\s*(.*)$/);
    if (match) rows.push({ label: match[1].trim(), value: match[2].trim() });
    else if (line.trim() && rows.length) rows[rows.length - 1].value += ` ${line.trim()}`;
  }
  return rows;
}

function renderSkills(rows: SkillRow[]): string {
  const rendered = rows
    .map(
      (row) =>
        '<div class="resume-view__skill-row">' +
        `<span class="resume-view__skill-label">${escapeHtml(row.label)}</span>` +
        `<span class="resume-view__skill-value">${escapeHtml(row.value)}</span>` +
        "</div>",
    )
    .join("");
  return `<div class="resume-view__skills">${rendered}</div>`;
}

function parseRoles(lines: string[]): Role[] {
  const roles: Role[] = [];
  for (const line of lines) {
    const text = line.trim();
    const heading = text.match(/^###\s+(.*)$/);
    if (heading) {
      const [title, ...company] = heading[1].split(/\s+·\s+/);
      roles.push({ title: title.trim(), company: company.join(" · ").trim(), meta: "", bullets: [] });
      continue;
    }

    const role = roles.at(-1);
    if (!text || !role) continue;

    const bullet = text.match(/^[-*]\s+(.*)$/);
    if (bullet) role.bullets.push(bullet[1].trim());
    else if (!role.meta) role.meta = text;
  }
  return roles;
}

function renderRole(role: Role): string {
  const bullets = role.bullets
    .map(
      (bullet) =>
        '<div class="resume-view__bullet">' +
        '<span class="resume-view__bullet-marker">-</span>' +
        `<p class="resume-view__bullet-text">${renderInline(bullet)}</p>` +
        "</div>",
    )
    .join("");

  return (
    '<div class="resume-view__role-entry">' +
    '<div class="resume-view__role-head">' +
    `<h3 class="resume-view__role-title">${escapeHtml(role.title)}</h3>` +
    `<span class="resume-view__role-company">${escapeHtml(role.company)}</span>` +
    '<span class="resume-view__role-spacer"></span>' +
    `<span class="resume-view__role-meta">${escapeHtml(role.meta)}</span>` +
    "</div>" +
    `<div class="resume-view__bullets">${bullets}</div>` +
    "</div>"
  );
}

function renderRoles(roles: Role[]): string {
  return `<div class="resume-view__roles">${roles.map(renderRole).join("")}</div>`;
}

function paragraphsOf(lines: string[]): string[] {
  const paragraphs: string[] = [];
  let buffer: string[] = [];
  for (const line of lines) {
    if (line.trim()) {
      buffer.push(line.trim());
    } else if (buffer.length) {
      paragraphs.push(buffer.join(" "));
      buffer = [];
    }
  }
  if (buffer.length) paragraphs.push(buffer.join(" "));
  return paragraphs;
}

function renderSummary(lines: string[]): string {
  const paragraphs = paragraphsOf(lines)
    .map((paragraph) => `<p class="resume-view__summary-text">${renderInline(paragraph)}</p>`)
    .join("");
  return `<div class="resume-view__summary">${paragraphs}</div>`;
}

function renderNotes(lines: string[]): string {
  const rows = lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) =>
      index === 0
        ? `<div class="resume-view__note resume-view__note--lead">${escapeHtml(line)}</div>`
        : `<div class="resume-view__note">${escapeHtml(line)}</div>`,
    )
    .join("");
  return `<div class="resume-view__notes">${rows}</div>`;
}

function renderSectionBody(label: string, lines: string[]): string {
  if (label === "skills") {
    const rows = parseSkillRows(lines);
    if (rows.length) return renderSkills(rows);
  }
  if (label === "experience") {
    const roles = parseRoles(lines);
    if (roles.length) return renderRoles(roles);
  }
  if (label === "summary") return renderSummary(lines);
  return renderNotes(lines);
}

function renderSection(section: ResumeSection): string {
  const label = section.title.toLowerCase();
  return (
    '<section class="resume-view__section">' +
    '<div class="resume-view__section-head">' +
    `<h2 class="resume-view__section-label">${escapeHtml(label)}</h2>` +
    '<span class="resume-view__section-rule"></span>' +
    "</div>" +
    `${renderSectionBody(label, section.lines)}` +
    "</section>"
  );
}

export function renderResumeView(raw: string, eyebrow: string): string {
  const { fm, body } = parseFrontmatter(raw);
  const { head, sections } = parseResume(body);
  return `<article class="resume-view">${renderHeader(head, eyebrow)}${sections.map(renderSection).join("")}${renderSourceFooter(fm.github ?? "")}</article>`;
}