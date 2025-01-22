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
    const documentations = await Documentation.find()
      .sort({ date: -1 });
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

    const documentation = await Documentation.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!documentation) {
      return res.status(404).json({ message: 'Dokumentasi tidak ditemukan' });
    }
    res.json({
      success: true,
      message: "Dokumentasi berhasil diupdate",
      documentation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete documentation
const deleteDocumentation = async (req, res) => {
  const { id } = req.params;
  try {
    const documentation = await Documentation.findByIdAndDelete(id);
    if (!documentation) {
      return res.status(404).json({ message: 'Dokumentasi tidak ditemukan' });
    }
    res.json({ 
      success: true,
      message: 'Dokumentasi berhasil dihapus' 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDocumentation,
  getAllDocumentations,
  updateDocumentation,
  deleteDocumentation
}; 