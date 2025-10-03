const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

// Fonction utilitaire : calculer le tableau d'amortissement
const calculerAmortissement = (montant, tauxAnnuel, dureeEnMois, tauxAssurance = 0, dateDebut) => {
  const tauxMensuel = tauxAnnuel / 100 / 12;
  const tauxAssuranceMensuel = tauxAssurance / 100 / 12;
  
  // Formule de calcul de mensualité (hors assurance)
  const mensualiteCapitalInterets = montant * (tauxMensuel * Math.pow(1 + tauxMensuel, dureeEnMois)) / (Math.pow(1 + tauxMensuel, dureeEnMois) - 1);
  
  const mensualiteAssurance = montant * tauxAssuranceMensuel;
  const mensualiteTotale = mensualiteCapitalInterets + mensualiteAssurance;
  
  let capitalRestant = montant;
  const tableau = [];
  
  const date = new Date(dateDebut);
  
  for (let i = 1; i <= dureeEnMois; i++) {
    const interets = capitalRestant * tauxMensuel;
    const capitalAmorti = mensualiteCapitalInterets - interets;
    capitalRestant -= capitalAmorti;
    
    // Ajuster le dernier mois pour éviter les arrondis négatifs
    if (i === dureeEnMois && capitalRestant < 0) {
      capitalRestant = 0;
    }
    
    tableau.push({
      mois: i,
      date: new Date(date.getFullYear(), date.getMonth() + i - 1, date.getDate()),
      mensualite: mensualiteTotale,
      capital: capitalAmorti,
      interets: interets,
      assurance: mensualiteAssurance,
      capitalRestant: Math.max(0, capitalRestant),
    });
  }
  
  return {
    mensualiteTotale,
    mensualiteCapitalInterets,
    mensualiteAssurance,
    tableau,
    coutTotal: mensualiteTotale * dureeEnMois,
    coutInterets: (mensualiteCapitalInterets * dureeEnMois) - montant,
    coutAssurance: mensualiteAssurance * dureeEnMois,
  };
};

// @desc    Récupérer tous les prêts
// @route   GET /api/prets
// @access  Public
exports.getAllPrets = asyncHandler(async (req, res) => {
  const prets = await prisma.pret.findMany({
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
    count: prets.length,
    data: prets,
  });
});

// @desc    Récupérer les prêts d'un bien
// @route   GET /api/prets/bien/:bienId
// @access  Public
exports.getPretsByBien = asyncHandler(async (req, res) => {
  const { bienId } = req.params;

  const prets = await prisma.pret.findMany({
    where: { bienId },
    orderBy: {
      dateDebut: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    count: prets.length,
    data: prets,
  });
});

// @desc    Récupérer un prêt par ID avec tableau d'amortissement
// @route   GET /api/prets/:id
// @access  Public
exports.getPretById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const pret = await prisma.pret.findUnique({
    where: { id },
    include: {
      bien: true,
    },
  });

  if (!pret) {
    return res.status(404).json({
      success: false,
      error: 'Prêt non trouvé',
    });
  }

  // Calculer le tableau d'amortissement
  const amortissement = calculerAmortissement(
    pret.montant,
    pret.taux,
    pret.duree,
    pret.tauxAssurance || 0,
    pret.dateDebut
  );

  res.status(200).json({
    success: true,
    data: {
      ...pret,
      amortissement,
    },
  });
});

// @desc    Créer un nouveau prêt
// @route   POST /api/prets
// @access  Public
exports.createPret = asyncHandler(async (req, res) => {
  const data = req.body;

  // Validation basique
  if (!data.montant || !data.taux || !data.duree || !data.dateDebut || !data.organisme || !data.bienId) {
    return res.status(400).json({
      success: false,
      error: 'Champs requis manquants (montant, taux, duree, dateDebut, organisme, bienId)',
    });
  }

  // Nettoyer les données
  const dataToCreate = { ...data };

  // Convertir numériques
  dataToCreate.montant = parseFloat(dataToCreate.montant);
  dataToCreate.taux = parseFloat(dataToCreate.taux);
  dataToCreate.duree = parseInt(dataToCreate.duree);
  
  if (dataToCreate.tauxAssurance === '' || !dataToCreate.tauxAssurance) {
    dataToCreate.tauxAssurance = null;
  } else {
    dataToCreate.tauxAssurance = parseFloat(dataToCreate.tauxAssurance);
  }

  // Date
  dataToCreate.dateDebut = new Date(dataToCreate.dateDebut);

  // Champs optionnels
  if (dataToCreate.numeroContrat === '') dataToCreate.numeroContrat = null;

  // Calculer la mensualité
  const amortissement = calculerAmortissement(
    dataToCreate.montant,
    dataToCreate.taux,
    dataToCreate.duree,
    dataToCreate.tauxAssurance || 0,
    dataToCreate.dateDebut
  );
  
  dataToCreate.mensualite = amortissement.mensualiteTotale;

  const pret = await prisma.pret.create({
    data: dataToCreate,
    include: {
      bien: true,
    },
  });

  res.status(201).json({
    success: true,
    data: pret,
  });
});

// @desc    Mettre à jour un prêt
// @route   PUT /api/prets/:id
// @access  Public
exports.updatePret = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const pretExistant = await prisma.pret.findUnique({
    where: { id },
  });

  if (!pretExistant) {
    return res.status(404).json({
      success: false,
      error: 'Prêt non trouvé',
    });
  }

  const dataToUpdate = { ...data };

  // Convertir numériques
  if (dataToUpdate.montant) {
    dataToUpdate.montant = parseFloat(dataToUpdate.montant);
  }
  if (dataToUpdate.taux) {
    dataToUpdate.taux = parseFloat(dataToUpdate.taux);
  }
  if (dataToUpdate.duree) {
    dataToUpdate.duree = parseInt(dataToUpdate.duree);
  }
  
  if (dataToUpdate.tauxAssurance === '' || !dataToUpdate.tauxAssurance) {
    dataToUpdate.tauxAssurance = null;
  } else if (dataToUpdate.tauxAssurance) {
    dataToUpdate.tauxAssurance = parseFloat(dataToUpdate.tauxAssurance);
  }

  // Date
  if (dataToUpdate.dateDebut && dataToUpdate.dateDebut !== '') {
    dataToUpdate.dateDebut = new Date(dataToUpdate.dateDebut);
  }

  // Champs optionnels
  if (dataToUpdate.numeroContrat === '') dataToUpdate.numeroContrat = null;

  // Recalculer la mensualité si nécessaire
  const montant = dataToUpdate.montant || pretExistant.montant;
  const taux = dataToUpdate.taux !== undefined ? dataToUpdate.taux : pretExistant.taux;
  const duree = dataToUpdate.duree || pretExistant.duree;
  const tauxAssurance = dataToUpdate.tauxAssurance !== undefined ? dataToUpdate.tauxAssurance : pretExistant.tauxAssurance;
  const dateDebut = dataToUpdate.dateDebut || pretExistant.dateDebut;

  const amortissement = calculerAmortissement(
    montant,
    taux,
    duree,
    tauxAssurance || 0,
    dateDebut
  );
  
  dataToUpdate.mensualite = amortissement.mensualiteTotale;

  // Supprimer champs non modifiables
  delete dataToUpdate.id;
  delete dataToUpdate.createdAt;
  delete dataToUpdate.updatedAt;

  const pret = await prisma.pret.update({
    where: { id },
    data: dataToUpdate,
    include: {
      bien: true,
    },
  });

  res.status(200).json({
    success: true,
    data: pret,
  });
});

// @desc    Supprimer un prêt
// @route   DELETE /api/prets/:id
// @access  Public
exports.deletePret = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const pret = await prisma.pret.findUnique({
    where: { id },
  });

  if (!pret) {
    return res.status(404).json({
      success: false,
      error: 'Prêt non trouvé',
    });
  }

  await prisma.pret.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Prêt supprimé avec succès',
  });
});