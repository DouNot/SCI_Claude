import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Instance axios pour les appels spaces
const spaceApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const spaceService = {
  /**
   * Récupérer tous les espaces de l'utilisateur
   */
  async getAllSpaces(token) {
    const response = await spaceApi.get('/spaces', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Récupérer un espace par ID
   */
  async getSpaceById(spaceId, token) {
    const response = await spaceApi.get(`/spaces/${spaceId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Créer un nouvel espace (SCI)
   */
  async createSpace(spaceData, token) {
    const response = await spaceApi.post('/spaces', spaceData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Mettre à jour un espace
   */
  async updateSpace(spaceId, updates, token) {
    const response = await spaceApi.patch(`/spaces/${spaceId}`, updates, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Changer l'espace actif (lastSpaceId)
   */
  async switchSpace(spaceId, token) {
    const response = await spaceApi.patch(`/spaces/${spaceId}/switch`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Archiver un espace (soft delete)
   */
  async archiveSpace(spaceId, token) {
    const response = await spaceApi.delete(`/spaces/${spaceId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Récupérer les membres d'un espace
   */
  async getMembers(spaceId, token) {
    const response = await spaceApi.get(`/spaces/${spaceId}/members`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Inviter un membre
   */
  async inviteMember(spaceId, email, role, token) {
    const response = await spaceApi.post(
      `/spaces/${spaceId}/members/invite`,
      { email, role },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
};

export default spaceService;
