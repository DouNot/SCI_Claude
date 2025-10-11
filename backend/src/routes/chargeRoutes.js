const express = require('express');
const router = express.Router();
const {
  getAllCharges,
  getChargesByBien,
  getChargeById,
  createCharge,
  updateCharge,
  deleteCharge,
  addPaiement,
  deletePaiement,
} = require('../controllers/chargeController');

// Routes pour les charges
router.get('/', getAllCharges);
router.get('/bien/:bienId', getChargesByBien);
router.get('/:id', getChargeById);
router.post('/', createCharge);
router.put('/:id', updateCharge);
router.delete('/:id', deleteCharge);

// Routes pour les paiements
router.post('/:id/paiements', addPaiement);
router.delete('/paiements/:paiementId', deletePaiement);

module.exports = router;
