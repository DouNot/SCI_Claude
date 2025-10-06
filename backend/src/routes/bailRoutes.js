const express = require('express');
const router = express.Router();
const {
  getAllBaux,
  getBailById,
  getBauxByBien,
  createBail,
  updateBail,
  deleteBail,
} = require('../controllers/bailController');

// Routes
router.get('/', getAllBaux);
router.get('/bien/:bienId', getBauxByBien);
router.get('/:id', getBailById);
router.post('/', createBail);
router.put('/:id', updateBail);
router.delete('/:id', deleteBail);

module.exports = router;