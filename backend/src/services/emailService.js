/**
 * Service d'envoi d'emails pour les invitations
 * 
 * Pour l'instant en mode SIMULATION (console.log)
 * En production, utiliser un service comme SendGrid, Mailgun, AWS SES, etc.
 */

/**
 * Envoyer un email d'invitation
 */
async function sendInvitationEmail({ 
  to, 
  inviterName, 
  spaceName, 
  spaceType,
  role, 
  invitationLink 
}) {
  // TODO: Implémenter avec un vrai service d'email
  // Pour l'instant, on simule l'envoi
  
  console.log('\n📧 ═══════════════════════════════════════════════════');
  console.log('📨 EMAIL D\'INVITATION');
  console.log('═══════════════════════════════════════════════════\n');
  console.log(`À: ${to}`);
  console.log(`De: ${inviterName || 'SCI Cloud'}`);
  console.log(`Sujet: Invitation à rejoindre "${spaceName}"\n`);
  console.log('─────────────────────────────────────────────────────');
  console.log(`Bonjour,\n`);
  console.log(`${inviterName} vous invite à rejoindre l'espace "${spaceName}" sur SCI Cloud.`);
  console.log(`Type d'espace: ${spaceType === 'SCI' ? 'SCI' : 'Personnel'}`);
  console.log(`Votre rôle: ${getRoleLabel(role)}\n`);
  console.log(`Pour accepter cette invitation, cliquez sur le lien ci-dessous :`);
  console.log(`\n🔗 ${invitationLink}\n`);
  console.log(`Cette invitation est valable pendant 7 jours.\n`);
  console.log(`À bientôt sur SCI Cloud !`);
  console.log('═══════════════════════════════════════════════════\n');
  
  return {
    success: true,
    messageId: `mock-${Date.now()}`,
    mode: 'SIMULATION'
  };
}

/**
 * Envoyer un rappel d'invitation
 */
async function sendInvitationReminderEmail({ 
  to, 
  inviterName, 
  spaceName, 
  invitationLink 
}) {
  console.log('\n📧 ═══════════════════════════════════════════════════');
  console.log('📨 RAPPEL D\'INVITATION');
  console.log('═══════════════════════════════════════════════════\n');
  console.log(`À: ${to}`);
  console.log(`De: ${inviterName || 'SCI Cloud'}`);
  console.log(`Sujet: Rappel: Invitation à rejoindre "${spaceName}"\n`);
  console.log('─────────────────────────────────────────────────────');
  console.log(`Bonjour,\n`);
  console.log(`Ceci est un rappel concernant votre invitation à rejoindre "${spaceName}".`);
  console.log(`\n🔗 ${invitationLink}\n`);
  console.log(`Cette invitation expirera bientôt.\n`);
  console.log(`À bientôt sur SCI Cloud !`);
  console.log('═══════════════════════════════════════════════════\n');
  
  return {
    success: true,
    messageId: `mock-reminder-${Date.now()}`,
    mode: 'SIMULATION'
  };
}

/**
 * Obtenir le label d'un rôle
 */
function getRoleLabel(role) {
  const labels = {
    'OWNER': 'Propriétaire (accès complet)',
    'MANAGER': 'Gestionnaire (gestion quotidienne)',
    'ACCOUNTANT': 'Comptable (finances)',
    'VIEWER': 'Observateur (lecture seule)',
    'MEMBER': 'Membre (accès standard)'
  };
  return labels[role] || role;
}

/**
 * Configuration pour un vrai service d'email (exemple avec SendGrid)
 * 
 * Pour activer en production:
 * 1. Installer: npm install @sendgrid/mail
 * 2. Ajouter SENDGRID_API_KEY dans .env
 * 3. Décommenter le code ci-dessous
 */

/*
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendInvitationEmailProduction({ 
  to, 
  inviterName, 
  spaceName, 
  spaceType,
  role, 
  invitationLink 
}) {
  const msg = {
    to,
    from: process.env.EMAIL_FROM || 'noreply@scicloud.fr',
    subject: `Invitation à rejoindre "${spaceName}"`,
    text: `
      Bonjour,

      ${inviterName} vous invite à rejoindre l'espace "${spaceName}" sur SCI Cloud.
      Type d'espace: ${spaceType === 'SCI' ? 'SCI' : 'Personnel'}
      Votre rôle: ${getRoleLabel(role)}

      Pour accepter cette invitation, cliquez sur le lien ci-dessous :
      ${invitationLink}

      Cette invitation est valable pendant 7 jours.

      À bientôt sur SCI Cloud !
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Invitation à rejoindre "${spaceName}"</h2>
        <p>Bonjour,</p>
        <p><strong>${inviterName}</strong> vous invite à rejoindre l'espace <strong>"${spaceName}"</strong> sur SCI Cloud.</p>
        <ul>
          <li><strong>Type d'espace:</strong> ${spaceType === 'SCI' ? 'SCI' : 'Personnel'}</li>
          <li><strong>Votre rôle:</strong> ${getRoleLabel(role)}</li>
        </ul>
        <p>
          <a href="${invitationLink}" 
             style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Accepter l'invitation
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">Cette invitation est valable pendant 7 jours.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #666; font-size: 12px;">À bientôt sur SCI Cloud !</p>
      </div>
    `
  };

  const result = await sgMail.send(msg);
  return {
    success: true,
    messageId: result[0].headers['x-message-id'],
    mode: 'PRODUCTION'
  };
}
*/

module.exports = {
  sendInvitationEmail,
  sendInvitationReminderEmail,
  getRoleLabel
};
