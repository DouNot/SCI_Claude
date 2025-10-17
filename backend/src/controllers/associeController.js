const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Récupérer tous les associés
// @route   GET /api/associes
// @access  Public
exports.getAllAssocies = asyncHandler(async (req, res) => {
  const associes = await prisma.associe.findMany({
    where: { statut: 'ACTIF' },
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
        }
      }
    },
    orderBy: {
      pourcentage: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    count: associes.length,
    data: associes,
  });
});

// @desc    Récupérer les associés d'un space
// @route   GET /api/associes/space/:spaceId
// @access  Public
exports.getAssociesBySpace = asyncHandler(async (req, res) => {
  const { spaceId } = req.params;

  const associes = await prisma.associe.findMany({
    where: { 
      spaceId,
      statut: 'ACTIF'
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          nom: true,
          prenom: true,
        }
      }
    },
    orderBy: {
      pourcentage: 'desc',
    },
  });

  // Calculer le total des parts
  const totalPourcentage = associes.reduce((sum, a) => sum + parseFloat(a.pourcentage), 0);

  res.status(200).json({
    success: true,
    count: associes.length,
    totalPourcentage,
    data: associes,
  });
});

// @desc    Récupérer un associé par ID
// @route   GET /api/associes/:id
// @access  Public
exports.getAssocieById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const associe = await prisma.associe.findUnique({
    where: { id },
    include: {
      space: true,
      user: {
        select: {
          id: true,
          email: true,
          nom: true,
          prenom: true,
        }
      }
    },
  });

  if (!associe) {
    return res.status(404).json({
      success: false,
      error: 'Associé non trouvé',
    });
  }

  res.status(200).json({
    success: true,
    data: associe,
  });
});

// @desc    Créer un nouvel associé
// @route   POST /api/associes
// @access  Public
exports.createAssocie = asyncHandler(async (req, res) => {
  const data = req.body;

  // Validation basique
  if (!data.nom || !data.prenom || !data.nombreParts) {
    return res.status(400).json({
      success: false,
      error: 'Champs requis manquants (nom, prenom, nombreParts)',
    });
  }

  // Nettoyer les données
  const dataToCreate = { ...data };

  // Trouver un Space par défaut si non fourni
  if (!dataToCreate.spaceId) {
    const spaceExistant = await prisma.space.findFirst({
      where: { type: 'SCI' }
    });
    
    if (!spaceExistant) {
      return res.status(400).json({
        success: false,
        error: 'Aucun Space SCI trouvé. Créez d\'abord une SCI.'
      });
    }
    
    dataToCreate.spaceId = spaceExistant.id;
  }

  // Convertir en nombres
  dataToCreate.nombreParts = parseInt(dataToCreate.nombreParts);
  
  // Récupérer le Space pour calculer le pourcentage
  const space = await prisma.space.findUnique({
    where: { id: dataToCreate.spaceId }
  });

  if (!space.capitalSocial) {
    return res.status(400).json({
      success: false,
      error: 'Le capital social de la SCI doit être défini'
    });
  }

  // Calculer le pourcentage
  dataToCreate.pourcentage = (dataToCreate.nombreParts / space.capitalSocial) * 100;

  // Champs optionnels
  if (dataToCreate.email === '') dataToCreate.email = null;
  if (dataToCreate.telephone === '') dataToCreate.telephone = null;
  if (dataToCreate.valeurNominale) dataToCreate.valeurNominale = parseFloat(dataToCreate.valeurNominale);
  if (dataToCreate.soldeCCA) dataToCreate.soldeCCA = parseFloat(dataToCreate.soldeCCA);

  // Date d'entrée par défaut
  if (!dataToCreate.dateEntree) {
    dataToCreate.dateEntree = new Date();
  } else {
    dataToCreate.dateEntree = new Date(dataToCreate.dateEntree);
  }

  // Statut par défaut
  dataToCreate.statut = 'ACTIF';

  // Vérifier que le total des parts ne dépasse pas le capital social
  const associesExistants = await prisma.associe.findMany({
    where: { 
      spaceId: dataToCreate.spaceId,
      statut: 'ACTIF'
    },
  });

  const totalParts = associesExistants.reduce((sum, a) => sum + a.nombreParts, 0);
  const nouveauTotal = totalParts + dataToCreate.nombreParts;

  if (nouveauTotal > space.capitalSocial) {
    return res.status(400).json({
      success: false,
      error: `Le total des parts dépasserait le capital social (${space.capitalSocial}) - Actuellement: ${totalParts}, vous tentez d'ajouter: ${dataToCreate.nombreParts}`,
    });
  }

  const associe = await prisma.associe.create({
    data: dataToCreate,
    include: {
      space: true,
      user: {
        select: {
          id: true,
          email: true,
          nom: true,
          prenom: true,
        }
      }
    },
  });

  res.status(201).json({
    success: true,
    message: 'Associé créé avec succès',
    data: associe,
  });
});

// @desc    Mettre à jour un associé
// @route   PUT /api/associes/:id
// @access  Public
exports.updateAssocie = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const associeExistant = await prisma.associe.findUnique({
    where: { id },
    include: {
      space: true
    }
  });

  if (!associeExistant) {
    return res.status(404).json({
      success: false,
      error: 'Associé non trouvé',
    });
  }

  const dataToUpdate = { ...data };

  // Convertir nombreParts si présent
  if (dataToUpdate.nombreParts) {
    dataToUpdate.nombreParts = parseInt(dataToUpdate.nombreParts);

    // Recalculer le pourcentage
    dataToUpdate.pourcentage = (dataToUpdate.nombreParts / associeExistant.space.capitalSocial) * 100;

    // Vérifier que le total des parts ne dépasse pas le capital social
    const associesExistants = await prisma.associe.findMany({
      where: { 
        spaceId: associeExistant.spaceId,
        statut: 'ACTIF',
        id: { not: id } // Exclure l'associé en cours de modification
      },
    });

    const totalParts = associesExistants.reduce((sum, a) => sum + a.nombreParts, 0);
    const nouveauTotal = totalParts + dataToUpdate.nombreParts;

    if (nouveauTotal > associeExistant.space.capitalSocial) {
      return res.status(400).json({
        success: false,
        error: `Le total des parts dépasserait le capital social (${associeExistant.space.capitalSocial}) - Autres associés: ${totalParts}, vous tentez de mettre: ${dataToUpdate.nombreParts}`,
      });
    }
  }

  // Champs optionnels
  if (dataToUpdate.email === '') dataToUpdate.email = null;
  if (dataToUpdate.telephone === '') dataToUpdate.telephone = null;
  if (dataToUpdate.valeurNominale) dataToUpdate.valeurNominale = parseFloat(dataToUpdate.valeurNominale);
  if (dataToUpdate.soldeCCA !== undefined) dataToUpdate.soldeCCA = parseFloat(dataToUpdate.soldeCCA);

  // Dates
  if (dataToUpdate.dateEntree) dataToUpdate.dateEntree = new Date(dataToUpdate.dateEntree);
  if (dataToUpdate.dateSortie) dataToUpdate.dateSortie = new Date(dataToUpdate.dateSortie);

  // Supprimer champs non modifiables
  delete dataToUpdate.spaceId;
  delete dataToUpdate.compteId;
  delete dataToUpdate.id;
  delete dataToUpdate.createdAt;
  delete dataToUpdate.updatedAt;

  const associe = await prisma.associe.update({
    where: { id },
    data: dataToUpdate,
    include: {
      space: true,
      user: {
        select: {
          id: true,
          email: true,
          nom: true,
          prenom: true,
        }
      }
    },
  });

  res.status(200).json({
    success: true,
    message: 'Associé mis à jour',
    data: associe,
  });
});

// @desc    Supprimer un associé (soft delete - marquer comme SORTI)
// @route   DELETE /api/associes/:id
// @access  Public
exports.deleteAssocie = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const associe = await prisma.associe.findUnique({
    where: { id },
  });

  if (!associe) {
    return res.status(404).json({
      success: false,
      error: 'Associé non trouvé',
    });
  }

  // Soft delete : marquer comme SORTI
  await prisma.associe.update({
    where: { id },
    data: {
      statut: 'SORTI',
      dateSortie: new Date()
    }
  });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Associé marqué comme sorti avec succès',
  });
});
