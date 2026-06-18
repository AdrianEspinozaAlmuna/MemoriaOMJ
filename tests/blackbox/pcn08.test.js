const request = require("supertest");
const app = require("../../Backend/prisma/src/index");
const {
  createUser, createGroup, addToGroup, generateToken, cleanupDatabase, closePrisma,
} = require("../helpers/factories");

describe("PCN-08: Restriccion lider grupo", () => {
  let memberToken, group, leader, member, otherMember;

  beforeAll(async () => {
    leader = await createUser({ rol: "participante" });
    member = await createUser({ rol: "participante" });
    otherMember = await createUser({ rol: "participante" });
    memberToken = generateToken(member);

    group = await createGroup({ id_lider: leader.id_usuario });

    await addToGroup(group.id_grupo, leader.id_usuario, "lider");
    await addToGroup(group.id_grupo, member.id_usuario, "miembro");
    await addToGroup(group.id_grupo, otherMember.id_usuario, "miembro");
  });

  afterAll(async () => {
    await cleanupDatabase();
    await closePrisma();
  });

  test("miembro recibe 403 al intentar eliminar a otro miembro", async () => {
    const res = await request(app)
      .delete(`/api/groups/${group.id_grupo}/members`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ id_usuario: otherMember.id_usuario });

    expect(res.status).toBe(403);
  });
});
