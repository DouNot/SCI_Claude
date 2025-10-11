const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const PDFDocument = require('pdfkit');

// @desc    Générer une quittance PDF
// @route   POST /api/quittances/generer
// @access  Public
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
    },
  });

  if (!bail) {
    return res.status(404).json({
      success: false,
      error: 'Bail non trouvé',
    });
  }

  // Calculs
  const montantLoyer = bail.loyerHC;
  const montantCharges = bail.charges || 0;
  const montantTotal = montantLoyer + montantCharges;

  // Créer le PDF
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Headers pour le téléchargement
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=quittance-${annee}-${String(mois).padStart(2, '0')}.pdf`
  );

  // Pipe le PDF vers la réponse
  doc.pipe(res);

  // Titre
  doc
    .fontSize(24)
    .font('Helvetica-Bold')
    .text('QUITTANCE DE LOYER', { align: 'center' })
    .moveDown(2);

  // Infos bailleur (à adapter avec tes infos)
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('BAILLEUR', { underline: true })
    .moveDown(0.5)
    .font('Helvetica')
    .text('SCI Claude') // À remplacer par tes vraies infos
    .text('Adresse du bailleur')
    .moveDown(1.5);

  // Infos locataire
  doc
    .font('Helvetica-Bold')
    .text('LOCATAIRE', { underline: true })
    .moveDown(0.5)
    .font('Helvetica');

  if (bail.locataire.typeLocataire === 'ENTREPRISE') {
    doc.text(bail.locataire.raisonSociale);
    if (bail.locataire.siret) {
      doc.text(`SIRET: ${bail.locataire.siret}`);
    }
  } else {
    doc.text(`${bail.locataire.prenom} ${bail.locataire.nom}`);
  }

  if (bail.locataire.adresse) {
    doc.text(bail.locataire.adresse);
    doc.text(`${bail.locataire.codePostal} ${bail.locataire.ville}`);
  }
  doc.moveDown(1.5);

  // Infos bien
  doc
    .font('Helvetica-Bold')
    .text('BIEN LOUÉ', { underline: true })
    .moveDown(0.5)
    .font('Helvetica')
    .text(bail.bien.adresse)
    .text(`${bail.bien.codePostal} ${bail.bien.ville}`)
    .moveDown(2);

  // Période
  const moisNom = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ][mois - 1];

  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text(`PÉRIODE : ${moisNom} ${annee}`, { align: 'center' })
    .moveDown(2);

  // Tableau des montants
  doc.fontSize(12).font('Helvetica');

  const tableTop = doc.y;
  const col1 = 50;
  const col2 = 400;

  // Ligne loyer
  doc.text('Loyer hors charges', col1, tableTop);
  doc.text(`${montantLoyer.toFixed(2)} €`, col2, tableTop, { width: 100, align: 'right' });

  // Ligne charges
  doc.text('Charges', col1, tableTop + 25);
  doc.text(`${montantCharges.toFixed(2)} €`, col2, tableTop + 25, { width: 100, align: 'right' });

  // Ligne séparation
  doc
    .moveTo(col1, tableTop + 50)
    .lineTo(500, tableTop + 50)
    .stroke();

  // Ligne total
  doc.font('Helvetica-Bold');
  doc.text('TOTAL', col1, tableTop + 60);
  doc.text(`${montantTotal.toFixed(2)} €`, col2, tableTop + 60, { width: 100, align: 'right' });

  doc.moveDown(3);

  // Date paiement
  if (datePaiement) {
    const dateFormatee = new Date(datePaiement).toLocaleDateString('fr-FR');
    doc
      .font('Helvetica')
      .fontSize(11)
      .text(`Payé le : ${dateFormatee}`, { align: 'left' });
  }

  doc.moveDown(2);

  // Texte légal
  doc
    .fontSize(10)
    .font('Helvetica-Oblique')
    .text(
      'Je soussigné, propriétaire du logement désigné ci-dessus, reconnais avoir reçu de mon locataire la somme indiquée au titre du loyer et des charges.'
    );

  doc.moveDown(2);

  // Signature
  doc
    .fontSize(11)
    .font('Helvetica')
    .text(`Fait à __________, le ${new Date().toLocaleDateString('fr-FR')}`);

  doc.moveDown(1);
  doc.text('Signature du bailleur :');

  // Finaliser le PDF
  doc.end();

  // Sauvegarder dans la BDD (optionnel)
  await prisma.quittance.create({
    data: {
      bailId,
      mois: parseInt(mois),
      annee: parseInt(annee),
      montantLoyer,
      montantCharges,
      montantTotal,
      datePaiement: datePaiement ? new Date(datePaiement) : null,
      estPaye: !!datePaiement,
    },
  });
});

// @desc    Récupérer toutes les quittances d'un bail
// @route   GET /api/quittances/bail/:bailId
// @access  Public
exports.getQuittancesByBail = asyncHandler(async (req, res) => {
  const { bailId } = req.params;

  const quittances = await prisma.quittance.findMany({
    where: { bailId },
    orderBy: [
      { annee: 'desc' },
      { mois: 'desc' },
    ],
  });

  res.status(200).json({
    success: true,
    count: quittances.length,
    data: quittances,
  });
});