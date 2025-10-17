const express = require('express');
const router = express.Router({ mergeParams: true });
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/auth');
const { requireSpaceAccess, requireSpaceRole } = require('../middleware/spaceAccess');

const prisma = new PrismaClient();

/**
 * GET /api/spaces/:spaceId/biens
 * Récupérer tous les biens d'un espace
 */
router.get('/', requireAuth, requireSpaceAccess, async (req, res) => {
  try {
    const { spaceId } = req.params;
    
    const biens = await prisma.bien.findMany({
      where: { spaceId },
      include: {
        photos: {
          orderBy: { ordre: 'asc' }
        },
        baux: {
          where: { statut: 'ACTIF' },
          include: {
            locataire: true
          }
        },
        _count: {
          select: {
            factures: true,
            documents: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculer le statut pour chaque bien
    const biensAvecStatut = biens.map(bien => {
      const bailActif = bien.baux && bien.baux.length > 0 ? bien.baux[0] : null;
      return {
        ...bien,
        statut: bailActif ? 'LOUE' : 'LIBRE',
        bailActif: bailActif,
        loyerActuel: bailActif ? bailActif.loyerHC : null,
        chargesActuelles: bailActif ? bailActif.charges : null,
        locataireActuel: bailActif ? bailActif.locataire : null
      };
    });

    res.json({
      success: true,
      count: biensAvecStatut.length,
      data: biensAvecStatut
    });
    
  } catch (error) {
    console.error('Erreur GET /biens:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la récupération des biens'
    });
  }
});

/**
 * GET /api/spaces/:spaceId/biens/:id
 * Récupérer un bien par ID
 */
router.get('/:id', requireAuth, requireSpaceAccess, async (req, res) => {
  try {
    const { spaceId, id } = req.params;

    const bien = await prisma.bien.findFirst({
      where: { 
        id,
        spaceId // Sécurité : vérifier que le bien appartient au Space
      },
      include: {
        photos: {
          orderBy: { ordre: 'asc' }
        },
        locataires: true,
        documents: {
          orderBy: { createdAt: 'desc' }
        },
        travaux: {
          orderBy: { dateDebut: 'desc' }
        },
        factures: {
          orderBy: { dateFacture: 'desc' }
        },
        prets: true,
        baux: {
          include: {
            locataire: true,
            quittances: {
              orderBy: { annee: 'desc', mois: 'desc' },
              take: 12
            }
          },
          orderBy: { dateDebut: 'desc' }
        },
        charges: {
          where: { estActive: true },
          include: {
            paiements: {
              orderBy: { datePaiement: 'desc' },
              take: 12
            }
          }
        }
      }
    });

    if (!bien) {
      return res.status(404).json({
        success: false,
        error: 'Bien non trouvé'
      });
    }

    // Calculer le statut du bien
    const bailActif = bien.baux && bien.baux.length > 0 
      ? bien.baux.find(b => b.statut === 'ACTIF') 
      : null;
      
    const bienAvecStatut = {
      ...bien,
      statut: bailActif ? 'LOUE' : 'LIBRE',
      bailActif: bailActif,
      loyerActuel: bailActif ? bailActif.loyerHC : null,
      chargesActuelles: bailActif ? bailActif.charges : null,
      locataireActuel: bailActif ? bailActif.locataire : null
    };

    res.json({
      success: true,
      data: bienAvecStatut
    });
    
  } catch (error) {
    console.error('Erreur GET /biens/:id:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la récupération du bien'
    });
  }
});

/**
 * POST /api/spaces/:spaceId/biens
 * Créer un nouveau bien
 */
router.post('/', requireAuth, requireSpaceAccess, requireSpaceRole(['OWNER', 'ADMIN', 'MEMBER']), async (req, res) => {
  try {
    const { spaceId } = req.params;
    const data = req.body;

    // Validation basique
    if (!data.adresse || !data.ville || !data.codePostal || !data.type || !data.prixAchat || !data.dateAchat) {
      return res.status(400).json({
        success: false,
        error: 'Champs requis manquants',
        required: ['adresse', 'ville', 'codePostal', 'type', 'prixAchat', 'dateAchat']
      });
    }

    // Nettoyer et valider les données numériques
    const numericFields = ['surface', 'nbPieces', 'nbChambres', 'etage', 'prixAchat', 'fraisNotaire', 'valeurActuelle', 'assuranceMensuelle', 'taxeFonciere'];
    
    const dataToCreate = { ...data };
    
    numericFields.forEach(field => {
      if (dataToCreate[field] === '' || dataToCreate[field] === null || dataToCreate[field] === undefined) {
        dataToCreate[field] = null;
      } else if (dataToCreate[field]) {
        dataToCreate[field] = parseFloat(dataToCreate[field]);
      }
    });

    // Convertir la date
    if (dataToCreate.dateAchat) {
      dataToCreate.dateAchat = new Date(dataToCreate.dateAchat);
    }

    // Nettoyer la description
    if (dataToCreate.description === '') {
      dataToCreate.description = null;
    }

    // Ajouter le spaceId
    dataToCreate.spaceId = spaceId;
    dataToCreate.statut = 'LIBRE';

    // Créer le bien en transaction avec les charges associées
    const result = await prisma.$transaction(async (tx) => {
      const bien = await tx.bien.create({
        data: dataToCreate,
        include: {
          photos: true
        }
      });

      // Créer automatiquement les charges si renseignées
      if (bien.assuranceMensuelle && bien.assuranceMensuelle > 0) {
        await tx.charge.create({
          data: {
            type: 'ASSURANCE_PNO',
            libelle: 'Assurance PNO',
            montant: bien.assuranceMensuelle,
            frequence: 'MENSUELLE',
            dateDebut: bien.dateAchat,
            estActive: true,
            bienId: bien.id,
            notes: 'Synchronisé automatiquement depuis les détails du bien'
          }
        });
      }

      if (bien.taxeFonciere && bien.taxeFonciere > 0) {
        await tx.charge.create({
          data: {
            type: 'TAXE_FONCIERE',
            libelle: 'Taxe foncière',
            montant: bien.taxeFonciere,
            frequence: 'ANNUELLE',
            dateDebut: bien.dateAchat,
            estActive: true,
            bienId: bien.id,
            notes: 'Synchronisé automatiquement depuis les détails du bien'
          }
        });
      }

      return bien;
    });

    res.status(201).json({
      success: true,
      message: 'Bien créé avec succès',
      data: {
        ...result,
        bailActif: null,
        loyerActuel: null,
        chargesActuelles: null,
        locataireActuel: null
      }
    });
    
  } catch (error) {
    console.error('Erreur POST /biens:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la création du bien'
    });
  }
});

/**
 * PUT /api/spaces/:spaceId/biens/:id
 * Mettre à jour un bien
 */
router.put('/:id', requireAuth, requireSpaceAccess, requireSpaceRole(['OWNER', 'ADMIN', 'MEMBER']), async (req, res) => {
  try {
    const { spaceId, id } = req.params;
    const data = req.body;

    // Vérifier que le bien existe et appartient au Space
    const bienExistant = await prisma.bien.findFirst({
      where: { id, spaceId }
    });

    if (!bienExistant) {
      return res.status(404).json({
        success: false,
        error: 'Bien non trouvé'
      });
    }

    // Nettoyer les données
    const dataToUpdate = { ...data };
    
    const numericFields = ['surface', 'nbPieces', 'nbChambres', 'etage', 'prixAchat', 'fraisNotaire', 'valeurActuelle', 'assuranceMensuelle', 'taxeFonciere'];
    
    numericFields.forEach(field => {
      if (dataToUpdate[field] === '' || dataToUpdate[field] === null || dataToUpdate[field] === undefined) {
        dataToUpdate[field] = null;
      } else if (dataToUpdate[field]) {
        dataToUpdate[field] = parseFloat(dataToUpdate[field]);
      }
    });

    if (dataToUpdate.dateAchat && dataToUpdate.dateAchat !== '') {
      dataToUpdate.dateAchat = new Date(dataToUpdate.dateAchat);
    }

    if (dataToUpdate.description === '') {
      dataToUpdate.description = null;
    }

    // Supprimer les champs non modifiables
    delete dataToUpdate.spaceId;
    delete dataToUpdate.id;
    delete dataToUpdate.createdAt;
    delete dataToUpdate.updatedAt;

    // Mettre à jour le bien
    const bien = await prisma.bien.update({
      where: { id },
      data: dataToUpdate,
      include: {
        photos: true
      }
    });

    // Synchroniser les charges
    const chargesExistantes = await prisma.charge.findMany({
      where: {
        bienId: id,
        type: { in: ['ASSURANCE_PNO', 'TAXE_FONCIERE'] }
      }
    });

    const chargeAssurance = chargesExistantes.find(c => c.type === 'ASSURANCE_PNO');
    const chargeTaxe = chargesExistantes.find(c => c.type === 'TAXE_FONCIERE');

    // Synchroniser l'assurance PNO
    if (bien.assuranceMensuelle && bien.assuranceMensuelle > 0) {
      if (chargeAssurance) {
        await prisma.charge.update({
          where: { id: chargeAssurance.id },
          data: {
            montant: bien.assuranceMensuelle,
            estActive: true
          }
        });
      } else {
        await prisma.charge.create({
          data: {
            type: 'ASSURANCE_PNO',
            libelle: 'Assurance PNO',
            montant: bien.assuranceMensuelle,
            frequence: 'MENSUELLE',
            dateDebut: bien.dateAchat,
            estActive: true,
            bienId: bien.id,
            notes: 'Synchronisé automatiquement depuis les détails du bien'
          }
        });
      }
    } else if (chargeAssurance) {
      await prisma.charge.update({
        where: { id: chargeAssurance.id },
        data: { estActive: false }
      });
    }

    // Synchroniser la taxe foncière
    if (bien.taxeFonciere && bien.taxeFonciere > 0) {
      if (chargeTaxe) {
        await prisma.charge.update({
          where: { id: chargeTaxe.id },
          data: {
            montant: bien.taxeFonciere,
            estActive: true
          }
        });
      } else {
        await prisma.charge.create({
          data: {
            type: 'TAXE_FONCIERE',
            libelle: 'Taxe foncière',
            montant: bien.taxeFonciere,
            frequence: 'ANNUELLE',
            dateDebut: bien.dateAchat,
            estActive: true,
            bienId: bien.id,
            notes: 'Synchronisé automatiquement depuis les détails du bien'
          }
        });
      }
    } else if (chargeTaxe) {
      await prisma.charge.update({
        where: { id: chargeTaxe.id },
        data: { estActive: false }
      });
    }

    res.json({
      success: true,
      message: 'Bien mis à jour',
      data: bien
    });
    
  } catch (error) {
    console.error('Erreur PUT /biens/:id:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la mise à jour du bien'
    });
  }
});

/**
 * DELETE /api/spaces/:spaceId/biens/:id
 * Supprimer un bien
 */
router.delete('/:id', requireAuth, requireSpaceAccess, requireSpaceRole(['OWNER', 'ADMIN']), async (req, res) => {
  try {
    const { spaceId, id } = req.params;

    // Vérifier que le bien existe et appartient au Space
    const bien = await prisma.bien.findFirst({
      where: { id, spaceId }
    });

    if (!bien) {
      return res.status(404).json({
        success: false,
        error: 'Bien non trouvé'
      });
    }

    // Supprimer le bien (cascade supprimera les relations)
    await prisma.bien.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Bien supprimé avec succès'
    });
    
  } catch (error) {
    console.error('Erreur DELETE /biens/:id:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la suppression du bien'
    });
  }
});

module.exports = router;
