import { useState, useEffect } from 'react';
import { travauxAPI, biensAPI } from '../services/api';
import { Wrench, Building2, Edit, Trash2, Calendar, Euro, TrendingUp, TrendingDown } from 'lucide-react';
import TravauxForm from '../components/TravauxForm';

function TravauxPage() {
  const [travaux, setTravaux] = useState([]);
  const [biens, setBiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [travauxToEdit, setTravauxToEdit] = useState(null);
  const [travauxToDelete, setTravauxToDelete] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [travauxData, biensData] = await Promise.all([
        travauxAPI.getAll(),
        biensAPI.getAll()
      ]);
      setTravaux(travauxData.data);
      setBiens(biensData.data);
      setError(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les travaux');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTravaux = async (travauxData) => {
    try {
      await travauxAPI.create(travauxData);
      await loadData();
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateTravaux = async (id, travauxData) => {
    try {
      await travauxAPI.update(id, travauxData);
      await loadData();
      setTravauxToEdit(null);
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteTravaux = async (id) => {
    try {
      await travauxAPI.delete(id);
      await loadData();
      setTravauxToDelete(null);
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const openEditForm = (travaux) => {
    setTravauxToEdit(travaux);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setTravauxToEdit(null);
  };

  const getEtatColor = (etat) => {
    switch(etat) {
      case 'PLANIFIE': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'EN_COURS': return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      case 'TERMINE': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'ANNULE': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const getCategorieColor = (categorie) => {
    const colors = {
      RENOVATION: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      PLOMBERIE: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      ELECTRICITE: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      PEINTURE: 'bg-pink-500/20 text-pink-400 border border-pink-500/30',
      MENUISERIE: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      CHAUFFAGE: 'bg-red-500/20 text-red-400 border border-red-500/30',
      TOITURE: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
      AUTRE: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
    };
    return colors[categorie] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-light-200">Chargement des travaux...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md">
          <p className="text-red-400 font-semibold mb-2">Erreur</p>
          <p className="text-red-300">{error}</p>
          <button 
            onClick={loadData}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <div className="max-w-[1600px] mx-auto px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-light-200 bg-clip-text text-transparent">
              Travaux
            </h1>
            <p className="text-light-300 text-lg">{travaux.length} chantier{travaux.length > 1 ? 's' : ''}</p>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="group relative overflow-hidden flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl shadow-accent-blue/30 hover:shadow-2xl hover:shadow-accent-blue/40 hover:scale-105"
          >
            <Wrench className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
            <span className="relative z-10">Ajouter des Travaux</span>
          </button>
        </div>

        {/* Liste des travaux */}
        {travaux.length === 0 ? (
          <div className="bg-dark-900 rounded-3xl p-24 text-center border border-dark-600/30 shadow-card">
            <div className="mb-10 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 blur-3xl"></div>
              <Wrench className="h-28 w-28 text-accent-blue/50 mx-auto relative" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">Aucun travaux pour le moment</h3>
            <p className="text-light-300 mb-10 text-lg">Commencez par ajouter vos premiers travaux</p>
            <button 
              onClick={() => setShowForm(true)}
              className="group px-8 py-4 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl shadow-accent-blue/30 hover:shadow-2xl hover:shadow-accent-blue/50 hover:scale-105 inline-flex items-center gap-2"
            >
              <Wrench className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
              <span>Ajouter des travaux</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {travaux.map((t) => (
              <div
                key={t.id}
                className="bg-dark-900 rounded-2xl border border-dark-600 hover:border-dark-500 shadow-card hover:shadow-glow transition p-6"
              >
                {/* Header avec icône et actions */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Wrench className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {t.titre}
                      </h3>
                      {t.artisan && (
                        <p className="text-sm text-light-400">{t.artisan}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditForm(t)}
                      className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-light-300 hover:text-white transition"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setTravauxToDelete(t)}
                      className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-red-400 hover:text-red-300 transition"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Catégorie */}
                <div className="mb-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getCategorieColor(t.categorie)}`}>
                    {t.categorie}
                  </span>
                </div>

                {/* Bien */}
                <div className="mb-4 pb-4 border-b border-dark-600">
                  <p className="text-xs text-light-400 mb-1 flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    Bien
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {t.bien?.adresse}
                  </p>
                  <p className="text-sm text-light-300">{t.bien?.ville}</p>
                </div>

                {/* Description */}
                {t.description && (
                  <div className="mb-4">
                    <p className="text-sm text-light-300 line-clamp-2">
                      {t.description}
                    </p>
                  </div>
                )}

                {/* Dates */}
                <div className="bg-dark-800 rounded-lg p-3 mb-4 border border-dark-600">
                  <div className="flex items-center gap-2 text-sm text-light-300 mb-1">
                    <Calendar className="h-4 w-4" />
                    Début: {new Date(t.dateDebut).toLocaleDateString('fr-FR')}
                  </div>
                  {t.dateFin && (
                    <div className="text-sm text-light-300">
                      Fin: {new Date(t.dateFin).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>

                {/* Coûts */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-light-300 flex items-center gap-1">
                      <Euro className="h-4 w-4" />
                      Coût estimé
                    </span>
                    <span className="font-semibold text-white">
                      {t.coutEstime.toLocaleString('fr-FR')} €
                    </span>
                  </div>
                  {t.coutReel && (
                    <div className="flex justify-between text-sm">
                      <span className="text-light-300">Coût réel</span>
                      <span className={`font-bold flex items-center gap-1 ${
                        t.coutReel > t.coutEstime ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {t.coutReel > t.coutEstime ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {t.coutReel.toLocaleString('fr-FR')} €
                      </span>
                    </div>
                  )}
                </div>

                {/* État */}
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getEtatColor(t.etat)}`}>
                    {t.etat.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Formulaire */}
      {showForm && (
        <TravauxForm
          onClose={closeForm}
          onSubmit={travauxToEdit ? handleUpdateTravaux : handleCreateTravaux}
          travauxToEdit={travauxToEdit}
          biensList={biens}
        />
      )}

      {/* Modal Confirmation Suppression */}
      {travauxToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-dark-900 rounded-2xl border border-dark-600 max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Supprimer ces travaux ?
            </h3>
            <p className="text-light-200 mb-2">
              Êtes-vous sûr de vouloir supprimer les travaux :
            </p>
            <p className="font-semibold text-white mb-2">
              {travauxToDelete.titre}
            </p>
            <p className="text-sm text-light-300 mb-6">
              Bien: {travauxToDelete.bien?.adresse}
            </p>
            <p className="text-sm text-red-400 mb-6">
              Cette action est irréversible
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setTravauxToDelete(null)}
                className="flex-1 px-6 py-3 border border-dark-600 rounded-lg text-light-200 hover:bg-dark-800 transition font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteTravaux(travauxToDelete.id)}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 transition font-semibold"
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

export default TravauxPage;
