const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getPhotosByBien, setPrimaryPhoto, deletePhoto } = require('../controllers/photoController');
const prisma = require('../config/database');

// Configuration Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/biens/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'bien-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

// Upload multiple photos
router.post('/upload/:bienId', upload.array('photos', 10), async (req, res) => {
  try {
    const { bienId } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'Aucune photo fournie' });
    }

    const photos = await Promise.all(
      req.files.map(async (file, index) => {
        return prisma.photo.create({
          data: {
            filename: file.filename,
            url: `/uploads/biens/${file.filename}`,
            bienId: bienId,
            isPrimary: index === 0, // Première photo = principale
            ordre: index,
          },
        });
      })
    );

    res.status(201).json({ success: true, data: photos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Erreur lors de l\'upload' });
  }
});

router.get('/bien/:bienId', getPhotosByBien);
router.put('/:id/primary', setPrimaryPhoto);
router.delete('/:id', deletePhoto);

module.exports = router;