const express = require('express');
const router = express.Router();
const {
  getAllAssocies,
  getAssociesByCompte,
  getAssocieById,
  createAssocie,
  updateAssocie,
  deleteAssocie,
} = require('../controllers/associeController');

router.route('/')
  .get(getAllAssocies)
  .post(createAssocie);

router.route('/compte/:compteId')
  .get(getAssociesByCompte);

router.route('/:id')
  .get(getAssocieById)
  .put(updateAssocie)
  .delete(deleteAssocie);

module.exports = router;