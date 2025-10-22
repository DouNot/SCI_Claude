const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Récupérer tous les locataires d'un Space
// @route   GET /api/locataires
// @access  Auth + Space
exports.getAllLocataires = asyncHandler(async (req, res) => {
  const spaceId = req.spaceId; // Du middleware
  
  // Récupérer tous les locataires du Space
  const locataires = await prisma.locataire.findMany({
    where: {
      spaceId: spaceId
    },
    include: {
      bien: {
        select: {
          id: true,
          adresse: true,
          ville: true,
        },
      },
    },
    orderBy: {
      nom: 'asc',
    },
  });

  res.status(200).json({
    success: true,
    count: locataires.length,
    data: locataires,
  });
});

// @desc    Récupérer un locataire par ID
// @route   GET /api/locataires/:id
// @access  Auth + Space
exports.getLocataireById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const spaceId = req.spaceId; // Du middleware

  const locataire = await prisma.locataire.findFirst({
    where: { 
      id,
      spaceId: spaceId // Vérifier que le locataire appartient au Space
    },
    include: {
      bien: true,
      baux: {
        include: {
          bien: {
            select: {
              id: true,
              adresse: true,
              ville: true,
            }
          }
        }
      },
    },
  });

  if (!locataire) {
    return res.status(404).json({
      success: false,
      error: 'Locataire non trouvé',
    });
  }

  res.status(200).json({
    success: true,
    data: locataire,
  });
});

// @desc    Créer un nouveau locataire
// @route   POST /api/locataires
// @access  Auth + Space
exports.createLocataire = asyncHandler(async (req, res) => {
  const data = req.body;
  const spaceId = req.spaceId; // Du middleware

  console.log('📝 Création locataire - spaceId:', spaceId);
  console.log('📝 Données reçues:', data);

  // Validation basique
  if (!data.nom || !data.prenom || !data.email) {
    return res.status(400).json({
      success: false,
      error: 'Nom, prénom et email sont requis',
    });
  }
  
  // Vérifier que le bien appartient au Space (si fourni)
  if (data.bienId) {
    const bien = await prisma.bien.findFirst({
      where: { 
        id: data.bienId,
        spaceId: spaceId
      }
    });
    
    if (!bien) {
      return res.status(404).json({
        success: false,
        error: 'Bien non trouvé dans cet espace',
      });
    }
  }

  // Nettoyer les données
  const dataToCreate = { ...data };

  // Convertir chaînes vides en null
  if (dataToCreate.typeLocataire === '') dataToCreate.typeLocataire = 'PARTICULIER';
  if (dataToCreate.raisonSociale === '') dataToCreate.raisonSociale = null;
  if (dataToCreate.siret === '') dataToCreate.siret = null;
  if (dataToCreate.formeJuridique === '') dataToCreate.formeJuridique = null;
  if (dataToCreate.capitalSocial === '' || dataToCreate.capitalSocial === null) {
    dataToCreate.capitalSocial = null;
  } else {
    dataToCreate.capitalSocial = parseFloat(dataToCreate.capitalSocial);
  }
  if (dataToCreate.telephone === '') dataToCreate.telephone = null;
  if (dataToCreate.adresse === '') dataToCreate.adresse = null;
  if (dataToCreate.ville === '') dataToCreate.ville = null;
  if (dataToCreate.codePostal === '') dataToCreate.codePostal = null;
  if (dataToCreate.profession === '') dataToCreate.profession = null;
  if (dataToCreate.dateNaissance === '') {
    dataToCreate.dateNaissance = null;
  } else if (dataToCreate.dateNaissance) {
    dataToCreate.dateNaissance = new Date(dataToCreate.dateNaissance);
  }
  if (dataToCreate.dateEntree === '') {
    dataToCreate.dateEntree = null;
  } else if (dataToCreate.dateEntree) {
    dataToCreate.dateEntree = new Date(dataToCreate.dateEntree);
  }
  if (dataToCreate.dateSortie === '') {
    dataToCreate.dateSortie = null;
  } else if (dataToCreate.dateSortie) {
    dataToCreate.dateSortie = new Date(dataToCreate.dateSortie);
  }
  if (dataToCreate.bienId === '') dataToCreate.bienId = null;
  
  // IMPORTANT : Ajouter le spaceId
  dataToCreate.spaceId = spaceId;

  console.log('📝 Données nettoyées:', dataToCreate);

  const locataire = await prisma.locataire.create({
    data: dataToCreate,
    include: {
      bien: true,
    },
  });

  console.log('✅ Locataire créé:', locataire.id);

  res.status(201).json({
    success: true,
    data: locataire,
  });
});

// @desc    Mettre à jour un locataire
// @route   PUT /api/locataires/:id
// @access  Auth + Space
exports.updateLocataire = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const spaceId = req.spaceId; // Du middleware

  // Vérifier que le locataire existe et appartient au space
  const locataireExistant = await prisma.locataire.findFirst({
    where: { 
      id,
      spaceId: spaceId
    }
  });

  if (!locataireExistant) {
    return res.status(404).json({
      success: false,
      error: 'Locataire non trouvé',
    });
  }
  
  // Si on change le bienId, vérifier qu'il appartient au Space
  if (data.bienId && data.bienId !== locataireExistant.bienId) {
    const bien = await prisma.bien.findFirst({
      where: { 
        id: data.bienId,
        spaceId: spaceId
      }
    });
    
    if (!bien) {
      return res.status(404).json({
        success: false,
        error: 'Bien non trouvé dans cet espace',
      });
    }
  }

  // Nettoyer les données
  const dataToUpdate = { ...data };

  // Convertir chaînes vides en null
  if (dataToUpdate.raisonSociale === '') dataToUpdate.raisonSociale = null;
  if (dataToUpdate.siret === '') dataToUpdate.siret = null;
  if (dataToUpdate.formeJuridique === '') dataToUpdate.formeJuridique = null;
  if (dataToUpdate.capitalSocial === '' || dataToUpdate.capitalSocial === null) {
    dataToUpdate.capitalSocial = null;
  } else {
    dataToUpdate.capitalSocial = parseFloat(dataToUpdate.capitalSocial);
  }
  if (dataToUpdate.telephone === '') dataToUpdate.telephone = null;
  if (dataToUpdate.adresse === '') dataToUpdate.adresse = null;
  if (dataToUpdate.ville === '') dataToUpdate.ville = null;
  if (dataToUpdate.codePostal === '') dataToUpdate.codePostal = null;
  if (dataToUpdate.profession === '') dataToUpdate.profession = null;
  if (dataToUpdate.dateNaissance === '') {
    dataToUpdate.dateNaissance = null;
  } else if (dataToUpdate.dateNaissance) {
    dataToUpdate.dateNaissance = new Date(dataToUpdate.dateNaissance);
  }
  if (dataToUpdate.dateEntree === '') {
    dataToUpdate.dateEntree = null;
  } else if (dataToUpdate.dateEntree) {
    dataToUpdate.dateEntree = new Date(dataToUpdate.dateEntree);
  }
  if (dataToUpdate.dateSortie === '') {
    dataToUpdate.dateSortie = null;
  } else if (dataToUpdate.dateSortie) {
    dataToUpdate.dateSortie = new Date(dataToUpdate.dateSortie);
  }
  if (dataToUpdate.bienId === '') dataToUpdate.bienId = null;

  delete dataToUpdate.id;
  delete dataToUpdate.createdAt;
  delete dataToUpdate.updatedAt;
  delete dataToUpdate.bien;
  delete dataToUpdate.baux;
  delete dataToUpdate.spaceId; // Ne pas changer le spaceId
  delete dataToUpdate.space; // Supprimer la relation si présente

  const locataire = await prisma.locataire.update({
    where: { id },
    data: dataToUpdate,
    include: {
      bien: true,
    },
  });

  res.status(200).json({
    success: true,
    data: locataire,
  });
});

// @desc    Supprimer un locataire
// @route   DELETE /api/locataires/:id
// @access  Auth + Space
exports.deleteLocataire = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const spaceId = req.spaceId; // Du middleware

  console.log(`🗑️ Tentative de suppression du locataire ${id} pour le space ${spaceId}`);

  try {
    // Vérifier que le locataire existe et appartient au space
    const locataire = await prisma.locataire.findFirst({
      where: { 
        id,
        spaceId: spaceId
      },
      include: {
        baux: {
          where: { statut: 'ACTIF' }
        }
      }
    });

    if (!locataire) {
      console.log(`❌ Locataire ${id} non trouvé`);
      return res.status(404).json({
        success: false,
        error: 'Locataire non trouvé',
      });
    }
    
    // Vérifier si le locataire a des baux actifs
    if (locataire.baux && locataire.baux.length > 0) {
      console.log(`❌ Locataire ${id} a un bail actif`);
      return res.status(400).json({
        success: false,
        error: 'Impossible de supprimer un locataire avec un bail actif. Veuillez d\'abord résilier le bail.',
        code: 'LOCATAIRE_HAS_ACTIVE_BAIL'
      });
    }

    console.log(`✅ Locataire ${id} validé, début de la suppression`);

    // Supprimer le locataire - Prisma gère automatiquement la cascade avec onDelete: Cascade
    await prisma.locataire.delete({
      where: { id }
    });

    console.log(`✅ Locataire ${id} supprimé avec succès`);

    res.status(200).json({
      success: true,
      data: {},
      message: 'Locataire supprimé avec succès',
    });

  } catch (error) {
    console.error(`❌ Erreur lors de la suppression du locataire ${id}:`, error);
    console.error('Stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du locataire',
      details: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
});

module.exports = exports;
