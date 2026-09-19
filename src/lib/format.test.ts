import { describe, expect, it } from "vitest";
import { lsDate, readTime } from "./format.ts";

describe("readTime", () => {
  it("estimates minutes from byte size", () => {
    expect(readTime(10214)).toBe("8 min");
  });

  it("never returns less than 1 minute", () => {
    expect(readTime(10)).toBe("1 min");
  });
});

describe("lsDate", () => {
  it("formats an ISO date as 'Mon D YYYY'", () => {
    expect(lsDate("2025-03-23T00:00:00.000Z")).toBe("Mar 23  2025");
  });

  it("does not shift the day for a non-UTC offset at midnight", () => {
    expect(lsDate("2022-01-26T00:00:00.000-0500")).toBe("Jan 26  2022");
  });
});