import axios from 'axios';

// URL de ton backend
const API_URL = 'http://localhost:3000/api';

// Instance axios configurée
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// BIENS
// ============================================

export const biensAPI = {
  getAll: async () => {
    const response = await api.get('/biens');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/biens/${id}`);
    return response.data;
  },
  create: async (bienData) => {
    const response = await api.post('/biens', bienData);
    return response.data;
  },
  update: async (id, bienData) => {
    const response = await api.put(`/biens/${id}`, bienData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/biens/${id}`);
    return response.data;
  },
};

// ============================================
// LOCATAIRES
// ============================================

export const locatairesAPI = {
  getAll: async () => {
    const response = await api.get('/locataires');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/locataires/${id}`);
    return response.data;
  },
  create: async (locataireData) => {
    const response = await api.post('/locataires', locataireData);
    return response.data;
  },
  update: async (id, locataireData) => {
    const response = await api.put(`/locataires/${id}`, locataireData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/locataires/${id}`);
    return response.data;
  },
};

// ============================================
// BAUX
// ============================================

export const bauxAPI = {
  getAll: async () => {
    const response = await api.get('/baux');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/baux/${id}`);
    return response.data;
  },
  create: async (bailData) => {
    const response = await api.post('/baux', bailData);
    return response.data;
  },
  update: async (id, bailData) => {
    const response = await api.put(`/baux/${id}`, bailData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/baux/${id}`);
    return response.data;
  },
};

// ============================================
// QUITTANCES
// ============================================

export const quittancesAPI = {
  // Générer une quittance PDF
  generer: async (quittanceData) => {
    const response = await api.post('/quittances/generer', quittanceData, {
      responseType: 'blob', // Important pour recevoir un fichier
    });
    return response;
  },

  // Récupérer les quittances d'un bail
  getByBail: async (bailId) => {
    const response = await api.get(`/quittances/bail/${bailId}`);
    return response.data;
  },
};

// ============================================
// FACTURES
// ============================================

export const facturesAPI = {
  // Récupérer toutes les factures
  getAll: async () => {
    const response = await api.get('/factures');
    return response.data;
  },

  // Récupérer les factures d'un bien
  getByBien: async (bienId) => {
    const response = await api.get(`/factures/bien/${bienId}`);
    return response.data;
  },

  // Récupérer une facture par ID
  getById: async (id) => {
    const response = await api.get(`/factures/${id}`);
    return response.data;
  },

  // Créer une facture avec fichier
  create: async (factureData) => {
    const formData = new FormData();
    
    // Ajouter tous les champs
    Object.keys(factureData).forEach(key => {
      if (factureData[key] !== null && factureData[key] !== undefined) {
        formData.append(key, factureData[key]);
      }
    });

    const response = await api.post('/factures', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Mettre à jour une facture
  update: async (id, factureData) => {
    const response = await api.put(`/factures/${id}`, factureData);
    return response.data;
  },

  // Supprimer une facture
  delete: async (id) => {
    const response = await api.delete(`/factures/${id}`);
    return response.data;
  },
};

// ============================================
// TRAVAUX
// ============================================

export const travauxAPI = {
  // Récupérer tous les travaux
  getAll: async () => {
    const response = await api.get('/travaux');
    return response.data;
  },

  // Récupérer les travaux d'un bien
  getByBien: async (bienId) => {
    const response = await api.get(`/travaux/bien/${bienId}`);
    return response.data;
  },

  // Récupérer un travaux par ID
  getById: async (id) => {
    const response = await api.get(`/travaux/${id}`);
    return response.data;
  },

  // Créer des travaux
  create: async (travauxData) => {
    const response = await api.post('/travaux', travauxData);
    return response.data;
  },

  // Mettre à jour des travaux
  update: async (id, travauxData) => {
    const response = await api.put(`/travaux/${id}`, travauxData);
    return response.data;
  },

  // Supprimer des travaux
  delete: async (id) => {
    const response = await api.delete(`/travaux/${id}`);
    return response.data;
  },
};

// ============================================
// CONTACTS
// ============================================

export const contactsAPI = {
  // Récupérer tous les contacts
  getAll: async () => {
    const response = await api.get('/contacts');
    return response.data;
  },

  // Récupérer les contacts par type
  getByType: async (type) => {
    const response = await api.get(`/contacts/type/${type}`);
    return response.data;
  },

  // Récupérer un contact par ID
  getById: async (id) => {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  },

  // Créer un contact
  create: async (contactData) => {
    const response = await api.post('/contacts', contactData);
    return response.data;
  },

  // Mettre à jour un contact
  update: async (id, contactData) => {
    const response = await api.put(`/contacts/${id}`, contactData);
    return response.data;
  },

  // Supprimer un contact
  delete: async (id) => {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  },
};

// ============================================
// PRÊTS
// ============================================

export const pretsAPI = {
  // Récupérer tous les prêts
  getAll: async () => {
    const response = await api.get('/prets');
    return response.data;
  },

  // Récupérer les prêts d'un bien
  getByBien: async (bienId) => {
    const response = await api.get(`/prets/bien/${bienId}`);
    return response.data;
  },

  // Récupérer un prêt par ID (avec tableau d'amortissement)
  getById: async (id) => {
    const response = await api.get(`/prets/${id}`);
    return response.data;
  },

  // Créer un prêt
  create: async (pretData) => {
    const response = await api.post('/prets', pretData);
    return response.data;
  },

  // Mettre à jour un prêt
  update: async (id, pretData) => {
    const response = await api.put(`/prets/${id}`, pretData);
    return response.data;
  },

  // Supprimer un prêt
  delete: async (id) => {
    const response = await api.delete(`/prets/${id}`);
    return response.data;
  },
};

export default api;