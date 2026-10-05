import { afterEach, describe, expect, it, vi } from "vitest";
import { HEYBACKEND_ENDPOINT, submitToHeybackend } from "./heybackend.ts";

describe("submitToHeybackend", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the payload as JSON to the endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    await submitToHeybackend({ name: "Trinh" });

    expect(fetchMock).toHaveBeenCalledWith(HEYBACKEND_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Trinh" }),
    });
  });

  it("throws when the response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    await expect(submitToHeybackend({ name: "Trinh" })).rejects.toThrow("Heybackend responded with 500");
  });
});