import { useState, useEffect } from 'react';
import { evenementsFiscauxAPI, biensAPI } from '../services/api';
import { Calendar, Edit, Trash2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import EvenementFiscalForm from '../components/EvenementFiscalForm';

function EvenementsFiscauxPage() {
  const [evenements, setEvenements] = useState([]);
  const [biensList, setBiensList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [evenementToEdit, setEvenementToEdit] = useState(null);
  const [evenementToDelete, setEvenementToDelete] = useState(null);
  const [filterBien, setFilterBien] = useState('');
  const [filterStatut, setFilterStatut] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [evenementsResponse, biensResponse] = await Promise.all([
        evenementsFiscauxAPI.getAll(),
        biensAPI.getAll()
      ]);
      setEvenements(evenementsResponse.data);
      setBiensList(biensResponse.data);
      setError(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les événements fiscaux');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvenement = async (evenementData) => {
    try {
      await evenementsFiscauxAPI.create(evenementData);
      await loadData();
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateEvenement = async (id, evenementData) => {
    try {
      await evenementsFiscauxAPI.update(id, evenementData);
      await loadData();
      setEvenementToEdit(null);
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteEvenement = async (id) => {
    try {
      await evenementsFiscauxAPI.delete(id);
      await loadData();
      setEvenementToDelete(null);
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const openEditForm = (evenement) => {
    setEvenementToEdit(evenement);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEvenementToEdit(null);
  };

  const getTypeLabel = (type) => {
    const labels = {
      'TAXE_FONCIERE': 'Taxe foncière',
      'CFE': 'CFE',
      'DECLARATION_REVENUS': 'Déclaration revenus fonciers',
      'TVA': 'Déclaration TVA',
      'AUTRE': 'Autre'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      'TAXE_FONCIERE': 'bg-red-100 text-red-800',
      'CFE': 'bg-orange-100 text-orange-800',
      'DECLARATION_REVENUS': 'bg-blue-100 text-blue-800',
      'TVA': 'bg-purple-100 text-purple-800',
      'AUTRE': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const isOverdue = (dateEcheance, estPaye) => {
    if (estPaye) return false;
    return new Date(dateEcheance) < new Date();
  };

  const isDueSoon = (dateEcheance, estPaye) => {
    if (estPaye) return false;
    const today = new Date();
    const echeance = new Date(dateEcheance);
    const diffTime = echeance - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  };

  const filteredEvenements = evenements.filter(evt => {
    if (filterBien && evt.bienId !== filterBien) return false;
    if (filterStatut === 'PAYE' && !evt.estPaye) return false;
    if (filterStatut === 'IMPAYE' && evt.estPaye) return false;
    if (filterStatut === 'RETARD' && !isOverdue(evt.dateEcheance, evt.estPaye)) return false;
    return true;
  });

  const evenementsEnRetard = evenements.filter(evt => isOverdue(evt.dateEcheance, evt.estPaye)).length;
  const evenementsProchainement = evenements.filter(evt => isDueSoon(evt.dateEcheance, evt.estPaye)).length;
  const totalImpaye = evenements.filter(evt => !evt.estPaye && evt.montant).reduce((sum, evt) => sum + evt.montant, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des événements fiscaux...</p>
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
          <button onClick={loadData} className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📅 Événements Fiscaux</h1>
              <p className="text-gray-600 mt-1">{filteredEvenements.length} événement(s)</p>
            </div>
            <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
              + Ajouter un Événement
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {evenementsEnRetard > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900">{evenementsEnRetard} en retard</p>
                  <p className="text-sm text-red-700">Action urgente requise</p>
                </div>
              </div>
            )}
            {evenementsProchainement > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-orange-900">{evenementsProchainement} à venir</p>
                  <p className="text-sm text-orange-700">Dans les 30 jours</p>
                </div>
              </div>
            )}
            {totalImpaye > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-blue-900">{totalImpaye.toLocaleString('fr-FR')} € à payer</p>
                  <p className="text-sm text-blue-700">Total impayé</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filtrer par bien</label>
              <select value={filterBien} onChange={(e) => setFilterBien(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Tous les biens</option>
                {biensList.map(bien => (
                  <option key={bien.id} value={bien.id}>{bien.adresse}, {bien.ville}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filtrer par statut</label>
              <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Tous les statuts</option>
                <option value="PAYE">Payé</option>
                <option value="IMPAYE">Impayé</option>
                <option value="RETARD">En retard</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredEvenements.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun événement fiscal</h3>
            <p className="text-gray-600 mb-6">
              {evenements.length === 0 ? "Commencez par ajouter vos premiers événements fiscaux" : "Aucun événement ne correspond aux filtres sélectionnés"}
            </p>
            {evenements.length === 0 && (
              <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                + Ajouter un événement
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvenements.map((evenement) => {
              const overdue = isOverdue(evenement.dateEcheance, evenement.estPaye);
              const dueSoon = isDueSoon(evenement.dateEcheance, evenement.estPaye);

              return (
                <div key={evenement.id} className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition p-6 ${overdue ? 'border-l-4 border-red-500' : dueSoon ? 'border-l-4 border-orange-500' : evenement.estPaye ? 'border-l-4 border-green-500' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${getTypeColor(evenement.type)}`}>
                          {getTypeLabel(evenement.type)}
                        </span>
                        {evenement.estPaye ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                            <CheckCircle className="h-4 w-4" />
                            Payé
                          </span>
                        ) : overdue ? (
                          <span className="flex items-center gap-1 text-red-600 text-sm font-semibold">
                            <AlertCircle className="h-4 w-4" />
                            En retard
                          </span>
                        ) : dueSoon ? (
                          <span className="flex items-center gap-1 text-orange-600 text-sm font-semibold">
                            <Clock className="h-4 w-4" />
                            Bientôt
                          </span>
                        ) : null}
                      </div>

                      {evenement.bien && (
                        <p className="text-lg font-bold text-gray-900 mb-2">
                          {evenement.bien.adresse}, {evenement.bien.ville}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Échéance</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(evenement.dateEcheance).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        {evenement.montant && (
                          <div>
                            <p className="text-gray-600">Montant</p>
                            <p className="font-semibold text-gray-900">
                              {evenement.montant.toLocaleString('fr-FR')} €
                            </p>
                          </div>
                        )}
                        {evenement.datePaiement && (
                          <div>
                            <p className="text-gray-600">Payé le</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(evenement.datePaiement).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        )}
                      </div>

                      {evenement.notes && (
                        <p className="text-sm text-gray-600 mt-3 italic">{evenement.notes}</p>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button onClick={() => openEditForm(evenement)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Modifier">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button onClick={() => setEvenementToDelete(evenement)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Supprimer">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <EvenementFiscalForm
          onClose={closeForm}
          onSubmit={evenementToEdit ? handleUpdateEvenement : handleCreateEvenement}
          evenementToEdit={evenementToEdit}
          biensList={biensList}
        />
      )}

      {evenementToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Supprimer cet événement ?</h3>
            <p className="text-gray-600 mb-2">Êtes-vous sûr de vouloir supprimer :</p>
            <p className="font-semibold text-gray-900 mb-6">{getTypeLabel(evenementToDelete.type)} - {new Date(evenementToDelete.dateEcheance).toLocaleDateString('fr-FR')}</p>
            <p className="text-sm text-red-600 mb-6">Cette action est irréversible</p>
            <div className="flex gap-3">
              <button onClick={() => setEvenementToDelete(null)} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-semibold">Annuler</button>
              <button onClick={() => handleDeleteEvenement(evenementToDelete.id)} className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EvenementsFiscauxPage;