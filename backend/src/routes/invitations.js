const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/invitations/:token
 * Détails d'une invitation (page publique, pas besoin d'être connecté)
 */
router.get('/:token', optionalAuth, async (req, res) => {
  try {
    const { token } = req.params;
    
    // Chercher l'invitation
    const invitation = await prisma.spaceMember.findUnique({
      where: { invitationToken: token },
      include: {
        space: {
          select: {
            id: true,
            nom: true,
            type: true
          }
        },
        user: {
          select: {
            id: true,
            email: true
          }
        },
        inviter: {
          select: {
            nom: true,
            prenom: true,
            email: true
          }
        }
      }
    });
    
    if (!invitation) {
      return res.status(404).json({ 
        error: 'Invitation non trouvée ou expirée',
        code: 'INVITATION_NOT_FOUND'
      });
    }
    
    // Vérifier que l'invitation est toujours en attente
    if (invitation.statut !== 'PENDING') {
      return res.status(400).json({ 
        error: 'Cette invitation a déjà été traitée',
        code: 'INVITATION_ALREADY_PROCESSED',
        statut: invitation.statut
      });
    }
    
    // Vérifier l'expiration (optionnel - 7 jours)
    const daysSinceInvitation = (Date.now() - invitation.invitationSentAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceInvitation > 7) {
      return res.status(400).json({ 
        error: 'Cette invitation a expiré',
        code: 'INVITATION_EXPIRED'
      });
    }
    
    res.json({
      id: invitation.id,
      space: invitation.space,
      role: invitation.role,
      invitedBy: invitation.inviter,
      invitedUser: {
        email: invitation.user.email
      },
      invitationSentAt: invitation.invitationSentAt
    });
    
  } catch (error) {
    console.error('Erreur GET /invitations/:token:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération de l\'invitation',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/invitations/:token/accept
 * Accepter une invitation
 */
router.post('/:token/accept', requireAuth, async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.user.id;
    
    // Chercher l'invitation
    const invitation = await prisma.spaceMember.findUnique({
      where: { invitationToken: token },
      include: {
        space: {
          select: {
            id: true,
            nom: true,
            type: true
          }
        }
      }
    });
    
    if (!invitation) {
      return res.status(404).json({ 
        error: 'Invitation non trouvée',
        code: 'INVITATION_NOT_FOUND'
      });
    }
    
    // Vérifier que l'invitation est pour l'utilisateur connecté
    if (invitation.userId !== userId) {
      return res.status(403).json({ 
        error: 'Cette invitation n\'est pas pour vous',
        code: 'INVITATION_NOT_FOR_YOU'
      });
    }
    
    // Vérifier le statut
    if (invitation.statut !== 'PENDING') {
      return res.status(400).json({ 
        error: 'Cette invitation a déjà été traitée',
        code: 'INVITATION_ALREADY_PROCESSED'
      });
    }
    
    // Vérifier l'expiration
    const daysSinceInvitation = (Date.now() - invitation.invitationSentAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceInvitation > 7) {
      return res.status(400).json({ 
        error: 'Cette invitation a expiré',
        code: 'INVITATION_EXPIRED'
      });
    }
    
    // Accepter l'invitation en transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Mettre à jour le SpaceMember
      const updatedMember = await tx.spaceMember.update({
        where: { id: invitation.id },
        data: {
          statut: 'ACTIVE',
          invitationAcceptedAt: new Date()
        }
      });
      
      // 2. Mettre à jour lastSpaceId de l'utilisateur
      await tx.user.update({
        where: { id: userId },
        data: { lastSpaceId: invitation.spaceId }
      });
      
      return updatedMember;
    });
    
    res.json({
      message: 'Invitation acceptée avec succès',
      space: invitation.space,
      redirectTo: `/spaces/${invitation.spaceId}`
    });
    
  } catch (error) {
    console.error('Erreur POST /invitations/:token/accept:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'acceptation de l\'invitation',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/invitations/:token/decline
 * Refuser une invitation
 */
router.post('/:token/decline', requireAuth, async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.user.id;
    
    // Chercher l'invitation
    const invitation = await prisma.spaceMember.findUnique({
      where: { invitationToken: token }
    });
    
    if (!invitation) {
      return res.status(404).json({ 
        error: 'Invitation non trouvée',
        code: 'INVITATION_NOT_FOUND'
      });
    }
    
    // Vérifier que l'invitation est pour l'utilisateur connecté
    if (invitation.userId !== userId) {
      return res.status(403).json({ 
        error: 'Cette invitation n\'est pas pour vous',
        code: 'INVITATION_NOT_FOR_YOU'
      });
    }
    
    // Vérifier le statut
    if (invitation.statut !== 'PENDING') {
      return res.status(400).json({ 
        error: 'Cette invitation a déjà été traitée',
        code: 'INVITATION_ALREADY_PROCESSED'
      });
    }
    
    // Supprimer l'invitation
    await prisma.spaceMember.delete({
      where: { id: invitation.id }
    });
    
    res.json({
      message: 'Invitation refusée'
    });
    
  } catch (error) {
    console.error('Erreur POST /invitations/:token/decline:', error);
    res.status(500).json({ 
      error: 'Erreur lors du refus de l\'invitation',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/invitations/:token/resend
 * Renvoyer une invitation (pour l'inviteur)
 */
router.post('/:token/resend', requireAuth, async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.user.id;
    
    // Chercher l'invitation
    const invitation = await prisma.spaceMember.findUnique({
      where: { invitationToken: token },
      include: {
        space: true
      }
    });
    
    if (!invitation) {
      return res.status(404).json({ 
        error: 'Invitation non trouvée',
        code: 'INVITATION_NOT_FOUND'
      });
    }
    
    // Vérifier que c'est bien l'inviteur ou un OWNER du Space
    const isInviter = invitation.invitedBy === userId;
    const spaceMember = await prisma.spaceMember.findUnique({
      where: {
        spaceId_userId: {
          spaceId: invitation.spaceId,
          userId: userId
        }
      }
    });
    
    const isOwnerOrManager = spaceMember && ['OWNER', 'MANAGER'].includes(spaceMember.role);
    
    if (!isInviter && !isOwnerOrManager) {
      return res.status(403).json({ 
        error: 'Vous n\'avez pas les permissions pour renvoyer cette invitation',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    // Mettre à jour la date d'envoi
    await prisma.spaceMember.update({
      where: { id: invitation.id },
      data: { invitationSentAt: new Date() }
    });
    
    // TODO: Renvoyer l'email
    
    res.json({
      message: 'Invitation renvoyée avec succès'
    });
    
  } catch (error) {
    console.error('Erreur POST /invitations/:token/resend:', error);
    res.status(500).json({ 
      error: 'Erreur lors du renvoi de l\'invitation',
      code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
