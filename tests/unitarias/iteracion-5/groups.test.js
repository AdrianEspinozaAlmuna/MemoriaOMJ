import { describe, it, expect } from "vitest";

const { __testables } = await import("../../../Backend/prisma/src/controllers/groupController");
const { isGroupLeader } = __testables;

describe("isGroupLeader", () => {
  beforeAll(() => console.log("\n[PU-06d] Reglas de grupo (isGroupLeader)"));

  it("userId coincide con leaderId → true", () => {
    const r = isGroupLeader(5, 5);
    console.log(`  isGroupLeader(5, 5) → ${r}`);
    expect(r).toBe(true);
  });

  it("userId distinto de leaderId → false", () => {
    const r = isGroupLeader(3, 5);
    console.log(`  isGroupLeader(3, 5) → ${r}`);
    expect(r).toBe(false);
  });

  it("valores como string numérico → funciona", () => {
    const r = isGroupLeader("5", 5);
    console.log(`  isGroupLeader("5", 5) → ${r}`);
    expect(r).toBe(true);
  });
});
