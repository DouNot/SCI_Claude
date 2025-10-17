import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { spaceService } from '../services/spaceService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      
      if (savedToken) {
        try {
          console.log('🔐 Vérification du token sauvegardé...');
          
          // Vérifier que le token est valide et récupérer l'utilisateur
          const userData = await authService.getCurrentUser(savedToken);
          setToken(savedToken);
          setUser(userData);
          
          console.log('✅ Utilisateur récupéré:', userData.email);
          
          // TOUJOURS réinitialiser le currentSpaceId au démarrage
          await initializeCurrentSpace(savedToken, userData, true);
        } catch (error) {
          console.error('❌ Token invalide:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('currentSpaceId');
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  // Fonction pour initialiser le currentSpaceId
  // forceRefresh = true : force la réinitialisation même si un spaceId existe déjà
  const initializeCurrentSpace = async (authToken, userData, forceRefresh = false) => {
    try {
      console.log('🔄 Initialisation du currentSpaceId...');
      
      // Si forceRefresh = false et qu'un spaceId existe déjà, on garde celui-ci
      const existingSpaceId = localStorage.getItem('currentSpaceId');
      if (!forceRefresh && existingSpaceId) {
        console.log('✅ CurrentSpaceId déjà défini:', existingSpaceId);
        return;
      }

      console.log('📡 Récupération des espaces de l\'utilisateur...');
      
      // Récupérer les spaces de l'utilisateur
      const spaces = await spaceService.getAllSpaces(authToken);
      
      console.log('📦 Espaces récupérés:', spaces);
      
      if (!spaces || spaces.length === 0) {
        console.warn('⚠️ Aucun espace trouvé pour cet utilisateur !');
        return;
      }
      
      // Utiliser lastSpaceId de l'utilisateur ou le premier space
      let selectedSpace = null;
      
      if (userData.lastSpaceId) {
        selectedSpace = spaces.find(s => s.id === userData.lastSpaceId);
        console.log('🔍 Recherche du lastSpaceId:', userData.lastSpaceId, '→', selectedSpace ? 'Trouvé' : 'Non trouvé');
      }
      
      // Si pas trouvé, prendre le premier SCI ou le premier space
      if (!selectedSpace) {
        selectedSpace = spaces.find(s => s.type === 'SCI') || spaces[0];
        console.log('🔍 Sélection par défaut:', selectedSpace.type, '-', selectedSpace.nom);
      }
      
      if (selectedSpace) {
        localStorage.setItem('currentSpaceId', selectedSpace.id);
        console.log('✅ CurrentSpaceId initialisé:', selectedSpace.id, '(' + selectedSpace.nom + ')');
      } else {
        console.error('❌ Impossible de sélectionner un espace !');
      }
    } catch (error) {
      console.error('❌ Erreur initialisation currentSpaceId:', error);
      console.error('Détails:', error.response?.data || error.message);
    }
  };

  // Connexion
  const login = async (email, password) => {
    try {
      setError(null);
      console.log('🔐 Tentative de connexion:', email);
      
      const data = await authService.login(email, password);
      
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      
      console.log('✅ Connexion réussie');
      
      // Initialiser le currentSpaceId immédiatement (force refresh)
      await initializeCurrentSpace(data.token, data.user, true);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      const errorMessage = error.response?.data?.error || 'Erreur de connexion';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Inscription
  const signup = async (userData) => {
    try {
      setError(null);
      console.log('📝 Tentative d\'inscription:', userData.email);
      
      const data = await authService.signup(userData);
      
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      
      console.log('✅ Inscription réussie');
      
      // Initialiser le currentSpaceId immédiatement (force refresh)
      await initializeCurrentSpace(data.token, data.user, true);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur d\'inscription:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de l\'inscription';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Déconnexion
  const logout = () => {
    console.log('👋 Déconnexion...');
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('currentSpaceId');
    setError(null);
    console.log('✅ Déconnexion complète');
  };

  // Mise à jour du profil
  const updateProfile = async (updates) => {
    try {
      const updatedUser = await authService.updateProfile(updates, token);
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erreur lors de la mise à jour';
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    signup,
    logout,
    updateProfile,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export default AuthContext;
