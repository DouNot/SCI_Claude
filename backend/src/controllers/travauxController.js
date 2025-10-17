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

// @desc    Récupérer tous les travaux d'un Space
// @route   GET /api/travaux OU GET /api/spaces/:spaceId/travaux
// @access  Auth + Space
exports.getAllTravaux = asyncHandler(async (req, res) => {
  const spaceId = req.params.spaceId || req.query.spaceId;
  
  if (!spaceId) {
    return res.status(400).json({
      success: false,
      error: 'Space ID requis',
      code: 'SPACE_ID_REQUIRED'
    });
  }
  
  const travaux = await prisma.travaux.findMany({
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
      dateDebut: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    count: travaux.length,
    data: travaux,
  });
});

// @desc    Récupérer les travaux d'un bien
// @route   GET /api/travaux/bien/:bienId
// @access  Auth + Space
exports.getTravauxByBien = asyncHandler(async (req, res) => {
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

  const travaux = await prisma.travaux.findMany({
    where: { bienId },
    orderBy: {
      dateDebut: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    count: travaux.length,
    data: travaux,
  });
});

// @desc    Récupérer un travaux par ID
// @route   GET /api/travaux/:id
// @access  Auth + Space
exports.getTravauxById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const spaceId = req.params.spaceId || req.query.spaceId;

  const travaux = await prisma.travaux.findUnique({
    where: { id },
    include: {
      bien: true,
    },
  });

  if (!travaux) {
    return res.status(404).json({
      success: false,
      error: 'Travaux non trouvés',
    });
  }
  
  // Vérifier que les travaux appartiennent au Space
  if (spaceId && travaux.bien.spaceId !== spaceId) {
    return res.status(403).json({
      success: false,
      error: 'Ces travaux n\'appartiennent pas à cet espace',
      code: 'TRAVAUX_NOT_IN_SPACE'
    });
  }

  res.status(200).json({
    success: true,
    data: travaux,
  });
});

// @desc    Créer de nouveaux travaux
// @route   POST /api/travaux OU POST /api/spaces/:spaceId/travaux
// @access  Auth + Space (MEMBER minimum)
exports.createTravaux = asyncHandler(async (req, res) => {
  const data = req.body;
  const spaceId = req.params.spaceId || req.body.spaceId;

  // Validation basique
  if (!data.titre || !data.dateDebut || !data.etat || !data.type || !data.bienId) {
    return res.status(400).json({
      success: false,
      error: 'Champs requis manquants (titre, dateDebut, etat, type, bienId)',
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

  // Convertir numériques
  if (dataToCreate.coutEstime) {
    dataToCreate.coutEstime = parseFloat(dataToCreate.coutEstime);
  }
  if (dataToCreate.coutReel === '' || !dataToCreate.coutReel) {
    dataToCreate.coutReel = null;
  } else {
    dataToCreate.coutReel = parseFloat(dataToCreate.coutReel);
  }

  // Dates
  if (dataToCreate.dateDebut) {
    dataToCreate.dateDebut = new Date(dataToCreate.dateDebut);
  }
  if (dataToCreate.dateFin === '' || !dataToCreate.dateFin) {
    dataToCreate.dateFin = null;
  } else {
    dataToCreate.dateFin = new Date(dataToCreate.dateFin);
  }

  // Champs optionnels
  if (dataToCreate.description === '') dataToCreate.description = null;
  if (dataToCreate.artisan === '') dataToCreate.artisan = null;
  if (dataToCreate.telephone === '') dataToCreate.telephone = null;
  if (dataToCreate.categorie === '') dataToCreate.categorie = null;
  
  // Supprimer spaceId (pas dans le modèle Travaux)
  delete dataToCreate.spaceId;

  const travaux = await prisma.travaux.create({
    data: dataToCreate,
    include: {
      bien: true,
    },
  });

  res.status(201).json({
    success: true,
    data: travaux,
  });
});

// @desc    Mettre à jour des travaux
// @route   PUT /api/travaux/:id
// @access  Auth + Space (MEMBER minimum)
exports.updateTravaux = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const spaceId = req.params.spaceId || req.body.spaceId;

  const travauxExistants = await prisma.travaux.findUnique({
    where: { id },
    include: {
      bien: { select: { spaceId: true } }
    }
  });

  if (!travauxExistants) {
    return res.status(404).json({
      success: false,
      error: 'Travaux non trouvés',
    });
  }
  
  // Vérifier que les travaux appartiennent au Space
  if (spaceId && travauxExistants.bien.spaceId !== spaceId) {
    return res.status(403).json({
      success: false,
      error: 'Ces travaux n\'appartiennent pas à cet espace',
      code: 'TRAVAUX_NOT_IN_SPACE'
    });
  }

  const dataToUpdate = { ...data };

  // Convertir numériques
  if (dataToUpdate.coutEstime) {
    dataToUpdate.coutEstime = parseFloat(dataToUpdate.coutEstime);
  }
  if (dataToUpdate.coutReel === '' || !dataToUpdate.coutReel) {
    dataToUpdate.coutReel = null;
  } else if (dataToUpdate.coutReel) {
    dataToUpdate.coutReel = parseFloat(dataToUpdate.coutReel);
  }

  // Dates
  if (dataToUpdate.dateDebut && dataToUpdate.dateDebut !== '') {
    dataToUpdate.dateDebut = new Date(dataToUpdate.dateDebut);
  }
  if (dataToUpdate.dateFin === '' || !dataToUpdate.dateFin) {
    dataToUpdate.dateFin = null;
  } else if (dataToUpdate.dateFin) {
    dataToUpdate.dateFin = new Date(dataToUpdate.dateFin);
  }

  // Champs optionnels
  if (dataToUpdate.description === '') dataToUpdate.description = null;
  if (dataToUpdate.artisan === '') dataToUpdate.artisan = null;
  if (dataToUpdate.telephone === '') dataToUpdate.telephone = null;
  if (dataToUpdate.categorie === '') dataToUpdate.categorie = null;

  // Supprimer champs non modifiables
  delete dataToUpdate.id;
  delete dataToUpdate.createdAt;
  delete dataToUpdate.updatedAt;
  delete dataToUpdate.bien;
  delete dataToUpdate.spaceId;

  const travaux = await prisma.travaux.update({
    where: { id },
    data: dataToUpdate,
    include: {
      bien: true,
    },
  });

  res.status(200).json({
    success: true,
    data: travaux,
  });
});

// @desc    Supprimer des travaux
// @route   DELETE /api/travaux/:id
// @access  Auth + Space (MEMBER minimum)
exports.deleteTravaux = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const spaceId = req.params.spaceId || req.query.spaceId;

  const travaux = await prisma.travaux.findUnique({
    where: { id },
    include: {
      bien: { select: { spaceId: true } }
    }
  });

  if (!travaux) {
    return res.status(404).json({
      success: false,
      error: 'Travaux non trouvés',
    });
  }
  
  // Vérifier que les travaux appartiennent au Space
  if (spaceId && travaux.bien.spaceId !== spaceId) {
    return res.status(403).json({
      success: false,
      error: 'Ces travaux n\'appartiennent pas à cet espace',
      code: 'TRAVAUX_NOT_IN_SPACE'
    });
  }

  await prisma.travaux.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Travaux supprimés avec succès',
  });
});
