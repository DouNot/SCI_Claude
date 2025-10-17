const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Récupérer tous les contacts
// @route   GET /api/contacts
// @access  Public
exports.getAllContacts = asyncHandler(async (req, res) => {
  const contacts = await prisma.contact.findMany({
    include: {
      space: {
        select: {
          id: true,
          nom: true,
          type: true
        }
      }
    },
    orderBy: {
      nom: 'asc',
    },
  });

  res.status(200).json({
    success: true,
    count: contacts.length,
    data: contacts,
  });
});

// @desc    Récupérer les contacts par type
// @route   GET /api/contacts/type/:type
// @access  Public
exports.getContactsByType = asyncHandler(async (req, res) => {
  const { type } = req.params;

  const contacts = await prisma.contact.findMany({
    where: { type },
    include: {
      space: {
        select: {
          id: true,
          nom: true,
          type: true
        }
      }
    },
    orderBy: {
      nom: 'asc',
    },
  });

  res.status(200).json({
    success: true,
    count: contacts.length,
    data: contacts,
  });
});

// @desc    Récupérer les contacts d'un space
// @route   GET /api/contacts/space/:spaceId
// @access  Public
exports.getContactsBySpace = asyncHandler(async (req, res) => {
  const { spaceId } = req.params;

  const contacts = await prisma.contact.findMany({
    where: { spaceId },
    orderBy: {
      nom: 'asc',
    },
  });

  res.status(200).json({
    success: true,
    count: contacts.length,
    data: contacts,
  });
});

// @desc    Récupérer un contact par ID
// @route   GET /api/contacts/:id
// @access  Public
exports.getContactById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      space: true
    }
  });

  if (!contact) {
    return res.status(404).json({
      success: false,
      error: 'Contact non trouvé',
    });
  }

  res.status(200).json({
    success: true,
    data: contact,
  });
});

// @desc    Créer un nouveau contact
// @route   POST /api/contacts
// @access  Public
exports.createContact = asyncHandler(async (req, res) => {
  const data = req.body;

  // Validation basique
  if (!data.nom || !data.type) {
    return res.status(400).json({
      success: false,
      error: 'Champs requis manquants (nom, type)',
    });
  }

  // Nettoyer les données
  const dataToCreate = { ...data };

  // Champs optionnels
  if (dataToCreate.prenom === '') dataToCreate.prenom = null;
  if (dataToCreate.entreprise === '') dataToCreate.entreprise = null;
  if (dataToCreate.email === '') dataToCreate.email = null;
  if (dataToCreate.telephone === '') dataToCreate.telephone = null;
  if (dataToCreate.adresse === '') dataToCreate.adresse = null;
  if (dataToCreate.siteWeb === '') dataToCreate.siteWeb = null;
  if (dataToCreate.notes === '') dataToCreate.notes = null;
  
  // Evaluation (note sur 5)
  if (dataToCreate.evaluation === '' || !dataToCreate.evaluation) {
    dataToCreate.evaluation = null;
  } else {
    dataToCreate.evaluation = parseInt(dataToCreate.evaluation);
  }

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

  const contact = await prisma.contact.create({
    data: dataToCreate,
    include: {
      space: true
    }
  });

  res.status(201).json({
    success: true,
    message: 'Contact créé avec succès',
    data: contact,
  });
});

// @desc    Mettre à jour un contact
// @route   PUT /api/contacts/:id
// @access  Public
exports.updateContact = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const contactExistant = await prisma.contact.findUnique({
    where: { id },
  });

  if (!contactExistant) {
    return res.status(404).json({
      success: false,
      error: 'Contact non trouvé',
    });
  }

  const dataToUpdate = { ...data };

  // Champs optionnels
  if (dataToUpdate.prenom === '') dataToUpdate.prenom = null;
  if (dataToUpdate.entreprise === '') dataToUpdate.entreprise = null;
  if (dataToUpdate.email === '') dataToUpdate.email = null;
  if (dataToUpdate.telephone === '') dataToUpdate.telephone = null;
  if (dataToUpdate.adresse === '') dataToUpdate.adresse = null;
  if (dataToUpdate.siteWeb === '') dataToUpdate.siteWeb = null;
  if (dataToUpdate.notes === '') dataToUpdate.notes = null;
  
  if (dataToUpdate.evaluation === '' || !dataToUpdate.evaluation) {
    dataToUpdate.evaluation = null;
  } else if (dataToUpdate.evaluation) {
    dataToUpdate.evaluation = parseInt(dataToUpdate.evaluation);
  }

  // Supprimer champs non modifiables
  delete dataToUpdate.spaceId;
  delete dataToUpdate.compteId;
  delete dataToUpdate.id;
  delete dataToUpdate.createdAt;
  delete dataToUpdate.updatedAt;

  const contact = await prisma.contact.update({
    where: { id },
    data: dataToUpdate,
    include: {
      space: true
    }
  });

  res.status(200).json({
    success: true,
    message: 'Contact mis à jour',
    data: contact,
  });
});

// @desc    Supprimer un contact
// @route   DELETE /api/contacts/:id
// @access  Public
exports.deleteContact = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const contact = await prisma.contact.findUnique({
    where: { id },
  });

  if (!contact) {
    return res.status(404).json({
      success: false,
      error: 'Contact non trouvé',
    });
  }

  await prisma.contact.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Contact supprimé avec succès',
  });
});
