import Alpine from "alpinejs";
import { submitToHeybackend } from "../lib/heybackend.ts";

const NAME_MAX = 127;
const EMAIL_MAX = 255;
const MESSAGE_MAX = 2047;
const COOLDOWN_MS = 5 * 60_000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIELDS = ["name", "email", "message"] as const;

type Field = (typeof FIELDS)[number];

interface FieldRefs {
  $refs: Record<Field, HTMLElement>;
}

function formatCount(count: number): string {
  return count.toLocaleString("en-US");
}

function plural(count: number, noun: string): string {
  return `${formatCount(count)} ${noun}${count === 1 ? "" : "s"}`;
}

function fieldError(label: string, value: string, max: number, attempted: boolean): string {
  if (value.length > max) return `${label} must be under ${formatCount(max + 1)} characters.`;
  if (attempted && !value.trim()) return `${label} is required.`;
  return "";
}

export function registerContactForm() {
  Alpine.data("contactForm", () => ({
    fields: { name: "", email: "", message: "", website: "" },
    attempted: false,
    status: "idle" as "idle" | "sending" | "sent" | "error",
    sentTo: { name: "", email: "", message: "" },
    openedAt: Date.now(),

    get blocked(): boolean {
      const { sentAt } = Alpine.store("contact");
      if (this.status === "sent" || sentAt === null) return false;
      return sentAt >= this.openedAt || this.openedAt - sentAt < COOLDOWN_MS;
    },

    get errors(): Record<Field, string> {
      const { name, email, message } = this.fields;
      const emailError = fieldError("Email", email, EMAIL_MAX, this.attempted);
      const emailInvalid = this.attempted && !EMAIL_PATTERN.test(email.trim());
      return {
        name: fieldError("Name", name, NAME_MAX, this.attempted),
        email: emailError || (emailInvalid ? "Enter a valid email address." : ""),
        message: fieldError("Message", message, MESSAGE_MAX, this.attempted),
      };
    },

    get nameCount(): string {
      return `${formatCount(this.fields.name.length)} / ${formatCount(NAME_MAX)}`;
    },

    get messageCount(): string {
      return `${formatCount(this.fields.message.length)} / ${formatCount(MESSAGE_MAX)}`;
    },

    get receiptMessage(): string {
      const words = this.sentTo.message.split(/\s+/).filter(Boolean).length;
      return `${plural(words, "word")}, ${plural(this.sentTo.message.length, "character")}`;
    },

    async submit() {
      const store = Alpine.store("contact");
      if (store.sending || this.blocked) return;

      this.attempted = true;
      const invalid = FIELDS.find((field) => this.errors[field]);
      if (invalid) {
        (this as unknown as FieldRefs).$refs[invalid].focus();
        return;
      }

      const sentTo = {
        name: this.fields.name.trim(),
        email: this.fields.email.trim(),
        message: this.fields.message.trim(),
      };

      if (!this.fields.website) {
        this.status = "sending";
        store.sending = true;
        try {
          await submitToHeybackend({ type: "contact", ...sentTo });
        } catch {
          this.status = "error";
          return;
        } finally {
          store.sending = false;
        }
      }

      this.sentTo = sentTo;
      this.status = "sent";
      store.markSent();
    },
  }));
}