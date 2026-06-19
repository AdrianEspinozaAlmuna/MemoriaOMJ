import { describe, it, expect } from "vitest";

import { parseDateForChile, formatDateForChile } from "../../../Frontend/src/utils/chileDate";

const { __testables } = await import("../../../Backend/prisma/src/controllers/activityController");
const { parseLocalDateString } = __testables;

describe("PU-02: Conversión de fechas y timezone Chile", () => {
  beforeAll(() => {
    console.log("\n[PU-02] Conversión de fechas / timezone");
  });

  it("parseDateForChile('2026-05-20') sin desfase UTC", () => {
    const d = parseDateForChile("2026-05-20");
    const out = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    console.log(`  parseDateForChile("2026-05-20") → ${d} (${out})`);
    expect(d.getDate()).toBe(20);
  });

  it("cambio de mes no altera el día", () => {
    const d = parseDateForChile("2026-02-01");
    console.log(`  parseDateForChile("2026-02-01") → mes=${d.getMonth()+1}, día=${d.getDate()}`);
    expect(d.getMonth()).toBe(1);
    expect(d.getDate()).toBe(1);
  });

  it("prevención del bug UTC: mediodía evita desfase -1 día", () => {
    const d = parseDateForChile("2026-01-01");
    console.log(`  parseDateForChile("2026-01-01") → día=${d.getDate()} (esperado 1)`);
    expect(d.getDate()).toBe(1);
  });

  it("formatDateForChile devuelve string con locale es-CL", () => {
    const d = parseDateForChile("2026-05-20");
    const str = formatDateForChile(d);
    console.log(`  formatDateForChile(2026-05-20) → "${str}"`);
    expect(typeof str).toBe("string");
  });

  it("parseLocalDateString('2026-05-20') sin desfase (backend)", () => {
    const d = parseLocalDateString("2026-05-20");
    const out = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    console.log(`  parseLocalDateString("2026-05-20") → ${out}`);
    expect(d.getDate()).toBe(20);
  });
});
