const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// ============================================
// MULTER CONFIGURATION
// ============================================

// Configuration du stockage des photos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/biens');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `photo-${uniqueSuffix}${ext}`);
  }
});

// Filtre pour accepter uniquement les images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format de fichier non autorisé. Utilisez JPEG, PNG, GIF ou WebP.'), false);
  }
};

// Configuration de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// Middleware d'upload (à exporter pour l'utiliser dans les routes)
exports.uploadMiddleware = upload.array('photos', 10); // Max 10 photos

// ============================================
// HELPERS
// ============================================

/**
 * Vérifier qu'un bien appartient à un Space
 */
async function verifyBienInSpace(bienId, spaceId) {
  const bien = await prisma.bien.findUnique({
    where: { id: bienId },
    select: { spaceId: true }
  });
  
  if (!bien) {
    throw new Error('BIEN_NOT_FOUND');
  }
  
  if (bien.spaceId !== spaceId) {
    throw new Error('BIEN_NOT_IN_SPACE');
  }
  
  return true;
}

// ============================================
// CONTROLLERS
// ============================================

// @desc    Récupérer les photos d'un bien
// @route   GET /api/photos/bien/:bienId
// @access  Auth + Space
exports.getPhotosByBien = asyncHandler(async (req, res) => {
  const { bienId } = req.params;
  const spaceId = req.params.spaceId || req.query.spaceId;
  
  // Vérifier que le bien appartient au Space
  if (spaceId) {
    try {
      await verifyBienInSpace(bienId, spaceId);
    } catch (error) {
      if (error.message === 'BIEN_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: 'Bien non trouvé',
        });
      }
      return res.status(403).json({
        success: false,
        error: 'Ce bien n\'appartient pas à cet espace',
        code: 'BIEN_NOT_IN_SPACE'
      });
    }
  }
  
  const photos = await prisma.photo.findMany({
    where: { bienId },
    orderBy: [{ isPrimary: 'desc' }, { ordre: 'asc' }],
  });
  
  res.status(200).json({ 
    success: true, 
    count: photos.length, 
    data: photos 
  });
});

// @desc    Upload de photos pour un bien
// @route   POST /api/photos/upload/:bienId
// @access  Auth + Space (MEMBER minimum)
exports.uploadPhotos = asyncHandler(async (req, res) => {
  const { bienId } = req.params;
  const spaceId = req.params.spaceId || req.body.spaceId;
  
  // Vérifier que le bien existe et appartient au Space
  const bien = await prisma.bien.findUnique({
    where: { id: bienId },
    select: { id: true, spaceId: true }
  });
  
  if (!bien) {
    return res.status(404).json({
      success: false,
      error: 'Bien non trouvé'
    });
  }
  
  if (spaceId && bien.spaceId !== spaceId) {
    return res.status(403).json({
      success: false,
      error: 'Ce bien n\'appartient pas à cet espace',
      code: 'BIEN_NOT_IN_SPACE'
    });
  }
  
  // Vérifier qu'il y a des fichiers uploadés
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Aucune photo fournie'
    });
  }
  
  // Récupérer l'ordre maximum actuel
  const maxOrdreResult = await prisma.photo.findFirst({
    where: { bienId },
    orderBy: { ordre: 'desc' },
    select: { ordre: true }
  });
  
  let currentOrdre = maxOrdreResult ? maxOrdreResult.ordre + 1 : 0;
  
  // Vérifier s'il existe déjà une photo principale
  const hasPrimaryPhoto = await prisma.photo.findFirst({
    where: { 
      bienId,
      isPrimary: true 
    }
  });
  
  // Créer les enregistrements de photos
  const photosToCreate = req.files.map((file, index) => ({
    bienId,
    filename: file.filename,
    url: `/uploads/biens/${file.filename}`,
    ordre: currentOrdre + index,
    isPrimary: !hasPrimaryPhoto && index === 0 // Première photo = principale si aucune photo principale
  }));
  
  // Insérer en base de données
  const createdPhotos = await prisma.photo.createMany({
    data: photosToCreate
  });
  
  // Récupérer les photos créées pour les retourner
  const photos = await prisma.photo.findMany({
    where: { 
      bienId,
      filename: { in: req.files.map(f => f.filename) }
    },
    orderBy: { ordre: 'asc' }
  });
  
  res.status(201).json({
    success: true,
    message: `${req.files.length} photo(s) uploadée(s) avec succès`,
    count: photos.length,
    data: photos
  });
});

// @desc    Définir une photo comme principale
// @route   PUT /api/photos/:id/primary
// @access  Auth + Space (MEMBER minimum)
exports.setPrimaryPhoto = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const spaceId = req.params.spaceId || req.body.spaceId;
  
  const photo = await prisma.photo.findUnique({ 
    where: { id },
    include: {
      bien: { select: { spaceId: true } }
    }
  });
  
  if (!photo) {
    return res.status(404).json({ 
      success: false, 
      error: 'Photo non trouvée' 
    });
  }
  
  // Vérifier que la photo appartient au Space
  if (spaceId && photo.bien.spaceId !== spaceId) {
    return res.status(403).json({
      success: false,
      error: 'Cette photo n\'appartient pas à cet espace',
      code: 'PHOTO_NOT_IN_SPACE'
    });
  }

  // Retirer isPrimary des autres photos du même bien
  await prisma.photo.updateMany({
    where: { bienId: photo.bienId },
    data: { isPrimary: false },
  });

  // Définir cette photo comme principale
  const updatedPhoto = await prisma.photo.update({
    where: { id },
    data: { isPrimary: true },
  });

  res.status(200).json({ 
    success: true, 
    data: updatedPhoto 
  });
});

// @desc    Supprimer une photo
// @route   DELETE /api/photos/:id
// @access  Auth + Space (MEMBER minimum)
exports.deletePhoto = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const spaceId = req.params.spaceId || req.query.spaceId;
  
  const photo = await prisma.photo.findUnique({ 
    where: { id },
    include: {
      bien: { select: { spaceId: true } }
    }
  });
  
  if (!photo) {
    return res.status(404).json({ 
      success: false, 
      error: 'Photo non trouvée' 
    });
  }
  
  // Vérifier que la photo appartient au Space
  if (spaceId && photo.bien.spaceId !== spaceId) {
    return res.status(403).json({
      success: false,
      error: 'Cette photo n\'appartient pas à cet espace',
      code: 'PHOTO_NOT_IN_SPACE'
    });
  }

  // Supprimer le fichier physique
  try {
    const filePath = path.join(__dirname, '../../uploads/biens/', photo.filename);
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier:', error);
    // On continue même si la suppression du fichier échoue
  }

  // Supprimer l'enregistrement en base
  await prisma.photo.delete({ where: { id } });
  
  res.status(200).json({ 
    success: true, 
    message: 'Photo supprimée avec succès' 
  });
});
