const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware pour vérifier l'accès à un espace (Space)
 * 
 * Vérifie que :
 * 1. Un spaceId est fourni dans la requête (params, query ou body)
 * 2. L'utilisateur est membre de cet espace
 * 3. L'espace est actif
 * 
 * Ajoute req.spaceId et req.spaceMember pour utilisation dans les controllers
 */
const requireSpaceAccess = async (req, res, next) => {
  try {
    // 1. Récupérer le spaceId depuis params (prioritaire), query ou body
    let spaceId = req.params.spaceId || req.query.spaceId || (req.body && req.body.spaceId);
    
    // Pour les requêtes FormData, vérifier aussi les champs
    if (!spaceId && req.body && typeof req.body === 'object') {
      spaceId = req.body.spaceId;
    }
    
    // Si pas de spaceId, erreur
    if (!spaceId) {
      return res.status(400).json({
        success: false,
        error: 'spaceId requis',
        code: 'SPACE_ID_REQUIRED'
      });
    }
    
    // 2. Vérifier que l'utilisateur est membre de cet espace
    const spaceMember = await prisma.spaceMember.findFirst({
      where: {
        spaceId: spaceId,
        userId: req.user.id, // req.user vient du middleware requireAuth
        statut: 'ACTIVE'
      },
      include: {
        space: {
          select: {
            id: true,
            type: true,
            nom: true,
            statut: true
          }
        }
      }
    });
    
    // Si pas membre ou espace inactif, accès refusé
    if (!spaceMember) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé à cet espace',
        code: 'SPACE_ACCESS_DENIED'
      });
    }
    
    if (spaceMember.space.statut !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: 'Cet espace est inactif',
        code: 'SPACE_INACTIVE'
      });
    }
    
    // 3. Ajouter les infos dans req pour utilisation dans les controllers
    req.spaceId = spaceId;
    req.spaceMember = spaceMember;
    req.spaceRole = spaceMember.role; // OWNER, ADMIN, MEMBER, etc.
    
    // Continuer vers le controller
    next();
    
  } catch (error) {
    console.error('Erreur requireSpaceAccess:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification d\'accès',
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * Middleware pour vérifier un rôle spécifique
 * Utiliser après requireSpaceAccess
 * 
 * Exemple: requireSpaceRole(['OWNER', 'ADMIN'])
 */
const requireSpaceRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.spaceRole) {
      return res.status(500).json({
        success: false,
        error: 'requireSpaceAccess doit être appelé avant requireSpaceRole',
        code: 'MIDDLEWARE_ERROR'
      });
    }
    
    if (!allowedRoles.includes(req.spaceRole)) {
      return res.status(403).json({
        success: false,
        error: 'Permissions insuffisantes pour cette action',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: req.spaceRole
      });
    }
    
    next();
  };
};

module.exports = {
  requireSpaceAccess,
  requireSpaceRole
};
