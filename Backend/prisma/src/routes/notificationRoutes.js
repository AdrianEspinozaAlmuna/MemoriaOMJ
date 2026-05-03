const express = require("express");
const router = express.Router();
const {
  listMyNotifications,
  listAdminNotifications,
  countUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createBroadcastNotification,
  createDirectNotification
} = require("../controllers/notificationController");
const { requireAuth, requireRole } = require("../middleware/auth");

router.get("/", requireAuth, listMyNotifications);
router.get("/unread-count", requireAuth, countUnreadNotifications);
router.patch("/read-all", requireAuth, markAllNotificationsAsRead);
router.patch("/:id_notificacion/read", requireAuth, markNotificationAsRead);

router.get("/admin", requireAuth, requireRole("admin"), listAdminNotifications);
router.post("/broadcast", requireAuth, requireRole("admin"), createBroadcastNotification);
router.post("/direct", requireAuth, createDirectNotification);

module.exports = router;