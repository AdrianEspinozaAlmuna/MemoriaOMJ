const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  // Crear usuarios
  const users = [
    {
      rut: "11111111-1",
      nombre: "Admin",
      apellido: "OMJ",
      mail: "admin@omj.cl",
      telefono: "990000001",
      rol: "admin",
      password: "Admin@123456"
    },
    {
      rut: "22222222-2",
      nombre: "Paula",
      apellido: "Participante",
      mail: "participante1@omj.cl",
      telefono: "990000002",
      rol: "participante",
      password: "Participante@123"
    },
    {
      rut: "33333333-3",
      nombre: "Diego",
      apellido: "Participante",
      mail: "participante2@omj.cl",
      telefono: "990000003",
      rol: "participante",
      password: "Participante@123"
    },
    {
      rut: "44444444-4",
      nombre: "Ana",
      apellido: "Martinez",
      mail: "ana.martinez@omj.cl",
      telefono: "990000004",
      rol: "participante",
      password: "Participante@123"
    }
  ];

  for (const user of users) {
    const { password, ...userData } = user;
    const passwordHash = await bcrypt.hash(password, 12);
    
    await prisma.usuario.upsert({
      where: { mail: user.mail },
      update: {
        rut: userData.rut,
        nombre: userData.nombre,
        apellido: userData.apellido,
        telefono: userData.telefono,
        rol: userData.rol,
        estado: true,
        password_hash: passwordHash
      },
      create: {
        ...userData,
        estado: true,
        password_hash: passwordHash
      }
    });
  }
  console.log("✓ Usuarios creados/actualizados");

  // Crear salas
  const salas = [
    {
      nombre: "Sala de Música",
      capacidad: 25,
      estado: "habilitada"
    },
    {
      nombre: "Salón Principal",
      capacidad: 50,
      estado: "habilitada"
    },
    {
      nombre: "Auditorio",
      capacidad: 100,
      estado: "habilitada"
    },
    {
      nombre: "Sala Oriente",
      capacidad: 30,
      estado: "habilitada"
    },
    {
      nombre: "Sala de Reuniones",
      capacidad: 15,
      estado: "habilitada"
    }
  ];

  for (const sala of salas) {
    await prisma.salas.upsert({
      where: { nombre: sala.nombre },
      update: {
        capacidad: sala.capacidad,
        estado: sala.estado
      },
      create: sala
    });
  }
  console.log("✓ Salas creadas/actualizadas");

  // Crear actividades de ejemplo
  const adminUser = await prisma.usuario.findUnique({
    where: { mail: "admin@omj.cl" }
  });

  const salaMusica = await prisma.salas.findUnique({
    where: { nombre: "Sala de Música" }
  });

  const salonPrincipal = await prisma.salas.findUnique({
    where: { nombre: "Salón Principal" }
  });

  const auditorio = await prisma.salas.findUnique({
    where: { nombre: "Auditorio" }
  });

  if (adminUser && salaMusica && salonPrincipal && auditorio) {
    // Limpiar actividades previas para evitar duplicados
    await prisma.actividad.deleteMany({});

    const activities = [
      {
        id_encargado: adminUser.id_usuario,
        id_sala: salaMusica.id_sala,
        titulo: "Taller de Guitarra para Principiantes",
        descripcion: "Aprende los conceptos básicos de la guitarra acústica. Actividad ideal para quienes desean iniciarse en la música.",
        fecha: new Date("2026-04-17"),
        hora_inicio: new Date("2026-04-17T16:00:00"),
        hora_termino: new Date("2026-04-17T17:30:00"),
        max_participantes: 18,
        chat_bidireccional: true,
        aprobado: true,
        estado: "programada"
      },
      {
        id_encargado: adminUser.id_usuario,
        id_sala: salonPrincipal.id_sala,
        titulo: "Torneo de Ajedrez",
        descripcion: "Competencia de ajedrez abierta para todos los niveles. Habrá premios para los ganadores.",
        fecha: new Date("2026-04-21"),
        hora_inicio: new Date("2026-04-21T18:30:00"),
        hora_termino: new Date("2026-04-21T20:30:00"),
        max_participantes: 24,
        chat_bidireccional: true,
        aprobado: true,
        estado: "programada"
      },
      {
        id_encargado: adminUser.id_usuario,
        id_sala: auditorio.id_sala,
        titulo: "Cine Foro: Películas Latinoamericanas",
        descripcion: "Sesión de cine con debate posterior sobre cine latinoamericano contemporáneo.",
        fecha: new Date("2026-04-24"),
        hora_inicio: new Date("2026-04-24T19:00:00"),
        hora_termino: new Date("2026-04-24T21:00:00"),
        max_participantes: 40,
        chat_bidireccional: true,
        aprobado: true,
        estado: "programada"
      },
      {
        id_encargado: adminUser.id_usuario,
        id_sala: salaMusica.id_sala,
        titulo: "Taller de Danza Contemporánea",
        descripcion: "Actividad pendiente de aprobación. Taller introductorio de danza contemporánea.",
        fecha: new Date("2026-05-01"),
        hora_inicio: new Date("2026-05-01T17:00:00"),
        hora_termino: new Date("2026-05-01T18:30:00"),
        max_participantes: 20,
        chat_bidireccional: true,
        aprobado: false,
        estado: "pendiente"
      }
    ];

    for (const activity of activities) {
      await prisma.actividad.create({
        data: activity
      });
    }
    console.log("✓ Actividades creadas");
  }

  console.log("\n✅ Seed completado exitosamente");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());