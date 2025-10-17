const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireSpaceAccess } = require('../middleware/spaceAccess');
const {
  getPhotosByBien,
  uploadPhotos,
  uploadMiddleware,
  setPrimaryPhoto,
  deletePhoto,
} = require('../controllers/photoController');

// Appliquer Auth + Space access sur chaque route
router.get('/bien/:bienId', requireAuth, requireSpaceAccess, getPhotosByBien);
router.post('/upload/:bienId', requireAuth, requireSpaceAccess, uploadMiddleware, uploadPhotos);
router.put('/:photoId/primary', requireAuth, requireSpaceAccess, setPrimaryPhoto);
router.delete('/:photoId', requireAuth, requireSpaceAccess, deletePhoto);

module.exports = router;
