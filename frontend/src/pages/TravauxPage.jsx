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
      case 'PLANIFIE': return 'bg-blue-100 text-blue-800';
      case 'EN_COURS': return 'bg-orange-100 text-orange-800';
      case 'TERMINE': return 'bg-green-100 text-green-800';
      case 'ANNULE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategorieColor = (categorie) => {
    const colors = {
      RENOVATION: 'bg-purple-100 text-purple-800',
      PLOMBERIE: 'bg-blue-100 text-blue-800',
      ELECTRICITE: 'bg-yellow-100 text-yellow-800',
      PEINTURE: 'bg-pink-100 text-pink-800',
      MENUISERIE: 'bg-amber-100 text-amber-800',
      CHAUFFAGE: 'bg-red-100 text-red-800',
      TOITURE: 'bg-gray-100 text-gray-800',
      AUTRE: 'bg-gray-100 text-gray-800',
    };
    return colors[categorie] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des travaux...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800 font-semibold mb-2">Erreur</p>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadData}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🔧 Travaux</h1>
              <p className="text-gray-600 mt-1">{travaux.length} chantier(s)</p>
            </div>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              + Ajouter des Travaux
            </button>
          </div>
        </div>
      </div>

      {/* Liste des travaux */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {travaux.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Wrench className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun travaux pour le moment
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par ajouter vos premiers travaux
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              + Ajouter des travaux
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {travaux.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wrench className="h-8 w-8 text-white" />
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategorieColor(t.categorie)}`}>
                      {t.categorie}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditForm(t)}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4 text-white" />
                    </button>
                    <button
                      onClick={() => setTravauxToDelete(t)}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6">
                  {/* Titre */}
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {t.titre}
                  </h3>
                  {t.artisan && (
                    <p className="text-sm text-gray-600 mb-3">Par: {t.artisan}</p>
                  )}

                  {/* Bien */}
                  <div className="mb-4 pb-4 border-b">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      Bien
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {t.bien?.adresse}
                    </p>
                    <p className="text-sm text-gray-600">{t.bien?.ville}</p>
                  </div>

                  {/* Description */}
                  {t.description && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {t.description}
                      </p>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Calendar className="h-4 w-4" />
                      Début: {new Date(t.dateDebut).toLocaleDateString('fr-FR')}
                    </div>
                    {t.dateFin && (
                      <div className="text-sm text-gray-600">
                        Fin: {new Date(t.dateFin).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>

                  {/* Coûts */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Euro className="h-4 w-4" />
                        Coût estimé
                      </span>
                      <span className="font-semibold text-gray-900">
                        {t.coutEstime.toLocaleString('fr-FR')} €
                      </span>
                    </div>
                    {t.coutReel && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Coût réel</span>
                        <span className={`font-bold flex items-center gap-1 ${
                          t.coutReel > t.coutEstime ? 'text-red-600' : 'text-green-600'
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Supprimer ces travaux ?
            </h3>
            <p className="text-gray-600 mb-2">
              Êtes-vous sûr de vouloir supprimer les travaux :
            </p>
            <p className="font-semibold text-gray-900 mb-2">
              {travauxToDelete.titre}
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Bien: {travauxToDelete.bien?.adresse}
            </p>
            <p className="text-sm text-red-600 mb-6">
              Cette action est irréversible
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setTravauxToDelete(null)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteTravaux(travauxToDelete.id)}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
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