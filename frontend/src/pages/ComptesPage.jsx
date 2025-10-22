import { useState, useEffect } from 'react';
import { useSpace } from '../contexts/SpaceContext';
import { Wallet, Plus, RefreshCw, TrendingUp, TrendingDown, CreditCard, Building2, Eye, Trash2 } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const TYPES_COMPTE = {
  COURANT: { label: 'Compte courant', icon: '💳', color: 'accent-blue' },
  EPARGNE: { label: 'Épargne', icon: '💰', color: 'accent-green' },
  PROFESSIONNEL: { label: 'Professionnel', icon: '🏢', color: 'accent-purple' },
};

const STATUTS = {
  ACTIF: { label: 'Actif', color: 'accent-green', icon: '✅' },
  SUSPENDU: { label: 'Suspendu', color: 'accent-orange', icon: '⏸️' },
  ERREUR: { label: 'Erreur', color: 'red-400', icon: '❌' },
  DECONNECTE: { label: 'Déconnecté', color: 'light-500', icon: '🔌' },
};

function ComptesPage() {
  const { currentSpace } = useSpace();
  const [comptes, setComptes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [syncing, setSyncing] = useState(null);

  useEffect(() => {
    if (currentSpace) {
      loadData();
    }
  }, [currentSpace]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [comptesRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/spaces/${currentSpace.id}/comptes-bancaires`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/spaces/${currentSpace.id}/comptes-bancaires/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setComptes(comptesRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error('Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (compteId) => {
    try {
      setSyncing(compteId);
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/spaces/${currentSpace.id}/comptes-bancaires/${compteId}/sync`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await loadData();
      alert('Synchronisation réussie !');
    } catch (err) {
      console.error('Erreur synchro:', err);
      alert(err.response?.data?.error || 'Erreur lors de la synchronisation');
    } finally {
      setSyncing(null);
    }
  };

  const handleDelete = async (compteId) => {
    if (!confirm('Supprimer ce compte bancaire et toutes ses transactions ?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_URL}/spaces/${currentSpace.id}/comptes-bancaires/${compteId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await loadData();
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const formatEuros = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(montant);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-dark-950">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  const headerActions = (
    <button 
      onClick={() => setShowAddModal(true)}
      className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl shadow-accent-blue/30 hover:shadow-2xl hover:shadow-accent-blue/40 hover:scale-105"
    >
      <Plus className="h-5 w-5" />
      Ajouter un compte
    </button>
  );

  return (
    <PageLayout
      title="Comptes Bancaires"
      subtitle={`${comptes.length} compte${comptes.length > 1 ? 's' : ''}`}
      headerActions={headerActions}
    >
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-dark-900 rounded-2xl border border-dark-600/30 p-6 shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-accent-blue/20 rounded-xl">
                <Wallet className="h-6 w-6 text-accent-blue" />
              </div>
              <h3 className="text-sm font-semibold text-light-400">Solde total</h3>
            </div>
            <p className="text-3xl font-bold text-white">{formatEuros(stats.soldeTotal)}</p>
            <p className="text-sm text-accent-blue mt-2">{stats.nbComptes} compte{stats.nbComptes > 1 ? 's' : ''}</p>
          </div>

          <div className="bg-dark-900 rounded-2xl border border-dark-600/30 p-6 shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-accent-green/20 rounded-xl">
                <TrendingUp className="h-6 w-6 text-accent-green" />
              </div>
              <h3 className="text-sm font-semibold text-light-400">Crédits 30j</h3>
            </div>
            <p className="text-3xl font-bold text-white">{formatEuros(stats.credits30j)}</p>
          </div>

          <div className="bg-dark-900 rounded-2xl border border-dark-600/30 p-6 shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <TrendingDown className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="text-sm font-semibold text-light-400">Débits 30j</h3>
            </div>
            <p className="text-3xl font-bold text-white">{formatEuros(stats.debits30j)}</p>
          </div>

          <div className="bg-dark-900 rounded-2xl border border-dark-600/30 p-6 shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-accent-purple/20 rounded-xl">
                <CreditCard className="h-6 w-6 text-accent-purple" />
              </div>
              <h3 className="text-sm font-semibold text-light-400">Transactions 30j</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.nbTransactions30j}</p>
          </div>
        </div>
      )}

      {/* Liste des comptes */}
      {comptes.length > 0 ? (
        <div className="space-y-5">
          {comptes.map((compte) => {
            const typeInfo = TYPES_COMPTE[compte.typeCompte] || TYPES_COMPTE.COURANT;
            const statutInfo = STATUTS[compte.statut] || STATUTS.ACTIF;
            const isSyncing = syncing === compte.id;

            return (
              <div
                key={compte.id}
                className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card hover:shadow-card-hover p-6 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{typeInfo.icon}</span>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{compte.nom}</h3>
                        <p className="text-light-400 text-sm mt-1">
                          {compte.banque} • {typeInfo.label}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-light-500 font-medium">Solde:</p>
                        <p className="text-xl font-bold text-white">{formatEuros(compte.soldeActuel)}</p>
                      </div>

                      {compte.iban && (
                        <div className="flex items-center gap-2 text-light-400">
                          <CreditCard className="h-4 w-4" />
                          <span className="text-sm font-medium">{compte.iban.substring(0, 20)}...</span>
                        </div>
                      )}

                      <span className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full border bg-${statutInfo.color}/20 text-${statutInfo.color} border-${statutInfo.color}/30`}>
                        {statutInfo.icon} {statutInfo.label}
                      </span>

                      {compte.provider !== 'MANUAL' && compte.derniereSynchro && (
                        <div className="flex items-center gap-2 text-light-400">
                          <RefreshCw className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Dernière synchro: {new Date(compte.derniereSynchro).toLocaleString('fr-FR')}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-light-400">
                        <Building2 className="h-4 w-4" />
                        <span className="text-sm font-medium">{compte._count.transactions} transactions</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {compte.provider !== 'MANUAL' && (
                      <button
                        onClick={() => handleSync(compte.id)}
                        disabled={isSyncing}
                        className="p-2.5 bg-accent-blue/10 hover:bg-accent-blue/20 rounded-xl border border-accent-blue/20 transition disabled:opacity-50"
                        title="Synchroniser"
                      >
                        <RefreshCw className={`h-4 w-4 text-accent-blue ${isSyncing ? 'animate-spin' : ''}`} />
                      </button>
                    )}

                    <button
                      className="p-2.5 bg-accent-purple/10 hover:bg-accent-purple/20 rounded-xl border border-accent-purple/20 transition"
                      title="Voir les transactions"
                    >
                      <Eye className="h-4 w-4 text-accent-purple" />
                    </button>

                    <button
                      onClick={() => handleDelete(compte.id)}
                      className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/20 transition"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-dark-900 rounded-3xl border border-dark-600/30 shadow-card p-20 text-center">
          <Wallet className="h-20 w-20 text-accent-blue/50 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun compte bancaire</h3>
          <p className="text-light-300 mb-6">
            Ajoutez vos comptes bancaires pour automatiser votre comptabilité
          </p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl"
          >
            <Plus className="h-5 w-5" />
            Ajouter un compte
          </button>
        </div>
      )}

      {/* Modal ajout */}
      {showAddModal && (
        <AddCompteModal 
          spaceId={currentSpace.id}
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            loadData();
          }}
        />
      )}
    </PageLayout>
  );
}

// Modal d'ajout de compte (manuel pour l'instant)
function AddCompteModal({ spaceId, onClose, onCreated }) {
  const [nom, setNom] = useState('');
  const [banque, setBanque] = useState('');
  const [iban, setIban] = useState('');
  const [typeCompte, setTypeCompte] = useState('COURANT');
  const [soldeActuel, setSoldeActuel] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/spaces/${spaceId}/comptes-bancaires`,
        { nom, banque, iban, typeCompte, soldeActuel },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onCreated();
    } catch (err) {
      console.error('Erreur création:', err);
      alert('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-[9998] backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none">
        <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-2xl max-w-lg w-full p-8 pointer-events-auto">
          <h2 className="text-3xl font-bold text-white mb-6">Ajouter un compte bancaire</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-light-400 mb-2">Nom du compte *</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                placeholder="Ex: Compte courant principal"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-light-400 mb-2">Banque *</label>
              <input
                type="text"
                value={banque}
                onChange={(e) => setBanque(e.target.value)}
                required
                className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                placeholder="Ex: Crédit Agricole"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-light-400 mb-2">IBAN (optionnel)</label>
              <input
                type="text"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                placeholder="FR76..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-light-400 mb-2">Type</label>
              <select
                value={typeCompte}
                onChange={(e) => setTypeCompte(e.target.value)}
                className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
              >
                {Object.entries(TYPES_COMPTE).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.icon} {info.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-light-400 mb-2">Solde actuel</label>
              <input
                type="number"
                step="0.01"
                value={soldeActuel}
                onChange={(e) => setSoldeActuel(parseFloat(e.target.value))}
                className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
              />
            </div>

            <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-xl p-4">
              <p className="text-sm text-accent-blue">
                💡 La connexion automatique aux banques sera disponible prochainement via Bridge API
              </p>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-dark-600 rounded-xl text-light-200 hover:bg-dark-800 transition font-semibold"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-xl transition font-semibold disabled:opacity-50"
              >
                {loading ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default ComptesPage;
