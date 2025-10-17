const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// NOUVELLES ROUTES SPACE (avec authentification)
// ============================================
const authRoutes = require('./src/routes/auth');
const spacesRoutes = require('./src/routes/spaces');
const membersRoutes = require('./src/routes/members');
const invitationsRoutes = require('./src/routes/invitations');

app.use('/api/auth', authRoutes);
app.use('/api/spaces', spacesRoutes);
app.use('/api/spaces', membersRoutes);
app.use('/api/invitations', invitationsRoutes);

// ============================================
// ANCIENNES ROUTES (à migrer progressivement)
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

// Utiliser les anciennes routes (compatibilité)
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

// ============================================
// MIDDLEWARE DE GESTION DES ERREURS
// ============================================
const errorHandler = require('./src/middlewares/errorHandler');
app.use(errorHandler);

// ============================================
// ROUTES DE TEST
// ============================================
app.get('/', (req, res) => {
  res.json({ 
    message: 'API SCI Claude - Backend opérationnel !',
    version: '2.0 - Space Model',
    features: {
      authentication: true,
      spaces: true,
      invitations: true,
      legacy_routes: true
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// DÉMARRER LE SERVEUR
// ============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('========================================');
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log('========================================');
  console.log('✅ Nouvelles routes disponibles:');
  console.log('   - POST   /api/auth/signup');
  console.log('   - POST   /api/auth/login');
  console.log('   - GET    /api/auth/me');
  console.log('   - GET    /api/spaces');
  console.log('   - POST   /api/spaces');
  console.log('   - GET    /api/spaces/:spaceId');
  console.log('   - PATCH  /api/spaces/:spaceId/switch');
  console.log('   - GET    /api/spaces/:spaceId/members');
  console.log('   - POST   /api/spaces/:spaceId/members/invite');
  console.log('   - GET    /api/invitations/:token');
  console.log('   - POST   /api/invitations/:token/accept');
  console.log('========================================');
  console.log('📖 Documentation: API_ROUTES_SPACE.md');
  console.log('========================================');
});

module.exports = app;
