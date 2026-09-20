import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const prompts = { clear: vi.fn(), add: vi.fn(), values: [] as unknown[] };
const cwd = { update: vi.fn() };
const execute = vi.fn();
let factory: (
  line: { prompt: string; cwd: string },
  index: number,
) => {
  prompt: string;
  cwd: string;
  results: CommandResult[];
  typed: string;
  typing: boolean;
  type(): Promise<void>;
  execute(): Promise<void>;
};

vi.mock("alpinejs", () => ({
  default: {
    nextTick: () => Promise.resolve(),
    data(_name: string, callback: typeof factory) {
      factory = callback;
    },
    store(name: string) {
      return name === "prompts" ? prompts : cwd;
    },
  },
}));

vi.mock("../commands/index.ts", () => ({ execute }));

const { registerCommandLine } = await import("./command-line.ts");

describe("commandLine", () => {
  beforeEach(() => {
    prompts.clear.mockReset();
    prompts.add.mockReset();
    prompts.values = [{}];
    cwd.update.mockReset();
    execute.mockReset();
    registerCommandLine();
  });

  it("clears every prompt in the terminal when the clear command runs", async () => {
    execute.mockResolvedValue({ kind: "clear", cwd: "/posts" });
    const component = factory({ prompt: "clear", cwd: "/posts" }, 0);

    await component.execute();

    expect(prompts.clear).toHaveBeenCalledOnce();
    expect(component.results).toEqual([]);
  });

  it("re-adds the commands chained after clear as a fresh prompt", async () => {
    execute.mockResolvedValue({ kind: "clear", cwd: "/posts" });
    const component = factory({ prompt: "clear && ls && pwd", cwd: "/posts" }, 0);

    await component.execute();

    expect(execute).toHaveBeenCalledTimes(1);
    expect(prompts.clear).toHaveBeenCalledOnce();
    expect(prompts.add).toHaveBeenCalledWith("ls && pwd", "/posts");
  });

  it("carries the working directory reached before clear into the fresh prompt", async () => {
    execute
      .mockResolvedValueOnce({ kind: "cwd", cwd: "/topics" })
      .mockResolvedValueOnce({ kind: "clear", cwd: "/topics" });
    const component = factory({ prompt: "cd ~/topics && clear && ls", cwd: "/" }, 0);

    await component.execute();

    expect(prompts.add).toHaveBeenCalledWith("ls", "/topics");
  });

  it("adds no prompt when clear is the last command", async () => {
    execute.mockResolvedValue({ kind: "clear", cwd: "/" });
    const component = factory({ prompt: "clear", cwd: "/" }, 0);

    await component.execute();

    expect(prompts.add).not.toHaveBeenCalled();
  });

  it("keeps the prompts when another command runs", async () => {
    execute.mockResolvedValue({ kind: "text", text: "hello", cwd: "/" });
    const component = factory({ prompt: "pwd", cwd: "/" }, 0);

    await component.execute();

    expect(prompts.clear).not.toHaveBeenCalled();
    expect(component.results).toEqual([{ kind: "text", text: "hello", cwd: "/" }]);
  });

  describe("typing", () => {
    const stubReducedMotion = (matches: boolean) => vi.stubGlobal("matchMedia", () => ({ matches }));

    beforeEach(() => {
      vi.useFakeTimers();
      stubReducedMotion(false);
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.unstubAllGlobals();
    });

    it("types a short command one character per tick", async () => {
      const component = factory({ prompt: "ls", cwd: "/" }, 0);

      const typing = component.type();
      expect(component.typing).toBe(true);
      expect(component.typed).toBe("");

      await vi.advanceTimersByTimeAsync(16);
      expect(component.typed).toBe("l");
      expect(component.typing).toBe(true);

      await vi.advanceTimersByTimeAsync(16);
      await typing;
      expect(component.typed).toBe("ls");
      expect(component.typing).toBe(false);
    });

    it("types a long command in at most 34 ticks", async () => {
      const prompt = "cat ~/posts/setup-staging-site-wordpress-without-builtin-staging.md";
      const component = factory({ prompt, cwd: "/" }, 0);

      const typing = component.type();
      await vi.advanceTimersByTimeAsync(16 * 34);
      await typing;

      expect(component.typed).toBe(prompt);
      expect(component.typing).toBe(false);
    });

    it("finishes at once when a newer prompt is added", async () => {
      const component = factory({ prompt: "cd ~/posts && ls", cwd: "/" }, 0);

      const typing = component.type();
      await vi.advanceTimersByTimeAsync(16);
      expect(component.typing).toBe(true);

      prompts.values.push({});
      await vi.advanceTimersByTimeAsync(16);
      await typing;

      expect(component.typed).toBe("cd ~/posts && ls");
      expect(component.typing).toBe(false);
    });

    it("skips the animation when the user prefers reduced motion", async () => {
      stubReducedMotion(true);
      const component = factory({ prompt: "cd ~/posts && ls", cwd: "/" }, 0);

      const typing = component.type();
      await vi.advanceTimersByTimeAsync(16);
      await typing;

      expect(component.typed).toBe("cd ~/posts && ls");
      expect(component.typing).toBe(false);
    });
  });
});