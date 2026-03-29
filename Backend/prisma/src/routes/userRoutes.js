const express = require("express");
const router = express.Router();
const { getUsers, createUser, loginUser, getMe, getMyActivityRole, testEndpoint } = require("../controllers/userController");
const { requireAuth, requireRole, requireActivityRole } = require("../middleware/auth");

router.get("/", requireAuth, requireRole("admin"), getUsers);
router.post("/", createUser);
router.post("/login", loginUser);
router.get("/me", requireAuth, getMe);
router.get(
	"/activity/:id_actividad/role",
	requireAuth,
	requireActivityRole("encargado", "participante"),
	getMyActivityRole
);
router.get("/test", testEndpoint); // endpoint de prueba público

module.exports = router;