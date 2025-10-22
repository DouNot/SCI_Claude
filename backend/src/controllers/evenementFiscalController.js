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

// @desc    Récupérer tous les événements fiscaux d'un Space
// @route   GET /api/evenements-fiscaux OU GET /api/spaces/:spaceId/evenements-fiscaux
// @access  Auth + Space
exports.getAllEvenements = asyncHandler(async (req, res) => {
  const spaceId = req.params.spaceId || req.query.spaceId;
  
  if (!spaceId) {
    return res.status(400).json({
      success: false,
      error: 'Space ID requis',
      code: 'SPACE_ID_REQUIRED'
    });
  }
  
  const evenements = await prisma.evenementFiscal.findMany({
    where: {
      bien: {
        spaceId: spaceId
      }
    },
    include: { 
      bien: { 
        select: { id: true, adresse: true, ville: true } 
      } 
    },
    orderBy: { dateEcheance: 'asc' },
  });
  
  res.status(200).json({ 
    success: true, 
    count: evenements.length, 
    data: evenements 
  });
});

// @desc    Récupérer les événements fiscaux d'un bien
// @route   GET /api/evenements-fiscaux/bien/:bienId
// @access  Auth + Space
exports.getEvenementsByBien = asyncHandler(async (req, res) => {
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
  
  const evenements = await prisma.evenementFiscal.findMany({
    where: { bienId },
    orderBy: { dateEcheance: 'asc' },
  });
  
  res.status(200).json({ 
    success: true, 
    count: evenements.length, 
    data: evenements 
  });
});

// @desc    Récupérer un événement fiscal par ID
// @route   GET /api/evenements-fiscaux/:id
// @access  Auth + Space
exports.getEvenementById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const spaceId = req.params.spaceId || req.query.spaceId;
  
  const evenement = await prisma.evenementFiscal.findUnique({
    where: { id },
    include: { bien: true },
  });
  
  if (!evenement) {
    return res.status(404).json({ 
      success: false, 
      error: 'Événement non trouvé' 
    });
  }
  
  // Vérifier que l'événement appartient au Space
  if (spaceId && evenement.bien.spaceId !== spaceId) {
    return res.status(403).json({
      success: false,
      error: 'Cet événement n\'appartient pas à cet espace',
      code: 'EVENEMENT_NOT_IN_SPACE'
    });
  }
  
  res.status(200).json({ 
    success: true, 
    data: evenement 
  });
});

// @desc    Créer un événement fiscal
// @route   POST /api/evenements-fiscaux OU POST /api/spaces/:spaceId/evenements-fiscaux
// @access  Auth + Space (MEMBER minimum)
exports.createEvenement = asyncHandler(async (req, res) => {
  const data = req.body;
  const spaceId = req.params.spaceId || req.body.spaceId;
  
  // Validation
  if (!data.type || !data.dateEcheance || !data.bienId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Champs requis manquants (type, dateEcheance, bienId)' 
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
  
  const dataToCreate = { ...data };
  dataToCreate.dateEcheance = new Date(dataToCreate.dateEcheance);
  
  if (dataToCreate.datePaiement && dataToCreate.datePaiement !== '') {
    dataToCreate.datePaiement = new Date(dataToCreate.datePaiement);
  } else {
    dataToCreate.datePaiement = null;
  }
  
  if (dataToCreate.montant) {
    dataToCreate.montant = parseFloat(dataToCreate.montant);
  }
  
  if (dataToCreate.estPaye === undefined) {
    dataToCreate.estPaye = false;
  }
  
  if (dataToCreate.notes === '') {
    dataToCreate.notes = null;
  }
  
  // Supprimer le spaceId car il n'existe pas dans le modèle EvenementFiscal
  delete dataToCreate.spaceId;
  
  const evenement = await prisma.evenementFiscal.create({
    data: dataToCreate,
    include: { bien: true },
  });
  
  res.status(201).json({ 
    success: true, 
    data: evenement 
  });
});

// @desc    Mettre à jour un événement fiscal
// @route   PUT /api/evenements-fiscaux/:id
// @access  Auth + Space (MEMBER minimum)
exports.updateEvenement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const spaceId = req.params.spaceId || req.body.spaceId;
  
  const evenementExistant = await prisma.evenementFiscal.findUnique({ 
    where: { id },
    include: {
      bien: { select: { spaceId: true } }
    }
  });
  
  if (!evenementExistant) {
    return res.status(404).json({ 
      success: false, 
      error: 'Événement non trouvé' 
    });
  }
  
  // Vérifier que l'événement appartient au Space
  if (spaceId && evenementExistant.bien.spaceId !== spaceId) {
    return res.status(403).json({
      success: false,
      error: 'Cet événement n\'appartient pas à cet espace',
      code: 'EVENEMENT_NOT_IN_SPACE'
    });
  }
  
  const dataToUpdate = { ...data };
  
  if (dataToUpdate.dateEcheance && dataToUpdate.dateEcheance !== '') {
    dataToUpdate.dateEcheance = new Date(dataToUpdate.dateEcheance);
  }
  
  if (dataToUpdate.datePaiement && dataToUpdate.datePaiement !== '') {
    dataToUpdate.datePaiement = new Date(dataToUpdate.datePaiement);
  } else if (dataToUpdate.datePaiement === '' || dataToUpdate.datePaiement === null) {
    dataToUpdate.datePaiement = null;
  }
  
  if (dataToUpdate.montant) {
    dataToUpdate.montant = parseFloat(dataToUpdate.montant);
  }
  
  if (dataToUpdate.notes === '') {
    dataToUpdate.notes = null;
  }
  
  // Supprimer champs non modifiables
  delete dataToUpdate.bienId;
  delete dataToUpdate.id;
  delete dataToUpdate.createdAt;
  delete dataToUpdate.updatedAt;
  delete dataToUpdate.bien;
  delete dataToUpdate.spaceId;
  
  const evenement = await prisma.evenementFiscal.update({
    where: { id },
    data: dataToUpdate,
    include: { bien: true },
  });
  
  res.status(200).json({ 
    success: true, 
    data: evenement 
  });
});

// @desc    Supprimer un événement fiscal
// @route   DELETE /api/evenements-fiscaux/:id
// @access  Auth + Space (MEMBER minimum)
exports.deleteEvenement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const spaceId = req.params.spaceId || req.query.spaceId;
  
  const evenement = await prisma.evenementFiscal.findUnique({ 
    where: { id },
    include: {
      bien: { select: { spaceId: true } }
    }
  });
  
  if (!evenement) {
    return res.status(404).json({ 
      success: false, 
      error: 'Événement non trouvé' 
    });
  }
  
  // Vérifier que l'événement appartient au Space
  if (spaceId && evenement.bien.spaceId !== spaceId) {
    return res.status(403).json({
      success: false,
      error: 'Cet événement n\'appartient pas à cet espace',
      code: 'EVENEMENT_NOT_IN_SPACE'
    });
  }
  
  await prisma.evenementFiscal.delete({ where: { id } });
  
  res.status(200).json({ 
    success: true, 
    data: {}, 
    message: 'Événement supprimé avec succès' 
  });
});
