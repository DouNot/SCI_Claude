const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const path = require('path');

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

// @desc    Récupérer toutes les factures d'un Space
// @route   GET /api/factures OU GET /api/spaces/:spaceId/factures
// @access  Auth + Space
exports.getAllFactures = asyncHandler(async (req, res) => {
  const spaceId = req.params.spaceId || req.query.spaceId;
  
  if (!spaceId) {
    return res.status(400).json({
      success: false,
      error: 'Space ID requis',
      code: 'SPACE_ID_REQUIRED'
    });
  }
  
  const factures = await prisma.facture.findMany({
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
      dateFacture: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    count: factures.length,
    data: factures,
  });
});

// @desc    Récupérer les factures d'un bien
// @route   GET /api/factures/bien/:bienId
// @access  Auth + Space
exports.getFacturesByBien = asyncHandler(async (req, res) => {
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

  const factures = await prisma.facture.findMany({
    where: { bienId },
    orderBy: {
      dateFacture: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    count: factures.length,
    data: factures,
  });
});

// @desc    Récupérer une facture par ID
// @route   GET /api/factures/:id
// @access  Auth + Space
exports.getFactureById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const spaceId = req.params.spaceId || req.query.spaceId;

  const facture = await prisma.facture.findUnique({
    where: { id },
    include: {
      bien: true,
    },
  });

  if (!facture) {
    return res.status(404).json({
      success: false,
      error: 'Facture non trouvée',
    });
  }
  
  // Vérifier que la facture appartient au Space
  if (spaceId && facture.bien.spaceId !== spaceId) {
    return res.status(403).json({
      success: false,
      error: 'Cette facture n\'appartient pas à cet espace',
      code: 'FACTURE_NOT_IN_SPACE'
    });
  }

  res.status(200).json({
    success: true,
    data: facture,
  });
});

// @desc    Créer une nouvelle facture (avec upload fichier)
// @route   POST /api/factures OU POST /api/spaces/:spaceId/factures
// @access  Auth + Space (MEMBER minimum)
exports.createFacture = asyncHandler(async (req, res) => {
  const data = req.body;
  const spaceId = req.params.spaceId || req.body.spaceId;

  // Validation basique
  if (!data.fournisseur || !data.montantTTC || !data.dateFacture || !data.categorie || !data.bienId) {
    return res.status(400).json({
      success: false,
      error: 'Champs requis manquants',
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
  if (dataToCreate.montantTTC) dataToCreate.montantTTC = parseFloat(dataToCreate.montantTTC);
  if (dataToCreate.montantHT === '' || !dataToCreate.montantHT) {
    dataToCreate.montantHT = null;
  } else {
    dataToCreate.montantHT = parseFloat(dataToCreate.montantHT);
  }
  if (dataToCreate.tva === '' || !dataToCreate.tva) {
    dataToCreate.tva = null;
  } else {
    dataToCreate.tva = parseFloat(dataToCreate.tva);
  }

  // Dates
  if (dataToCreate.dateFacture) {
    dataToCreate.dateFacture = new Date(dataToCreate.dateFacture);
  }
  if (dataToCreate.datePaiement === '' || !dataToCreate.datePaiement) {
    dataToCreate.datePaiement = null;
  } else {
    dataToCreate.datePaiement = new Date(dataToCreate.datePaiement);
  }

  // Booléens
  dataToCreate.estPaye = dataToCreate.estPaye === 'true' || dataToCreate.estPaye === true;
  dataToCreate.estDeductible = dataToCreate.estDeductible === 'true' || dataToCreate.estDeductible === true;

  // Champs optionnels
  if (dataToCreate.numero === '') dataToCreate.numero = null;
  if (dataToCreate.sousCategorie === '') dataToCreate.sousCategorie = null;
  if (dataToCreate.description === '') dataToCreate.description = null;
  if (dataToCreate.adresseDetectee === '') dataToCreate.adresseDetectee = null;

  // Fichier uploadé
  if (req.file) {
    dataToCreate.url = `/uploads/factures/${req.file.filename}`;
    dataToCreate.filename = req.file.filename;
  }
  
  // Supprimer spaceId (pas dans le modèle Facture)
  delete dataToCreate.spaceId;

  const facture = await prisma.facture.create({
    data: dataToCreate,
    include: {
      bien: true,
    },
  });

  res.status(201).json({
    success: true,
    data: facture,
  });
});

// @desc    Mettre à jour une facture
// @route   PUT /api/factures/:id
// @access  Auth + Space (MEMBER minimum)
exports.updateFacture = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const spaceId = req.params.spaceId || req.body.spaceId;

  const factureExistante = await prisma.facture.findUnique({
    where: { id },
    include: {
      bien: { select: { spaceId: true } }
    }
  });

  if (!factureExistante) {
    return res.status(404).json({
      success: false,
      error: 'Facture non trouvée',
    });
  }
  
  // Vérifier que la facture appartient au Space
  if (spaceId && factureExistante.bien.spaceId !== spaceId) {
    return res.status(403).json({
      success: false,
      error: 'Cette facture n\'appartient pas à cet espace',
      code: 'FACTURE_NOT_IN_SPACE'
    });
  }

  const dataToUpdate = { ...data };

  // Convertir numériques
  if (dataToUpdate.montantTTC) dataToUpdate.montantTTC = parseFloat(dataToUpdate.montantTTC);
  if (dataToUpdate.montantHT === '' || !dataToUpdate.montantHT) {
    dataToUpdate.montantHT = null;
  } else {
    dataToUpdate.montantHT = parseFloat(dataToUpdate.montantHT);
  }
  if (dataToUpdate.tva === '' || !dataToUpdate.tva) {
    dataToUpdate.tva = null;
  } else {
    dataToUpdate.tva = parseFloat(dataToUpdate.tva);
  }

  // Dates
  if (dataToUpdate.dateFacture && dataToUpdate.dateFacture !== '') {
    dataToUpdate.dateFacture = new Date(dataToUpdate.dateFacture);
  }
  if (dataToUpdate.datePaiement === '' || !dataToUpdate.datePaiement) {
    dataToUpdate.datePaiement = null;
  } else if (dataToUpdate.datePaiement) {
    dataToUpdate.datePaiement = new Date(dataToUpdate.datePaiement);
  }

  // Booléens
  if (dataToUpdate.estPaye !== undefined) {
    dataToUpdate.estPaye = dataToUpdate.estPaye === 'true' || dataToUpdate.estPaye === true;
  }
  if (dataToUpdate.estDeductible !== undefined) {
    dataToUpdate.estDeductible = dataToUpdate.estDeductible === 'true' || dataToUpdate.estDeductible === true;
  }

  // Supprimer champs non modifiables
  delete dataToUpdate.id;
  delete dataToUpdate.createdAt;
  delete dataToUpdate.updatedAt;
  delete dataToUpdate.url;
  delete dataToUpdate.filename;
  delete dataToUpdate.bien;
  delete dataToUpdate.spaceId;

  const facture = await prisma.facture.update({
    where: { id },
    data: dataToUpdate,
    include: {
      bien: true,
    },
  });

  res.status(200).json({
    success: true,
    data: facture,
  });
});

// @desc    Supprimer une facture
// @route   DELETE /api/factures/:id
// @access  Auth + Space (MEMBER minimum)
exports.deleteFacture = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const spaceId = req.params.spaceId || req.query.spaceId;

  const facture = await prisma.facture.findUnique({
    where: { id },
    include: {
      bien: { select: { spaceId: true } }
    }
  });

  if (!facture) {
    return res.status(404).json({
      success: false,
      error: 'Facture non trouvée',
    });
  }
  
  // Vérifier que la facture appartient au Space
  if (spaceId && facture.bien.spaceId !== spaceId) {
    return res.status(403).json({
      success: false,
      error: 'Cette facture n\'appartient pas à cet espace',
      code: 'FACTURE_NOT_IN_SPACE'
    });
  }

  await prisma.facture.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Facture supprimée avec succès',
  });
});
