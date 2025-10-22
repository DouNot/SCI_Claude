const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const { genererBusinessPlanPDF } = require('../services/businessPlanService');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-a-changer-en-production';

/**
 * Controller pour la gestion des Business Plans bancaires
 * Pour demandes de prêts, acquisitions, refinancements
 */

// @desc    Créer un nouveau business plan
// @route   POST /api/spaces/:spaceId/business-plans
// @access  Private (OWNER, MANAGER)
exports.createBusinessPlan = asyncHandler(async (req, res) => {
  const { spaceId } = req.params;
  const userId = req.user.id;
  const {
    nom,
    description,
    type,
    montantDemande,
    dureePret,
    tauxEstime,
    dureeProjection,
    banqueDestination,
    contactBanque,
    hypotheses,
  } = req.body;

  // Validation
  if (!nom || !type || !montantDemande || !dureePret) {
    return res.status(400).json({
      success: false,
      error: 'Nom, type, montant demandé et durée du prêt requis',
    });
  }

  // Créer le business plan
  const businessPlan = await prisma.businessPlan.create({
    data: {
      spaceId,
      nom,
      description,
      type,
      montantDemande: parseFloat(montantDemande),
      dureePret: parseInt(dureePret),
      tauxEstime: tauxEstime ? parseFloat(tauxEstime) : null,
      dureeProjection: dureeProjection ? parseInt(dureeProjection) : 10,
      banqueDestination,
      contactBanque,
      hypotheses: hypotheses ? JSON.stringify(hypotheses) : null,
      statut: 'BROUILLON',
      generePar: userId,
    },
  });

  res.status(201).json({
    success: true,
    data: businessPlan,
  });
});

// @desc    Générer le PDF du business plan
// @route   POST /api/spaces/:spaceId/business-plans/:businessPlanId/generer
// @access  Private
exports.genererBusinessPlan = asyncHandler(async (req, res) => {
  const { businessPlanId } = req.params;
  const userId = req.user.id;

  // Récupérer le business plan
  const businessPlan = await prisma.businessPlan.findUnique({
    where: { id: businessPlanId },
  });

  if (!businessPlan) {
    return res.status(404).json({
      success: false,
      error: 'Business plan introuvable',
    });
  }

  // Générer le PDF
  const pdfInfo = await genererBusinessPlanPDF(
    businessPlan.id,
    businessPlan.spaceId
  );

  // Mettre à jour le business plan
  const businessPlanGenere = await prisma.businessPlan.update({
    where: { id: businessPlanId },
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
    message: 'Business plan généré avec succès',
    data: businessPlanGenere,
  });
});

// @desc    Récupérer tous les business plans d'un espace
// @route   GET /api/spaces/:spaceId/business-plans
// @access  Private
exports.getBusinessPlans = asyncHandler(async (req, res) => {
  const { spaceId } = req.params;

  const businessPlans = await prisma.businessPlan.findMany({
    where: { spaceId },
    orderBy: [
      { statut: 'asc' },
      { createdAt: 'desc' },
    ],
  });

  res.status(200).json({
    success: true,
    count: businessPlans.length,
    data: businessPlans,
  });
});

// @desc    Récupérer un business plan
// @route   GET /api/spaces/:spaceId/business-plans/:businessPlanId
// @access  Private
exports.getBusinessPlan = asyncHandler(async (req, res) => {
  const { businessPlanId } = req.params;

  const businessPlan = await prisma.businessPlan.findUnique({
    where: { id: businessPlanId },
  });

  if (!businessPlan) {
    return res.status(404).json({
      success: false,
      error: 'Business plan introuvable',
    });
  }

  // Parser les données JSON si elles existent
  if (businessPlan.donnees) {
    try {
      businessPlan.donneesJson = JSON.parse(businessPlan.donnees);
    } catch (e) {
      businessPlan.donneesJson = null;
    }
  }

  if (businessPlan.hypotheses) {
    try {
      businessPlan.hypothesesJson = JSON.parse(businessPlan.hypotheses);
    } catch (e) {
      businessPlan.hypothesesJson = null;
    }
  }

  res.status(200).json({
    success: true,
    data: businessPlan,
  });
});

// @desc    Mettre à jour un business plan
// @route   PATCH /api/spaces/:spaceId/business-plans/:businessPlanId
// @access  Private
exports.updateBusinessPlan = asyncHandler(async (req, res) => {
  const { businessPlanId } = req.params;
  const updates = req.body;

  // Ne pas permettre la modification de certains champs
  delete updates.urlPdf;
  delete updates.filename;
  delete updates.tailleFichier;
  delete updates.donnees;
  delete updates.dateGeneration;
  delete updates.generePar;

  // Si hypothèses fournies, les stringify
  if (updates.hypotheses && typeof updates.hypotheses === 'object') {
    updates.hypotheses = JSON.stringify(updates.hypotheses);
  }

  const businessPlan = await prisma.businessPlan.update({
    where: { id: businessPlanId },
    data: updates,
  });

  res.status(200).json({
    success: true,
    data: businessPlan,
  });
});

// @desc    Changer le statut d'un business plan
// @route   PATCH /api/spaces/:spaceId/business-plans/:businessPlanId/statut
// @access  Private
exports.changerStatut = asyncHandler(async (req, res) => {
  const { businessPlanId } = req.params;
  const { statut, dateSoumission } = req.body;

  if (!['BROUILLON', 'GENERE', 'ENVOYE', 'VALIDE', 'REJETE'].includes(statut)) {
    return res.status(400).json({
      success: false,
      error: 'Statut invalide',
    });
  }

  const updates = { statut };

  // Si statut ENVOYE, ajouter la date de soumission
  if (statut === 'ENVOYE' && !dateSoumission) {
    updates.dateSoumission = new Date();
  } else if (dateSoumission) {
    updates.dateSoumission = new Date(dateSoumission);
  }

  const businessPlan = await prisma.businessPlan.update({
    where: { id: businessPlanId },
    data: updates,
  });

  res.status(200).json({
    success: true,
    data: businessPlan,
  });
});

// @desc    Supprimer un business plan
// @route   DELETE /api/spaces/:spaceId/business-plans/:businessPlanId
// @access  Private
exports.deleteBusinessPlan = asyncHandler(async (req, res) => {
  const { businessPlanId } = req.params;

  // Récupérer le business plan pour supprimer le fichier
  const businessPlan = await prisma.businessPlan.findUnique({
    where: { id: businessPlanId },
  });

  if (businessPlan && businessPlan.filename) {
    const filepath = path.join(__dirname, '../../uploads/business-plans', businessPlan.filename);

    // Supprimer le fichier s'il existe
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }

  // Supprimer le business plan
  await prisma.businessPlan.delete({
    where: { id: businessPlanId },
  });

  res.status(200).json({
    success: true,
    message: 'Business plan supprimé',
  });
});

// @desc    Télécharger le PDF d'un business plan
// @route   GET /api/spaces/:spaceId/business-plans/:businessPlanId/download
// @access  Private
exports.downloadBusinessPlan = asyncHandler(async (req, res) => {
  const { businessPlanId } = req.params;

  const businessPlan = await prisma.businessPlan.findUnique({
    where: { id: businessPlanId },
  });

  if (!businessPlan || !businessPlan.filename) {
    return res.status(404).json({
      success: false,
      error: 'Fichier PDF introuvable',
    });
  }

  const filepath = path.join(__dirname, '../../uploads/business-plans', businessPlan.filename);

  // Vérifier que le fichier existe
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({
      success: false,
      error: 'Fichier introuvable sur le serveur',
    });
  }

  // Télécharger le fichier
  res.download(filepath, `business_plan_${businessPlan.nom.replace(/\s+/g, '_')}.pdf`);
});

// 🆕 @desc    Prévisualiser le PDF (pour iframe)
// @route   GET /api/spaces/:spaceId/business-plans/:businessPlanId/preview
// @access  Private (token en query param pour iframe)
exports.previewBusinessPlan = asyncHandler(async (req, res) => {
  const { businessPlanId } = req.params;
  const { token } = req.query;

  // Vérifier le token en query param
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token manquant',
    });
  }

  // Vérifier le token
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Token invalide ou expiré',
    });
  }

  const businessPlan = await prisma.businessPlan.findUnique({
    where: { id: businessPlanId },
  });

  if (!businessPlan || !businessPlan.filename) {
    return res.status(404).json({
      success: false,
      error: 'Fichier PDF introuvable',
    });
  }

  const filepath = path.join(__dirname, '../../uploads/business-plans', businessPlan.filename);

  if (!fs.existsSync(filepath)) {
    return res.status(404).json({
      success: false,
      error: 'Fichier introuvable sur le serveur',
    });
  }

  // Stream le PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline');
  
  const stream = fs.createReadStream(filepath);
  stream.pipe(res);
});

// @desc    Calculer la simulation financière
// @route   POST /api/spaces/:spaceId/business-plans/:businessPlanId/simuler
// @access  Private
exports.simulerBusinessPlan = asyncHandler(async (req, res) => {
  const { businessPlanId } = req.params;

  const businessPlan = await prisma.businessPlan.findUnique({
    where: { id: businessPlanId },
  });

  if (!businessPlan) {
    return res.status(404).json({
      success: false,
      error: 'Business plan introuvable',
    });
  }

  // Calculer la simulation (mensualité, coût total, etc.)
  const tauxMensuel = (businessPlan.tauxEstime || 3.5) / 100 / 12;
  const nMois = businessPlan.dureePret;

  const mensualite = (businessPlan.montantDemande * tauxMensuel * Math.pow(1 + tauxMensuel, nMois)) /
    (Math.pow(1 + tauxMensuel, nMois) - 1);

  const coutTotal = mensualite * nMois;
  const coutCredit = coutTotal - businessPlan.montantDemande;

  const simulation = {
    montantDemande: businessPlan.montantDemande,
    dureePret: businessPlan.dureePret,
    tauxEstime: businessPlan.tauxEstime || 3.5,
    mensualite: Math.round(mensualite * 100) / 100,
    coutTotal: Math.round(coutTotal * 100) / 100,
    coutCredit: Math.round(coutCredit * 100) / 100,
    tauxEndettement: 0, // À calculer avec revenus
  };

  res.status(200).json({
    success: true,
    data: simulation,
  });
});
