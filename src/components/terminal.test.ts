import { beforeEach, describe, expect, it, vi } from "vitest";

interface Terminal {
  focusPrompt(event: MouseEvent): void;
  $refs: { commandInput: { focus(): void } };
}

let factory: () => Terminal;

vi.mock("alpinejs", () => ({
  default: {
    data(_name: string, callback: typeof factory) {
      factory = callback;
    },
  },
}));

const { registerTerminal } = await import("./terminal.ts");

function clickOn(matchesInteractive: boolean) {
  return {
    target: { closest: () => (matchesInteractive ? {} : null) },
  } as unknown as MouseEvent;
}

describe("terminal focusPrompt", () => {
  const focus = vi.fn();
  let terminal: Terminal;

  beforeEach(() => {
    focus.mockReset();
    vi.stubGlobal("window", { getSelection: () => ({ isCollapsed: true }) });
    registerTerminal();
    terminal = factory();
    terminal.$refs = { commandInput: { focus } };
  });

  it("focuses the idle prompt when a non-interactive area is clicked", () => {
    terminal.focusPrompt(clickOn(false));

    expect(focus).toHaveBeenCalledOnce();
  });

  it("leaves focus alone when a link, button or other control is clicked", () => {
    terminal.focusPrompt(clickOn(true));

    expect(focus).not.toHaveBeenCalled();
  });

  it("leaves focus alone while text is selected", () => {
    vi.stubGlobal("window", { getSelection: () => ({ isCollapsed: false }) });

    terminal.focusPrompt(clickOn(false));

    expect(focus).not.toHaveBeenCalled();
  });
});