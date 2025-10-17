/**
 * Script de Migration : Ancien modèle → Nouveau modèle Space
 * 
 * Ce script migre les données de l'ancien système (User/Compte) 
 * vers le nouveau système (User/Space/SpaceMember)
 * 
 * IMPORTANT : Faire une sauvegarde de la base de données avant d'exécuter !
 * 
 * Étapes :
 * 1. Créer les nouveaux Spaces à partir des Comptes
 * 2. Créer les SpaceMembers pour donner accès
 * 3. Migrer les Associés
 * 4. Migrer les Biens et leurs relations
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function migrate() {
  console.log('🚀 Début de la migration...\n');

  try {
    // ============================================
    // ÉTAPE 1 : Migrer les Users
    // ============================================
    console.log('📝 Étape 1 : Migration des utilisateurs...');
    
    const oldUsers = await prisma.user.findMany();
    
    for (const oldUser of oldUsers) {
      console.log(`  → Migration user: ${oldUser.email}`);
      
      // Le User existe déjà, on met juste à jour le champ password → passwordHash
      // Note: Dans le nouveau schéma, on utilise passwordHash au lieu de password
      await prisma.user.update({
        where: { id: oldUser.id },
        data: {
          passwordHash: oldUser.password // Renommer le champ
        }
      });
      
      // Créer un espace personnel pour chaque utilisateur
      const personalSpace = await prisma.space.create({
        data: {
          type: 'PERSONAL',
          nom: 'Espace Personnel',
          slug: `personal-${oldUser.id}`,
          statut: 'ACTIVE'
        }
      });
      
      // Ajouter l'utilisateur comme OWNER de son espace personnel
      await prisma.spaceMember.create({
        data: {
          spaceId: personalSpace.id,
          userId: oldUser.id,
          role: 'OWNER',
          statut: 'ACTIVE'
        }
      });
      
      // Mettre à jour lastSpaceId
      await prisma.user.update({
        where: { id: oldUser.id },
        data: { lastSpaceId: personalSpace.id }
      });
      
      console.log(`    ✓ Espace personnel créé`);
    }
    
    console.log(`✅ ${oldUsers.length} utilisateurs migrés\n`);

    // ============================================
    // ÉTAPE 2 : Migrer les Comptes → Spaces (SCI)
    // ============================================
    console.log('📝 Étape 2 : Migration des Comptes vers Spaces...');
    
    const oldComptes = await prisma.compte.findMany({
      include: {
        user: true,
        associes: true
      }
    });
    
    const compteToSpaceMap = new Map();
    
    for (const compte of oldComptes) {
      console.log(`  → Migration compte: ${compte.nom}`);
      
      // Créer un Space de type SCI pour chaque Compte
      const space = await prisma.space.create({
        data: {
          type: 'SCI',
          nom: compte.nom,
          slug: `sci-${compte.nom.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
          statut: 'ACTIVE',
          // Vous pouvez ajouter d'autres champs si vous les avez dans une table séparée
        }
      });
      
      compteToSpaceMap.set(compte.id, space.id);
      
      // Créer un SpaceMember OWNER pour l'utilisateur qui a créé le compte
      await prisma.spaceMember.create({
        data: {
          spaceId: space.id,
          userId: compte.userId,
          role: 'OWNER',
          statut: 'ACTIVE'
        }
      });
      
      // Mettre à jour lastSpaceId de l'utilisateur pour pointer vers cette SCI
      await prisma.user.update({
        where: { id: compte.userId },
        data: { lastSpaceId: space.id }
      });
      
      console.log(`    ✓ Space SCI créé: ${space.id}`);
    }
    
    console.log(`✅ ${oldComptes.length} comptes migrés vers Spaces\n`);

    // ============================================
    // ÉTAPE 3 : Migrer les Associés
    // ============================================
    console.log('📝 Étape 3 : Migration des Associés...');
    
    for (const compte of oldComptes) {
      const spaceId = compteToSpaceMap.get(compte.id);
      
      for (const associe of compte.associes) {
        console.log(`  → Migration associé: ${associe.nom} ${associe.prenom}`);
        
        // Transformer pourcentageParts en nombreParts
        // On suppose un capital social de 1000 par défaut
        const capitalSocial = 1000;
        const nombreParts = Math.round((associe.pourcentageParts / 100) * capitalSocial);
        
        await prisma.associe.create({
          data: {
            spaceId: spaceId,
            userId: null, // Les anciens associés n'ont pas de compte User
            nom: associe.nom,
            prenom: associe.prenom,
            email: associe.email,
            telephone: associe.telephone,
            type: 'PERSONNE_PHYSIQUE',
            nombreParts: nombreParts,
            pourcentage: associe.pourcentageParts,
            dateEntree: new Date(), // Date par défaut
            statut: 'ACTIF'
          }
        });
      }
    }
    
    console.log(`✅ Associés migrés\n`);

    // ============================================
    // ÉTAPE 4 : Migrer les Biens
    // ============================================
    console.log('📝 Étape 4 : Migration des Biens...');
    
    const oldBiens = await prisma.bien.findMany();
    
    for (const bien of oldBiens) {
      const spaceId = compteToSpaceMap.get(bien.compteId);
      
      if (!spaceId) {
        console.log(`  ⚠️  Bien ${bien.id} : Compte introuvable, skip`);
        continue;
      }
      
      console.log(`  → Migration bien: ${bien.adresse}`);
      
      await prisma.bien.update({
        where: { id: bien.id },
        data: {
          spaceId: spaceId
        }
      });
    }
    
    console.log(`✅ ${oldBiens.length} biens migrés\n`);

    // ============================================
    // ÉTAPE 5 : Migrer Contacts, Notifications, AG
    // ============================================
    console.log('📝 Étape 5 : Migration des Contacts, Notifications, AG...');
    
    // Contacts
    const contacts = await prisma.contact.findMany();
    for (const contact of contacts) {
      const spaceId = compteToSpaceMap.get(contact.compteId);
      if (spaceId) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: { spaceId }
        });
      }
    }
    
    // Notifications
    const notifications = await prisma.notification.findMany();
    for (const notif of notifications) {
      const spaceId = compteToSpaceMap.get(notif.compteId);
      if (spaceId) {
        await prisma.notification.update({
          where: { id: notif.id },
          data: { spaceId }
        });
      }
    }
    
    // Assemblées Générales
    const ags = await prisma.assembleeGenerale.findMany();
    for (const ag of ags) {
      const spaceId = compteToSpaceMap.get(ag.compteId);
      if (spaceId) {
        await prisma.assembleeGenerale.update({
          where: { id: ag.id },
          data: { spaceId }
        });
      }
    }
    
    console.log(`✅ Contacts, Notifications, AG migrés\n`);

    // ============================================
    // ÉTAPE 6 : Nettoyer les anciennes données
    // ============================================
    console.log('📝 Étape 6 : Nettoyage des anciennes données...');
    
    // ATTENTION : Ne supprimez les anciennes tables que si vous êtes sûr
    // Pour l'instant, on les garde pour vérification
    console.log(`  ℹ️  Les anciennes données (Compte) sont conservées pour vérification`);
    console.log(`  ℹ️  Une fois la migration validée, vous pourrez supprimer la table Compte\n`);

    console.log('🎉 Migration terminée avec succès !');
    console.log('\nProchaines étapes :');
    console.log('1. Vérifiez les données dans Prisma Studio');
    console.log('2. Testez l\'application avec le nouveau modèle');
    console.log('3. Une fois validé, supprimez l\'ancien modèle Compte');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
migrate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
