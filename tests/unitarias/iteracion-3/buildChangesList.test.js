import { describe, it, expect } from "vitest";

const { __testables } = await import("../../../Backend/prisma/src/controllers/activityController");
const { buildChangesList } = __testables;

describe("PU-04: buildChangesList", () => {
  beforeAll(() => console.log("\n[PU-04] Generación de cambios de actividad"));

  it("cambio simple → viñeta con '→'", () => {
    const snap = { titulo: "A", fecha: "2026-05-20", hora_inicio: "15:00", hora_termino: "17:00", max_participantes: 20, chat_bidireccional: true };
    const r = buildChangesList(snap, { ...snap, titulo: "B" });
    console.log(`  Cambio de título "A" → "B":${r}`);
    expect(r).toContain("→");
  });

  it("múltiples cambios → varias viñetas", () => {
    const snap = { titulo: "A", fecha: "2026-05-20", hora_inicio: "2026-05-20T15:00:00.000Z", hora_termino: "2026-05-20T17:00:00.000Z", max_participantes: 20, chat_bidireccional: true };
    const cur = { titulo: "B", fecha: "2026-05-21", hora_inicio: "2026-05-21T10:00:00.000Z", hora_termino: "2026-05-21T12:00:00.000Z", max_participantes: 25, chat_bidireccional: false };
    const r = buildChangesList(snap, cur);
    console.log(`  Múltiples cambios:${r}`);
    expect(r.match(/•/g)).toHaveLength(6);
  });

  it("sin cambios → string vacío", () => {
    const o = { titulo: "A", fecha: "2026-05-20", hora_inicio: "15:00", hora_termino: "17:00" };
    const r = buildChangesList(o, { ...o });
    console.log(`  Sin cambios → "${r}"`);
    expect(r).toBe("");
  });

  it("campos vacíos → string vacío", () => {
    const snap = { titulo: "A", fecha: null, hora_inicio: null, hora_termino: null, max_participantes: null, chat_bidireccional: null };
    const cur = { titulo: "A", fecha: "2026-05-20", hora_inicio: "15:00", hora_termino: "17:00", max_participantes: 20, chat_bidireccional: null };
    const r = buildChangesList(snap, cur);
    console.log(`  Campos nulos → "${r}"`);
    expect(r).toBe("");
  });
});
