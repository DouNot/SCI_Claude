const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ============================================
// CONFIGURATION CORS POUR PRODUCTION
// ============================================
const corsOptions = {
  origin: function (origin, callback) {
    // En développement, accepter toutes les origines
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }

    // En production, vérifier que l'origine est autorisée
    const allowedOrigins = [
      process.env.FRONTEND_URL, // URL du frontend configurée
      'http://localhost:5173',   // Pour les tests locaux
      'http://localhost:3000',   // Pour les tests locaux
    ].filter(Boolean); // Enlever les valeurs undefined

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ Origine bloquée par CORS: ${origin}`);
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// ROUTES AUTHENTIFICATION & SPACES (NOUVEAU)
// ============================================
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/userRoutes');
const spacesRoutes = require('./src/routes/spaces');
const membersRoutes = require('./src/routes/members');
const invitationsRoutes = require('./src/routes/invitations');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/spaces', spacesRoutes);
app.use('/api/spaces/:spaceId/members', membersRoutes);
app.use('/api/invitations', invitationsRoutes);

// ============================================
// ROUTES AVEC SPACE (NOUVEAU FORMAT)
// ============================================
const bienRoutesNew = require('./src/routes/bienRoutesNew');
const projectionsRoutes = require('./src/routes/projections');
const rapportsRoutes = require('./src/routes/rapports');
const businessPlansRoutes = require('./src/routes/businessPlans');
const bankRoutes = require('./src/routes/bank');

app.use('/api/spaces/:spaceId/biens', bienRoutesNew);
app.use('/api/spaces/:spaceId/projections', projectionsRoutes);
app.use('/api/spaces/:spaceId/rapports', rapportsRoutes);
app.use('/api/spaces/:spaceId/business-plans', businessPlansRoutes);
app.use('/api/spaces/:spaceId/comptes-bancaires', bankRoutes);

// ============================================
// ANCIENNES ROUTES (À MIGRER PROGRESSIVEMENT)
// ============================================
const bienRoutes = require('./src/routes/bienRoutes');
const locataireRoutes = require('./src/routes/locataireRoutes');
const bailRoutes = require('./src/routes/bailRoutes');
const quittanceRoutes = require('./src/routes/quittanceRoutes');
const factureRoutes = require('./src/routes/factureRoutes');
const travauxRoutes = require('./src/routes/travauxRoutes');
const contactRoutes = require('./src/routes/contactRoutes');
const pretRoutes = require('./src/routes/pretRoutes');
const associeRoutes = require('./src/routes/associeRoutes');
const documentRoutes = require('./src/routes/documentRoutes');
const evenementFiscalRoutes = require('./src/routes/evenementFiscalRoutes');
const photoRoutes = require('./src/routes/photoRoutes');
const chargeRoutes = require('./src/routes/chargeRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const exportRoutes = require('./src/routes/exportRoutes');
const agRoutes = require('./src/routes/agRoutes');
const emailRoutes = require('./src/routes/emailRoutes');

// Routes anciennes (compatibilité temporaire)
app.use('/api/biens', bienRoutes);
app.use('/api/locataires', locataireRoutes);
app.use('/api/baux', bailRoutes);
app.use('/api/quittances', quittanceRoutes);
app.use('/api/factures', factureRoutes);
app.use('/api/travaux', travauxRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/prets', pretRoutes);
app.use('/api/associes', associeRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/evenements-fiscaux', evenementFiscalRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/charges', chargeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api/assemblees-generales', agRoutes);
app.use('/api/emails', emailRoutes);

// Middleware de gestion des erreurs
const errorHandler = require('./src/middlewares/errorHandler');
app.use(errorHandler);

// Route de test
app.get('/', (req, res) => {
  res.json({ 
    message: 'API SCI Cloud - Backend opérationnel !',
    version: '2.0.0 - Space Model',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: '/api/auth/*',
      spaces: '/api/spaces/*',
      nouveauFormat: '/api/spaces/:spaceId/*',
      ancienFormat: '/api/*'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`\n🚀 Serveur démarré`);
  console.log(`📍 URL: http://${HOST}:${PORT}`);
  console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✨ Système Space activé`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`🔒 CORS activé pour: ${process.env.FRONTEND_URL || 'Non configuré'}`);
  } else {
    console.log(`🔓 CORS en mode développement (toutes origines acceptées)`);
  }
  
  console.log(`\n📍 Routes principales:`);
  console.log(`  - POST /api/auth/signup`);
  console.log(`  - POST /api/auth/login`);
  console.log(`  - GET  /api/spaces`);
  console.log(`  - GET  /health`);
  console.log();
});

module.exports = app;
