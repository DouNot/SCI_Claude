const express = require('express');
const router = express.Router();
const {
  exportAmortissementPDF,
  exportChargesExcel,
  exportBienBilanPDF,
  exportDashboardExcel,
  exportDashboardPDF,
} = require('../controllers/exportController');

// Routes d'export
router.get('/pret/:id/amortissement', exportAmortissementPDF);
router.get('/charges', exportChargesExcel);
router.get('/bien/:id/bilan', exportBienBilanPDF);
router.get('/dashboard/excel', exportDashboardExcel);
router.get('/dashboard/pdf', exportDashboardPDF);

// Garder l'ancienne route pour compatibilité
router.get('/dashboard', exportDashboardExcel);

module.exports = router;
