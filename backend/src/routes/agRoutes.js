const express = require('express');
const router = express.Router();
const { getAllAG, getAGById, createAG, updateAG, deleteAG } = require('../controllers/agController');

router.get('/', getAllAG);
router.get('/:id', getAGById);
router.post('/', createAG);
router.put('/:id', updateAG);
router.delete('/:id', deleteAG);

module.exports = router;
