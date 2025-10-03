const express = require('express');
const router = express.Router();
const {
  getAllTravaux,
  getTravauxByBien,
  getTravauxById,
  createTravaux,
  updateTravaux,
  deleteTravaux,
} = require('../controllers/travauxController');

// Routes
router.get('/', getAllTravaux);
router.get('/bien/:bienId', getTravauxByBien);
router.get('/:id', getTravauxById);
router.post('/', createTravaux);
router.put('/:id', updateTravaux);
router.delete('/:id', deleteTravaux);

module.exports = router;