import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderResumeView } from "./renderResumeView.ts";

const SAMPLE = [
  "# Jane Doe",
  "",
  "Staff Engineer",
  "",
  "jane@example.com · (555) 010-2000 · Springfield",
  "linkedin.com/in/jane · github.com/jane",
  "",
  "Updated May 2026",
  "",
  "## Summary",
  "",
  "First paragraph with **bold** and `code`.",
  "",
  "Second paragraph.",
  "",
  "## Skills",
  "",
  "- **Frontend:** React, TypeScript",
  "- **Backend:** Node.js",
  "",
  "## Experience",
  "",
  "### Engineer · Acme & Co",
  "Remote · 2020 – Present",
  "- Built the thing.",
  "- Shipped the other thing with `Rust`.",
  "",
  "## Education",
  "",
  "Diploma in Testing",
  "Springfield · 2005 – 2007",
].join("\n");

describe("renderResumeView", () => {
  it("renders the header with eyebrow, name, role, and updated line", () => {
    const html = renderResumeView(SAMPLE, "~/about/resume.md");

    expect(html).toContain('<div class="view-eyebrow">~/about/resume.md</div>');
    expect(html).toContain('<h1 class="resume-view__name">Jane Doe</h1>');
    expect(html).toContain('<div class="resume-view__role">Staff Engineer</div>');
    expect(html).toContain('<div class="resume-view__updated">Updated May 2026</div>');
  });

  it("renders share-by-email and download-PDF actions on the eyebrow row", () => {
    const html = renderResumeView(SAMPLE, "~/about/resume.md", "https://vespaiach.com/about/resume.html");

    expect(html).toContain('<div class="resume-view__eyebrow-row">');
    expect(html).toContain(
      'href="mailto:?subject=Jane%20Doe&amp;body=https%3A%2F%2Fvespaiach.com%2Fabout%2Fresume.html"',
    );
    expect(html).toContain('aria-label="Share by email"');
    expect(html).toContain('<a class="resume-view__action" href="/resume.pdf" download');
    expect(html).toContain('aria-label="Download as PDF"');
  });

  it("uses the frontmatter title for the share-by-email subject", () => {
    const html = renderResumeView(
      "---\ntitle: My Resume\n---\n# Jane Doe\n\nEngineer\n",
      "~/about/resume.md",
      "https://vespaiach.com/about/resume.html",
    );

    expect(html).toContain("subject=My%20Resume&amp;");
  });

  it("omits the updated line when the resume has none", () => {
    const html = renderResumeView("# Jane Doe\n\nEngineer\n\n## Summary\n\nHi.\n", "~/about/resume.md");

    expect(html).not.toContain("resume-view__updated");
  });

  it("links emails, phones, and bare domains in the contact rows and separates items with a dot", () => {
    const html = renderResumeView(SAMPLE, "~/about/resume.md");

    expect(html).toContain('href="mailto:jane@example.com"');
    expect(html).toContain('href="tel:5550102000"');
    expect(html).toContain('href="https://linkedin.com/in/jane"');
    expect(html).toContain('href="https://github.com/jane"');
    expect(html).toContain('<span class="resume-view__contact-text">Springfield</span>');
    expect(html.match(/resume-view__contact-row/g)).toHaveLength(2);
    expect(html.match(/resume-view__contact-separator/g)).toHaveLength(3);
  });

  it("renders every section under a lowercase label", () => {
    const html = renderResumeView(SAMPLE, "~/about/resume.md");

    for (const label of ["summary", "skills", "experience", "education"]) {
      expect(html).toContain(`<h2 class="resume-view__section-label">${label}</h2>`);
    }
  });

  it("renders summary paragraphs with inline formatting", () => {
    const html = renderResumeView(SAMPLE, "~/about/resume.md");

    expect(html).toContain(
      '<p class="resume-view__summary-text">First paragraph with <strong>bold</strong> and <code>code</code>.</p>',
    );
    expect(html).toContain('<p class="resume-view__summary-text">Second paragraph.</p>');
  });

  it("renders skills as label and value rows", () => {
    const html = renderResumeView(SAMPLE, "~/about/resume.md");

    expect(html).toContain('<span class="resume-view__skill-label">Frontend</span>');
    expect(html).toContain('<span class="resume-view__skill-value">React, TypeScript</span>');
    expect(html).toContain('<span class="resume-view__skill-label">Backend</span>');
  });

  it("renders experience as roles with title, company, meta, and bullets", () => {
    const html = renderResumeView(SAMPLE, "~/about/resume.md");

    expect(html).toContain('<h3 class="resume-view__role-title">Engineer</h3>');
    expect(html).toContain('<span class="resume-view__role-company">Acme &amp; Co</span>');
    expect(html).toContain('<span class="resume-view__role-meta">Remote · 2020 – Present</span>');
    expect(html).toContain('<p class="resume-view__bullet-text">Built the thing.</p>');
    expect(html).toContain(
      '<p class="resume-view__bullet-text">Shipped the other thing with <code>Rust</code>.</p>',
    );
  });

  it("renders other sections as notes with a plain lead line", () => {
    const html = renderResumeView(SAMPLE, "~/about/resume.md");

    expect(html).toContain('<div class="resume-view__note resume-view__note--lead">Diploma in Testing</div>');
    expect(html).toContain('<div class="resume-view__note">Springfield · 2005 – 2007</div>');
  });

  it("falls back to notes when a skills or experience section has no parsable entries", () => {
    const html = renderResumeView(
      "# A\n\nRole\n\n## Skills\n\nJust prose.\n\n## Experience\n\nNothing yet.\n",
      "~/x",
    );

    expect(html).not.toContain("resume-view__skills");
    expect(html).not.toContain("resume-view__roles");
    expect(html).toContain('<div class="resume-view__note resume-view__note--lead">Just prose.</div>');
    expect(html).toContain('<div class="resume-view__note resume-view__note--lead">Nothing yet.</div>');
  });

  it("ignores frontmatter when parsing the resume", () => {
    const html = renderResumeView(
      "---\ngithub: https://example.com/r.md\n---\n# Jane Doe\n\nEngineer\n",
      "~/x",
    );

    expect(html).toContain('<h1 class="resume-view__name">Jane Doe</h1>');
    expect(html).toContain('<div class="resume-view__role">Engineer</div>');
  });

  it("ends with a source footer linking to the github frontmatter field", () => {
    const html = renderResumeView(
      "---\ngithub: https://github.com/x/y/blob/main/resume.md\n---\n# Jane Doe\n\nEngineer\n\n## Summary\n\nHi.\n",
      "~/x",
    );

    expect(html).toContain(
      '<div class="content-view__source">source: <a href="https://github.com/x/y/blob/main/resume.md" target="_blank" rel="noreferrer">https://github.com/x/y/blob/main/resume.md</a></div>',
    );
    expect(html.endsWith("</div></div></article>")).toBe(true);
    expect(html.lastIndexOf("content-view__footer")).toBeGreaterThan(html.lastIndexOf("</section>"));
  });

  it("omits the source footer when the resume has no github field", () => {
    const html = renderResumeView("# Jane Doe\n\nEngineer\n\n## Summary\n\nHi.\n", "~/x");

    expect(html).not.toContain("source:");
    expect(html).not.toContain("content-view__footer");
  });

  it("escapes html in resume content", () => {
    const html = renderResumeView(
      "# <b>Name</b>\n\nRole\n\n## Summary\n\n<script>alert(1)</script>\n",
      "~/x",
    );

    expect(html).toContain("&lt;b&gt;Name&lt;/b&gt;");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>");
  });

  it("renders the real content/about/resume.md with all its sections and roles", () => {
    const raw = readFileSync("content/about/resume.md", "utf-8");
    const html = renderResumeView(raw, "~/about/resume.md");

    expect(html).toContain('<h1 class="resume-view__name">Trinh Nguyen</h1>');
    expect(html).toContain('<div class="resume-view__role">Full-Stack Software Engineer</div>');
    expect(html.match(/resume-view__section-label/g)).toHaveLength(5);
    expect(html.match(/resume-view__skill-row/g)).toHaveLength(5);
    expect(html.match(/resume-view__role-entry/g)).toHaveLength(4);
    expect(html).toContain(
      'source: <a href="https://github.com/vespaiach/personal_website/blob/main/content/about/resume.md"',
    );
  });
});