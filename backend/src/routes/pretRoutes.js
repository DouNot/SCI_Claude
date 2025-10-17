const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireSpaceAccess } = require('../middleware/spaceAccess');
const {
  getAllPrets,
  getPretById,
  getPretsByBien,
  createPret,
  updatePret,
  deletePret,
} = require('../controllers/pretController');

router.get('/', requireAuth, requireSpaceAccess, getAllPrets);
router.get('/bien/:bienId', requireAuth, requireSpaceAccess, getPretsByBien);
router.get('/:id', requireAuth, requireSpaceAccess, getPretById);
router.post('/', requireAuth, requireSpaceAccess, createPret);
router.put('/:id', requireAuth, requireSpaceAccess, updatePret);
router.delete('/:id', requireAuth, requireSpaceAccess, deletePret);

module.exports = router;
