const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireSpaceAccess } = require('../middleware/spaceAccess');
const {
  getAllBaux,
  getBailById,
  getBauxByBien,
  createBail,
  updateBail,
  deleteBail,
} = require('../controllers/bailController');

// Appliquer Auth + Space access sur chaque route
router.get('/', requireAuth, requireSpaceAccess, getAllBaux);
router.get('/bien/:bienId', requireAuth, requireSpaceAccess, getBauxByBien);
router.get('/:id', requireAuth, requireSpaceAccess, getBailById);
router.post('/', requireAuth, requireSpaceAccess, createBail);
router.put('/:id', requireAuth, requireSpaceAccess, updateBail);
router.delete('/:id', requireAuth, requireSpaceAccess, deleteBail);

module.exports = router;
