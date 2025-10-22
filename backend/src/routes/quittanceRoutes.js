const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireSpaceAccess } = require('../middleware/spaceAccess');
const {
  genererQuittance,
  getQuittancesByBail,
  getQuittancesBySpace,
  marquerPayee,
} = require('../controllers/quittanceController');

// Routes générales
router.post('/generer', requireAuth, requireSpaceAccess, genererQuittance);
router.get('/bail/:bailId', requireAuth, requireSpaceAccess, getQuittancesByBail);

// Routes pour Documents (listing de toutes les factures d'un space)
router.get('/space/:spaceId', requireAuth, requireSpaceAccess, getQuittancesBySpace);

// Marquer comme payée
router.patch('/:id/payer', requireAuth, requireSpaceAccess, marquerPayee);

module.exports = router;
