const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Récupérer toutes les charges
// @route   GET /api/charges
// @access  Public
exports.getAllCharges = asyncHandler(async (req, res) => {
  const charges = await prisma.charge.findMany({
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
// @access  Public
exports.getChargesByBien = asyncHandler(async (req, res) => {
  const { bienId } = req.params;

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
// @access  Public
exports.getChargeById = asyncHandler(async (req, res) => {
  const { id } = req.params;

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

  res.status(200).json({
    success: true,
    data: charge,
  });
});

// @desc    Créer une nouvelle charge
// @route   POST /api/charges
// @access  Public
exports.createCharge = asyncHandler(async (req, res) => {
  const data = req.body;

  // Validation basique
  if (!data.type || !data.libelle || !data.montant || !data.frequence || !data.dateDebut) {
    return res.status(400).json({
      success: false,
      error: 'Champs requis manquants (type, libelle, montant, frequence, dateDebut)',
    });
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
  
  // Convertir bienId vide en null
  if (dataToCreate.bienId === '' || dataToCreate.bienId === undefined) {
    dataToCreate.bienId = null;
  }
  
  // Convertir notes vide en null
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

  const charge = await prisma.charge.create({
    data: dataToCreate,
    include: {
      bien: true,
      paiements: true,
    },
  });

  // Synchroniser avec le bien si c'est une assurance PNO ou une taxe foncière ET si un bien est associé
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
});

// @desc    Mettre à jour une charge
// @route   PUT /api/charges/:id
// @access  Public
exports.updateCharge = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const chargeExistante = await prisma.charge.findUnique({
    where: { id },
  });

  if (!chargeExistante) {
    return res.status(404).json({
      success: false,
      error: 'Charge non trouvée',
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
  
  // Convertir bienId vide en null
  if (dataToUpdate.bienId === '' || dataToUpdate.bienId === undefined) {
    dataToUpdate.bienId = null;
  }
  
  // Convertir notes vide en null
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
        id: { not: id }, // Exclure la charge actuelle
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

  const charge = await prisma.charge.update({
    where: { id },
    data: dataToUpdate,
    include: {
      bien: true,
      paiements: true,
    },
  });

  // Synchroniser avec le bien si c'est une assurance PNO ou une taxe foncière
  if (charge.type === 'ASSURANCE_PNO') {
    await prisma.bien.update({
      where: { id: charge.bienId },
      data: { assuranceMensuelle: charge.estActive ? charge.montant : null },
    });
  } else if (charge.type === 'TAXE_FONCIERE') {
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
// @access  Public
exports.deleteCharge = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const charge = await prisma.charge.findUnique({
    where: { id },
  });

  if (!charge) {
    return res.status(404).json({
      success: false,
      error: 'Charge non trouvée',
    });
  }

  // Synchroniser avec le bien si c'est une assurance PNO ou une taxe foncière
  if (charge.type === 'ASSURANCE_PNO') {
    await prisma.bien.update({
      where: { id: charge.bienId },
      data: { assuranceMensuelle: null },
    });
  } else if (charge.type === 'TAXE_FONCIERE') {
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
// @access  Public
exports.addPaiement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { datePaiement, montant, notes } = req.body;

  if (!datePaiement || !montant) {
    return res.status(400).json({
      success: false,
      error: 'Champs requis manquants (datePaiement, montant)',
    });
  }

  const charge = await prisma.charge.findUnique({
    where: { id },
  });

  if (!charge) {
    return res.status(404).json({
      success: false,
      error: 'Charge non trouvée',
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
// @access  Public
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
