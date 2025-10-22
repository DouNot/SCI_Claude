const express = require('express');
const router = express.Router({ mergeParams: true }); // Pour récupérer associeId depuis le parent
const { requireAuth } = require('../middleware/auth');
const { requireSpaceAccess } = require('../middleware/spaceAccess');
const {
  getMouvementsByAssocie,
  createMouvement,
  updateMouvement,
  deleteMouvement,
  getSoldeCCA,
} = require('../controllers/mouvementCCAController');

// Routes pour un associé spécifique
router.get('/', requireAuth, requireSpaceAccess, getMouvementsByAssocie);
router.post('/', requireAuth, requireSpaceAccess, createMouvement);
router.get('/solde', requireAuth, requireSpaceAccess, getSoldeCCA);

// Routes pour un mouvement spécifique
router.put('/:id', requireAuth, requireSpaceAccess, updateMouvement);
router.delete('/:id', requireAuth, requireSpaceAccess, deleteMouvement);

module.exports = router;
