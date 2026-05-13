const express = require("express");
const router = express.Router();
const {
  getActivityImages,
  getActivityImageByType,
  uploadActivityImage,
  deleteActivityImage
} = require("../controllers/imageController");
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      return cb(new Error("Solo se permiten archivos de imagen"));
    }
    cb(null, true);
  }
});
const { uploadActivityImageFile } = require("../controllers/imageController");
const { requireAuth, requireRole } = require("../middleware/auth");

// GET /api/imagenes
router.get("/", getActivityImages);

// GET /api/imagenes/:tipo
router.get("/:tipo", getActivityImageByType);

// POST /api/imagenes (solo admin)
router.post("/", requireAuth, requireRole("admin"), uploadActivityImage);

// POST /api/imagenes/upload (solo admin) -> recibe file multipart/form-data
router.post("/upload", requireAuth, requireRole("admin"), upload.single("file"), uploadActivityImageFile);

// DELETE /api/imagenes/:tipo (solo admin)
router.delete("/:tipo", requireAuth, requireRole("admin"), deleteActivityImage);

module.exports = router;
