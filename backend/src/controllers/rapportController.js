const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const { genererRapportPDF } = require('../services/pdfService');

// @desc    Créer un nouveau rapport annuel
// @route   POST /api/spaces/:spaceId/rapports
// @access  Private
exports.createRapport = asyncHandler(async (req, res) => {
  const { spaceId } = req.params;
  const { nom, annee, type, dateDebut, dateFin } = req.body;
  const userId = req.user.id;

  // Validation
  if (!nom || !annee) {
    return res.status(400).json({
      success: false,
      error: 'Nom et année requis',
    });
  }

  // Dates par défaut si non fournies
  const debut = dateDebut ? new Date(dateDebut) : new Date(annee, 0, 1);
  const fin = dateFin ? new Date(dateFin) : new Date(annee, 11, 31, 23, 59, 59);

  // Créer le rapport en brouillon
  const rapport = await prisma.rapportAnnuel.create({
    data: {
      spaceId,
      nom,
      annee: parseInt(annee),
      type: type || 'COMPLET',
      dateDebut: debut,
      dateFin: fin,
      statut: 'BROUILLON',
      generePar: userId,
    },
  });

  res.status(201).json({
    success: true,
    data: rapport,
  });
});

// @desc    Générer le PDF d'un rapport
// @route   POST /api/spaces/:spaceId/rapports/:rapportId/generer
// @access  Private
exports.genererRapport = asyncHandler(async (req, res) => {
  const { rapportId } = req.params;
  const userId = req.user.id;

  // Récupérer le rapport
  const rapport = await prisma.rapportAnnuel.findUnique({
    where: { id: rapportId },
  });

  if (!rapport) {
    return res.status(404).json({
      success: false,
      error: 'Rapport introuvable',
    });
  }

  // Générer le PDF
  const pdfInfo = await genererRapportPDF(
    rapport.id,
    rapport.spaceId,
    rapport.annee,
    rapport.dateDebut,
    rapport.dateFin
  );

  // Mettre à jour le rapport
  const rapportGenere = await prisma.rapportAnnuel.update({
    where: { id: rapportId },
    data: {
      urlPdf: pdfInfo.url,
      filename: pdfInfo.filename,
      tailleFichier: pdfInfo.tailleFichier,
      donnees: pdfInfo.donnees,
      statut: 'GENERE',
      dateGeneration: new Date(),
      generePar: userId,
    },
  });

  res.status(200).json({
    success: true,
    message: 'Rapport généré avec succès',
    data: rapportGenere,
  });
});

// @desc    Récupérer tous les rapports d'un espace
// @route   GET /api/spaces/:spaceId/rapports
// @access  Private
exports.getRapports = asyncHandler(async (req, res) => {
  const { spaceId } = req.params;

  const rapports = await prisma.rapportAnnuel.findMany({
    where: { spaceId },
    orderBy: [
      { annee: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  res.status(200).json({
    success: true,
    count: rapports.length,
    data: rapports,
  });
});

// @desc    Récupérer un rapport
// @route   GET /api/spaces/:spaceId/rapports/:rapportId
// @access  Private
exports.getRapport = asyncHandler(async (req, res) => {
  const { rapportId } = req.params;

  const rapport = await prisma.rapportAnnuel.findUnique({
    where: { id: rapportId },
  });

  if (!rapport) {
    return res.status(404).json({
      success: false,
      error: 'Rapport introuvable',
    });
  }

  // Parser les données si elles existent
  if (rapport.donnees) {
    try {
      rapport.donneesJson = JSON.parse(rapport.donnees);
    } catch (e) {
      rapport.donneesJson = null;
    }
  }

  res.status(200).json({
    success: true,
    data: rapport,
  });
});

// @desc    Mettre à jour un rapport
// @route   PATCH /api/spaces/:spaceId/rapports/:rapportId
// @access  Private
exports.updateRapport = asyncHandler(async (req, res) => {
  const { rapportId } = req.params;
  const updates = req.body;

  // Ne pas permettre la modification de certains champs
  delete updates.urlPdf;
  delete updates.filename;
  delete updates.tailleFichier;
  delete updates.donnees;
  delete updates.dateGeneration;

  const rapport = await prisma.rapportAnnuel.update({
    where: { id: rapportId },
    data: updates,
  });

  res.status(200).json({
    success: true,
    data: rapport,
  });
});

// @desc    Supprimer un rapport
// @route   DELETE /api/spaces/:spaceId/rapports/:rapportId
// @access  Private
exports.deleteRapport = asyncHandler(async (req, res) => {
  const { rapportId } = req.params;

  // Récupérer le rapport pour supprimer le fichier
  const rapport = await prisma.rapportAnnuel.findUnique({
    where: { id: rapportId },
  });

  if (rapport && rapport.filename) {
    const fs = require('fs');
    const path = require('path');
    const filepath = path.join(__dirname, '../../uploads/rapports', rapport.filename);
    
    // Supprimer le fichier s'il existe
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }

  // Supprimer le rapport
  await prisma.rapportAnnuel.delete({
    where: { id: rapportId },
  });

  res.status(200).json({
    success: true,
    message: 'Rapport supprimé',
  });
});

// @desc    Télécharger le PDF d'un rapport
// @route   GET /api/spaces/:spaceId/rapports/:rapportId/download
// @access  Private
exports.downloadRapport = asyncHandler(async (req, res) => {
  const { rapportId } = req.params;

  const rapport = await prisma.rapportAnnuel.findUnique({
    where: { id: rapportId },
  });

  if (!rapport || !rapport.filename) {
    return res.status(404).json({
      success: false,
      error: 'Fichier PDF introuvable',
    });
  }

  const path = require('path');
  const filepath = path.join(__dirname, '../../uploads/rapports', rapport.filename);

  // Vérifier que le fichier existe
  const fs = require('fs');
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({
      success: false,
      error: 'Fichier introuvable sur le serveur',
    });
  }

  // Télécharger le fichier
  res.download(filepath, `rapport_${rapport.annee}.pdf`);
});
