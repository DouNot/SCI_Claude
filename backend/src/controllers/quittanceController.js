const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const PDFDocument = require('pdfkit');
const config = require('../utils/pdf/pdfConfig');
const helpers = require('../utils/pdf/pdfHelpers');
const templates = require('../utils/pdf/pdfTemplates');

/**
 * @desc    Générer une quittance PDF classique
 * @route   POST /api/quittances/generer
 * @access  Public
 */
exports.genererQuittance = asyncHandler(async (req, res) => {
  const { bailId, mois, annee, datePaiement } = req.body;

  // Validation
  if (!bailId || !mois || !annee) {
    return res.status(400).json({
      success: false,
      error: 'bailId, mois et année requis',
    });
  }

  // Récupérer le bail avec toutes les infos
  const bail = await prisma.bail.findUnique({
    where: { id: bailId },
    include: {
      bien: true,
      locataire: true,
      quittances: {
        orderBy: { createdAt: 'desc' },
        take: 6,
      },
    },
  });

  if (!bail) {
    return res.status(404).json({
      success: false,
      error: 'Bail non trouvé',
    });
  }

  // Vérifier si la quittance existe déjà
  const quittanceExistante = await prisma.quittance.findFirst({
    where: {
      bailId,
      mois: parseInt(mois),
      annee: parseInt(annee),
    },
  });

  // Calculs
  const montantLoyer = parseFloat(bail.loyerHC);
  const montantCharges = parseFloat(bail.charges) || 0;
  const montantTotal = montantLoyer + montantCharges;

  // Générer le numéro de quittance
  const numeroQuittance = helpers.generateQuittanceNumber(bailId, mois, annee);

  // Créer le PDF
  const doc = new PDFDocument(config.pageFormat);

  // Headers pour le téléchargement
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=quittance-${numeroQuittance}.pdf`
  );

  doc.pipe(res);

  // Déterminer le statut de paiement
  const statutPaiement = datePaiement ? 'PAYE' : 'EN ATTENTE';
  
  // Watermark si non payé
  if (!datePaiement) {
    templates.addWatermark(doc, 'IMPAYE');
  }

  // EN-TÊTE avec statut de paiement intégré
  templates.drawHeader(doc, 'QUITTANCE DE LOYER', null, statutPaiement);

  // PÉRIODE
  const moisNom = helpers.getMonthName(parseInt(mois));
  const periodeTexte = `${moisNom} ${annee}`;

  doc.fontSize(config.fontSizes.small)
     .font(config.fonts.bold)
     .fillColor(config.colors.text)
     .text('Periode concernee', 50, doc.y);

  doc.fontSize(config.fontSizes.large)
     .font(config.fonts.bold)
     .fillColor(config.colors.primary)
     .text(periodeTexte, 50, doc.y + 3);

  doc.fontSize(config.fontSizes.tiny)
     .font(config.fonts.regular)
     .fillColor(config.colors.textLight)
     .text(
       `Document emis le ${helpers.formatDate(new Date(), 'medium')}`,
       50,
       doc.y + 3
     );

  doc.moveDown(0.5);

  // CARTES BAILLEUR ET LOCATAIRE
  const cardY = doc.y;

  // Carte Bailleur (avec téléphone)
  const baileurContent = [
    config.company.name,
    config.company.address,
    `${config.company.postalCode} ${config.company.city}`,
    config.company.phone || '',
  ].filter(Boolean);

  templates.drawInfoCard(doc, {
    x: 50,
    y: cardY,
    width: 245,
    title: 'BAILLEUR',
    content: baileurContent,
  });

  const baileurHeight = doc.y - cardY;

  // Carte Locataire
  doc.y = cardY;
  
  const locataireContent = [];
  if (bail.locataire.typeLocataire === 'ENTREPRISE') {
    locataireContent.push(bail.locataire.raisonSociale);
    if (bail.locataire.siret) {
      locataireContent.push(`SIRET: ${bail.locataire.siret}`);
    }
  } else {
    locataireContent.push(`${bail.locataire.prenom} ${bail.locataire.nom}`);
  }

  if (bail.locataire.adresse) {
    locataireContent.push(bail.locataire.adresse);
    locataireContent.push(`${bail.locataire.codePostal} ${bail.locataire.ville}`);
  }

  if (bail.locataire.telephone) {
    locataireContent.push(`Tel: ${helpers.formatPhone(bail.locataire.telephone)}`);
  }

  if (bail.locataire.email) {
    locataireContent.push(bail.locataire.email);
  }

  templates.drawInfoCard(doc, {
    x: 305,
    y: cardY,
    width: 245,
    title: 'LOCATAIRE',
    content: locataireContent,
  });

  const locataireHeight = doc.y - cardY;
  const maxHeight = Math.max(baileurHeight, locataireHeight);
  
  doc.y = cardY + maxHeight;
  doc.moveDown(0.5);

  // BIEN LOUÉ
  templates.drawSectionTitle(doc, 'Bien loue');

  doc.fontSize(config.fontSizes.small)
     .font(config.fonts.bold)
     .fillColor(config.colors.text)
     .text(bail.bien.adresse, 50, doc.y);

  doc.font(config.fonts.regular)
     .text(`${bail.bien.codePostal} ${bail.bien.ville}`, 50, doc.y);

  if (bail.bien.type || bail.bien.surface) {
    const typeBien = bail.bien.type ? helpers.formatBienType(bail.bien.type) : '';
    const surface = bail.bien.surface ? `${bail.bien.surface} m2` : '';
    
    let detailsLine = '';
    if (typeBien && surface) {
      detailsLine = `${typeBien} - ${surface}`;
    } else if (typeBien) {
      detailsLine = typeBien;
    } else if (surface) {
      detailsLine = `Surface : ${surface}`;
    }
    
    doc.fillColor(config.colors.textLight)
       .text(detailsLine, 50, doc.y);
  }

  doc.moveDown(0.5);

  // DÉTAIL DES MONTANTS
  templates.drawSectionTitle(doc, 'Detail des montants');

  const tableY = doc.y;

  templates.drawTable(doc, {
    y: tableY,
    headers: ['Designation', 'Montant'],
    rows: [
      ['Loyer hors charges', helpers.formatCurrency(montantLoyer)],
      ['Charges locatives', helpers.formatCurrency(montantCharges)],
    ],
    columnWidths: [350, 145],
  });

  // Total
  templates.drawHighlight(doc, {
    label: 'MONTANT TOTAL A REGLER',
    value: helpers.formatCurrency(montantTotal),
    color: config.colors.success,
    height: 40,
  });

  doc.moveDown(0.3);

  // HISTORIQUE (2 derniers seulement)
  if (bail.quittances && bail.quittances.length > 1) {
    templates.drawSectionTitle(doc, 'Historique recent');

    const histoRows = bail.quittances
      .slice(0, 2)
      .map(q => [
        helpers.getMonthName(q.mois) + ' ' + q.annee,
        helpers.formatCurrency(q.montantTotal),
        q.estPaye ? 'Paye' : 'En attente',
      ]);

    templates.drawTable(doc, {
      headers: ['Periode', 'Montant', 'Statut'],
      rows: histoRows,
      columnWidths: [200, 145, 150],
    });

    doc.moveDown(0.3);
  }

  // MENTIONS LÉGALES
  doc.moveDown(0.5);

  doc.fontSize(config.fontSizes.tiny)
     .font(config.fonts.italic)
     .fillColor(config.colors.textMuted)
     .text(
       'Je soussigne, proprietaire du logement designe ci-dessus, reconnais avoir recu de mon locataire la somme indiquee au titre du loyer et des charges recuperables pour la periode mentionnee. Ce document certifie que le locataire s\'est acquitte de ses obligations locatives. Cette quittance est delivree gratuitement conformement a l\'article 21 de la loi n 89-462 du 6 juillet 1989.',
       50,
       doc.y,
       { width: 495, align: 'justify', lineGap: -2 }
     );

  // SIGNATURE
  doc.moveDown(0.5);

  doc.fontSize(config.fontSizes.tiny)
     .font(config.fonts.regular)
     .fillColor(config.colors.text)
     .text(
       `Fait a ${config.company.city}, le ${helpers.formatDate(new Date(), 'medium')}`,
       50,
       doc.y
     );

  doc.moveDown(0.2);
  doc.text('Signature du bailleur :', 50, doc.y);

  // PIED DE PAGE (remonté)
  templates.drawFooter(doc, 1, 1);

  doc.end();

  // SAUVEGARDER DANS LA BDD
  if (!quittanceExistante) {
    await prisma.quittance.create({
      data: {
        bailId,
        mois: parseInt(mois),
        annee: parseInt(annee),
        numeroQuittance,
        montantLoyer,
        montantCharges,
        montantTotal,
        datePaiement: datePaiement ? new Date(datePaiement) : null,
        estPaye: !!datePaiement,
      },
    });
  } else if (datePaiement && !quittanceExistante.estPaye) {
    await prisma.quittance.update({
      where: { id: quittanceExistante.id },
      data: {
        datePaiement: new Date(datePaiement),
        estPaye: true,
      },
    });
  }
});

/**
 * @desc    Récupérer toutes les quittances d'un bail
 * @route   GET /api/quittances/bail/:bailId
 * @access  Public
 */
exports.getQuittancesByBail = asyncHandler(async (req, res) => {
  const { bailId } = req.params;

  const quittances = await prisma.quittance.findMany({
    where: { bailId },
    orderBy: [{ annee: 'desc' }, { mois: 'desc' }],
  });

  res.status(200).json({
    success: true,
    count: quittances.length,
    data: quittances,
  });
});

/**
 * @desc    Générer toutes les quittances d'un mois en lot
 * @route   POST /api/quittances/generer-lot
 * @access  Public
 */
exports.genererQuittancesEnLot = asyncHandler(async (req, res) => {
  const { mois, annee } = req.body;

  if (!mois || !annee) {
    return res.status(400).json({
      success: false,
      error: 'Mois et annee requis',
    });
  }

  const baux = await prisma.bail.findMany({
    where: { statut: 'ACTIF' },
    include: {
      bien: true,
      locataire: true,
    },
  });

  if (baux.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Aucun bail actif trouve',
    });
  }

  const quittancesGenerees = [];

  for (const bail of baux) {
    const existante = await prisma.quittance.findFirst({
      where: {
        bailId: bail.id,
        mois: parseInt(mois),
        annee: parseInt(annee),
      },
    });

    if (!existante) {
      const montantLoyer = parseFloat(bail.loyerHC);
      const montantCharges = parseFloat(bail.charges) || 0;
      const montantTotal = montantLoyer + montantCharges;
      const numeroQuittance = helpers.generateQuittanceNumber(bail.id, mois, annee);

      const quittance = await prisma.quittance.create({
        data: {
          bailId: bail.id,
          mois: parseInt(mois),
          annee: parseInt(annee),
          numeroQuittance,
          montantLoyer,
          montantCharges,
          montantTotal,
          estPaye: false,
        },
      });

      quittancesGenerees.push(quittance);
    }
  }

  res.status(200).json({
    success: true,
    message: `${quittancesGenerees.length} quittance(s) generee(s) pour ${helpers.getMonthName(mois)} ${annee}`,
    data: quittancesGenerees,
  });
});

/**
 * @desc    Marquer une quittance comme payée
 * @route   PATCH /api/quittances/:id/payer
 * @access  Public
 */
exports.marquerPayee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { datePaiement } = req.body;

  if (!datePaiement) {
    return res.status(400).json({
      success: false,
      error: 'Date de paiement requise',
    });
  }

  const quittance = await prisma.quittance.update({
    where: { id },
    data: {
      datePaiement: new Date(datePaiement),
      estPaye: true,
    },
  });

  res.status(200).json({
    success: true,
    data: quittance,
  });
});
