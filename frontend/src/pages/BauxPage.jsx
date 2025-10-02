import { useState, useEffect } from 'react';
import { bauxAPI, biensAPI, locatairesAPI } from '../services/api';
import { FileText, Building2, User, Edit, Trash2, Calendar, Euro } from 'lucide-react';
import BailForm from '../components/BailForm';

function BauxPage() {
  const [baux, setBaux] = useState([]);
  const [biens, setBiens] = useState([]);
  const [locataires, setLocataires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [bailToEdit, setBailToEdit] = useState(null);
  const [bailToDelete, setBailToDelete] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bauxData, biensData, locatairesData] = await Promise.all([
        bauxAPI.getAll(),
        biensAPI.getAll(),
        locatairesAPI.getAll()
      ]);
      setBaux(bauxData.data);
      setBiens(biensData.data);
      setLocataires(locatairesData.data);
      setError(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les baux');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBail = async (bailData) => {
    try {
      await bauxAPI.create(bailData);
      await loadData();
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateBail = async (id, bailData) => {
    try {
      await bauxAPI.update(id, bailData);
      await loadData();
      setBailToEdit(null);
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteBail = async (id) => {
    try {
      await bauxAPI.delete(id);
      await loadData();
      setBailToDelete(null);
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const openEditForm = (bail) => {
    setBailToEdit(bail);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setBailToEdit(null);
  };

  const getStatutColor = (statut) => {
    switch(statut) {
      case 'ACTIF': return 'bg-green-100 text-green-800';
      case 'TERMINE': return 'bg-gray-100 text-gray-800';
      case 'RESILIE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des baux...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800 font-semibold mb-2">❌ Erreur</p>
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
              <h1 className="text-3xl font-bold text-gray-900">📄 Baux</h1>
              <p className="text-gray-600 mt-1">{baux.length} bail/baux</p>
            </div>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              + Créer un Bail
            </button>
          </div>
        </div>
      </div>

      {/* Liste des baux */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {baux.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun bail pour le moment
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par créer votre premier bail !
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              + Créer mon premier bail
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {baux.map((bail) => (
              <div
                key={bail.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-white" />
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
                      {bail.typeBail}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditForm(bail)}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4 text-white" />
                    </button>
                    <button
                      onClick={() => setBailToDelete(bail)}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6">
                  {/* Bien */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      Bien
                    </p>
                    <p className="font-semibold text-gray-900">
                      {bail.bien?.adresse}
                    </p>
                    <p className="text-sm text-gray-600">
                      {bail.bien?.ville} - {bail.bien?.type}
                    </p>
                  </div>

                  {/* Locataire */}
                  <div className="mb-4 pb-4 border-b">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Locataire
                    </p>
                    <p className="font-semibold text-gray-900">
                      {bail.locataire?.typeLocataire === 'ENTREPRISE' 
                        ? bail.locataire?.raisonSociale 
                        : `${bail.locataire?.prenom} ${bail.locataire?.nom}`}
                    </p>
                  </div>

                  {/* Infos financières */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Euro className="h-4 w-4" />
                        Loyer HC
                      </span>
                      <span className="font-semibold text-green-600">
                        {bail.loyerHC.toLocaleString('fr-FR')} € /mois
                      </span>
                    </div>
                    {bail.charges && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Charges</span>
                        <span className="font-semibold">
                          {bail.charges.toLocaleString('fr-FR')} €
                        </span>
                      </div>
                    )}
                    {bail.depotGarantie && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Dépôt garantie</span>
                        <span className="font-semibold">
                          {bail.depotGarantie.toLocaleString('fr-FR')} €
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Dates et durée */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Calendar className="h-4 w-4" />
                      Début: {new Date(bail.dateDebut).toLocaleDateString('fr-FR')}
                    </div>
                    {bail.dateFin && (
                      <div className="text-sm text-gray-600">
                        Fin: {new Date(bail.dateFin).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                    <div className="text-sm text-gray-600 mt-1">
                      Durée: {bail.duree} mois
                    </div>
                  </div>

                  {/* Statut */}
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatutColor(bail.statut)}`}>
                      {bail.statut}
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
        <BailForm
          onClose={closeForm}
          onSubmit={bailToEdit ? handleUpdateBail : handleCreateBail}
          bailToEdit={bailToEdit}
          biensList={biens}
          locatairesList={locataires}
        />
      )}

      {/* Modal Confirmation Suppression */}
      {bailToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              🗑️ Supprimer ce bail ?
            </h3>
            <p className="text-gray-600 mb-2">
              Êtes-vous sûr de vouloir supprimer le bail :
            </p>
            <p className="font-semibold text-gray-900 mb-2">
              {bailToDelete.bien?.adresse}
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Locataire: {bailToDelete.locataire?.typeLocataire === 'ENTREPRISE' 
                ? bailToDelete.locataire?.raisonSociale 
                : `${bailToDelete.locataire?.prenom} ${bailToDelete.locataire?.nom}`}
            </p>
            <p className="text-sm text-red-600 mb-6">
              ⚠️ Cette action est irréversible !
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setBailToDelete(null)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteBail(bailToDelete.id)}
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

export default BauxPage;