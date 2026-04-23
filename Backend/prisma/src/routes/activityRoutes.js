const express = require("express");
const router = express.Router();
const {
  listActivities,
  listAdminActivities,
  getActivityById,
  createActivity,
  enrollInActivity,
  cancelEnrollment,
  markMyAttendance,
  markParticipantAttendance,
  removeParticipant,
  rateActivity,
  reviewActivity,
  cancelActivity
} = require("../controllers/activityController");
const { requireAuth, requireRole } = require("../middleware/auth");

router.get("/", requireAuth, listActivities);
router.get("/admin", requireAuth, requireRole("admin"), listAdminActivities);
router.get("/:id_actividad", requireAuth, getActivityById);

router.post("/", requireAuth, requireRole("participante", "admin"), createActivity);
router.patch("/:id_actividad/review", requireAuth, requireRole("admin"), reviewActivity);
router.patch("/:id_actividad/cancel", requireAuth, requireRole("participante", "admin", "encargado"), cancelActivity);
router.patch("/:id_actividad/attendance", requireAuth, requireRole("participante", "admin", "encargado"), markMyAttendance);
router.patch("/:id_actividad/participants/:id_usuario/attendance", requireAuth, requireRole("participante", "admin", "encargado"), markParticipantAttendance);
router.delete("/:id_actividad/participants/:id_usuario", requireAuth, requireRole("participante", "admin", "encargado"), removeParticipant);
router.patch("/:id_actividad/rating", requireAuth, requireRole("participante", "admin", "encargado"), rateActivity);
router.post("/:id_actividad/enroll", requireAuth, requireRole("participante", "admin", "encargado"), enrollInActivity);
router.delete("/:id_actividad/enroll", requireAuth, requireRole("participante", "admin", "encargado"), cancelEnrollment);

module.exports = router;
