import { describe, expect, it } from "vitest";

import { formatCurrency, generateTimeSlots, getStatusLabel } from "./utils";

describe("utils", () => {
  it("generates time slots in the expected interval", () => {
    expect(generateTimeSlots("09:00", "10:00", 20)).toEqual([
      "09:00",
      "09:20",
      "09:40",
    ]);
  });

  it("formats currency in pt-PT locale", () => {
    expect(formatCurrency(15)).toContain("15");
    expect(formatCurrency(15)).toContain("€");
  });

  it("returns localized status labels", () => {
    expect(getStatusLabel("CONFIRMED")).toBe("Confirmado");
    expect(getStatusLabel("UNKNOWN")).toBe("UNKNOWN");
  });
});
