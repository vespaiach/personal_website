import { beforeEach, describe, expect, it, vi } from "vitest";

interface Palette {
  query: string;
  init(): void;
  onInput(): void;
  moveSelection(delta: number): void;
  completeSelected(): void;
  runSelected(): void;
  $refs: { dialog: { close(): void } };
}

const prompts = { add: vi.fn(), values: [] as Array<{ prompt: string; cwd: string }> };
const cwd = { value: "/" };
let factory: () => Palette;

vi.mock("alpinejs", () => ({
  default: {
    data(_name: string, callback: typeof factory) {
      factory = callback;
    },
    store(name: string) {
      return name === "prompts" ? prompts : cwd;
    },
  },
}));

const { registerCommandPalette } = await import("./command-palette.ts");

function openPalette(): Palette {
  const palette = factory();
  palette.$refs = { dialog: { close: vi.fn() } };
  return palette;
}

function typeQuery(palette: Palette, query: string) {
  palette.query = query;
  palette.onInput();
}

describe("commandPalette", () => {
  beforeEach(() => {
    prompts.add.mockReset();
    prompts.values = [];
    cwd.value = "/";
    registerCommandPalette();
  });

  it("runs the command in the shell's current directory", () => {
    cwd.value = "/about";
    const palette = openPalette();
    typeQuery(palette, "ls");

    palette.runSelected();

    expect(prompts.add).toHaveBeenCalledWith("ls", "/about");
  });

  it("runs the typed command rather than a longer suggestion that starts with it", () => {
    prompts.values = [{ prompt: "ls -la", cwd: "/" }];
    const palette = openPalette();
    typeQuery(palette, "ls");

    palette.runSelected();

    expect(prompts.add).toHaveBeenCalledWith("ls", "/");
  });

  it("runs the suggestion the selection was moved to", () => {
    prompts.values = [{ prompt: "ls -la", cwd: "/" }];
    const palette = openPalette();
    typeQuery(palette, "ls");

    palette.moveSelection(1);
    palette.runSelected();

    expect(prompts.add).toHaveBeenCalledWith("ls -la", "/");
  });

  it("goes back to the typed command when the selection moves up past the first suggestion", () => {
    prompts.values = [{ prompt: "ls -la", cwd: "/" }];
    const palette = openPalette();
    typeQuery(palette, "ls");

    palette.moveSelection(1);
    palette.moveSelection(-1);
    palette.runSelected();

    expect(prompts.add).toHaveBeenCalledWith("ls", "/");
  });

  it("completes the first suggestion on tab before any is selected", () => {
    const palette = openPalette();
    typeQuery(palette, "tr");

    palette.completeSelected();

    expect(palette.query).toBe("tree ~");
  });

  it("runs the first suggestion when nothing is typed", () => {
    const palette = openPalette();
    palette.init();

    palette.runSelected();

    expect(prompts.add).toHaveBeenCalledWith("ls", "/");
  });
});