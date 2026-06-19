import { describe, it, expect } from "vitest";

const { __testables } = await import("../../../Backend/prisma/src/controllers/activityController");
const { validateRating } = __testables;

describe("PU-07: validateRating", () => {
  beforeAll(() => console.log("\n[PU-07] Validación de rango de valoración"));

  it("0 → inválido", () => {
    expect(validateRating(0)).toBe(false);
  });

  it("6 → inválido", () => {
    expect(validateRating(6)).toBe(false);
  });

  it("1 → válido", () => {
    expect(validateRating(1)).toBe(true);
  });

  it("3 → válido", () => {
    expect(validateRating(3)).toBe(true);
  });

  it("5 → válido", () => {
    expect(validateRating(5)).toBe(true);
  });
});
