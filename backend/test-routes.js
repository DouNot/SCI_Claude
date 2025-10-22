/**
 * Script de test pour vérifier que les routes sont bien montées
 * 
 * Usage: node test-routes.js
 */

const app = require('./server');

console.log('\n🔍 VÉRIFICATION DES ROUTES MONTÉES\n');
console.log('='.repeat(60));

// Récupérer toutes les routes montées
function printRoutes(stack, prefix = '') {
  stack.forEach((middleware) => {
    if (middleware.route) {
      // Route finale
      const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
      console.log(`✅ ${methods.padEnd(20)} ${prefix}${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      // Router imbriqué
      const path = middleware.regexp.source
        .replace('\\/?', '')
        .replace('(?=\\/|$)', '')
        .replace(/\\\//g, '/')
        .replace(/\^/g, '')
        .replace(/\$/g, '');
      
      const cleanPath = path
        .replace(/\(\?:\(\[\^\\\/\]\+\?\)\)/g, ':param')
        .replace(/\\/g, '');
      
      console.log(`\n📦 Router: ${prefix}${cleanPath}`);
      if (middleware.handle.stack) {
        printRoutes(middleware.handle.stack, prefix + cleanPath);
      }
    }
  });
}

printRoutes(app._router.stack);

console.log('\n' + '='.repeat(60));
console.log('✅ Vérification terminée\n');

// Test de connectivité
console.log('🧪 Test de connectivité...\n');

const routes = [
  'POST /api/auth/login',
  'GET /api/spaces',
  'GET /api/spaces/:spaceId/projections',
  'POST /api/spaces/:spaceId/projections',
  'GET /api/spaces/:spaceId/rapports',
  'GET /api/spaces/:spaceId/comptes-bancaires',
];

console.log('Routes critiques à vérifier :');
routes.forEach(route => {
  console.log(`  - ${route}`);
});

console.log('\n💡 Si certaines routes manquent, vérifiez :');
console.log('  1. Que les fichiers de routes existent dans src/routes/');
console.log('  2. Que les controllers sont bien exportés');
console.log('  3. Que les routes sont bien require() dans server.js');
console.log('  4. Que app.use() est bien appelé pour monter les routes\n');
