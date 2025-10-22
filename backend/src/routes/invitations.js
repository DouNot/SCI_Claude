const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const {
  acceptInvitation,
  rejectInvitation,
  getPendingInvitations,
} = require('../controllers/invitationController');

// Routes pour les invitations côté utilisateur invité
router.get('/pending', requireAuth, getPendingInvitations);
router.post('/:token/accept', requireAuth, acceptInvitation);
router.post('/:token/reject', requireAuth, rejectInvitation);

module.exports = router;
