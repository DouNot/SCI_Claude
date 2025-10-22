const express = require('express');
const router = express.Router({ mergeParams: true });
const { requireAuth } = require('../middleware/auth');
const { requireSpaceAccess } = require('../middleware/spaceAccess');
const {
  createRapport,
  genererRapport,
  getRapports,
  getRapport,
  updateRapport,
  deleteRapport,
  downloadRapport,
} = require('../controllers/rapportController');

// Toutes les routes nécessitent auth + space access
router.use(requireAuth, requireSpaceAccess);

// Routes CRUD
router.route('/')
  .get(getRapports)
  .post(createRapport);

router.route('/:rapportId')
  .get(getRapport)
  .patch(updateRapport)
  .delete(deleteRapport);

// Routes spéciales
router.post('/:rapportId/generer', genererRapport);
router.get('/:rapportId/download', downloadRapport);

module.exports = router;
