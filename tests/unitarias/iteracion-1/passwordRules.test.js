import { describe, it, expect } from "vitest";

import { validateStrongPassword } from "../../../Frontend/src/utils/passwordRules";

describe("PU-01: validateStrongPassword", () => {
  beforeAll(() => {
    console.log("\n[PU-01] Validación de contraseña segura");
    console.log("  Reglas: >=10 chars, mayúscula, minúscula, número, símbolo, sin espacios");
  });

  it("muy corta → inválida", () => {
    const input = "abc";
    const result = validateStrongPassword(input);
    console.log(`  "${input}" → "${result}"`);
    expect(result).not.toBe("");
  });

  it("sin mayúscula → inválida", () => {
    const input = "password123!";
    const result = validateStrongPassword(input);
    console.log(`  "${input}" → "${result}"`);
    expect(result).not.toBe("");
  });

  it("sin número → inválida", () => {
    const input = "PasswordPwd!";
    const result = validateStrongPassword(input);
    console.log(`  "${input}" → "${result}"`);
    expect(result).not.toBe("");
  });

  it("válida (>=10, M, m, 9, !) → aceptada", () => {
    const input = "Password123!";
    const result = validateStrongPassword(input);
    console.log(`  "${input}" → "${result}" (string vacío = aceptada)`);
    expect(result).toBe("");
  });
});
