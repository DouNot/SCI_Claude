const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireSpaceAccess } = require('../middleware/spaceAccess');
const {
  getAllTravaux,
  getTravauxById,
  getTravauxByBien,
  createTravaux,
  updateTravaux,
  deleteTravaux,
} = require('../controllers/travauxController');

router.get('/', requireAuth, requireSpaceAccess, getAllTravaux);
router.get('/bien/:bienId', requireAuth, requireSpaceAccess, getTravauxByBien);
router.get('/:id', requireAuth, requireSpaceAccess, getTravauxById);
router.post('/', requireAuth, requireSpaceAccess, createTravaux);
router.put('/:id', requireAuth, requireSpaceAccess, updateTravaux);
router.delete('/:id', requireAuth, requireSpaceAccess, deleteTravaux);

module.exports = router;
