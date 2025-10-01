require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./src/middlewares/errorHandler');

// Initialiser Express
const app = express();

// Middlewares
app.use(cors()); // Permet au frontend de communiquer avec le backend
app.use(express.json()); // Parse les requêtes JSON
app.use(express.urlencoded({ extended: true })); // Parse les formulaires

// Routes
app.use('/api/biens', require('./src/routes/bienRoutes'));

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: '🏠 API SCI Claude - Bienvenue !',
    version: '1.0.0',
    endpoints: {
      biens: '/api/biens',
    },
  });
});

// Middleware de gestion d'erreurs (doit être en dernier)
app.use(errorHandler);

// Démarrer le serveur
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📊 Environnement: ${process.env.NODE_ENV}`);
});