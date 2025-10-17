const express = require('express');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const { requireAuth } = require('../middleware/auth');
const { requireSpaceAccess, requireSpaceRole } = require('../middleware/spaceAccess');

const router = express.Router({ mergeParams: true });
const prisma = new PrismaClient();

/**
 * Générer un token d'invitation unique
 */
function generateInvitationToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * GET /api/spaces/:spaceId/members
 * Liste tous les membres d'un espace
 */
router.get('/', requireAuth, requireSpaceAccess, async (req, res) => {
  try {
    const { spaceId } = req.params;
    
    const members = await prisma.spaceMember.findMany({
      where: { spaceId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nom: true,
            prenom: true
          }
        },
        inviter: {
          select: {
            nom: true,
            prenom: true,
            email: true
          }
        }
      },
      orderBy: [
        { role: 'desc' },
        { createdAt: 'asc' }
      ]
    });
    
    res.json(members);
    
  } catch (error) {
    console.error('Erreur GET /members:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des membres',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/spaces/:spaceId/members/invite
 * Inviter un nouveau membre (ADMIN minimum)
 */
router.post('/invite', requireAuth, requireSpaceAccess, requireSpaceRole(['OWNER', 'ADMIN']), async (req, res) => {
  try {
    const { spaceId } = req.params;
    const { email, role } = req.body;
    
    // Validation
    if (!email || !role) {
      return res.status(400).json({ 
        error: 'Email et rôle requis',
        code: 'VALIDATION_ERROR'
      });
    }
    
    // Vérifier que le rôle est valide
    const validRoles = ['ADMIN', 'MEMBER', 'VIEWER', 'COMPTABLE'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Rôle invalide. Rôles autorisés: ADMIN, MEMBER, VIEWER, COMPTABLE',
        code: 'INVALID_ROLE'
      });
    }
    
    // Seul un OWNER peut inviter des ADMIN
    if (role === 'ADMIN' && req.spaceRole !== 'OWNER') {
      return res.status(403).json({ 
        error: 'Seul un OWNER peut inviter des ADMIN',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    // Chercher l'utilisateur
    let invitedUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    // Si l'utilisateur n'existe pas
    if (!invitedUser) {
      return res.status(400).json({ 
        error: 'Cet utilisateur n\'a pas encore de compte. Invitez-le à créer un compte d\'abord.',
        code: 'USER_NOT_FOUND',
        suggestion: 'L\'utilisateur doit créer un compte avant de pouvoir être invité'
      });
    }
    
    // Vérifier qu'il n'est pas déjà membre
    const existingMember = await prisma.spaceMember.findUnique({
      where: {
        spaceId_userId: {
          spaceId,
          userId: invitedUser.id
        }
      }
    });
    
    if (existingMember) {
      if (existingMember.statut === 'ACTIVE') {
        return res.status(400).json({ 
          error: 'Cet utilisateur est déjà membre de cet espace',
          code: 'ALREADY_MEMBER'
        });
      } else if (existingMember.statut === 'PENDING') {
        return res.status(400).json({ 
          error: 'Une invitation est déjà en attente pour cet utilisateur',
          code: 'INVITATION_PENDING'
        });
      }
    }
    
    // Créer l'invitation
    const invitationToken = generateInvitationToken();
    
    const member = await prisma.spaceMember.create({
      data: {
        spaceId,
        userId: invitedUser.id,
        role,
        statut: 'PENDING',
        invitationToken,
        invitationSentAt: new Date(),
        invitedBy: req.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nom: true,
            prenom: true
          }
        }
      }
    });
    
    // TODO: Envoyer l'email d'invitation
    const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${invitationToken}`;
    
    res.status(201).json({
      message: 'Invitation créée avec succès',
      member,
      invitationToken,
      invitationLink
    });
    
  } catch (error) {
    console.error('Erreur POST /members/invite:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création de l\'invitation',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * PATCH /api/spaces/:spaceId/members/:memberId
 * Modifier le rôle d'un membre (OWNER uniquement)
 */
router.patch('/:memberId', requireAuth, requireSpaceAccess, requireSpaceRole(['OWNER']), async (req, res) => {
  try {
    const { spaceId, memberId } = req.params;
    const { role, statut } = req.body;
    
    // Vérifier que le membre existe et appartient bien au space
    const member = await prisma.spaceMember.findUnique({
      where: { id: memberId }
    });
    
    if (!member || member.spaceId !== spaceId) {
      return res.status(404).json({ 
        error: 'Membre non trouvé',
        code: 'MEMBER_NOT_FOUND'
      });
    }
    
    // Ne pas autoriser la modification de son propre rôle
    if (member.userId === req.user.id) {
      return res.status(400).json({ 
        error: 'Vous ne pouvez pas modifier votre propre rôle',
        code: 'CANNOT_MODIFY_OWN_ROLE'
      });
    }
    
    // Vérifier qu'il reste au moins un OWNER
    if (member.role === 'OWNER' && role !== 'OWNER') {
      const ownerCount = await prisma.spaceMember.count({
        where: {
          spaceId,
          role: 'OWNER',
          statut: 'ACTIVE'
        }
      });
      
      if (ownerCount <= 1) {
        return res.status(400).json({ 
          error: 'Il doit y avoir au moins un OWNER dans l\'espace',
          code: 'MUST_HAVE_OWNER'
        });
      }
    }
    
    const updatedMember = await prisma.spaceMember.update({
      where: { id: memberId },
      data: {
        ...(role !== undefined && { role }),
        ...(statut !== undefined && { statut })
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nom: true,
            prenom: true
          }
        }
      }
    });
    
    res.json({
      message: 'Membre mis à jour',
      member: updatedMember
    });
    
  } catch (error) {
    console.error('Erreur PATCH /members/:memberId:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la modification du membre',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * DELETE /api/spaces/:spaceId/members/:memberId
 * Retirer un membre d'un espace (OWNER uniquement)
 */
router.delete('/:memberId', requireAuth, requireSpaceAccess, requireSpaceRole(['OWNER']), async (req, res) => {
  try {
    const { spaceId, memberId } = req.params;
    
    const member = await prisma.spaceMember.findUnique({
      where: { id: memberId }
    });
    
    if (!member || member.spaceId !== spaceId) {
      return res.status(404).json({ 
        error: 'Membre non trouvé',
        code: 'MEMBER_NOT_FOUND'
      });
    }
    
    // Ne pas autoriser de se retirer soi-même
    if (member.userId === req.user.id) {
      return res.status(400).json({ 
        error: 'Vous ne pouvez pas vous retirer vous-même',
        code: 'CANNOT_REMOVE_SELF'
      });
    }
    
    // Vérifier qu'il reste au moins un OWNER
    if (member.role === 'OWNER') {
      const ownerCount = await prisma.spaceMember.count({
        where: {
          spaceId,
          role: 'OWNER',
          statut: 'ACTIVE'
        }
      });
      
      if (ownerCount <= 1) {
        return res.status(400).json({ 
          error: 'Il doit y avoir au moins un OWNER dans l\'espace',
          code: 'MUST_HAVE_OWNER'
        });
      }
    }
    
    // Supprimer le membre
    await prisma.spaceMember.delete({
      where: { id: memberId }
    });
    
    res.json({
      message: 'Membre retiré avec succès'
    });
    
  } catch (error) {
    console.error('Erreur DELETE /members/:memberId:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la suppression du membre',
      code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
