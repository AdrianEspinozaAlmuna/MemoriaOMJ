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

// Registrar token FCM desde cliente
router.post("/tokens", requireAuth, async (req, res, next) => {
  try {
    const controller = require("../controllers/notificationController");
    return controller.registerFcmToken(req, res);
  } catch (err) {
    return next(err);
  }
});

// Enviar push (solo admin) - usa firebase-admin
router.post("/send", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const controller = require("../controllers/notificationController");
    return controller.adminSendPush(req, res);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;