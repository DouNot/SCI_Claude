const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireSpaceAccess } = require('../middleware/spaceAccess');
const {
  getAllCharges,
  getChargeById,
  getChargesByBien,
  createCharge,
  updateCharge,
  deleteCharge,
  addPaiement,
  deletePaiement,
} = require('../controllers/chargeController');

router.get('/', requireAuth, requireSpaceAccess, getAllCharges);
router.get('/bien/:bienId', requireAuth, requireSpaceAccess, getChargesByBien);
router.get('/:id', requireAuth, requireSpaceAccess, getChargeById);
router.post('/', requireAuth, requireSpaceAccess, createCharge);
router.put('/:id', requireAuth, requireSpaceAccess, updateCharge);
router.delete('/:id', requireAuth, requireSpaceAccess, deleteCharge);
router.post('/:id/paiements', requireAuth, requireSpaceAccess, addPaiement);
router.delete('/paiements/:paiementId', requireAuth, requireSpaceAccess, deletePaiement);

module.exports = router;
