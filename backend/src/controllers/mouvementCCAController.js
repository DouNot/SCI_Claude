const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Récupérer tous les mouvements CCA d'un associé
// @route   GET /api/associes/:associeId/mouvements-cca
// @access  Private
exports.getMouvementsByAssocie = asyncHandler(async (req, res) => {
  const { associeId } = req.params;

  const mouvements = await prisma.mouvementCCA.findMany({
    where: { associeId },
    orderBy: {
      date: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    count: mouvements.length,
    data: mouvements,
  });
});

// @desc    Créer un nouveau mouvement CCA
// @route   POST /api/associes/:associeId/mouvements-cca
// @access  Private
exports.createMouvement = asyncHandler(async (req, res) => {
  const { associeId } = req.params;
  const { type, montant, libelle, date, reference, notes } = req.body;

  // Validation
  if (!type || !montant || !libelle || !date) {
    return res.status(400).json({
      success: false,
      error: 'Champs requis manquants (type, montant, libelle, date)',
    });
  }

  // Vérifier que l'associé existe
  const associe = await prisma.associe.findUnique({
    where: { id: associeId },
  });

  if (!associe) {
    return res.status(404).json({
      success: false,
      error: 'Associé non trouvé',
    });
  }

  // Calculer le nouveau solde
  let nouveauSolde = associe.soldeCCA;
  
  if (type === 'APPORT' || type === 'INTERETS') {
    nouveauSolde += parseFloat(montant);
  } else if (type === 'RETRAIT') {
    nouveauSolde -= parseFloat(montant);
  }

  // Créer le mouvement et mettre à jour le solde dans une transaction
  const result = await prisma.$transaction(async (tx) => {
    // Créer le mouvement
    const mouvement = await tx.mouvementCCA.create({
      data: {
        associeId,
        type,
        montant: parseFloat(montant),
        libelle,
        date: new Date(date),
        reference: reference || null,
        notes: notes || null,
      },
    });

    // Mettre à jour le solde de l'associé
    const associeUpdated = await tx.associe.update({
      where: { id: associeId },
      data: {
        soldeCCA: nouveauSolde,
      },
    });

    return { mouvement, associe: associeUpdated };
  });

  res.status(201).json({
    success: true,
    message: 'Mouvement CCA créé avec succès',
    data: result.mouvement,
    nouveauSolde: result.associe.soldeCCA,
  });
});

// @desc    Mettre à jour un mouvement CCA
// @route   PUT /api/mouvements-cca/:id
// @access  Private
exports.updateMouvement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, montant, libelle, date, reference, notes } = req.body;

  const mouvementExistant = await prisma.mouvementCCA.findUnique({
    where: { id },
    include: { associe: true },
  });

  if (!mouvementExistant) {
    return res.status(404).json({
      success: false,
      error: 'Mouvement non trouvé',
    });
  }

  // Recalculer le solde si le montant ou le type change
  let nouveauSolde = mouvementExistant.associe.soldeCCA;

  // Annuler l'ancien mouvement
  if (mouvementExistant.type === 'APPORT' || mouvementExistant.type === 'INTERETS') {
    nouveauSolde -= mouvementExistant.montant;
  } else if (mouvementExistant.type === 'RETRAIT') {
    nouveauSolde += mouvementExistant.montant;
  }

  // Appliquer le nouveau mouvement
  const newType = type || mouvementExistant.type;
  const newMontant = montant ? parseFloat(montant) : mouvementExistant.montant;

  if (newType === 'APPORT' || newType === 'INTERETS') {
    nouveauSolde += newMontant;
  } else if (newType === 'RETRAIT') {
    nouveauSolde -= newMontant;
  }

  // Mettre à jour le mouvement et le solde dans une transaction
  const result = await prisma.$transaction(async (tx) => {
    const mouvement = await tx.mouvementCCA.update({
      where: { id },
      data: {
        type: newType,
        montant: newMontant,
        libelle: libelle || mouvementExistant.libelle,
        date: date ? new Date(date) : mouvementExistant.date,
        reference: reference !== undefined ? reference : mouvementExistant.reference,
        notes: notes !== undefined ? notes : mouvementExistant.notes,
      },
    });

    const associeUpdated = await tx.associe.update({
      where: { id: mouvementExistant.associeId },
      data: {
        soldeCCA: nouveauSolde,
      },
    });

    return { mouvement, associe: associeUpdated };
  });

  res.status(200).json({
    success: true,
    message: 'Mouvement mis à jour',
    data: result.mouvement,
    nouveauSolde: result.associe.soldeCCA,
  });
});

// @desc    Supprimer un mouvement CCA
// @route   DELETE /api/mouvements-cca/:id
// @access  Private
exports.deleteMouvement = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const mouvement = await prisma.mouvementCCA.findUnique({
    where: { id },
    include: { associe: true },
  });

  if (!mouvement) {
    return res.status(404).json({
      success: false,
      error: 'Mouvement non trouvé',
    });
  }

  // Recalculer le solde en annulant ce mouvement
  let nouveauSolde = mouvement.associe.soldeCCA;

  if (mouvement.type === 'APPORT' || mouvement.type === 'INTERETS') {
    nouveauSolde -= mouvement.montant;
  } else if (mouvement.type === 'RETRAIT') {
    nouveauSolde += mouvement.montant;
  }

  // Supprimer le mouvement et mettre à jour le solde dans une transaction
  await prisma.$transaction(async (tx) => {
    await tx.mouvementCCA.delete({
      where: { id },
    });

    await tx.associe.update({
      where: { id: mouvement.associeId },
      data: {
        soldeCCA: nouveauSolde,
      },
    });
  });

  res.status(200).json({
    success: true,
    message: 'Mouvement supprimé avec succès',
    nouveauSolde,
  });
});

// @desc    Récupérer le solde CCA d'un associé
// @route   GET /api/associes/:associeId/solde-cca
// @access  Private
exports.getSoldeCCA = asyncHandler(async (req, res) => {
  const { associeId } = req.params;

  const associe = await prisma.associe.findUnique({
    where: { id: associeId },
    select: {
      id: true,
      nom: true,
      prenom: true,
      soldeCCA: true,
    },
  });

  if (!associe) {
    return res.status(404).json({
      success: false,
      error: 'Associé non trouvé',
    });
  }

  res.status(200).json({
    success: true,
    data: {
      associeId: associe.id,
      nom: `${associe.prenom} ${associe.nom}`,
      soldeCCA: associe.soldeCCA,
    },
  });
});
