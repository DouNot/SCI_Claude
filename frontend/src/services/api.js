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
  // Récupérer tous les biens
  getAll: async () => {
    const response = await api.get('/biens');
    return response.data;
  },

  // Récupérer un bien par ID
  getById: async (id) => {
    const response = await api.get(`/biens/${id}`);
    return response.data;
  },

  // Créer un bien
  create: async (bienData) => {
    const response = await api.post('/biens', bienData);
    return response.data;
  },

  // Mettre à jour un bien
  update: async (id, bienData) => {
    const response = await api.put(`/biens/${id}`, bienData);
    return response.data;
  },

  // Supprimer un bien
  delete: async (id) => {
    const response = await api.delete(`/biens/${id}`);
    return response.data;
  },
};

// ============================================
// LOCATAIRES
// ============================================

export const locatairesAPI = {
  // Récupérer tous les locataires
  getAll: async () => {
    const response = await api.get('/locataires');
    return response.data;
  },

  // Récupérer un locataire par ID
  getById: async (id) => {
    const response = await api.get(`/locataires/${id}`);
    return response.data;
  },

  // Créer un locataire
  create: async (locataireData) => {
    const response = await api.post('/locataires', locataireData);
    return response.data;
  },

  // Mettre à jour un locataire
  update: async (id, locataireData) => {
    const response = await api.put(`/locataires/${id}`, locataireData);
    return response.data;
  },

  // Supprimer un locataire
  delete: async (id) => {
    const response = await api.delete(`/locataires/${id}`);
    return response.data;
  },
};

export default api;