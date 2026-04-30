const { prisma } = require("../prisma/client");

async function getDashboardStats(req, res) {
  try {
    const [
      totalUsers,
      activeActivities,
      recentApprovals,
      totalParticipants,
      completedActivities
    ] = await Promise.all([
      prisma.usuario.count(),
      prisma.actividad.count({
        where: { estado: { in: ["programada", "en_curso"] } }
      }),
      prisma.actividad.count({
        where: {
          aprobado: true,
          estado: { in: ["programada", "en_curso"] }
        }
      }),
      prisma.actividad_participantes.count(),
      prisma.actividad.count({
        where: { estado: "finalizada" }
      })
    ]);

    // Calcular asistencia promedio
    const attendanceData = await prisma.actividad_participantes.groupBy({
      by: ["asistio"],
      _count: true
    });

    let averageAttendance = "0%";
    if (attendanceData.length > 0) {
      const attended = attendanceData.find(a => a.asistio === true)?._count || 0;
      const total = attendanceData.reduce((sum, a) => sum + a._count, 0);
      if (total > 0) {
        const percentage = Math.round((attended / total) * 100);
        averageAttendance = `${percentage}%`;
      }
    }

    return res.json({
      totalUsers,
      activeActivities,
      recentApprovals,
      averageAttendance,
      totalParticipants,
      completedActivities
    });
  } catch (e) {
    return res.status(500).json({
      message: "Error al obtener estadísticas del dashboard",
      detail: e.message
    });
  }
}

module.exports = {
  getDashboardStats
};
