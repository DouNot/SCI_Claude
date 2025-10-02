const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Récupérer tous les baux
// @route   GET /api/baux
// @access  Public
exports.getAllBaux = asyncHandler(async (req, res) => {
  const baux = await prisma.bail.findMany({
    include: {
      bien: {
        select: {
          id: true,
          adresse: true,
          ville: true,
          type: true,
        },
      },
      locataire: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          typeLocataire: true,
          raisonSociale: true,
        },
      },
    },
    orderBy: {
      dateDebut: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    count: baux.length,
    data: baux,
  });
});

// @desc    Récupérer un bail par ID
// @route   GET /api/baux/:id
// @access  Public
exports.getBailById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bail = await prisma.bail.findUnique({
    where: { id },
    include: {
      bien: true,
      locataire: true,
      quittances: {
        orderBy: {
          annee: 'desc',
        },
      },
    },
  });

  if (!bail) {
    return res.status(404).json({
      success: false,
      error: 'Bail non trouvé',
    });
  }

  res.status(200).json({
    success: true,
    data: bail,
  });
});

// @desc    Créer un nouveau bail
// @route   POST /api/baux
// @access  Public
exports.createBail = asyncHandler(async (req, res) => {
  const data = req.body;

  // Validation basique
  if (!data.typeBail || !data.dateDebut || !data.duree || !data.loyerHC || !data.bienId || !data.locataireId) {
    return res.status(400).json({
      success: false,
      error: 'Champs requis manquants',
    });
  }

  // Nettoyer les données
  const dataToCreate = { ...data };

  // Convertir dates
  if (dataToCreate.dateDebut) {
    dataToCreate.dateDebut = new Date(dataToCreate.dateDebut);
  }
  if (dataToCreate.dateFin === '' || !dataToCreate.dateFin) {
    dataToCreate.dateFin = null;
  } else {
    dataToCreate.dateFin = new Date(dataToCreate.dateFin);
  }

  // Convertir champs numériques
  if (dataToCreate.duree) dataToCreate.duree = parseInt(dataToCreate.duree);
  if (dataToCreate.loyerHC) dataToCreate.loyerHC = parseFloat(dataToCreate.loyerHC);
  
  if (dataToCreate.charges === '' || dataToCreate.charges === null) {
    dataToCreate.charges = null;
  } else if (dataToCreate.charges) {
    dataToCreate.charges = parseFloat(dataToCreate.charges);
  }
  
  if (dataToCreate.depotGarantie === '' || dataToCreate.depotGarantie === null) {
    dataToCreate.depotGarantie = null;
  } else if (dataToCreate.depotGarantie) {
    dataToCreate.depotGarantie = parseFloat(dataToCreate.depotGarantie);
  }

  // Champs texte optionnels
  if (dataToCreate.indexRevision === '') dataToCreate.indexRevision = null;

  const bail = await prisma.bail.create({
    data: dataToCreate,
    include: {
      bien: true,
      locataire: true,
    },
  });

  res.status(201).json({
    success: true,
    data: bail,
  });
});

// @desc    Mettre à jour un bail
// @route   PUT /api/baux/:id
// @access  Public
exports.updateBail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  // Vérifier que le bail existe
  const bailExistant = await prisma.bail.findUnique({
    where: { id },
  });

  if (!bailExistant) {
    return res.status(404).json({
      success: false,
      error: 'Bail non trouvé',
    });
  }

  // Nettoyer les données
  const dataToUpdate = { ...data };

  // Convertir dates
  if (dataToUpdate.dateDebut && dataToUpdate.dateDebut !== '') {
    dataToUpdate.dateDebut = new Date(dataToUpdate.dateDebut);
  }
  if (dataToUpdate.dateFin === '' || !dataToUpdate.dateFin) {
    dataToUpdate.dateFin = null;
  } else if (dataToUpdate.dateFin) {
    dataToUpdate.dateFin = new Date(dataToUpdate.dateFin);
  }

  // Convertir champs numériques
  if (dataToUpdate.duree) dataToUpdate.duree = parseInt(dataToUpdate.duree);
  if (dataToUpdate.loyerHC) dataToUpdate.loyerHC = parseFloat(dataToUpdate.loyerHC);
  
  if (dataToUpdate.charges === '' || dataToUpdate.charges === null) {
    dataToUpdate.charges = null;
  } else if (dataToUpdate.charges) {
    dataToUpdate.charges = parseFloat(dataToUpdate.charges);
  }
  
  if (dataToUpdate.depotGarantie === '' || dataToUpdate.depotGarantie === null) {
    dataToUpdate.depotGarantie = null;
  } else if (dataToUpdate.depotGarantie) {
    dataToUpdate.depotGarantie = parseFloat(dataToUpdate.depotGarantie);
  }

  if (dataToUpdate.indexRevision === '') dataToUpdate.indexRevision = null;

  // Supprimer les champs qui ne doivent pas être mis à jour
  delete dataToUpdate.id;
  delete dataToUpdate.createdAt;
  delete dataToUpdate.updatedAt;

  const bail = await prisma.bail.update({
    where: { id },
    data: dataToUpdate,
    include: {
      bien: true,
      locataire: true,
    },
  });

  res.status(200).json({
    success: true,
    data: bail,
  });
});

// @desc    Supprimer un bail
// @route   DELETE /api/baux/:id
// @access  Public
exports.deleteBail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Vérifier que le bail existe
  const bail = await prisma.bail.findUnique({
    where: { id },
  });

  if (!bail) {
    return res.status(404).json({
      success: false,
      error: 'Bail non trouvé',
    });
  }

  await prisma.bail.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Bail supprimé avec succès',
  });
});