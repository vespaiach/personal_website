import { describe, expect, it } from "vitest";
import { Command, type CommandContext, type CommandResult } from "./Command.ts";

class RequiredArgCommand extends Command {
  readonly name = "req";
  readonly syntax = "req <arg>";
  readonly description = "A test command with a required arg.";
  protected readonly argRule = "required" as const;

  static init(arg?: string, context?: CommandContext): RequiredArgCommand {
    return new RequiredArgCommand(arg, context);
  }

  async execute(): Promise<CommandResult> {
    return { kind: "cwd", cwd: this.resolvePath(this.initialArg ?? "", this.context?.cwd ?? "") };
  }
}

class NoArgCommand extends Command {
  readonly name = "noop";
  readonly syntax = "noop";
  readonly description = "A test command that takes no arg.";
  protected readonly argRule = "none" as const;

  static init(arg?: string, context?: CommandContext): NoArgCommand {
    return new NoArgCommand(arg, context);
  }

  async execute(): Promise<CommandResult> {
    return { kind: "clear" };
  }
}

class OptionalArgCommand extends Command {
  readonly name = "opt";
  readonly syntax = "opt [arg]";
  readonly description = "A test command with an optional arg.";
  protected readonly argRule = "optional" as const;

  static init(arg?: string, context?: CommandContext): OptionalArgCommand {
    return new OptionalArgCommand(arg, context);
  }

  async execute(): Promise<CommandResult> {
    return { kind: "clear" };
  }
}

describe("Command.validate", () => {
  it("rejects a missing required arg", () => {
    expect(RequiredArgCommand.init().validate(undefined)).toEqual({
      valid: false,
      error: "Usage: req <arg>",
    });
  });

  it("rejects a required arg that's just whitespace", () => {
    expect(RequiredArgCommand.init().validate("   ")).toEqual({ valid: false, error: "Usage: req <arg>" });
  });

  it("accepts a present required arg", () => {
    expect(RequiredArgCommand.init().validate("value")).toEqual({ valid: true });
  });

  it("rejects an arg on a no-arg command", () => {
    expect(NoArgCommand.init().validate("value")).toEqual({ valid: false, error: "Usage: noop" });
  });

  it("accepts no arg on a no-arg command", () => {
    expect(NoArgCommand.init().validate(undefined)).toEqual({ valid: true });
  });

  it("accepts an optional arg with or without a value", () => {
    expect(OptionalArgCommand.init().validate(undefined)).toEqual({ valid: true });
    expect(OptionalArgCommand.init().validate("value")).toEqual({ valid: true });
  });
});

describe("Command.resolvePath (via a concrete subclass)", () => {
  it("resolves a relative arg against cwd", async () => {
    const result = await RequiredArgCommand.init("../posts", { cwd: "/topics", section: "topics" }).execute();
    expect(result).toEqual({ kind: "cwd", cwd: "/posts" });
  });

  it("passes an absolute arg through unchanged", async () => {
    const result = await RequiredArgCommand.init("/about", { cwd: "/topics", section: "topics" }).execute();
    expect(result).toEqual({ kind: "cwd", cwd: "/about" });
  });
});