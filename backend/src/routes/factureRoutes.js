const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireSpaceAccess } = require('../middleware/spaceAccess');
const {
  getAllFactures,
  getFactureById,
  getFacturesByBien,
  createFacture,
  updateFacture,
  deleteFacture,
} = require('../controllers/factureController');

router.get('/', requireAuth, requireSpaceAccess, getAllFactures);
router.get('/bien/:bienId', requireAuth, requireSpaceAccess, getFacturesByBien);
router.get('/:id', requireAuth, requireSpaceAccess, getFactureById);
router.post('/', requireAuth, requireSpaceAccess, createFacture);
router.put('/:id', requireAuth, requireSpaceAccess, updateFacture);
router.delete('/:id', requireAuth, requireSpaceAccess, deleteFacture);

module.exports = router;
