import { beforeEach, describe, expect, it, vi } from "vitest";

const prompts = { clear: vi.fn(), add: vi.fn() };
const cwd = { update: vi.fn() };
const execute = vi.fn();
let factory: (line: { prompt: string; cwd: string }) => {
  prompt: string;
  cwd: string;
  results: CommandResult[];
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
    cwd.update.mockReset();
    execute.mockReset();
    registerCommandLine();
  });

  it("clears every prompt in the terminal when the clear command runs", async () => {
    execute.mockResolvedValue({ kind: "clear", cwd: "/posts" });
    const component = factory({ prompt: "clear", cwd: "/posts" });

    await component.execute();

    expect(prompts.clear).toHaveBeenCalledOnce();
    expect(component.results).toEqual([]);
  });

  it("re-adds the commands chained after clear as a fresh prompt", async () => {
    execute.mockResolvedValue({ kind: "clear", cwd: "/posts" });
    const component = factory({ prompt: "clear && ls && pwd", cwd: "/posts" });

    await component.execute();

    expect(execute).toHaveBeenCalledTimes(1);
    expect(prompts.clear).toHaveBeenCalledOnce();
    expect(prompts.add).toHaveBeenCalledWith("ls && pwd", "/posts");
  });

  it("carries the working directory reached before clear into the fresh prompt", async () => {
    execute
      .mockResolvedValueOnce({ kind: "cwd", cwd: "/topics" })
      .mockResolvedValueOnce({ kind: "clear", cwd: "/topics" });
    const component = factory({ prompt: "cd ~/topics && clear && ls", cwd: "/" });

    await component.execute();

    expect(prompts.add).toHaveBeenCalledWith("ls", "/topics");
  });

  it("adds no prompt when clear is the last command", async () => {
    execute.mockResolvedValue({ kind: "clear", cwd: "/" });
    const component = factory({ prompt: "clear", cwd: "/" });

    await component.execute();

    expect(prompts.add).not.toHaveBeenCalled();
  });

  it("keeps the prompts when another command runs", async () => {
    execute.mockResolvedValue({ kind: "text", text: "hello", cwd: "/" });
    const component = factory({ prompt: "pwd", cwd: "/" });

    await component.execute();

    expect(prompts.clear).not.toHaveBeenCalled();
    expect(component.results).toEqual([{ kind: "text", text: "hello", cwd: "/" }]);
  });
});