import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

interface ContactForm {
  fields: { name: string; email: string; message: string; website: string };
  status: string;
  blocked: boolean;
  errors: { name: string; email: string; message: string };
  nameCount: string;
  messageCount: string;
  receiptMessage: string;
  $refs: Record<string, { focus: () => void }>;
  submit(): Promise<void>;
}

let factory: () => ContactForm;
const contactStore = {
  sending: false,
  sentAt: null as number | null,
  markSent() {
    this.sentAt = Date.now();
  },
};

vi.mock("alpinejs", () => ({
  default: {
    data(_name: string, callback: typeof factory) {
      factory = callback;
    },
    store: () => contactStore,
  },
}));

const submitToHeybackend = vi.fn();
vi.mock("../lib/heybackend.ts", () => ({ submitToHeybackend }));

const { registerContactForm } = await import("./contact-form.ts");

function createForm(): ContactForm {
  const form = factory();
  form.$refs = { name: { focus: vi.fn() }, email: { focus: vi.fn() }, message: { focus: vi.fn() } };
  return form;
}

function fill(form: ContactForm) {
  form.fields.name = " Trinh ";
  form.fields.email = "trinh@example.com";
  form.fields.message = "Hello from a coder";
}

describe("contactForm", () => {
  beforeEach(() => {
    registerContactForm();
    contactStore.sending = false;
    contactStore.sentAt = null;
    submitToHeybackend.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("hides required errors until the first send attempt", async () => {
    const form = createForm();
    expect(form.errors).toEqual({ name: "", email: "", message: "" });

    await form.submit();

    expect(form.errors).toEqual({
      name: "Name is required.",
      email: "Email is required.",
      message: "Message is required.",
    });
    expect(form.$refs.name.focus).toHaveBeenCalled();
    expect(submitToHeybackend).not.toHaveBeenCalled();
  });

  it("shows over-length errors while typing", () => {
    const form = createForm();
    form.fields.name = "a".repeat(128);
    form.fields.email = `${"a".repeat(250)}@example.com`;
    form.fields.message = "a".repeat(2048);

    expect(form.errors).toEqual({
      name: "Name must be under 128 characters.",
      email: "Email must be under 256 characters.",
      message: "Message must be under 2,048 characters.",
    });
  });

  it("counts name and message characters against their limits", () => {
    const form = createForm();
    form.fields.name = "Trinh";
    form.fields.message = "a".repeat(1500);

    expect(form.nameCount).toBe("5 / 127");
    expect(form.messageCount).toBe("1,500 / 2,047");
  });

  it("rejects an invalid email and focuses it", async () => {
    const form = createForm();
    fill(form);
    form.fields.email = "trinh@exam";

    await form.submit();

    expect(form.errors.email).toBe("Enter a valid email address.");
    expect(form.$refs.email.focus).toHaveBeenCalled();
    expect(submitToHeybackend).not.toHaveBeenCalled();
  });

  it("sends the trimmed fields and shows a receipt", async () => {
    submitToHeybackend.mockResolvedValue(undefined);
    const form = createForm();
    fill(form);

    await form.submit();

    expect(submitToHeybackend).toHaveBeenCalledWith({
      type: "contact",
      name: "Trinh",
      email: "trinh@example.com",
      message: "Hello from a coder",
    });
    expect(form.status).toBe("sent");
    expect(form.receiptMessage).toBe("4 words, 18 characters");
    expect(contactStore.sending).toBe(false);
    expect(contactStore.sentAt).not.toBeNull();
  });

  it("keeps the fields and shows an error when sending fails", async () => {
    submitToHeybackend.mockRejectedValue(new Error("offline"));
    const form = createForm();
    fill(form);

    await form.submit();

    expect(form.status).toBe("error");
    expect(form.fields.message).toBe("Hello from a coder");
    expect(contactStore.sending).toBe(false);
    expect(contactStore.sentAt).toBeNull();
  });

  it("pretends to send when the honeypot is filled", async () => {
    const form = createForm();
    fill(form);
    form.fields.website = "spam.example";

    await form.submit();

    expect(submitToHeybackend).not.toHaveBeenCalled();
    expect(form.status).toBe("sent");
  });

  it("disables every form while one is sending", async () => {
    let resolve = () => {};
    submitToHeybackend.mockReturnValue(
      new Promise<void>((done) => {
        resolve = done;
      }),
    );
    const first = createForm();
    const second = createForm();
    fill(first);
    fill(second);

    const sending = first.submit();
    expect(first.status).toBe("sending");
    expect(contactStore.sending).toBe(true);

    await second.submit();
    expect(submitToHeybackend).toHaveBeenCalledTimes(1);

    resolve();
    await sending;
    expect(contactStore.sending).toBe(false);
  });

  it("blocks other forms after a send until five minutes pass", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-05T10:00:00Z"));
    submitToHeybackend.mockResolvedValue(undefined);
    const sender = createForm();
    const other = createForm();
    fill(sender);

    await sender.submit();

    expect(sender.blocked).toBe(false);
    expect(other.blocked).toBe(true);

    vi.setSystemTime(new Date("2026-10-05T10:04:59Z"));
    expect(createForm().blocked).toBe(true);

    vi.setSystemTime(new Date("2026-10-05T10:05:00Z"));
    expect(createForm().blocked).toBe(false);
  });
});