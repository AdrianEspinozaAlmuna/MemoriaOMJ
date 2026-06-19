import { describe, it, expect } from "vitest";

const { __testables } = await import("../../../Backend/prisma/src/controllers/activityController");
const { timeStringToDate, toTimeLabel } = __testables;

describe("PU-13: Conversión y consistencia de horarios", () => {
  beforeAll(() => console.log("\n[PU-13] timeStringToDate / toTimeLabel"));

  it("timeStringToDate('15:30') → UTC 15:30", () => {
    const d = timeStringToDate("15:30");
    const h = d.getUTCHours(), m = d.getUTCMinutes();
    console.log(`  timeStringToDate("15:30") → UTC ${h}:${m}`);
    expect(h).toBe(15);
    expect(m).toBe(30);
  });

  it("toTimeLabel(Date) → 'HH:MM'", () => {
    const r = toTimeLabel(timeStringToDate("09:00"));
    console.log(`  toTimeLabel(timeStringToDate("09:00")) → "${r}"`);
    expect(r).toBe("09:00");
  });

  it("round-trip timeStringToDate + toTimeLabel", () => {
    ["09:00", "15:30", "23:59"].forEach(t => {
      const r = toTimeLabel(timeStringToDate(t));
      console.log(`  round-trip("${t}") → "${r}"`);
      expect(r).toBe(t);
    });
  });

  it("horario borde '00:00'", () => {
    const d = timeStringToDate("00:00");
    console.log(`  timeStringToDate("00:00") → UTC ${d.getUTCHours()}:${d.getUTCMinutes()}`);
    expect(d.getUTCHours()).toBe(0);
  });

  it("horario borde '23:59'", () => {
    const d = timeStringToDate("23:59");
    console.log(`  timeStringToDate("23:59") → UTC ${d.getUTCHours()}:${d.getUTCMinutes()}`);
    expect(d.getUTCHours()).toBe(23);
    expect(d.getUTCMinutes()).toBe(59);
  });
});
