const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireSpaceAccess } = require('../middleware/spaceAccess');
const {
  getAllDocuments,
  getDocumentById,
  getDocumentsByBien,
  createDocument,
  updateDocument,
  deleteDocument,
} = require('../controllers/documentController');

router.get('/', requireAuth, requireSpaceAccess, getAllDocuments);
router.get('/bien/:bienId', requireAuth, requireSpaceAccess, getDocumentsByBien);
router.get('/:id', requireAuth, requireSpaceAccess, getDocumentById);
router.post('/', requireAuth, requireSpaceAccess, createDocument);
router.put('/:id', requireAuth, requireSpaceAccess, updateDocument);
router.delete('/:id', requireAuth, requireSpaceAccess, deleteDocument);

module.exports = router;
