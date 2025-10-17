import { useState, useRef, useEffect } from 'react';
import { useSpace } from '../contexts/SpaceContext';
import { Building2, ChevronDown, Plus, Check } from 'lucide-react';
import CreateSpaceModal from './CreateSpaceModal';

const SpaceSwitcher = () => {
  const { spaces, currentSpace, switchSpace, createSpace, loading } = useSpace();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const dropdownRef = useRef(null);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSwitchSpace = async (spaceId) => {
    if (spaceId === currentSpace?.id) {
      setIsOpen(false);
      return;
    }

    setIsSwitching(true);
    const result = await switchSpace(spaceId);
    setIsSwitching(false);

    if (result.success) {
      setIsOpen(false);
      // Le SpaceContext a déjà mis à jour currentSpace
      // Les composants qui écoutent currentSpace vont se recharger automatiquement
    }
  };

  if (loading || !currentSpace) {
    return (
      <div className="px-4 py-3 bg-slate-800 rounded-xl animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-32"></div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all flex items-center justify-between gap-3 group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div className="text-left min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {currentSpace.nom}
            </p>
            <p className="text-xs text-slate-400">
              {currentSpace.type === 'PERSONAL' ? 'Espace personnel' : 'SCI'}
            </p>
          </div>
        </div>
        <ChevronDown 
          className={`h-5 w-5 text-slate-400 transition-transform flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          } ${isSwitching ? 'animate-spin' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl py-2 z-20 max-h-80 overflow-y-auto">
            {/* Liste des espaces */}
            <div className="px-2">
              <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Mes espaces
              </p>
              {spaces.map((space) => {
                const isActive = space.id === currentSpace.id;
                const Icon = space.type === 'PERSONAL' ? Building2 : Building2;

                return (
                  <button
                    key={space.id}
                    onClick={() => handleSwitchSpace(space.id)}
                    disabled={isSwitching}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isActive
                          ? 'bg-white/20'
                          : 'bg-gradient-to-br from-blue-500 to-purple-600'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-white'}`} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold truncate">{space.nom}</p>
                      <p className={`text-xs ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                        {space.type === 'PERSONAL' ? 'Espace personnel' : 'SCI'}
                        {space.nbBiens > 0 && ` • ${space.nbBiens} bien${space.nbBiens > 1 ? 's' : ''}`}
                      </p>
                    </div>
                    {isActive && <Check className="h-5 w-5 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Créer une nouvelle SCI */}
            <div className="border-t border-slate-600 mt-2 pt-2 px-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowCreateModal(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              >
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Plus className="h-5 w-5 text-green-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold">Créer une SCI</p>
                  <p className="text-xs text-slate-400">Nouvel espace de gestion</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal de création SCI */}
      {showCreateModal && (
        <CreateSpaceModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={createSpace}
        />
      )}
    </div>
  );
};

export default SpaceSwitcher;
