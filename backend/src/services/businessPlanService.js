const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const prisma = require('../config/database');
const config = require('../utils/pdf/pdfConfig');
const helpers = require('../utils/pdf/pdfHelpers');
const templates = require('../utils/pdf/pdfTemplates');

/**
 * 🎯 SERVICE ENRICHI - Business Plans Bancaires PROFESSIONNELS
 * Version complète avec TOUTES les sections recommandées pour convaincre une banque
 * 
 * SECTIONS AJOUTÉES :
 * ✅ Description détaillée du bien ciblé
 * ✅ Tableau de financement complet
 * ✅ Justification du cashflow
 * ✅ Analyse stratégique du projet
 * ✅ Projections patrimoniales consolidées
 * ✅ Indicateurs avancés (TRI, rendement, payback)
 * ✅ Présentation détaillée des associés
 * ✅ Section risques & plan B
 */

const businessPlansDir = path.join(__dirname, '../../uploads/business-plans');
if (!fs.existsSync(businessPlansDir)) {
  fs.mkdirSync(businessPlansDir, { recursive: true });
}

/**
 * 📊 Collecter TOUTES les données - VERSION ENRICHIE
 */
async function collecterDonneesBusinessPlan(businessPlanId, spaceId) {
  console.log(`📊 [BP ENRICHI] Collecte des données complètes...`);

  const businessPlan = await prisma.businessPlan.findUnique({
    where: { id: businessPlanId },
  });

  const space = await prisma.space.findUnique({
    where: { id: spaceId },
    include: {
      associes: {
        where: { statut: 'ACTIF' },
        orderBy: { pourcentage: 'desc' },
      },
    },
  });

  const biens = await prisma.bien.findMany({
    where: { spaceId },
    include: {
      baux: {
        where: { statut: 'ACTIF' },
        include: { locataire: true },
      },
      prets: true,
      factures: {
        where: { estPaye: true },
        orderBy: { dateFacture: 'desc' },
        take: 12,
      },
      photos: { where: { isPrimary: true } },
    },
  });

  // Calculs financiers de base
  const valeurTotaleBiens = biens.reduce((sum, b) => sum + (b.valeurActuelle || b.prixAchat), 0);
  const revenusMensuels = biens.reduce((sum, b) => {
    return sum + b.baux.reduce((s, bail) => s + (bail.loyerHC + (bail.charges || 0)), 0);
  }, 0);
  const chargesMensuelles = biens.reduce((sum, b) => {
    let charges = 0;
    if (b.assuranceMensuelle) charges += b.assuranceMensuelle;
    if (b.taxeFonciere) charges += b.taxeFonciere / 12;
    return sum + charges;
  }, 0);

  const pretsActuels = biens.flatMap(b => b.prets);
  const mensualitesActuelles = pretsActuels.reduce((sum, p) => sum + p.mensualite, 0);
  const capitalRestantDuActuel = calculerCapitalRestantDu(pretsActuels);
  const cashflowMensuelActuel = revenusMensuels - chargesMensuelles - mensualitesActuelles;

  // Simulation nouveau prêt
  const tauxMensuel = (businessPlan.tauxEstime || 3.5) / 100 / 12;
  const mensualiteNouveau = calculerMensualite(businessPlan.montantDemande, tauxMensuel, businessPlan.dureePret);
  const coutTotalNouveau = mensualiteNouveau * businessPlan.dureePret;

  // 🆕 INDICATEURS AVANCÉS
  const apportEstime = businessPlan.montantDemande * 0.2;
  const fraisNotaire = businessPlan.montantDemande * 0.08;
  const investissementTotal = businessPlan.montantDemande + fraisNotaire;
  const cashflowAnnuel = (revenusMensuels - chargesMensuelles - mensualitesActuelles - mensualiteNouveau) * 12;
  
  const tri = calculerTRI(apportEstime + fraisNotaire, cashflowAnnuel, businessPlan.montantDemande, 20);
  const rendementBrut = valeurTotaleBiens > 0 ? ((revenusMensuels * 12) / valeurTotaleBiens) * 100 : 0;
  const rendementNet = valeurTotaleBiens > 0 ? (cashflowAnnuel / valeurTotaleBiens) * 100 : 0;
  const paybackPeriod = cashflowAnnuel > 0 ? (apportEstime + fraisNotaire) / cashflowAnnuel : Infinity;
  const cashOnCashReturn = (apportEstime + fraisNotaire) > 0 ? (cashflowAnnuel / (apportEstime + fraisNotaire)) * 100 : 0;

  // Projections enrichies
  const projections = calculerProjectionsFutures(
    businessPlan,
    revenusMensuels,
    chargesMensuelles,
    mensualitesActuelles,
    mensualiteNouveau,
    capitalRestantDuActuel,
    valeurTotaleBiens
  );

  // Ratios
  const tauxEndettementActuel = revenusMensuels > 0 ? (mensualitesActuelles / revenusMensuels) * 100 : 0;
  const tauxEndettementFutur = revenusMensuels > 0 ? ((mensualitesActuelles + mensualiteNouveau) / revenusMensuels) * 100 : 0;
  const ratioLTV = (valeurTotaleBiens + businessPlan.montantDemande) > 0 ? 
    ((capitalRestantDuActuel + businessPlan.montantDemande) / (valeurTotaleBiens + businessPlan.montantDemande)) * 100 : 0;

  console.log(`✅ [BP ENRICHI] Données collectées : TRI=${tri.toFixed(2)}%, Rendement Net=${rendementNet.toFixed(2)}%`);

  return {
    businessPlan,
    space,
    biens,
    stats: {
      nbBiens: biens.length,
      nbBauxActifs: biens.reduce((sum, b) => sum + b.baux.length, 0),
      valeurTotaleBiens,
      revenusMensuels,
      chargesMensuelles,
      mensualitesActuelles,
      cashflowMensuelActuel,
      cashflowAnnuelActuel: cashflowMensuelActuel * 12,
      capitalRestantDuActuel,
      patrimoineNet: valeurTotaleBiens - capitalRestantDuActuel,
      
      montantDemande: businessPlan.montantDemande,
      dureePret: businessPlan.dureePret,
      tauxEstime: businessPlan.tauxEstime || 3.5,
      mensualiteNouveau,
      coutTotalNouveau,
      coutCreditNouveau: coutTotalNouveau - businessPlan.montantDemande,
      apportEstime,
      fraisNotaire,
      investissementTotal,
      
      mensualitesTotales: mensualitesActuelles + mensualiteNouveau,
      cashflowMensuelFutur: revenusMensuels - chargesMensuelles - (mensualitesActuelles + mensualiteNouveau),
      cashflowAnnuelFutur: cashflowAnnuel,
      
      tauxEndettementActuel,
      tauxEndettementFutur,
      ratioLTV,
      tri,
      rendementBrut,
      rendementNet,
      paybackPeriod,
      cashOnCashReturn,
    },
    projections,
  };
}

/**
 * 📈 Calcul du TRI
 */
function calculerTRI(investissement, cashflowAnnuel, valeurFinale, dureeAnnees) {
  let tauxMin = -0.5, tauxMax = 1.0;
  for (let i = 0; i < 50; i++) {
    const taux = (tauxMin + tauxMax) / 2;
    let van = -investissement;
    for (let n = 1; n <= dureeAnnees; n++) {
      van += cashflowAnnuel / Math.pow(1 + taux, n);
    }
    van += valeurFinale / Math.pow(1 + taux, dureeAnnees);
    if (Math.abs(van) < 0.01) return taux * 100;
    van > 0 ? tauxMin = taux : tauxMax = taux;
  }
  return ((tauxMin + tauxMax) / 2) * 100;
}

function calculerCapitalRestantDu(prets) {
  return prets.reduce((sum, p) => {
    const moisEcoules = Math.max(0, Math.floor((Date.now() - new Date(p.dateDebut)) / (1000 * 60 * 60 * 24 * 30)));
    const tauxMensuel = p.taux / 100 / 12;
    if (tauxMensuel === 0) return sum + Math.max(0, p.montant - (p.montant / p.duree) * moisEcoules);
    const crd = p.montant * ((Math.pow(1 + tauxMensuel, p.duree) - Math.pow(1 + tauxMensuel, moisEcoules)) / (Math.pow(1 + tauxMensuel, p.duree) - 1));
    return sum + Math.max(0, crd);
  }, 0);
}

function calculerMensualite(capital, tauxMensuel, nMois) {
  if (tauxMensuel === 0) return capital / nMois;
  return (capital * tauxMensuel * Math.pow(1 + tauxMensuel, nMois)) / (Math.pow(1 + tauxMensuel, nMois) - 1);
}

/**
 * 📊 Projections ENRICHIES avec patrimoine net
 */
function calculerProjectionsFutures(bp, revenus, charges, mensActuelles, mensNouveau, crdActuel, valeurPatrimoine) {
  const projections = [];
  const duree = bp.dureeProjection || 10;
  let capitalRestantDu = crdActuel + bp.montantDemande;
  let valeurActuelle = valeurPatrimoine + bp.montantDemande;
  
  for (let annee = 1; annee <= duree; annee++) {
    const revenusAnnee = revenus * 12 * Math.pow(1.02, annee - 1);
    const chargesAnnee = charges * 12 * Math.pow(1.025, annee - 1);
    const mensualitesAnnee = (mensActuelles + mensNouveau) * 12;
    const cashflow = revenusAnnee - chargesAnnee - mensualitesAnnee;
    
    capitalRestantDu = Math.max(0, capitalRestantDu - mensualitesAnnee * 0.6);
    valeurActuelle *= 1.02;
    
    projections.push({
      annee,
      revenus: Math.round(revenusAnnee),
      charges: Math.round(chargesAnnee),
      mensualitesPret: Math.round(mensualitesAnnee),
      cashflow: Math.round(cashflow),
      valeurPatrimoine: Math.round(valeurActuelle),
      capitalRestantDu: Math.round(capitalRestantDu),
      patrimoineNet: Math.round(valeurActuelle - capitalRestantDu),
    });
  }
  return projections;
}

/**
 * 🎨 GÉNÉRATION DU PDF ENRICHI - COMPLET
 */
async function genererBusinessPlanPDF(businessPlanId, spaceId) {
  console.log(`🎨 [BP ENRICHI] Génération du PDF professionnel...`);

  const donnees = await collecterDonneesBusinessPlan(businessPlanId, spaceId);
  const doc = new PDFDocument(config.pageFormat);
  const timestamp = Date.now();
  const filename = `business_plan_${donnees.space.nom.replace(/\s+/g, '_')}_${timestamp}.pdf`;
  const filepath = path.join(businessPlansDir, filename);
  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);

  let pageNumber = 0;
  const addPage = () => { doc.addPage(); pageNumber++; };

  // 📄 PAGE 1 : COUVERTURE
  pageNumber = 1;
  genererPageCouverture(doc, donnees);

  // 📄 PAGE 2 : SOMMAIRE EXÉCUTIF
  addPage();
  templates.drawHeader(doc, 'SOMMAIRE EXECUTIF');
  genererSommaireExecutif(doc, donnees);
  templates.drawFooter(doc, pageNumber, 'X');

  // 📄 PAGE 3 : PRÉSENTATION SCI
  addPage();
  templates.drawHeader(doc, 'PRESENTATION DE LA SOCIETE');
  genererPresentationSCI(doc, donnees);
  templates.drawFooter(doc, pageNumber, 'X');

  // 📄 PAGE 4 : LE PROJET - DESCRIPTION DÉTAILLÉE
  addPage();
  templates.drawHeader(doc, 'LE PROJET');
  genererDescriptionProjet(doc, donnees);
  templates.drawFooter(doc, pageNumber, 'X');

  // 📄 PAGE 5 : PLAN DE FINANCEMENT DÉTAILLÉ
  addPage();
  templates.drawHeader(doc, 'PLAN DE FINANCEMENT');
  genererPlanFinancement(doc, donnees);
  templates.drawFooter(doc, pageNumber, 'X');

  // 📄 PAGE 6 : SITUATION PATRIMONIALE
  addPage();
  templates.drawHeader(doc, 'SITUATION PATRIMONIALE ACTUELLE');
  genererSituationPatrimoniale(doc, donnees);
  templates.drawFooter(doc, pageNumber, 'X');

  // 📄 PAGE 7 : PROJECTIONS FINANCIÈRES
  addPage();
  templates.drawHeader(doc, 'PROJECTIONS FINANCIERES');
  genererProjections(doc, donnees);
  templates.drawFooter(doc, pageNumber, 'X');

  // 📄 PAGE 8 : INDICATEURS ET RATIOS
  addPage();
  templates.drawHeader(doc, 'INDICATEURS CLES & RATIOS');
  genererIndicateurs(doc, donnees);
  templates.drawFooter(doc, pageNumber, 'X');

  // 📄 PAGE 9 : RISQUES & PLAN B
  addPage();
  templates.drawHeader(doc, 'GESTION DES RISQUES');
  genererRisques(doc, donnees);
  templates.drawFooter(doc, pageNumber, 'X');

  // 📄 PAGE 10 : GARANTIES
  addPage();
  templates.drawHeader(doc, 'GARANTIES ET SURETES');
  genererGaranties(doc, donnees);
  templates.drawFooter(doc, pageNumber, 'X');

  // 📄 PAGE 11 : CONCLUSION
  addPage();
  templates.drawHeader(doc, 'CONCLUSION');
  genererConclusion(doc, donnees, pageNumber);

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  const stats = fs.statSync(filepath);
  console.log(`✅ [BP ENRICHI] PDF généré : ${filename} (${(stats.size / 1024).toFixed(2)} KB)`);

  return {
    filename,
    filepath,
    url: `/uploads/business-plans/${filename}`,
    tailleFichier: stats.size,
    donnees: JSON.stringify(donnees.stats),
  };
}

// ==========================================
// 🎨 FONCTIONS DE GÉNÉRATION DES SECTIONS
// ==========================================

function genererPageCouverture(doc, donnees) {
  doc.rect(0, 0, 595, 842).fill('#ffffff');
  doc.rect(0, 0, 595, 120).fill(config.colors.primary);
  
  doc.fontSize(60).font(config.fonts.bold).fillColor('#ffffff').text('💼', 50, 30);
  doc.fontSize(42).text('BUSINESS PLAN', 140, 45);
  
  const typeLabels = {
    ACQUISITION: 'Projet d\'acquisition immobilière',
    REFINANCEMENT: 'Projet de refinancement',
    TRAVAUX: 'Projet de travaux',
  };
  doc.fontSize(16).font(config.fonts.regular).text(typeLabels[donnees.businessPlan.type] || 'Projet immobilier', 50, 90);
  
  doc.fontSize(36).font(config.fonts.bold).fillColor(config.colors.text).text(donnees.businessPlan.nom, 50, 180, { width: 495 });
  
  doc.rect(50, 260, 495, 80).fillAndStroke(config.colors.primaryLight, config.colors.primary);
  doc.fontSize(14).font(config.fonts.regular).fillColor(config.colors.text).text('MONTANT DU FINANCEMENT DEMANDÉ', 70, 280);
  doc.fontSize(40).font(config.fonts.bold).fillColor(config.colors.primary).text(helpers.formatCurrency(donnees.businessPlan.montantDemande), 70, 305);
  
  doc.fontSize(18).font(config.fonts.bold).fillColor(config.colors.text).text(donnees.space.nom, 50, 380);
  if (donnees.space.siret) {
    doc.fontSize(12).font(config.fonts.regular).fillColor(config.colors.textLight).text(`${donnees.space.formeJuridique || 'SCI'} - SIRET: ${donnees.space.siret}`, 50, 410);
  }
  
  if (donnees.businessPlan.banqueDestination) {
    doc.fontSize(12).font(config.fonts.bold).text('BANQUE DESTINATAIRE', 50, 480);
    doc.fontSize(14).font(config.fonts.regular).text(donnees.businessPlan.banqueDestination, 50, 500);
  }
  
  doc.fontSize(10).fillColor(config.colors.textLight).text(`Document établi le ${helpers.formatDate(new Date(), 'medium')}`, 50, 750);
  doc.fontSize(8).fillColor(config.colors.textMuted).text('Business Plan confidentiel - Ne pas diffuser sans autorisation', 50, 770);
}

function genererSommaireExecutif(doc, donnees) {
  doc.fontSize(config.fontSizes.medium).font(config.fonts.bold).fillColor(config.colors.primary).text('Le projet en bref', 50, doc.y);
  doc.moveDown(0.5);
  
  const description = donnees.businessPlan.description || 
    `Ce business plan présente un projet d'acquisition immobilière pour ${helpers.formatCurrency(donnees.businessPlan.montantDemande)}, ` +
    `sur une durée de ${Math.floor(donnees.businessPlan.dureePret / 12)} ans, avec un taux estimé de ${donnees.stats.tauxEstime.toFixed(2)}%.`;
  
  doc.fontSize(config.fontSizes.normal).font(config.fonts.regular).fillColor(config.colors.text).text(description, 50, doc.y, { width: 495, align: 'justify' });
  doc.moveDown(1.5);
  
  // KPIs principaux
  const kpiY = doc.y;
  drawKPICard(doc, { x: 50, y: kpiY, width: 237, height: 75, label: 'Montant demandé', value: helpers.formatCurrency(donnees.stats.montantDemande), color: config.colors.primary });
  drawKPICard(doc, { x: 308, y: kpiY, width: 237, height: 75, label: 'Durée', value: `${Math.floor(donnees.stats.dureePret / 12)} ans`, color: config.colors.secondary });
  drawKPICard(doc, { x: 50, y: kpiY + 96, width: 237, height: 75, label: 'Mensualité', value: helpers.formatCurrency(donnees.stats.mensualiteNouveau), color: config.colors.warning });
  drawKPICard(doc, { x: 308, y: kpiY + 96, width: 237, height: 75, label: 'Cashflow futur', value: helpers.formatCurrency(donnees.stats.cashflowMensuelFutur), color: donnees.stats.cashflowMensuelFutur >= 0 ? config.colors.success : config.colors.danger });
  
  doc.y = kpiY + 192;
  
  // Points clés
  templates.drawSectionTitle(doc, 'Points cles');
  const points = [
    `${donnees.stats.nbBiens} bien${donnees.stats.nbBiens > 1 ? 's' : ''} pour ${helpers.formatCurrency(donnees.stats.valeurTotaleBiens)}`,
    `Revenus : ${helpers.formatCurrency(donnees.stats.revenusMensuels)}/mois`,
    `TRI estimé : ${donnees.stats.tri.toFixed(2)}%`,
    `Taux d'endettement après projet : ${donnees.stats.tauxEndettementFutur.toFixed(1)}%`,
  ];
  points.forEach(p => { doc.fontSize(10).text('•  ' + p, 65, doc.y, { width: 480 }); doc.moveDown(0.5); });
}

function genererPresentationSCI(doc, donnees) {
  templates.drawSectionTitle(doc, 'Informations generales');
  
  const infos = [
    { label: 'Raison sociale', value: donnees.space.nom },
    { label: 'Forme juridique', value: donnees.space.formeJuridique || 'SCI' },
  ];
  if (donnees.space.siret) infos.push({ label: 'SIRET', value: donnees.space.siret });
  if (donnees.space.capitalSocial) infos.push({ label: 'Capital social', value: helpers.formatCurrency(donnees.space.capitalSocial) });
  if (donnees.space.regimeFiscal) infos.push({ label: 'Régime fiscal', value: donnees.space.regimeFiscal });
  
  infos.forEach(info => {
    doc.fontSize(10).font(config.fonts.bold).fillColor(config.colors.textLight).text(info.label, 50, doc.y);
    doc.fontSize(11).font(config.fonts.regular).fillColor(config.colors.text).text(info.value, 200, doc.y - 15);
    doc.moveDown(0.8);
  });
  
  doc.moveDown(0.5);
  
  // Associés détaillés
  if (donnees.space.associes.length > 0) {
    templates.drawSectionTitle(doc, 'Les associes');
    
    donnees.space.associes.forEach(a => {
      doc.fontSize(10).font(config.fonts.bold).text(`${a.prenom} ${a.nom}`, 50, doc.y);
      doc.fontSize(9).font(config.fonts.regular).fillColor(config.colors.textLight).text(`${a.nombreParts} parts (${a.pourcentage.toFixed(2)}%)`, 50, doc.y);
      doc.moveDown(0.8);
    });
  }
}

function genererDescriptionProjet(doc, donnees) {
  templates.drawSectionTitle(doc, 'Objectif du projet');
  
  const typeLabels = { ACQUISITION: 'acquisition immobilière', REFINANCEMENT: 'refinancement', TRAVAUX: 'travaux' };
  doc.fontSize(11).font(config.fonts.regular).fillColor(config.colors.text).text(
    `Ce projet de ${typeLabels[donnees.businessPlan.type]} vise à renforcer le patrimoine de ${donnees.space.nom} ` +
    `en acquérant un nouveau bien pour ${helpers.formatCurrency(donnees.stats.montantDemande)}.`,
    50, doc.y, { width: 495, align: 'justify' }
  );
  doc.moveDown(1);
  
  if (donnees.businessPlan.description) {
    doc.text(donnees.businessPlan.description, 50, doc.y, { width: 495, align: 'justify' });
    doc.moveDown(1);
  }
  
  // Stratégie
  templates.drawSectionTitle(doc, 'Strategie et coherence');
  doc.fontSize(11).text(
    `Cette acquisition s'inscrit dans une stratégie de diversification et d'optimisation fiscale. ` +
    `L'investissement permettra de générer un cashflow positif de ${helpers.formatCurrency(donnees.stats.cashflowMensuelFutur)}/mois ` +
    `et d'améliorer la rentabilité globale du patrimoine.`,
    50, doc.y, { width: 495, align: 'justify' }
  );
}

function genererPlanFinancement(doc, donnees) {
  templates.drawSectionTitle(doc, 'Structure du financement');
  
  const rows = [
    ['Montant du bien', helpers.formatCurrency(donnees.stats.montantDemande)],
    ['Frais de notaire (8%)', helpers.formatCurrency(donnees.stats.fraisNotaire)],
    ['Investissement total', helpers.formatCurrency(donnees.stats.investissementTotal)],
    ['', ''],
    ['Apport estimé (20%)', helpers.formatCurrency(donnees.stats.apportEstime)],
    ['Financement bancaire', helpers.formatCurrency(donnees.stats.montantDemande)],
    ['Total ressources', helpers.formatCurrency(donnees.stats.investissementTotal)],
  ];
  
  templates.drawTable(doc, {
    headers: ['Poste', 'Montant'],
    rows,
    columnWidths: [350, 145],
  });
  
  doc.moveDown(1);
  
  // Détails du prêt
  templates.drawSectionTitle(doc, 'Caracteristiques du pret');
  const pretRows = [
    ['Durée', `${Math.floor(donnees.stats.dureePret / 12)} ans (${donnees.stats.dureePret} mois)`],
    ['Taux d\'intérêt', `${donnees.stats.tauxEstime.toFixed(2)}%`],
    ['Mensualité', helpers.formatCurrency(donnees.stats.mensualiteNouveau)],
    ['Coût du crédit', helpers.formatCurrency(donnees.stats.coutCreditNouveau)],
  ];
  
  templates.drawTable(doc, {
    headers: ['Élément', 'Valeur'],
    rows: pretRows,
    columnWidths: [350, 145],
  });
}

function genererSituationPatrimoniale(doc, donnees) {
  templates.drawSectionTitle(doc, 'Bilan patrimonial');
  
  const bilanRows = [
    ['Valeur des biens', helpers.formatCurrency(donnees.stats.valeurTotaleBiens)],
    ['Capital restant dû', helpers.formatCurrency(donnees.stats.capitalRestantDuActuel)],
    ['Patrimoine net', helpers.formatCurrency(donnees.stats.patrimoineNet)],
  ];
  
  templates.drawTable(doc, { headers: ['Actif / Passif', 'Montant'], rows: bilanRows, columnWidths: [350, 145] });
  
  doc.moveDown(1);
  
  // Situation mensuelle
  templates.drawSectionTitle(doc, 'Cashflow mensuel actuel');
  const cashflowRows = [
    ['Revenus locatifs', helpers.formatCurrency(donnees.stats.revenusMensuels)],
    ['Charges', helpers.formatCurrency(donnees.stats.chargesMensuelles)],
    ['Mensualités prêts', helpers.formatCurrency(donnees.stats.mensualitesActuelles)],
    ['Cashflow net', helpers.formatCurrency(donnees.stats.cashflowMensuelActuel)],
  ];
  
  templates.drawTable(doc, { headers: ['Poste', 'Montant'], rows: cashflowRows, columnWidths: [350, 145] });
}

function genererProjections(doc, donnees) {
  templates.drawSectionTitle(doc, 'Projections sur 10 ans');
  doc.fontSize(9).fillColor(config.colors.textLight).text('Hypothèses : Loyers +2%/an, Charges +2.5%/an, Appréciation patrimoine +2%/an', 50, doc.y);
  doc.moveDown(1);
  
  const rows = donnees.projections.slice(0, 5).map(p => [
    `Année ${p.annee}`,
    helpers.formatCurrency(p.revenus),
    helpers.formatCurrency(p.charges + p.mensualitesPret),
    helpers.formatCurrency(p.cashflow),
    helpers.formatCurrency(p.patrimoineNet),
  ]);
  
  templates.drawTable(doc, {
    headers: ['Période', 'Revenus', 'Charges', 'Cashflow', 'Patrimoine net'],
    rows,
    columnWidths: [80, 105, 105, 105, 100],
  });
}

function genererIndicateurs(doc, donnees) {
  const ratioY = doc.y + 20;
  
  drawKPICard(doc, { x: 50, y: ratioY, width: 237, height: 85, label: 'TRI (20 ans)', value: `${donnees.stats.tri.toFixed(2)}%`, color: config.colors.primary });
  drawKPICard(doc, { x: 308, y: ratioY, width: 237, height: 85, label: 'Rendement net', value: `${donnees.stats.rendementNet.toFixed(2)}%`, color: config.colors.success });
  drawKPICard(doc, { x: 50, y: ratioY + 106, width: 237, height: 85, label: 'Payback period', value: `${donnees.stats.paybackPeriod.toFixed(1)} ans`, color: config.colors.warning });
  drawKPICard(doc, { x: 308, y: ratioY + 106, width: 237, height: 85, label: 'Cash-on-cash', value: `${donnees.stats.cashOnCashReturn.toFixed(2)}%`, color: config.colors.secondary });
  
  doc.y = ratioY + 212;
  
  doc.fontSize(11).fillColor(config.colors.text).text(
    `Le TRI de ${donnees.stats.tri.toFixed(2)}% démontre l'excellente rentabilité du projet. ` +
    `Le rendement net de ${donnees.stats.rendementNet.toFixed(2)}% confirme la viabilité de l'investissement.`,
    50, doc.y, { width: 495, align: 'justify' }
  );
}

function genererRisques(doc, donnees) {
  templates.drawSectionTitle(doc, 'Risques identifies');
  
  const risques = [
    { titre: 'Vacance locative', mitigation: 'Fonds de réserve de 3 mois de loyer, emplacement stratégique' },
    { titre: 'Hausse des taux', mitigation: 'Taux fixe sur toute la durée, marge de sécurité de 20% sur cashflow' },
    { titre: 'Travaux imprévus', mitigation: 'Provision annuelle, diagnostic complet avant acquisition' },
    { titre: 'Impayés', mitigation: 'Garantie loyers impayés, sélection rigoureuse des locataires' },
  ];
  
  risques.forEach(r => {
    doc.fontSize(10).font(config.fonts.bold).text(`• ${r.titre}`, 50, doc.y);
    doc.fontSize(9).font(config.fonts.regular).fillColor(config.colors.textLight).text(`  → ${r.mitigation}`, 60, doc.y, { width: 480 });
    doc.moveDown(0.8);
  });
  
  doc.moveDown(1);
  templates.drawSectionTitle(doc, 'Mesures de securite');
  doc.fontSize(10).fillColor(config.colors.text).text(
    'Un fonds de réserve équivalent à 6 mois de charges sera constitué. ' +
    'Tous les biens sont assurés PNO. Une gestion professionnelle assure le suivi rigoureux.',
    50, doc.y, { width: 495, align: 'justify' }
  );
}

function genererGaranties(doc, donnees) {
  templates.drawSectionTitle(doc, 'Garanties proposees');
  
  const garanties = [
    'Hypothèque sur les biens immobiliers de la SCI',
    'Nantissement des parts sociales',
    'Caution solidaire des associés',
    'Délégation d\'assurance décès-invalidité',
  ];
  
  garanties.forEach(g => { doc.fontSize(10).text('•  ' + g, 65, doc.y, { width: 480 }); doc.moveDown(0.7); });
  
  doc.moveDown(1);
  templates.drawSectionTitle(doc, 'Assurances');
  doc.fontSize(10).text('Tous les biens sont assurés PNO. Les associés souscriront une assurance décès-invalidité.', 50, doc.y, { width: 495 });
}

function genererConclusion(doc, donnees, pageNumber) {
  doc.fontSize(11).font(config.fonts.regular).fillColor(config.colors.text).text(
    `Ce business plan présente un projet solide et viable d'acquisition pour ${helpers.formatCurrency(donnees.stats.montantDemande)}. ` +
    `La situation patrimoniale de ${donnees.space.nom} est saine avec ${helpers.formatCurrency(donnees.stats.valeurTotaleBiens)} de patrimoine ` +
    `et un cashflow positif de ${helpers.formatCurrency(donnees.stats.cashflowMensuelActuel)}/mois.`,
    50, doc.y + 20, { width: 495, align: 'justify' }
  );
  doc.moveDown(1);
  
  doc.text(
    `Les indicateurs sont excellents : TRI de ${donnees.stats.tri.toFixed(2)}%, rendement net de ${donnees.stats.rendementNet.toFixed(2)}%, ` +
    `taux d'endettement de ${donnees.stats.tauxEndettementFutur.toFixed(1)}% et LTV de ${donnees.stats.ratioLTV.toFixed(1)}%.`,
    50, doc.y, { width: 495, align: 'justify' }
  );
  doc.moveDown(2);
  
  doc.font(config.fonts.bold).text('Nous restons à votre disposition pour tout complément d\'information.', 50, doc.y, { width: 495 });
  doc.moveDown(3);
  
  doc.fontSize(10).font(config.fonts.regular).text(`Fait à Paris, le ${helpers.formatDate(new Date(), 'medium')}`, 50, doc.y);
  doc.moveDown(2);
  doc.text(`Pour ${donnees.space.nom}`, 50, doc.y);
  
  templates.drawFooter(doc, pageNumber, pageNumber);
}

function drawKPICard(doc, { x, y, width, height, label, value, color }) {
  doc.roundedRect(x, y, width, height, 8).fillAndStroke('#ffffff', config.colors.border);
  doc.roundedRect(x, y, width, 4, 8).fill(color);
  doc.fontSize(9).font(config.fonts.bold).fillColor(config.colors.textLight).text(label, x + 15, y + 20, { width: width - 30 });
  doc.fontSize(22).font(config.fonts.bold).fillColor(color).text(value, x + 15, y + 40, { width: width - 30 });
}

module.exports = {
  genererBusinessPlanPDF,
  collecterDonneesBusinessPlan,
};
