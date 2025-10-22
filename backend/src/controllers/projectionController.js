const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

// ==========================================
// HELPERS - HYPOTHÈSES PAR SCÉNARIO
// ==========================================

/**
 * Retourne les hypothèses par défaut selon le scénario
 */
function getDefaultHypothesesByScenario(scenario) {
  const hypotheses = {
    OPTIMISTE: {
      tauxInflation: 1.5,
      tauxVacanceLocative: 2.0,       // Moins de vacance
      tauxAugmentationLoyer: 3.0,     // Loyers augmentent plus
      tauxAugmentationCharges: 2.0,   // Charges augmentent moins
      tauxActualisation: 3.0,
      tauxImposition: 25.0,           // Imposition plus faible
      provisionTravauxAnnuelle: 500,
      inclureRevente: false,
      tauxAppreciationBien: 3.0,      // Biens prennent plus de valeur
      fraisVente: 7.0,
    },
    REALISTE: {
      tauxInflation: 2.0,
      tauxVacanceLocative: 5.0,
      tauxAugmentationLoyer: 2.0,
      tauxAugmentationCharges: 3.0,
      tauxActualisation: 4.0,
      tauxImposition: 30.0,
      provisionTravauxAnnuelle: 1000,
      inclureRevente: false,
      tauxAppreciationBien: 2.0,
      fraisVente: 8.0,
    },
    PESSIMISTE: {
      tauxInflation: 3.0,
      tauxVacanceLocative: 10.0,      // Plus de vacance
      tauxAugmentationLoyer: 1.0,     // Loyers stagnent
      tauxAugmentationCharges: 4.0,   // Charges augmentent plus
      tauxActualisation: 5.0,
      tauxImposition: 35.0,           // Imposition plus élevée
      provisionTravauxAnnuelle: 2000, // Plus de travaux
      inclureRevente: false,
      tauxAppreciationBien: 1.0,      // Biens prennent peu de valeur
      fraisVente: 10.0,
    },
    PERSONNALISE: {
      tauxInflation: 2.0,
      tauxVacanceLocative: 5.0,
      tauxAugmentationLoyer: 2.0,
      tauxAugmentationCharges: 3.0,
      tauxActualisation: 4.0,
      tauxImposition: 30.0,
      provisionTravauxAnnuelle: 1000,
      inclureRevente: false,
      tauxAppreciationBien: 2.0,
      fraisVente: 8.0,
    },
  };

  return hypotheses[scenario] || hypotheses.REALISTE;
}

// ==========================================
// HELPERS - CALCULS FINANCIERS
// ==========================================

/**
 * Calculer le capital restant dû d'un prêt
 */
function calculerCapitalRestantDu(montantInitial, tauxAnnuel, moisEcoules, dureeMois) {
  if (moisEcoules >= dureeMois) return 0;
  
  const tauxMensuel = tauxAnnuel / 100 / 12;
  const capitalRestant = montantInitial * (
    (Math.pow(1 + tauxMensuel, dureeMois) - Math.pow(1 + tauxMensuel, moisEcoules)) /
    (Math.pow(1 + tauxMensuel, dureeMois) - 1)
  );
  
  return Math.max(0, capitalRestant);
}

/**
 * Calculer la valeur future avec appréciation
 */
function calculerValeurFuture(valeurInitiale, tauxAppreciation, annees) {
  return valeurInitiale * Math.pow(1 + (tauxAppreciation / 100), annees);
}

/**
 * Appliquer l'augmentation annuelle
 */
function appliquerAugmentation(valeurInitiale, tauxAugmentation, annees) {
  return valeurInitiale * Math.pow(1 + (tauxAugmentation / 100), annees);
}

// ==========================================
// CONTROLLERS
// ==========================================

// @desc    Créer une nouvelle projection
// @route   POST /api/spaces/:spaceId/projections
// @access  Private
exports.createProjection = asyncHandler(async (req, res) => {
  const { spaceId } = req.params;
  const { nom, description, scenario, dureeAnnees, hypotheses } = req.body;

  // Validation
  if (!nom || !dureeAnnees) {
    return res.status(400).json({
      success: false,
      error: 'Nom et durée requis',
    });
  }

  // Déterminer les hypothèses selon le scénario
  const scenarioType = scenario || 'REALISTE';
  const defaultHypotheses = getDefaultHypothesesByScenario(scenarioType);

  // Créer la projection avec hypothèses par défaut ou fournies
  const projection = await prisma.projection.create({
    data: {
      spaceId,
      nom,
      description,
      scenario: scenarioType,
      dureeAnnees: parseInt(dureeAnnees),
      dateDebut: new Date(),
      statut: 'BROUILLON',
      hypotheses: {
        create: {
          tauxInflation: hypotheses?.tauxInflation || defaultHypotheses.tauxInflation,
          tauxVacanceLocative: hypotheses?.tauxVacanceLocative || defaultHypotheses.tauxVacanceLocative,
          tauxAugmentationLoyer: hypotheses?.tauxAugmentationLoyer || defaultHypotheses.tauxAugmentationLoyer,
          tauxAugmentationCharges: hypotheses?.tauxAugmentationCharges || defaultHypotheses.tauxAugmentationCharges,
          tauxActualisation: hypotheses?.tauxActualisation || defaultHypotheses.tauxActualisation,
          tauxImposition: hypotheses?.tauxImposition || defaultHypotheses.tauxImposition,
          provisionTravauxAnnuelle: hypotheses?.provisionTravauxAnnuelle || defaultHypotheses.provisionTravauxAnnuelle,
          travauxExceptionnels: hypotheses?.travauxExceptionnels ? JSON.stringify(hypotheses.travauxExceptionnels) : null,
          inclureRevente: hypotheses?.inclureRevente || defaultHypotheses.inclureRevente,
          anneeRevente: hypotheses?.anneeRevente,
          tauxAppreciationBien: hypotheses?.tauxAppreciationBien || defaultHypotheses.tauxAppreciationBien,
          fraisVente: hypotheses?.fraisVente || defaultHypotheses.fraisVente,
        },
      },
    },
    include: {
      hypotheses: true,
    },
  });

  // Calculer automatiquement les données
  await calculerDonneesProjection(projection.id, spaceId);

  res.status(201).json({
    success: true,
    data: projection,
  });
});

// @desc    Calculer les données de projection
// @route   POST /api/spaces/:spaceId/projections/:projectionId/calculer
// @access  Private
exports.calculerProjection = asyncHandler(async (req, res) => {
  const { projectionId } = req.params;

  const projection = await prisma.projection.findUnique({
    where: { id: projectionId },
    include: { hypotheses: true },
  });

  if (!projection) {
    return res.status(404).json({
      success: false,
      error: 'Projection introuvable',
    });
  }

  // Recalculer
  await calculerDonneesProjection(projection.id, projection.spaceId);

  res.status(200).json({
    success: true,
    message: 'Calcul effectué',
  });
});

// @desc    Récupérer toutes les projections d'un espace
// @route   GET /api/spaces/:spaceId/projections
// @access  Private
exports.getProjections = asyncHandler(async (req, res) => {
  const { spaceId } = req.params;

  const projections = await prisma.projection.findMany({
    where: { spaceId },
    include: {
      hypotheses: true,
      _count: {
        select: { donnees: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    success: true,
    count: projections.length,
    data: projections,
  });
});

// @desc    Récupérer une projection avec toutes ses données
// @route   GET /api/spaces/:spaceId/projections/:projectionId
// @access  Private
exports.getProjection = asyncHandler(async (req, res) => {
  const { projectionId } = req.params;

  const projection = await prisma.projection.findUnique({
    where: { id: projectionId },
    include: {
      hypotheses: true,
      donnees: {
        orderBy: [{ annee: 'asc' }, { mois: 'asc' }],
      },
    },
  });

  if (!projection) {
    return res.status(404).json({
      success: false,
      error: 'Projection introuvable',
    });
  }

  // Agréger les données par année pour les graphiques
  const donneesParAnnee = {};
  projection.donnees.forEach((d) => {
    if (!donneesParAnnee[d.annee]) {
      donneesParAnnee[d.annee] = {
        annee: d.annee,
        revenus: 0,
        charges: 0,
        cashflow: 0,
        patrimoine: 0,
      };
    }
    donneesParAnnee[d.annee].revenus += d.totalRevenus;
    donneesParAnnee[d.annee].charges += d.totalCharges;
    donneesParAnnee[d.annee].cashflow += d.cashflowNet;
    // Patrimoine: prendre la dernière valeur du mois de décembre
    if (d.mois === 12) {
      donneesParAnnee[d.annee].patrimoine = d.patrimoineNet;
    }
  });

  res.status(200).json({
    success: true,
    data: {
      ...projection,
      donneesParAnnee: Object.values(donneesParAnnee),
    },
  });
});

// @desc    Mettre à jour une projection
// @route   PATCH /api/spaces/:spaceId/projections/:projectionId
// @access  Private
exports.updateProjection = asyncHandler(async (req, res) => {
  const { projectionId } = req.params;
  const updates = req.body;

  const projection = await prisma.projection.update({
    where: { id: projectionId },
    data: updates,
    include: { hypotheses: true },
  });

  res.status(200).json({
    success: true,
    data: projection,
  });
});

// @desc    Mettre à jour les hypothèses
// @route   PATCH /api/spaces/:spaceId/projections/:projectionId/hypotheses
// @access  Private
exports.updateHypotheses = asyncHandler(async (req, res) => {
  const { projectionId } = req.params;
  const updates = req.body;

  const projection = await prisma.projection.findUnique({
    where: { id: projectionId },
    include: { hypotheses: true },
  });

  if (!projection) {
    return res.status(404).json({
      success: false,
      error: 'Projection introuvable',
    });
  }

  // Mettre à jour ou créer les hypothèses
  const hypotheses = await prisma.hypothesesProjection.upsert({
    where: { projectionId },
    update: updates,
    create: {
      projectionId,
      ...updates,
    },
  });

  // Recalculer automatiquement
  await calculerDonneesProjection(projection.id, projection.spaceId);

  res.status(200).json({
    success: true,
    data: hypotheses,
  });
});

// @desc    Supprimer une projection
// @route   DELETE /api/spaces/:spaceId/projections/:projectionId
// @access  Private
exports.deleteProjection = asyncHandler(async (req, res) => {
  const { projectionId } = req.params;

  await prisma.projection.delete({
    where: { id: projectionId },
  });

  res.status(200).json({
    success: true,
    message: 'Projection supprimée',
  });
});

// ==========================================
// LOGIQUE DE CALCUL PRINCIPALE
// ==========================================

async function calculerDonneesProjection(projectionId, spaceId) {
  // Récupérer la projection et ses hypothèses
  const projection = await prisma.projection.findUnique({
    where: { id: projectionId },
    include: { hypotheses: true },
  });

  if (!projection || !projection.hypotheses) {
    throw new Error('Projection ou hypothèses introuvables');
  }

  const hyp = projection.hypotheses;
  const anneeDebut = new Date(projection.dateDebut).getFullYear();

  // Récupérer les données existantes
  const biens = await prisma.bien.findMany({
    where: { spaceId },
    include: {
      baux: {
        where: { statut: 'ACTIF' },
      },
      prets: true,
      charges: {
        where: { estActive: true },
      },
    },
  });

  // Supprimer les anciennes données
  await prisma.donneesProjection.deleteMany({
    where: { projectionId },
  });

  // Calculer pour chaque mois de la projection
  const donnees = [];
  let cashflowCumule = 0;

  for (let annee = 0; annee < projection.dureeAnnees; annee++) {
    for (let mois = 1; mois <= 12; mois++) {
      const anneeAbsolue = anneeDebut + annee;
      
      // REVENUS
      let revenusLocatifs = 0;
      biens.forEach((bien) => {
        bien.baux.forEach((bail) => {
          // Loyer de base
          let loyer = bail.loyerHC;
          
          // Appliquer l'augmentation annuelle
          loyer = appliquerAugmentation(loyer, hyp.tauxAugmentationLoyer, annee);
          
          // Appliquer la vacance locative (en pourcentage)
          loyer *= (1 - hyp.tauxVacanceLocative / 100);
          
          revenusLocatifs += loyer;
        });
      });

      // CHARGES
      let chargesFixes = 0;
      let chargesVariables = 0;
      biens.forEach((bien) => {
        // Assurance
        if (bien.assuranceMensuelle) {
          chargesFixes += appliquerAugmentation(bien.assuranceMensuelle, hyp.tauxAugmentationCharges, annee);
        }
        
        // Taxe foncière (mensuelle)
        if (bien.taxeFonciere) {
          chargesFixes += appliquerAugmentation(bien.taxeFonciere / 12, hyp.tauxAugmentationCharges, annee);
        }
        
        // Charges récurrentes
        bien.charges.forEach((charge) => {
          let montantCharge = 0;
          if (charge.frequence === 'MENSUELLE') {
            montantCharge = charge.montant;
          } else if (charge.frequence === 'ANNUELLE' && mois === 1) {
            montantCharge = charge.montant;
          } else if (charge.frequence === 'TRIMESTRIELLE' && [1, 4, 7, 10].includes(mois)) {
            montantCharge = charge.montant;
          }
          chargesVariables += appliquerAugmentation(montantCharge, hyp.tauxAugmentationCharges, annee);
        });
      });

      // MENSUALITÉS DE PRÊT
      let mensualitesPret = 0;
      let capitalRestantDuTotal = 0;
      biens.forEach((bien) => {
        bien.prets.forEach((pret) => {
          const dateDebut = new Date(pret.dateDebut);
          const moisDepuisDebut = (anneeAbsolue - dateDebut.getFullYear()) * 12 + (mois - dateDebut.getMonth() - 1);
          
          if (moisDepuisDebut >= 0 && moisDepuisDebut < pret.duree) {
            mensualitesPret += pret.mensualite;
            capitalRestantDuTotal += calculerCapitalRestantDu(pret.montant, pret.taux, moisDepuisDebut, pret.duree);
          }
        });
      });

      // TRAVAUX
      let travaux = 0;
      if (mois === 1) {
        travaux = hyp.provisionTravauxAnnuelle;
      }
      
      // Travaux exceptionnels
      if (hyp.travauxExceptionnels) {
        try {
          const travauxExcep = JSON.parse(hyp.travauxExceptionnels);
          travauxExcep.forEach((t) => {
            if (t.annee === annee && t.mois === mois) {
              travaux += t.montant;
            }
          });
        } catch (e) {}
      }

      // IMPÔTS (simplifiés)
      const beneficeImposable = revenusLocatifs - chargesFixes - chargesVariables - travaux;
      const impots = beneficeImposable > 0 ? (beneficeImposable * hyp.tauxImposition / 100) / 12 : 0;

      // TOTAUX
      const totalRevenus = revenusLocatifs;
      const totalCharges = chargesFixes + chargesVariables + mensualitesPret + travaux + impots;
      const cashflowNet = totalRevenus - totalCharges;
      cashflowCumule += cashflowNet;

      // PATRIMOINE
      const valeurBienTotal = biens.reduce((sum, bien) => {
        const valeurInitiale = bien.valeurActuelle || bien.prixAchat;
        return sum + calculerValeurFuture(valeurInitiale, hyp.tauxAppreciationBien, annee + mois / 12);
      }, 0);
      
      const patrimoineNet = valeurBienTotal - capitalRestantDuTotal;

      // Créer l'enregistrement
      donnees.push({
        projectionId,
        annee: anneeAbsolue,
        mois,
        revenusLocatifs,
        autresRevenus: 0,
        totalRevenus,
        chargesFixes,
        chargesVariables,
        mensualitesPret,
        travaux,
        impots,
        totalCharges,
        cashflowNet,
        cashflowCumule,
        valeurBien: valeurBienTotal,
        capitalRestantDu: capitalRestantDuTotal,
        patrimoineNet,
      });
    }
  }

  // Insérer toutes les données en batch
  if (donnees.length > 0) {
    await prisma.donneesProjection.createMany({
      data: donnees,
    });
  }

  return donnees.length;
}

exports.calculerDonneesProjection = calculerDonneesProjection;
