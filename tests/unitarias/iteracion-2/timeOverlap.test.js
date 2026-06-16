import { describe, it, expect } from "vitest";

const { __testables } = await import("../../../Backend/prisma/src/controllers/activityController");
const { hasTimeOverlap } = __testables;

function t(h, m) {
  return new Date(1970, 0, 1, h, m);
}

function fmt(d) {
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

describe("PU-04: hasTimeOverlap", () => {
  beforeAll(() => {
    console.log("\n[PU-04] Detección de topes horarios ⭐");
  });

  it("horarios cruzados (10-12 vs 11-13) → conflicto", () => {
    const r = hasTimeOverlap({ newStart: t(10,0), newEnd: t(12,0), existingStart: t(11,0), existingEnd: t(13,0) });
    console.log(`  [10-12] vs [11-13] → ${r} (esperado true)`);
    expect(r).toBe(true);
  });

  it("horarios consecutivos (10-11 vs 11-12) → permitido", () => {
    const r = hasTimeOverlap({ newStart: t(10,0), newEnd: t(11,0), existingStart: t(11,0), existingEnd: t(12,0) });
    console.log(`  [10-11] vs [11-12] → ${r} (esperado false)`);
    expect(r).toBe(false);
  });

  it("horario contenido dentro de otro (10-18 vs 12-13) → conflicto", () => {
    const r = hasTimeOverlap({ newStart: t(10,0), newEnd: t(18,0), existingStart: t(12,0), existingEnd: t(13,0) });
    console.log(`  [10-18] vs [12-13] → ${r} (esperado true)`);
    expect(r).toBe(true);
  });

  it("mismo horario exacto → conflicto", () => {
    const r = hasTimeOverlap({ newStart: t(10,0), newEnd: t(12,0), existingStart: t(10,0), existingEnd: t(12,0) });
    console.log(`  [10-12] vs [10-12] → ${r} (esperado true)`);
    expect(r).toBe(true);
  });
});
