const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Récupérer tous les locataires
// @route   GET /api/locataires
// @access  Public
exports.getAllLocataires = asyncHandler(async (req, res) => {
  const locataires = await prisma.locataire.findMany({
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
      nom: 'asc',
    },
  });

  res.status(200).json({
    success: true,
    count: locataires.length,
    data: locataires,
  });
});

// @desc    Récupérer un locataire par ID
// @route   GET /api/locataires/:id
// @access  Public
exports.getLocataireById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const locataire = await prisma.locataire.findUnique({
    where: { id },
    include: {
      bien: true,
      baux: true,
    },
  });

  if (!locataire) {
    return res.status(404).json({
      success: false,
      error: 'Locataire non trouvé',
    });
  }

  res.status(200).json({
    success: true,
    data: locataire,
  });
});

// @desc    Créer un nouveau locataire
// @route   POST /api/locataires
// @access  Public
exports.createLocataire = asyncHandler(async (req, res) => {
  const data = req.body;

  // Validation basique
  if (!data.nom || !data.prenom || !data.email) {
    return res.status(400).json({
      success: false,
      error: 'Nom, prénom et email sont requis',
    });
  }

  // Validation spécifique pour les entreprises
  if (data.typeLocataire === 'ENTREPRISE' && !data.raisonSociale) {
    return res.status(400).json({
      success: false,
      error: 'Raison sociale requise pour une entreprise',
    });
  }

  // Nettoyer les données
  const dataToCreate = { ...data };

  // Convertir chaînes vides en null
  if (dataToCreate.typeLocataire === '') dataToCreate.typeLocataire = 'ENTREPRISE';
  if (dataToCreate.raisonSociale === '') dataToCreate.raisonSociale = null;
  if (dataToCreate.siret === '') dataToCreate.siret = null;
  if (dataToCreate.formeJuridique === '') dataToCreate.formeJuridique = null;
  if (dataToCreate.capitalSocial === '' || dataToCreate.capitalSocial === null) {
    dataToCreate.capitalSocial = null;
  } else {
    dataToCreate.capitalSocial = parseFloat(dataToCreate.capitalSocial);
  }
  if (dataToCreate.telephone === '') dataToCreate.telephone = null;
  if (dataToCreate.adresse === '') dataToCreate.adresse = null;
  if (dataToCreate.ville === '') dataToCreate.ville = null;
  if (dataToCreate.codePostal === '') dataToCreate.codePostal = null;
  if (dataToCreate.profession === '') dataToCreate.profession = null;
  if (dataToCreate.dateNaissance === '') {
    dataToCreate.dateNaissance = null;
  } else if (dataToCreate.dateNaissance) {
    dataToCreate.dateNaissance = new Date(dataToCreate.dateNaissance);
  }
  if (dataToCreate.dateEntree === '') {
    dataToCreate.dateEntree = null;
  } else if (dataToCreate.dateEntree) {
    dataToCreate.dateEntree = new Date(dataToCreate.dateEntree);
  }
  if (dataToCreate.dateSortie === '') {
    dataToCreate.dateSortie = null;
  } else if (dataToCreate.dateSortie) {
    dataToCreate.dateSortie = new Date(dataToCreate.dateSortie);
  }
  if (dataToCreate.bienId === '') dataToCreate.bienId = null;

  const locataire = await prisma.locataire.create({
    data: dataToCreate,
    include: {
      bien: true,
    },
  });

  res.status(201).json({
    success: true,
    data: locataire,
  });
});

// @desc    Mettre à jour un locataire
// @route   PUT /api/locataires/:id
// @access  Public
exports.updateLocataire = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  // Vérifier que le locataire existe
  const locataireExistant = await prisma.locataire.findUnique({
    where: { id },
  });

  if (!locataireExistant) {
    return res.status(404).json({
      success: false,
      error: 'Locataire non trouvé',
    });
  }

  // Nettoyer les données
  const dataToUpdate = { ...data };

  // Convertir chaînes vides en null
  if (dataToUpdate.raisonSociale === '') dataToUpdate.raisonSociale = null;
  if (dataToUpdate.siret === '') dataToUpdate.siret = null;
  if (dataToUpdate.formeJuridique === '') dataToUpdate.formeJuridique = null;
  if (dataToUpdate.capitalSocial === '' || dataToUpdate.capitalSocial === null) {
    dataToUpdate.capitalSocial = null;
  } else {
    dataToUpdate.capitalSocial = parseFloat(dataToUpdate.capitalSocial);
  }
  if (dataToUpdate.telephone === '') dataToUpdate.telephone = null;
  if (dataToUpdate.adresse === '') dataToUpdate.adresse = null;
  if (dataToUpdate.ville === '') dataToUpdate.ville = null;
  if (dataToUpdate.codePostal === '') dataToUpdate.codePostal = null;
  if (dataToUpdate.profession === '') dataToUpdate.profession = null;
  if (dataToUpdate.dateNaissance === '') {
    dataToUpdate.dateNaissance = null;
  } else if (dataToUpdate.dateNaissance) {
    dataToUpdate.dateNaissance = new Date(dataToUpdate.dateNaissance);
  }
  if (dataToUpdate.dateEntree === '') {
    dataToUpdate.dateEntree = null;
  } else if (dataToUpdate.dateEntree) {
    dataToUpdate.dateEntree = new Date(dataToUpdate.dateEntree);
  }
  if (dataToUpdate.dateSortie === '') {
    dataToUpdate.dateSortie = null;
  } else if (dataToUpdate.dateSortie) {
    dataToUpdate.dateSortie = new Date(dataToUpdate.dateSortie);
  }
  if (dataToUpdate.bienId === '') dataToUpdate.bienId = null;

  // Supprimer les champs qui ne doivent pas être mis à jour
  delete dataToUpdate.id;
  delete dataToUpdate.createdAt;
  delete dataToUpdate.updatedAt;

  const locataire = await prisma.locataire.update({
    where: { id },
    data: dataToUpdate,
    include: {
      bien: true,
    },
  });

  res.status(200).json({
    success: true,
    data: locataire,
  });
});

// @desc    Supprimer un locataire
// @route   DELETE /api/locataires/:id
// @access  Public
exports.deleteLocataire = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Vérifier que le locataire existe
  const locataire = await prisma.locataire.findUnique({
    where: { id },
  });

  if (!locataire) {
    return res.status(404).json({
      success: false,
      error: 'Locataire non trouvé',
    });
  }

  await prisma.locataire.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Locataire supprimé avec succès',
  });
});