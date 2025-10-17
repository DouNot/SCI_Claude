const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireSpaceAccess } = require('../middleware/spaceAccess');
const {
  getAllLocataires,
  getLocataireById,
  createLocataire,
  updateLocataire,
  deleteLocataire,
} = require('../controllers/locataireController');

// Appliquer Auth + Space access sur chaque route
router.get('/', requireAuth, requireSpaceAccess, getAllLocataires);
router.get('/:id', requireAuth, requireSpaceAccess, getLocataireById);
router.post('/', requireAuth, requireSpaceAccess, createLocataire);
router.put('/:id', requireAuth, requireSpaceAccess, updateLocataire);
router.delete('/:id', requireAuth, requireSpaceAccess, deleteLocataire);

module.exports = router;
