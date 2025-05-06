const Document = require('../models/documentModel');
const User = require('../models/userModel');
const path = require('path');
const fs = require('fs');

const uploadDocument = async (req, res) => {
  try {
    if (!req.files || !req.files.pdf) {
      return res.status(400).json({ 
        success: false, 
        message: 'No PDF file uploaded' 
      });
    }

    const pdfFile = req.files.pdf;
    const { title } = req.body;

    // Validate file type
    if (pdfFile.mimetype !== 'application/pdf') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only PDF files are allowed' 
      });
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads/documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const filename = `${Date.now()}-${pdfFile.name}`;
    const filepath = path.join(uploadDir, filename);

    // Move file to upload directory
    await pdfFile.mv(filepath);

    // Save document info to database
    const document = await Document.create({
      title,
      filename,
      filepath: `/uploads/documents/${filename}`,
      type: 'pdf',
      uploadedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message
    });
  }
};

const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      attributes: ['id', 'title', 'filename', 'createdAt'],
      include: [{
        model: User,
        as: 'uploader',
        attributes: ['name'] // Only include uploader name for public view
      }],
      order: [['createdAt', 'DESC']]
    });

    if (!documents) {
      return res.status(404).json({
        success: false,
        message: 'No documents found'
      });
    }

    res.status(200).json({
      success: true,
      documents
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching documents',
      error: error.message
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
        message: 'Document not found'
      });
    }

    const filepath = path.join(__dirname, '..', 'uploads', 'documents', path.basename(document.filename));
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    res.download(filepath, document.filename);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading document',
      error: error.message
    });
  }
};
 
module.exports = {
  uploadDocument,
  getAllDocuments,
  downloadDocument
};
