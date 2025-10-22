const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const crypto = require('crypto');

// Générer un token sécurisé
const generateInvitationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// @desc    Inviter un utilisateur dans un Space
// @route   POST /api/spaces/:spaceId/invitations
// @access  Private (OWNER ou MANAGER)
exports.inviteUser = asyncHandler(async (req, res) => {
  const { spaceId } = req.params;
  const { email, role } = req.body;
  const inviterId = req.user.id;

  // Validation
  if (!email || !role) {
    return res.status(400).json({
      success: false,
      error: 'Email et rôle requis',
    });
  }

  // Vérifier que le rôle est valide
  const validRoles = ['OWNER', 'MANAGER', 'MEMBER', 'VIEWER', 'COMPTABLE'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      error: 'Rôle invalide',
    });
  }

  // Vérifier que l'inviteur a les droits (OWNER ou MANAGER)
  const inviterMembership = await prisma.spaceMember.findFirst({
    where: {
      spaceId,
      userId: inviterId,
      statut: 'ACTIVE',
    },
  });

  if (!inviterMembership || !['OWNER', 'MANAGER'].includes(inviterMembership.role)) {
    return res.status(403).json({
      success: false,
      error: 'Vous n\'avez pas les droits pour inviter des membres',
    });
  }

  // Vérifier que l'utilisateur existe
  let user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  // Si l'utilisateur n'existe pas, on crée un compte en attente
  if (!user) {
    // Pour l'instant, on refuse si l'utilisateur n'existe pas
    // Plus tard, on pourra créer un compte "fantôme" en attente
    return res.status(404).json({
      success: false,
      error: 'Cet utilisateur n\'existe pas. Il doit d\'abord créer un compte.',
    });
  }

  // Vérifier si l'utilisateur est déjà membre
  const existingMembership = await prisma.spaceMember.findFirst({
    where: {
      spaceId,
      userId: user.id,
    },
  });

  if (existingMembership) {
    if (existingMembership.statut === 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: 'Cet utilisateur est déjà membre de ce Space',
      });
    } else if (existingMembership.statut === 'PENDING') {
      return res.status(400).json({
        success: false,
        error: 'Une invitation est déjà en attente pour cet utilisateur',
      });
    }
  }

  // Générer le token d'invitation
  const invitationToken = generateInvitationToken();

  // Créer l'invitation
  const invitation = await prisma.spaceMember.create({
    data: {
      spaceId,
      userId: user.id,
      role,
      statut: 'PENDING',
      invitationToken,
      invitationSentAt: new Date(),
      invitedBy: inviterId,
    },
    include: {
      space: {
        select: {
          id: true,
          nom: true,
          type: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          nom: true,
          prenom: true,
        },
      },
      inviter: {
        select: {
          id: true,
          email: true,
          nom: true,
          prenom: true,
        },
      },
    },
  });

  // TODO: Envoyer un email d'invitation
  // await sendInvitationEmail(user.email, invitationToken, space.nom);

  res.status(201).json({
    success: true,
    message: 'Invitation envoyée avec succès',
    data: invitation,
  });
});

// @desc    Accepter une invitation
// @route   POST /api/invitations/:token/accept
// @access  Private
exports.acceptInvitation = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const userId = req.user.id;

  // Trouver l'invitation
  const invitation = await prisma.spaceMember.findUnique({
    where: { invitationToken: token },
    include: {
      space: true,
      inviter: {
        select: {
          nom: true,
          prenom: true,
          email: true,
        },
      },
    },
  });

  if (!invitation) {
    return res.status(404).json({
      success: false,
      error: 'Invitation introuvable ou expirée',
    });
  }

  // Vérifier que l'invitation est pour cet utilisateur
  if (invitation.userId !== userId) {
    return res.status(403).json({
      success: false,
      error: 'Cette invitation n\'est pas pour vous',
    });
  }

  // Vérifier que l'invitation est en attente
  if (invitation.statut !== 'PENDING') {
    return res.status(400).json({
      success: false,
      error: 'Cette invitation a déjà été traitée',
    });
  }

  // Accepter l'invitation
  const updatedMembership = await prisma.spaceMember.update({
    where: { id: invitation.id },
    data: {
      statut: 'ACTIVE',
      invitationAcceptedAt: new Date(),
      invitationToken: null, // Invalider le token
    },
    include: {
      space: true,
      user: {
        select: {
          id: true,
          email: true,
          nom: true,
          prenom: true,
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    message: `Vous êtes maintenant membre de ${invitation.space.nom}`,
    data: updatedMembership,
  });
});

// @desc    Refuser une invitation
// @route   POST /api/invitations/:token/reject
// @access  Private
exports.rejectInvitation = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const userId = req.user.id;

  // Trouver l'invitation
  const invitation = await prisma.spaceMember.findUnique({
    where: { invitationToken: token },
  });

  if (!invitation) {
    return res.status(404).json({
      success: false,
      error: 'Invitation introuvable',
    });
  }

  // Vérifier que l'invitation est pour cet utilisateur
  if (invitation.userId !== userId) {
    return res.status(403).json({
      success: false,
      error: 'Cette invitation n\'est pas pour vous',
    });
  }

  // Supprimer l'invitation
  await prisma.spaceMember.delete({
    where: { id: invitation.id },
  });

  res.status(200).json({
    success: true,
    message: 'Invitation refusée',
  });
});

// @desc    Obtenir les invitations en attente pour l'utilisateur connecté
// @route   GET /api/invitations/pending
// @access  Private
exports.getPendingInvitations = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const invitations = await prisma.spaceMember.findMany({
    where: {
      userId,
      statut: 'PENDING',
    },
    include: {
      space: {
        select: {
          id: true,
          nom: true,
          type: true,
        },
      },
      inviter: {
        select: {
          nom: true,
          prenom: true,
          email: true,
        },
      },
    },
    orderBy: {
      invitationSentAt: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    count: invitations.length,
    data: invitations,
  });
});

// @desc    Révoquer une invitation
// @route   DELETE /api/spaces/:spaceId/invitations/:invitationId
// @access  Private (OWNER ou MANAGER)
exports.revokeInvitation = asyncHandler(async (req, res) => {
  const { spaceId, invitationId } = req.params;
  const userId = req.user.id;

  // Vérifier les droits de l'utilisateur
  const userMembership = await prisma.spaceMember.findFirst({
    where: {
      spaceId,
      userId,
      statut: 'ACTIVE',
    },
  });

  if (!userMembership || !['OWNER', 'MANAGER'].includes(userMembership.role)) {
    return res.status(403).json({
      success: false,
      error: 'Vous n\'avez pas les droits pour révoquer des invitations',
    });
  }

  // Trouver et supprimer l'invitation
  const invitation = await prisma.spaceMember.findFirst({
    where: {
      id: invitationId,
      spaceId,
      statut: 'PENDING',
    },
  });

  if (!invitation) {
    return res.status(404).json({
      success: false,
      error: 'Invitation introuvable',
    });
  }

  await prisma.spaceMember.delete({
    where: { id: invitationId },
  });

  res.status(200).json({
    success: true,
    message: 'Invitation révoquée',
  });
});

// @desc    Modifier le rôle d'un membre
// @route   PUT /api/spaces/:spaceId/members/:memberId/role
// @access  Private (OWNER)
exports.updateMemberRole = asyncHandler(async (req, res) => {
  const { spaceId, memberId } = req.params;
  const { role } = req.body;
  const userId = req.user.id;

  // Validation
  const validRoles = ['OWNER', 'MANAGER', 'MEMBER', 'VIEWER', 'COMPTABLE'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      error: 'Rôle invalide',
    });
  }

  // Vérifier que l'utilisateur est OWNER
  const userMembership = await prisma.spaceMember.findFirst({
    where: {
      spaceId,
      userId,
      statut: 'ACTIVE',
      role: 'OWNER',
    },
  });

  if (!userMembership) {
    return res.status(403).json({
      success: false,
      error: 'Seul un propriétaire peut modifier les rôles',
    });
  }

  // Mettre à jour le rôle
  const updatedMember = await prisma.spaceMember.update({
    where: { id: memberId },
    data: { role },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          nom: true,
          prenom: true,
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    message: 'Rôle mis à jour',
    data: updatedMember,
  });
});

// @desc    Retirer un membre du Space
// @route   DELETE /api/spaces/:spaceId/members/:memberId
// @access  Private (OWNER)
exports.removeMember = asyncHandler(async (req, res) => {
  const { spaceId, memberId } = req.params;
  const userId = req.user.id;

  // Vérifier que l'utilisateur est OWNER
  const userMembership = await prisma.spaceMember.findFirst({
    where: {
      spaceId,
      userId,
      statut: 'ACTIVE',
      role: 'OWNER',
    },
  });

  if (!userMembership) {
    return res.status(403).json({
      success: false,
      error: 'Seul un propriétaire peut retirer des membres',
    });
  }

  // Vérifier que le membre existe
  const member = await prisma.spaceMember.findUnique({
    where: { id: memberId },
  });

  if (!member || member.spaceId !== spaceId) {
    return res.status(404).json({
      success: false,
      error: 'Membre introuvable',
    });
  }

  // Empêcher de se retirer soi-même si on est le dernier OWNER
  if (member.userId === userId) {
    const ownerCount = await prisma.spaceMember.count({
      where: {
        spaceId,
        role: 'OWNER',
        statut: 'ACTIVE',
      },
    });

    if (ownerCount === 1) {
      return res.status(400).json({
        success: false,
        error: 'Vous ne pouvez pas vous retirer car vous êtes le seul propriétaire',
      });
    }
  }

  // Retirer le membre
  await prisma.spaceMember.delete({
    where: { id: memberId },
  });

  res.status(200).json({
    success: true,
    message: 'Membre retiré du Space',
  });
});
