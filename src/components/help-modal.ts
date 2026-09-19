import Alpine from "alpinejs";
import { commandClasses } from "../commands/index.ts";

export function registerHelpModal() {
  Alpine.data("helpModal", () => ({
    commands: Object.values(commandClasses).map(({ syntax, description }) => ({
      syntax,
      description,
    })),
  }));
}