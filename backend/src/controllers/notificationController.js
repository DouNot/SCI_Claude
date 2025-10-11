const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Récupérer toutes les notifications
// @route   GET /api/notifications
// @access  Public
exports.getAllNotifications = asyncHandler(async (req, res) => {
  const { statut } = req.query; // Filtrer par statut si fourni

  const where = {};
  if (statut) {
    where.statut = statut;
  }

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: [
      { statut: 'asc' }, // NON_LUE en premier
      { priorite: 'desc' },
      { dateEcheance: 'asc' },
    ],
  });

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications,
  });
});

// @desc    Récupérer une notification par ID
// @route   GET /api/notifications/:id
// @access  Public
exports.getNotificationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      error: 'Notification non trouvée',
    });
  }

  res.status(200).json({
    success: true,
    data: notification,
  });
});

// @desc    Créer une nouvelle notification
// @route   POST /api/notifications
// @access  Public
exports.createNotification = asyncHandler(async (req, res) => {
  const data = req.body;

  // Validation basique
  if (!data.type || !data.titre || !data.message) {
    return res.status(400).json({
      success: false,
      error: 'Champs requis manquants (type, titre, message)',
    });
  }

  // Convertir les données
  const dataToCreate = { ...data };
  
  if (dataToCreate.dateEcheance) {
    dataToCreate.dateEcheance = new Date(dataToCreate.dateEcheance);
  }

  // Ajouter le compteId par défaut
  if (!dataToCreate.compteId) {
    const compte = await prisma.compte.findFirst();
    if (!compte) {
      return res.status(400).json({
        success: false,
        error: 'Aucun compte disponible',
      });
    }
    dataToCreate.compteId = compte.id;
  }

  const notification = await prisma.notification.create({
    data: dataToCreate,
  });

  res.status(201).json({
    success: true,
    data: notification,
  });
});

// @desc    Marquer une notification comme lue
// @route   PUT /api/notifications/:id/lire
// @access  Public
exports.marquerCommeLue = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      error: 'Notification non trouvée',
    });
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { statut: 'LUE' },
  });

  res.status(200).json({
    success: true,
    data: updated,
  });
});

// @desc    Marquer toutes les notifications comme lues
// @route   PUT /api/notifications/lire-toutes
// @access  Public
exports.marquerToutesCommeLues = asyncHandler(async (req, res) => {
  const result = await prisma.notification.updateMany({
    where: { statut: 'NON_LUE' },
    data: { statut: 'LUE' },
  });

  res.status(200).json({
    success: true,
    message: `${result.count} notification(s) marquée(s) comme lue(s)`,
  });
});

// @desc    Supprimer une notification
// @route   DELETE /api/notifications/:id
// @access  Public
exports.deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      error: 'Notification non trouvée',
    });
  }

  await prisma.notification.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Notification supprimée avec succès',
  });
});

// @desc    Supprimer toutes les notifications lues
// @route   DELETE /api/notifications/lues
// @access  Public
exports.supprimerToutesLues = asyncHandler(async (req, res) => {
  const result = await prisma.notification.deleteMany({
    where: { statut: 'LUE' },
  });

  res.status(200).json({
    success: true,
    message: `${result.count} notification(s) supprimée(s)`,
  });
});

// @desc    Générer les notifications automatiques
// @route   POST /api/notifications/generer
// @access  Public
exports.genererNotificationsAutomatiques = asyncHandler(async (req, res) => {
  const notificationsCreees = [];
  const compte = await prisma.compte.findFirst();
  
  if (!compte) {
    return res.status(400).json({
      success: false,
      error: 'Aucun compte disponible',
    });
  }

  const aujourdhui = new Date();
  const dans7Jours = new Date(aujourdhui);
  dans7Jours.setDate(dans7Jours.getDate() + 7);
  const dans30Jours = new Date(aujourdhui);
  dans30Jours.setDate(dans30Jours.getDate() + 30);

  // 1. Vérifier les baux qui arrivent à échéance
  const baux = await prisma.bail.findMany({
    where: {
      statut: 'ACTIF',
      dateFin: {
        gte: aujourdhui,
        lte: dans30Jours,
      },
    },
    include: {
      bien: true,
      locataire: true,
    },
  });

  for (const bail of baux) {
    const joursRestants = Math.ceil((new Date(bail.dateFin) - aujourdhui) / (1000 * 60 * 60 * 24));
    
    // Vérifier si une notification existe déjà
    const notifExistante = await prisma.notification.findFirst({
      where: {
        type: 'BAIL',
        lienId: bail.id,
        statut: 'NON_LUE',
      },
    });

    if (!notifExistante) {
      const notification = await prisma.notification.create({
        data: {
          type: 'BAIL',
          titre: 'Fin de bail à venir',
          message: `Le bail de ${bail.locataire.nom} ${bail.locataire.prenom} pour le bien ${bail.bien.adresse} arrive à échéance dans ${joursRestants} jours.`,
          priorite: joursRestants <= 7 ? 'HAUTE' : 'NORMALE',
          dateEcheance: bail.dateFin,
          lienType: 'Bail',
          lienId: bail.id,
          compteId: compte.id,
        },
      });
      notificationsCreees.push(notification);
    }
  }

  // 2. Vérifier les événements fiscaux à venir
  const evenements = await prisma.evenementFiscal.findMany({
    where: {
      estPaye: false,
      dateEcheance: {
        gte: aujourdhui,
        lte: dans30Jours,
      },
    },
    include: {
      bien: true,
    },
  });

  for (const evenement of evenements) {
    const joursRestants = Math.ceil((new Date(evenement.dateEcheance) - aujourdhui) / (1000 * 60 * 60 * 24));
    
    const notifExistante = await prisma.notification.findFirst({
      where: {
        type: 'FISCAL',
        lienId: evenement.id,
        statut: 'NON_LUE',
      },
    });

    if (!notifExistante) {
      const notification = await prisma.notification.create({
        data: {
          type: 'FISCAL',
          titre: `Échéance fiscale : ${evenement.type}`,
          message: `${evenement.type} pour le bien ${evenement.bien.adresse} à régler dans ${joursRestants} jours (${evenement.montant || 0}€).`,
          priorite: joursRestants <= 7 ? 'HAUTE' : 'NORMALE',
          dateEcheance: evenement.dateEcheance,
          lienType: 'EvenementFiscal',
          lienId: evenement.id,
          compteId: compte.id,
        },
      });
      notificationsCreees.push(notification);
    }
  }

  // 3. Vérifier les travaux planifiés
  const travaux = await prisma.travaux.findMany({
    where: {
      etat: 'PLANIFIE',
      dateDebut: {
        gte: aujourdhui,
        lte: dans7Jours,
      },
    },
    include: {
      bien: true,
    },
  });

  for (const travail of travaux) {
    const joursRestants = Math.ceil((new Date(travail.dateDebut) - aujourdhui) / (1000 * 60 * 60 * 24));
    
    const notifExistante = await prisma.notification.findFirst({
      where: {
        type: 'TRAVAUX',
        lienId: travail.id,
        statut: 'NON_LUE',
      },
    });

    if (!notifExistante) {
      const notification = await prisma.notification.create({
        data: {
          type: 'TRAVAUX',
          titre: `Travaux planifiés : ${travail.titre}`,
          message: `Les travaux "${travail.titre}" pour le bien ${travail.bien.adresse} commencent dans ${joursRestants} jours.`,
          priorite: joursRestants <= 2 ? 'HAUTE' : 'NORMALE',
          dateEcheance: travail.dateDebut,
          lienType: 'Travaux',
          lienId: travail.id,
          compteId: compte.id,
        },
      });
      notificationsCreees.push(notification);
    }
  }

  res.status(200).json({
    success: true,
    count: notificationsCreees.length,
    data: notificationsCreees,
    message: `${notificationsCreees.length} notification(s) générée(s)`,
  });
});
