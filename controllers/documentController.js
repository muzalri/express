const Document = require("../models/documentModel");
const User = require("../models/userModel");
const path = require("path");
const fs = require("fs");

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No PDF file uploaded",
      });
    }

    const { title, reportDate } = req.body;
    const pdfFile = req.file;

    // Create document record in database
    const document = await Document.create({
      title,
      filename: pdfFile.filename,
      filepath: `/uploads/documents/${pdfFile.filename}`, // Keep this the same as it's the URL path
      type: "pdf",
      uploadedBy: req.user.id,
      reportDate: reportDate || null,
    });

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      document,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading document",
      error: error.message,
    });
  }
};

const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      attributes: ["id", "title", "filename", "createdAt"],
      include: [
        {
          model: User,
          as: "uploader",
          attributes: ["name"], // Only include uploader name for public view
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!documents) {
      return res.status(404).json({
        success: false,
        message: "No documents found",
      });
    }

    res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching documents",
      error: error.message,
    });
  }
};

const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Perbaiki path ke public/uploads/documents
    const filepath = path.join(
      __dirname,
      "..",
      "public",
      "uploads",
      "documents",
      path.basename(document.filename)
    );

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        message: "File not found on server",
      });
    }

    res.download(filepath, document.filename);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading document",
      error: error.message,
    });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findByPk(id);
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Dokumen tidak ditemukan" });
    }
    // Hapus file fisik jika ada
    const filePath = path.join(__dirname, "../public", document.filepath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await document.destroy();
    res.json({ success: true, message: "Dokumen berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadDocument,
  getAllDocuments,
  downloadDocument,
  deleteDocument,
};
