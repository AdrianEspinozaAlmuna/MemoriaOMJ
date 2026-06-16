import { describe, it, expect } from "vitest";

const { __testables } = await import("../../../Backend/prisma/src/controllers/activityController");
const { buildActivityRevisionSnapshot, buildChangesList, timeStringToDate } = __testables;

describe("PU-10: Snapshot para notificaciones", () => {
  beforeAll(() => console.log("\n[PU-10] Snapshot para notificaciones"));

  it("snapshot contiene datos formateados para la notificación", () => {
    const activity = {
      titulo: "Taller A",
      descripcion: "Desc",
      id_sala: 1,
      id_tipo_actividad: 2,
      fecha: new Date(2026, 4, 20, 12, 0, 0, 0),
      hora_inicio: timeStringToDate("15:00"),
      hora_termino: timeStringToDate("17:00"),
      max_participantes: 20,
      chat_bidireccional: true,
      aprobado: false,
      estado: "pendiente",
    };
    const snap = buildActivityRevisionSnapshot(activity);
    console.log(`  snapshot → titulo="${snap.titulo}", fecha=${snap.fecha}, hora_inicio=${snap.hora_inicio}`);
    expect(snap.titulo).toBe("Taller A");
    expect(snap.fecha).toBe("2026-05-20");
    expect(snap.hora_inicio).toBe("15:00");
    expect(snap.hora_termino).toBe("17:00");
  });

  it("buildChangesList genera texto formateado para notificación", () => {
    const pre = { titulo: "A", fecha: "2026-05-20", hora_inicio: "15:00", hora_termino: "17:00" };
    const post = { ...pre, titulo: "B" };
    const changes = buildChangesList(pre, post);
    console.log(`  cambios generados:${changes}`);
    expect(changes).toContain("•");
    expect(changes).toContain("Título");
  });
});
