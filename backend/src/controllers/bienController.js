const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Récupérer tous les biens
// @route   GET /api/biens
// @access  Private (plus tard avec auth)
exports.getBiens = asyncHandler(async (req, res) => {
  const biens = await prisma.bien.findMany({
    include: {
      compte: true,
      photos: true,
      prets: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    count: biens.length,
    data: biens,
  });
});

// @desc    Récupérer un bien par ID
// @route   GET /api/biens/:id
// @access  Private
exports.getBien = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bien = await prisma.bien.findUnique({
    where: { id },
    include: {
      compte: true,
      photos: true,
      documents: true,
      prets: true,
      locataires: true,
      baux: {
        include: {
          locataire: true,
        },
      },
      factures: true,
      travaux: true,
    },
  });

  if (!bien) {
    return res.status(404).json({
      success: false,
      error: 'Bien non trouvé',
    });
  }

  res.status(200).json({
    success: true,
    data: bien,
  });
});

// @desc    Créer un nouveau bien
// @route   POST /api/biens
// @access  Private
exports.createBien = asyncHandler(async (req, res) => {
  const {
    adresse,
    ville,
    codePostal,
    pays,
    type,
    surface,
    nbPieces,
    nbChambres,
    etage,
    prixAchat,
    fraisNotaire,
    dateAchat,
    valeurActuelle,
    loyerHC,
    charges,
    statut,
    description,
    compteId,
    userId,
  } = req.body;

  // Validation basique
  if (!adresse || !ville || !codePostal || !type || !surface || !prixAchat || !dateAchat || !compteId || !userId) {
    return res.status(400).json({
      success: false,
      error: 'Veuillez fournir tous les champs obligatoires',
    });
  }

  const bien = await prisma.bien.create({
    data: {
      adresse,
      ville,
      codePostal,
      pays: pays || 'France',
      type,
      surface: parseFloat(surface),
      nbPieces: nbPieces ? parseInt(nbPieces) : null,
      nbChambres: nbChambres ? parseInt(nbChambres) : null,
      etage: etage ? parseInt(etage) : null,
      prixAchat: parseFloat(prixAchat),
      fraisNotaire: fraisNotaire ? parseFloat(fraisNotaire) : null,
      dateAchat: new Date(dateAchat),
      valeurActuelle: valeurActuelle ? parseFloat(valeurActuelle) : null,
      loyerHC: loyerHC ? parseFloat(loyerHC) : null,
      charges: charges ? parseFloat(charges) : null,
      statut: statut || 'LIBRE',
      description,
      compteId,
      userId,
    },
    include: {
      compte: true,
    },
  });

  res.status(201).json({
    success: true,
    data: bien,
  });
});

// @desc    Mettre à jour un bien
// @route   PUT /api/biens/:id
// @access  Private
exports.updateBien = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Vérifier si le bien existe
  const bienExiste = await prisma.bien.findUnique({
    where: { id },
  });

  if (!bienExiste) {
    return res.status(404).json({
      success: false,
      error: 'Bien non trouvé',
    });
  }

  // Préparer les données à mettre à jour
  const dataToUpdate = { ...req.body };

  // Convertir les types si nécessaire
  if (dataToUpdate.surface) dataToUpdate.surface = parseFloat(dataToUpdate.surface);
  if (dataToUpdate.nbPieces) dataToUpdate.nbPieces = parseInt(dataToUpdate.nbPieces);
  if (dataToUpdate.nbChambres) dataToUpdate.nbChambres = parseInt(dataToUpdate.nbChambres);
  if (dataToUpdate.etage) dataToUpdate.etage = parseInt(dataToUpdate.etage);
  if (dataToUpdate.prixAchat) dataToUpdate.prixAchat = parseFloat(dataToUpdate.prixAchat);
  if (dataToUpdate.fraisNotaire) dataToUpdate.fraisNotaire = parseFloat(dataToUpdate.fraisNotaire);
  if (dataToUpdate.valeurActuelle) dataToUpdate.valeurActuelle = parseFloat(dataToUpdate.valeurActuelle);
  if (dataToUpdate.loyerHC) dataToUpdate.loyerHC = parseFloat(dataToUpdate.loyerHC);
  if (dataToUpdate.charges) dataToUpdate.charges = parseFloat(dataToUpdate.charges);
  if (dataToUpdate.dateAchat) dataToUpdate.dateAchat = new Date(dataToUpdate.dateAchat);

  const bien = await prisma.bien.update({
    where: { id },
    data: dataToUpdate,
    include: {
      compte: true,
      photos: true,
    },
  });

  res.status(200).json({
    success: true,
    data: bien,
  });
});

// @desc    Supprimer un bien
// @route   DELETE /api/biens/:id
// @access  Private
exports.deleteBien = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bien = await prisma.bien.findUnique({
    where: { id },
  });

  if (!bien) {
    return res.status(404).json({
      success: false,
      error: 'Bien non trouvé',
    });
  }

  await prisma.bien.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: 'Bien supprimé avec succès',
  });
});