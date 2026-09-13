import Alpine from "alpinejs";

export function registerShell() {
  Alpine.data("shell", () => ({
    user: "trinh",
    host: "vespaiach",
    cwd: "~/posts",
    paletteOpen: false,
    prompts: [{ cwd: "~/posts", command: "cd ~/posts && ls" }],
  }));
}