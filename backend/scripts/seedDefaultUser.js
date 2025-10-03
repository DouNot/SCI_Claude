const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Créer un utilisateur par défaut
  const user = await prisma.user.create({
    data: {
      email: 'admin@sci-claude.fr',
      password: 'temporary-password', // Sera utilisé en V2
      nom: 'Admin',
      prenom: 'SCI',
      role: 'ADMIN',
    },
  });

  console.log('✅ User créé:', user);

  // Créer un compte SCI par défaut
  const compte = await prisma.compte.create({
    data: {
      nom: 'Ma SCI',
      type: 'SCI',
      description: 'Compte principal SCI Claude',
      userId: user.id,
    },
  });

  console.log('✅ Compte créé:', compte);
  console.log('\n📝 Notez ces IDs pour la suite:');
  console.log('USER_ID:', user.id);
  console.log('COMPTE_ID:', compte.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });