import { useState, useEffect } from 'react';
import { biensAPI } from '../services/api';
import { Plus, LayoutGrid, List, Search, Home, Edit, Trash2 } from 'lucide-react';
import BiensCard from '../components/BiensCard';
import BiensTable from '../components/BiensTable';
import BienForm from '../components/BienForm';
import Loader from '../components/Loader';

function BiensPage({ onNavigate }) {
  const [biens, setBiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [bienToEdit, setBienToEdit] = useState(null);
  const [bienToDelete, setBienToDelete] = useState(null);

  useEffect(() => {
    loadBiens();
  }, []);

  const loadBiens = async () => {
    try {
      setLoading(true);
      const response = await biensAPI.getAll();
      setBiens(response.data);
    } catch (err) {
      console.error('Erreur chargement biens:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBien = async (bienData) => {
    try {
      const result = await biensAPI.create(bienData);
      await loadBiens();
      setShowForm(false);
      return result; // Retourner le bien créé pour récupérer son ID
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateBien = async (id, bienData) => {
    try {
      await biensAPI.update(id, bienData);
      await loadBiens();
      setBienToEdit(null);
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteBien = async (id) => {
    try {
      await biensAPI.delete(id);
      await loadBiens();
      setBienToDelete(null);
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const openEditForm = (bien) => {
    setBienToEdit(bien);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setBienToEdit(null);
  };

  const handleBienClick = (bien) => {
    if (onNavigate) {
      onNavigate('bien-detail', bien.id);
    }
  };

  const filteredBiens = biens.filter(bien => {
    const searchLower = searchTerm.toLowerCase();
    return (
      bien.adresse?.toLowerCase().includes(searchLower) ||
      bien.ville?.toLowerCase().includes(searchLower) ||
      bien.type?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <div className="max-w-[1600px] mx-auto px-8 py-10 animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-light-200 bg-clip-text text-transparent">Patrimoine</h1>
            <p className="text-light-300 text-lg">
              {biens.length} bien{biens.length > 1 ? 's' : ''} • 
              <span className="text-accent-blue font-semibold"> {biens.reduce((sum, b) => sum + (b.valeurActuelle || b.prixAchat), 0).toLocaleString('fr-FR')} €</span>
            </p>
          </div>

          <button
            onClick={() => {
              console.log('Bouton cliqué !');
              setShowForm(true);
            }}
            className="group relative overflow-hidden flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl shadow-accent-blue/30 hover:shadow-2xl hover:shadow-accent-blue/40 hover:scale-105"
          >
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
            <span className="relative z-10">Ajouter un bien</span>
          </button>
        </div>

        {/* Barre d'actions */}
        <div className="flex items-center justify-between mb-10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-accent-blue" />
            <input
              type="text"
              placeholder="Rechercher un bien..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-5 py-4 bg-dark-900 rounded-2xl text-white placeholder-light-400 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition shadow-card border border-dark-600/30"
            />
          </div>

          <div className="flex gap-3 bg-dark-900 rounded-2xl p-2 shadow-card border border-dark-600/30">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl transition-all ${
                viewMode === 'grid' ? 'bg-accent-blue/20 text-accent-blue shadow-glow-blue' : 'text-light-400 hover:text-white hover:bg-dark-800'
              }`}
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl transition-all ${
                viewMode === 'list' ? 'bg-accent-blue/20 text-accent-blue shadow-glow-blue' : 'text-light-400 hover:text-white hover:bg-dark-800'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        {filteredBiens.length === 0 && !searchTerm ? (
          <div className="bg-dark-900 rounded-3xl p-24 text-center animate-fade-in border border-dark-600/30 shadow-card">
            <div className="mb-10 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 blur-3xl"></div>
              <Home className="h-28 w-28 text-accent-blue/50 mx-auto relative" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">Aucun bien pour le moment</h3>
            <p className="text-light-300 mb-10 text-lg">Commencez par ajouter votre premier bien immobilier</p>
            <button
              onClick={() => setShowForm(true)}
              className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl shadow-accent-blue/30 hover:shadow-2xl hover:shadow-accent-blue/50 hover:scale-105 inline-flex items-center gap-2"
            >
              <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              <span className="relative z-10">Ajouter mon premier bien</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-6">
            {filteredBiens.map((bien, index) => (
              <div key={bien.id} className="animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                <BiensCard bien={bien} onClick={() => handleBienClick(bien)} />
              </div>
            ))}
          </div>
        ) : (
          <BiensTable biens={filteredBiens} onBienClick={handleBienClick} />
        )}

        {filteredBiens.length === 0 && searchTerm && (
          <div className="bg-dark-900 rounded-3xl py-20 text-center animate-fade-in border border-dark-600/30 shadow-card">
            <Search className="h-20 w-20 text-accent-blue/50 mx-auto mb-6" />
            <p className="text-light-200 text-xl mb-2">Aucun bien ne correspond à votre recherche</p>
            <p className="text-light-400">Essayez avec d'autres mots-clés</p>
          </div>
        )}
      </div>

      {/* Modal Formulaire */}
      {showForm && (
        <BienForm
          onClose={closeForm}
          onSubmit={bienToEdit ? handleUpdateBien : handleCreateBien}
          bienToEdit={bienToEdit}
        />
      )}

      {/* Modal Suppression */}
      {bienToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-2xl border border-dark-600 max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Supprimer ce bien ?</h3>
            <p className="text-light-200 mb-2">Êtes-vous sûr de vouloir supprimer :</p>
            <p className="font-semibold text-white mb-6">{bienToDelete.adresse}, {bienToDelete.ville}</p>
            <p className="text-sm text-red-400 mb-6">Cette action est irréversible !</p>
            <div className="flex gap-3">
              <button
                onClick={() => setBienToDelete(null)}
                className="flex-1 px-6 py-3 border border-dark-600 rounded-lg hover:bg-dark-800 transition"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteBien(bienToDelete.id)}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BiensPage;