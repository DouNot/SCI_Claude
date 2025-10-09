const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration Multer pour l'upload des PV
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/pv-ag/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'pv-ag-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype === 'application/pdf' || 
                   file.mimetype === 'application/msword' || 
                   file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF, DOC et DOCX sont autorisés'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter
});

// @desc    Récupérer toutes les AG
// @route   GET /api/assemblees-generales
// @access  Public
exports.getAllAG = asyncHandler(async (req, res) => {
  const compteId = process.env.DEFAULT_COMPTE_ID;
  
  const ags = await prisma.assembleeGenerale.findMany({
    where: { compteId },
    orderBy: { dateAG: 'desc' }
  });

  res.status(200).json({
    success: true,
    count: ags.length,
    data: ags
  });
});

// @desc    Récupérer une AG par ID
// @route   GET /api/assemblees-generales/:id
// @access  Public
exports.getAGById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ag = await prisma.assembleeGenerale.findUnique({
    where: { id }
  });

  if (!ag) {
    return res.status(404).json({
      success: false,
      error: 'Assemblée générale non trouvée'
    });
  }

  res.status(200).json({
    success: true,
    data: ag
  });
});

// @desc    Créer une nouvelle AG avec upload du PV
// @route   POST /api/assemblees-generales
// @access  Public
exports.createAG = [
  upload.single('pv'),
  asyncHandler(async (req, res) => {
    const { type, dateAG, titre, description } = req.body;
    const compteId = process.env.DEFAULT_COMPTE_ID;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucun fichier fourni'
      });
    }

    if (!type || !dateAG) {
      return res.status(400).json({
        success: false,
        error: 'Type et date de l\'AG sont requis'
      });
    }

    const ag = await prisma.assembleeGenerale.create({
      data: {
        type,
        dateAG: new Date(dateAG),
        titre: titre || null,
        description: description || null,
        url: `/uploads/pv-ag/${req.file.filename}`,
        filename: req.file.filename,
        compteId
      }
    });

    res.status(201).json({
      success: true,
      data: ag
    });
  })
];

// @desc    Mettre à jour une AG
// @route   PUT /api/assemblees-generales/:id
// @access  Public
exports.updateAG = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, dateAG, titre, description } = req.body;

  const agExistante = await prisma.assembleeGenerale.findUnique({
    where: { id }
  });

  if (!agExistante) {
    return res.status(404).json({
      success: false,
      error: 'Assemblée générale non trouvée'
    });
  }

  const dataToUpdate = {};
  if (type) dataToUpdate.type = type;
  if (dateAG) dataToUpdate.dateAG = new Date(dateAG);
  if (titre !== undefined) dataToUpdate.titre = titre || null;
  if (description !== undefined) dataToUpdate.description = description || null;

  const ag = await prisma.assembleeGenerale.update({
    where: { id },
    data: dataToUpdate
  });

  res.status(200).json({
    success: true,
    data: ag
  });
});

// @desc    Supprimer une AG
// @route   DELETE /api/assemblees-generales/:id
// @access  Public
exports.deleteAG = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ag = await prisma.assembleeGenerale.findUnique({
    where: { id }
  });

  if (!ag) {
    return res.status(404).json({
      success: false,
      error: 'Assemblée générale non trouvée'
    });
  }

  // Supprimer le fichier du disque
  const filePath = path.join(__dirname, '../../', ag.url);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await prisma.assembleeGenerale.delete({
    where: { id }
  });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Assemblée générale supprimée avec succès'
  });
});

exports.upload = upload;
