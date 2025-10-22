const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

// ============================================
// HELPERS
// ============================================

/**
 * Vérifier qu'un bien appartient à un Space (si bienId fourni)
 */
async function verifyBienInSpace(bienId, spaceId) {
  if (!bienId) return true; // Pas de bienId = OK (charge générale)
  
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

// @desc    Récupérer toutes les charges d'un Space
// @route   GET /api/charges OU GET /api/spaces/:spaceId/charges
// @access  Auth + Space
exports.getAllCharges = asyncHandler(async (req, res) => {
  const spaceId = req.params.spaceId || req.query.spaceId;
  
  if (!spaceId) {
    return res.status(400).json({
      success: false,
      error: 'Space ID requis',
      code: 'SPACE_ID_REQUIRED'
    });
  }
  
  const charges = await prisma.charge.findMany({
    where: {
      OR: [
        // Charges liées à un bien du Space
        {
          bien: {
            spaceId: spaceId
          }
        },
        // Charges générales sans bien (bienId null)
        // À IMPLÉMENTER : ajouter spaceId à Charge pour les charges globales
        {
          bienId: null
        }
      ]
    },
    include: {
      bien: {
        select: {
          id: true,
          adresse: true,
          ville: true,
        },
      },
      paiements: {
        orderBy: {
          datePaiement: 'desc',
        },
      },
    },
    orderBy: {
      dateDebut: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    count: charges.length,
    data: charges,
  });
});

// @desc    Récupérer les charges d'un bien
// @route   GET /api/charges/bien/:bienId
// @access  Auth + Space
exports.getChargesByBien = asyncHandler(async (req, res) => {
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

  const charges = await prisma.charge.findMany({
    where: { bienId },
    include: {
      paiements: {
        orderBy: {
          datePaiement: 'desc',
        },
      },
    },
    orderBy: {
      dateDebut: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    count: charges.length,
    data: charges,
  });
});

// @desc    Récupérer une charge par ID
// @route   GET /api/charges/:id
// @access  Auth + Space
exports.getChargeById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const spaceId = req.params.spaceId || req.query.spaceId;

  const charge = await prisma.charge.findUnique({
    where: { id },
    include: {
      bien: true,
      paiements: {
        orderBy: {
          datePaiement: 'desc',
        },
      },
    },
  });

  if (!charge) {
    return res.status(404).json({
      success: false,
      error: 'Charge non trouvée',
    });
  }
  
  // Vérifier que la charge appartient au Space
  if (spaceId && charge.bienId && charge.bien.spaceId !== spaceId) {
    return res.status(403).json({
      success: false,
      error: 'Cette charge n\'appartient pas à cet espace',
      code: 'CHARGE_NOT_IN_SPACE'
    });
  }

  res.status(200).json({
    success: true,
    data: charge,
  });
});

// @desc    Créer une nouvelle charge
// @route   POST /api/charges OU POST /api/spaces/:spaceId/charges
// @access  Auth + Space (MEMBER minimum)
exports.createCharge = asyncHandler(async (req, res) => {
  const data = req.body;
  const spaceId = req.params.spaceId || req.body.spaceId;

  // Validation basique
  if (!data.type || !data.libelle || !data.montant || !data.frequence || !data.dateDebut) {
    return res.status(400).json({
      success: false,
      error: 'Champs requis manquants (type, libelle, montant, frequence, dateDebut)',
    });
  }
  
  // Vérifier que le bien appartient au Space (si fourni)
  if (spaceId && data.bienId) {
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

  // Convertir les données
  const dataToCreate = { ...data };
  dataToCreate.montant = parseFloat(dataToCreate.montant);
  dataToCreate.dateDebut = new Date(dataToCreate.dateDebut);
  
  if (dataToCreate.dateFin && dataToCreate.dateFin !== '') {
    dataToCreate.dateFin = new Date(dataToCreate.dateFin);
  } else {
    dataToCreate.dateFin = null;
  }
  
  if (dataToCreate.jourPaiement && dataToCreate.jourPaiement !== '') {
    dataToCreate.jourPaiement = parseInt(dataToCreate.jourPaiement);
  } else {
    dataToCreate.jourPaiement = null;
  }

  if (dataToCreate.estActive !== undefined) {
    dataToCreate.estActive = Boolean(dataToCreate.estActive);
  }
  
  if (dataToCreate.bienId === '' || dataToCreate.bienId === undefined) {
    dataToCreate.bienId = null;
  }
  
  if (dataToCreate.notes === '' || dataToCreate.notes === undefined) {
    dataToCreate.notes = null;
  }

  // Vérifier qu'il n'y a pas déjà une charge du même type pour ce bien
  if (dataToCreate.bienId && (dataToCreate.type === 'ASSURANCE_PNO' || dataToCreate.type === 'TAXE_FONCIERE')) {
    const chargeExistante = await prisma.charge.findFirst({
      where: {
        bienId: dataToCreate.bienId,
        type: dataToCreate.type,
        estActive: true,
      },
    });
    
    if (chargeExistante) {
      const typeLabel = dataToCreate.type === 'ASSURANCE_PNO' ? 'Assurance PNO' : 'Taxe foncière';
      return res.status(400).json({
        success: false,
        error: `Une charge de type "${typeLabel}" existe déjà pour ce bien. Vous pouvez la modifier ou la désactiver.`,
      });
    }
  }

  try {
    const charge = await prisma.charge.create({
      data: dataToCreate,
      include: {
        bien: true,
        paiements: true,
      },
    });

    // Synchroniser avec le bien si c'est une assurance PNO ou une taxe foncière
    if (charge.bienId && charge.type === 'ASSURANCE_PNO' && charge.estActive) {
      await prisma.bien.update({
        where: { id: charge.bienId },
        data: { assuranceMensuelle: charge.montant },
      });
    } else if (charge.bienId && charge.type === 'TAXE_FONCIERE' && charge.estActive) {
      await prisma.bien.update({
        where: { id: charge.bienId },
        data: { taxeFonciere: charge.montant },
      });
    }

    res.status(201).json({
      success: true,
      data: charge,
    });
  } catch (error) {
    console.error('Erreur lors de la création de la charge:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la charge',
      details: error.message
    });
  }
});

// @desc    Mettre à jour une charge
// @route   PUT /api/charges/:id
// @access  Auth + Space (MEMBER minimum)
exports.updateCharge = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const spaceId = req.params.spaceId || req.body.spaceId;

  const chargeExistante = await prisma.charge.findUnique({
    where: { id },
    include: {
      bien: { select: { spaceId: true } }
    }
  });

  if (!chargeExistante) {
    return res.status(404).json({
      success: false,
      error: 'Charge non trouvée',
    });
  }
  
  // Vérifier que la charge appartient au Space
  if (spaceId && chargeExistante.bienId && chargeExistante.bien.spaceId !== spaceId) {
    return res.status(403).json({
      success: false,
      error: 'Cette charge n\'appartient pas à cet espace',
      code: 'CHARGE_NOT_IN_SPACE'
    });
  }

  const dataToUpdate = { ...data };

  // Convertir les données
  if (dataToUpdate.montant) {
    dataToUpdate.montant = parseFloat(dataToUpdate.montant);
  }
  
  if (dataToUpdate.dateDebut) {
    dataToUpdate.dateDebut = new Date(dataToUpdate.dateDebut);
  }
  
  if (dataToUpdate.dateFin && dataToUpdate.dateFin !== '') {
    dataToUpdate.dateFin = new Date(dataToUpdate.dateFin);
  } else if (dataToUpdate.dateFin === '' || dataToUpdate.dateFin === null) {
    dataToUpdate.dateFin = null;
  }
  
  if (dataToUpdate.jourPaiement && dataToUpdate.jourPaiement !== '') {
    dataToUpdate.jourPaiement = parseInt(dataToUpdate.jourPaiement);
  } else if (dataToUpdate.jourPaiement === '' || dataToUpdate.jourPaiement === null) {
    dataToUpdate.jourPaiement = null;
  }

  if (dataToUpdate.estActive !== undefined) {
    dataToUpdate.estActive = Boolean(dataToUpdate.estActive);
  }
  
  if (dataToUpdate.bienId === '' || dataToUpdate.bienId === undefined) {
    dataToUpdate.bienId = null;
  }
  
  if (dataToUpdate.notes === '') {
    dataToUpdate.notes = null;
  }

  // Vérifier qu'il n'y a pas déjà une autre charge du même type pour ce bien
  if (dataToUpdate.bienId && dataToUpdate.type && (dataToUpdate.type === 'ASSURANCE_PNO' || dataToUpdate.type === 'TAXE_FONCIERE')) {
    const autreChargeExistante = await prisma.charge.findFirst({
      where: {
        bienId: dataToUpdate.bienId,
        type: dataToUpdate.type,
        estActive: true,
        id: { not: id },
      },
    });
    
    if (autreChargeExistante) {
      const typeLabel = dataToUpdate.type === 'ASSURANCE_PNO' ? 'Assurance PNO' : 'Taxe foncière';
      return res.status(400).json({
        success: false,
        error: `Une autre charge de type "${typeLabel}" existe déjà pour ce bien.`,
      });
    }
  }

  // Supprimer champs non modifiables
  delete dataToUpdate.id;
  delete dataToUpdate.createdAt;
  delete dataToUpdate.updatedAt;
  delete dataToUpdate.bien;
  delete dataToUpdate.paiements;
  delete dataToUpdate.spaceId;

  const charge = await prisma.charge.update({
    where: { id },
    data: dataToUpdate,
    include: {
      bien: true,
      paiements: true,
    },
  });

  // Synchroniser avec le bien si c'est une assurance PNO ou une taxe foncière
  if (charge.bienId && charge.type === 'ASSURANCE_PNO') {
    await prisma.bien.update({
      where: { id: charge.bienId },
      data: { assuranceMensuelle: charge.estActive ? charge.montant : null },
    });
  } else if (charge.bienId && charge.type === 'TAXE_FONCIERE') {
    await prisma.bien.update({
      where: { id: charge.bienId },
      data: { taxeFonciere: charge.estActive ? charge.montant : null },
    });
  }

  res.status(200).json({
    success: true,
    data: charge,
  });
});

// @desc    Supprimer une charge
// @route   DELETE /api/charges/:id
// @access  Auth + Space (MEMBER minimum)
exports.deleteCharge = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const spaceId = req.params.spaceId || req.query.spaceId;

  const charge = await prisma.charge.findUnique({
    where: { id },
    include: {
      bien: { select: { spaceId: true } }
    }
  });

  if (!charge) {
    return res.status(404).json({
      success: false,
      error: 'Charge non trouvée',
    });
  }
  
  // Vérifier que la charge appartient au Space
  if (spaceId && charge.bienId && charge.bien.spaceId !== spaceId) {
    return res.status(403).json({
      success: false,
      error: 'Cette charge n\'appartient pas à cet espace',
      code: 'CHARGE_NOT_IN_SPACE'
    });
  }

  // Synchroniser avec le bien si c'est une assurance PNO ou une taxe foncière
  if (charge.bienId && charge.type === 'ASSURANCE_PNO') {
    await prisma.bien.update({
      where: { id: charge.bienId },
      data: { assuranceMensuelle: null },
    });
  } else if (charge.bienId && charge.type === 'TAXE_FONCIERE') {
    await prisma.bien.update({
      where: { id: charge.bienId },
      data: { taxeFonciere: null },
    });
  }

  await prisma.charge.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Charge supprimée avec succès',
  });
});

// @desc    Ajouter un paiement à une charge
// @route   POST /api/charges/:id/paiements
// @access  Auth + Space (MEMBER minimum)
exports.addPaiement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { datePaiement, montant, notes } = req.body;
  const spaceId = req.params.spaceId || req.body.spaceId;

  if (!datePaiement || !montant) {
    return res.status(400).json({
      success: false,
      error: 'Champs requis manquants (datePaiement, montant)',
    });
  }

  const charge = await prisma.charge.findUnique({
    where: { id },
    include: {
      bien: { select: { spaceId: true } }
    }
  });

  if (!charge) {
    return res.status(404).json({
      success: false,
      error: 'Charge non trouvée',
    });
  }
  
  // Vérifier que la charge appartient au Space
  if (spaceId && charge.bienId && charge.bien.spaceId !== spaceId) {
    return res.status(403).json({
      success: false,
      error: 'Cette charge n\'appartient pas à cet espace',
      code: 'CHARGE_NOT_IN_SPACE'
    });
  }

  const paiement = await prisma.paiementCharge.create({
    data: {
      datePaiement: new Date(datePaiement),
      montant: parseFloat(montant),
      notes: notes || null,
      chargeId: id,
    },
  });

  res.status(201).json({
    success: true,
    data: paiement,
  });
});

// @desc    Supprimer un paiement
// @route   DELETE /api/charges/paiements/:paiementId
// @access  Auth + Space (MEMBER minimum)
exports.deletePaiement = asyncHandler(async (req, res) => {
  const { paiementId } = req.params;

  const paiement = await prisma.paiementCharge.findUnique({
    where: { id: paiementId },
  });

  if (!paiement) {
    return res.status(404).json({
      success: false,
      error: 'Paiement non trouvé',
    });
  }

  await prisma.paiementCharge.delete({
    where: { id: paiementId },
  });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Paiement supprimé avec succès',
  });
});
