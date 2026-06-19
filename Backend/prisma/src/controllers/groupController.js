const { prisma } = require("../prisma/client");
const { getUserIdFromToken } = require("../middleware/auth");

// Obtener todos los grupos del usuario (como líder o miembro)
async function getMyGroups(req, res) {
  const idUsuario = getUserIdFromToken(req.user || {});

  if (!idUsuario) {
    return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  }

  try {
    // Grupos donde el usuario es líder
    const listedGroups = await prisma.grupo.findMany({
      where: {
        OR: [
          { id_lider: idUsuario },
          { participantes_grupo: { some: { id_usuario: idUsuario } } }
        ]
      },
      include: {
        usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            mail: true
          }
        },
        participantes_grupo: {
          include: {
            usuario: {
              select: {
                id_usuario: true,
                nombre: true,
                apellido: true,
                mail: true
              }
            }
          }
        }
      },
      orderBy: { id_grupo: "desc" }
    });

    const formatted = listedGroups.map(g => ({
      id_grupo: g.id_grupo,
      nombre: g.nombre,
      descripcion: g.descripcion,
      id_lider: g.id_lider,
      lider: g.usuario,
      rol_usuario: g.id_lider === idUsuario ? "lider" : "miembro",
      participantes: g.participantes_grupo.map(p => ({
        id_usuario: p.usuario.id_usuario,
        nombre: p.usuario.nombre,
        apellido: p.usuario.apellido,
        mail: p.usuario.mail,
        rol: p.rol
      })),
      cantidad_miembros: g.participantes_grupo.length + 1 // +1 para el líder
    }));

    return res.json({ grupos: formatted });
  } catch (error) {
    console.error("[groups] getMyGroups failed:", error);
    return res.status(500).json({ message: "Error obteniendo grupos", detail: error.message });
  }
}

// Crear un nuevo grupo
async function createGroup(req, res) {
  const idUsuario = getUserIdFromToken(req.user || {});
  const { nombre, descripcion = "" } = req.body;

  if (!idUsuario) {
    return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  }

  if (!nombre || typeof nombre !== "string" || nombre.trim().length === 0) {
    return res.status(400).json({ message: "El nombre del grupo es requerido" });
  }

  try {
    // Verificar que el usuario líder existe en la base de datos
    const liderExistente = await prisma.usuario.findUnique({
      where: { id_usuario: idUsuario },
      select: { id_usuario: true, nombre: true }
    });

    if (!liderExistente) {
      return res.status(403).json({ message: "Usuario autenticado no existe en la base de datos" });
    }

    const grupo = await prisma.grupo.create({
      data: {
        id_lider: idUsuario,
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || ""
      },
      include: {
        usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            mail: true
          }
        },
        participantes_grupo: true
      }
    });

    return res.status(201).json({
      id_grupo: grupo.id_grupo,
      nombre: grupo.nombre,
      descripcion: grupo.descripcion,
      id_lider: grupo.id_lider,
      lider: grupo.usuario,
      participantes: [],
      cantidad_miembros: 1
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "El nombre del grupo ya existe" });
    }
    console.error("[groups] createGroup failed:", error);
    return res.status(500).json({ message: "Error creando grupo", detail: error.message });
  }
}

// Agregar usuario a un grupo (solo líder puede hacerlo)
async function addUserToGroup(req, res) {
  const idUsuario = getUserIdFromToken(req.user || {});
  const idGrupo = Number(req.params.id_grupo);
  const { id_usuario: idNuevoUsuario } = req.body;

  if (!idUsuario) {
    return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  }

  if (!Number.isInteger(idGrupo) || idGrupo <= 0) {
    return res.status(400).json({ message: "id_grupo invalido" });
  }

  if (!Number.isInteger(idNuevoUsuario) || idNuevoUsuario <= 0) {
    return res.status(400).json({ message: "id_usuario invalido" });
  }

  try {
    // Verificar que el grupo existe y el usuario es líder
    const grupo = await prisma.grupo.findUnique({
      where: { id_grupo: idGrupo }
    });

    if (!grupo) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }

    if (grupo.id_lider !== idUsuario) {
      return res.status(403).json({ message: "Solo el líder del grupo puede agregar miembros" });
    }

    // Verificar que el usuario a agregar existe
    const usuarioAAgregar = await prisma.usuario.findUnique({
      where: { id_usuario: idNuevoUsuario },
      select: { id_usuario: true, nombre: true, apellido: true, mail: true }
    });

    if (!usuarioAAgregar) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar que no sea el líder del grupo
    if (idNuevoUsuario === grupo.id_lider) {
      return res.status(400).json({ message: "El líder ya está en el grupo" });
    }

    // Verificar que no estÃ© ya en el grupo
    const yaEsta = await prisma.participantes_grupo.findUnique({
      where: { id_grupo_id_usuario: { id_grupo: idGrupo, id_usuario: idNuevoUsuario } }
    });

    if (yaEsta) {
      return res.status(409).json({ message: "El usuario ya está en el grupo" });
    }

    // Agregar usuario al grupo
    await prisma.participantes_grupo.create({
      data: {
        id_grupo: idGrupo,
        id_usuario: idNuevoUsuario,
        rol: "miembro"
      }
    });

    return res.status(201).json({
      ok: true,
      message: "Usuario agregado al grupo",
      usuario: usuarioAAgregar
    });
  } catch (error) {
    console.error("[groups] addUserToGroup failed:", error);
    return res.status(500).json({ message: "Error agregando usuario al grupo", detail: error.message });
  }
}

// Obtener detalles de un grupo
async function getGroup(req, res) {
  const idUsuario = getUserIdFromToken(req.user || {});
  const idGrupo = Number(req.params.id_grupo);

  if (!idUsuario) {
    return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  }

  if (!Number.isInteger(idGrupo) || idGrupo <= 0) {
    return res.status(400).json({ message: "id_grupo invalido" });
  }

  try {
    const grupo = await prisma.grupo.findUnique({
      where: { id_grupo: idGrupo },
      include: {
        usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            mail: true
          }
        },
        participantes_grupo: {
          include: {
            usuario: {
              select: {
                id_usuario: true,
                nombre: true,
                apellido: true,
                mail: true
              }
            }
          }
        }
      }
    });

    if (!grupo) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }

    // Verificar que el usuario es miembro o líder del grupo
    const esMiembro = grupo.id_lider === idUsuario || 
                      grupo.participantes_grupo.some(p => p.id_usuario === idUsuario);

    if (!esMiembro) {
      return res.status(403).json({ message: "No tienes acceso a este grupo" });
    }

    return res.json({
      id_grupo: grupo.id_grupo,
      nombre: grupo.nombre,
      descripcion: grupo.descripcion,
      id_lider: grupo.id_lider,
      lider: grupo.usuario,
      rol_usuario: grupo.id_lider === idUsuario ? "lider" : "miembro",
      participantes: grupo.participantes_grupo.map(p => ({
        id_usuario: p.usuario.id_usuario,
        nombre: p.usuario.nombre,
        apellido: p.usuario.apellido,
        mail: p.usuario.mail,
        rol: p.rol
      })),
      cantidad_miembros: grupo.participantes_grupo.length + 1
    });
  } catch (error) {
    console.error("[groups] getGroup failed:", error);
    return res.status(500).json({ message: "Error obteniendo grupo", detail: error.message });
  }
}

// Eliminar usuario del grupo (solo líder puede)
async function removeUserFromGroup(req, res) {
  const idUsuario = getUserIdFromToken(req.user || {});
  const idGrupo = Number(req.params.id_grupo);
  const { id_usuario: idUsuarioAEliminar } = req.body;

  if (!idUsuario) {
    return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  }

  if (!Number.isInteger(idGrupo) || idGrupo <= 0) {
    return res.status(400).json({ message: "id_grupo invalido" });
  }

  if (!Number.isInteger(idUsuarioAEliminar) || idUsuarioAEliminar <= 0) {
    return res.status(400).json({ message: "id_usuario invalido" });
  }

  try {
    const grupo = await prisma.grupo.findUnique({
      where: { id_grupo: idGrupo }
    });

    if (!grupo) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }

    // Solo el líder puede eliminar miembros
    if (grupo.id_lider !== idUsuario) {
      return res.status(403).json({ message: "Solo el líder del grupo puede eliminar miembros" });
    }

    // No se puede eliminar al líder
    if (idUsuarioAEliminar === grupo.id_lider) {
      return res.status(400).json({ message: "No se puede eliminar al líder del grupo" });
    }

    // Eliminar participante
    const deleted = await prisma.participantes_grupo.deleteMany({
      where: {
        id_grupo: idGrupo,
        id_usuario: idUsuarioAEliminar
      }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ message: "El usuario no está en el grupo" });
    }

    return res.json({ ok: true, message: "Usuario eliminado del grupo" });
  } catch (error) {
    console.error("[groups] removeUserFromGroup failed:", error);
    return res.status(500).json({ message: "Error eliminando usuario del grupo", detail: error.message });
  }
}

// Salir del grupo (cualquier miembro)
async function leaveGroup(req, res) {
  const idUsuario = getUserIdFromToken(req.user || {});
  const idGrupo = Number(req.params.id_grupo);

  if (!idUsuario) {
    return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  }

  if (!Number.isInteger(idGrupo) || idGrupo <= 0) {
    return res.status(400).json({ message: "id_grupo invalido" });
  }

  try {
    const grupo = await prisma.grupo.findUnique({
      where: { id_grupo: idGrupo }
    });

    if (!grupo) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }

    if (grupo.id_lider === idUsuario) {
      return res.status(400).json({ message: "El líder no puede salir del grupo. Elimina el grupo primero." });
    }

    // Eliminar participante
    const deleted = await prisma.participantes_grupo.deleteMany({
      where: {
        id_grupo: idGrupo,
        id_usuario: idUsuario
      }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ message: "No estás en este grupo" });
    }

    return res.json({ ok: true, message: "Has salido del grupo" });
  } catch (error) {
    console.error("[groups] leaveGroup failed:", error);
    return res.status(500).json({ message: "Error saliendo del grupo", detail: error.message });
  }
}

// Eliminar grupo (solo líder)
async function deleteGroup(req, res) {
  const idUsuario = getUserIdFromToken(req.user || {});
  const idGrupo = Number(req.params.id_grupo);

  if (!idUsuario) {
    return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  }

  if (!Number.isInteger(idGrupo) || idGrupo <= 0) {
    return res.status(400).json({ message: "id_grupo invalido" });
  }

  try {
    const grupo = await prisma.grupo.findUnique({
      where: { id_grupo: idGrupo }
    });

    if (!grupo) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }

    if (grupo.id_lider !== idUsuario) {
      return res.status(403).json({ message: "Solo el líder del grupo puede eliminarlo" });
    }

    // Eliminar el grupo (delete cascade eliminarÃ¡ participantes automÃ¡ticamente)
    await prisma.grupo.delete({
      where: { id_grupo: idGrupo }
    });

    return res.json({ ok: true, message: "Grupo eliminado" });
  } catch (error) {
    console.error("[groups] deleteGroup failed:", error);
    return res.status(500).json({ message: "Error eliminando grupo", detail: error.message });
  }
}

// Editar grupo y agregar miembros nuevos en una sola operaciÃ³n
async function updateGroup(req, res) {
  const idUsuario = getUserIdFromToken(req.user || {});
  const idGrupo = Number(req.params.id_grupo);
  const { nombre, descripcion = "", nuevos_miembros = [] } = req.body;

  if (!idUsuario) {
    return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  }

  if (!Number.isInteger(idGrupo) || idGrupo <= 0) {
    return res.status(400).json({ message: "id_grupo invalido" });
  }

  if (!nombre || typeof nombre !== "string" || nombre.trim().length === 0) {
    return res.status(400).json({ message: "El nombre del grupo es requerido" });
  }

  const idsNuevosMiembros = Array.isArray(nuevos_miembros)
    ? [...new Set(nuevos_miembros.map(value => Number(value)).filter(value => Number.isInteger(value) && value > 0))]
    : [];

  try {
    const grupo = await prisma.grupo.findUnique({ where: { id_grupo: idGrupo } });

    if (!grupo) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }

    if (grupo.id_lider !== idUsuario) {
      return res.status(403).json({ message: "Solo el líder puede editar el grupo" });
    }

    const existingMembers = await prisma.participantes_grupo.findMany({
      where: { id_grupo: idGrupo },
      select: { id_usuario: true }
    });

    const existingMemberIds = new Set(existingMembers.map(member => member.id_usuario));
    const validNewMemberIds = idsNuevosMiembros.filter(id => id !== grupo.id_lider && !existingMemberIds.has(id));

    const updatedGrupo = await prisma.$transaction(async transaction => {
      await transaction.grupo.update({
        where: { id_grupo: idGrupo },
        data: {
          nombre: nombre.trim(),
          descripcion: descripcion?.trim() || ""
        }
      });

      if (validNewMemberIds.length > 0) {
        const usuariosValidos = await transaction.usuario.findMany({
          where: {
            id_usuario: { in: validNewMemberIds },
            estado: true
          },
          select: { id_usuario: true }
        });

        const idsValidos = usuariosValidos.map(usuario => usuario.id_usuario);
        if (idsValidos.length > 0) {
          await transaction.participantes_grupo.createMany({
            data: idsValidos.map(id_usuario => ({
              id_grupo: idGrupo,
              id_usuario,
              rol: "miembro"
            })),
            skipDuplicates: true
          });
        }
      }

      return transaction.grupo.findUnique({
        where: { id_grupo: idGrupo },
        include: {
          usuario: {
            select: {
              id_usuario: true,
              nombre: true,
              apellido: true,
              mail: true
            }
          },
          participantes_grupo: {
            include: {
              usuario: {
                select: {
                  id_usuario: true,
                  nombre: true,
                  apellido: true,
                  mail: true
                }
              }
            }
          }
        }
      });
    });

    return res.json({
      id_grupo: updatedGrupo.id_grupo,
      nombre: updatedGrupo.nombre,
      descripcion: updatedGrupo.descripcion,
      id_lider: updatedGrupo.id_lider,
      lider: updatedGrupo.usuario,
      rol_usuario: updatedGrupo.id_lider === idUsuario ? "lider" : "miembro",
      participantes: updatedGrupo.participantes_grupo.map(p => ({
        id_usuario: p.usuario.id_usuario,
        nombre: p.usuario.nombre,
        apellido: p.usuario.apellido,
        mail: p.usuario.mail,
        rol: p.rol
      })),
      cantidad_miembros: updatedGrupo.participantes_grupo.length + 1
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "El nombre del grupo ya existe" });
    }
    console.error("[groups] updateGroup failed:", error);
    return res.status(500).json({ message: "Error actualizando grupo", detail: error.message });
  }
}

// Buscar usuarios para invitar al grupo
async function searchUsersToInvite(req, res) {
  const idUsuario = getUserIdFromToken(req.user || {});
  const idGrupo = Number(req.params.id_grupo);
  const { buscar } = req.query;

  if (!idUsuario) {
    return res.status(403).json({ message: "No se pudo identificar el usuario autenticado" });
  }

  if (!Number.isInteger(idGrupo) || idGrupo <= 0) {
    return res.status(400).json({ message: "id_grupo invalido" });
  }

  try {
    const grupo = await prisma.grupo.findUnique({
      where: { id_grupo: idGrupo },
      include: {
        participantes_grupo: {
          select: { id_usuario: true }
        }
      }
    });

    if (!grupo) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }

    if (grupo.id_lider !== idUsuario) {
      return res.status(403).json({ message: "Solo el líder puede buscar usuarios" });
    }

    // Obtener IDs de usuarios ya en el grupo
    const idsYaEnGrupo = [
      grupo.id_lider,
      ...grupo.participantes_grupo.map(p => p.id_usuario)
    ];

    // Buscar usuarios no en el grupo
    const usuarios = await prisma.usuario.findMany({
      where: {
        AND: [
          { estado: true },
          { id_usuario: { notIn: idsYaEnGrupo } },
          buscar ? {
            OR: [
              { nombre: { contains: buscar, mode: "insensitive" } },
              { apellido: { contains: buscar, mode: "insensitive" } },
              { mail: { contains: buscar, mode: "insensitive" } }
            ]
          } : {}
        ]
      },
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        mail: true
      },
      take: 20
    });

    return res.json({ usuarios });
  } catch (error) {
    console.error("[groups] searchUsersToInvite failed:", error);
    return res.status(500).json({ message: "Error buscando usuarios", detail: error.message });
  }
}


// --- ADMIN FUNCTIONS ---

async function getAllGroupsAdmin(req, res) {
  try {
    const listedGroups = await prisma.grupo.findMany({
      include: {
        usuario: { select: { id_usuario: true, nombre: true, apellido: true, mail: true } },
        participantes_grupo: {
          include: {
            usuario: { select: { id_usuario: true, nombre: true, apellido: true, mail: true } }
          }
        }
      },
      orderBy: { id_grupo: 'desc' }
    });

    const formatted = listedGroups.map(g => ({
      id_grupo: g.id_grupo,
      nombre: g.nombre,
      descripcion: g.descripcion,
      id_lider: g.id_lider,
      lider: g.usuario,
      rol_usuario: 'admin',
      participantes: g.participantes_grupo.map(p => ({
        id_usuario: p.usuario.id_usuario,
        nombre: p.usuario.nombre,
        apellido: p.usuario.apellido,
        mail: p.usuario.mail,
        rol: p.rol
      })),
      cantidad_miembros: g.participantes_grupo.length + 1
    }));

    return res.json({ grupos: formatted });
  } catch (error) {
    console.error('[groups] getAllGroupsAdmin failed:', error);
    return res.status(500).json({ message: 'Error obteniendo todos los grupos', detail: error.message });
  }
}

async function getEligibleLeadersAdmin(req, res) {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: { estado: true, rol: { not: 'admin' } },
      select: { id_usuario: true, nombre: true, apellido: true, mail: true, rut: true },
      orderBy: { nombre: 'asc' }
    });
    return res.json({ usuarios });
  } catch (error) {
    console.error('[groups] getEligibleLeadersAdmin failed:', error);
    return res.status(500).json({ message: 'Error obteniendo usuarios elegibles', detail: error.message });
  }
}

async function createGroupAdmin(req, res) {
  const { nombre, descripcion = "", id_lider, nuevos_miembros = [] } = req.body;

  if (!nombre || typeof nombre !== "string" || nombre.trim().length === 0) {
    return res.status(400).json({ message: "El nombre del grupo es requerido" });
  }
  if (!Number.isInteger(id_lider) || id_lider <= 0) {
    return res.status(400).json({ message: "Se requiere un ID de líder válido" });
  }

  const idsNuevosMiembros = Array.isArray(nuevos_miembros)
    ? [...new Set(nuevos_miembros.map(Number).filter(v => Number.isInteger(v) && v > 0))]
    : [];

  try {
    const liderExistente = await prisma.usuario.findUnique({ where: { id_usuario: id_lider } });
    if (!liderExistente) return res.status(404).json({ message: "Usuario asignado como líder no existe" });
    if (liderExistente.rol === "admin") return res.status(400).json({ message: "El administrador del sistema no puede ser administrador de un grupo" });

    const grupoCreado = await prisma.$transaction(async transaction => {
      const g = await transaction.grupo.create({
        data: { id_lider, nombre: nombre.trim(), descripcion: descripcion?.trim() || "" }
      });

      const validNewMemberIds = idsNuevosMiembros.filter(id => id !== id_lider);
      if (validNewMemberIds.length > 0) {
        await transaction.participantes_grupo.createMany({
          data: validNewMemberIds.map(id_usuario => ({
            id_grupo: g.id_grupo, id_usuario, rol: "miembro"
          })),
          skipDuplicates: true
        });
      }

      return transaction.grupo.findUnique({
        where: { id_grupo: g.id_grupo },
        include: {
          usuario: { select: { id_usuario: true, nombre: true, apellido: true, mail: true } },
          participantes_grupo: {
            include: { usuario: { select: { id_usuario: true, nombre: true, apellido: true, mail: true } } }
          }
        }
      });
    });

    return res.status(201).json({
      id_grupo: grupoCreado.id_grupo, nombre: grupoCreado.nombre, descripcion: grupoCreado.descripcion,
      id_lider: grupoCreado.id_lider, lider: grupoCreado.usuario, rol_usuario: "admin",
      participantes: grupoCreado.participantes_grupo.map(p => ({
        id_usuario: p.usuario.id_usuario, nombre: p.usuario.nombre, apellido: p.usuario.apellido,
        mail: p.usuario.mail, rol: p.rol
      })),
      cantidad_miembros: grupoCreado.participantes_grupo.length + 1
    });
  } catch (error) {
    if (error.code === "P2002") return res.status(409).json({ message: "El nombre del grupo ya existe" });
    console.error("[groups] createGroupAdmin failed:", error);
    return res.status(500).json({ message: "Error creando grupo como admin", detail: error.message });
  }
}

async function updateGroupAdmin(req, res) {
  const idGrupo = Number(req.params.id_grupo);
  const { nombre, descripcion, id_lider, nuevos_miembros = [] } = req.body;

  if (!Number.isInteger(idGrupo) || idGrupo <= 0) return res.status(400).json({ message: 'id_grupo invalido' });
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) return res.status(400).json({ message: 'El nombre del grupo es requerido' });
  if (!Number.isInteger(id_lider) || id_lider <= 0) return res.status(400).json({ message: 'Se requiere un ID de líder válido' });

  try {
    const liderExistente = await prisma.usuario.findUnique({ where: { id_usuario: id_lider } });
    if (!liderExistente) return res.status(404).json({ message: 'Usuario asignado como líder no existe' });
    if (liderExistente.rol === 'admin') return res.status(400).json({ message: 'El administrador del sistema no puede ser administrador de un grupo' });

    const grupo = await prisma.grupo.findUnique({ where: { id_grupo: idGrupo } });
    if (!grupo) return res.status(404).json({ message: 'Grupo no encontrado' });

    const oldLiderId = grupo.id_lider;
    const idsNuevosMiembros = Array.isArray(nuevos_miembros) ? [...new Set(nuevos_miembros.map(Number).filter(v => Number.isInteger(v) && v > 0))] : [];

    const updatedGrupo = await prisma.$transaction(async transaction => {
      await transaction.grupo.update({
        where: { id_grupo: idGrupo },
        data: { nombre: nombre.trim(), descripcion: descripcion?.trim() || '', id_lider }
      });
      
      await transaction.participantes_grupo.deleteMany({
        where: { id_grupo: idGrupo, id_usuario: id_lider }
      });

      if (oldLiderId !== id_lider) {
        const yaEsta = await transaction.participantes_grupo.findUnique({
          where: { id_grupo_id_usuario: { id_grupo: idGrupo, id_usuario: oldLiderId } }
        });
        if (!yaEsta) {
          await transaction.participantes_grupo.create({
            data: { id_grupo: idGrupo, id_usuario: oldLiderId, rol: 'miembro' }
          });
        }
      }

      if (idsNuevosMiembros.length > 0) {
        const existingMembers = await transaction.participantes_grupo.findMany({
          where: { id_grupo: idGrupo }, select: { id_usuario: true }
        });
        const existingMemberIds = new Set(existingMembers.map(m => m.id_usuario));
        const validNewMemberIds = idsNuevosMiembros.filter(id => id !== id_lider && !existingMemberIds.has(id));
        
        if (validNewMemberIds.length > 0) {
          await transaction.participantes_grupo.createMany({
            data: validNewMemberIds.map(id_usuario => ({ id_grupo: idGrupo, id_usuario, rol: 'miembro' })),
            skipDuplicates: true
          });
        }
      }

      return transaction.grupo.findUnique({
        where: { id_grupo: idGrupo },
        include: {
          usuario: { select: { id_usuario: true, nombre: true, apellido: true, mail: true } },
          participantes_grupo: { include: { usuario: { select: { id_usuario: true, nombre: true, apellido: true, mail: true } } } }
        }
      });
    });

    return res.json({
      id_grupo: updatedGrupo.id_grupo, nombre: updatedGrupo.nombre, descripcion: updatedGrupo.descripcion,
      id_lider: updatedGrupo.id_lider, lider: updatedGrupo.usuario, rol_usuario: 'admin',
      participantes: updatedGrupo.participantes_grupo.map(p => ({
        id_usuario: p.usuario.id_usuario, nombre: p.usuario.nombre, apellido: p.usuario.apellido,
        mail: p.usuario.mail, rol: p.rol
      })),
      cantidad_miembros: updatedGrupo.participantes_grupo.length + 1
    });
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ message: 'El nombre del grupo ya existe' });
    console.error('[groups] updateGroupAdmin failed:', error);
    return res.status(500).json({ message: 'Error actualizando grupo como admin', detail: error.message });
  }
}

async function removeUserFromGroupAdmin(req, res) {
  const idGrupo = Number(req.params.id_grupo);
  const idUsuarioAEliminar = Number(req.params.id_usuario);

  if (!Number.isInteger(idGrupo) || idGrupo <= 0) return res.status(400).json({ message: 'id_grupo invalido' });
  if (!Number.isInteger(idUsuarioAEliminar) || idUsuarioAEliminar <= 0) return res.status(400).json({ message: 'id_usuario invalido' });

  try {
    const grupo = await prisma.grupo.findUnique({ where: { id_grupo: idGrupo } });
    if (!grupo) return res.status(404).json({ message: 'Grupo no encontrado' });
    if (idUsuarioAEliminar === grupo.id_lider) return res.status(400).json({ message: 'No se puede eliminar al líder del grupo' });

    const deleted = await prisma.participantes_grupo.deleteMany({
      where: { id_grupo: idGrupo, id_usuario: idUsuarioAEliminar }
    });

    if (deleted.count === 0) return res.status(404).json({ message: 'El usuario no está en el grupo' });

    return res.json({ ok: true, message: 'Usuario eliminado del grupo por el administrador' });
  } catch (error) {
    console.error('[groups] removeUserFromGroupAdmin failed:', error);
    return res.status(500).json({ message: 'Error eliminando usuario del grupo', detail: error.message });
  }
}

async function deleteGroupAdmin(req, res) {
  const idGrupo = Number(req.params.id_grupo);
  if (!Number.isInteger(idGrupo) || idGrupo <= 0) return res.status(400).json({ message: 'id_grupo invalido' });

  try {
    const grupo = await prisma.grupo.findUnique({ where: { id_grupo: idGrupo } });
    if (!grupo) return res.status(404).json({ message: 'Grupo no encontrado' });
    await prisma.grupo.delete({ where: { id_grupo: idGrupo } });
    return res.json({ ok: true, message: 'Grupo eliminado por el administrador' });
  } catch (error) {
    console.error('[groups] deleteGroupAdmin failed:', error);
    return res.status(500).json({ message: 'Error eliminando grupo como admin', detail: error.message });
  }
}

function isGroupLeader(userId, leaderId) {
  return Number(userId) === Number(leaderId);
}

module.exports = {
  getMyGroups, createGroup, updateGroup, getGroup, addUserToGroup, removeUserFromGroup, leaveGroup, deleteGroup, searchUsersToInvite,
  getAllGroupsAdmin, getEligibleLeadersAdmin, createGroupAdmin, updateGroupAdmin, removeUserFromGroupAdmin, deleteGroupAdmin,

  __testables: {
    isGroupLeader,
  }
};


