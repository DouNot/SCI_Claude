const express = require('express');
const router = express.Router();
const {
  getAllNotifications,
  getNotificationById,
  createNotification,
  marquerCommeLue,
  marquerToutesCommeLues,
  deleteNotification,
  supprimerToutesLues,
  genererNotificationsAutomatiques,
} = require('../controllers/notificationController');

// Routes pour les notifications
router.get('/', getAllNotifications);
router.get('/:id', getNotificationById);
router.post('/', createNotification);
router.put('/:id/lire', marquerCommeLue);
router.put('/lire-toutes', marquerToutesCommeLues);
router.delete('/:id', deleteNotification);
router.delete('/lues/toutes', supprimerToutesLues);

// Génération automatique
router.post('/generer', genererNotificationsAutomatiques);

module.exports = router;
