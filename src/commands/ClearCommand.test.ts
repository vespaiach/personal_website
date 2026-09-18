import { describe, expect, it } from "vitest";
import { ClearCommand } from "./ClearCommand.ts";

describe("ClearCommand", () => {
  const clear = ClearCommand.init();

  it("rejects an arg", () => {
    expect(clear.validate("now")).toEqual({ valid: false, error: "Usage: clear" });
  });

  it("accepts no arg", () => {
    expect(clear.validate(undefined)).toEqual({ valid: true });
  });

  it("always returns a clear result", async () => {
    const context = { cwd: "/posts", section: "posts" as const };
    expect(await ClearCommand.init(undefined, context).execute()).toEqual({ kind: "clear" });
    expect(await ClearCommand.init("ignored", context).execute()).toEqual({ kind: "clear" });
  });
});