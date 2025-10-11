const express = require('express');
const router = express.Router();
const {
  genererQuittance,
  getQuittancesByBail,
  genererQuittancesEnLot,
  marquerPayee,
} = require('../controllers/quittanceController');

// Routes existantes
router.post('/generer', genererQuittance);
router.get('/bail/:bailId', getQuittancesByBail);

// Nouvelles routes (système amélioré)
router.post('/generer-lot', genererQuittancesEnLot);
router.patch('/:id/payer', marquerPayee);

module.exports = router;
