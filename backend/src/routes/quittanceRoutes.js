const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireSpaceAccess } = require('../middleware/spaceAccess');
const {
  genererQuittance,
  getQuittancesByBail,
} = require('../controllers/quittanceController');

router.post('/generer', requireAuth, requireSpaceAccess, genererQuittance);
router.get('/bail/:bailId', requireAuth, requireSpaceAccess, getQuittancesByBail);

module.exports = router;
