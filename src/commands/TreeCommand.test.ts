import { describe, expect, it } from "vitest";
import { TreeCommand } from "./TreeCommand.ts";

describe("TreeCommand", () => {
  const tree = TreeCommand.init();

  it("accepts no arg or an arg", () => {
    expect(tree.validate(undefined)).toEqual({ valid: true });
    expect(tree.validate("/about")).toEqual({ valid: true });
  });

  it("builds a nested tree for /about", async () => {
    const result = await TreeCommand.init("/about", { cwd: "/posts", section: "posts" }).execute();
    expect(result).toEqual({
      kind: "text",
      text: [
        "/about",
        "├── me.md",
        "├── projects",
        "│   ├── app.junecare.co.md",
        "│   └── vespaiach.com.md",
        "└── stack.json",
      ].join("\n"),
    });
  });

  it("shows just the header for a fixed root with zero descendants", async () => {
    const result = await TreeCommand.init("/topics", { cwd: "/posts", section: "posts" }).execute();
    expect(result).toEqual({ kind: "text", text: "/topics" });
  });

  it("returns an error for a file path", async () => {
    const result = await TreeCommand.init("/about/me.md", { cwd: "/posts", section: "posts" }).execute();
    expect(result).toEqual({ kind: "error", message: "tree: /about/me.md: No such directory" });
  });

  it("uses cwd when no arg is given", async () => {
    const result = await TreeCommand.init(undefined, { cwd: "/about/projects", section: "about" }).execute();
    expect(result).toEqual({
      kind: "text",
      text: ["/about/projects", "├── app.junecare.co.md", "└── vespaiach.com.md"].join("\n"),
    });
  });

  it("includes posts, topics, and about as top-level entries from the root", async () => {
    const result = await TreeCommand.init("/", { cwd: "/posts", section: "posts" }).execute();
    expect(result.kind).toBe("text");
    const text = (result as { kind: "text"; text: string }).text;
    expect(text.split("\n")[0]).toBe("/");
    expect(text).toContain("posts");
    expect(text).toContain("topics");
    expect(text).toContain("about");
  });
});