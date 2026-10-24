import Alpine from "alpinejs";
import { toAbsolutePath } from "../lib/path.ts";

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

  protected get defaultPath(): string {
    return this.cwd;
  }

  resolvePath(): ResolvedPathResult {
    const path =
      this.rawCommand
        .split(" ")
        .slice(1)
        .find((arg) => !arg.startsWith("-")) ?? "";
    let absolutePath = this.defaultPath;

    if (this.argRule === "required" && !path) {
      return { valid: false, error: `Usage: ${(this.constructor as typeof Command).syntax}` };
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

  protected async fetchView(): Promise<CommandResult> {
    const result = this.resolvePath();
    if (!result.valid) return { kind: "error", message: `${this.name}: ${result.error}`, cwd: this.cwd };

    try {
      const response = await fetch(result.resourcePath);
      if (!response.ok) {
        return { kind: "error", message: `${this.name}: failed to execute command`, cwd: this.cwd };
      }
      return { kind: "html", html: await response.text(), cwd: this.cwd };
    } catch {
      return { kind: "error", message: `${this.name}: failed to execute command`, cwd: this.cwd };
    }
  }

  abstract execute(): Promise<CommandResult>;
}