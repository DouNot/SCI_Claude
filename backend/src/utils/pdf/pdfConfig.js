/**
 * Configuration globale pour la génération de PDFs
 * Centralise les couleurs, styles et configurations
 */

module.exports = {
  // Couleurs de la charte graphique
  colors: {
    primary: '#2563eb',      // Bleu principal
    primaryLight: '#dbeafe', // Bleu clair
    primaryDark: '#1e40af',  // Bleu foncé
    
    secondary: '#64748b',    // Gris
    secondaryLight: '#f1f5f9',
    secondaryDark: '#334155',
    
    success: '#10b981',      // Vert
    successLight: '#d1fae5',
    
    danger: '#ef4444',       // Rouge
    dangerLight: '#fee2e2',
    
    warning: '#f59e0b',      // Orange
    warningLight: '#fef3c7',
    
    text: '#1e293b',         // Texte principal
    textLight: '#64748b',    // Texte secondaire
    textMuted: '#94a3b8',    // Texte désactivé
    
    background: '#ffffff',
    backgroundGray: '#f8fafc',
    border: '#e2e8f0',
  },

  // Polices
  fonts: {
    regular: 'Helvetica',
    bold: 'Helvetica-Bold',
    italic: 'Helvetica-Oblique',
    boldItalic: 'Helvetica-BoldOblique',
  },

  // Tailles de police
  fontSizes: {
    tiny: 8,
    small: 10,
    normal: 12,
    medium: 14,
    large: 16,
    xlarge: 20,
    xxlarge: 24,
    title: 28,
  },

  // Marges et espacements
  spacing: {
    page: {
      margin: 50,
      marginTop: 50,
      marginBottom: 50,
      marginLeft: 50,
      marginRight: 50,
    },
    section: 20,
    paragraph: 10,
    line: 5,
  },

  // Informations de la SCI (à personnaliser)
  company: {
    name: 'SCI Claude',
    address: '123 Avenue de la République',
    postalCode: '75011',
    city: 'Paris',
    phone: '01 23 45 67 89',
    email: 'contact@sci-claude.fr',
    siret: '123 456 789 00012',
    // logo: null, // Chemin vers le logo si disponible
  },

  // Format de page
  pageFormat: {
    size: 'A4',
    margin: 50,
  },

  // Styles de tableaux
  table: {
    lineHeight: 20,
    padding: 10,
    headerHeight: 30,
  },
};
