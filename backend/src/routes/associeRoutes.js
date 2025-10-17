const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireSpaceAccess } = require('../middleware/spaceAccess');
const {
  getAllAssocies,
  getAssocieById,
  getAssociesBySpace,
  createAssocie,
  updateAssocie,
  deleteAssocie,
} = require('../controllers/associeController');

router.get('/', requireAuth, requireSpaceAccess, getAllAssocies);
router.get('/space/:spaceId', requireAuth, requireSpaceAccess, getAssociesBySpace);
router.get('/:id', requireAuth, requireSpaceAccess, getAssocieById);
router.post('/', requireAuth, requireSpaceAccess, createAssocie);
router.put('/:id', requireAuth, requireSpaceAccess, updateAssocie);
router.delete('/:id', requireAuth, requireSpaceAccess, deleteAssocie);

module.exports = router;
