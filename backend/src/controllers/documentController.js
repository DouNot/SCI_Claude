const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

// ============================================
// HELPERS
// ============================================

/**
 * Vérifier qu'un bien appartient à un Space
 */
async function verifyBienInSpace(bienId, spaceId) {
  const bien = await prisma.bien.findUnique({
    where: { id: bienId },
    select: { spaceId: true }
  });
  
  if (!bien) {
    throw new Error('BIEN_NOT_FOUND');
  }
  
  if (bien.spaceId !== spaceId) {
    throw new Error('BIEN_NOT_IN_SPACE');
  }
  
  return true;
}

// ============================================
// CONTROLLERS
// ============================================

// @desc    Récupérer tous les documents d'un Space
// @route   GET /api/documents OU GET /api/spaces/:spaceId/documents
// @access  Auth + Space
exports.getAllDocuments = asyncHandler(async (req, res) => {
  const spaceId = req.params.spaceId || req.query.spaceId;
  
  if (!spaceId) {
    return res.status(400).json({
      success: false,
      error: 'Space ID requis',
      code: 'SPACE_ID_REQUIRED'
    });
  }
  
  const documents = await prisma.document.findMany({
    where: {
      bien: {
        spaceId: spaceId
      }
    },
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
// @access  Auth + Space
exports.getDocumentsByBien = asyncHandler(async (req, res) => {
  const { bienId } = req.params;
  const spaceId = req.params.spaceId || req.query.spaceId;
  
  // Vérifier que le bien appartient au Space
  if (spaceId) {
    try {
      await verifyBienInSpace(bienId, spaceId);
    } catch (error) {
      if (error.message === 'BIEN_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: 'Bien non trouvé',
        });
      }
      return res.status(403).json({
        success: false,
        error: 'Ce bien n\'appartient pas à cet espace',
        code: 'BIEN_NOT_IN_SPACE'
      });
    }
  }

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
// @access  Auth + Space
exports.getDocumentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const spaceId = req.params.spaceId || req.query.spaceId;

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
  
  // Vérifier que le document appartient au Space
  if (spaceId && document.bien.spaceId !== spaceId) {
    return res.status(403).json({
      success: false,
      error: 'Ce document n\'appartient pas à cet espace',
      code: 'DOCUMENT_NOT_IN_SPACE'
    });
  }

  res.status(200).json({
    success: true,
    data: document,
  });
});

// @desc    Créer un nouveau document
// @route   POST /api/documents OU POST /api/spaces/:spaceId/documents
// @access  Auth + Space (MEMBER minimum)
exports.createDocument = asyncHandler(async (req, res) => {
  const data = req.body;
  const spaceId = req.params.spaceId || req.body.spaceId;

  // Validation basique
  if (!data.nom || !data.type || !data.bienId) {
    return res.status(400).json({
      success: false,
      error: 'Champs requis manquants (nom, type, bienId)',
    });
  }
  
  // Vérifier que le bien appartient au Space
  if (spaceId) {
    try {
      await verifyBienInSpace(data.bienId, spaceId);
    } catch (error) {
      if (error.message === 'BIEN_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: 'Bien non trouvé',
        });
      }
      return res.status(403).json({
        success: false,
        error: 'Ce bien n\'appartient pas à cet espace',
        code: 'BIEN_NOT_IN_SPACE'
      });
    }
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
// @access  Auth + Space (MEMBER minimum)
exports.updateDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const spaceId = req.params.spaceId || req.body.spaceId;

  const documentExistant = await prisma.document.findUnique({
    where: { id },
    include: {
      bien: { select: { spaceId: true } }
    }
  });

  if (!documentExistant) {
    return res.status(404).json({
      success: false,
      error: 'Document non trouvé',
    });
  }
  
  // Vérifier que le document appartient au Space
  if (spaceId && documentExistant.bien.spaceId !== spaceId) {
    return res.status(403).json({
      success: false,
      error: 'Ce document n\'appartient pas à cet espace',
      code: 'DOCUMENT_NOT_IN_SPACE'
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
  delete dataToUpdate.bien;
  delete dataToUpdate.spaceId;

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
// @access  Auth + Space (MEMBER minimum)
exports.deleteDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const spaceId = req.params.spaceId || req.query.spaceId;

  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      bien: { select: { spaceId: true } }
    }
  });

  if (!document) {
    return res.status(404).json({
      success: false,
      error: 'Document non trouvé',
    });
  }
  
  // Vérifier que le document appartient au Space
  if (spaceId && document.bien.spaceId !== spaceId) {
    return res.status(403).json({
      success: false,
      error: 'Ce document n\'appartient pas à cet espace',
      code: 'DOCUMENT_NOT_IN_SPACE'
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
