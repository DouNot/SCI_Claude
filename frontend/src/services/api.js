import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Instance axios principale
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requête - Ajouter token ET spaceId automatiquement
api.interceptors.request.use(
  (config) => {
    // 1. Récupérer le token depuis localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ Pas de token dans localStorage - la requête risque d\'échouer');
    }

    // 2. Récupérer le spaceId actuel depuis localStorage
    const currentSpaceId = localStorage.getItem('currentSpaceId');
    
    // 3. Ajouter spaceId seulement si disponible
    if (currentSpaceId) {
      // Ajouter spaceId dans les query params pour les GET et DELETE
      if (config.method === 'get' || config.method === 'delete') {
        config.params = {
          ...config.params,
          spaceId: currentSpaceId,
        };
      }
      
      // Ajouter spaceId dans le body pour POST/PUT/PATCH
      if (['post', 'put', 'patch'].includes(config.method)) {
        // Ne pas ajouter si c'est du FormData (on l'ajoutera manuellement dans les services)
        if (!(config.data instanceof FormData)) {
          config.data = {
            ...config.data,
            spaceId: currentSpaceId,
          };
        }
      }
      
      console.log(`📤 ${config.method.toUpperCase()} ${config.url} [spaceId: ${currentSpaceId.substring(0, 8)}...]`);
    } else {
      console.warn(`⚠️ ${config.method.toUpperCase()} ${config.url} - AUCUN spaceId dans localStorage !`);
      console.warn('Cette requête risque de renvoyer une erreur 403 (Forbidden)');
    }

    return config;
  },
  (error) => {
    console.error('❌ Erreur dans l\'intercepteur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse - Gérer les erreurs 401
api.interceptors.response.use(
  (response) => {
    // Log des réponses réussies (optionnel, peut être retiré en prod)
    // console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} → ${response.status}`);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const method = error.config?.method?.toUpperCase();
    const url = error.config?.url;
    
    console.error(`❌ ${method} ${url} → ${status}`);
    
    // Si 401 (non autorisé), déconnecter et rediriger vers login
    if (status === 401) {
      console.error('🔒 Erreur 401 - Token invalide ou expiré - Déconnexion...');
      localStorage.removeItem('token');
      localStorage.removeItem('currentSpaceId');
      window.location.href = '/login';
    }
    
    // Si 403 (accès refusé au Space)
    if (status === 403) {
      console.error('🚫 Erreur 403 - Accès refusé au Space');
      console.error('Vérifiez que le currentSpaceId existe et que l\'utilisateur y a accès');
      console.error('currentSpaceId actuel:', localStorage.getItem('currentSpaceId'));
    }
    
    // Si 400 (Bad Request) et message sur spaceId
    if (status === 400 && error.response?.data?.code === 'SPACE_ID_REQUIRED') {
      console.error('⚠️ Erreur 400 - spaceId manquant dans la requête');
      console.error('Vérifiez que le currentSpaceId est bien dans localStorage');
      console.error('currentSpaceId actuel:', localStorage.getItem('currentSpaceId'));
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// API SERVICES
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
    console.log('📝 Création d\'un locataire:', locataireData);
    const response = await api.post('/locataires', locataireData);
    console.log('✅ Locataire créé:', response.data);
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

export const bauxAPI = {
  getAll: async () => {
    const response = await api.get('/baux');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/baux/${id}`);
    return response.data;
  },
  getByBien: async (bienId) => {
    const response = await api.get(`/baux/bien/${bienId}`);
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

export const quittancesAPI = {
  generer: async (quittanceData) => {
    const response = await api.post('/quittances/generer', quittanceData, {
      responseType: 'blob',
    });
    return response;
  },
  getByBail: async (bailId) => {
    const response = await api.get(`/quittances/bail/${bailId}`);
    return response.data;
  },
};

export const facturesAPI = {
  getAll: async () => {
    const response = await api.get('/factures');
    return response.data;
  },
  getByBien: async (bienId) => {
    const response = await api.get(`/factures/bien/${bienId}`);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/factures/${id}`);
    return response.data;
  },
  create: async (factureData) => {
    const formData = new FormData();
    Object.keys(factureData).forEach(key => {
      if (factureData[key] !== null && factureData[key] !== undefined) {
        formData.append(key, factureData[key]);
      }
    });
    // Ajouter manuellement le spaceId pour FormData
    const currentSpaceId = localStorage.getItem('currentSpaceId');
    if (currentSpaceId) {
      formData.append('spaceId', currentSpaceId);
    }
    const response = await api.post('/factures', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  update: async (id, factureData) => {
    const response = await api.put(`/factures/${id}`, factureData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/factures/${id}`);
    return response.data;
  },
};

export const travauxAPI = {
  getAll: async () => {
    const response = await api.get('/travaux');
    return response.data;
  },
  getByBien: async (bienId) => {
    const response = await api.get(`/travaux/bien/${bienId}`);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/travaux/${id}`);
    return response.data;
  },
  create: async (travauxData) => {
    const response = await api.post('/travaux', travauxData);
    return response.data;
  },
  update: async (id, travauxData) => {
    const response = await api.put(`/travaux/${id}`, travauxData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/travaux/${id}`);
    return response.data;
  },
};

export const contactsAPI = {
  getAll: async () => {
    const response = await api.get('/contacts');
    return response.data;
  },
  getByType: async (type) => {
    const response = await api.get(`/contacts/type/${type}`);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  },
  create: async (contactData) => {
    const response = await api.post('/contacts', contactData);
    return response.data;
  },
  update: async (id, contactData) => {
    const response = await api.put(`/contacts/${id}`, contactData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  },
};

export const pretsAPI = {
  getAll: async () => {
    const response = await api.get('/prets');
    return response.data;
  },
  getByBien: async (bienId) => {
    const response = await api.get(`/prets/bien/${bienId}`);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/prets/${id}`);
    return response.data;
  },
  create: async (pretData) => {
    const response = await api.post('/prets', pretData);
    return response.data;
  },
  update: async (id, pretData) => {
    const response = await api.put(`/prets/${id}`, pretData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/prets/${id}`);
    return response.data;
  },
};

export const associesAPI = {
  getAll: async () => {
    const currentSpaceId = localStorage.getItem('currentSpaceId');
    const response = await api.get(`/associes/space/${currentSpaceId}`);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/associes/${id}`);
    return response.data;
  },
  create: async (associeData) => {
    const response = await api.post('/associes', associeData);
    return response.data;
  },
  update: async (id, associeData) => {
    const response = await api.put(`/associes/${id}`, associeData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/associes/${id}`);
    return response.data;
  },
  
  // Mouvements CCA
  getMouvementsCCA: async (associeId) => {
    const response = await api.get(`/associes/${associeId}/mouvements-cca`);
    return response.data;
  },
  createMouvementCCA: async (associeId, mouvementData) => {
    const response = await api.post(`/associes/${associeId}/mouvements-cca`, mouvementData);
    return response.data;
  },
  updateMouvementCCA: async (mouvementId, mouvementData) => {
    const response = await api.put(`/mouvements-cca/${mouvementId}`, mouvementData);
    return response.data;
  },
  deleteMouvementCCA: async (mouvementId) => {
    const response = await api.delete(`/mouvements-cca/${mouvementId}`);
    return response.data;
  },
  getSoldeCCA: async (associeId) => {
    const response = await api.get(`/associes/${associeId}/mouvements-cca/solde`);
    return response.data;
  },
};

export const documentsAPI = {
  getAll: async () => {
    const response = await api.get('/documents');
    return response.data;
  },
  getByBien: async (bienId) => {
    const response = await api.get(`/documents/bien/${bienId}`);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },
  create: async (documentData) => {
    const formData = new FormData();
    Object.keys(documentData).forEach(key => {
      if (documentData[key] !== null && documentData[key] !== undefined) {
        formData.append(key, documentData[key]);
      }
    });
    // Ajouter spaceId pour FormData
    const currentSpaceId = localStorage.getItem('currentSpaceId');
    if (currentSpaceId) {
      formData.append('spaceId', currentSpaceId);
    }
    const response = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  update: async (id, documentData) => {
    const response = await api.put(`/documents/${id}`, documentData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
};

export const evenementsFiscauxAPI = {
  getAll: async () => {
    const response = await api.get('/evenements-fiscaux');
    return response.data;
  },
  getByBien: async (bienId) => {
    const response = await api.get(`/evenements-fiscaux/bien/${bienId}`);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/evenements-fiscaux/${id}`);
    return response.data;
  },
  create: async (evenementData) => {
    const response = await api.post('/evenements-fiscaux', evenementData);
    return response.data;
  },
  update: async (id, evenementData) => {
    const response = await api.put(`/evenements-fiscaux/${id}`, evenementData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/evenements-fiscaux/${id}`);
    return response.data;
  },
};

export const photosAPI = {
  getByBien: async (bienId) => {
    const response = await api.get(`/photos/bien/${bienId}`);
    return response.data;
  },
  upload: async (bienId, files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('photos', file);
    });
    const response = await api.post(`/photos/upload/${bienId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  setPrimary: async (photoId) => {
    const response = await api.put(`/photos/${photoId}/primary`);
    return response.data;
  },
  delete: async (photoId) => {
    const response = await api.delete(`/photos/${photoId}`);
    return response.data;
  },
};

export const assembleesAPI = {
  getAll: async () => {
    const response = await api.get('/assemblees-generales');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/assemblees-generales/${id}`);
    return response.data;
  },
  create: async (agData) => {
    const formData = new FormData();
    formData.append('type', agData.type);
    formData.append('dateAG', agData.dateAG);
    if (agData.titre) formData.append('titre', agData.titre);
    if (agData.description) formData.append('description', agData.description);
    if (agData.pv) formData.append('pv', agData.pv);
    
    // Ajouter spaceId pour FormData
    const currentSpaceId = localStorage.getItem('currentSpaceId');
    if (currentSpaceId) {
      formData.append('spaceId', currentSpaceId);
    }
    
    const response = await api.post('/assemblees-generales', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  update: async (id, agData) => {
    const response = await api.put(`/assemblees-generales/${id}`, agData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/assemblees-generales/${id}`);
    return response.data;
  },
};

export const chargesAPI = {
  getAll: async () => {
    const response = await api.get('/charges');
    return response.data;
  },
  getByBien: async (bienId) => {
    const response = await api.get(`/charges/bien/${bienId}`);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/charges/${id}`);
    return response.data;
  },
  create: async (chargeData) => {
    const response = await api.post('/charges', chargeData);
    return response.data;
  },
  update: async (id, chargeData) => {
    const response = await api.put(`/charges/${id}`, chargeData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/charges/${id}`);
    return response.data;
  },
  addPaiement: async (id, paiementData) => {
    const response = await api.post(`/charges/${id}/paiements`, paiementData);
    return response.data;
  },
  deletePaiement: async (paiementId) => {
    const response = await api.delete(`/charges/paiements/${paiementId}`);
    return response.data;
  },
};

export const membersAPI = {
  getAll: async (spaceId) => {
    const response = await api.get(`/spaces/${spaceId}/members`);
    return response.data;
  },
  invite: async (spaceId, inviteData) => {
    const response = await api.post(`/spaces/${spaceId}/members/invite`, inviteData);
    return response.data;
  },
  updateRole: async (spaceId, memberId, role) => {
    const response = await api.patch(`/spaces/${spaceId}/members/${memberId}`, { role });
    return response.data;
  },
  remove: async (spaceId, memberId) => {
    const response = await api.delete(`/spaces/${spaceId}/members/${memberId}`);
    return response.data;
  },
};

export const invitationsAPI = {
  getPending: async () => {
    const response = await api.get('/invitations/pending');
    return response.data;
  },
  accept: async (token) => {
    const response = await api.post(`/invitations/${token}/accept`);
    return response.data;
  },
  reject: async (token) => {
    const response = await api.post(`/invitations/${token}/reject`);
    return response.data;
  },
};

export const notificationsAPI = {
  getAll: async (statut = null) => {
    const params = statut ? { statut } : {};
    const response = await api.get('/notifications', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  },
  create: async (notificationData) => {
    const response = await api.post('/notifications', notificationData);
    return response.data;
  },
  marquerCommeLue: async (id) => {
    const response = await api.put(`/notifications/${id}/lire`);
    return response.data;
  },
  marquerToutesCommeLues: async () => {
    const response = await api.put('/notifications/lire-toutes');
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
  supprimerToutesLues: async () => {
    const response = await api.delete('/notifications/lues/toutes');
    return response.data;
  },
  generer: async () => {
    const response = await api.post('/notifications/generer');
    return response.data;
  },
};

export default api;
