const express = require('express');
const router = express.Router();
const {
  getAllEvenements,
  getEvenementsByBien,
  getEvenementById,
  createEvenement,
  updateEvenement,
  deleteEvenement,
} = require('../controllers/evenementFiscalController');

router.route('/').get(getAllEvenements).post(createEvenement);
router.route('/bien/:bienId').get(getEvenementsByBien);
router.route('/:id').get(getEvenementById).put(updateEvenement).delete(deleteEvenement);

module.exports = router;