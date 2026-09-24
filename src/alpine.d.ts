interface Prompts {
  values: Array<{ prompt: string; cwd: string }>;
  cleared: boolean;
  add(prompt: string, cwd: string): void;
  clear(): void;
}

interface Cwd {
  value: string;
  update(value: string): void;
}

interface CommandObject {
  command: string;
  arg?: string;
}

type PathResult = 
  | { valid: true; absolutePath: string; }
  | { valid: false; error: string; };

type ResolvedPathResult = 
  | { valid: true; absolutePath: string; resourcePath: string; }
  | { valid: false; error: string; };

interface Manifest {
  values: Record<string, string>;
  get(path: string): { existing: true, value: string } | { existing: false };
}

type CommandResult =
  | { kind: "html"; html: string; cwd: string }
  | { kind: "text"; text: string; cwd: string }
  | { kind: "clear"; cwd: string }
  | { kind: "cwd"; cwd: string; }
  | { kind: "error"; message: string; cwd: string };

interface Alpine {
  data(name: string, callback: unknown): void;
  nextTick(): Promise<void>;
  store(name: "prompts", value: Prompts): void;
  store(name: "prompts"): Prompts;
  store(name: "cwd", value: Cwd): void;
  store(name: "cwd"): Cwd;
  store(name: "manifest", value: Manifest): void;
  store(name: "manifest"): Manifest;
  store(name: string, value: unknown): void;
  start(): void;
}

interface Window {
  Alpine: Alpine;
}

declare module "alpinejs" {
  const Alpine: Alpine;
  export default Alpine;

  interface Stores {
    prompts: Prompts;
    cwd: Cwd;
    manifest: Manifest;
  }
}