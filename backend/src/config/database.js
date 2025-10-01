const { PrismaClient } = require('@prisma/client');

// Initialiser Prisma Client
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Logs pour debug
});

module.exports = prisma;