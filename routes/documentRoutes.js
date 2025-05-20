const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");
const documentUpload = require("../middleware/documentUploadMiddleware");
const {
  uploadDocument,
  getAllDocuments,
  downloadDocument,
  deleteDocument,
} = require("../controllers/documentController");

// Public routes
router.get("/", getAllDocuments);
router.get("/download/:id", downloadDocument);

// Admin only route - using document-specific upload middleware
router.post(
  "/upload",
  protect,
  isAdmin,
  documentUpload.single("pdf"),
  uploadDocument
);
router.delete("/:id", protect, isAdmin, deleteDocument);

module.exports = router;
