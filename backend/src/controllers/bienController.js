const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Récupérer tous les biens
// @route   GET /api/biens
// @access  Public (à sécuriser plus tard)
exports.getAllBiens = asyncHandler(async (req, res) => {
  const biens = await prisma.bien.findMany({
    include: {
      compte: true,
      photos: true,
      baux: {
        where: {
          statut: 'ACTIF'
        },
        include: {
          locataire: true
        }
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calculer le statut pour chaque bien
  const biensAvecStatut = biens.map(bien => {
    const bailActif = bien.baux && bien.baux.length > 0 ? bien.baux[0] : null;
    return {
      ...bien,
      statut: bailActif ? 'LOUE' : 'LIBRE',
      bailActif: bailActif,
      loyerActuel: bailActif ? bailActif.loyerHC : null,
      chargesActuelles: bailActif ? bailActif.charges : null,
      locataireActuel: bailActif ? bailActif.locataire : null
    };
  });

  res.status(200).json({
    success: true,
    count: biensAvecStatut.length,
    data: biensAvecStatut,
  });
});

// @desc    Récupérer un bien par ID
// @route   GET /api/biens/:id
// @access  Public (à sécuriser plus tard)
exports.getBienById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bien = await prisma.bien.findUnique({
    where: { id },
    include: {
      compte: true,
      photos: true,
      locataires: true,
      documents: true,
      travaux: true,
      factures: true,
      prets: true,
      baux: {
        where: {
          statut: 'ACTIF'
        },
        include: {
          locataire: true
        }
      },
    },
  });

  if (!bien) {
    return res.status(404).json({
      success: false,
      error: 'Bien non trouvé',
    });
  }

  // Calculer le statut du bien
  const bailActif = bien.baux && bien.baux.length > 0 ? bien.baux[0] : null;
  const bienAvecStatut = {
    ...bien,
    statut: bailActif ? 'LOUE' : 'LIBRE',
    bailActif: bailActif,
    loyerActuel: bailActif ? bailActif.loyerHC : null,
    chargesActuelles: bailActif ? bailActif.charges : null,
    locataireActuel: bailActif ? bailActif.locataire : null
  };

  res.status(200).json({
    success: true,
    data: bienAvecStatut,
  });
});

// @desc    Créer un nouveau bien
// @route   POST /api/biens
// @access  Public (à sécuriser plus tard)
exports.createBien = asyncHandler(async (req, res) => {
  const data = req.body;

  // Validation basique
  if (!data.adresse || !data.ville || !data.codePostal || !data.type || !data.surface || !data.prixAchat || !data.dateAchat) {
    return res.status(400).json({
      success: false,
      error: 'Champs requis manquants',
    });
  }

  // Nettoyer les données : convertir chaînes vides en null pour les champs numériques
  const dataToCreate = { ...data };

  // Champs numériques : convertir "" en null ou en nombre
  const numericFields = ['surface', 'nbPieces', 'nbChambres', 'etage', 'prixAchat', 'fraisNotaire', 'valeurActuelle'];
  
  numericFields.forEach(field => {
    if (dataToCreate[field] === '' || dataToCreate[field] === null || dataToCreate[field] === undefined) {
      dataToCreate[field] = null;
    } else if (dataToCreate[field]) {
      dataToCreate[field] = parseFloat(dataToCreate[field]);
    }
  });

  // Date : convertir en objet Date
  if (dataToCreate.dateAchat) {
    dataToCreate.dateAchat = new Date(dataToCreate.dateAchat);
  }

  // Champs texte : convertir "" en null pour description
  if (dataToCreate.description === '') {
    dataToCreate.description = null;
  }

  // Ajouter le compteId par défaut (prépare V2)
  dataToCreate.compteId = process.env.DEFAULT_COMPTE_ID;
  
  // Le statut sera toujours LIBRE à la création (pas de bail)
  dataToCreate.statut = 'LIBRE';

  const bien = await prisma.bien.create({
    data: dataToCreate,
    include: {
      compte: true,
    },
  });

  res.status(201).json({
    success: true,
    data: { ...bien, bailActif: null, loyerActuel: null, chargesActuelles: null, locataireActuel: null },
  });
});

// @desc    Mettre à jour un bien
// @route   PUT /api/biens/:id
// @access  Public (à sécuriser plus tard)
exports.updateBien = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  // Vérifier que le bien existe
  const bienExistant = await prisma.bien.findUnique({
    where: { id },
  });

  if (!bienExistant) {
    return res.status(404).json({
      success: false,
      error: 'Bien non trouvé',
    });
  }

  // Nettoyer les données : convertir chaînes vides en null pour les champs numériques
  const dataToUpdate = { ...data };

  // Champs numériques : convertir "" en null
  const numericFields = ['surface', 'nbPieces', 'nbChambres', 'etage', 'prixAchat', 'fraisNotaire', 'valeurActuelle'];
  
  numericFields.forEach(field => {
    if (dataToUpdate[field] === '' || dataToUpdate[field] === null || dataToUpdate[field] === undefined) {
      dataToUpdate[field] = null;
    } else if (dataToUpdate[field]) {
      dataToUpdate[field] = parseFloat(dataToUpdate[field]);
    }
  });

  // Date : convertir en objet Date si présente
  if (dataToUpdate.dateAchat && dataToUpdate.dateAchat !== '') {
    dataToUpdate.dateAchat = new Date(dataToUpdate.dateAchat);
  }

  // Champs texte : convertir "" en null pour description
  if (dataToUpdate.description === '') {
    dataToUpdate.description = null;
  }

  // Supprimer les champs qui ne doivent pas être mis à jour
  delete dataToUpdate.compteId;
  delete dataToUpdate.id;
  delete dataToUpdate.createdAt;
  delete dataToUpdate.updatedAt;

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
// @access  Public (à sécuriser plus tard)
exports.deleteBien = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Vérifier que le bien existe
  const bien = await prisma.bien.findUnique({
    where: { id },
  });

  if (!bien) {
    return res.status(404).json({
      success: false,
      error: 'Bien non trouvé',
    });
  }

  // Supprimer le bien (cascade supprimera automatiquement les relations)
  await prisma.bien.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Bien supprimé avec succès',
  });
});