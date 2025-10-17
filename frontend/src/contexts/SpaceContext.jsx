import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { spaceService } from '../services/spaceService';

const SpaceContext = createContext(null);

export const SpaceProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  
  const [spaces, setSpaces] = useState([]);
  const [currentSpace, setCurrentSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les espaces au démarrage
  useEffect(() => {
    const loadSpaces = async () => {
      if (!isAuthenticated || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const spacesData = await spaceService.getAllSpaces(token);
        
        setSpaces(spacesData);

        // Sélectionner l'espace actif
        // 1. Chercher dans localStorage
        const savedSpaceId = localStorage.getItem('currentSpaceId');
        let activeSpace = null;

        if (savedSpaceId) {
          activeSpace = spacesData.find(s => s.id === savedSpaceId);
        }

        // 2. Sinon, prendre le premier SCI ou le PERSONAL
        if (!activeSpace) {
          activeSpace = spacesData.find(s => s.type === 'SCI') || spacesData[0];
        }

        if (activeSpace) {
          setCurrentSpace(activeSpace);
          localStorage.setItem('currentSpaceId', activeSpace.id);
        }

        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des espaces:', err);
        setError('Impossible de charger les espaces');
      } finally {
        setLoading(false);
      }
    };

    loadSpaces();
  }, [isAuthenticated, token]);

  // Changer d'espace
  const switchSpace = async (spaceId) => {
    try {
      setError(null);
      
      // Appeler l'API pour mettre à jour lastSpaceId
      await spaceService.switchSpace(spaceId, token);

      // Trouver l'espace dans la liste
      const newSpace = spaces.find(s => s.id === spaceId);
      
      if (newSpace) {
        setCurrentSpace(newSpace);
        localStorage.setItem('currentSpaceId', spaceId);
        return { success: true };
      } else {
        throw new Error('Espace non trouvé');
      }
    } catch (err) {
      console.error('Erreur lors du changement d\'espace:', err);
      const errorMessage = err.response?.data?.error || 'Erreur lors du changement d\'espace';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Créer un nouvel espace
  const createSpace = async (spaceData) => {
    try {
      setError(null);
      const result = await spaceService.createSpace(spaceData, token);
      
      // Ajouter le nouvel espace à la liste
      const newSpace = result.space;
      setSpaces([...spaces, newSpace]);
      
      // Activer automatiquement le nouvel espace
      setCurrentSpace(newSpace);
      localStorage.setItem('currentSpaceId', newSpace.id);
      
      return { success: true, space: newSpace };
    } catch (err) {
      console.error('Erreur lors de la création de l\'espace:', err);
      const errorMessage = err.response?.data?.error || 'Erreur lors de la création';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Mettre à jour un espace
  const updateSpace = async (spaceId, updates) => {
    try {
      setError(null);
      const result = await spaceService.updateSpace(spaceId, updates, token);
      
      // Mettre à jour dans la liste
      setSpaces(spaces.map(s => s.id === spaceId ? result.space : s));
      
      // Si c'est l'espace actif, le mettre à jour aussi
      if (currentSpace?.id === spaceId) {
        setCurrentSpace(result.space);
      }
      
      return { success: true, space: result.space };
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      const errorMessage = err.response?.data?.error || 'Erreur lors de la mise à jour';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Recharger les espaces
  const refreshSpaces = async () => {
    if (!token) return;
    
    try {
      const spacesData = await spaceService.getAllSpaces(token);
      setSpaces(spacesData);
      
      // Mettre à jour currentSpace si nécessaire
      if (currentSpace) {
        const updated = spacesData.find(s => s.id === currentSpace.id);
        if (updated) {
          setCurrentSpace(updated);
        }
      }
    } catch (err) {
      console.error('Erreur lors du rechargement:', err);
    }
  };

  const value = {
    spaces,
    currentSpace,
    loading,
    error,
    switchSpace,
    createSpace,
    updateSpace,
    refreshSpaces,
    hasMultipleSpaces: spaces.length > 1,
  };

  return (
    <SpaceContext.Provider value={value}>
      {children}
    </SpaceContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useSpace = () => {
  const context = useContext(SpaceContext);
  if (!context) {
    throw new Error('useSpace doit être utilisé dans un SpaceProvider');
  }
  return context;
};

export default SpaceContext;
