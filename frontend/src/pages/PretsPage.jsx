import { useState, useEffect } from 'react';
import { pretsAPI, biensAPI } from '../services/api';
import { DollarSign, Building2, Edit, Trash2, Calendar, Eye, X, Download } from 'lucide-react';
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
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-light-200">Chargement des prêts...</p>
        </div>
      </div>
    );
  };

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
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-white to-light-200 bg-clip-text text-transparent">
                Prêts Immobiliers
              </span>
            </h1>
            <p className="text-light-300 text-lg">{prets.length} prêt{prets.length > 1 ? 's' : ''}</p>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="group relative overflow-hidden flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl shadow-accent-blue/30 hover:shadow-2xl hover:shadow-accent-blue/40 hover:scale-105"
          >
            <DollarSign className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
            <span className="relative z-10">Ajouter un Prêt</span>
          </button>
        </div>

        {/* Liste des prêts */}
        {prets.length === 0 ? (
          <div className="bg-dark-900 rounded-3xl p-24 text-center border border-dark-600/30 shadow-card">
            <div className="mb-10 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 blur-3xl"></div>
              <DollarSign className="h-28 w-28 text-accent-blue/50 mx-auto relative" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">Aucun prêt pour le moment</h3>
            <p className="text-light-300 mb-10 text-lg">Commencez par ajouter vos prêts immobiliers</p>
            <button 
              onClick={() => setShowForm(true)}
              className="group px-8 py-4 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl shadow-accent-blue/30 hover:shadow-2xl hover:shadow-accent-blue/50 hover:scale-105 inline-flex items-center gap-2"
            >
              <DollarSign className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              <span>Ajouter un prêt</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prets.map((pret) => (
              <div
                key={pret.id}
                className="bg-dark-900 rounded-2xl border border-dark-600 hover:border-dark-500 shadow-card hover:shadow-glow transition p-6"
              >
                {/* Header avec icône et actions */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {pret.organisme}
                      </h3>
                      {pret.numeroContrat && (
                        <p className="text-sm text-light-400">N° {pret.numeroContrat}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewPretDetails(pret)}
                      className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-light-300 hover:text-white transition"
                      title="Voir détails"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEditForm(pret)}
                      className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-light-300 hover:text-white transition"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setPretToDelete(pret)}
                      className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-red-400 hover:text-red-300 transition"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Bien */}
                <div className="mb-4 pb-4 border-b border-dark-600">
                  <p className="text-xs text-light-400 mb-1 flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    Bien financé
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {pret.bien?.adresse}
                  </p>
                  <p className="text-sm text-light-300">{pret.bien?.ville}</p>
                </div>

                {/* Montant emprunté - Mise en avant */}
                <div className="mb-4">
                  <p className="text-xs text-light-400 mb-1">Montant emprunté</p>
                  <p className="text-3xl font-bold text-white">
                    {pret.montant.toLocaleString('fr-FR')} €
                  </p>
                </div>

                {/* Détails */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-light-300">Durée</span>
                    <span className="font-semibold text-white">
                      {(pret.duree / 12).toFixed(0)} ans
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-light-300">Taux</span>
                    <span className="font-semibold text-white">
                      {pret.taux}%
                    </span>
                  </div>
                  {pret.tauxAssurance && (
                    <div className="flex justify-between text-sm">
                      <span className="text-light-300">Assurance</span>
                      <span className="font-semibold text-white">
                        {pret.tauxAssurance}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Mensualité */}
                <div className="bg-dark-800 rounded-lg p-3 mb-4 border border-dark-600">
                  <p className="text-xs text-light-400 mb-1">Mensualité</p>
                  <p className="text-xl font-bold text-blue-400">
                    {pret.mensualite.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </p>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-light-300">
                  <Calendar className="h-4 w-4" />
                  Depuis le {new Date(pret.dateDebut).toLocaleDateString('fr-FR')}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-dark-900 rounded-2xl border border-dark-600 max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-dark-900 border-b border-dark-600 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-white">
                Détails du prêt{pretDetails && pretDetails.organisme ? ` - ${pretDetails.organisme}` : ''}
              </h2>
              <button 
                onClick={() => setPretDetails(null)} 
                className="text-light-400 hover:text-white transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-6">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-light-200">Chargement du tableau d'amortissement...</p>
                  </div>
                </div>
              ) : pretDetails && pretDetails.amortissement ? (
              <>
              {/* Résumé */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-sm text-blue-400 mb-1">Mensualité</p>
                  <p className="text-xl font-bold text-blue-300">
                    {pretDetails.amortissement.mensualiteTotale.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </p>
                </div>
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                  <p className="text-sm text-green-400 mb-1">Coût total</p>
                  <p className="text-xl font-bold text-green-300">
                    {pretDetails.amortissement.coutTotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </p>
                </div>
                <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
                  <p className="text-sm text-orange-400 mb-1">Coût intérêts</p>
                  <p className="text-xl font-bold text-orange-300">
                    {pretDetails.amortissement.coutInterets.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </p>
                </div>
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-sm text-purple-400 mb-1">Coût assurance</p>
                  <p className="text-xl font-bold text-purple-300">
                    {pretDetails.amortissement.coutAssurance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </p>
                </div>
              </div>

              {/* Graphique d'évolution */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Évolution Capital / Intérêts
                </h3>
                <div className="bg-dark-800 rounded-lg p-4 border border-dark-600">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={pretDetails.amortissement.tableau.filter((_, index) => index % Math.ceil(pretDetails.amortissement.tableau.length / 50) === 0)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="mois" 
                        label={{ value: 'Mois', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
                        stroke="#9ca3af"
                      />
                      <YAxis 
                        label={{ value: 'Montant (€)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                        tickFormatter={(value) => value.toLocaleString('fr-FR')}
                        stroke="#9ca3af"
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                        formatter={(value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'}
                        labelFormatter={(label) => `Mois ${label}`}
                      />
                      <Legend wrapperStyle={{ color: '#9ca3af' }} />
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
              </div>

              {/* Tableau d'amortissement */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Tableau d'amortissement
                </h3>
                <div className="overflow-x-auto bg-dark-800 rounded-lg border border-dark-600">
                  <table className="min-w-full divide-y divide-dark-600">
                    <thead className="bg-dark-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-light-300 uppercase">Mois</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-light-300 uppercase">Date</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-light-300 uppercase">Mensualité</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-light-300 uppercase">Capital</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-light-300 uppercase">Intérêts</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-light-300 uppercase">Assurance</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-light-300 uppercase">Restant dû</th>
                      </tr>
                    </thead>
                    <tbody className="bg-dark-800 divide-y divide-dark-600">
                      {pretDetails.amortissement.tableau.map((ligne) => (
                        <tr key={ligne.mois} className="hover:bg-dark-700 transition">
                          <td className="px-4 py-3 text-sm text-white">{ligne.mois}</td>
                          <td className="px-4 py-3 text-sm text-light-300">
                            {new Date(ligne.date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3 text-sm text-white text-right">
                            {ligne.mensualite.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </td>
                          <td className="px-4 py-3 text-sm text-green-400 text-right font-semibold">
                            {ligne.capital.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </td>
                          <td className="px-4 py-3 text-sm text-orange-400 text-right">
                            {ligne.interets.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </td>
                          <td className="px-4 py-3 text-sm text-purple-400 text-right">
                            {ligne.assurance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </td>
                          <td className="px-4 py-3 text-sm text-blue-400 text-right font-semibold">
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
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                  <p className="text-red-400 font-semibold mb-2">Erreur</p>
                  <p className="text-red-300">Impossible de charger le tableau d'amortissement</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-dark-800 border-t border-dark-600 px-6 py-4 flex gap-3">
              {pretDetails && (
                <a
                  href={`http://localhost:3000/api/exports/pret/${pretDetails.id}/amortissement`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition font-semibold"
                >
                  <Download className="h-5 w-5" />
                  Télécharger PDF
                </a>
              )}
              <button
                onClick={() => { setPretDetails(null); setLoadingDetails(false); }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation Suppression */}
      {pretToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-dark-900 rounded-2xl border border-dark-600 max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Supprimer ce prêt ?
            </h3>
            <p className="text-light-200 mb-2">
              Êtes-vous sûr de vouloir supprimer le prêt :
            </p>
            <p className="font-semibold text-white mb-2">
              {pretToDelete.organisme}
            </p>
            <p className="text-sm text-light-300 mb-2">
              Montant : {pretToDelete.montant.toLocaleString('fr-FR')} €
            </p>
            <p className="text-sm text-light-300 mb-6">
              Bien : {pretToDelete.bien?.adresse}
            </p>
            <p className="text-sm text-red-400 mb-6">
              Cette action est irréversible
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPretToDelete(null)}
                className="flex-1 px-6 py-3 border border-dark-600 rounded-lg text-light-200 hover:bg-dark-800 transition font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeletePret(pretToDelete.id)}
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

export default PretsPage;
