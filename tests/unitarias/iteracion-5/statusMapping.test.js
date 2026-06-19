import { describe, it, expect } from "vitest";

import { getActivityStatusMeta } from "../../../Frontend/src/utils/activityStatus";
import { toUiActivity } from "../../../Frontend/src/services/userViewsService";

const { __testables } = await import("../../../Backend/prisma/src/controllers/activityController");
const { mapEstadoToUi } = __testables;

describe("PU-11a: mapEstadoToUi", () => {
  beforeAll(() => console.log("\n[PU-11a] mapEstadoToUi"));

  it("participante inscrito → 'inscrito'", () => {
    const r = mapEstadoToUi("pendiente", "participante");
    console.log(`  mapEstadoToUi("pendiente", "participante") → "${r}"`);
    expect(r).toBe("inscrito");
  });

  it("actividad disponible → 'disponible'", () => {
    const r = mapEstadoToUi("programada", "admin");
    console.log(`  mapEstadoToUi("programada", "admin") → "${r}"`);
    expect(r).toBe("disponible");
  });

  it("pendiente → 'pendiente'", () => {
    const r = mapEstadoToUi("pendiente", "admin");
    console.log(`  mapEstadoToUi("pendiente", "admin") → "${r}"`);
    expect(r).toBe("pendiente");
  });

  it("finalizada → 'disponible' (default)", () => {
    const r = mapEstadoToUi("finalizada", "admin");
    console.log(`  mapEstadoToUi("finalizada", "admin") → "${r}"`);
    expect(r).toBe("disponible");
  });
});

describe("PU-11b: toUiActivity", () => {
  beforeAll(() => console.log("\n[PU-11b] toUiActivity"));

  it("mapea campos de actividad completa", () => {
    const ui = toUiActivity({ id_actividad: 42, titulo: "Taller", fecha: "2026-06-10", hora_inicio: "15:30", estado: "programada" });
    console.log(`  toUiActivity → id="${ui.id}", title="${ui.title}", date="${ui.date}"`);
    expect(ui.id).toBe("42");
    expect(ui.title).toBe("Taller");
    expect(ui.date).toBe("2026-06-10");
  });
});

describe("PU-11c: getActivityStatusMeta", () => {
  beforeAll(() => console.log("\n[PU-11c] getActivityStatusMeta"));

  it("programada → 'Programada'", () => {
    const r = getActivityStatusMeta("programada").label;
    console.log(`  getActivityStatusMeta("programada") → "${r}"`);
    expect(r).toBe("Programada");
  });

  it("finalizada → 'Finalizada'", () => {
    const r = getActivityStatusMeta("finalizada").label;
    console.log(`  getActivityStatusMeta("finalizada") → "${r}"`);
    expect(r).toBe("Finalizada");
  });

  it("estado desconocido → 'Sin estado'", () => {
    const r = getActivityStatusMeta("xyz").label;
    console.log(`  getActivityStatusMeta("xyz") → "${r}"`);
    expect(r).toBe("Sin estado");
  });
});
