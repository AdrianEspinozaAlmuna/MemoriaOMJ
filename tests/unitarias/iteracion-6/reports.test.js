import { describe, it, expect } from "vitest";

function computeAttendanceRate(attendanceData) {
  if (!attendanceData || attendanceData.length === 0) return "0%";
  const attended = attendanceData.find(a => a.asistio === true)?._count || 0;
  const total = attendanceData.reduce((sum, a) => sum + a._count, 0);
  if (total === 0) return "0%";
  return `${Math.round((attended / total) * 100)}%`;
}

describe("PU-14: computeAttendanceRate", () => {
  beforeAll(() => console.log("\n[PU-14] Cálculo de asistencia promedio"));

  it("100% de asistencia", () => {
    const data = [{ asistio: true, _count: 10 }, { asistio: false, _count: 0 }];
    const r = computeAttendanceRate(data);
    console.log(`  asistentes=10, total=10 → "${r}"`);
    expect(r).toBe("100%");
  });

  it("50% de asistencia", () => {
    const data = [{ asistio: true, _count: 5 }, { asistio: false, _count: 5 }];
    const r = computeAttendanceRate(data);
    console.log(`  asistentes=5, total=10 → "${r}"`);
    expect(r).toBe("50%");
  });

  it("0% de asistencia", () => {
    const data = [{ asistio: false, _count: 10 }];
    const r = computeAttendanceRate(data);
    console.log(`  asistentes=0, total=10 → "${r}"`);
    expect(r).toBe("0%");
  });

  it("datos vacíos → '0%'", () => {
    const r = computeAttendanceRate([]);
    console.log(`  datos vacíos → "${r}"`);
    expect(r).toBe("0%");
  });
});
