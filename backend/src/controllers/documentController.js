const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Récupérer tous les documents
// @route   GET /api/documents
// @access  Public
exports.getAllDocuments = asyncHandler(async (req, res) => {
  const documents = await prisma.document.findMany({
    include: {
      bien: {
        select: {
          id: true,
          adresse: true,
          ville: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    count: documents.length,
    data: documents,
  });
});

// @desc    Récupérer les documents d'un bien
// @route   GET /api/documents/bien/:bienId
// @access  Public
exports.getDocumentsByBien = asyncHandler(async (req, res) => {
  const { bienId } = req.params;

  const documents = await prisma.document.findMany({
    where: { bienId },
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    count: documents.length,
    data: documents,
  });
});

// @desc    Récupérer un document par ID
// @route   GET /api/documents/:id
// @access  Public
exports.getDocumentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      bien: true,
    },
  });

  if (!document) {
    return res.status(404).json({
      success: false,
      error: 'Document non trouvé',
    });
  }

  res.status(200).json({
    success: true,
    data: document,
  });
});

// @desc    Créer un nouveau document
// @route   POST /api/documents
// @access  Public
exports.createDocument = asyncHandler(async (req, res) => {
  const data = req.body;

  // Validation basique
  if (!data.nom || !data.type || !data.bienId) {
    return res.status(400).json({
      success: false,
      error: 'Champs requis manquants (nom, type, bienId)',
    });
  }

  // Nettoyer les données
  const dataToCreate = { ...data };

  // Gérer le fichier uploadé
  if (req.file) {
    dataToCreate.filename = req.file.filename;
    dataToCreate.url = `/uploads/documents/${req.file.filename}`;
  }

  // Dates
  if (dataToCreate.dateDocument && dataToCreate.dateDocument !== '') {
    dataToCreate.dateDocument = new Date(dataToCreate.dateDocument);
  } else {
    dataToCreate.dateDocument = null;
  }

  if (dataToCreate.dateExpiration && dataToCreate.dateExpiration !== '') {
    dataToCreate.dateExpiration = new Date(dataToCreate.dateExpiration);
  } else {
    dataToCreate.dateExpiration = null;
  }

  const document = await prisma.document.create({
    data: dataToCreate,
    include: {
      bien: true,
    },
  });

  res.status(201).json({
    success: true,
    data: document,
  });
});

// @desc    Mettre à jour un document
// @route   PUT /api/documents/:id
// @access  Public
exports.updateDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const documentExistant = await prisma.document.findUnique({
    where: { id },
  });

  if (!documentExistant) {
    return res.status(404).json({
      success: false,
      error: 'Document non trouvé',
    });
  }

  const dataToUpdate = { ...data };

  // Dates
  if (dataToUpdate.dateDocument && dataToUpdate.dateDocument !== '') {
    dataToUpdate.dateDocument = new Date(dataToUpdate.dateDocument);
  } else if (dataToUpdate.dateDocument === '') {
    dataToUpdate.dateDocument = null;
  }

  if (dataToUpdate.dateExpiration && dataToUpdate.dateExpiration !== '') {
    dataToUpdate.dateExpiration = new Date(dataToUpdate.dateExpiration);
  } else if (dataToUpdate.dateExpiration === '') {
    dataToUpdate.dateExpiration = null;
  }

  // Supprimer champs non modifiables
  delete dataToUpdate.bienId;
  delete dataToUpdate.url;
  delete dataToUpdate.filename;
  delete dataToUpdate.id;
  delete dataToUpdate.createdAt;

  const document = await prisma.document.update({
    where: { id },
    data: dataToUpdate,
    include: {
      bien: true,
    },
  });

  res.status(200).json({
    success: true,
    data: document,
  });
});

// @desc    Supprimer un document
// @route   DELETE /api/documents/:id
// @access  Public
exports.deleteDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const document = await prisma.document.findUnique({
    where: { id },
  });

  if (!document) {
    return res.status(404).json({
      success: false,
      error: 'Document non trouvé',
    });
  }

  // TODO: Supprimer le fichier physique du serveur si nécessaire
  // const fs = require('fs');
  // const path = require('path');
  // if (document.filename) {
  //   fs.unlinkSync(path.join(__dirname, '../../uploads/documents/', document.filename));
  // }

  await prisma.document.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Document supprimé avec succès',
  });
});