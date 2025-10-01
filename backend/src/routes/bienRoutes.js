const express = require('express');
const router = express.Router();
const {
  getBiens,
  getBien,
  createBien,
  updateBien,
  deleteBien,
} = require('../controllers/bienController');

// Routes CRUD
router.get('/', getBiens);           // GET /api/biens
router.get('/:id', getBien);         // GET /api/biens/:id
router.post('/', createBien);        // POST /api/biens
router.put('/:id', updateBien);      // PUT /api/biens/:id
router.delete('/:id', deleteBien);   // DELETE /api/biens/:id

module.exports = router;