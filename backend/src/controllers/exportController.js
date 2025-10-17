const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const helpers = require('../utils/pdf/pdfHelpers');

// @desc    Exporter le tableau d'amortissement d'un prêt en PDF
// @route   GET /api/exports/pret/:id/amortissement
// @access  Public
exports.exportAmortissementPDF = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const pret = await prisma.pret.findUnique({
    where: { id },
    include: { bien: true },
  });

  if (!pret) {
    return res.status(404).json({
      success: false,
      error: 'Prêt non trouvé',
    });
  }

  // Calculer le tableau d'amortissement
  const montant = parseFloat(pret.montant);
  const tauxMensuel = parseFloat(pret.taux) / 100 / 12;
  const duree = parseInt(pret.duree);
  const mensualite = parseFloat(pret.mensualite);

  const tableau = [];
  let capitalRestant = montant;

  for (let mois = 1; mois <= duree; mois++) {
    const interets = capitalRestant * tauxMensuel;
    const capital = mensualite - interets;
    capitalRestant -= capital;

    tableau.push({
      mois,
      mensualite: mensualite.toFixed(2),
      capital: capital.toFixed(2),
      interets: interets.toFixed(2),
      capitalRestant: Math.max(0, capitalRestant).toFixed(2),
    });
  }

  // Créer le PDF
  const doc = new PDFDocument({ margin: 50 });
  
  // Headers pour le téléchargement
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=amortissement-pret-${pret.organisme}.pdf`);

  doc.pipe(res);

  // Titre
  doc.fontSize(20).text('Tableau d\'Amortissement', { align: 'center' });
  doc.moveDown();
  
  // Informations du prêt
  doc.fontSize(12);
  doc.text(`Organisme: ${pret.organisme}`);
  doc.text(`Bien: ${pret.bien.adresse}, ${pret.bien.ville}`);
  doc.text(`Montant emprunte: ${helpers.formatCurrency(montant)}`);
  doc.text(`Taux: ${pret.taux}%`);
  doc.text(`Duree: ${duree} mois`);
  doc.text(`Mensualite: ${helpers.formatCurrency(mensualite)}`);
  doc.moveDown(2);

  // En-têtes du tableau
  const startY = doc.y;
  const colWidth = 100;
  
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Mois', 50, startY, { width: colWidth });
  doc.text('Mensualité', 150, startY, { width: colWidth });
  doc.text('Capital', 250, startY, { width: colWidth });
  doc.text('Intérêts', 350, startY, { width: colWidth });
  doc.text('Capital Restant', 450, startY, { width: colWidth });
  
  doc.font('Helvetica');
  let y = startY + 20;

  // Lignes du tableau (limité aux 50 premières pour le PDF)
  tableau.slice(0, 50).forEach((ligne, index) => {
    if (y > 700) {
      doc.addPage();
      y = 50;
    }
    
    doc.text(ligne.mois.toString(), 50, y, { width: colWidth });
    doc.text(ligne.mensualite + ' €', 150, y, { width: colWidth });
    doc.text(ligne.capital + ' €', 250, y, { width: colWidth });
    doc.text(ligne.interets + ' €', 350, y, { width: colWidth });
    doc.text(ligne.capitalRestant + ' €', 450, y, { width: colWidth });
    
    y += 20;
  });

  if (tableau.length > 50) {
    doc.moveDown(2);
    doc.fontSize(10).text(`... et ${tableau.length - 50} autres lignes`, { align: 'center', color: 'gray' });
  }

  doc.end();
});

// @desc    Exporter les charges en Excel
// @route   GET /api/exports/charges
// @access  Public
exports.exportChargesExcel = asyncHandler(async (req, res) => {
  const charges = await prisma.charge.findMany({
    include: {
      bien: {
        select: {
          adresse: true,
          ville: true,
        },
      },
      paiements: {
        orderBy: {
          datePaiement: 'desc',
        },
      },
    },
    orderBy: {
      dateDebut: 'desc',
    },
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Charges');

  // En-têtes
  worksheet.columns = [
    { header: 'Type', key: 'type', width: 20 },
    { header: 'Libellé', key: 'libelle', width: 30 },
    { header: 'Montant', key: 'montant', width: 15 },
    { header: 'Fréquence', key: 'frequence', width: 15 },
    { header: 'Bien', key: 'bien', width: 40 },
    { header: 'Date début', key: 'dateDebut', width: 15 },
    { header: 'Date fin', key: 'dateFin', width: 15 },
    { header: 'Statut', key: 'statut', width: 10 },
    { header: 'Notes', key: 'notes', width: 30 },
  ];

  // Style des en-têtes
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4A5568' },
  };
  worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

  // Données
  charges.forEach(charge => {
    worksheet.addRow({
      type: charge.type,
      libelle: charge.libelle,
      montant: charge.montant,
      frequence: charge.frequence,
      bien: charge.bien ? `${charge.bien.adresse}, ${charge.bien.ville}` : 'Charge globale',
      dateDebut: new Date(charge.dateDebut).toLocaleDateString('fr-FR'),
      dateFin: charge.dateFin ? new Date(charge.dateFin).toLocaleDateString('fr-FR') : '',
      statut: charge.estActive ? 'Active' : 'Inactive',
      notes: charge.notes || '',
    });
  });

  // Feuille des paiements
  const paiementsSheet = workbook.addWorksheet('Paiements');
  paiementsSheet.columns = [
    { header: 'Charge', key: 'charge', width: 30 },
    { header: 'Date paiement', key: 'datePaiement', width: 15 },
    { header: 'Montant', key: 'montant', width: 15 },
    { header: 'Notes', key: 'notes', width: 40 },
  ];

  paiementsSheet.getRow(1).font = { bold: true };
  paiementsSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4A5568' },
  };
  paiementsSheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

  charges.forEach(charge => {
    charge.paiements.forEach(paiement => {
      paiementsSheet.addRow({
        charge: charge.libelle,
        datePaiement: new Date(paiement.datePaiement).toLocaleDateString('fr-FR'),
        montant: paiement.montant,
        notes: paiement.notes || '',
      });
    });
  });

  // Headers pour le téléchargement
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=charges.xlsx');

  await workbook.xlsx.write(res);
  res.end();
});

// @desc    Exporter le bilan d'un bien en PDF
// @route   GET /api/exports/bien/:id/bilan
// @access  Public
exports.exportBienBilanPDF = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bien = await prisma.bien.findUnique({
    where: { id },
    include: {
      baux: {
        include: {
          locataire: true,
          quittances: true,
        },
      },
      prets: true,
      charges: {
        where: { estActive: true },
      },
      factures: true,
      travaux: true,
    },
  });

  if (!bien) {
    return res.status(404).json({
      success: false,
      error: 'Bien non trouvé',
    });
  }

  // Calculer les totaux
  const loyersTotal = bien.baux.reduce((sum, bail) => {
    return sum + bail.quittances.reduce((qSum, q) => qSum + q.montantTotal, 0);
  }, 0);

  const chargesTotal = bien.charges.reduce((sum, c) => {
    let montantAnnuel = 0;
    switch (c.frequence) {
      case 'MENSUELLE': montantAnnuel = c.montant * 12; break;
      case 'TRIMESTRIELLE': montantAnnuel = c.montant * 4; break;
      case 'SEMESTRIELLE': montantAnnuel = c.montant * 2; break;
      case 'ANNUELLE': montantAnnuel = c.montant; break;
    }
    return sum + montantAnnuel;
  }, 0);

  const mensualitesPrets = bien.prets.reduce((sum, p) => sum + (p.mensualite * 12), 0);
  const facturesTotal = bien.factures.reduce((sum, f) => sum + f.montantTTC, 0);
  const travauxTotal = bien.travaux.reduce((sum, t) => sum + (t.coutReel || t.coutEstime), 0);

  const cashFlow = loyersTotal - chargesTotal - mensualitesPrets - facturesTotal;

  // Créer le PDF avec style moderne
  const doc = new PDFDocument({ margin: 0, size: 'A4' });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=bilan-${bien.adresse.replace(/\s/g, '-')}.pdf`);

  doc.pipe(res);

  // ==================== PAGE 1: VUE D'ENSEMBLE ====================
  
  // Fond de page
  doc.rect(0, 0, 595, 842).fill('#f8fafc');
  
  // En-tête avec dégradé bleu
  doc.rect(0, 0, 595, 180).fill('#1e3a8a');
  
  // Logo/icône circulaire
  doc.circle(50, 50, 30).fill('#3b82f6');
  doc.fontSize(20).font('Helvetica-Bold').fillColor('#ffffff').text('SCI', 35, 38);
  
  // Titre principal
  doc.fontSize(36).font('Helvetica-Bold').fillColor('#ffffff').text('Bilan du Bien', 100, 30);
  
  // Date de génération
  doc.fontSize(12).font('Helvetica').fillColor('#93c5fd');
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`, 100, 75);
  
  // Adresse du bien en gros
  doc.fontSize(17).font('Helvetica-Bold').fillColor('#ffffff').text(bien.adresse, 50, 115, { width: 495 });
  doc.fontSize(13).font('Helvetica').fillColor('#bfdbfe').text(`${bien.codePostal} ${bien.ville}`, 50, 145);
  
  // Section: Informations clés avec cartes
  let currentY = 190;
  
  // Carte 1: Type et Surface
  doc.roundedRect(40, currentY, 160, 90, 10).fill('#ffffff');
  doc.rect(40, currentY, 160, 6).fill('#8b5cf6');
  doc.fontSize(10).font('Helvetica').fillColor('#64748b').text('Type de bien', 55, currentY + 18, { width: 130 });
  doc.fontSize(15).font('Helvetica-Bold').fillColor('#1e293b').text(helpers.formatBienType(bien.type), 55, currentY + 38, { width: 130 });
  doc.fontSize(11).font('Helvetica').fillColor('#64748b').text(`${bien.surface || '?'} m²`, 55, currentY + 68, { width: 130 });
  
  // Carte 2: Prix d'achat
  doc.roundedRect(215, currentY, 160, 90, 10).fill('#ffffff');
  doc.rect(215, currentY, 160, 6).fill('#3b82f6');
  doc.fontSize(10).fillColor('#64748b').text('Prix d\'achat', 230, currentY + 18, { width: 130 });
  doc.fontSize(18).font('Helvetica-Bold').fillColor('#1e40af').text(
    `${(bien.prixAchat / 1000).toFixed(0)}k €`, 
    230, 
    currentY + 38,
    { width: 130 }
  );
  doc.fontSize(10).fillColor('#64748b').text(
    new Date(bien.dateAchat).toLocaleDateString('fr-FR'), 
    230, 
    currentY + 66,
    { width: 130 }
  );
  
  // Carte 3: Valeur actuelle
  doc.roundedRect(390, currentY, 165, 90, 10).fill('#ffffff');
  doc.rect(390, currentY, 165, 6).fill('#10b981');
  doc.fontSize(10).fillColor('#64748b').text('Valeur actuelle', 405, currentY + 18, { width: 135 });
  doc.fontSize(18).font('Helvetica-Bold').fillColor('#047857').text(
    `${((bien.valeurActuelle || bien.prixAchat) / 1000).toFixed(0)}k €`, 
    405, 
    currentY + 38,
    { width: 135 }
  );
  const plusValue = (bien.valeurActuelle || bien.prixAchat) - bien.prixAchat;
  const plusValuePct = ((plusValue / bien.prixAchat) * 100).toFixed(1);
  doc.fontSize(10).fillColor(plusValue >= 0 ? '#10b981' : '#ef4444').text(
    `${plusValue >= 0 ? '+' : ''}${plusValuePct}%`, 
    405, 
    currentY + 66,
    { width: 135 }
  );
  
  currentY += 105;
  
  // Section: Performance financière avec fond coloré
  doc.roundedRect(40, currentY, 515, 165, 12).fill('#1e293b');
  doc.rect(40, currentY, 515, 8).fill('#3b82f6');
  
  doc.fontSize(20).font('Helvetica-Bold').fillColor('#ffffff').text('Performance Financière', 60, currentY + 25, { width: 450 });
  
  // Cash-flow en grand
  doc.fontSize(13).fillColor('#cbd5e1').text('Cash-flow annuel', 60, currentY + 60, { width: 300 });
  const cashFlowColor = cashFlow >= 0 ? '#10b981' : '#ef4444';
  doc.fontSize(34).font('Helvetica-Bold').fillColor(cashFlowColor).text(
    helpers.formatCurrency(cashFlow, true), 
    60, 
    currentY + 80,
    { width: 300 }
  );
  
  // Encadré rentabilité
  if (bien.prixAchat > 0) {
    const rentabilite = ((cashFlow / bien.prixAchat) * 100).toFixed(2);
    doc.roundedRect(375, currentY + 60, 150, 90, 10).fill('#334155');
    doc.fontSize(11).fillColor('#94a3b8').text('Rentabilité nette', 385, currentY + 75, { width: 130, align: 'center' });
    doc.fontSize(28).font('Helvetica-Bold').fillColor(cashFlowColor).text(
      `${rentabilite}%`, 
      385, 
      currentY + 105,
      { width: 130, align: 'center' }
    );
  }
  
  currentY += 180;
  
  // Section: Détail des flux avec fond blanc
  doc.roundedRect(40, currentY, 515, 230, 12).fill('#ffffff');
  doc.rect(40, currentY, 515, 6).fill('#64748b');
  
  doc.fontSize(17).font('Helvetica-Bold').fillColor('#1e293b').text('Détail des Flux Annuels', 60, currentY + 22, { width: 450 });
  
  let lineY = currentY + 60;
  
  // Revenus
  doc.circle(70, lineY + 5, 9).fill('#d1fae5');
  doc.fontSize(14).fillColor('#10b981').text('+', 66, lineY);
  doc.fontSize(12).font('Helvetica').fillColor('#334155').text('Loyers perçus', 95, lineY + 2, { width: 280 });
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#10b981').text(
    helpers.formatCurrency(loyersTotal, true), 
    390, 
    lineY + 2, 
    { width: 145, align: 'right' }
  );
  
  lineY += 36;
  
  // Charges courantes
  doc.circle(70, lineY + 5, 9).fill('#fee2e2');
  doc.fontSize(14).fillColor('#ef4444').text('-', 67, lineY);
  doc.fontSize(12).font('Helvetica').fillColor('#334155').text('Charges récurrentes', 95, lineY + 2, { width: 280 });
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#ef4444').text(
    helpers.formatCurrency(chargesTotal, true).replace('+', '-'), 
    390, 
    lineY + 2, 
    { width: 145, align: 'right' }
  );
  
  lineY += 36;
  
  // Mensualités de prêt
  doc.circle(70, lineY + 5, 9).fill('#fee2e2');
  doc.fontSize(14).fillColor('#ef4444').text('-', 67, lineY);
  doc.fontSize(12).font('Helvetica').fillColor('#334155').text('Mensualités de prêt', 95, lineY + 2, { width: 280 });
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#ef4444').text(
    helpers.formatCurrency(mensualitesPrets, true).replace('+', '-'), 
    390, 
    lineY + 2, 
    { width: 145, align: 'right' }
  );
  
  lineY += 36;
  
  // Factures
  doc.circle(70, lineY + 5, 9).fill('#fee2e2');
  doc.fontSize(14).fillColor('#ef4444').text('-', 67, lineY);
  doc.fontSize(12).font('Helvetica').fillColor('#334155').text('Factures et travaux', 95, lineY + 2, { width: 280 });
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#ef4444').text(
    helpers.formatCurrency(facturesTotal + travauxTotal, true).replace('+', '-'), 
    390, 
    lineY + 2, 
    { width: 145, align: 'right' }
  );
  
  lineY += 40;
  
  // Ligne de séparation
  doc.rect(60, lineY, 475, 2).fill('#e2e8f0');
  
  lineY += 15;
  
  // Total avec fond coloré
  doc.roundedRect(60, lineY, 475, 48, 8).fill('#f1f5f9');
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b').text('Cash-flow net annuel', 80, lineY + 16, { width: 250 });
  doc.fontSize(16).font('Helvetica-Bold').fillColor(cashFlowColor).text(
    helpers.formatCurrency(cashFlow, true), 
    380, 
    lineY + 16, 
    { width: 135, align: 'right' }
  );
  
  // ==================== PAGE 2: DÉTAILS DES BAUX ET PRÊTS ====================
  
  if (bien.baux.length > 0 || bien.prets.length > 0) {
    doc.addPage();
    doc.rect(0, 0, 595, 842).fill('#f8fafc');
    
    // En-tête page 2
    doc.rect(0, 0, 595, 100).fill('#1e3a8a');
    doc.fontSize(28).font('Helvetica-Bold').fillColor('#ffffff').text('Détails Financiers', 50, 35);
    
    currentY = 130;
    
    // Section Baux
    if (bien.baux.length > 0) {
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#1e293b').text('Baux et Locataires', 50, currentY);
      currentY += 40;
      
      bien.baux.forEach((bail, index) => {
        if (currentY > 700) {
          doc.addPage();
          doc.rect(0, 0, 595, 842).fill('#f8fafc');
          currentY = 50;
        }
        
        // Carte pour chaque bail
        const cardHeight = 100;
        doc.roundedRect(40, currentY, 515, cardHeight, 10).fill('#ffffff');
        
        // Barre latérale de couleur
        const bailColor = bail.statut === 'ACTIF' ? '#10b981' : '#94a3b8';
        doc.rect(40, currentY, 8, cardHeight).fill(bailColor);
        
        // Numéro du bail
        doc.circle(70, currentY + 28, 18).fill(bail.statut === 'ACTIF' ? '#d1fae5' : '#f1f5f9');
        doc.fontSize(14).font('Helvetica-Bold').fillColor(bailColor).text(
          (index + 1).toString(), 
          63, 
          currentY + 20
        );
        
        // Infos locataire
        const locataireNom = bail.locataire.typeLocataire === 'ENTREPRISE' 
          ? bail.locataire.raisonSociale 
          : `${bail.locataire.prenom} ${bail.locataire.nom}`;
        
        doc.fontSize(13).font('Helvetica-Bold').fillColor('#1e293b').text(
          locataireNom, 
          105, 
          currentY + 18,
          { width: 260 }
        );
        
        doc.fontSize(10).font('Helvetica').fillColor('#64748b').text(
          `Du ${new Date(bail.dateDebut).toLocaleDateString('fr-FR')}${bail.dateFin ? ' au ' + new Date(bail.dateFin).toLocaleDateString('fr-FR') : ''}`, 
          105, 
          currentY + 38,
          { width: 260 }
        );
        
        // Badge statut
        doc.roundedRect(105, currentY + 60, 65, 24, 6).fill(bail.statut === 'ACTIF' ? '#d1fae5' : '#f1f5f9');
        doc.fontSize(10).font('Helvetica-Bold').fillColor(bailColor).text(
          bail.statut, 
          110, 
          currentY + 67,
          { width: 55, align: 'center' }
        );
        
        // Loyer dans un encadré
        doc.roundedRect(395, currentY + 18, 135, 65, 8).fill('#f1f5f9');
        doc.fontSize(11).fillColor('#64748b').text('Loyer HC', 400, currentY + 28, { width: 125, align: 'center' });
        doc.fontSize(17).font('Helvetica-Bold').fillColor('#3b82f6').text(
          `${bail.loyerHC.toLocaleString('fr-FR')} €`, 
          400, 
          currentY + 50,
          { width: 125, align: 'center' }
        );
        
        currentY += cardHeight + 15;
      });
    }
    
    // Section Prêts
    if (bien.prets.length > 0) {
      if (currentY > 400) {
        doc.addPage();
        doc.rect(0, 0, 595, 842).fill('#f8fafc');
        currentY = 50;
      } else {
        currentY += 20;
      }
      
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#1e293b').text('Prêts Immobiliers', 50, currentY);
      currentY += 40;
      
      bien.prets.forEach((pret, index) => {
        if (currentY > 700) {
          doc.addPage();
          doc.rect(0, 0, 595, 842).fill('#f8fafc');
          currentY = 50;
        }
        
        // Carte pour chaque prêt
        const cardHeight = 110;
        doc.roundedRect(40, currentY, 515, cardHeight, 10).fill('#ffffff');
        doc.rect(40, currentY, 8, cardHeight).fill('#f97316');
        
        // Numéro du prêt
        doc.circle(70, currentY + 28, 18).fill('#fed7aa');
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#c2410c').text(
          (index + 1).toString(), 
          63, 
          currentY + 20
        );
        
        // Infos prêt
        doc.fontSize(13).font('Helvetica-Bold').fillColor('#1e293b').text(
          pret.organisme, 
          105, 
          currentY + 18,
          { width: 260 }
        );
        
        doc.fontSize(10).font('Helvetica').fillColor('#64748b').text(
          `Depuis ${new Date(pret.dateDebut).toLocaleDateString('fr-FR')} • ${pret.duree} mois • Taux ${pret.taux}%`, 
          105, 
          currentY + 38,
          { width: 260 }
        );
        
        // Montants
        doc.fontSize(10).fillColor('#64748b').text('Montant emprunté', 105, currentY + 65, { width: 200 });
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b').text(
          `${(pret.montant / 1000).toFixed(0)}k €`, 
          105, 
          currentY + 82,
          { width: 200 }
        );
        
        // Mensualité dans un encadré
        doc.roundedRect(395, currentY + 18, 135, 75, 8).fill('#fef3c7');
        doc.fontSize(11).fillColor('#92400e').text('Mensualité', 400, currentY + 28, { width: 125, align: 'center' });
        doc.fontSize(18).font('Helvetica-Bold').fillColor('#b45309').text(
          `${pret.mensualite.toLocaleString('fr-FR')} €`, 
          400, 
          currentY + 53,
          { width: 125, align: 'center' }
        );
        
        currentY += cardHeight + 15;
      });
    }
  }
  
  // Footer sur toutes les pages
  const addFooter = (pageNum) => {
    doc.rect(0, 792, 595, 50).fill('#1e293b');
    doc.fontSize(9).fillColor('#94a3b8').text(
      `Bilan du bien • ${bien.adresse} • Page ${pageNum}`,
      0,
      810,
      { width: 595, align: 'center' }
    );
  };
  
  // Ajouter footer sur toutes les pages
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    addFooter(i + 1);
  }

  doc.end();
});

// @desc    Exporter le dashboard complet en Excel
// @route   GET /api/exports/dashboard
// @access  Public
exports.exportDashboardExcel = asyncHandler(async (req, res) => {
  const [biens, baux, charges, prets] = await Promise.all([
    prisma.bien.findMany({ include: { photos: true } }),
    prisma.bail.findMany({ 
      include: { 
        locataire: true, 
        bien: true,
        quittances: true,
      } 
    }),
    prisma.charge.findMany({ 
      where: { estActive: true },
      include: { bien: true } 
    }),
    prisma.pret.findMany({ include: { bien: true } }),
  ]);

  const workbook = new ExcelJS.Workbook();

  // Feuille Biens
  const biensSheet = workbook.addWorksheet('Biens');
  biensSheet.columns = [
    { header: 'Adresse', key: 'adresse', width: 40 },
    { header: 'Ville', key: 'ville', width: 20 },
    { header: 'Type', key: 'type', width: 15 },
    { header: 'Surface', key: 'surface', width: 10 },
    { header: 'Prix d\'achat', key: 'prixAchat', width: 15 },
    { header: 'Date d\'achat', key: 'dateAchat', width: 15 },
    { header: 'Statut', key: 'statut', width: 10 },
  ];
  biensSheet.getRow(1).font = { bold: true };
  biensSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4A5568' },
  };

  biens.forEach(bien => {
    biensSheet.addRow({
      adresse: bien.adresse,
      ville: bien.ville,
      type: bien.type,
      surface: bien.surface,
      prixAchat: bien.prixAchat,
      dateAchat: new Date(bien.dateAchat).toLocaleDateString('fr-FR'),
      statut: bien.statut,
    });
  });

  // Feuille Loyers
  const loyersSheet = workbook.addWorksheet('Loyers');
  loyersSheet.columns = [
    { header: 'Bien', key: 'bien', width: 40 },
    { header: 'Locataire', key: 'locataire', width: 30 },
    { header: 'Loyer HC', key: 'loyerHC', width: 15 },
    { header: 'Charges', key: 'charges', width: 15 },
    { header: 'Date début', key: 'dateDebut', width: 15 },
    { header: 'Date fin', key: 'dateFin', width: 15 },
    { header: 'Statut', key: 'statut', width: 10 },
  ];
  loyersSheet.getRow(1).font = { bold: true };
  loyersSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4A5568' },
  };

  baux.forEach(bail => {
    loyersSheet.addRow({
      bien: `${bail.bien.adresse}, ${bail.bien.ville}`,
      locataire: `${bail.locataire.nom} ${bail.locataire.prenom}`,
      loyerHC: bail.loyerHC,
      charges: bail.charges || 0,
      dateDebut: new Date(bail.dateDebut).toLocaleDateString('fr-FR'),
      dateFin: bail.dateFin ? new Date(bail.dateFin).toLocaleDateString('fr-FR') : '',
      statut: bail.statut,
    });
  });

  // Feuille Prêts
  const pretsSheet = workbook.addWorksheet('Prêts');
  pretsSheet.columns = [
    { header: 'Bien', key: 'bien', width: 40 },
    { header: 'Organisme', key: 'organisme', width: 25 },
    { header: 'Montant', key: 'montant', width: 15 },
    { header: 'Taux', key: 'taux', width: 10 },
    { header: 'Durée (mois)', key: 'duree', width: 15 },
    { header: 'Mensualité', key: 'mensualite', width: 15 },
    { header: 'Date début', key: 'dateDebut', width: 15 },
  ];
  pretsSheet.getRow(1).font = { bold: true };
  pretsSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4A5568' },
  };

  prets.forEach(pret => {
    pretsSheet.addRow({
      bien: `${pret.bien.adresse}, ${pret.bien.ville}`,
      organisme: pret.organisme,
      montant: pret.montant,
      taux: pret.taux,
      duree: pret.duree,
      mensualite: pret.mensualite,
      dateDebut: new Date(pret.dateDebut).toLocaleDateString('fr-FR'),
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=dashboard-sci.xlsx');

  await workbook.xlsx.write(res);
  res.end();
});

// @desc    Exporter le dashboard en PDF
// @route   GET /api/exports/dashboard/pdf
// @access  Public
exports.exportDashboardPDF = asyncHandler(async (req, res) => {
  // Récupérer TOUS les biens avec TOUTES leurs données pour les bilans détaillés
  const [biens, baux, charges, prets] = await Promise.all([
    prisma.bien.findMany({ 
      include: { 
        photos: true,
        baux: {
          include: {
            locataire: true,
            quittances: true,
          },
        },
        prets: true,
        charges: {
          where: { estActive: true },
        },
        factures: true,
        travaux: true,
      } 
    }),
    prisma.bail.findMany({ 
      where: { statut: 'ACTIF' },
      include: { 
        locataire: true, 
        bien: true,
      } 
    }),
    prisma.charge.findMany({ 
      where: { estActive: true },
    }),
    prisma.pret.findMany({ include: { bien: true } }),
  ]);

  // Calculer les métriques
  const nombreBiens = biens.length;
  const valeurTotaleBrute = biens.reduce((sum, b) => sum + (b.valeurActuelle || b.prixAchat), 0);
  
  // Calculer le capital restant dû
  const calculerMoisEcoules = (dateDebut, dateFin) => {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    let mois = (fin.getFullYear() - debut.getFullYear()) * 12;
    mois += fin.getMonth() - debut.getMonth();
    if (fin.getDate() < debut.getDate()) {
      mois--;
    }
    return Math.max(0, mois);
  };

  const capitalRestantDu = prets.reduce((sum, p) => {
    const moisEcoules = calculerMoisEcoules(new Date(p.dateDebut), new Date());
    const moisRestants = Math.max(0, parseInt(p.duree) - moisEcoules);
    const montant = parseFloat(p.montant || 0);
    const tauxMensuel = (parseFloat(p.taux || 0) / 100) / 12;
    
    if (tauxMensuel === 0) {
      return sum + (montant * moisRestants / parseInt(p.duree));
    }
    
    const mensualite = montant * (tauxMensuel * Math.pow(1 + tauxMensuel, parseInt(p.duree))) / (Math.pow(1 + tauxMensuel, parseInt(p.duree)) - 1);
    const capitalRestant = mensualite * ((Math.pow(1 + tauxMensuel, moisRestants) - 1) / (tauxMensuel * Math.pow(1 + tauxMensuel, moisRestants)));
    
    return sum + (isNaN(capitalRestant) ? 0 : capitalRestant);
  }, 0);

  const valeurTotaleNette = valeurTotaleBrute - capitalRestantDu;
  
  // Calculer les loyers
  const loyersMensuels = baux.reduce((sum, b) => sum + (b.loyerHC || 0), 0);
  const loyersAnnuels = loyersMensuels * 12;
  
  // Calculer les charges
  const mensualitesPrets = prets.reduce((sum, p) => sum + (parseFloat(p.mensualite) || 0), 0);
  const chargesPrets = mensualitesPrets * 12;
  
  const autresChargesAnnuelles = charges.reduce((sum, charge) => {
    let montantAnnuel = 0;
    switch (charge.frequence) {
      case 'MENSUELLE': montantAnnuel = charge.montant * 12; break;
      case 'TRIMESTRIELLE': montantAnnuel = charge.montant * 4; break;
      case 'SEMESTRIELLE': montantAnnuel = charge.montant * 2; break;
      case 'ANNUELLE': montantAnnuel = charge.montant; break;
    }
    return sum + montantAnnuel;
  }, 0);
  
  const chargesAnnuelles = chargesPrets + autresChargesAnnuelles;
  const cashFlowAnnuel = loyersAnnuels - chargesAnnuelles;
  const prixAchatTotal = biens.reduce((sum, b) => sum + b.prixAchat, 0);
  const tauxRentabiliteNet = prixAchatTotal > 0 ? ((cashFlowAnnuel / prixAchatTotal) * 100).toFixed(2) : 0;

  // Créer le PDF
  const doc = new PDFDocument({ margin: 0, size: 'A4' });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=export-patrimoine-sci.pdf');

  doc.pipe(res);

  // Fond de page avec dégradé (simuler avec rectangles)
  doc.rect(0, 0, 595, 842).fill('#f8fafc');
  
  // En-tête avec fond coloré
  doc.rect(0, 0, 595, 120).fill('#1e3a8a');
  
  // Logo / Icône (cercle avec initiales)
  doc.circle(50, 50, 25).fill('#3b82f6');
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#ffffff').text('SCI', 38, 40);
  
  // Titre
  doc.fontSize(32).font('Helvetica-Bold').fillColor('#ffffff').text('Dashboard SCI', 90, 35);
  doc.fontSize(14).font('Helvetica').fillColor('#93c5fd');
  doc.text(`Rapport généré le ${new Date().toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })}`, 90, 70);
  
  doc.y = 150;

  // Section KPIs principaux
  const kpisY = 150;
  const kpiWidth = 120;
  const kpiHeight = 100;
  const gap = 15;
  const startX = 40;
  
  // KPI 1: Nombre de biens
  doc.rect(startX, kpisY, kpiWidth, kpiHeight).fill('#dbeafe');
  doc.rect(startX, kpisY, kpiWidth, 4).fill('#3b82f6');
  doc.fontSize(11).font('Helvetica').fillColor('#64748b').text('Nombre de biens', startX + 10, kpisY + 20, { width: kpiWidth - 20 });
  doc.fontSize(28).font('Helvetica-Bold').fillColor('#1e40af').text(nombreBiens.toString(), startX + 10, kpisY + 45, { width: kpiWidth - 20 });
  
  // KPI 2: Valeur nette
  doc.rect(startX + kpiWidth + gap, kpisY, kpiWidth, kpiHeight).fill('#d1fae5');
  doc.rect(startX + kpiWidth + gap, kpisY, kpiWidth, 4).fill('#10b981');
  doc.fontSize(11).fillColor('#64748b').text('Valeur nette', startX + kpiWidth + gap + 10, kpisY + 20, { width: kpiWidth - 20 });
  doc.fontSize(24).font('Helvetica-Bold').fillColor('#047857').text(
    `${(valeurTotaleNette / 1000).toFixed(0)}k €`, 
    startX + kpiWidth + gap + 10, 
    kpisY + 45, 
    { width: kpiWidth - 20 }
  );
  
  // KPI 3: Loyers mensuels
  doc.rect(startX + (kpiWidth + gap) * 2, kpisY, kpiWidth, kpiHeight).fill('#e9d5ff');
  doc.rect(startX + (kpiWidth + gap) * 2, kpisY, kpiWidth, 4).fill('#8b5cf6');
  doc.fontSize(11).fillColor('#64748b').text('Loyers mensuels', startX + (kpiWidth + gap) * 2 + 10, kpisY + 20, { width: kpiWidth - 20 });
  doc.fontSize(20).font('Helvetica-Bold').fillColor('#6d28d9').text(
    helpers.formatCurrency(loyersMensuels), 
    startX + (kpiWidth + gap) * 2 + 10, 
    kpisY + 45, 
    { width: kpiWidth - 20 }
  );
  
  // KPI 4: Dette totale
  doc.rect(startX + (kpiWidth + gap) * 3, kpisY, kpiWidth, kpiHeight).fill('#fed7aa');
  doc.rect(startX + (kpiWidth + gap) * 3, kpisY, kpiWidth, 4).fill('#f97316');
  doc.fontSize(11).fillColor('#64748b').text('Dette totale', startX + (kpiWidth + gap) * 3 + 10, kpisY + 20, { width: kpiWidth - 20 });
  doc.fontSize(20).font('Helvetica-Bold').fillColor('#c2410c').text(
    `${(capitalRestantDu / 1000).toFixed(0)}k €`, 
    startX + (kpiWidth + gap) * 3 + 10, 
    kpisY + 45, 
    { width: kpiWidth - 20 }
  );
  
  doc.y = kpisY + kpiHeight + 30;

  // Section Performance avec fond coloré
  const perfY = doc.y;
  const perfHeight = 160;
  
  // Fond dégradé (simuler avec plusieurs rectangles)
  doc.rect(40, perfY, 515, perfHeight).fill('#1e293b');
  doc.rect(40, perfY, 515, 6).fill('#3b82f6');
  
  // Contenu
  doc.fontSize(18).font('Helvetica-Bold').fillColor('#ffffff').text('Performance Financière', 60, perfY + 25);
  
  doc.fontSize(13).fillColor('#cbd5e1').text('Cash-flow annuel', 60, perfY + 55);
  const cashFlowColor = cashFlowAnnuel >= 0 ? '#10b981' : '#ef4444';
  doc.fontSize(36).font('Helvetica-Bold').fillColor(cashFlowColor).text(
    helpers.formatCurrency(cashFlowAnnuel, true), 
    60, 
    perfY + 75
  );
  
  // Encadré pour la rentabilité
  doc.roundedRect(380, perfY + 55, 145, 70, 8).fill('#334155');
  doc.fontSize(11).fillColor('#94a3b8').text('Rentabilité nette', 395, perfY + 65, { width: 115, align: 'center' });
  doc.fontSize(28).font('Helvetica-Bold').fillColor(cashFlowColor).text(
    `${tauxRentabiliteNet}%`, 
    395, 
    perfY + 85,
    { width: 115, align: 'center' }
  );
  
  doc.y = perfY + perfHeight + 30;
  
  // Détail des revenus et charges avec fond
  const detailY = doc.y;
  doc.rect(40, detailY, 515, 180).fill('#ffffff');
  doc.rect(40, detailY, 515, 4).fill('#64748b');
  
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#1e293b').text('Détail Annuel', 60, detailY + 20);
  
  const lineY = detailY + 55;
  
  // Revenus avec icône
  doc.circle(65, lineY + 5, 8).fill('#d1fae5');
  doc.fontSize(16).fillColor('#10b981').text('+', 61, lineY);
  doc.fontSize(13).font('Helvetica').fillColor('#334155').text('Loyers perçus', 85, lineY);
  doc.fontSize(13).font('Helvetica-Bold').fillColor('#10b981').text(
    helpers.formatCurrency(loyersAnnuels, true), 
    400, 
    lineY, 
    { width: 135, align: 'right' }
  );
  
  // Charges avec icône
  doc.circle(65, lineY + 35 + 5, 8).fill('#fee2e2');
  doc.fontSize(16).fillColor('#ef4444').text('-', 62, lineY + 35);
  doc.fontSize(13).font('Helvetica').fillColor('#334155').text('Mensualités de prêt', 85, lineY + 35);
  doc.fontSize(13).font('Helvetica-Bold').fillColor('#ef4444').text(
    helpers.formatCurrency(chargesPrets, true).replace('+', '-'), 
    400, 
    lineY + 35, 
    { width: 135, align: 'right' }
  );
  
  doc.circle(65, lineY + 70 + 5, 8).fill('#fee2e2');
  doc.fontSize(16).fillColor('#ef4444').text('-', 62, lineY + 70);
  doc.fontSize(13).font('Helvetica').fillColor('#334155').text('Autres charges', 85, lineY + 70);
  doc.fontSize(13).font('Helvetica-Bold').fillColor('#ef4444').text(
    helpers.formatCurrency(autresChargesAnnuelles, true).replace('+', '-'), 
    400, 
    lineY + 70, 
    { width: 135, align: 'right' }
  );
  
  // Ligne de séparation style moderne
  doc.rect(60, lineY + 105, 475, 2).fill('#e2e8f0');
  
  // Total avec fond coloré
  doc.roundedRect(60, lineY + 115, 475, 45, 6).fill('#f1f5f9');
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b').text('Cash-flow net annuel', 75, lineY + 128);
  doc.fontSize(18).font('Helvetica-Bold').fillColor(cashFlowColor).text(
    helpers.formatCurrency(cashFlowAnnuel), 
    400, 
    lineY + 128, 
    { width: 120, align: 'right' }
  );
  
  // Nouvelle page pour la liste des biens
  doc.addPage();
  doc.rect(0, 0, 595, 842).fill('#f8fafc');
  
  // En-tête page 2
  doc.rect(0, 0, 595, 80).fill('#1e3a8a');
  doc.fontSize(24).font('Helvetica-Bold').fillColor('#ffffff').text('Liste des Biens', 50, 30);
  
  let currentY = 110;
  
  biens.forEach((bien, index) => {
    if (currentY > 750) {
      doc.addPage();
      doc.rect(0, 0, 595, 842).fill('#f8fafc');
      doc.rect(0, 0, 595, 80).fill('#1e3a8a');
      doc.fontSize(24).font('Helvetica-Bold').fillColor('#ffffff').text('Liste des Biens (suite)', 50, 30);
      currentY = 110;
    }
    
    // Carte pour chaque bien
    doc.roundedRect(40, currentY, 515, 80, 8).fill('#ffffff');
    doc.rect(40, currentY, 8, 80).fill('#3b82f6');
    
    // Numéro
    doc.circle(65, currentY + 25, 18).fill('#dbeafe');
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af').text(
      (index + 1).toString(), 
      57, 
      currentY + 17, 
      { width: 16, align: 'center' }
    );
    
    // Informations du bien
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b').text(
      `${bien.adresse}`, 
      95, 
      currentY + 15
    );
    doc.fontSize(11).font('Helvetica').fillColor('#64748b').text(
      `${bien.ville} - ${helpers.formatBienType(bien.type)} - ${bien.surface || '?'} m2`, 
      95, 
      currentY + 35
    );
    
    // Prix dans un encadré
    doc.roundedRect(420, currentY + 15, 115, 30, 6).fill('#f1f5f9');
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#3b82f6').text(
      helpers.formatCurrency(bien.valeurActuelle || bien.prixAchat), 
      425, 
      currentY + 23,
      { width: 105, align: 'center' }
    );
    
    // Statut
    const bailActif = baux.find(b => b.bienId === bien.id && b.statut === 'ACTIF');
    const statutColor = bailActif ? '#10b981' : '#94a3b8';
    const statutBg = bailActif ? '#d1fae5' : '#f1f5f9';
    const statutText = bailActif ? 'Loué' : 'Libre';
    
    doc.roundedRect(95, currentY + 53, 50, 20, 4).fill(statutBg);
    doc.fontSize(9).font('Helvetica-Bold').fillColor(statutColor).text(
      statutText, 
      100, 
      currentY + 58,
      { width: 40, align: 'center' }
    );
    
    currentY += 95;
  });
  
  // ==================== BILANS DÉTAILLÉS DE CHAQUE BIEN ====================
  
  // Pour chaque bien, ajouter son bilan détaillé
  biens.forEach((bien, bienIndex) => {
    // Calculer les totaux pour ce bien
    const loyersTotal = bien.baux.reduce((sum, bail) => {
      return sum + bail.quittances.reduce((qSum, q) => qSum + q.montantTotal, 0);
    }, 0);

    const chargesTotal = bien.charges.reduce((sum, c) => {
      let montantAnnuel = 0;
      switch (c.frequence) {
        case 'MENSUELLE': montantAnnuel = c.montant * 12; break;
        case 'TRIMESTRIELLE': montantAnnuel = c.montant * 4; break;
        case 'SEMESTRIELLE': montantAnnuel = c.montant * 2; break;
        case 'ANNUELLE': montantAnnuel = c.montant; break;
      }
      return sum + montantAnnuel;
    }, 0);

    const mensualitesPrets = bien.prets.reduce((sum, p) => sum + (p.mensualite * 12), 0);
    const facturesTotal = bien.factures.reduce((sum, f) => sum + f.montantTTC, 0);
    const travauxTotal = bien.travaux.reduce((sum, t) => sum + (t.coutReel || t.coutEstime), 0);
    const cashFlow = loyersTotal - chargesTotal - mensualitesPrets - facturesTotal;
    
    // Nouvelle page pour le bilan du bien
    doc.addPage();
    doc.rect(0, 0, 595, 842).fill('#f8fafc');
    
    // En-tête avec dégradé bleu
    doc.rect(0, 0, 595, 180).fill('#1e3a8a');
    
    // Logo/icône circulaire
    doc.circle(50, 50, 30).fill('#3b82f6');
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#ffffff').text('SCI', 35, 38);
    
    // Titre principal
    doc.fontSize(36).font('Helvetica-Bold').fillColor('#ffffff').text('Bilan du Bien', 100, 30);
    
    // Date de génération
    doc.fontSize(12).font('Helvetica').fillColor('#93c5fd');
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`, 100, 75);
    
    // Adresse du bien en gros
    doc.fontSize(17).font('Helvetica-Bold').fillColor('#ffffff').text(bien.adresse, 50, 115, { width: 495 });
    doc.fontSize(13).font('Helvetica').fillColor('#bfdbfe').text(`${bien.codePostal} ${bien.ville}`, 50, 145);
    
    // Section: Informations clés avec cartes
    let bienY = 190;
    
    // Carte 1: Type et Surface
    doc.roundedRect(40, bienY, 160, 90, 10).fill('#ffffff');
    doc.rect(40, bienY, 160, 6).fill('#8b5cf6');
    doc.fontSize(10).font('Helvetica').fillColor('#64748b').text('Type de bien', 55, bienY + 18, { width: 130 });
    doc.fontSize(15).font('Helvetica-Bold').fillColor('#1e293b').text(helpers.formatBienType(bien.type), 55, bienY + 38, { width: 130 });
    doc.fontSize(11).font('Helvetica').fillColor('#64748b').text(`${bien.surface || '?'} m²`, 55, bienY + 68, { width: 130 });
    
    // Carte 2: Prix d'achat
    doc.roundedRect(215, bienY, 160, 90, 10).fill('#ffffff');
    doc.rect(215, bienY, 160, 6).fill('#3b82f6');
    doc.fontSize(10).fillColor('#64748b').text('Prix d\'achat', 230, bienY + 18, { width: 130 });
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#1e40af').text(
      `${(bien.prixAchat / 1000).toFixed(0)}k €`, 
      230, 
      bienY + 38,
      { width: 130 }
    );
    doc.fontSize(10).fillColor('#64748b').text(
      new Date(bien.dateAchat).toLocaleDateString('fr-FR'), 
      230, 
      bienY + 66,
      { width: 130 }
    );
    
    // Carte 3: Valeur actuelle
    doc.roundedRect(390, bienY, 165, 90, 10).fill('#ffffff');
    doc.rect(390, bienY, 165, 6).fill('#10b981');
    doc.fontSize(10).fillColor('#64748b').text('Valeur actuelle', 405, bienY + 18, { width: 135 });
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#047857').text(
      `${((bien.valeurActuelle || bien.prixAchat) / 1000).toFixed(0)}k €`, 
      405, 
      bienY + 38,
      { width: 135 }
    );
    const plusValue = (bien.valeurActuelle || bien.prixAchat) - bien.prixAchat;
    const plusValuePct = ((plusValue / bien.prixAchat) * 100).toFixed(1);
    doc.fontSize(10).fillColor(plusValue >= 0 ? '#10b981' : '#ef4444').text(
      `${plusValue >= 0 ? '+' : ''}${plusValuePct}%`, 
      405, 
      bienY + 66,
      { width: 135 }
    );
    
    bienY += 105;
    
    // Section: Performance financière avec fond coloré
    doc.roundedRect(40, bienY, 515, 165, 12).fill('#1e293b');
    doc.rect(40, bienY, 515, 8).fill('#3b82f6');
    
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#ffffff').text('Performance Financière', 60, bienY + 25, { width: 450 });
    
    // Cash-flow en grand
    doc.fontSize(13).fillColor('#cbd5e1').text('Cash-flow annuel', 60, bienY + 60, { width: 300 });
    const cashFlowColor = cashFlow >= 0 ? '#10b981' : '#ef4444';
    doc.fontSize(34).font('Helvetica-Bold').fillColor(cashFlowColor).text(
      helpers.formatCurrency(cashFlow, true), 
      60, 
      bienY + 80,
      { width: 300 }
    );
    
    // Encadré rentabilité
    if (bien.prixAchat > 0) {
      const rentabilite = ((cashFlow / bien.prixAchat) * 100).toFixed(2);
      doc.roundedRect(375, bienY + 60, 150, 90, 10).fill('#334155');
      doc.fontSize(11).fillColor('#94a3b8').text('Rentabilité nette', 385, bienY + 75, { width: 130, align: 'center' });
      doc.fontSize(28).font('Helvetica-Bold').fillColor(cashFlowColor).text(
        `${rentabilite}%`, 
        385, 
        bienY + 105,
        { width: 130, align: 'center' }
      );
    }
    
    bienY += 180;
    
    // Section: Détail des flux avec fond blanc
    doc.roundedRect(40, bienY, 515, 230, 12).fill('#ffffff');
    doc.rect(40, bienY, 515, 6).fill('#64748b');
    
    doc.fontSize(17).font('Helvetica-Bold').fillColor('#1e293b').text('Détail des Flux Annuels', 60, bienY + 22, { width: 450 });
    
    let lineY = bienY + 60;
    
    // Revenus
    doc.circle(70, lineY + 5, 9).fill('#d1fae5');
    doc.fontSize(14).fillColor('#10b981').text('+', 66, lineY);
    doc.fontSize(12).font('Helvetica').fillColor('#334155').text('Loyers perçus', 95, lineY + 2, { width: 280 });
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#10b981').text(
      helpers.formatCurrency(loyersTotal, true), 
      390, 
      lineY + 2, 
      { width: 145, align: 'right' }
    );
    
    lineY += 36;
    
    // Charges courantes
    doc.circle(70, lineY + 5, 9).fill('#fee2e2');
    doc.fontSize(14).fillColor('#ef4444').text('-', 67, lineY);
    doc.fontSize(12).font('Helvetica').fillColor('#334155').text('Charges récurrentes', 95, lineY + 2, { width: 280 });
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#ef4444').text(
      helpers.formatCurrency(chargesTotal, true).replace('+', '-'), 
      390, 
      lineY + 2, 
      { width: 145, align: 'right' }
    );
    
    lineY += 36;
    
    // Mensualités de prêt
    doc.circle(70, lineY + 5, 9).fill('#fee2e2');
    doc.fontSize(14).fillColor('#ef4444').text('-', 67, lineY);
    doc.fontSize(12).font('Helvetica').fillColor('#334155').text('Mensualités de prêt', 95, lineY + 2, { width: 280 });
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#ef4444').text(
      helpers.formatCurrency(mensualitesPrets, true).replace('+', '-'), 
      390, 
      lineY + 2, 
      { width: 145, align: 'right' }
    );
    
    lineY += 36;
    
    // Factures
    doc.circle(70, lineY + 5, 9).fill('#fee2e2');
    doc.fontSize(14).fillColor('#ef4444').text('-', 67, lineY);
    doc.fontSize(12).font('Helvetica').fillColor('#334155').text('Factures et travaux', 95, lineY + 2, { width: 280 });
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#ef4444').text(
      helpers.formatCurrency(facturesTotal + travauxTotal, true).replace('+', '-'), 
      390, 
      lineY + 2, 
      { width: 145, align: 'right' }
    );
    
    lineY += 40;
    
    // Ligne de séparation
    doc.rect(60, lineY, 475, 2).fill('#e2e8f0');
    
    lineY += 15;
    
    // Total avec fond coloré
    doc.roundedRect(60, lineY, 475, 48, 8).fill('#f1f5f9');
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b').text('Cash-flow net annuel', 80, lineY + 16, { width: 250 });
    doc.fontSize(16).font('Helvetica-Bold').fillColor(cashFlowColor).text(
      helpers.formatCurrency(cashFlow, true), 
      380, 
      lineY + 16, 
      { width: 135, align: 'right' }
    );
    
    // Si le bien a des baux ou des prêts, ajouter une page pour les détails
    if (bien.baux.length > 0 || bien.prets.length > 0) {
      doc.addPage();
      doc.rect(0, 0, 595, 842).fill('#f8fafc');
      
      // En-tête page détails
      doc.rect(0, 0, 595, 100).fill('#1e3a8a');
      doc.fontSize(28).font('Helvetica-Bold').fillColor('#ffffff').text('Détails Financiers', 50, 35);
      
      let detailY = 130;
      
      // Section Baux
      if (bien.baux.length > 0) {
        doc.fontSize(20).font('Helvetica-Bold').fillColor('#1e293b').text('Baux et Locataires', 50, detailY);
        detailY += 40;
        
        bien.baux.forEach((bail, index) => {
          if (detailY > 700) {
            doc.addPage();
            doc.rect(0, 0, 595, 842).fill('#f8fafc');
            detailY = 50;
          }
          
          const cardHeight = 100;
          doc.roundedRect(40, detailY, 515, cardHeight, 10).fill('#ffffff');
          
          const bailColor = bail.statut === 'ACTIF' ? '#10b981' : '#94a3b8';
          doc.rect(40, detailY, 8, cardHeight).fill(bailColor);
          
          doc.circle(70, detailY + 28, 18).fill(bail.statut === 'ACTIF' ? '#d1fae5' : '#f1f5f9');
          doc.fontSize(14).font('Helvetica-Bold').fillColor(bailColor).text(
            (index + 1).toString(), 
            63, 
            detailY + 20
          );
          
          const locataireNom = bail.locataire.typeLocataire === 'ENTREPRISE' 
            ? bail.locataire.raisonSociale 
            : `${bail.locataire.prenom} ${bail.locataire.nom}`;
          
          doc.fontSize(13).font('Helvetica-Bold').fillColor('#1e293b').text(
            locataireNom, 
            105, 
            detailY + 18,
            { width: 260 }
          );
          
          doc.fontSize(10).font('Helvetica').fillColor('#64748b').text(
            `Du ${new Date(bail.dateDebut).toLocaleDateString('fr-FR')}${bail.dateFin ? ' au ' + new Date(bail.dateFin).toLocaleDateString('fr-FR') : ''}`, 
            105, 
            detailY + 38,
            { width: 260 }
          );
          
          doc.roundedRect(105, detailY + 60, 65, 24, 6).fill(bail.statut === 'ACTIF' ? '#d1fae5' : '#f1f5f9');
          doc.fontSize(10).font('Helvetica-Bold').fillColor(bailColor).text(
            bail.statut, 
            110, 
            detailY + 67,
            { width: 55, align: 'center' }
          );
          
          doc.roundedRect(395, detailY + 18, 135, 65, 8).fill('#f1f5f9');
          doc.fontSize(11).fillColor('#64748b').text('Loyer HC', 400, detailY + 28, { width: 125, align: 'center' });
          doc.fontSize(17).font('Helvetica-Bold').fillColor('#3b82f6').text(
            `${bail.loyerHC.toLocaleString('fr-FR')} €`, 
            400, 
            detailY + 50,
            { width: 125, align: 'center' }
          );
          
          detailY += cardHeight + 15;
        });
      }
      
      // Section Prêts
      if (bien.prets.length > 0) {
        if (detailY > 400) {
          doc.addPage();
          doc.rect(0, 0, 595, 842).fill('#f8fafc');
          detailY = 50;
        } else {
          detailY += 20;
        }
        
        doc.fontSize(20).font('Helvetica-Bold').fillColor('#1e293b').text('Prêts Immobiliers', 50, detailY);
        detailY += 40;
        
        bien.prets.forEach((pret, index) => {
          if (detailY > 700) {
            doc.addPage();
            doc.rect(0, 0, 595, 842).fill('#f8fafc');
            detailY = 50;
          }
          
          const cardHeight = 110;
          doc.roundedRect(40, detailY, 515, cardHeight, 10).fill('#ffffff');
          doc.rect(40, detailY, 8, cardHeight).fill('#f97316');
          
          doc.circle(70, detailY + 28, 18).fill('#fed7aa');
          doc.fontSize(14).font('Helvetica-Bold').fillColor('#c2410c').text(
            (index + 1).toString(), 
            63, 
            detailY + 20
          );
          
          doc.fontSize(13).font('Helvetica-Bold').fillColor('#1e293b').text(
            pret.organisme, 
            105, 
            detailY + 18,
            { width: 260 }
          );
          
          doc.fontSize(10).font('Helvetica').fillColor('#64748b').text(
            `Depuis ${new Date(pret.dateDebut).toLocaleDateString('fr-FR')} • ${pret.duree} mois • Taux ${pret.taux}%`, 
            105, 
            detailY + 38,
            { width: 260 }
          );
          
          doc.fontSize(10).fillColor('#64748b').text('Montant emprunté', 105, detailY + 65, { width: 200 });
          doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b').text(
            `${(pret.montant / 1000).toFixed(0)}k €`, 
            105, 
            detailY + 82,
            { width: 200 }
          );
          
          doc.roundedRect(395, detailY + 18, 135, 75, 8).fill('#fef3c7');
          doc.fontSize(11).fillColor('#92400e').text('Mensualité', 400, detailY + 28, { width: 125, align: 'center' });
          doc.fontSize(18).font('Helvetica-Bold').fillColor('#b45309').text(
            `${pret.mensualite.toLocaleString('fr-FR')} €`, 
            400, 
            detailY + 53,
            { width: 125, align: 'center' }
          );
          
          detailY += cardHeight + 15;
        });
      }
    }
  });
  
  // Footer sur chaque page
  const addFooter = () => {
    doc.rect(0, 792, 595, 50).fill('#1e293b');
    doc.fontSize(9).fillColor('#94a3b8').text(
      `Export Patrimoine SCI • Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
      0,
      810,
      { width: 595, align: 'center' }
    );
  };
  
  // Ajouter footer sur toutes les pages
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    addFooter();
  }

  doc.end();
});
