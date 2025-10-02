const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const {
  getAllFactures,
  getFacturesByBien,
  getFactureById,
  createFacture,
  updateFacture,
  deleteFacture,
} = require('../controllers/factureController');

// Routes
router.get('/', getAllFactures);
router.get('/bien/:bienId', getFacturesByBien);
router.get('/:id', getFactureById);
router.post('/', upload.single('fichier'), createFacture);
router.put('/:id', updateFacture);
router.delete('/:id', deleteFacture);

module.exports = router;