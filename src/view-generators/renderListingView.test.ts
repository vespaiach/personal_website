import { describe, expect, it } from "vitest";
import { renderListingView } from "./renderListingView.ts";

describe("renderListingView", () => {
  it("renders the total count and one row per entry", () => {
    const html = renderListingView("/posts", [
      {
        name: "typescript-notes.md",
        isDirectory: false,
        size: "8 min",
        date: "Mar 23 2025",
        isoDate: "2025-03-23",
      },
      {
        name: "prismjs-loader.md",
        isDirectory: false,
        size: "2 min",
        date: "Mar 29 2025",
        isoDate: "2025-03-29",
      },
    ]);

    expect(html).toContain("total 2");
    expect(html).toContain("-rw-r--r--");
    expect(html).toContain("typescript-notes.md");
    expect(html).toContain("cat /posts/typescript-notes.md");
    expect(html).toContain(
      '<time datetime="2025-03-23"><span class="ls-view__date--full">Mar 23 2025</span><span class="ls-view__date--short">Mar 23</span></time>',
    );
  });

  it("renders the short date with a zero-padded day for the mobile layout", () => {
    const html = renderListingView("/posts", [
      { name: "a.md", isDirectory: false, size: "4 min", date: "Jun  6  2025", isoDate: "2025-06-06" },
    ]);

    expect(html).toContain('<span class="ls-view__date--short">Jun 06</span>');
  });

  it("marks placeholder size and date columns so the mobile layout can hide them", () => {
    const html = renderListingView("/", [
      { name: "posts", isDirectory: true, size: "-", date: "-", isoDate: "" },
    ]);

    expect(html).toContain('class="ls-view__col ls-view__col--size ls-view__col--blank"');
    expect(html).toContain('class="ls-view__col ls-view__col--date ls-view__col--blank"');
  });

  it("does not mark real size and date columns as blank", () => {
    const html = renderListingView("/posts", [
      { name: "a.md", isDirectory: false, size: "4 min", date: "Jun  6  2025", isoDate: "2025-06-06" },
    ]);

    expect(html).not.toContain("ls-view__col--blank");
  });

  it("makes directory rows run cd into the directory followed by ls", () => {
    const html = renderListingView("/topics", [
      { name: "javascript", isDirectory: true, size: "-", date: "Jun 20  2022", isoDate: "2022-06-20" },
    ]);

    expect(html).toContain("$store.prompts.add('cd ~/topics/javascript &amp;&amp; ls', $store.cwd.value)");
  });

  it("renders symlink rows without their target and cats the resolved target when clicked", () => {
    const html = renderListingView("/topics/javascript", [
      {
        name: "discard-after-usages.md",
        isDirectory: false,
        size: "1 min",
        date: "Jan 25  2022",
        isoDate: "2022-01-25",
        linkTarget: "../../posts/discard-after-usages.md",
      },
    ]);

    expect(html).toContain("lrwxr-xr-x");
    expect(html).toContain('class="ls-link ls-link--symlink"');
    expect(html).not.toContain("-&gt;");
    expect(html).toContain("$store.prompts.add('cat /posts/discard-after-usages.md', $store.cwd.value)");
  });

  it("words the total line as posts in the topic for a topic folder", () => {
    const entry = {
      name: "discard-after-usages.md",
      isDirectory: false,
      size: "1 min",
      date: "Jan 25  2022",
      isoDate: "2022-01-25",
    };

    expect(renderListingView("/topics/javascript", [entry, entry, entry])).toContain(
      "total 3 posts in topic javascript",
    );
    expect(renderListingView("/topics/javascript", [entry])).toContain("total 1 post in topic javascript");
  });

  it("renders directory rows without a linked date when isoDate is empty", () => {
    const html = renderListingView("/", [
      { name: "posts", isDirectory: true, size: "-", date: "-", isoDate: "" },
    ]);

    expect(html).toContain("drwxr-xr-x");
    expect(html).toContain('class="ls-link ls-link--dir"');
    expect(html).not.toContain("<time");
  });

  it("escapes entry names", () => {
    const html = renderListingView("/topics", [
      { name: "<script>", isDirectory: true, size: "-", date: "-", isoDate: "" },
    ]);

    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });
});