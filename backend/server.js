const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
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

// Utiliser les routes
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

// Middleware de gestion des erreurs
const errorHandler = require('./src/middlewares/errorHandler');
app.use(errorHandler);

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'API SCI Claude - Backend opérationnel !' });
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
});