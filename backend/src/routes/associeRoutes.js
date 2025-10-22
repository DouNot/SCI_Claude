const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireSpaceAccess } = require('../middleware/spaceAccess');
const {
  getAllAssocies,
  getAssocieById,
  getAssociesBySpace,
  createAssocie,
  updateAssocie,
  deleteAssocie,
} = require('../controllers/associeController');

// Import des routes mouvements CCA
const mouvementCCARoutes = require('./mouvementCCARoutes');

router.get('/', requireAuth, requireSpaceAccess, getAllAssocies);
router.get('/space/:spaceId', requireAuth, requireSpaceAccess, getAssociesBySpace);
router.get('/:id', requireAuth, requireSpaceAccess, getAssocieById);
router.post('/', requireAuth, requireSpaceAccess, createAssocie);
router.put('/:id', requireAuth, requireSpaceAccess, updateAssocie);
router.delete('/:id', requireAuth, requireSpaceAccess, deleteAssocie);

// Routes imbriquées pour les mouvements CCA
router.use('/:associeId/mouvements-cca', mouvementCCARoutes);

module.exports = router;
