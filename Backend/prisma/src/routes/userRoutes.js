const express = require("express");
const router = express.Router();
const { getUsers, createUser, loginUser, testEndpoint } = require("../controllers/userController");
const { requireAuth } = require("../middleware/auth");

router.get("/", requireAuth, getUsers); // protegido
router.post("/", createUser);
router.post("/login", loginUser);
router.get("/test", testEndpoint); // endpoint de prueba público

module.exports = router;