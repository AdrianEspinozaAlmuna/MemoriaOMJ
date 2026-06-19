import { describe, it, expect } from "vitest";

const { __testables } = await import("../../../Backend/prisma/src/controllers/activityController");
const { canEnroll, isInCourse, canCancel, validateCapacity } = __testables;

describe("canEnroll", () => {
  beforeAll(() => console.log("\n[PU-05a] Reglas de inscripción (canEnroll)"));

  it("actividad aprobada y programada con cupos → true", () => {
    const act = { aprobado: true, estado: "programada", max_participantes: 20, _count: { actividad_participantes: 5 } };
    const r = canEnroll(act);
    console.log(`  {aprobado:true, programada, 5/20} → ${r}`);
    expect(r).toBe(true);
  });

  it("actividad no aprobada → false", () => {
    const act = { aprobado: false, estado: "programada", max_participantes: 20, _count: { actividad_participantes: 5 } };
    const r = canEnroll(act);
    console.log(`  {aprobado:false, programada, 5/20} → ${r}`);
    expect(r).toBe(false);
  });

  it("actividad al límite de cupos → false", () => {
    const act = { aprobado: true, estado: "programada", max_participantes: 20, _count: { actividad_participantes: 20 } };
    const r = canEnroll(act);
    console.log(`  {aprobado:true, programada, 20/20} → ${r}`);
    expect(r).toBe(false);
  });

  it("actividad null → false", () => {
    const r = canEnroll(null);
    console.log(`  null → ${r}`);
    expect(r).toBe(false);
  });
});

describe("isInCourse", () => {
  beforeAll(() => console.log("\n[PU-05b] Estado 'en_curso' (isInCourse)"));

  it("'en_curso' → true", () => {
    expect(isInCourse("en_curso")).toBe(true);
  });

  it("cualquier otro estado → false", () => {
    expect(isInCourse("programada")).toBe(false);
    expect(isInCourse("finalizada")).toBe(false);
  });

  it("'en_curso' → true", () => {
    const r = isInCourse("en_curso");
    console.log(`  isInCourse("en_curso") → ${r}`);
    expect(r).toBe(true);
  });
});

describe("canCancel", () => {
  beforeAll(() => console.log("\n[PU-05c] Cancelación de actividad (canCancel)"));

  it("programada → true", () => {
    const r = canCancel("programada");
    console.log(`  canCancel("programada") → ${r}`);
    expect(r).toBe(true);
  });

  it("finalizada → false", () => {
    const r = canCancel("finalizada");
    console.log(`  canCancel("finalizada") → ${r}`);
    expect(r).toBe(false);
  });

  it("cancelada → false", () => {
    const r = canCancel("cancelada");
    console.log(`  canCancel("cancelada") → ${r}`);
    expect(r).toBe(false);
  });
});

describe("validateCapacity", () => {
  beforeAll(() => console.log("\n[PU-05d] Validación de capacidad vs sala (validateCapacity)"));

  it("cupo <= capacidad → true", () => {
    expect(validateCapacity(15, 20)).toBe(true);
    expect(validateCapacity(20, 20)).toBe(true);
  });

  it("cupo > capacidad → false", () => {
    const r = validateCapacity(25, 20);
    console.log(`  validateCapacity(25, 20) → ${r}`);
    expect(r).toBe(false);
  });
});
