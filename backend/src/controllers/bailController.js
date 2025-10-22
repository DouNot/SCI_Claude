const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

// ============================================
// HELPERS
// ============================================

/**
 * Vérifier qu'un bien appartient à un Space
 */
async function verifyBienInSpace(bienId, spaceId) {
  const bien = await prisma.bien.findUnique({
    where: { id: bienId },
    select: { spaceId: true }
  });
  
  if (!bien) {
    throw new Error('BIEN_NOT_FOUND');
  }
  
  if (bien.spaceId !== spaceId) {
    throw new Error('BIEN_NOT_IN_SPACE');
  }
  
  return true;
}

// ============================================
// CONTROLLERS
// ============================================

// @desc    Récupérer tous les baux d'un Space
// @route   GET /api/baux OU GET /api/spaces/:spaceId/baux
// @access  Auth + Space
exports.getAllBaux = asyncHandler(async (req, res) => {
  // Support des deux formats de route
  const spaceId = req.params.spaceId || req.query.spaceId;
  
  if (!spaceId) {
    return res.status(400).json({
      success: false,
      error: 'Space ID requis',
      code: 'SPACE_ID_REQUIRED'
    });
  }
  
  const baux = await prisma.bail.findMany({
    where: {
      bien: {
        spaceId: spaceId
      }
    },
    include: {
      bien: {
        select: {
          id: true,
          adresse: true,
          ville: true,
          type: true,
        },
      },
      locataire: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          typeLocataire: true,
          raisonSociale: true,
          email: true,
        },
      },
    },
    orderBy: {
      dateDebut: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    count: baux.length,
    data: baux,
  });
});

// @desc    Récupérer un bail par ID
// @route   GET /api/baux/:id
// @access  Auth + Space
exports.getBailById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const spaceId = req.params.spaceId || req.query.spaceId;

  const bail = await prisma.bail.findUnique({
    where: { id },
    include: {
      bien: true,
      locataire: true,
      quittances: {
        orderBy: {
          annee: 'desc',
        },
      },
    },
  });

  if (!bail) {
    return res.status(404).json({
      success: false,
      error: 'Bail non trouvé',
    });
  }
  
  // Vérifier que le bail appartient au Space
  if (spaceId && bail.bien.spaceId !== spaceId) {
    return res.status(403).json({
      success: false,
      error: 'Accès refusé : ce bail n\'appartient pas à cet espace',
      code: 'BAIL_NOT_IN_SPACE'
    });
  }

  res.status(200).json({
    success: true,
    data: bail,
  });
});

// @desc    Récupérer tous les baux d'un bien
// @route   GET /api/baux/bien/:bienId
// @access  Auth + Space
exports.getBauxByBien = asyncHandler(async (req, res) => {
  const { bienId } = req.params;
  const spaceId = req.params.spaceId || req.query.spaceId;
  
  // Si spaceId fourni, vérifier que le bien appartient au Space
  if (spaceId) {
    try {
      await verifyBienInSpace(bienId, spaceId);
    } catch (error) {
      if (error.message === 'BIEN_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: 'Bien non trouvé',
        });
      }
      return res.status(403).json({
        success: false,
        error: 'Ce bien n\'appartient pas à cet espace',
        code: 'BIEN_NOT_IN_SPACE'
      });
    }
  }

  const baux = await prisma.bail.findMany({
    where: { bienId },
    include: {
      locataire: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          typeLocataire: true,
          raisonSociale: true,
          email: true,
        },
      },
    },
    orderBy: {
      dateDebut: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    count: baux.length,
    data: baux,
  });
});

// @desc    Créer un nouveau bail
// @route   POST /api/baux OU POST /api/spaces/:spaceId/baux
// @access  Auth + Space (MEMBER minimum)
exports.createBail = asyncHandler(async (req, res) => {
  const data = req.body;
  const spaceId = req.params.spaceId || req.body.spaceId;

  // Validation basique
  if (!data.typeBail || !data.dateDebut || !data.duree || !data.loyerHC || !data.bienId || !data.locataireId) {
    return res.status(400).json({
      success: false,
      error: 'Champs requis manquants',
    });
  }
  
  // Vérifier que le bien appartient au Space
  if (spaceId) {
    try {
      await verifyBienInSpace(data.bienId, spaceId);
    } catch (error) {
      if (error.message === 'BIEN_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: 'Bien non trouvé',
        });
      }
      return res.status(403).json({
        success: false,
        error: 'Ce bien n\'appartient pas à cet espace',
        code: 'BIEN_NOT_IN_SPACE'
      });
    }
  }

  // Nettoyer les données
  const dataToCreate = { ...data };

  // Convertir dates avec validation (format YYYY-MM-DD du frontend)
  if (dataToCreate.dateDebut) {
    const dateStr = dataToCreate.dateDebut;
    const dateDebut = new Date(dateStr + 'T00:00:00.000Z');
    
    if (isNaN(dateDebut.getTime()) || dateDebut.getFullYear() > 9999) {
      return res.status(400).json({
        success: false,
        error: 'Date de début invalide',
      });
    }
    dataToCreate.dateDebut = dateDebut;
  }
  
  if (dataToCreate.dateFin === '' || !dataToCreate.dateFin) {
    dataToCreate.dateFin = null;
  } else {
    const dateStr = dataToCreate.dateFin;
    const dateFin = new Date(dateStr + 'T00:00:00.000Z');
    
    if (isNaN(dateFin.getTime()) || dateFin.getFullYear() > 9999) {
      return res.status(400).json({
        success: false,
        error: 'Date de fin invalide',
      });
    }
    dataToCreate.dateFin = dateFin;
  }

  // Convertir champs numériques
  if (dataToCreate.duree) dataToCreate.duree = parseInt(dataToCreate.duree);
  if (dataToCreate.loyerHC) dataToCreate.loyerHC = parseFloat(dataToCreate.loyerHC);
  
  if (dataToCreate.charges === '' || dataToCreate.charges === null) {
    dataToCreate.charges = null;
  } else if (dataToCreate.charges) {
    dataToCreate.charges = parseFloat(dataToCreate.charges);
  }
  
  if (dataToCreate.depotGarantie === '' || dataToCreate.depotGarantie === null) {
    dataToCreate.depotGarantie = null;
  } else if (dataToCreate.depotGarantie) {
    dataToCreate.depotGarantie = parseFloat(dataToCreate.depotGarantie);
  }

  // Champs numériques optionnels pour la taxe foncière
  if (dataToCreate.montantTaxeFonciere === '' || dataToCreate.montantTaxeFonciere === null) {
    dataToCreate.montantTaxeFonciere = null;
  } else if (dataToCreate.montantTaxeFonciere) {
    dataToCreate.montantTaxeFonciere = parseFloat(dataToCreate.montantTaxeFonciere);
  }
  
  if (dataToCreate.partRefactureTF === '' || dataToCreate.partRefactureTF === null) {
    dataToCreate.partRefactureTF = null;
  } else if (dataToCreate.partRefactureTF) {
    dataToCreate.partRefactureTF = parseFloat(dataToCreate.partRefactureTF);
  }
  
  if (dataToCreate.montantRefactureTF === '' || dataToCreate.montantRefactureTF === null) {
    dataToCreate.montantRefactureTF = null;
  } else if (dataToCreate.montantRefactureTF) {
    dataToCreate.montantRefactureTF = parseFloat(dataToCreate.montantRefactureTF);
  }

  // Champs texte optionnels
  if (dataToCreate.indexRevision === '') dataToCreate.indexRevision = null;

  // Supprimer le spaceId car il n'existe pas dans le modèle Bail
  delete dataToCreate.spaceId;

  const bail = await prisma.bail.create({
    data: dataToCreate,
    include: {
      bien: true,
      locataire: true,
    },
  });

  // Mettre à jour le statut du bien si le bail est actif
  if (dataToCreate.statut === 'ACTIF') {
    await prisma.bien.update({
      where: { id: dataToCreate.bienId },
      data: { statut: 'LOUE' }
    });
  }

  res.status(201).json({
    success: true,
    data: bail,
  });
});

// @desc    Mettre à jour un bail
// @route   PUT /api/baux/:id
// @access  Auth + Space (MEMBER minimum)
exports.updateBail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const spaceId = req.params.spaceId || req.body.spaceId;

  // Vérifier que le bail existe
  const bailExistant = await prisma.bail.findUnique({
    where: { id },
    include: { bien: { select: { spaceId: true } } }
  });

  if (!bailExistant) {
    return res.status(404).json({
      success: false,
      error: 'Bail non trouvé',
    });
  }
  
  // Vérifier que le bail appartient au Space
  if (spaceId && bailExistant.bien.spaceId !== spaceId) {
    return res.status(403).json({
      success: false,
      error: 'Ce bail n\'appartient pas à cet espace',
      code: 'BAIL_NOT_IN_SPACE'
    });
  }

  // Nettoyer les données
  const dataToUpdate = { ...data };

  // Convertir dates (format YYYY-MM-DD du frontend)
  if (dataToUpdate.dateDebut && dataToUpdate.dateDebut !== '') {
    const dateStr = dataToUpdate.dateDebut;
    dataToUpdate.dateDebut = new Date(dateStr + 'T00:00:00.000Z');
  }
  if (dataToUpdate.dateFin === '' || !dataToUpdate.dateFin) {
    dataToUpdate.dateFin = null;
  } else if (dataToUpdate.dateFin) {
    const dateStr = dataToUpdate.dateFin;
    dataToUpdate.dateFin = new Date(dateStr + 'T00:00:00.000Z');
  }

  // Convertir champs numériques
  if (dataToUpdate.duree) dataToUpdate.duree = parseInt(dataToUpdate.duree);
  if (dataToUpdate.loyerHC) dataToUpdate.loyerHC = parseFloat(dataToUpdate.loyerHC);
  
  if (dataToUpdate.charges === '' || dataToUpdate.charges === null) {
    dataToUpdate.charges = null;
  } else if (dataToUpdate.charges) {
    dataToUpdate.charges = parseFloat(dataToUpdate.charges);
  }
  
  if (dataToUpdate.depotGarantie === '' || dataToUpdate.depotGarantie === null) {
    dataToUpdate.depotGarantie = null;
  } else if (dataToUpdate.depotGarantie) {
    dataToUpdate.depotGarantie = parseFloat(dataToUpdate.depotGarantie);
  }

  // Champs numériques optionnels pour la taxe foncière
  if (dataToUpdate.montantTaxeFonciere === '' || dataToUpdate.montantTaxeFonciere === null) {
    dataToUpdate.montantTaxeFonciere = null;
  } else if (dataToUpdate.montantTaxeFonciere) {
    dataToUpdate.montantTaxeFonciere = parseFloat(dataToUpdate.montantTaxeFonciere);
  }
  
  if (dataToUpdate.partRefactureTF === '' || dataToUpdate.partRefactureTF === null) {
    dataToUpdate.partRefactureTF = null;
  } else if (dataToUpdate.partRefactureTF) {
    dataToUpdate.partRefactureTF = parseFloat(dataToUpdate.partRefactureTF);
  }
  
  if (dataToUpdate.montantRefactureTF === '' || dataToUpdate.montantRefactureTF === null) {
    dataToUpdate.montantRefactureTF = null;
  } else if (dataToUpdate.montantRefactureTF) {
    dataToUpdate.montantRefactureTF = parseFloat(dataToUpdate.montantRefactureTF);
  }

  if (dataToUpdate.indexRevision === '') dataToUpdate.indexRevision = null;

  // Supprimer les champs qui ne doivent pas être mis à jour
  delete dataToUpdate.id;
  delete dataToUpdate.createdAt;
  delete dataToUpdate.updatedAt;
  delete dataToUpdate.locataire;
  delete dataToUpdate.bien;
  delete dataToUpdate.quittances;
  delete dataToUpdate.spaceId; // Ne pas modifier le spaceId

  const bail = await prisma.bail.update({
    where: { id },
    data: dataToUpdate,
    include: {
      bien: true,
      locataire: true,
    },
  });

  // Mettre à jour le statut du bien
  if (bail.statut !== bailExistant.statut) {
    // Vérifier s'il y a d'autres baux actifs pour ce bien
    const autresBauxActifs = await prisma.bail.count({
      where: {
        bienId: bail.bienId,
        statut: 'ACTIF',
        id: { not: id }
      }
    });

    const nouveauStatut = (bail.statut === 'ACTIF' || autresBauxActifs > 0) ? 'LOUE' : 'LIBRE';
    await prisma.bien.update({
      where: { id: bail.bienId },
      data: { statut: nouveauStatut }
    });
  }

  res.status(200).json({
    success: true,
    data: bail,
  });
});

// @desc    Supprimer un bail
// @route   DELETE /api/baux/:id
// @access  Auth + Space (MEMBER minimum)
exports.deleteBail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const spaceId = req.params.spaceId || req.query.spaceId;

  // Vérifier que le bail existe
  const bail = await prisma.bail.findUnique({
    where: { id },
    include: { bien: { select: { spaceId: true } } }
  });

  if (!bail) {
    return res.status(404).json({
      success: false,
      error: 'Bail non trouvé',
    });
  }
  
  // Vérifier que le bail appartient au Space
  if (spaceId && bail.bien.spaceId !== spaceId) {
    return res.status(403).json({
      success: false,
      error: 'Ce bail n\'appartient pas à cet espace',
      code: 'BAIL_NOT_IN_SPACE'
    });
  }

  await prisma.bail.delete({
    where: { id },
  });

  // Mettre à jour le statut du bien si c'était le dernier bail actif
  const autresBauxActifs = await prisma.bail.count({
    where: {
      bienId: bail.bienId,
      statut: 'ACTIF'
    }
  });

  if (autresBauxActifs === 0) {
    await prisma.bien.update({
      where: { id: bail.bienId },
      data: { statut: 'LIBRE' }
    });
  }

  res.status(200).json({
    success: true,
    data: {},
    message: 'Bail supprimé avec succès',
  });
});
