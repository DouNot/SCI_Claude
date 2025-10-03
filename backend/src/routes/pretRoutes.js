const express = require('express');
const router = express.Router();
const {
  getAllPrets,
  getPretsByBien,
  getPretById,
  createPret,
  updatePret,
  deletePret,
} = require('../controllers/pretController');

router.route('/')
  .get(getAllPrets)
  .post(createPret);

router.route('/bien/:bienId')
  .get(getPretsByBien);

router.route('/:id')
  .get(getPretById)
  .put(updatePret)
  .delete(deletePret);

module.exports = router;