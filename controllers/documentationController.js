const Documentation = require('../models/documentationModel');

// Create documentation
const createDocumentation = async (req, res) => {
  try {
    const { title, date } = req.body;
    
    // Mengambil path file yang diupload
    const images = req.files.map(file => `/uploads/${file.filename}`);

    if (images.length === 0) {
      return res.status(400).json({ 
        message: "Minimal satu gambar harus diunggah" 
      });
    }

    const documentation = await Documentation.create({
      title,
      images,
      date: date ? new Date(date) : new Date()
    });

    res.status(201).json({
      success: true,
      message: "Dokumentasi berhasil dibuat",
      documentation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all documentations
const getAllDocumentations = async (req, res) => {
  try {
    const documentations = await Documentation.findAll({
      order: [['date', 'DESC']]
    });
    res.status(200).json(documentations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update documentation
const updateDocumentation = async (req, res) => {
  const { id } = req.params;
  try {
    let updateData = { ...req.body };
    
    // Jika ada file baru diupload
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => `/uploads/${file.filename}`);
    }

    const documentation = await Documentation.update(updateData, {
      where: { id },
      returning: true
    });

    if (!documentation[0]) {
      return res.status(404).json({ message: 'Dokumentasi tidak ditemukan' });
    }

    const updatedDoc = await Documentation.findByPk(id);
    
    res.json({
      success: true,
      message: "Dokumentasi berhasil diupdate",
      documentation: updatedDoc
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete documentation
const deleteDocumentation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const documentation = await Documentation.findByPk(id);
    if (!documentation) {
      return res.status(404).json({ 
        success: false,
        message: 'Dokumentasi tidak ditemukan' 
      });
    }

    await documentation.destroy();

    res.status(200).json({ 
      success: true,
      message: 'Dokumentasi berhasil dihapus' 
    });
  } catch (error) {
    console.error('Error deleting documentation:', error);
    res.status(500).json({ 
      success: false,
      message: 'Gagal menghapus dokumentasi',
      error: error.message 
    });
  }
};

module.exports = {
  createDocumentation,
  getAllDocumentations,
  updateDocumentation,
  deleteDocumentation
}; 