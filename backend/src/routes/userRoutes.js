const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * DELETE /api/user/data
 * Supprimer TOUTES les données de l'utilisateur (garde le compte)
 * Supprime tous les espaces SCI et leurs contenus, garde l'espace PERSONAL vide
 */
router.delete('/data', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    await prisma.$transaction(async (tx) => {
      // 1. Récupérer tous les espaces de l'utilisateur
      const userSpaces = await tx.spaceMember.findMany({
        where: { userId },
        select: { spaceId: true, space: { select: { type: true } } }
      });
      
      // 2. Pour chaque espace, supprimer tout le contenu
      for (const membership of userSpaces) {
        const spaceId = membership.spaceId;
        const spaceType = membership.space.type;
        
        // Récupérer tous les biens de cet espace
        const biens = await tx.bien.findMany({
          where: { spaceId },
          select: { id: true }
        });
        
        const bienIds = biens.map(b => b.id);
        
        if (bienIds.length > 0) {
          // Supprimer toutes les données liées aux biens
          await tx.photo.deleteMany({ where: { bienId: { in: bienIds } } });
          await tx.document.deleteMany({ where: { bienId: { in: bienIds } } });
          await tx.pret.deleteMany({ where: { bienId: { in: bienIds } } });
          await tx.travaux.deleteMany({ where: { bienId: { in: bienIds } } });
          await tx.facture.deleteMany({ where: { bienId: { in: bienIds } } });
          await tx.evenementFiscal.deleteMany({ where: { bienId: { in: bienIds } } });
          
          // Supprimer les charges liées aux biens
          const charges = await tx.charge.findMany({
            where: { bienId: { in: bienIds } },
            select: { id: true }
          });
          const chargeIds = charges.map(c => c.id);
          if (chargeIds.length > 0) {
            await tx.paiementCharge.deleteMany({ where: { chargeId: { in: chargeIds } } });
            await tx.charge.deleteMany({ where: { id: { in: chargeIds } } });
          }
          
          // Supprimer les baux et quittances
          const baux = await tx.bail.findMany({
            where: { bienId: { in: bienIds } },
            select: { id: true }
          });
          const bailIds = baux.map(b => b.id);
          if (bailIds.length > 0) {
            await tx.quittance.deleteMany({ where: { bailId: { in: bailIds } } });
            await tx.bail.deleteMany({ where: { id: { in: bailIds } } });
          }
          
          // Supprimer les biens
          await tx.bien.deleteMany({ where: { id: { in: bienIds } } });
        }
        
        // Supprimer les locataires de l'espace
        await tx.locataire.deleteMany({ where: { spaceId } });
        
        // Supprimer les contacts de l'espace
        await tx.contact.deleteMany({ where: { spaceId } });
        
        // Supprimer les associés de l'espace
        await tx.associe.deleteMany({ where: { spaceId } });
        
        // Supprimer les assemblées générales de l'espace
        await tx.assembleeGenerale.deleteMany({ where: { spaceId } });
        
        // Supprimer les notifications de l'espace
        await tx.notification.deleteMany({ where: { spaceId } });
        
        // Si c'est une SCI, supprimer l'espace complètement
        if (spaceType === 'SCI') {
          await tx.spaceMember.deleteMany({ where: { spaceId } });
          await tx.space.delete({ where: { id: spaceId } });
        }
        // Si c'est PERSONAL, on garde l'espace mais vide
      }
      
      // 3. Réinitialiser lastSpaceId vers l'espace PERSONAL
      const personalSpace = await tx.space.findFirst({
        where: {
          type: 'PERSONAL',
          members: {
            some: { userId }
          }
        }
      });
      
      if (personalSpace) {
        await tx.user.update({
          where: { id: userId },
          data: { lastSpaceId: personalSpace.id }
        });
      }
    });
    
    res.json({
      success: true,
      message: 'Toutes vos données ont été supprimées avec succès'
    });
    
  } catch (error) {
    console.error('Erreur suppression données:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression des données'
    });
  }
});

/**
 * DELETE /api/user/account
 * Supprimer complètement le compte utilisateur
 * Supprime tout : espaces, données, et le compte
 */
router.delete('/account', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    await prisma.$transaction(async (tx) => {
      // 1. Récupérer tous les espaces de l'utilisateur
      const userSpaces = await tx.spaceMember.findMany({
        where: { userId },
        select: { spaceId: true }
      });
      
      // 2. Pour chaque espace, supprimer tout le contenu
      for (const membership of userSpaces) {
        const spaceId = membership.spaceId;
        
        // Récupérer tous les biens de cet espace
        const biens = await tx.bien.findMany({
          where: { spaceId },
          select: { id: true }
        });
        
        const bienIds = biens.map(b => b.id);
        
        if (bienIds.length > 0) {
          // Supprimer toutes les données liées aux biens
          await tx.photo.deleteMany({ where: { bienId: { in: bienIds } } });
          await tx.document.deleteMany({ where: { bienId: { in: bienIds } } });
          await tx.pret.deleteMany({ where: { bienId: { in: bienIds } } });
          await tx.travaux.deleteMany({ where: { bienId: { in: bienIds } } });
          await tx.facture.deleteMany({ where: { bienId: { in: bienIds } } });
          await tx.evenementFiscal.deleteMany({ where: { bienId: { in: bienIds } } });
          
          // Supprimer les charges
          const charges = await tx.charge.findMany({
            where: { bienId: { in: bienIds } },
            select: { id: true }
          });
          const chargeIds = charges.map(c => c.id);
          if (chargeIds.length > 0) {
            await tx.paiementCharge.deleteMany({ where: { chargeId: { in: chargeIds } } });
            await tx.charge.deleteMany({ where: { id: { in: chargeIds } } });
          }
          
          // Supprimer les baux et quittances
          const baux = await tx.bail.findMany({
            where: { bienId: { in: bienIds } },
            select: { id: true }
          });
          const bailIds = baux.map(b => b.id);
          if (bailIds.length > 0) {
            await tx.quittance.deleteMany({ where: { bailId: { in: bailIds } } });
            await tx.bail.deleteMany({ where: { id: { in: bailIds } } });
          }
          
          // Supprimer les biens
          await tx.bien.deleteMany({ where: { id: { in: bienIds } } });
        }
        
        // Supprimer les autres données de l'espace
        await tx.locataire.deleteMany({ where: { spaceId } });
        await tx.contact.deleteMany({ where: { spaceId } });
        await tx.associe.deleteMany({ where: { spaceId } });
        await tx.assembleeGenerale.deleteMany({ where: { spaceId } });
        await tx.notification.deleteMany({ where: { spaceId } });
        
        // Supprimer les membres de l'espace
        await tx.spaceMember.deleteMany({ where: { spaceId } });
        
        // Supprimer l'espace lui-même
        await tx.space.delete({ where: { id: spaceId } });
      }
      
      // 3. Supprimer l'utilisateur
      await tx.user.delete({ where: { id: userId } });
    });
    
    res.json({
      success: true,
      message: 'Votre compte a été supprimé avec succès'
    });
    
  } catch (error) {
    console.error('Erreur suppression compte:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du compte'
    });
  }
});

module.exports = router;
