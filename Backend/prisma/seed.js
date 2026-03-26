const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.usuario.upsert({
    where: { mail: "test@example.com" },
    update: {
      nombre: "Usuario",
      apellido: "Prueba",
      rol: "participante",
      estado: true
    },
    create: {
      rut: "12345678-9",
      nombre: "Usuario",
      apellido: "Prueba",
      mail: "test@example.com",
      telefono: "+56911112222",
      rol: "participante"
    }
  });
  console.log("Seed completed");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());