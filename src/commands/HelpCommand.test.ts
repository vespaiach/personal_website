import { describe, expect, it, vi } from "vitest";

vi.stubGlobal(
  "MutationObserver",
  class {
    observe() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  },
);

vi.mock("alpinejs", () => {
  return { default: { store: vi.fn() } };
});

const { HelpCommand } = await import("./HelpCommand.ts");

describe("HelpCommand", () => {
  it("returns an html result for the current cwd", async () => {
    const result = await HelpCommand.init("help", "/posts").execute();
    expect(result.kind).toBe("html");
    expect(result.cwd).toBe("/posts");
  });

  it("lists the syntax and description of every command", async () => {
    const result = await HelpCommand.init("help", "/").execute();
    const html = (result as { kind: "html"; html: string }).html;

    expect(html).toContain(
      '<td class="cmd">cat &lt;file_path&gt;</td><td class="desc">Print a file\'s contents.</td>',
    );
    expect(html).toContain(
      '<td class="cmd">cd [directory_path]</td><td class="desc">Change the current directory.</td>',
    );
    expect(html).toContain('<td class="cmd">clear</td><td class="desc">Clear the terminal output log.</td>');
    expect(html).toContain('<td class="cmd">help</td><td class="desc">List every available command.</td>');
    expect(html).toContain(
      '<td class="cmd">ls [file_path]</td><td class="desc">List a virtual directory\'s contents.</td>',
    );
    expect(html).toContain(
      '<td class="cmd">tree [directory_path]</td><td class="desc">Show a directory and everything under it as a tree.</td>',
    );
  });

  it("escapes angle brackets in syntax", async () => {
    const result = await HelpCommand.init("help", "/").execute();
    const html = (result as { kind: "html"; html: string }).html;

    expect(html).not.toContain("<file_path>");
    expect(html).not.toContain("<directory_path>");
  });
});