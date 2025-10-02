const express = require('express');
const router = express.Router();
const {
  getAllBiens,
  getBienById,
  createBien,
  updateBien,
  deleteBien,
} = require('../controllers/bienController');

// Routes
router.get('/', getAllBiens);
router.get('/:id', getBienById);
router.post('/', createBien);
router.put('/:id', updateBien);
router.delete('/:id', deleteBien);

module.exports = router;