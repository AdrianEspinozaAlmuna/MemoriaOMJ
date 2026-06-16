import { describe, it, expect } from "vitest";

const { __testables } = await import("../../../Backend/prisma/src/controllers/activityController");
const { buildActivityRevisionSnapshot, restoreActivityRevisionSnapshot } = __testables;

const base = {
  titulo: "Taller A",
  descripcion: "Desc A",
  id_sala: 1,
  id_tipo_actividad: 2,
  fecha: new Date(2026, 4, 20, 12, 0, 0, 0),
  hora_inicio: new Date(1970, 0, 1, 15, 0, 0, 0),
  hora_termino: new Date(1970, 0, 1, 17, 0, 0, 0),
  max_participantes: 20,
  chat_bidireccional: true,
  aprobado: false,
  estado: "pendiente",
};

describe("PU-05: buildActivityRevisionSnapshot / restoreActivityRevisionSnapshot", () => {
  beforeAll(() => console.log("\n[PU-05] Snapshot y restauración de actividad"));

  it("restaura nombre cambiado", () => {
    const snap = buildActivityRevisionSnapshot(base);
    const r = restoreActivityRevisionSnapshot(snap, { ...base, titulo: "Taller B" }).titulo;
    console.log(`  nombre: "Taller B" → "${r}" (esperado "Taller A")`);
    expect(r).toBe("Taller A");
  });

  it("restaura horario cambiado", () => {
    const snap = buildActivityRevisionSnapshot(base);
    const edited = { ...base, hora_inicio: new Date(1970, 0, 1, 10, 0) };
    const r = restoreActivityRevisionSnapshot(snap, edited).hora_inicio.getTime();
    console.log(`  horario: ${edited.hora_inicio.getTime()} → ${r} (esperado ${base.hora_inicio.getTime()})`);
    expect(r).toBe(base.hora_inicio.getTime());
  });

  it("restaura sala cambiada", () => {
    const snap = buildActivityRevisionSnapshot(base);
    const r = restoreActivityRevisionSnapshot(snap, { ...base, id_sala: 99 }).id_sala;
    console.log(`  sala: 99 → ${r} (esperado 1)`);
    expect(r).toBe(1);
  });

  it("restauración completa desde snapshot", () => {
    const snap = buildActivityRevisionSnapshot(base);
    const edited = { ...base, titulo: "B", descripcion: "B", id_sala: 9, hora_inicio: new Date(1970, 0, 1, 8, 0) };
    const restored = restoreActivityRevisionSnapshot(snap, edited);
    console.log(`  restauración completa: titulo="${restored.titulo}", sala=${restored.id_sala}`);
    expect(restored.titulo).toBe("Taller A");
    expect(restored.id_sala).toBe(1);
  });
});
