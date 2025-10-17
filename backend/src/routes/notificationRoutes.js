const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireSpaceAccess } = require('../middleware/spaceAccess');
const {
  getAllNotifications,
  getNotificationById,
  createNotification,
  marquerCommeLue,
  marquerToutesCommeLues,
  deleteNotification,
  supprimerToutesLues,
  genererNotifications,
} = require('../controllers/notificationController');

router.get('/', requireAuth, requireSpaceAccess, getAllNotifications);
router.get('/:id', requireAuth, requireSpaceAccess, getNotificationById);
router.post('/', requireAuth, requireSpaceAccess, createNotification);
router.put('/:id/lire', requireAuth, requireSpaceAccess, marquerCommeLue);
router.put('/lire-toutes', requireAuth, requireSpaceAccess, marquerToutesCommeLues);
router.delete('/:id', requireAuth, requireSpaceAccess, deleteNotification);
router.delete('/lues/toutes', requireAuth, requireSpaceAccess, supprimerToutesLues);
router.post('/generer', requireAuth, requireSpaceAccess, genererNotifications);

module.exports = router;
