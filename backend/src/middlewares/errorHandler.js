// Middleware pour gérer les erreurs de manière centralisée
const errorHandler = (err, req, res, next) => {
  console.error('❌ Erreur:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur serveur interne';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;