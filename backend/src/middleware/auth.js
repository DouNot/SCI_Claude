const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-a-changer-en-production';

/**
 * Middleware d'authentification
 * Vérifie le token JWT et ajoute l'utilisateur à req.user
 */
async function requireAuth(req, res, next) {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token d\'authentification manquant',
        code: 'AUTH_TOKEN_MISSING'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Vérifier et décoder le token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token expiré',
          code: 'AUTH_TOKEN_EXPIRED'
        });
      }
      return res.status(401).json({ 
        error: 'Token invalide',
        code: 'AUTH_TOKEN_INVALID'
      });
    }
    
    // Récupérer l'utilisateur depuis la base
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        lastSpaceId: true,
        emailVerified: true
      }
    });
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Utilisateur non trouvé',
        code: 'AUTH_USER_NOT_FOUND'
      });
    }
    
    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Erreur middleware auth:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur lors de l\'authentification',
      code: 'AUTH_SERVER_ERROR'
    });
  }
}

/**
 * Middleware optionnel : ne bloque pas si pas authentifié
 * Ajoute req.user si le token est valide, sinon continue
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          nom: true,
          prenom: true,
          lastSpaceId: true
        }
      });
      
      req.user = user;
    } catch (err) {
      req.user = null;
    }
    
    next();
  } catch (error) {
    console.error('Erreur optionalAuth:', error);
    req.user = null;
    next();
  }
}

/**
 * Générer un token JWT pour un utilisateur
 */
function generateToken(userId) {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '7d' } // Token valide 7 jours
  );
}

module.exports = {
  requireAuth,
  optionalAuth,
  generateToken
};
