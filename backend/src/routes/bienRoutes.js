const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireSpaceAccess } = require('../middleware/spaceAccess');
const {
  getAllBiens,
  getBienById,
  createBien,
  updateBien,
  deleteBien,
} = require('../controllers/bienController');

// Appliquer Auth + Space access sur chaque route
router.get('/', requireAuth, requireSpaceAccess, getAllBiens);
router.get('/:id', requireAuth, requireSpaceAccess, getBienById);
router.post('/', requireAuth, requireSpaceAccess, createBien);
router.put('/:id', requireAuth, requireSpaceAccess, updateBien);
router.delete('/:id', requireAuth, requireSpaceAccess, deleteBien);

module.exports = router;
