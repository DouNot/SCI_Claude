const express = require('express');
const router = express.Router();
const {
  genererQuittance,
  getQuittancesByBail,
} = require('../controllers/quittanceController');

// Routes
router.post('/generer', genererQuittance);
router.get('/bail/:bailId', getQuittancesByBail);

module.exports = router;