const express = require("express");
const router = express.Router();
const {
  listActivities,
  listAdminActivities,
  getActivityById,
  createActivity,
  enrollInActivity,
  cancelEnrollment,
  reviewActivity
} = require("../controllers/activityController");
const { requireAuth, requireRole } = require("../middleware/auth");

router.get("/", requireAuth, listActivities);
router.get("/admin", requireAuth, requireRole("admin"), listAdminActivities);
router.get("/:id_actividad", requireAuth, getActivityById);

router.post("/", requireAuth, requireRole("participante", "admin"), createActivity);
router.patch("/:id_actividad/review", requireAuth, requireRole("admin"), reviewActivity);
router.post("/:id_actividad/enroll", requireAuth, requireRole("participante", "admin"), enrollInActivity);
router.delete("/:id_actividad/enroll", requireAuth, requireRole("participante", "admin"), cancelEnrollment);

module.exports = router;
