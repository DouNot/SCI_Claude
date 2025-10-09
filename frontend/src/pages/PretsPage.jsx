import { useState, useEffect } from 'react';
import { pretsAPI, biensAPI } from '../services/api';
import { DollarSign, Building2, Edit, Trash2, Calendar, Eye, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PretForm from '../components/PretForm';

function PretsPage() {
  const [prets, setPrets] = useState([]);
  const [biens, setBiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [pretToEdit, setPretToEdit] = useState(null);
  const [pretToDelete, setPretToDelete] = useState(null);
  const [pretDetails, setPretDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pretsData, biensData] = await Promise.all([
        pretsAPI.getAll(),
        biensAPI.getAll()
      ]);
      setPrets(pretsData.data);
      setBiens(biensData.data);
      setError(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les prêts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePret = async (pretData) => {
    try {
      await pretsAPI.create(pretData);
      await loadData();
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdatePret = async (id, pretData) => {
    try {
      await pretsAPI.update(id, pretData);
      await loadData();
      setPretToEdit(null);
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleDeletePret = async (id) => {
    try {
      await pretsAPI.delete(id);
      await loadData();
      setPretToDelete(null);
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const viewPretDetails = async (pret) => {
    try {
      setLoadingDetails(true);
      const response = await pretsAPI.getById(pret.id);
      setPretDetails(response.data);
    } catch (err) {
      console.error('Erreur:', err);
      alert('Impossible de charger les détails du prêt');
      setLoadingDetails(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const openEditForm = (pret) => {
    setPretToEdit(pret);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setPretToEdit(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des prêts...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">💰 Prêts Immobiliers</h1>
              <p className="text-gray-600 mt-1">{prets.length} prêt(s)</p>
            </div>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              + Ajouter un Prêt
            </button>
          </div>
        </div>
      </div>

      {/* Liste des prêts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {prets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <DollarSign className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun prêt pour le moment
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par ajouter vos prêts immobiliers
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              + Ajouter un prêt
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prets.map((pret) => (
              <div
                key={pret.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-8 w-8 text-white" />
                    <span className="text-white font-semibold text-lg">
                      {(pret.duree / 12).toFixed(0)} ans
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewPretDetails(pret)}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
                      title="Voir détails"
                    >
                      <Eye className="h-4 w-4 text-white" />
                    </button>
                    <button
                      onClick={() => openEditForm(pret)}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4 text-white" />
                    </button>
                    <button
                      onClick={() => setPretToDelete(pret)}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6">
                  {/* Organisme */}
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {pret.organisme}
                  </h3>
                  {pret.numeroContrat && (
                    <p className="text-sm text-gray-600 mb-3">N° {pret.numeroContrat}</p>
                  )}

                  {/* Bien */}
                  <div className="mb-4 pb-4 border-b">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      Bien financé
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {pret.bien?.adresse}
                    </p>
                    <p className="text-sm text-gray-600">{pret.bien?.ville}</p>
                  </div>

                  {/* Montants */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Montant emprunté</span>
                      <span className="font-semibold text-gray-900">
                        {pret.montant.toLocaleString('fr-FR')} €
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Taux</span>
                      <span className="font-semibold text-gray-900">
                        {pret.taux}%
                      </span>
                    </div>
                    {pret.tauxAssurance && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Assurance</span>
                        <span className="font-semibold text-gray-900">
                          {pret.tauxAssurance}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Mensualité */}
                  <div className="bg-green-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-green-700 mb-1">Mensualité</p>
                    <p className="text-2xl font-bold text-green-900">
                      {pret.mensualite.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </p>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    Depuis le {new Date(pret.dateDebut).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Formulaire */}
      {showForm && (
        <PretForm
          onClose={closeForm}
          onSubmit={pretToEdit ? handleUpdatePret : handleCreatePret}
          pretToEdit={pretToEdit}
          biensList={biens}
        />
      )}

      {/* Modal Détails du prêt avec tableau d'amortissement */}
      {(pretDetails || loadingDetails) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Détails du prêt{pretDetails && pretDetails.organisme ? ` - ${pretDetails.organisme}` : ''}
              </h2>
              <button 
                onClick={() => setPretDetails(null)} 
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-6">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement du tableau d'amortissement...</p>
                  </div>
                </div>
              ) : pretDetails && pretDetails.amortissement ? (
              <>
              {/* Résumé */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-700 mb-1">Mensualité</p>
                  <p className="text-xl font-bold text-blue-900">
                    {pretDetails.amortissement.mensualiteTotale.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-700 mb-1">Coût total</p>
                  <p className="text-xl font-bold text-green-900">
                    {pretDetails.amortissement.coutTotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-orange-700 mb-1">Coût intérêts</p>
                  <p className="text-xl font-bold text-orange-900">
                    {pretDetails.amortissement.coutInterets.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-700 mb-1">Coût assurance</p>
                  <p className="text-xl font-bold text-purple-900">
                    {pretDetails.amortissement.coutAssurance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </p>
                </div>
              </div>

              {/* Graphique d'évolution */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Évolution Capital / Intérêts
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={pretDetails.amortissement.tableau.filter((_, index) => index % Math.ceil(pretDetails.amortissement.tableau.length / 50) === 0)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="mois" 
                      label={{ value: 'Mois', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'Montant (€)', angle: -90, position: 'insideLeft' }}
                      tickFormatter={(value) => value.toLocaleString('fr-FR')}
                    />
                    <Tooltip 
                      formatter={(value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'}
                      labelFormatter={(label) => `Mois ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="capitalRestant" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Capital restant dû"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="capitalAmortiCumule" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Capital amorti cumulé"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="interets" 
                      stroke="#f97316" 
                      strokeWidth={2}
                      name="Intérêts"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Tableau d'amortissement */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tableau d'amortissement
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mois</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Mensualité</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Capital</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Intérêts</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Assurance</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Restant dû</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pretDetails.amortissement.tableau.map((ligne) => (
                        <tr key={ligne.mois} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{ligne.mois}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(ligne.date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {ligne.mensualite.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </td>
                          <td className="px-4 py-3 text-sm text-green-600 text-right font-semibold">
                            {ligne.capital.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </td>
                          <td className="px-4 py-3 text-sm text-orange-600 text-right">
                            {ligne.interets.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </td>
                          <td className="px-4 py-3 text-sm text-purple-600 text-right">
                            {ligne.assurance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </td>
                          <td className="px-4 py-3 text-sm text-blue-600 text-right font-semibold">
                            {ligne.capitalRestant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              </>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <p className="text-red-800 font-semibold mb-2">Erreur</p>
                  <p className="text-red-600">Impossible de charger le tableau d'amortissement</p>
                  <pre className="mt-4 text-xs bg-white p-4 rounded overflow-auto">
                    {JSON.stringify(pretDetails, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4">
              <button
                onClick={() => { setPretDetails(null); setLoadingDetails(false); }}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation Suppression */}
      {pretToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Supprimer ce prêt ?
            </h3>
            <p className="text-gray-600 mb-2">
              Êtes-vous sûr de vouloir supprimer le prêt :
            </p>
            <p className="font-semibold text-gray-900 mb-2">
              {pretToDelete.organisme}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Montant : {pretToDelete.montant.toLocaleString('fr-FR')} €
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Bien : {pretToDelete.bien?.adresse}
            </p>
            <p className="text-sm text-red-600 mb-6">
              Cette action est irréversible
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPretToDelete(null)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeletePret(pretToDelete.id)}
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

export default PretsPage;