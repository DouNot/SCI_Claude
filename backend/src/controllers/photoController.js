const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Récupérer les photos d'un bien
// @route   GET /api/photos/bien/:bienId
exports.getPhotosByBien = asyncHandler(async (req, res) => {
  const { bienId } = req.params;
  const photos = await prisma.photo.findMany({
    where: { bienId },
    orderBy: [{ isPrimary: 'desc' }, { ordre: 'asc' }],
  });
  res.status(200).json({ success: true, count: photos.length, data: photos });
});

// @desc    Définir une photo comme principale
// @route   PUT /api/photos/:id/primary
exports.setPrimaryPhoto = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) {
    return res.status(404).json({ success: false, error: 'Photo non trouvée' });
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

  res.status(200).json({ success: true, data: updatedPhoto });
});

// @desc    Supprimer une photo
// @route   DELETE /api/photos/:id
exports.deletePhoto = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) {
    return res.status(404).json({ success: false, error: 'Photo non trouvée' });
  }

  // TODO: Supprimer le fichier physique
  // const fs = require('fs');
  // const path = require('path');
  // fs.unlinkSync(path.join(__dirname, '../../uploads/biens/', photo.filename));

  await prisma.photo.delete({ where: { id } });
  res.status(200).json({ success: true, message: 'Photo supprimée' });
});