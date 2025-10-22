const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { requireAuth, generateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Générer un slug unique pour un espace
 */
function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
    .replace(/[^a-z0-9]+/g, '-')     // Remplacer non-alphanumériques par -
    .replace(/^-+|-+$/g, '');        // Retirer - au début/fin
}

/**
 * POST /api/auth/signup
 * Créer un nouveau compte utilisateur
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, nom, prenom } = req.body;
    
    console.log('📝 Tentative de création de compte:', { email, nom, prenom });
    console.log('🔍 Type de email:', typeof email, 'Valeur:', JSON.stringify(email));
    
    // Validation des champs
    if (!email || !password) {
      console.log('❌ Validation échouée: email ou password manquant');
      return res.status(400).json({ 
        error: 'Email et mot de passe requis',
        code: 'VALIDATION_ERROR'
      });
    }
    
    if (password.length < 8) {
      console.log('❌ Validation échouée: mot de passe trop court');
      return res.status(400).json({ 
        error: 'Le mot de passe doit contenir au moins 8 caractères',
        code: 'PASSWORD_TOO_SHORT'
      });
    }
    
    // Nettoyer l'email (enlever les guillemets si présents)
    const cleanEmail = email.replace(/"/g, '').toLowerCase().trim();
    console.log('✅ Email nettoyé:', cleanEmail);
    
    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });
    
    if (existingUser) {
      console.log('❌ Email déjà utilisé:', cleanEmail);
      return res.status(400).json({ 
        error: 'Cet email est déjà utilisé',
        code: 'EMAIL_ALREADY_EXISTS'
      });
    }
    
    // Hash du mot de passe
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Créer l'utilisateur + espace personnel en transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Créer l'utilisateur
      const user = await tx.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          nom: nom || '',
          prenom: prenom || '',
          emailVerified: false
        }
      });
      
      console.log('✅ Utilisateur créé:', user.id);
      
      // 2. Créer l'espace personnel
      const personalSpace = await tx.space.create({
        data: {
          type: 'PERSONAL',
          nom: 'Espace Personnel',
          slug: generateSlug(`personal-${user.id}`),
          statut: 'ACTIVE'
        }
      });
      
      console.log('✅ Espace personnel créé:', personalSpace.id);
      
      // 3. Ajouter l'utilisateur comme OWNER de son espace personnel
      await tx.spaceMember.create({
        data: {
          spaceId: personalSpace.id,
          userId: user.id,
          role: 'OWNER',
          statut: 'ACTIVE'
        }
      });
      
      // 4. Mettre à jour lastSpaceId
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { lastSpaceId: personalSpace.id },
        select: {
          id: true,
          email: true,
          nom: true,
          prenom: true,
          lastSpaceId: true,
          emailVerified: true
        }
      });
      
      return { user: updatedUser, personalSpace };
    });
    
    // Générer le token JWT
    const token = generateToken(result.user.id);
    
    console.log('✅ Compte créé avec succès:', result.user.email);
    
    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      user: result.user
    });
    
  } catch (error) {
    console.error('❌ Erreur signup:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Erreur lors de la création du compte',
      code: 'SERVER_ERROR',
      details: error.message
    });
  }
});

/**
 * POST /api/auth/login
 * Se connecter
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email et mot de passe requis',
        code: 'VALIDATION_ERROR'
      });
    }
    
    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        nom: true,
        prenom: true,
        lastSpaceId: true,
        emailVerified: true
      }
    });
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    
    if (!validPassword) {
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Générer le token JWT
    const token = generateToken(user.id);
    
    // Ne pas renvoyer le passwordHash
    const { passwordHash, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Connexion réussie',
      token,
      user: userWithoutPassword
    });
    
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la connexion',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /api/auth/me
 * Récupérer les informations de l'utilisateur connecté
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    // L'utilisateur est déjà dans req.user grâce au middleware
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        lastSpaceId: true,
        emailVerified: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      });
    }
    
    res.json(user);
    
  } catch (error) {
    console.error('Erreur /me:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération du profil',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * PATCH /api/auth/me
 * Mettre à jour le profil utilisateur
 */
router.patch('/me', requireAuth, async (req, res) => {
  try {
    const { nom, prenom } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(nom !== undefined && { nom }),
        ...(prenom !== undefined && { prenom })
      },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        lastSpaceId: true,
        emailVerified: true
      }
    });
    
    res.json({
      message: 'Profil mis à jour',
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Erreur update profile:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour du profil',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/auth/change-password
 * Changer le mot de passe
 */
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Mot de passe actuel et nouveau mot de passe requis',
        code: 'VALIDATION_ERROR'
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'Le nouveau mot de passe doit contenir au moins 8 caractères',
        code: 'PASSWORD_TOO_SHORT'
      });
    }
    
    // Récupérer l'utilisateur avec le hash
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, passwordHash: true }
    });
    
    // Vérifier le mot de passe actuel
    const validPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    
    if (!validPassword) {
      return res.status(401).json({ 
        error: 'Mot de passe actuel incorrect',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }
    
    // Hash du nouveau mot de passe
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    
    // Mettre à jour
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newPasswordHash }
    });
    
    res.json({
      message: 'Mot de passe modifié avec succès'
    });
    
  } catch (error) {
    console.error('Erreur change password:', error);
    res.status(500).json({ 
      error: 'Erreur lors du changement de mot de passe',
      code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
