/**
 * Helpers pour le formatage dans les PDFs
 */

/**
 * Formate un montant en euros
 * @param {number} amount - Montant à formater
 * @param {boolean} showSign - Afficher le signe + ou -
 * @returns {string} Montant formaté
 */
exports.formatCurrency = (amount, showSign = false) => {
  // Formater avec espace comme séparateur de milliers
  const formatted = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €';
  
  if (showSign && amount > 0) {
    return '+' + formatted;
  }
  return formatted;
};

/**
 * Formate une date au format français
 * @param {Date|string} date - Date à formater
 * @param {string} format - Format souhaité ('short', 'long', 'medium')
 * @returns {string} Date formatée
 */
exports.formatDate = (date, format = 'short') => {
  if (!date) return '';
  
  const d = new Date(date);
  
  switch (format) {
    case 'long':
      return d.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'medium':
      return d.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'short':
    default:
      return d.toLocaleDateString('fr-FR');
  }
};

/**
 * Formate un numéro de téléphone
 * @param {string} phone - Numéro de téléphone
 * @returns {string} Téléphone formaté
 */
exports.formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
  }
  return phone;
};

/**
 * Génère un numéro de quittance unique et lisible
 * @param {string} bailId - ID du bail
 * @param {number} mois - Mois (1-12)
 * @param {number} annee - Année
 * @returns {string} Numéro de quittance (ex: Q2025-10-001)
 */
exports.generateQuittanceNumber = (bailId, mois, annee) => {
  // Générer un nombre court basé sur les premiers caractères de l'UUID
  const bailShort = parseInt(bailId.substring(0, 8), 16) % 1000;
  const moisPad = String(mois).padStart(2, '0');
  const numPad = String(bailShort).padStart(3, '0');
  return `Q${annee}-${moisPad}-${numPad}`;
};

/**
 * Obtient le nom du mois
 * @param {number} mois - Numéro du mois (1-12)
 * @returns {string} Nom du mois
 */
exports.getMonthName = (mois) => {
  const moisNoms = [
    'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
  ];
  return moisNoms[mois - 1] || '';
};

/**
 * Formate le type de bien de manière professionnelle
 * @param {string} type - Type de bien (ex: LOCAL_COMMERCIAL)
 * @returns {string} Type formaté (ex: Local commercial)
 */
exports.formatBienType = (type) => {
  if (!type) return '';
  
  const types = {
    'APPARTEMENT': 'Appartement',
    'MAISON': 'Maison',
    'STUDIO': 'Studio',
    'IMMEUBLE': 'Immeuble',
    'LOCAL_COMMERCIAL': 'Local commercial',
    'BUREAU': 'Bureau',
    'PARKING': 'Parking',
    'GARAGE': 'Garage',
    'TERRAIN': 'Terrain',
    'AUTRE': 'Autre',
  };
  
  return types[type] || type.replace(/_/g, ' ').toLowerCase();
};

/**
 * Formate une adresse complète
 * @param {Object} entity - Entité avec adresse
 * @returns {string} Adresse formatée
 */
exports.formatAddress = (entity) => {
  if (!entity) return '';
  const parts = [];
  if (entity.adresse) parts.push(entity.adresse);
  if (entity.codePostal && entity.ville) {
    parts.push(`${entity.codePostal} ${entity.ville}`);
  }
  return parts.join('\n');
};

/**
 * Calcule le nombre de jours entre deux dates
 * @param {Date} date1 - Première date
 * @param {Date} date2 - Deuxième date
 * @returns {number} Nombre de jours
 */
exports.daysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Vérifie si un paiement est en retard
 * @param {Date} datePaiement - Date de paiement
 * @param {Date} dateEcheance - Date d'échéance
 * @returns {boolean} True si en retard
 */
exports.isPaymentLate = (datePaiement, dateEcheance) => {
  if (!datePaiement || !dateEcheance) return false;
  return new Date(datePaiement) > new Date(dateEcheance);
};

/**
 * Tronque un texte avec ellipse
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @returns {string} Texte tronqué
 */
exports.truncate = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};
