const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const bankService = require('../services/bankService');

// @desc    Créer un compte bancaire manuel
// @route   POST /api/spaces/:spaceId/comptes-bancaires
// @access  Private
exports.createCompteBancaire = asyncHandler(async (req, res) => {
  const { spaceId } = req.params;
  const { nom, banque, iban, typeCompte, soldeActuel } = req.body;

  // Validation
  if (!nom || !banque) {
    return res.status(400).json({
      success: false,
      error: 'Nom et banque requis',
    });
  }

  const compte = await prisma.compteBancaire.create({
    data: {
      spaceId,
      nom,
      banque,
      iban,
      typeCompte: typeCompte || 'COURANT',
      soldeActuel: soldeActuel || 0,
      provider: 'MANUAL',
      statut: 'ACTIF',
    },
  });

  res.status(201).json({
    success: true,
    data: compte,
  });
});

// @desc    Connecter un compte via Bridge
// @route   POST /api/spaces/:spaceId/comptes-bancaires/connect-bridge
// @access  Private
exports.connectBridgeAccount = asyncHandler(async (req, res) => {
  const { spaceId } = req.params;
  const { accessToken, accountId } = req.body;

  if (!accessToken || !accountId) {
    return res.status(400).json({
      success: false,
      error: 'Token et ID de compte requis',
    });
  }

  try {
    // Récupérer les infos du compte depuis Bridge
    const accountData = await bankService.connectBridgeAccount(accessToken, accountId);

    // Créer le compte en base
    const compte = await prisma.compteBancaire.create({
      data: {
        spaceId,
        ...accountData,
        provider: 'BRIDGE',
        statut: 'ACTIF',
        derniereSynchro: new Date(),
      },
    });

    // Synchroniser les transactions initiales
    await bankService.syncTransactions(compte, prisma);

    res.status(201).json({
      success: true,
      message: 'Compte connecté et synchronisé',
      data: compte,
    });
  } catch (error) {
    console.error('Erreur connexion Bridge:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la connexion',
    });
  }
});

// @desc    Synchroniser un compte bancaire
// @route   POST /api/spaces/:spaceId/comptes-bancaires/:compteId/sync
// @access  Private
exports.syncCompteBancaire = asyncHandler(async (req, res) => {
  const { compteId } = req.params;

  const compte = await prisma.compteBancaire.findUnique({
    where: { id: compteId },
  });

  if (!compte) {
    return res.status(404).json({
      success: false,
      error: 'Compte introuvable',
    });
  }

  if (compte.provider === 'MANUAL') {
    return res.status(400).json({
      success: false,
      error: 'Les comptes manuels ne peuvent pas être synchronisés',
    });
  }

  try {
    const result = await bankService.syncTransactions(compte, prisma);

    res.status(200).json({
      success: true,
      message: `${result.nbCreated} nouvelles transactions importées`,
      data: result,
    });
  } catch (error) {
    console.error('Erreur synchronisation:', error);
    
    // Marquer le compte en erreur
    await prisma.compteBancaire.update({
      where: { id: compteId },
      data: { statut: 'ERREUR' },
    });

    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la synchronisation',
    });
  }
});

// @desc    Récupérer tous les comptes bancaires
// @route   GET /api/spaces/:spaceId/comptes-bancaires
// @access  Private
exports.getComptesBancaires = asyncHandler(async (req, res) => {
  const { spaceId } = req.params;

  const comptes = await prisma.compteBancaire.findMany({
    where: { spaceId },
    include: {
      _count: {
        select: { transactions: true },
      },
    },
    orderBy: [
      { estPrincipal: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  // Masquer les tokens dans la réponse
  const comptesSecure = comptes.map(c => ({
    ...c,
    accessToken: c.accessToken ? '***' : null,
    refreshToken: c.refreshToken ? '***' : null,
  }));

  res.status(200).json({
    success: true,
    count: comptes.length,
    data: comptesSecure,
  });
});

// @desc    Récupérer un compte bancaire
// @route   GET /api/spaces/:spaceId/comptes-bancaires/:compteId
// @access  Private
exports.getCompteBancaire = asyncHandler(async (req, res) => {
  const { compteId } = req.params;

  const compte = await prisma.compteBancaire.findUnique({
    where: { id: compteId },
    include: {
      transactions: {
        orderBy: { date: 'desc' },
        take: 100, // Limiter à 100 dernières transactions
      },
      _count: {
        select: { transactions: true },
      },
    },
  });

  if (!compte) {
    return res.status(404).json({
      success: false,
      error: 'Compte introuvable',
    });
  }

  // Masquer les tokens
  compte.accessToken = compte.accessToken ? '***' : null;
  compte.refreshToken = compte.refreshToken ? '***' : null;

  res.status(200).json({
    success: true,
    data: compte,
  });
});

// @desc    Mettre à jour un compte bancaire
// @route   PATCH /api/spaces/:spaceId/comptes-bancaires/:compteId
// @access  Private
exports.updateCompteBancaire = asyncHandler(async (req, res) => {
  const { compteId } = req.params;
  const updates = req.body;

  // Ne pas permettre la modification de certains champs
  delete updates.accessToken;
  delete updates.refreshToken;
  delete updates.accountId;
  delete updates.provider;

  const compte = await prisma.compteBancaire.update({
    where: { id: compteId },
    data: updates,
  });

  // Masquer les tokens
  compte.accessToken = compte.accessToken ? '***' : null;
  compte.refreshToken = compte.refreshToken ? '***' : null;

  res.status(200).json({
    success: true,
    data: compte,
  });
});

// @desc    Supprimer un compte bancaire
// @route   DELETE /api/spaces/:spaceId/comptes-bancaires/:compteId
// @access  Private
exports.deleteCompteBancaire = asyncHandler(async (req, res) => {
  const { compteId } = req.params;

  // Supprimer le compte (cascade sur transactions)
  await prisma.compteBancaire.delete({
    where: { id: compteId },
  });

  res.status(200).json({
    success: true,
    message: 'Compte supprimé',
  });
});

// @desc    Récupérer les transactions d'un compte
// @route   GET /api/spaces/:spaceId/comptes-bancaires/:compteId/transactions
// @access  Private
exports.getTransactions = asyncHandler(async (req, res) => {
  const { compteId } = req.params;
  const { page = 1, limit = 50, categorie, estReconcilie } = req.query;

  const where = { compteBancaireId: compteId };
  
  if (categorie) {
    where.categorie = categorie;
  }
  
  if (estReconcilie !== undefined) {
    where.estReconcilie = estReconcilie === 'true';
  }

  const [transactions, total] = await Promise.all([
    prisma.transactionBancaire.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit),
    }),
    prisma.transactionBancaire.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    count: transactions.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: transactions,
  });
});

// @desc    Réconcilier manuellement une transaction
// @route   POST /api/spaces/:spaceId/comptes-bancaires/:compteId/transactions/:transactionId/reconcile
// @access  Private
exports.reconcileTransaction = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  const { type, linkedId } = req.body; // type: 'facture', 'quittance', 'charge'

  if (!type || !linkedId) {
    return res.status(400).json({
      success: false,
      error: 'Type et ID requis',
    });
  }

  const data = { estReconcilie: true };
  
  if (type === 'facture') data.factureId = linkedId;
  else if (type === 'quittance') data.quittanceId = linkedId;
  else if (type === 'charge') data.chargeId = linkedId;

  const transaction = await prisma.transactionBancaire.update({
    where: { id: transactionId },
    data,
  });

  res.status(200).json({
    success: true,
    message: 'Transaction réconciliée',
    data: transaction,
  });
});

// @desc    Catégoriser une transaction
// @route   PATCH /api/spaces/:spaceId/comptes-bancaires/:compteId/transactions/:transactionId/categorize
// @access  Private
exports.categorizeTransaction = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  const { categorie, sousCategorie } = req.body;

  const transaction = await prisma.transactionBancaire.update({
    where: { id: transactionId },
    data: { categorie, sousCategorie },
  });

  res.status(200).json({
    success: true,
    data: transaction,
  });
});

// @desc    Statistiques bancaires
// @route   GET /api/spaces/:spaceId/comptes-bancaires/stats
// @access  Private
exports.getStatsBancaires = asyncHandler(async (req, res) => {
  const { spaceId } = req.params;

  const comptes = await prisma.compteBancaire.findMany({
    where: { spaceId },
    include: {
      transactions: {
        where: {
          date: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 derniers jours
          },
        },
      },
    },
  });

  const stats = {
    nbComptes: comptes.length,
    soldeTotal: comptes.reduce((sum, c) => sum + c.soldeActuel, 0),
    nbTransactions30j: comptes.reduce((sum, c) => sum + c.transactions.length, 0),
    credits30j: 0,
    debits30j: 0,
  };

  comptes.forEach(compte => {
    compte.transactions.forEach(t => {
      if (t.montant > 0) {
        stats.credits30j += t.montant;
      } else {
        stats.debits30j += Math.abs(t.montant);
      }
    });
  });

  res.status(200).json({
    success: true,
    data: stats,
  });
});
