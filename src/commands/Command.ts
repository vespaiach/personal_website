import Alpine from "alpinejs";
import { toAbsolutePath } from "../lib/path.ts";

export interface HasPathArgument {
  resolvePath(): PathResult;
}

type ArgRule = "required" | "optional" | "none";

export abstract class Command {
  abstract readonly name: string;
  static readonly syntax: string;
  static readonly description: string;
  protected abstract readonly argRule: ArgRule;
  protected readonly rawCommand: string;
  protected cwd: string;

  protected constructor({ rawCommand, cwd }: { rawCommand: string; cwd?: string }) {
    this.rawCommand = rawCommand;
    this.cwd = cwd ?? "/";
  }

  protected get manifestCommand(): string {
    return this.name;
  }

  resolvePath(): ResolvedPathResult {
    const path = this.rawCommand.split(" ")[1] ?? "";
    let absolutePath = this.cwd;

    if (this.argRule === "required" && !path) {
      return { valid: false, error: `Usage: ${Command.syntax}` };
    }

    if (path) {
      const result = toAbsolutePath(path, this.cwd);
      if (result.valid) absolutePath = result.absolutePath;
      else return result;
    }

    const manifest = Alpine.store("manifest");
    const manifestResult = manifest.get(`${this.manifestCommand} ${absolutePath}`);
    if (!manifestResult.existing) {
      return { valid: false, error: `Path does not exist: ${absolutePath}` };
    }

    return { valid: true, absolutePath, resourcePath: manifestResult.value };
  }

  abstract execute(): Promise<CommandResult>;
}