import { useState, useEffect } from 'react';
import { associesAPI } from '../services/api';
import { UsersRound, Edit, Trash2, Mail, Phone, PieChart } from 'lucide-react';
import AssocieForm from '../components/AssocieForm';

function AssociesPage() {
  const [associes, setAssocies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [associeToEdit, setAssocieToEdit] = useState(null);
  const [associeToDelete, setAssocieToDelete] = useState(null);

  useEffect(() => {
    loadAssocies();
  }, []);

  const loadAssocies = async () => {
    try {
      setLoading(true);
      const response = await associesAPI.getAll();
      setAssocies(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les associés');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssocie = async (associeData) => {
    try {
      await associesAPI.create(associeData);
      await loadAssocies();
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateAssocie = async (id, associeData) => {
    try {
      await associesAPI.update(id, associeData);
      await loadAssocies();
      setAssocieToEdit(null);
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteAssocie = async (id) => {
    try {
      await associesAPI.delete(id);
      await loadAssocies();
      setAssocieToDelete(null);
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const openEditForm = (associe) => {
    setAssocieToEdit(associe);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setAssocieToEdit(null);
  };

  const totalParts = associes.reduce((sum, a) => sum + a.pourcentageParts, 0);
  const partsRestantes = 100 - totalParts;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des associés...</p>
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
            onClick={loadAssocies}
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">👥 Associés SCI</h1>
              <p className="text-gray-600 mt-1">{associes.length} associé(s)</p>
            </div>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              + Ajouter un Associé
            </button>
          </div>

          {/* Répartition des parts */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Répartition du capital</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Parts attribuées</p>
                  <p className="text-2xl font-bold text-blue-600">{totalParts.toFixed(2)}%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Parts restantes</p>
                  <p className={`text-2xl font-bold ${partsRestantes === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {partsRestantes.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
            {partsRestantes !== 0 && (
              <p className="text-sm text-orange-600 mt-2">
                Attention : Le total des parts doit être égal à 100%
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Liste des associés */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {associes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <UsersRound className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun associé pour le moment
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par ajouter les associés de votre SCI
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              + Ajouter un associé
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {associes.map((associe) => (
              <div
                key={associe.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UsersRound className="h-8 w-8 text-white" />
                    <div className="bg-white/20 px-3 py-1 rounded-full">
                      <span className="text-white font-bold text-lg">
                        {associe.pourcentageParts}%
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditForm(associe)}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4 text-white" />
                    </button>
                    <button
                      onClick={() => setAssocieToDelete(associe)}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6">
                  {/* Nom */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {associe.prenom} {associe.nom}
                  </h3>

                  {/* Coordonnées */}
                  <div className="space-y-2">
                    {associe.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <a href={`mailto:${associe.email}`} className="hover:text-blue-600 truncate">
                          {associe.email}
                        </a>
                      </div>
                    )}
                    {associe.telephone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <a href={`tel:${associe.telephone}`} className="hover:text-blue-600">
                          {associe.telephone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Parts */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="bg-indigo-50 rounded-lg p-3">
                      <p className="text-xs text-indigo-700 mb-1">Parts détenues</p>
                      <p className="text-2xl font-bold text-indigo-900">
                        {associe.pourcentageParts}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Formulaire */}
      {showForm && (
        <AssocieForm
          onClose={closeForm}
          onSubmit={associeToEdit ? handleUpdateAssocie : handleCreateAssocie}
          associeToEdit={associeToEdit}
        />
      )}

      {/* Modal Confirmation Suppression */}
      {associeToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Supprimer cet associé ?
            </h3>
            <p className="text-gray-600 mb-2">
              Êtes-vous sûr de vouloir supprimer l'associé :
            </p>
            <p className="font-semibold text-gray-900 mb-2">
              {associeToDelete.prenom} {associeToDelete.nom}
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Parts détenues : {associeToDelete.pourcentageParts}%
            </p>
            <p className="text-sm text-red-600 mb-6">
              Cette action est irréversible
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setAssocieToDelete(null)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteAssocie(associeToDelete.id)}
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

export default AssociesPage;