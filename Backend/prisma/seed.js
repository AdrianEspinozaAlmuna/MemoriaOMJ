const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      rut: "11111111-1",
      nombre: "Admin",
      apellido: "OMJ",
      mail: "admin@omj.cl",
      telefono: "+56990000001",
      rol: "admin"
    },
    {
      rut: "22222222-2",
      nombre: "Paula",
      apellido: "Participante",
      mail: "participante1@omj.cl",
      telefono: "+56990000002",
      rol: "participante"
    },
    {
      rut: "33333333-3",
      nombre: "Diego",
      apellido: "Participante",
      mail: "participante2@omj.cl",
      telefono: "+56990000003",
      rol: "participante"
    }
  ];

  for (const user of users) {
    await prisma.usuario.upsert({
      where: { mail: user.mail },
      update: {
        rut: user.rut,
        nombre: user.nombre,
        apellido: user.apellido,
        telefono: user.telefono,
        rol: user.rol,
        estado: true
      },
      create: {
        ...user,
        estado: true
      }
    });
  }

  console.log("Seed completado: admin + participantes creados/actualizados");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());