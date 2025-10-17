const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const PDFDocument = require('pdfkit');
const config = require('../utils/pdf/pdfConfig');
const helpers = require('../utils/pdf/pdfHelpers');
const templates = require('../utils/pdf/pdfTemplates');

// ============================================
// HELPERS
// ============================================

/**
 * Vérifier qu'un bail appartient à un Space
 */
async function verifyBailInSpace(bailId, spaceId) {
  const bail = await prisma.bail.findUnique({
    where: { id: bailId },
    include: {
      bien: { select: { spaceId: true } }
    }
  });
  
  if (!bail) {
    throw new Error('BAIL_NOT_FOUND');
  }
  
  if (spaceId && bail.bien.spaceId !== spaceId) {
    throw new Error('BAIL_NOT_IN_SPACE');
  }
  
  return bail;
}

// ============================================
// CONTROLLERS
// ============================================

/**
 * @desc    Générer une quittance ou facture PDF
 * @route   POST /api/quittances/generer OU POST /api/spaces/:spaceId/quittances/generer
 * @access  Auth + Space (MEMBER minimum)
 */
exports.genererQuittance = asyncHandler(async (req, res) => {
  const { 
    bailId, 
    mois, 
    annee, 
    datePaiement,
    typePeriode = 'MENSUELLE', // MENSUELLE ou TRIMESTRIELLE
    typeDocument = 'QUITTANCE' // QUITTANCE ou FACTURE
  } = req.body;
  
  const spaceId = req.params.spaceId || req.body.spaceId;

  // Validation
  if (!bailId || !mois || !annee) {
    return res.status(400).json({
      success: false,
      error: 'bailId, mois et année requis',
    });
  }
  
  // Vérifier que le bail appartient au Space
  if (spaceId) {
    try {
      await verifyBailInSpace(bailId, spaceId);
    } catch (error) {
      if (error.message === 'BAIL_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: 'Bail non trouvé',
        });
      }
      return res.status(403).json({
        success: false,
        error: 'Ce bail n\'appartient pas à cet espace',
        code: 'BAIL_NOT_IN_SPACE'
      });
    }
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

  // Calculs de base
  const montantLoyer = parseFloat(bail.loyerHC);
  const montantCharges = parseFloat(bail.charges) || 0;
  
  // Créer le PDF
  const doc = new PDFDocument(config.pageFormat);

  // Headers pour le téléchargement
  res.setHeader('Content-Type', 'application/pdf');
  
  if (typePeriode === 'TRIMESTRIELLE') {
    // Générer PDF TRIMESTRIEL (3 mois en un document)
    const trimestre = Math.ceil(parseInt(mois) / 3);
    const filename = typeDocument === 'FACTURE' 
      ? `facture-T${trimestre}-${annee}.pdf`
      : `quittance-T${trimestre}-${annee}.pdf`;
    
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    doc.pipe(res);
    
    if (typeDocument === 'FACTURE') {
      genererFactureTrimestrielle(doc, bail, mois, annee, montantLoyer, montantCharges);
    } else {
      genererQuittanceTrimestrielle(doc, bail, mois, annee, montantLoyer, montantCharges);
    }
    
  } else {
    // Générer PDF MENSUEL
    const moisPadded = String(mois).padStart(2, '0');
    const filename = typeDocument === 'FACTURE'
      ? `facture-${annee}-${moisPadded}.pdf`
      : `quittance-${annee}-${moisPadded}.pdf`;
    
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    doc.pipe(res);
    
    const statutPaiement = datePaiement ? 'PAYE' : 'EN ATTENTE';
    
    if (typeDocument === 'FACTURE') {
      genererFactureMensuelle(doc, bail, mois, annee, datePaiement, montantLoyer, montantCharges);
    } else {
      genererQuittanceMensuelle(doc, bail, mois, annee, datePaiement, statutPaiement, montantLoyer, montantCharges);
    }
    
    // Sauvegarder dans la BDD
    const quittanceExistante = await prisma.quittance.findFirst({
      where: {
        bailId,
        mois: parseInt(mois),
        annee: parseInt(annee),
      },
    });
    
    if (!quittanceExistante) {
      const numeroQuittance = helpers.generateQuittanceNumber(bailId, mois, annee);
      await prisma.quittance.create({
        data: {
          bailId,
          mois: parseInt(mois),
          annee: parseInt(annee),
          numeroQuittance,
          montantLoyer,
          montantCharges,
          montantTotal: montantLoyer + montantCharges,
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
  }
});

/**
 * Générer une quittance mensuelle classique
 */
function genererQuittanceMensuelle(doc, bail, mois, annee, datePaiement, statutPaiement, montantLoyer, montantCharges) {
  const montantTotal = montantLoyer + montantCharges;
  
  // Watermark si non payé
  if (!datePaiement) {
    templates.addWatermark(doc, 'IMPAYE');
  }

  // EN-TÊTE
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

  const labelTotal = datePaiement ? 'MONTANT TOTAL REGLE' : 'MONTANT TOTAL A REGLER';
  const colorTotal = datePaiement ? config.colors.success : config.colors.primary;
  
  templates.drawHighlight(doc, {
    label: labelTotal,
    value: helpers.formatCurrency(montantTotal),
    color: colorTotal,
    height: 40,
  });

  doc.moveDown(0.3);

  // MENTIONS LÉGALES
  doc.moveDown(0.5);

  doc.fontSize(config.fontSizes.tiny)
     .font(config.fonts.italic)
     .fillColor(config.colors.textMuted)
     .text(
       'Je soussigne, proprietaire du logement designe ci-dessus, reconnais avoir recu de mon locataire la somme indiquee au titre du loyer et des charges recuperables pour la periode mentionnee. Cette quittance est delivree gratuitement conformement a l\'article 21 de la loi n 89-462 du 6 juillet 1989.',
       50,
       doc.y,
       { width: 495, align: 'justify', lineGap: -2 }
     );

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

  templates.drawFooter(doc, 1, 1);
  doc.end();
}

/**
 * Générer une quittance trimestrielle (3 mois en un document)
 */
function genererQuittanceTrimestrielle(doc, bail, moisDebut, annee, montantLoyer, montantCharges) {
  const montantTotal = montantLoyer + montantCharges;
  const montantTrimestre = montantTotal * 3;
  
  // Calculer les 3 mois
  const mois1 = parseInt(moisDebut);
  const mois2 = mois1 + 1 > 12 ? 1 : mois1 + 1;
  const mois3 = mois1 + 2 > 12 ? (mois1 + 2) - 12 : mois1 + 2;
  
  const trimestre = Math.ceil(mois1 / 3);

  // EN-TÊTE
  templates.drawHeader(doc, 'QUITTANCE DE LOYER - TRIMESTRIELLE', null, null);

  // PÉRIODE
  doc.fontSize(config.fontSizes.small)
     .font(config.fonts.bold)
     .fillColor(config.colors.text)
     .text('Periode concernee', 50, doc.y);

  doc.fontSize(config.fontSizes.large)
     .font(config.fonts.bold)
     .fillColor(config.colors.primary)
     .text(`Trimestre ${trimestre} - ${annee}`, 50, doc.y + 3);

  doc.fontSize(config.fontSizes.tiny)
     .font(config.fonts.regular)
     .fillColor(config.colors.textLight)
     .text(
       `${helpers.getMonthName(mois1)}, ${helpers.getMonthName(mois2)}, ${helpers.getMonthName(mois3)} ${annee}`,
       50,
       doc.y + 3
     );

  doc.moveDown(0.5);

  // CARTES BAILLEUR ET LOCATAIRE
  const cardY = doc.y;

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

  doc.y = cardY;
  
  const locataireContent = [];
  if (bail.locataire.typeLocataire === 'ENTREPRISE') {
    locataireContent.push(bail.locataire.raisonSociale);
    if (bail.locataire.siret) locataireContent.push(`SIRET: ${bail.locataire.siret}`);
  } else {
    locataireContent.push(`${bail.locataire.prenom} ${bail.locataire.nom}`);
  }

  if (bail.locataire.adresse) {
    locataireContent.push(bail.locataire.adresse);
    locataireContent.push(`${bail.locataire.codePostal} ${bail.locataire.ville}`);
  }

  templates.drawInfoCard(doc, {
    x: 305,
    y: cardY,
    width: 245,
    title: 'LOCATAIRE',
    content: locataireContent,
  });

  const locataireHeight = doc.y - cardY;
  doc.y = cardY + Math.max(baileurHeight, locataireHeight);
  doc.moveDown(0.5);

  // BIEN LOUÉ
  templates.drawSectionTitle(doc, 'Bien loue');

  doc.fontSize(config.fontSizes.small)
     .font(config.fonts.bold)
     .fillColor(config.colors.text)
     .text(bail.bien.adresse, 50, doc.y);

  doc.font(config.fonts.regular)
     .text(`${bail.bien.codePostal} ${bail.bien.ville}`, 50, doc.y);

  doc.moveDown(0.5);

  // DÉTAIL DES MONTANTS PAR MOIS
  templates.drawSectionTitle(doc, 'Detail trimestriel');

  templates.drawTable(doc, {
    headers: ['Mois', 'Loyer HC', 'Charges', 'Total'],
    rows: [
      [helpers.getMonthName(mois1), helpers.formatCurrency(montantLoyer), helpers.formatCurrency(montantCharges), helpers.formatCurrency(montantTotal)],
      [helpers.getMonthName(mois2), helpers.formatCurrency(montantLoyer), helpers.formatCurrency(montantCharges), helpers.formatCurrency(montantTotal)],
      [helpers.getMonthName(mois3), helpers.formatCurrency(montantLoyer), helpers.formatCurrency(montantCharges), helpers.formatCurrency(montantTotal)],
    ],
    columnWidths: [150, 115, 115, 115],
  });

  templates.drawHighlight(doc, {
    label: 'MONTANT TOTAL TRIMESTRE',
    value: helpers.formatCurrency(montantTrimestre),
    color: config.colors.primary,
    height: 40,
  });

  doc.moveDown(0.5);

  doc.fontSize(config.fontSizes.tiny)
     .font(config.fonts.italic)
     .fillColor(config.colors.textMuted)
     .text(
       'Cette quittance trimestrielle couvre les trois mois mentionnes ci-dessus. Elle est delivree gratuitement conformement a la loi.',
       50,
       doc.y,
       { width: 495, align: 'justify' }
     );

  doc.moveDown(0.5);
  doc.fontSize(config.fontSizes.tiny)
     .font(config.fonts.regular)
     .fillColor(config.colors.text)
     .text(`Fait a ${config.company.city}, le ${helpers.formatDate(new Date(), 'medium')}`, 50, doc.y);

  templates.drawFooter(doc, 1, 1);
  doc.end();
}

/**
 * Générer une facture mensuelle (location professionnelle avec TVA)
 */
function genererFactureMensuelle(doc, bail, mois, annee, datePaiement, montantLoyer, montantCharges) {
  const tauxTVA = 0.20; // 20%
  const montantHT = montantLoyer + montantCharges;
  const montantTVA = montantHT * tauxTVA;
  const montantTTC = montantHT + montantTVA;
  
  const numeroFacture = `F${annee}${String(mois).padStart(2, '0')}${String(bail.id).padStart(4, '0')}`;
  const dateEmission = new Date();
  const dateLimite = new Date(dateEmission);
  dateLimite.setDate(dateLimite.getDate() + 30);
  
  // EN-TÊTE
  templates.drawHeader(doc, 'FACTURE DE LOYER', numeroFacture, datePaiement ? 'PAYE' : 'IMPAYE');

  // PÉRIODE
  const moisNom = helpers.getMonthName(parseInt(mois));
  
  doc.fontSize(config.fontSizes.small)
     .font(config.fonts.bold)
     .fillColor(config.colors.text)
     .text('Periode de location', 50, doc.y);

  doc.fontSize(config.fontSizes.large)
     .font(config.fonts.bold)
     .fillColor(config.colors.primary)
     .text(`${moisNom} ${annee}`, 50, doc.y + 3);

  doc.fontSize(config.fontSizes.tiny)
     .font(config.fonts.regular)
     .fillColor(config.colors.textLight)
     .text(`Facture emise le ${helpers.formatDate(dateEmission, 'medium')}`, 50, doc.y + 3);
  
  doc.text(`Echeance : ${helpers.formatDate(dateLimite, 'medium')}`, 50, doc.y);

  doc.moveDown(0.5);

  // CARTES
  const cardY = doc.y;

  const baileurContent = [
    config.company.name,
    config.company.siren ? `SIREN: ${config.company.siren}` : '',
    config.company.address,
    `${config.company.postalCode} ${config.company.city}`,
    config.company.phone || '',
  ].filter(Boolean);

  templates.drawInfoCard(doc, {
    x: 50,
    y: cardY,
    width: 245,
    title: 'EMETTEUR',
    content: baileurContent,
  });

  const baileurHeight = doc.y - cardY;

  doc.y = cardY;
  
  const locataireContent = [];
  if (bail.locataire.typeLocataire === 'ENTREPRISE') {
    locataireContent.push(bail.locataire.raisonSociale);
    if (bail.locataire.siret) locataireContent.push(`SIRET: ${bail.locataire.siret}`);
  } else {
    locataireContent.push(`${bail.locataire.prenom} ${bail.locataire.nom}`);
  }

  if (bail.locataire.adresse) {
    locataireContent.push(bail.locataire.adresse);
    locataireContent.push(`${bail.locataire.codePostal} ${bail.locataire.ville}`);
  }

  templates.drawInfoCard(doc, {
    x: 305,
    y: cardY,
    width: 245,
    title: 'CLIENT',
    content: locataireContent,
  });

  doc.y = cardY + Math.max(baileurHeight, doc.y - cardY);
  doc.moveDown(0.5);

  // BIEN LOUÉ
  templates.drawSectionTitle(doc, 'Local loue');
  doc.fontSize(config.fontSizes.small)
     .font(config.fonts.bold)
     .text(bail.bien.adresse, 50, doc.y);
  doc.font(config.fonts.regular)
     .text(`${bail.bien.codePostal} ${bail.bien.ville}`, 50, doc.y);
  
  doc.moveDown(0.5);

  // DÉTAIL FACTURE
  templates.drawSectionTitle(doc, 'Detail de la facture');

  templates.drawTable(doc, {
    headers: ['Designation', 'Montant HT', 'TVA', 'Montant TTC'],
    rows: [
      ['Loyer hors charges', helpers.formatCurrency(montantLoyer), `${(tauxTVA * 100).toFixed(0)}%`, helpers.formatCurrency(montantLoyer * (1 + tauxTVA))],
      ['Charges refacturees', helpers.formatCurrency(montantCharges), `${(tauxTVA * 100).toFixed(0)}%`, helpers.formatCurrency(montantCharges * (1 + tauxTVA))],
    ],
    columnWidths: [250, 90, 70, 85],
  });

  // TOTAUX
  doc.moveDown(0.3);
  
  const recapY = doc.y;
  doc.fontSize(config.fontSizes.small)
     .font(config.fonts.bold)
     .fillColor(config.colors.text)
     .text('TOTAL HT', 350, recapY);
  doc.text(helpers.formatCurrency(montantHT), 460, recapY, { width: 90, align: 'right' });
  
  doc.text('TOTAL TVA', 350, doc.y + 5);
  doc.text(helpers.formatCurrency(montantTVA), 460, doc.y, { width: 90, align: 'right' });

  doc.moveDown(0.3);
  
  templates.drawHighlight(doc, {
    label: 'TOTAL TTC A PAYER',
    value: helpers.formatCurrency(montantTTC),
    color: datePaiement ? config.colors.success : config.colors.primary,
    height: 40,
  });

  doc.moveDown(0.5);

  // MENTIONS LÉGALES
  doc.fontSize(config.fontSizes.tiny)
     .font(config.fonts.italic)
     .fillColor(config.colors.textMuted)
     .text(
       `Mode de paiement : Virement, Cheque. Date limite de paiement : ${helpers.formatDate(dateLimite, 'medium')}. Conformement a l'article L. 441-6 du code de commerce, une indemnite de 40 EUR est due en l'absence de reglement le lendemain de la date de paiement figurant sur la facture, ainsi que des penalites de retard au taux de 10% par an.`,
       50,
       doc.y,
       { width: 495, align: 'justify', lineGap: -2 }
     );

  doc.moveDown(0.3);
  doc.text('Rappel : Les charges ne sont pas incluses dans le montant du loyer.', 50, doc.y);

  templates.drawFooter(doc, 1, 1);
  doc.end();
}

/**
 * Générer une facture trimestrielle
 */
function genererFactureTrimestrielle(doc, bail, moisDebut, annee, montantLoyer, montantCharges) {
  const tauxTVA = 0.20;
  const montantMensuelHT = montantLoyer + montantCharges;
  const montantTrimestreHT = montantMensuelHT * 3;
  const montantTVA = montantTrimestreHT * tauxTVA;
  const montantTTC = montantTrimestreHT + montantTVA;
  
  const mois1 = parseInt(moisDebut);
  const mois2 = mois1 + 1 > 12 ? 1 : mois1 + 1;
  const mois3 = mois1 + 2 > 12 ? (mois1 + 2) - 12 : mois1 + 2;
  const trimestre = Math.ceil(mois1 / 3);
  
  const numeroFacture = `FT${annee}T${trimestre}${String(bail.id).padStart(4, '0')}`;
  const dateEmission = new Date();
  const dateLimite = new Date(dateEmission);
  dateLimite.setDate(dateLimite.getDate() + 30);

  // EN-TÊTE
  templates.drawHeader(doc, 'FACTURE TRIMESTRIELLE', numeroFacture, null);

  doc.fontSize(config.fontSizes.small)
     .font(config.fonts.bold)
     .fillColor(config.colors.text)
     .text('Periode de location', 50, doc.y);

  doc.fontSize(config.fontSizes.large)
     .font(config.fonts.bold)
     .fillColor(config.colors.primary)
     .text(`Trimestre ${trimestre} - ${annee}`, 50, doc.y + 3);

  doc.fontSize(config.fontSizes.tiny)
     .font(config.fonts.regular)
     .fillColor(config.colors.textLight)
     .text(`${helpers.getMonthName(mois1)}, ${helpers.getMonthName(mois2)}, ${helpers.getMonthName(mois3)}`, 50, doc.y + 3);

  doc.moveDown(0.5);

  // CARTES
  const cardY = doc.y;

  const baileurContent = [
    config.company.name,
    config.company.siren ? `SIREN: ${config.company.siren}` : '',
    config.company.address,
    `${config.company.postalCode} ${config.company.city}`,
  ].filter(Boolean);

  templates.drawInfoCard(doc, { x: 50, y: cardY, width: 245, title: 'EMETTEUR', content: baileurContent });
  const baileurHeight = doc.y - cardY;

  doc.y = cardY;
  
  const locataireContent = [];
  if (bail.locataire.typeLocataire === 'ENTREPRISE') {
    locataireContent.push(bail.locataire.raisonSociale);
    if (bail.locataire.siret) locataireContent.push(`SIRET: ${bail.locataire.siret}`);
  } else {
    locataireContent.push(`${bail.locataire.prenom} ${bail.locataire.nom}`);
  }
  if (bail.locataire.adresse) {
    locataireContent.push(bail.locataire.adresse);
    locataireContent.push(`${bail.locataire.codePostal} ${bail.locataire.ville}`);
  }

  templates.drawInfoCard(doc, { x: 305, y: cardY, width: 245, title: 'CLIENT', content: locataireContent });

  doc.y = cardY + Math.max(baileurHeight, doc.y - cardY);
  doc.moveDown(0.5);

  // BIEN
  templates.drawSectionTitle(doc, 'Local loue');
  doc.fontSize(config.fontSizes.small).font(config.fonts.bold).text(bail.bien.adresse, 50, doc.y);
  doc.font(config.fonts.regular).text(`${bail.bien.codePostal} ${bail.bien.ville}`, 50, doc.y);
  doc.moveDown(0.5);

  // DÉTAIL
  templates.drawSectionTitle(doc, 'Detail de la facture');

  templates.drawTable(doc, {
    headers: ['Mois', 'Loyer HT', 'Charges HT', 'Total HT', 'TVA', 'Total TTC'],
    rows: [
      [helpers.getMonthName(mois1), helpers.formatCurrency(montantLoyer), helpers.formatCurrency(montantCharges), helpers.formatCurrency(montantMensuelHT), `${(tauxTVA * 100).toFixed(0)}%`, helpers.formatCurrency(montantMensuelHT * (1 + tauxTVA))],
      [helpers.getMonthName(mois2), helpers.formatCurrency(montantLoyer), helpers.formatCurrency(montantCharges), helpers.formatCurrency(montantMensuelHT), `${(tauxTVA * 100).toFixed(0)}%`, helpers.formatCurrency(montantMensuelHT * (1 + tauxTVA))],
      [helpers.getMonthName(mois3), helpers.formatCurrency(montantLoyer), helpers.formatCurrency(montantCharges), helpers.formatCurrency(montantMensuelHT), `${(tauxTVA * 100).toFixed(0)}%`, helpers.formatCurrency(montantMensuelHT * (1 + tauxTVA))],
    ],
    columnWidths: [100, 80, 80, 80, 50, 105],
  });

  doc.moveDown(0.3);
  
  const recapY = doc.y;
  doc.fontSize(config.fontSizes.small).font(config.fonts.bold).fillColor(config.colors.text)
     .text('TOTAL HT', 350, recapY);
  doc.text(helpers.formatCurrency(montantTrimestreHT), 460, recapY, { width: 90, align: 'right' });
  
  doc.text('TOTAL TVA', 350, doc.y + 5);
  doc.text(helpers.formatCurrency(montantTVA), 460, doc.y, { width: 90, align: 'right' });

  doc.moveDown(0.3);
  
  templates.drawHighlight(doc, {
    label: 'TOTAL TTC A PAYER',
    value: helpers.formatCurrency(montantTTC),
    color: config.colors.primary,
    height: 40,
  });

  doc.moveDown(0.5);

  doc.fontSize(config.fontSizes.tiny).font(config.fonts.italic).fillColor(config.colors.textMuted)
     .text(`Date limite de paiement : ${helpers.formatDate(dateLimite, 'medium')}. Facture trimestrielle couvrant les trois mois mentionnes.`, 50, doc.y, { width: 495, align: 'justify' });

  templates.drawFooter(doc, 1, 1);
  doc.end();
}

/**
 * @desc    Récupérer toutes les quittances d'un bail
 * @route   GET /api/quittances/bail/:bailId
 * @access  Auth + Space
 */
exports.getQuittancesByBail = asyncHandler(async (req, res) => {
  const { bailId } = req.params;
  const spaceId = req.params.spaceId || req.query.spaceId;
  
  // Vérifier que le bail appartient au Space
  if (spaceId) {
    try {
      await verifyBailInSpace(bailId, spaceId);
    } catch (error) {
      if (error.message === 'BAIL_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: 'Bail non trouvé',
        });
      }
      return res.status(403).json({
        success: false,
        error: 'Ce bail n\'appartient pas à cet espace',
        code: 'BAIL_NOT_IN_SPACE'
      });
    }
  }

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
 * @desc    Marquer une quittance comme payée
 * @route   PATCH /api/quittances/:id/payer
 * @access  Auth + Space (MEMBER minimum)
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
