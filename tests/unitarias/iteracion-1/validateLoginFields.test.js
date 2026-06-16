import { describe, it, expect } from "vitest";

const { __testables } = await import("../../../Backend/prisma/src/controllers/userController");
const { validateLoginFields } = __testables;

describe("PU-02b: validateLoginFields", () => {
  beforeAll(() => {
    console.log("\n[PU-02b] Validación de campos de login");
  });

  it("email vacío → mensaje de error", () => {
    const r = validateLoginFields("", "pass123");
    console.log(`  validateLoginFields("", "pass123") → "${r}"`);
    expect(r).not.toBe("");
  });

  it("password vacío → mensaje de error", () => {
    const r = validateLoginFields("mail@test.com", "");
    console.log(`  validateLoginFields("mail@test.com", "") → "${r}"`);
    expect(r).not.toBe("");
  });

  it("ambos campos presentes → string vacío", () => {
    const r = validateLoginFields("mail@test.com", "pass123");
    console.log(`  validateLoginFields("mail@test.com", "pass123") → "${r}"`);
    expect(r).toBe("");
  });
});
