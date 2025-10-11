const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Récupérer tous les biens
// @route   GET /api/biens
// @access  Public (à sécuriser plus tard)
exports.getAllBiens = asyncHandler(async (req, res) => {
  const biens = await prisma.bien.findMany({
    include: {
      compte: true,
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
// @route   GET /api/biens/:id
// @access  Public (à sécuriser plus tard)
exports.getBienById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bien = await prisma.bien.findUnique({
    where: { id },
    include: {
      compte: true,
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
// @access  Public (à sécuriser plus tard)
exports.createBien = asyncHandler(async (req, res) => {
  const data = req.body;

  // Validation basique
  if (!data.adresse || !data.ville || !data.codePostal || !data.type || !data.surface || !data.prixAchat || !data.dateAchat) {
    return res.status(400).json({
      success: false,
      error: 'Champs requis manquants',
    });
  }

  // Nettoyer les données : convertir chaînes vides en null pour les champs numériques
  const dataToCreate = { ...data };

  // Champs numériques : convertir "" en null ou en nombre
  const numericFields = ['surface', 'nbPieces', 'nbChambres', 'etage', 'prixAchat', 'fraisNotaire', 'valeurActuelle', 'assuranceMensuelle', 'taxeFonciere'];
  
  numericFields.forEach(field => {
    if (dataToCreate[field] === '' || dataToCreate[field] === null || dataToCreate[field] === undefined) {
      dataToCreate[field] = null;
    } else if (dataToCreate[field]) {
      dataToCreate[field] = parseFloat(dataToCreate[field]);
    }
  });

  // Date : convertir en objet Date
  if (dataToCreate.dateAchat) {
    dataToCreate.dateAchat = new Date(dataToCreate.dateAchat);
  }

  // Champs texte : convertir "" en null pour description
  if (dataToCreate.description === '') {
    dataToCreate.description = null;
  }

  // Ajouter le compteId par défaut (prépare V2)
  // Vérifier si le compte existe, sinon en créer un
  let compteId = process.env.DEFAULT_COMPTE_ID;
  
  if (!compteId) {
    // Chercher un compte existant
    const compteExistant = await prisma.compte.findFirst();
    if (compteExistant) {
      compteId = compteExistant.id;
    } else {
      // Créer un utilisateur et un compte par défaut
      const user = await prisma.user.create({
        data: {
          email: 'admin@sci.fr',
          password: 'admin123',
          nom: 'Administrateur',
          prenom: 'SCI',
          role: 'ADMIN',
        },
      });
      
      const compte = await prisma.compte.create({
        data: {
          nom: 'Ma SCI',
          type: 'SCI',
          description: 'Compte principal de la SCI',
          userId: user.id,
        },
      });
      
      compteId = compte.id;
    }
  } else {
    // Vérifier que le compte existe
    const compte = await prisma.compte.findUnique({ where: { id: compteId } });
    if (!compte) {
      // Le compte dans .env n'existe pas, chercher ou créer un autre
      const compteExistant = await prisma.compte.findFirst();
      if (compteExistant) {
        compteId = compteExistant.id;
      } else {
        const user = await prisma.user.create({
          data: {
            email: 'admin@sci.fr',
            password: 'admin123',
            nom: 'Administrateur',
            prenom: 'SCI',
            role: 'ADMIN',
          },
        });
        
        const nouveauCompte = await prisma.compte.create({
          data: {
            nom: 'Ma SCI',
            type: 'SCI',
            description: 'Compte principal de la SCI',
            userId: user.id,
          },
        });
        
        compteId = nouveauCompte.id;
      }
    }
  }
  
  dataToCreate.compteId = compteId;
  
  // Le statut sera toujours LIBRE à la création (pas de bail)
  dataToCreate.statut = 'LIBRE';

  const bien = await prisma.bien.create({
    data: dataToCreate,
    include: {
      compte: true,
    },
  });

  // Créer automatiquement les charges si assuranceMensuelle ou taxeFonciere sont renseignées
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
// @access  Public (à sécuriser plus tard)
exports.updateBien = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  // Vérifier que le bien existe
  const bienExistant = await prisma.bien.findUnique({
    where: { id },
  });

  if (!bienExistant) {
    return res.status(404).json({
      success: false,
      error: 'Bien non trouvé',
    });
  }

  // Nettoyer les données : convertir chaînes vides en null pour les champs numériques
  const dataToUpdate = { ...data };

  // Champs numériques : convertir "" en null
  const numericFields = ['surface', 'nbPieces', 'nbChambres', 'etage', 'prixAchat', 'fraisNotaire', 'valeurActuelle', 'assuranceMensuelle', 'taxeFonciere'];
  
  numericFields.forEach(field => {
    if (dataToUpdate[field] === '' || dataToUpdate[field] === null || dataToUpdate[field] === undefined) {
      dataToUpdate[field] = null;
    } else if (dataToUpdate[field]) {
      dataToUpdate[field] = parseFloat(dataToUpdate[field]);
    }
  });

  // Date : convertir en objet Date si présente
  if (dataToUpdate.dateAchat && dataToUpdate.dateAchat !== '') {
    dataToUpdate.dateAchat = new Date(dataToUpdate.dateAchat);
  }

  // Champs texte : convertir "" en null pour description
  if (dataToUpdate.description === '') {
    dataToUpdate.description = null;
  }

  // Supprimer les champs qui ne doivent pas être mis à jour
  delete dataToUpdate.compteId;
  delete dataToUpdate.id;
  delete dataToUpdate.createdAt;
  delete dataToUpdate.updatedAt;

  const bien = await prisma.bien.update({
    where: { id },
    data: dataToUpdate,
    include: {
      compte: true,
      photos: true,
    },
  });

  // Synchroniser les charges avec les champs assuranceMensuelle et taxeFonciere
  // Chercher les charges existantes de type ASSURANCE_PNO et TAXE_FONCIERE pour ce bien
  const chargesExistantes = await prisma.charge.findMany({
    where: {
      bienId: id,
      type: { in: ['ASSURANCE_PNO', 'TAXE_FONCIERE'] },
    },
  });

  const chargeAssurance = chargesExistantes.find(c => c.type === 'ASSURANCE_PNO');
  const chargeTaxe = chargesExistantes.find(c => c.type === 'TAXE_FONCIERE');

  // Synchroniser l'assurance PNO
  if (bien.assuranceMensuelle && bien.assuranceMensuelle > 0) {
    if (chargeAssurance) {
      // Mettre à jour la charge existante
      await prisma.charge.update({
        where: { id: chargeAssurance.id },
        data: {
          montant: bien.assuranceMensuelle,
          estActive: true,
        },
      });
    } else {
      // Créer une nouvelle charge
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
    // Désactiver la charge si le champ est vidé
    await prisma.charge.update({
      where: { id: chargeAssurance.id },
      data: { estActive: false },
    });
  }

  // Synchroniser la taxe foncière
  if (bien.taxeFonciere && bien.taxeFonciere > 0) {
    if (chargeTaxe) {
      // Mettre à jour la charge existante
      await prisma.charge.update({
        where: { id: chargeTaxe.id },
        data: {
          montant: bien.taxeFonciere,
          estActive: true,
        },
      });
    } else {
      // Créer une nouvelle charge
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
    // Désactiver la charge si le champ est vidé
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
// @access  Public (à sécuriser plus tard)
exports.deleteBien = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Vérifier que le bien existe
  const bien = await prisma.bien.findUnique({
    where: { id },
  });

  if (!bien) {
    return res.status(404).json({
      success: false,
      error: 'Bien non trouvé',
    });
  }

  // Supprimer le bien (cascade supprimera automatiquement les relations)
  await prisma.bien.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Bien supprimé avec succès',
  });
});