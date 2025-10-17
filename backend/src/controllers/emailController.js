const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const PDFDocument = require('pdfkit');
const emailService = require('../services/emailService');
const config = require('../utils/pdf/pdfConfig');
const helpers = require('../utils/pdf/pdfHelpers');
const templates = require('../utils/pdf/pdfTemplates');

/**
 * Générer le PDF de la quittance ou facture en mémoire (buffer)
 * Support mensuel ET trimestriel
 */
const genererQuittancePDF = async (bail, mois, annee, datePaiement, typeDocument, typePeriode) => {
  return new Promise((resolve, reject) => {
    const montantLoyer = parseFloat(bail.loyerHC);
    const montantCharges = parseFloat(bail.charges) || 0;
    const montantTotal = montantLoyer + montantCharges;

    const doc = new PDFDocument(config.pageFormat);
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    if (typePeriode === 'TRIMESTRIELLE') {
      // Générer un PDF TRIMESTRIEL
      if (typeDocument === 'FACTURE') {
        genererFactureTrimestrielle(doc, bail, mois, annee, montantLoyer, montantCharges);
      } else {
        genererQuittanceTrimestrielle(doc, bail, mois, annee, montantLoyer, montantCharges);
      }
    } else {
      // Générer un PDF MENSUEL (code existant)
      const numeroQuittance = helpers.generateQuittanceNumber(bail.id, mois, annee);
      const statutPaiement = datePaiement ? 'PAYE' : 'EN ATTENTE';
      
      if (!datePaiement) {
        templates.addWatermark(doc, 'IMPAYE');
      }

      templates.drawHeader(doc, typeDocument === 'FACTURE' ? 'FACTURE DE LOYER' : 'QUITTANCE DE LOYER', null, statutPaiement);

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
         .text(`Document emis le ${helpers.formatDate(new Date(), 'medium')}`, 50, doc.y + 3);

      doc.moveDown(0.5);

      // Cartes BAILLEUR et LOCATAIRE
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

      // Historique (optionnel)
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

      // PIED DE PAGE
      templates.drawFooter(doc, 1, 1);
    }

    doc.end();
  });
};

// Fonction pour générer une quittance trimestrielle
function genererQuittanceTrimestrielle(doc, bail, moisDebut, annee, montantLoyer, montantCharges) {
  const montantTotal = montantLoyer + montantCharges;
  const montantTrimestre = montantTotal * 3;
  
  const mois1 = parseInt(moisDebut);
  const mois2 = mois1 + 1 > 12 ? 1 : mois1 + 1;
  const mois3 = mois1 + 2 > 12 ? (mois1 + 2) - 12 : mois1 + 2;
  const trimestre = Math.ceil(mois1 / 3);

  templates.drawHeader(doc, 'QUITTANCE DE LOYER - TRIMESTRIELLE', null, null);

  doc.fontSize(config.fontSizes.small).font(config.fonts.bold).fillColor(config.colors.text)
     .text('Periode concernee', 50, doc.y);
  doc.fontSize(config.fontSizes.large).font(config.fonts.bold).fillColor(config.colors.primary)
     .text(`Trimestre ${trimestre} - ${annee}`, 50, doc.y + 3);
  doc.fontSize(config.fontSizes.tiny).font(config.fonts.regular).fillColor(config.colors.textLight)
     .text(`${helpers.getMonthName(mois1)}, ${helpers.getMonthName(mois2)}, ${helpers.getMonthName(mois3)} ${annee}`, 50, doc.y + 3);
  doc.moveDown(0.5);

  // Cartes
  const cardY = doc.y;
  const baileurContent = [config.company.name, config.company.address, `${config.company.postalCode} ${config.company.city}`, config.company.phone || ''].filter(Boolean);
  templates.drawInfoCard(doc, { x: 50, y: cardY, width: 245, title: 'BAILLEUR', content: baileurContent });
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
  templates.drawInfoCard(doc, { x: 305, y: cardY, width: 245, title: 'LOCATAIRE', content: locataireContent });
  doc.y = cardY + Math.max(baileurHeight, doc.y - cardY);
  doc.moveDown(0.5);

  templates.drawSectionTitle(doc, 'Bien loue');
  doc.fontSize(config.fontSizes.small).font(config.fonts.bold).text(bail.bien.adresse, 50, doc.y);
  doc.font(config.fonts.regular).text(`${bail.bien.codePostal} ${bail.bien.ville}`, 50, doc.y);
  doc.moveDown(0.5);

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

  templates.drawHighlight(doc, { label: 'MONTANT TOTAL TRIMESTRE', value: helpers.formatCurrency(montantTrimestre), color: config.colors.primary, height: 40 });
  doc.moveDown(0.5);
  doc.fontSize(config.fontSizes.tiny).font(config.fonts.italic).fillColor(config.colors.textMuted)
     .text('Cette quittance trimestrielle couvre les trois mois mentionnes ci-dessus.', 50, doc.y, { width: 495, align: 'justify' });
  doc.moveDown(0.5);
  doc.fontSize(config.fontSizes.tiny).font(config.fonts.regular).fillColor(config.colors.text)
     .text(`Fait a ${config.company.city}, le ${helpers.formatDate(new Date(), 'medium')}`, 50, doc.y);
  templates.drawFooter(doc, 1, 1);
}

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

  templates.drawHeader(doc, 'FACTURE TRIMESTRIELLE', numeroFacture, null);
  doc.fontSize(config.fontSizes.small).font(config.fonts.bold).text('Periode de location', 50, doc.y);
  doc.fontSize(config.fontSizes.large).font(config.fonts.bold).fillColor(config.colors.primary)
     .text(`Trimestre ${trimestre} - ${annee}`, 50, doc.y + 3);
  doc.fontSize(config.fontSizes.tiny).font(config.fonts.regular).fillColor(config.colors.textLight)
     .text(`${helpers.getMonthName(mois1)}, ${helpers.getMonthName(mois2)}, ${helpers.getMonthName(mois3)}`, 50, doc.y + 3);
  doc.moveDown(0.5);

  // Cartes
  const cardY = doc.y;
  const baileurContent = [config.company.name, config.company.siren ? `SIREN: ${config.company.siren}` : '', config.company.address, `${config.company.postalCode} ${config.company.city}`].filter(Boolean);
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

  templates.drawSectionTitle(doc, 'Local loue');
  doc.fontSize(config.fontSizes.small).font(config.fonts.bold).text(bail.bien.adresse, 50, doc.y);
  doc.font(config.fonts.regular).text(`${bail.bien.codePostal} ${bail.bien.ville}`, 50, doc.y);
  doc.moveDown(0.5);

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
  doc.fontSize(config.fontSizes.small).font(config.fonts.bold).text('TOTAL HT', 350, recapY);
  doc.text(helpers.formatCurrency(montantTrimestreHT), 460, recapY, { width: 90, align: 'right' });
  doc.text('TOTAL TVA', 350, doc.y + 5);
  doc.text(helpers.formatCurrency(montantTVA), 460, doc.y, { width: 90, align: 'right' });
  doc.moveDown(0.3);
  templates.drawHighlight(doc, { label: 'TOTAL TTC A PAYER', value: helpers.formatCurrency(montantTTC), color: config.colors.primary, height: 40 });
  doc.moveDown(0.5);
  doc.fontSize(config.fontSizes.tiny).font(config.fonts.italic).fillColor(config.colors.textMuted)
     .text('Facture trimestrielle couvrant les trois mois mentionnes.', 50, doc.y, { width: 495, align: 'justify' });
  templates.drawFooter(doc, 1, 1);
}

/**
 * @desc    Envoyer une quittance par email
 * @route   POST /api/emails/envoyer-quittance
 * @access  Public
 */
exports.envoyerQuittanceEmail = asyncHandler(async (req, res) => {
  const { bailId, mois, annee, datePaiement, emailDestinataire, typePeriode = 'MENSUELLE' } = req.body;

  // Validation
  if (!bailId || !mois || !annee) {
    return res.status(400).json({
      success: false,
      error: 'bailId, mois et annee requis',
    });
  }

  // Récupérer le bail
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
      error: 'Bail non trouve',
    });
  }

  // Vérifier que le locataire a un email
  const emailTo = emailDestinataire || bail.locataire.email;
  if (!emailTo) {
    return res.status(400).json({
      success: false,
      error: 'Aucun email trouve pour ce locataire',
    });
  }

  // Générer le PDF
  const typeDocument = bail.locataire.typeLocataire === 'ENTREPRISE' ? 'FACTURE' : 'QUITTANCE';
  const pdfBuffer = await genererQuittancePDF(bail, mois, annee, datePaiement, typeDocument, typePeriode);

  // Préparer les données pour l'email
  const montantLoyer = parseFloat(bail.loyerHC);
  const montantCharges = parseFloat(bail.charges) || 0;
  const montantTotal = montantLoyer + montantCharges;
  const moisNom = helpers.getMonthName(parseInt(mois));
  const periode = typePeriode === 'TRIMESTRIELLE' 
    ? `Trimestre ${Math.ceil(parseInt(mois) / 3)} - ${annee}`
    : `${moisNom} ${annee}`;
  const locataireName = bail.locataire.typeLocataire === 'ENTREPRISE' 
    ? bail.locataire.raisonSociale 
    : `${bail.locataire.prenom} ${bail.locataire.nom}`;
  const filename = typePeriode === 'TRIMESTRIELLE'
    ? `${typeDocument.toLowerCase()}-T${Math.ceil(parseInt(mois) / 3)}-${annee}.pdf`
    : `${typeDocument.toLowerCase()}-${annee}-${String(mois).padStart(2, '0')}.pdf`;

  // Envoyer l'email
  try {
    const result = await emailService.envoyerQuittance({
      to: emailTo,
      locataireName,
      periode,
      montant: helpers.formatCurrency(typePeriode === 'TRIMESTRIELLE' ? montantTotal * 3 : montantTotal),
      pdfBuffer,
      filename,
    });

    // Enregistrer l'envoi dans la base de données (optionnel)
    // TODO: Créer un modèle EmailLog si besoin

    res.status(200).json({
      success: true,
      message: `Quittance envoyee a ${emailTo}`,
      data: {
        messageId: result.messageId,
        destinataire: emailTo,
        periode,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @desc    Envoyer toutes les quittances du mois par email
 * @route   POST /api/emails/envoyer-quittances-lot
 * @access  Public
 */
exports.envoyerQuittancesLotEmail = asyncHandler(async (req, res) => {
  const { mois, annee } = req.body;

  if (!mois || !annee) {
    return res.status(400).json({
      success: false,
      error: 'Mois et annee requis',
    });
  }

  // Récupérer tous les baux actifs avec email
  const baux = await prisma.bail.findMany({
    where: { 
      statut: 'ACTIF',
      locataire: {
        email: {
          not: null,
        },
      },
    },
    include: {
      bien: true,
      locataire: true,
      quittances: {
        orderBy: { createdAt: 'desc' },
        take: 6,
      },
    },
  });

  if (baux.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Aucun bail actif avec email trouve',
    });
  }

  const resultats = {
    succes: [],
    echecs: [],
  };

  // Envoyer les quittances
  for (const bail of baux) {
    try {
      // Générer le PDF
      const pdfBuffer = await genererQuittancePDF(bail, mois, annee, null);

      const montantLoyer = parseFloat(bail.loyerHC);
      const montantCharges = parseFloat(bail.charges) || 0;
      const montantTotal = montantLoyer + montantCharges;
      const moisNom = helpers.getMonthName(parseInt(mois));
      const periode = `${moisNom} ${annee}`;
      const locataireName = bail.locataire.typeLocataire === 'ENTREPRISE' 
        ? bail.locataire.raisonSociale 
        : `${bail.locataire.prenom} ${bail.locataire.nom}`;
      const numeroQuittance = helpers.generateQuittanceNumber(bail.id, mois, annee);

      // Envoyer
      await emailService.envoyerQuittance({
        to: bail.locataire.email,
        locataireName,
        periode,
        montant: helpers.formatCurrency(montantTotal),
        pdfBuffer,
        filename: `quittance-${numeroQuittance}.pdf`,
      });

      resultats.succes.push({
        locataire: locataireName,
        email: bail.locataire.email,
        bien: bail.bien.adresse,
      });
    } catch (error) {
      resultats.echecs.push({
        locataire: bail.locataire.typeLocataire === 'ENTREPRISE' 
          ? bail.locataire.raisonSociale 
          : `${bail.locataire.prenom} ${bail.locataire.nom}`,
        email: bail.locataire.email,
        erreur: error.message,
      });
    }
  }

  res.status(200).json({
    success: true,
    message: `${resultats.succes.length} quittance(s) envoyee(s), ${resultats.echecs.length} echec(s)`,
    data: resultats,
  });
});

/**
 * @desc    Envoyer une relance pour impayé
 * @route   POST /api/emails/envoyer-relance
 * @access  Public
 */
exports.envoyerRelanceEmail = asyncHandler(async (req, res) => {
  const { bailId, mois, annee } = req.body;

  if (!bailId || !mois || !annee) {
    return res.status(400).json({
      success: false,
      error: 'bailId, mois et annee requis',
    });
  }

  const bail = await prisma.bail.findUnique({
    where: { id: bailId },
    include: {
      locataire: true,
    },
  });

  if (!bail) {
    return res.status(404).json({
      success: false,
      error: 'Bail non trouve',
    });
  }

  if (!bail.locataire.email) {
    return res.status(400).json({
      success: false,
      error: 'Aucun email trouve pour ce locataire',
    });
  }

  const montantLoyer = parseFloat(bail.loyerHC);
  const montantCharges = parseFloat(bail.charges) || 0;
  const montantTotal = montantLoyer + montantCharges;
  const moisNom = helpers.getMonthName(parseInt(mois));
  const periode = `${moisNom} ${annee}`;
  const locataireName = bail.locataire.typeLocataire === 'ENTREPRISE' 
    ? bail.locataire.raisonSociale 
    : `${bail.locataire.prenom} ${bail.locataire.nom}`;

  // Calculer les jours de retard
  const dateEcheance = new Date(annee, mois - 1, 5);
  const aujourdhui = new Date();
  const joursRetard = Math.floor((aujourdhui - dateEcheance) / (1000 * 60 * 60 * 24));

  try {
    await emailService.envoyerRelance({
      to: bail.locataire.email,
      locataireName,
      periode,
      montant: helpers.formatCurrency(montantTotal),
      joursRetard: joursRetard > 0 ? joursRetard : 0,
    });

    res.status(200).json({
      success: true,
      message: `Relance envoyee a ${bail.locataire.email}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @desc    Tester la configuration email
 * @route   GET /api/emails/test
 * @access  Public
 */
exports.testerConfigurationEmail = asyncHandler(async (req, res) => {
  const result = await emailService.testerConfiguration();
  
  if (result.success) {
    res.status(200).json({
      success: true,
      message: 'Configuration email valide',
    });
  } else {
    res.status(500).json({
      success: false,
      error: result.message,
    });
  }
});
