const express = require("express");
const router = express.Router();
const {
  getMyGroups,
  createGroup,
  updateGroup,
  getGroup,
  addUserToGroup,
  removeUserFromGroup,
  leaveGroup,
  deleteGroup,
  searchUsersToInvite
} = require("../controllers/groupController");
const { requireAuth } = require("../middleware/auth");

// Obtener todos los grupos del usuario
router.get("/", requireAuth, getMyGroups);

// Crear nuevo grupo
router.post("/", requireAuth, createGroup);

// Editar grupo
router.patch("/:id_grupo", requireAuth, updateGroup);

// Obtener detalles de un grupo
router.get("/:id_grupo", requireAuth, getGroup);

// Buscar usuarios para invitar
router.get("/:id_grupo/search-users", requireAuth, searchUsersToInvite);

// Agregar usuario al grupo
router.post("/:id_grupo/members", requireAuth, addUserToGroup);

// Eliminar usuario del grupo
router.delete("/:id_grupo/members", requireAuth, removeUserFromGroup);

// Salir del grupo
router.post("/:id_grupo/leave", requireAuth, leaveGroup);

// Eliminar grupo
router.delete("/:id_grupo", requireAuth, deleteGroup);

module.exports = router;
