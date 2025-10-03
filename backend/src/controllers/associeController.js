const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Récupérer tous les associés
// @route   GET /api/associes
// @access  Public
exports.getAllAssocies = asyncHandler(async (req, res) => {
  const associes = await prisma.associe.findMany({
    include: {
      compte: {
        select: {
          id: true,
          nom: true,
          type: true,
        },
      },
    },
    orderBy: {
      pourcentageParts: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    count: associes.length,
    data: associes,
  });
});

// @desc    Récupérer les associés d'un compte
// @route   GET /api/associes/compte/:compteId
// @access  Public
exports.getAssociesByCompte = asyncHandler(async (req, res) => {
  const { compteId } = req.params;

  const associes = await prisma.associe.findMany({
    where: { compteId },
    orderBy: {
      pourcentageParts: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    count: associes.length,
    data: associes,
  });
});

// @desc    Récupérer un associé par ID
// @route   GET /api/associes/:id
// @access  Public
exports.getAssocieById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const associe = await prisma.associe.findUnique({
    where: { id },
    include: {
      compte: true,
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
    data: associe,
  });
});

// @desc    Créer un nouvel associé
// @route   POST /api/associes
// @access  Public
exports.createAssocie = asyncHandler(async (req, res) => {
  const data = req.body;

  // Validation basique
  if (!data.nom || !data.prenom || !data.pourcentageParts) {
    return res.status(400).json({
      success: false,
      error: 'Champs requis manquants (nom, prenom, pourcentageParts)',
    });
  }

  // Nettoyer les données
  const dataToCreate = { ...data };

  // Ajouter le compteId par défaut (prépare V2)
  dataToCreate.compteId = process.env.DEFAULT_COMPTE_ID;

  // Convertir pourcentageParts en nombre
  dataToCreate.pourcentageParts = parseFloat(dataToCreate.pourcentageParts);

  // Champs optionnels
  if (dataToCreate.email === '') dataToCreate.email = null;
  if (dataToCreate.telephone === '') dataToCreate.telephone = null;

  // Vérifier que le total des parts ne dépasse pas 100%
  const associesExistants = await prisma.associe.findMany({
    where: { compteId: dataToCreate.compteId },
  });

  const totalParts = associesExistants.reduce((sum, a) => sum + a.pourcentageParts, 0);
  const nouveauTotal = totalParts + dataToCreate.pourcentageParts;

  if (nouveauTotal > 100) {
    return res.status(400).json({
      success: false,
      error: `Le total des parts dépasserait 100% (actuellement ${totalParts}%, vous tentez d'ajouter ${dataToCreate.pourcentageParts}%)`,
    });
  }

  const associe = await prisma.associe.create({
    data: dataToCreate,
    include: {
      compte: true,
    },
  });

  res.status(201).json({
    success: true,
    data: associe,
  });
});

// @desc    Mettre à jour un associé
// @route   PUT /api/associes/:id
// @access  Public
exports.updateAssocie = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const associeExistant = await prisma.associe.findUnique({
    where: { id },
  });

  if (!associeExistant) {
    return res.status(404).json({
      success: false,
      error: 'Associé non trouvé',
    });
  }

  const dataToUpdate = { ...data };

  // Convertir pourcentageParts en nombre si présent
  if (dataToUpdate.pourcentageParts) {
    dataToUpdate.pourcentageParts = parseFloat(dataToUpdate.pourcentageParts);

    // Vérifier que le total des parts ne dépasse pas 100%
    const associesExistants = await prisma.associe.findMany({
      where: { 
        compteId: associeExistant.compteId,
        id: { not: id } // Exclure l'associé en cours de modification
      },
    });

    const totalParts = associesExistants.reduce((sum, a) => sum + a.pourcentageParts, 0);
    const nouveauTotal = totalParts + dataToUpdate.pourcentageParts;

    if (nouveauTotal > 100) {
      return res.status(400).json({
        success: false,
        error: `Le total des parts dépasserait 100% (autres associés: ${totalParts}%, vous tentez de mettre ${dataToUpdate.pourcentageParts}%)`,
      });
    }
  }

  // Champs optionnels
  if (dataToUpdate.email === '') dataToUpdate.email = null;
  if (dataToUpdate.telephone === '') dataToUpdate.telephone = null;

  // Supprimer champs non modifiables
  delete dataToUpdate.compteId;
  delete dataToUpdate.id;
  delete dataToUpdate.createdAt;
  delete dataToUpdate.updatedAt;

  const associe = await prisma.associe.update({
    where: { id },
    data: dataToUpdate,
    include: {
      compte: true,
    },
  });

  res.status(200).json({
    success: true,
    data: associe,
  });
});

// @desc    Supprimer un associé
// @route   DELETE /api/associes/:id
// @access  Public
exports.deleteAssocie = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const associe = await prisma.associe.findUnique({
    where: { id },
  });

  if (!associe) {
    return res.status(404).json({
      success: false,
      error: 'Associé non trouvé',
    });
  }

  await prisma.associe.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Associé supprimé avec succès',
  });
});