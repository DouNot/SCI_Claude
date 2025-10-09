import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    const response = await api.get('/associes');
    return response.data;
  },
  getByCompte: async (compteId) => {
    const response = await api.get(`/associes/compte/${compteId}`);
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

export default api;