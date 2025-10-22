const express = require('express');
const router = express.Router({ mergeParams: true });
const { requireAuth } = require('../middleware/auth');
const { requireSpaceAccess } = require('../middleware/spaceAccess');
const {
  createProjection,
  getProjections,
  getProjection,
  updateProjection,
  updateHypotheses,
  deleteProjection,
  calculerProjection,
} = require('../controllers/projectionController');

// Toutes les routes nécessitent auth + space access
router.use(requireAuth, requireSpaceAccess);

// Routes CRUD
router.route('/')
  .get(getProjections)
  .post(createProjection);

router.route('/:projectionId')
  .get(getProjection)
  .patch(updateProjection)
  .delete(deleteProjection);

// Routes spéciales
router.post('/:projectionId/calculer', calculerProjection);
router.patch('/:projectionId/hypotheses', updateHypotheses);

module.exports = router;
