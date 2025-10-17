const express = require('express');
const router = express.Router();
const {
  envoyerQuittanceEmail,
  envoyerQuittancesLotEmail,
  envoyerRelanceEmail,
  testerConfigurationEmail,
} = require('../controllers/emailController');

// Tester la configuration email
router.get('/test', testerConfigurationEmail);

// Envoyer une quittance par email
router.post('/envoyer-quittance', envoyerQuittanceEmail);

// Envoyer toutes les quittances du mois par email
router.post('/envoyer-quittances-lot', envoyerQuittancesLotEmail);

// Envoyer une relance pour impayé
router.post('/envoyer-relance', envoyerRelanceEmail);

module.exports = router;
