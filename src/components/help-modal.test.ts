import { beforeEach, describe, expect, it, vi } from "vitest";

let factory: () => { commands: Array<{ syntax: string; description: string }> };

vi.mock("alpinejs", () => ({
  default: {
    data(_name: string, callback: typeof factory) {
      factory = callback;
    },
    store: () => ({}),
  },
}));

const { registerHelpModal } = await import("./help-modal.ts");

describe("helpModal", () => {
  beforeEach(() => {
    registerHelpModal();
  });

  it("lists every supported command with its syntax and description", () => {
    expect(factory().commands).toEqual([
      { syntax: "cat <file_path>", description: "Print a file's contents." },
      { syntax: "cd [directory_path]", description: "Change the current directory." },
      { syntax: "clear", description: "Clear the terminal output log." },
      { syntax: "help", description: "List every available command." },
      { syntax: "ls [file_path]", description: "List a virtual directory's contents." },
      { syntax: "tree [directory_path]", description: "Show a directory and everything under it as a tree." },
    ]);
  });
});