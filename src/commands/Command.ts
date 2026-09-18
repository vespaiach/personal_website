import { toAbsolutePath } from "../lib/path.ts";

export type Section = "posts" | "topics" | "about";

export interface CommandContext {
  cwd: string;
  section: Section;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export type CommandResult =
  | { kind: "html"; html: string }
  | { kind: "text"; text: string }
  | { kind: "clear" }
  | { kind: "navigate"; path: string }
  | { kind: "cwd"; cwd: string }
  | { kind: "error"; message: string };

export interface CommandDescriptor {
  readonly name: string;
  readonly syntax: string;
  readonly description: string;
}

type ArgRule = "required" | "optional" | "none";

export abstract class Command implements CommandDescriptor {
  abstract readonly name: string;
  abstract readonly syntax: string;
  abstract readonly description: string;
  protected abstract readonly argRule: ArgRule;
  protected readonly initialArg: string | undefined;
  protected readonly context: CommandContext | undefined;

  protected constructor(initialArg?: string, context?: CommandContext) {
    this.initialArg = initialArg;
    this.context = context;
  }

  validate(arg: string | undefined): ValidationResult {
    const trimmed = (arg ?? this.initialArg)?.trim();
    if (this.argRule === "required" && !trimmed) {
      return { valid: false, error: `Usage: ${this.syntax}` };
    }
    if (this.argRule === "none" && trimmed) {
      return { valid: false, error: `Usage: ${this.syntax}` };
    }
    return { valid: true };
  }

  protected resolvePath(path: string, cwd: string): string {
    return toAbsolutePath(path, cwd) ?? "";
  }

  abstract execute(): Promise<CommandResult>;
}