const express = require('express');
const router = express.Router({ mergeParams: true });
const { requireAuth } = require('../middleware/auth');
const { requireSpaceAccess } = require('../middleware/spaceAccess');
const {
  createCompteBancaire,
  connectBridgeAccount,
  syncCompteBancaire,
  getComptesBancaires,
  getCompteBancaire,
  updateCompteBancaire,
  deleteCompteBancaire,
  getTransactions,
  reconcileTransaction,
  categorizeTransaction,
  getStatsBancaires,
} = require('../controllers/bankController');

// Toutes les routes nécessitent auth + space access
router.use(requireAuth, requireSpaceAccess);

// Routes statistiques
router.get('/stats', getStatsBancaires);

// Routes CRUD comptes
router.route('/')
  .get(getComptesBancaires)
  .post(createCompteBancaire);

router.post('/connect-bridge', connectBridgeAccount);

router.route('/:compteId')
  .get(getCompteBancaire)
  .patch(updateCompteBancaire)
  .delete(deleteCompteBancaire);

// Synchronisation
router.post('/:compteId/sync', syncCompteBancaire);

// Transactions
router.get('/:compteId/transactions', getTransactions);
router.post('/:compteId/transactions/:transactionId/reconcile', reconcileTransaction);
router.patch('/:compteId/transactions/:transactionId/categorize', categorizeTransaction);

module.exports = router;
