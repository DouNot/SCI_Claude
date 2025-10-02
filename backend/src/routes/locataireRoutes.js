const express = require('express');
const router = express.Router();
const {
  getAllLocataires,
  getLocataireById,
  createLocataire,
  updateLocataire,
  deleteLocataire,
} = require('../controllers/locataireController');

// Routes
router.get('/', getAllLocataires);
router.get('/:id', getLocataireById);
router.post('/', createLocataire);
router.put('/:id', updateLocataire);
router.delete('/:id', deleteLocataire);

module.exports = router;