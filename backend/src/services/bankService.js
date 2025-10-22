/**
 * Service de connexion bancaire
 * Support : Bridge API, Tink, ou saisie manuelle
 */

const axios = require('axios');
const crypto = require('crypto');

// Configuration des providers
const PROVIDERS = {
  BRIDGE: {
    name: 'Bridge',
    baseUrl: process.env.BRIDGE_API_URL || 'https://api.bridgeapi.io/v2',
    clientId: process.env.BRIDGE_CLIENT_ID,
    clientSecret: process.env.BRIDGE_CLIENT_SECRET,
  },
  TINK: {
    name: 'Tink',
    baseUrl: process.env.TINK_API_URL || 'https://api.tink.com',
    clientId: process.env.TINK_CLIENT_ID,
    clientSecret: process.env.TINK_CLIENT_SECRET,
  },
  MANUAL: {
    name: 'Manuel',
    // Pas d'API, saisie manuelle
  },
};

/**
 * Chiffrer un token (simple pour l'exemple, utiliser un vrai chiffrement en prod)
 */
function encryptToken(token) {
  const key = process.env.ENCRYPTION_KEY || 'default-key-change-in-prod';
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

/**
 * Déchiffrer un token
 */
function decryptToken(encryptedToken) {
  const key = process.env.ENCRYPTION_KEY || 'default-key-change-in-prod';
  const decipher = crypto.createDecipher('aes-256-cbc', key);
  let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * BRIDGE API - Récupérer les comptes
 */
async function getBridgeAccounts(accessToken) {
  const config = PROVIDERS.BRIDGE;
  
  try {
    const response = await axios.get(`${config.baseUrl}/accounts`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Bridge-Version': '2021-06-01',
      },
    });
    
    return response.data.resources || [];
  } catch (error) {
    console.error('Erreur Bridge API - Comptes:', error.response?.data || error.message);
    throw new Error('Impossible de récupérer les comptes bancaires');
  }
}

/**
 * BRIDGE API - Récupérer les transactions
 */
async function getBridgeTransactions(accessToken, accountId, since = null) {
  const config = PROVIDERS.BRIDGE;
  
  try {
    const params = {
      account_id: accountId,
      limit: 500,
    };
    
    if (since) {
      params.since = since.toISOString().split('T')[0]; // Format YYYY-MM-DD
    }
    
    const response = await axios.get(`${config.baseUrl}/transactions`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Bridge-Version': '2021-06-01',
      },
      params,
    });
    
    return response.data.resources || [];
  } catch (error) {
    console.error('Erreur Bridge API - Transactions:', error.response?.data || error.message);
    throw new Error('Impossible de récupérer les transactions');
  }
}

/**
 * Catégoriser automatiquement une transaction
 */
function categorizeTransaction(libelle, montant) {
  const libelleLC = libelle.toLowerCase();
  
  // Revenus locatifs
  if (libelleLC.includes('loyer') || libelleLC.includes('rent')) {
    return { categorie: 'REVENU', sousCategorie: 'Loyer' };
  }
  
  // Charges
  if (libelleLC.includes('edf') || libelleLC.includes('engie') || libelleLC.includes('electricite')) {
    return { categorie: 'CHARGE', sousCategorie: 'Électricité' };
  }
  
  if (libelleLC.includes('eau') || libelleLC.includes('water')) {
    return { categorie: 'CHARGE', sousCategorie: 'Eau' };
  }
  
  if (libelleLC.includes('assurance') || libelleLC.includes('insurance')) {
    return { categorie: 'CHARGE', sousCategorie: 'Assurance' };
  }
  
  if (libelleLC.includes('taxe') || libelleLC.includes('impot') || libelleLC.includes('tax')) {
    return { categorie: 'CHARGE', sousCategorie: 'Taxes' };
  }
  
  if (libelleLC.includes('travaux') || libelleLC.includes('reparation') || libelleLC.includes('plombier') || libelleLC.includes('electricien')) {
    return { categorie: 'CHARGE', sousCategorie: 'Travaux' };
  }
  
  // Prêt
  if (libelleLC.includes('pret') || libelleLC.includes('credit') || libelleLC.includes('emprunt') || libelleLC.includes('loan')) {
    return { categorie: 'PRET', sousCategorie: 'Mensualité' };
  }
  
  // Par défaut
  if (montant > 0) {
    return { categorie: 'AUTRE', sousCategorie: 'Crédit' };
  } else {
    return { categorie: 'AUTRE', sousCategorie: 'Débit' };
  }
}

/**
 * Normaliser les transactions depuis Bridge
 */
function normalizeBridgeTransactions(transactions) {
  return transactions.map(t => ({
    transactionId: t.id.toString(),
    date: new Date(t.date),
    dateValeur: t.value_date ? new Date(t.value_date) : null,
    libelle: t.description || t.clean_description || 'Transaction',
    montant: parseFloat(t.amount),
    devise: t.currency_code || 'EUR',
    rawData: JSON.stringify(t),
  }));
}

/**
 * Service principal
 */
const bankService = {
  /**
   * Connecter un compte bancaire via Bridge
   */
  async connectBridgeAccount(accessToken, accountId) {
    const accounts = await getBridgeAccounts(accessToken);
    const account = accounts.find(a => a.id.toString() === accountId);
    
    if (!account) {
      throw new Error('Compte introuvable');
    }
    
    return {
      accountId: account.id.toString(),
      nom: account.name,
      banque: account.bank_name,
      iban: account.iban,
      typeCompte: account.type === 'checking' ? 'COURANT' : account.type === 'savings' ? 'EPARGNE' : 'PROFESSIONNEL',
      soldeActuel: parseFloat(account.balance),
      devise: account.currency_code || 'EUR',
      accessToken: encryptToken(accessToken),
    };
  },

  /**
   * Synchroniser les transactions d'un compte
   */
  async syncTransactions(compte, prisma) {
    if (compte.provider !== 'BRIDGE') {
      throw new Error('Seul Bridge est supporté pour l\'instant');
    }
    
    // Déchiffrer le token
    const accessToken = decryptToken(compte.accessToken);
    
    // Récupérer les transactions depuis la dernière synchro
    const since = compte.derniereSynchro || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 jours par défaut
    
    const transactions = await getBridgeTransactions(accessToken, compte.accountId, since);
    const normalizedTransactions = normalizeBridgeTransactions(transactions);
    
    // Sauvegarder les nouvelles transactions
    let nbCreated = 0;
    let nbUpdated = 0;
    
    for (const t of normalizedTransactions) {
      // Vérifier si la transaction existe déjà
      const existing = await prisma.transactionBancaire.findUnique({
        where: { transactionId: t.transactionId },
      });
      
      if (existing) {
        nbUpdated++;
        continue;
      }
      
      // Catégoriser automatiquement
      const { categorie, sousCategorie } = categorizeTransaction(t.libelle, t.montant);
      
      // Créer la transaction
      await prisma.transactionBancaire.create({
        data: {
          compteBancaireId: compte.id,
          ...t,
          categorie,
          sousCategorie,
        },
      });
      
      nbCreated++;
    }
    
    // Mettre à jour la date de dernière synchro
    await prisma.compteBancaire.update({
      where: { id: compte.id },
      data: { derniereSynchro: new Date() },
    });
    
    return {
      nbCreated,
      nbUpdated,
      total: normalizedTransactions.length,
    };
  },

  /**
   * Réconcilier automatiquement une transaction avec une facture/quittance
   */
  async reconcileTransaction(transactionId, prisma) {
    const transaction = await prisma.transactionBancaire.findUnique({
      where: { id: transactionId },
    });
    
    if (!transaction || transaction.estReconcilie) {
      return null;
    }
    
    // Rechercher une facture correspondante (montant et date proche)
    const factures = await prisma.facture.findMany({
      where: {
        montantTTC: {
          gte: transaction.montant * 0.95, // Tolérance 5%
          lte: transaction.montant * 1.05,
        },
        dateFacture: {
          gte: new Date(transaction.date.getTime() - 7 * 24 * 60 * 60 * 1000), // ±7 jours
          lte: new Date(transaction.date.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
        estPaye: false,
      },
    });
    
    if (factures.length === 1) {
      // Réconciliation automatique
      await prisma.transactionBancaire.update({
        where: { id: transactionId },
        data: {
          estReconcilie: true,
          factureId: factures[0].id,
        },
      });
      
      await prisma.facture.update({
        where: { id: factures[0].id },
        data: { estPaye: true, datePaiement: transaction.date },
      });
      
      return factures[0];
    }
    
    return null;
  },

  // Helpers
  encryptToken,
  decryptToken,
  categorizeTransaction,
};

module.exports = bankService;
