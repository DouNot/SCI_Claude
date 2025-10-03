const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Récupérer tous les travaux
// @route   GET /api/travaux
// @access  Public
exports.getAllTravaux = asyncHandler(async (req, res) => {
  const travaux = await prisma.travaux.findMany({
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
// @access  Public
exports.getTravauxByBien = asyncHandler(async (req, res) => {
  const { bienId } = req.params;

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
// @access  Public
exports.getTravauxById = asyncHandler(async (req, res) => {
  const { id } = req.params;

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

  res.status(200).json({
    success: true,
    data: travaux,
  });
});

// @desc    Créer de nouveaux travaux
// @route   POST /api/travaux
// @access  Public
exports.createTravaux = asyncHandler(async (req, res) => {
  const data = req.body;

  // Validation basique
  if (!data.titre || !data.dateDebut || !data.etat || !data.type || !data.bienId) {
    return res.status(400).json({
      success: false,
      error: 'Champs requis manquants (titre, dateDebut, etat, type, bienId)',
    });
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
  if (dataToCreate.categorie === '') dataToCreate.categorie = null;

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
// @access  Public
exports.updateTravaux = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const travauxExistants = await prisma.travaux.findUnique({
    where: { id },
  });

  if (!travauxExistants) {
    return res.status(404).json({
      success: false,
      error: 'Travaux non trouvés',
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

  // Supprimer champs non modifiables
  delete dataToUpdate.id;
  delete dataToUpdate.createdAt;
  delete dataToUpdate.updatedAt;

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
// @access  Public
exports.deleteTravaux = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const travaux = await prisma.travaux.findUnique({
    where: { id },
  });

  if (!travaux) {
    return res.status(404).json({
      success: false,
      error: 'Travaux non trouvés',
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