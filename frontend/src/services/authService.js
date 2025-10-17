import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Instance axios pour les appels auth
const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  /**
   * Inscription
   */
  async signup(userData) {
    const response = await authApi.post('/auth/signup', userData);
    return response.data;
  },

  /**
   * Connexion
   */
  async login(email, password) {
    const response = await authApi.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * Récupérer l'utilisateur actuel
   */
  async getCurrentUser(token) {
    const response = await authApi.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.user;
  },

  /**
   * Mettre à jour le profil
   */
  async updateProfile(updates, token) {
    const response = await authApi.patch('/auth/me', updates, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.user;
  },

  /**
   * Changer le mot de passe
   */
  async changePassword(currentPassword, newPassword, token) {
    const response = await authApi.post(
      '/auth/change-password',
      { currentPassword, newPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
};

export default authService;
