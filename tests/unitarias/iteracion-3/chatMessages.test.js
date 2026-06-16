import { describe, it, expect } from "vitest";

const { __testables } = await import("../../../Backend/prisma/src/controllers/activityController");
const { isValidMessage, canMessageInActivity } = __testables;

describe("isValidMessage", () => {
  beforeAll(() => console.log("\n[PU-06] Validación de mensajes de chat"));

  it("texto normal → true", () => {
    const r = isValidMessage("Hola, ¿cómo están?");
    console.log(`  isValidMessage("Hola...") → ${r}`);
    expect(r).toBe(true);
  });

  it("texto vacío → false", () => {
    expect(isValidMessage("")).toBe(false);
    expect(isValidMessage("   ")).toBe(false);
  });

  it("null → false", () => {
    expect(isValidMessage(null)).toBe(false);
  });

  it("texto dentro del límite (2000) → true", () => {
    const text = "a".repeat(2000);
    const r = isValidMessage(text);
    console.log(`  isValidMessage(2000 caracteres) → ${r}`);
    expect(r).toBe(true);
  });

  it("texto supera el límite (2001) → false", () => {
    const text = "a".repeat(2001);
    const r = isValidMessage(text);
    console.log(`  isValidMessage(2001 caracteres) → ${r}`);
    expect(r).toBe(false);
  });
});

describe("canMessageInActivity", () => {
  beforeAll(() => console.log("\n[PU-06] Restricción de chat por estado"));

  it("programada → true", () => {
    expect(canMessageInActivity("programada")).toBe(true);
  });

  it("en_curso → true", () => {
    expect(canMessageInActivity("en_curso")).toBe(true);
  });

  it("cancelada → false", () => {
    const r = canMessageInActivity("cancelada");
    console.log(`  canMessageInActivity("cancelada") → ${r}`);
    expect(r).toBe(false);
  });
});
