const express = require('express');
const router = express.Router({ mergeParams: true });
const { requireAuth } = require('../middleware/auth');
const { requireSpaceAccess } = require('../middleware/spaceAccess');
const {
  createBusinessPlan,
  genererBusinessPlan,
  getBusinessPlans,
  getBusinessPlan,
  updateBusinessPlan,
  changerStatut,
  deleteBusinessPlan,
  downloadBusinessPlan,
  previewBusinessPlan, // 🆕 Route sans middleware auth
  simulerBusinessPlan,
} = require('../controllers/businessPlanController');

// 🆕 Route preview SANS middleware (token en query param)
router.get('/:businessPlanId/preview', previewBusinessPlan);

// Toutes les AUTRES routes nécessitent auth + space access
router.use(requireAuth, requireSpaceAccess);

// Routes CRUD
router.route('/')
  .get(getBusinessPlans)
  .post(createBusinessPlan);

router.route('/:businessPlanId')
  .get(getBusinessPlan)
  .patch(updateBusinessPlan)
  .delete(deleteBusinessPlan);

// Routes spéciales
router.post('/:businessPlanId/generer', genererBusinessPlan);
router.patch('/:businessPlanId/statut', changerStatut);
router.get('/:businessPlanId/download', downloadBusinessPlan);
router.post('/:businessPlanId/simuler', simulerBusinessPlan);

module.exports = router;
