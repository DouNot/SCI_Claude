/**
 * Templates réutilisables pour les composants PDF - Version classique
 * Sans emojis ni caractères spéciaux
 */

const config = require('./pdfConfig');
const { formatDate } = require('./pdfHelpers');

/**
 * Dessine un en-tête simple et classique avec statut de paiement
 */
exports.drawHeader = (doc, title, subtitle = null, statutPaiement = null) => {
  const { colors, fonts, fontSizes, company } = config;
  
  // Rectangle de fond sobre
  doc.rect(0, 0, 595, 90).fill(colors.secondaryLight);
  
  // Ligne de couleur en haut
  doc.rect(0, 0, 595, 4).fill(colors.primary);
  
  // Titre principal
  doc.fontSize(fontSizes.xxlarge)
     .font(fonts.bold)
     .fillColor(colors.text)
     .text(title, 50, 30);
  
  // Statut de paiement sous le titre (GRAND et COLORÉ)
  if (statutPaiement) {
    const isPaye = statutPaiement === 'PAYE';
    const color = isPaye ? colors.success : colors.warning;
    doc.fontSize(fontSizes.large)
       .font(fonts.bold)
       .fillColor(color)
       .text(statutPaiement, 50, 60);
  } else if (subtitle) {
    // Sous-titre si présent et pas de statut
    doc.fontSize(fontSizes.medium)
       .font(fonts.regular)
       .fillColor(colors.textLight)
       .text(subtitle, 50, 60);
  }
  
  // Informations de la SCI à droite
  const rightX = 380;
  doc.fontSize(fontSizes.small)
     .font(fonts.regular)
     .fillColor(colors.text)
     .text(company.name, rightX, 30, { width: 165, align: 'right' });
  
  if (company.phone) {
    doc.fillColor(colors.textLight)
       .text(company.phone, rightX, 45, { width: 165, align: 'right' });
  }
  
  if (company.email) {
    doc.text(company.email, rightX, 60, { width: 165, align: 'right' });
  }
  
  // Réinitialiser la position Y après l'en-tête
  doc.y = 100;
};

/**
 * Dessine un pied de page simple
 */
exports.drawFooter = (doc, pageNumber = 1, totalPages = 1) => {
  const { colors, fonts, fontSizes, company } = config;
  
  // Ligne de séparation (remontée)
  doc.moveTo(50, 740)
     .lineTo(545, 740)
     .strokeColor(colors.border)
     .stroke();
  
  // Informations de la SCI
  doc.fontSize(fontSizes.tiny)
     .font(fonts.regular)
     .fillColor(colors.textMuted)
     .text(
       `${company.name} - ${company.address}, ${company.postalCode} ${company.city}`,
       50,
       750,
       { width: 445, align: 'left' }
     );
  
  // SIRET si disponible
  if (company.siret) {
    doc.text(`SIRET: ${company.siret}`, 50, 763, { width: 445, align: 'left' });
  }
  
  // Numéro de page
  doc.fontSize(fontSizes.small)
     .text(`Page ${pageNumber}/${totalPages}`, 50, 750, { width: 495, align: 'right' });
};

/**
 * Dessine une carte d'information avec bordure simple
 */
exports.drawInfoCard = (doc, options) => {
  const {
    x = 50,
    y = doc.y,
    width = 245,
    height = 'auto',
    title,
    content = [],
    borderColor = config.colors.border,
    bgColor = config.colors.background,
  } = options;
  
  const startY = y;
  const padding = 10;
  
  // Calculer la hauteur si auto
  let cardHeight = height;
  if (height === 'auto') {
    cardHeight = 22 + (content.length * 14) + padding;
  }
  
  // Fond de la carte
  doc.rect(x, startY, width, cardHeight)
     .fillAndStroke(bgColor, borderColor);
  
  // Titre avec fond légèrement grisé
  doc.rect(x, startY, width, 22)
     .fill(config.colors.secondaryLight);
  
  doc.fontSize(config.fontSizes.small)
     .font(config.fonts.bold)
     .fillColor(config.colors.text)
     .text(title, x + padding, startY + 6, { width: width - 2 * padding });
  
  // Contenu
  let currentY = startY + 26;
  content.forEach(line => {
    if (line) {
      doc.fontSize(config.fontSizes.tiny)
         .font(config.fonts.regular)
         .fillColor(config.colors.text)
         .text(line, x + padding, currentY, { width: width - 2 * padding });
      currentY += 14;
    }
  });
  
  // Mettre à jour la position Y du document
  doc.y = startY + cardHeight + 8;
};

/**
 * Dessine un tableau simple
 */
exports.drawTable = (doc, options) => {
  const {
    x = 50,
    y = doc.y,
    width = 495,
    headers = [],
    rows = [],
    columnWidths = [],
  } = options;
  
  const { colors, fonts, fontSizes } = config;
  const lineHeight = 20;
  const padding = 6;
  
  let currentY = y;
  
  // Calcul automatique des largeurs de colonnes si non spécifiées
  const colWidths = columnWidths.length > 0 
    ? columnWidths 
    : headers.map(() => width / headers.length);
  
  // En-têtes avec fond gris
  doc.rect(x, currentY, width, lineHeight)
     .fill(colors.secondaryLight);
  
  let currentX = x;
  headers.forEach((header, i) => {
    doc.fontSize(fontSizes.small)
       .font(fonts.bold)
       .fillColor(colors.text)
       .text(
         header,
         currentX + padding,
         currentY + 5,
         { width: colWidths[i] - 2 * padding, align: 'left' }
       );
    currentX += colWidths[i];
  });
  
  currentY += lineHeight;
  
  // Lignes alternées
  rows.forEach((row, rowIndex) => {
    const bgColor = rowIndex % 2 === 0 ? colors.background : '#fafafa';
    doc.rect(x, currentY, width, lineHeight).fill(bgColor);
    
    currentX = x;
    row.forEach((cell, i) => {
      doc.fontSize(fontSizes.tiny)
         .font(fonts.regular)
         .fillColor(colors.text)
         .text(
           String(cell),
           currentX + padding,
           currentY + 5,
           { width: colWidths[i] - 2 * padding, align: i === row.length - 1 ? 'right' : 'left' }
         );
      currentX += colWidths[i];
    });
    
    currentY += lineHeight;
  });
  
  // Bordure du tableau
  doc.rect(x, y, width, currentY - y)
     .strokeColor(colors.border)
     .stroke();
  
  doc.y = currentY + 8;
};

/**
 * Dessine un encadré pour mettre en valeur une information
 */
exports.drawHighlight = (doc, options) => {
  const {
    x = 50,
    y = doc.y,
    width = 495,
    height = 45,  // Paramètre height configurable
    label,
    value,
    color = config.colors.text,
  } = options;
  
  const { colors, fonts, fontSizes } = config;
  
  // Rectangle avec bordure épaisse
  doc.rect(x, y, width, height)
     .fillAndStroke(colors.background, color);
  
  // Ligne épaisse en haut
  doc.rect(x, y, width, 3).fill(color);
  
  // Label
  doc.fontSize(fontSizes.tiny)
     .font(fonts.regular)
     .fillColor(colors.textLight)
     .text(label, x + 12, y + 10, { width: width - 24 });
  
  // Valeur
  doc.fontSize(fontSizes.large)
     .font(fonts.bold)
     .fillColor(color)
     .text(value, x + 12, y + 22, { width: width - 24 });
  
  doc.y = y + height + 8;
};

/**
 * Dessine un badge de statut simple
 */
exports.drawBadge = (doc, options) => {
  const {
    x,
    y,
    text,
    type = 'info', // 'success', 'danger', 'warning', 'info'
  } = options;
  
  const { colors, fonts, fontSizes } = config;
  
  const badgeColors = {
    success: { bg: '#e8f5e9', text: '#2e7d32', border: '#2e7d32' },
    danger: { bg: '#ffebee', text: '#c62828', border: '#c62828' },
    warning: { bg: '#fff3e0', text: '#e65100', border: '#e65100' },
    info: { bg: '#e3f2fd', text: '#1565c0', border: '#1565c0' },
  };
  
  const style = badgeColors[type] || badgeColors.info;
  
  const badgeWidth = doc.widthOfString(text, { fontSize: fontSizes.small }) + 16;
  const badgeHeight = 18;
  
  // Fond du badge avec bordure
  doc.rect(x, y, badgeWidth, badgeHeight)
     .fillAndStroke(style.bg, style.border);
  
  // Texte
  doc.fontSize(fontSizes.small)
     .font(fonts.bold)
     .fillColor(style.text)
     .text(text, x + 8, y + 4);
};

/**
 * Dessine une section avec titre et ligne de séparation
 */
exports.drawSectionTitle = (doc, title) => {
  const { colors, fonts, fontSizes } = config;
  
  doc.fontSize(fontSizes.medium)
     .font(fonts.bold)
     .fillColor(colors.text)
     .text(title, 50, doc.y);
  
  // Ligne de soulignement
  doc.moveTo(50, doc.y + 2)
     .lineTo(150, doc.y + 2)
     .strokeColor(colors.border)
     .lineWidth(1)
     .stroke();
  
  doc.moveDown(1);
};

/**
 * Ajoute un watermark (filigrane) au document
 */
exports.addWatermark = (doc, text) => {
  const { colors, fonts } = config;
  
  // Sauvegarder l'état
  doc.save();
  
  // Positionner au centre et faire pivoter
  doc.translate(297, 421)
     .rotate(-45);
  
  // Dessiner le texte avec transparence
  doc.fontSize(60)
     .font(fonts.bold)
     .fillColor(colors.danger)
     .opacity(0.08)
     .text(text, -150, -20, { width: 300, align: 'center' });
  
  // Restaurer l'état
  doc.restore();
};

/**
 * Dessine une ligne de séparation
 */
exports.drawSeparator = (doc, options = {}) => {
  const {
    x = 50,
    width = 495,
    y = doc.y,
    color = config.colors.border,
    lineWidth = 1,
  } = options;
  
  doc.moveTo(x, y)
     .lineTo(x + width, y)
     .strokeColor(color)
     .lineWidth(lineWidth)
     .stroke();
  
  doc.y = y + 10;
};
