import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const userApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const userService = {
  /**
   * Supprimer toutes les données de l'utilisateur (garde le compte)
   */
  async deleteAllData(token) {
    const response = await userApi.delete('/user/data', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Supprimer complètement le compte utilisateur
   */
  async deleteAccount(token) {
    const response = await userApi.delete('/user/account', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export default userService;
