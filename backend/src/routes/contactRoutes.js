const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireSpaceAccess } = require('../middleware/spaceAccess');
const {
  getAllContacts,
  getContactById,
  getContactsByType,
  createContact,
  updateContact,
  deleteContact,
} = require('../controllers/contactController');

router.get('/', requireAuth, requireSpaceAccess, getAllContacts);
router.get('/type/:type', requireAuth, requireSpaceAccess, getContactsByType);
router.get('/:id', requireAuth, requireSpaceAccess, getContactById);
router.post('/', requireAuth, requireSpaceAccess, createContact);
router.put('/:id', requireAuth, requireSpaceAccess, updateContact);
router.delete('/:id', requireAuth, requireSpaceAccess, deleteContact);

module.exports = router;
