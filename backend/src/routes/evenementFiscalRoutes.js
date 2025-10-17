const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireSpaceAccess } = require('../middleware/spaceAccess');
const {
  getAllEvenements,
  getEvenementById,
  getEvenementsByBien,
  createEvenement,
  updateEvenement,
  deleteEvenement,
} = require('../controllers/evenementFiscalController');

router.get('/', requireAuth, requireSpaceAccess, getAllEvenements);
router.get('/bien/:bienId', requireAuth, requireSpaceAccess, getEvenementsByBien);
router.get('/:id', requireAuth, requireSpaceAccess, getEvenementById);
router.post('/', requireAuth, requireSpaceAccess, createEvenement);
router.put('/:id', requireAuth, requireSpaceAccess, updateEvenement);
router.delete('/:id', requireAuth, requireSpaceAccess, deleteEvenement);

module.exports = router;
