const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/auth');
const { requireSpaceAccess } = require('../middleware/spaceAccess');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Générer un slug unique
 */
function generateSlug(text) {
  const baseSlug = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  return `${baseSlug}-${Date.now()}`;
}

/**
 * GET /api/spaces
 * Liste tous les espaces accessibles par l'utilisateur
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupérer tous les Spaces où l'utilisateur est membre actif
    const spaces = await prisma.space.findMany({
      where: {
        members: {
          some: {
            userId: userId,
            statut: 'ACTIVE'
          }
        }
      },
      include: {
        members: {
          where: { userId: userId },
          select: { 
            role: true,
            statut: true
          }
        },
        _count: {
          select: {
            biens: true,
            associes: {
              where: { statut: 'ACTIF' }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    // Formater la réponse
    const spacesWithRole = spaces.map(space => ({
      id: space.id,
      type: space.type,
      nom: space.nom,
      slug: space.slug,
      siret: space.siret,
      capitalSocial: space.capitalSocial,
      regimeFiscal: space.regimeFiscal,
      dateCloture: space.dateCloture,
      statut: space.statut,
      myRole: space.members[0]?.role,
      nbBiens: space._count.biens,
      nbAssocies: space._count.associes,
      createdAt: space.createdAt,
      updatedAt: space.updatedAt
    }));
    
    res.json(spacesWithRole);
    
  } catch (error) {
    console.error('Erreur GET /spaces:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des espaces',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/spaces
 * Créer une nouvelle SCI
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      nom,
      siret,
      capitalSocial,
      dateCloture,
      regimeFiscal,
      dateCreation,
      adresse,
      objetSocial,
      formeJuridique
    } = req.body;
    
    // Validation
    if (!nom) {
      return res.status(400).json({ 
        error: 'Le nom de la SCI est requis',
        code: 'VALIDATION_ERROR'
      });
    }
    
    // Vérifier l'unicité du SIRET si fourni
    if (siret) {
      const existingSiret = await prisma.space.findUnique({
        where: { siret }
      });
      
      if (existingSiret) {
        return res.status(400).json({ 
          error: 'Ce SIRET est déjà utilisé',
          code: 'SIRET_ALREADY_EXISTS'
        });
      }
    }
    
    const userId = req.user.id;
    
    // Créer le Space + SpaceMember en transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Créer le Space (SCI)
      const space = await tx.space.create({
        data: {
          type: 'SCI',
          nom,
          slug: generateSlug(nom),
          siret: siret || null,
          capitalSocial: capitalSocial ? parseFloat(capitalSocial) : null,
          dateCloture: dateCloture || null,
          regimeFiscal: regimeFiscal || null,
          dateCreation: dateCreation ? new Date(dateCreation) : null,
          adresse: adresse || null,
          objetSocial: objetSocial || null,
          formeJuridique: formeJuridique || 'SCI',
          statut: 'ACTIVE' // Active dès la création pour accès immédiat
        }
      });
      
      // 2. Ajouter l'utilisateur comme OWNER
      await tx.spaceMember.create({
        data: {
          spaceId: space.id,
          userId: userId,
          role: 'OWNER',
          statut: 'ACTIVE'
        }
      });
      
      // 3. Mettre à jour lastSpaceId
      await tx.user.update({
        where: { id: userId },
        data: { lastSpaceId: space.id }
      });
      
      return space;
    });
    
    res.status(201).json({
      message: 'SCI créée avec succès',
      space: result
    });
    
  } catch (error) {
    console.error('Erreur POST /spaces:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création de la SCI',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /api/spaces/:spaceId
 * Détails complets d'un espace
 * NOTE: On ne peut pas utiliser requireSpaceAccess ici car il cherche spaceId dans query/body
 * Pour cette route, le spaceId est dans les params et on vérifie manuellement
 */
router.get('/:spaceId', requireAuth, async (req, res) => {
  try {
    const { spaceId } = req.params;
    const userId = req.user.id;
    
    // Vérifier que l'utilisateur a accès à cet espace
    const spaceMember = await prisma.spaceMember.findFirst({
      where: {
        spaceId: spaceId,
        userId: userId,
        statut: 'ACTIVE'
      }
    });
    
    if (!spaceMember) {
      return res.status(403).json({ 
        error: 'Accès refusé à cet espace',
        code: 'SPACE_ACCESS_DENIED'
      });
    }
    
    const space = await prisma.space.findUnique({
      where: { id: spaceId },
      include: {
        members: {
          where: { statut: 'ACTIVE' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                nom: true,
                prenom: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        associes: {
          where: { statut: 'ACTIF' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                nom: true,
                prenom: true
              }
            }
          },
          orderBy: { pourcentage: 'desc' }
        },
        _count: {
          select: {
            biens: true
          }
        }
      }
    });
    
    if (!space) {
      return res.status(404).json({ 
        error: 'Space non trouvé',
        code: 'SPACE_NOT_FOUND'
      });
    }
    
    res.json({
      ...space,
      myRole: spaceMember.role
    });
    
  } catch (error) {
    console.error('Erreur GET /spaces/:spaceId:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération du Space',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * PATCH /api/spaces/:spaceId
 * Modifier un espace (OWNER uniquement)
 */
router.patch('/:spaceId', requireAuth, async (req, res) => {
  try {
    const { spaceId } = req.params;
    const userId = req.user.id;
    const {
      nom,
      siret,
      capitalSocial,
      dateCloture,
      regimeFiscal,
      dateCreation,
      adresse,
      objetSocial,
      formeJuridique,
      statut
    } = req.body;
    
    // Vérifier que l'utilisateur est OWNER
    const spaceMember = await prisma.spaceMember.findFirst({
      where: {
        spaceId: spaceId,
        userId: userId,
        statut: 'ACTIVE',
        role: 'OWNER'
      }
    });
    
    if (!spaceMember) {
      return res.status(403).json({ 
        error: 'Seul le propriétaire peut modifier cet espace',
        code: 'OWNER_ONLY'
      });
    }
    
    // Vérifier l'unicité du SIRET si modifié
    if (siret) {
      const existingSiret = await prisma.space.findFirst({
        where: {
          siret,
          id: { not: spaceId }
        }
      });
      
      if (existingSiret) {
        return res.status(400).json({ 
          error: 'Ce SIRET est déjà utilisé',
          code: 'SIRET_ALREADY_EXISTS'
        });
      }
    }
    
    const updatedSpace = await prisma.space.update({
      where: { id: spaceId },
      data: {
        ...(nom !== undefined && { nom }),
        ...(siret !== undefined && { siret }),
        ...(capitalSocial !== undefined && { capitalSocial: parseFloat(capitalSocial) }),
        ...(dateCloture !== undefined && { dateCloture }),
        ...(regimeFiscal !== undefined && { regimeFiscal }),
        ...(dateCreation !== undefined && { dateCreation: new Date(dateCreation) }),
        ...(adresse !== undefined && { adresse }),
        ...(objetSocial !== undefined && { objetSocial }),
        ...(formeJuridique !== undefined && { formeJuridique }),
        ...(statut !== undefined && { statut })
      }
    });
    
    res.json({
      message: 'Space mis à jour',
      space: updatedSpace
    });
    
  } catch (error) {
    console.error('Erreur PATCH /spaces/:spaceId:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la modification du Space',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * DELETE /api/spaces/:spaceId
 * Archiver un espace (OWNER uniquement)
 */
router.delete('/:spaceId', requireAuth, async (req, res) => {
  try {
    const { spaceId } = req.params;
    const userId = req.user.id;
    
    // Vérifier que l'utilisateur est OWNER
    const spaceMember = await prisma.spaceMember.findFirst({
      where: {
        spaceId: spaceId,
        userId: userId,
        statut: 'ACTIVE',
        role: 'OWNER'
      }
    });
    
    if (!spaceMember) {
      return res.status(403).json({ 
        error: 'Seul le propriétaire peut supprimer cet espace',
        code: 'OWNER_ONLY'
      });
    }
    
    // Ne pas autoriser la suppression de l'espace PERSONAL
    const space = await prisma.space.findUnique({
      where: { id: spaceId },
      select: { type: true }
    });
    
    if (space.type === 'PERSONAL') {
      return res.status(400).json({ 
        error: 'L\'espace personnel ne peut pas être supprimé',
        code: 'CANNOT_DELETE_PERSONAL_SPACE'
      });
    }
    
    // Archiver plutôt que supprimer
    await prisma.space.update({
      where: { id: spaceId },
      data: { statut: 'ARCHIVED' }
    });
    
    res.json({
      message: 'Space archivé avec succès'
    });
    
  } catch (error) {
    console.error('Erreur DELETE /spaces/:spaceId:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'archivage du Space',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * PATCH /api/spaces/:spaceId/switch
 * Changer l'espace actif (met à jour lastSpaceId)
 */
router.patch('/:spaceId/switch', requireAuth, async (req, res) => {
  try {
    const { spaceId } = req.params;
    const userId = req.user.id;
    
    // Vérifier que l'utilisateur a accès à cet espace
    const spaceMember = await prisma.spaceMember.findFirst({
      where: {
        spaceId: spaceId,
        userId: userId,
        statut: 'ACTIVE'
      }
    });
    
    if (!spaceMember) {
      return res.status(403).json({ 
        error: 'Accès refusé à cet espace',
        code: 'SPACE_ACCESS_DENIED'
      });
    }
    
    await prisma.user.update({
      where: { id: userId },
      data: { lastSpaceId: spaceId }
    });
    
    res.json({
      message: 'Espace actif mis à jour',
      spaceId
    });
    
  } catch (error) {
    console.error('Erreur PATCH /spaces/:spaceId/switch:', error);
    res.status(500).json({ 
      error: 'Erreur lors du changement d\'espace',
      code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
