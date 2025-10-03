const express = require('express');
const router = express.Router();
const {
  getAllContacts,
  getContactsByType,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} = require('../controllers/contactController');

router.route('/')
  .get(getAllContacts)
  .post(createContact);

router.route('/type/:type')
  .get(getContactsByType);

router.route('/:id')
  .get(getContactById)
  .put(updateContact)
  .delete(deleteContact);

module.exports = router;