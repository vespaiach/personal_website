export interface CommandDescriptor {
  readonly name: string;
  readonly syntax: string;
  readonly description: string;
}

export abstract class Command implements CommandDescriptor {
  abstract readonly name: string;
  abstract readonly syntax: string;
  abstract readonly description: string;
  protected readonly rawCommand: string;
  protected readonly cwd: string;
  protected readonly availablePaths: Record<string, string>;

  protected constructor({ rawCommand, cwd, availablePaths }: { rawCommand: string; cwd?: string; availablePaths: Record<string, string> }) {
    this.rawCommand = rawCommand;
    this.availablePaths = availablePaths;
    this.cwd = cwd ?? "/";
  }

  abstract isValid(): boolean;
  abstract execute(): Promise<CommandResult>;
}