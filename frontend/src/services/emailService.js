import api from './api';

/**
 * Service pour la gestion des emails
 */

/**
 * Tester la configuration email
 */
export const testerConfigurationEmail = async () => {
  const response = await api.get('/emails/test');
  return response.data;
};

/**
 * Envoyer une quittance par email
 */
export const envoyerQuittanceEmail = async (data) => {
  const response = await api.post('/emails/envoyer-quittance', data);
  return response.data;
};

/**
 * Envoyer toutes les quittances du mois par email
 */
export const envoyerQuittancesLotEmail = async (mois, annee) => {
  const response = await api.post('/emails/envoyer-quittances-lot', {
    mois,
    annee,
  });
  return response.data;
};

/**
 * Envoyer une relance pour impayé
 */
export const envoyerRelanceEmail = async (bailId, mois, annee) => {
  const response = await api.post('/emails/envoyer-relance', {
    bailId,
    mois,
    annee,
  });
  return response.data;
};

export default {
  testerConfigurationEmail,
  envoyerQuittanceEmail,
  envoyerQuittancesLotEmail,
  envoyerRelanceEmail,
};
