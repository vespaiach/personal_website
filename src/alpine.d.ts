interface Prompts {
  values: Array<{ prompt: string; cwd: string }>;
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

interface Manifest {
  paths: Record<string, string>;
}

interface Alpine {
  data(name: string, callback: unknown): void;
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