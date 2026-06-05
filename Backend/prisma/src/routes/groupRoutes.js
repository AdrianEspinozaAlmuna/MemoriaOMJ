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
  searchUsersToInvite,
  getAllGroupsAdmin,
  getEligibleLeadersAdmin,
  createGroupAdmin,
  updateGroupAdmin,
  removeUserFromGroupAdmin,
  deleteGroupAdmin
} = require("../controllers/groupController");
const { requireAuth, requireRole } = require("../middleware/auth");

// --- ADMIN ROUTES ---
router.get("/admin/all", requireAuth, requireRole("admin"), getAllGroupsAdmin);
router.get("/admin/eligible-leaders", requireAuth, requireRole("admin"), getEligibleLeadersAdmin);
router.post("/admin", requireAuth, requireRole("admin"), createGroupAdmin);
router.patch("/admin/:id_grupo", requireAuth, requireRole("admin"), updateGroupAdmin);
router.delete("/admin/:id_grupo/members/:id_usuario", requireAuth, requireRole("admin"), removeUserFromGroupAdmin);
router.delete("/admin/:id_grupo", requireAuth, requireRole("admin"), deleteGroupAdmin);

// --- USER ROUTES ---
router.get("/", requireAuth, getMyGroups);
router.post("/", requireAuth, createGroup);
router.patch("/:id_grupo", requireAuth, updateGroup);
router.get("/:id_grupo", requireAuth, getGroup);
router.get("/:id_grupo/search-users", requireAuth, searchUsersToInvite);
router.post("/:id_grupo/members", requireAuth, addUserToGroup);
router.delete("/:id_grupo/members", requireAuth, removeUserFromGroup);
router.post("/:id_grupo/leave", requireAuth, leaveGroup);
router.delete("/:id_grupo", requireAuth, deleteGroup);

module.exports = router;
