interface Prompts {
  values: string[];
  add(prompt: string): void;
  clear(): void;
}

interface Cwd {
  value: string;
  update(value: string): void;
}

interface Alpine {
  data(name: string, callback: unknown): void;
  store(name: "prompts", value: Prompts): void;
  store(name: "cwd", value: Cwd): void;
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
  }
}