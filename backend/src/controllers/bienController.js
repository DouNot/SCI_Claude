const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Récupérer tous les biens
// @route   GET /api/biens?spaceId=xxx
// @access  Private
exports.getAllBiens = asyncHandler(async (req, res) => {
  // Le spaceId est déjà vérifié par le middleware requireSpaceAccess
  const spaceId = req.spaceId;
  
  const biens = await prisma.bien.findMany({
    where: {
      spaceId: spaceId
    },
    include: {
      space: true,
      photos: true,
      baux: {
        where: {
          statut: 'ACTIF'
        },
        include: {
          locataire: true
        }
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
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

  res.status(200).json({
    success: true,
    count: biensAvecStatut.length,
    data: biensAvecStatut,
  });
});

// @desc    Récupérer un bien par ID
// @route   GET /api/biens/:id?spaceId=xxx
// @access  Private
exports.getBienById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const spaceId = req.spaceId;

  const bien = await prisma.bien.findFirst({
    where: { 
      id: id,
      spaceId: spaceId
    },
    include: {
      space: true,
      photos: true,
      locataires: true,
      documents: true,
      travaux: true,
      factures: true,
      prets: true,
      baux: {
        where: {
          statut: 'ACTIF'
        },
        include: {
          locataire: true
        }
      },
    },
  });

  if (!bien) {
    return res.status(404).json({
      success: false,
      error: 'Bien non trouvé',
    });
  }

  // Calculer le statut du bien
  const bailActif = bien.baux && bien.baux.length > 0 ? bien.baux[0] : null;
  const bienAvecStatut = {
    ...bien,
    statut: bailActif ? 'LOUE' : 'LIBRE',
    bailActif: bailActif,
    loyerActuel: bailActif ? bailActif.loyerHC : null,
    chargesActuelles: bailActif ? bailActif.charges : null,
    locataireActuel: bailActif ? bailActif.locataire : null
  };

  res.status(200).json({
    success: true,
    data: bienAvecStatut,
  });
});

// @desc    Créer un nouveau bien
// @route   POST /api/biens
// @access  Private
exports.createBien = asyncHandler(async (req, res) => {
  const data = req.body;
  const spaceId = req.spaceId; // Déjà vérifié par le middleware

  // Validation basique
  if (!data.adresse || !data.ville || !data.codePostal || !data.type || !data.surface || !data.prixAchat || !data.dateAchat) {
    return res.status(400).json({
      success: false,
      error: 'Champs requis manquants',
    });
  }

  // Nettoyer les données
  const dataToCreate = { ...data };

  // Champs numériques
  const numericFields = ['surface', 'nbPieces', 'nbChambres', 'etage', 'prixAchat', 'fraisNotaire', 'valeurActuelle', 'assuranceMensuelle', 'taxeFonciere'];
  
  numericFields.forEach(field => {
    if (dataToCreate[field] === '' || dataToCreate[field] === null || dataToCreate[field] === undefined) {
      dataToCreate[field] = null;
    } else if (dataToCreate[field]) {
      dataToCreate[field] = parseFloat(dataToCreate[field]);
    }
  });

  // Date
  if (dataToCreate.dateAchat) {
    dataToCreate.dateAchat = new Date(dataToCreate.dateAchat);
  }

  // Description
  if (dataToCreate.description === '') {
    dataToCreate.description = null;
  }
  
  // SpaceId vient du middleware
  dataToCreate.spaceId = spaceId;
  dataToCreate.statut = 'LIBRE';

  const bien = await prisma.bien.create({
    data: dataToCreate,
    include: {
      space: true,
    },
  });

  // Créer charges automatiquement
  if (bien.assuranceMensuelle && bien.assuranceMensuelle > 0) {
    await prisma.charge.create({
      data: {
        type: 'ASSURANCE_PNO',
        libelle: 'Assurance PNO',
        montant: bien.assuranceMensuelle,
        frequence: 'MENSUELLE',
        dateDebut: bien.dateAchat,
        estActive: true,
        bienId: bien.id,
        notes: 'Synchronisé automatiquement depuis les détails du bien',
      },
    });
  }

  if (bien.taxeFonciere && bien.taxeFonciere > 0) {
    await prisma.charge.create({
      data: {
        type: 'TAXE_FONCIERE',
        libelle: 'Taxe foncière',
        montant: bien.taxeFonciere,
        frequence: 'ANNUELLE',
        dateDebut: bien.dateAchat,
        estActive: true,
        bienId: bien.id,
        notes: 'Synchronisé automatiquement depuis les détails du bien',
      },
    });
  }

  res.status(201).json({
    success: true,
    data: { ...bien, bailActif: null, loyerActuel: null, chargesActuelles: null, locataireActuel: null },
  });
});

// @desc    Mettre à jour un bien
// @route   PUT /api/biens/:id
// @access  Private
exports.updateBien = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const spaceId = req.spaceId;

  // Vérifier que le bien existe et appartient au space
  const bienExistant = await prisma.bien.findFirst({
    where: { 
      id: id,
      spaceId: spaceId
    },
  });

  if (!bienExistant) {
    return res.status(404).json({
      success: false,
      error: 'Bien non trouvé',
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

  // Supprimer les champs à ne pas mettre à jour
  delete dataToUpdate.spaceId;
  delete dataToUpdate.compteId;
  delete dataToUpdate.id;
  delete dataToUpdate.createdAt;
  delete dataToUpdate.updatedAt;

  const bien = await prisma.bien.update({
    where: { id },
    data: dataToUpdate,
    include: {
      space: true,
      photos: true,
    },
  });

  // Synchroniser les charges
  const chargesExistantes = await prisma.charge.findMany({
    where: {
      bienId: id,
      type: { in: ['ASSURANCE_PNO', 'TAXE_FONCIERE'] },
    },
  });

  const chargeAssurance = chargesExistantes.find(c => c.type === 'ASSURANCE_PNO');
  const chargeTaxe = chargesExistantes.find(c => c.type === 'TAXE_FONCIERE');

  // Assurance
  if (bien.assuranceMensuelle && bien.assuranceMensuelle > 0) {
    if (chargeAssurance) {
      await prisma.charge.update({
        where: { id: chargeAssurance.id },
        data: {
          montant: bien.assuranceMensuelle,
          estActive: true,
        },
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
          notes: 'Synchronisé automatiquement depuis les détails du bien',
        },
      });
    }
  } else if (chargeAssurance) {
    await prisma.charge.update({
      where: { id: chargeAssurance.id },
      data: { estActive: false },
    });
  }

  // Taxe foncière
  if (bien.taxeFonciere && bien.taxeFonciere > 0) {
    if (chargeTaxe) {
      await prisma.charge.update({
        where: { id: chargeTaxe.id },
        data: {
          montant: bien.taxeFonciere,
          estActive: true,
        },
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
          notes: 'Synchronisé automatiquement depuis les détails du bien',
        },
      });
    }
  } else if (chargeTaxe) {
    await prisma.charge.update({
      where: { id: chargeTaxe.id },
      data: { estActive: false },
    });
  }

  res.status(200).json({
    success: true,
    data: bien,
  });
});

// @desc    Supprimer un bien
// @route   DELETE /api/biens/:id
// @access  Private
exports.deleteBien = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const spaceId = req.spaceId;

  console.log(`🗑️ Tentative de suppression du bien ${id} pour le space ${spaceId}`);

  try {
    // Vérifier que le bien existe et appartient au space
    const bien = await prisma.bien.findFirst({
      where: { 
        id: id,
        spaceId: spaceId
      },
      include: {
        baux: {
          where: { statut: 'ACTIF' }
        }
      }
    });

    if (!bien) {
      console.log(`❌ Bien ${id} non trouvé`);
      return res.status(404).json({
        success: false,
        error: 'Bien non trouvé',
      });
    }

    // Vérifier qu'il n'y a pas de bail actif
    if (bien.baux && bien.baux.length > 0) {
      console.log(`❌ Bien ${id} a un bail actif`);
      return res.status(400).json({
        success: false,
        error: 'Impossible de supprimer un bien avec un bail actif. Veuillez d\'abord résilier le bail.',
        code: 'BIEN_HAS_ACTIVE_BAIL'
      });
    }

    console.log(`✅ Bien ${id} validé, début de la suppression`);

    // Supprimer le bien - Prisma gère automatiquement la cascade avec onDelete: Cascade
    await prisma.bien.delete({
      where: { id }
    });

    console.log(`✅ Bien ${id} supprimé avec succès`);

    res.status(200).json({
      success: true,
      data: {},
      message: 'Bien supprimé avec succès',
    });

  } catch (error) {
    console.error(`❌ Erreur lors de la suppression du bien ${id}:`, error);
    console.error('Stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du bien',
      details: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
});

module.exports = exports;
