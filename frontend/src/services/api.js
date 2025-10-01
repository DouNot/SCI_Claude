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

export default api;