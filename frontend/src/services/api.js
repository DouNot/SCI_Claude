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

export default api;