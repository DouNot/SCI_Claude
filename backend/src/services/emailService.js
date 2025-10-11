/**
 * Service d'envoi d'emails
 * Gère l'envoi des quittances et autres documents par email
 */

const nodemailer = require('nodemailer');
const config = require('../config/database');

/**
 * Configuration du transporteur email
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true pour le port 465, false pour les autres
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Envoyer une quittance par email
 * @param {Object} options - Options d'envoi
 * @param {string} options.to - Email du destinataire
 * @param {string} options.locataireName - Nom du locataire
 * @param {string} options.periode - Période (ex: "Octobre 2025")
 * @param {string} options.montant - Montant formaté
 * @param {Buffer} options.pdfBuffer - Buffer du PDF
 * @param {string} options.filename - Nom du fichier PDF
 */
exports.envoyerQuittance = async (options) => {
  const { to, locataireName, periode, montant, pdfBuffer, filename } = options;

  const transporter = createTransporter();

  // Template HTML de l'email
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #2563eb;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #f8fafc;
          padding: 30px;
          border: 1px solid #e2e8f0;
          border-top: none;
          border-radius: 0 0 5px 5px;
        }
        .highlight {
          background-color: #dbeafe;
          padding: 15px;
          border-left: 4px solid #2563eb;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          font-size: 12px;
          color: #64748b;
          text-align: center;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #10b981;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Quittance de Loyer</h1>
      </div>
      <div class="content">
        <p>Bonjour ${locataireName},</p>
        
        <p>Nous vous adressons ci-joint votre quittance de loyer pour la période de <strong>${periode}</strong>.</p>
        
        <div class="highlight">
          <strong>Montant total :</strong> ${montant}<br>
          <strong>Période :</strong> ${periode}
        </div>
        
        <p>Vous trouverez votre quittance en pièce jointe de cet email au format PDF.</p>
        
        <p>Ce document vous est fourni gratuitement conformément à la législation en vigueur.</p>
        
        <p>Cordialement,<br>
        ${process.env.COMPANY_NAME || 'SCI Claude'}</p>
      </div>
      <div class="footer">
        <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        <p>Pour toute question, contactez-nous à ${process.env.EMAIL_CONTACT || process.env.EMAIL_USER}</p>
      </div>
    </body>
    </html>
  `;

  // Version texte brut (fallback)
  const textContent = `
Bonjour ${locataireName},

Nous vous adressons ci-joint votre quittance de loyer pour la période de ${periode}.

Montant total : ${montant}
Période : ${periode}

Vous trouverez votre quittance en pièce jointe de cet email au format PDF.

Ce document vous est fourni gratuitement conformément à la législation en vigueur.

Cordialement,
${process.env.COMPANY_NAME || 'SCI Claude'}

---
Cet email a été envoyé automatiquement, merci de ne pas y répondre.
Pour toute question, contactez-nous à ${process.env.EMAIL_CONTACT || process.env.EMAIL_USER}
  `;

  // Options de l'email
  const mailOptions = {
    from: `"${process.env.COMPANY_NAME || 'SCI Claude'}" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: `Quittance de loyer - ${periode}`,
    text: textContent,
    html: htmlContent,
    attachments: [
      {
        filename: filename,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  // Envoyer l'email
  try {
    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw new Error(`Erreur d'envoi email: ${error.message}`);
  }
};

/**
 * Envoyer un email de relance pour impayé
 */
exports.envoyerRelance = async (options) => {
  const { to, locataireName, periode, montant, joursRetard } = options;

  const transporter = createTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #f59e0b;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #fff;
          padding: 30px;
          border: 1px solid #e2e8f0;
          border-top: none;
          border-radius: 0 0 5px 5px;
        }
        .warning {
          background-color: #fef3c7;
          padding: 15px;
          border-left: 4px solid #f59e0b;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          font-size: 12px;
          color: #64748b;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Rappel de Paiement</h1>
      </div>
      <div class="content">
        <p>Bonjour ${locataireName},</p>
        
        <p>Nous constatons que le loyer du mois de <strong>${periode}</strong> n'a pas encore été réglé.</p>
        
        <div class="warning">
          <strong>⚠️ Paiement en attente</strong><br>
          Montant dû : ${montant}<br>
          Retard : ${joursRetard} jour(s)
        </div>
        
        <p>Nous vous remercions de bien vouloir régulariser votre situation dans les plus brefs délais.</p>
        
        <p>Si vous avez déjà effectué ce paiement, veuillez ne pas tenir compte de ce message.</p>
        
        <p>Cordialement,<br>
        ${process.env.COMPANY_NAME || 'SCI Claude'}</p>
      </div>
      <div class="footer">
        <p>Pour toute question, contactez-nous à ${process.env.EMAIL_CONTACT || process.env.EMAIL_USER}</p>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Bonjour ${locataireName},

Nous constatons que le loyer du mois de ${periode} n'a pas encore été réglé.

Montant dû : ${montant}
Retard : ${joursRetard} jour(s)

Nous vous remercions de bien vouloir régulariser votre situation dans les plus brefs délais.

Si vous avez déjà effectué ce paiement, veuillez ne pas tenir compte de ce message.

Cordialement,
${process.env.COMPANY_NAME || 'SCI Claude'}
  `;

  const mailOptions = {
    from: `"${process.env.COMPANY_NAME || 'SCI Claude'}" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: `Rappel de paiement - Loyer ${periode}`,
    text: textContent,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la relance:', error);
    throw new Error(`Erreur d'envoi relance: ${error.message}`);
  }
};

/**
 * Tester la configuration email
 */
exports.testerConfiguration = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return { success: true, message: 'Configuration email valide' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
