import { useState, useEffect } from 'react';
import { useSpace } from '../contexts/SpaceContext';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Plus, Calendar, BarChart3, PieChart, Trash2 } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const SCENARIOS = {
  OPTIMISTE: { label: 'Optimiste', color: 'accent-green', icon: '📈' },
  REALISTE: { label: 'Réaliste', color: 'accent-blue', icon: '📊' },
  PESSIMISTE: { label: 'Pessimiste', color: 'red-400', icon: '📉' },
  PERSONNALISE: { label: 'Personnalisé', color: 'accent-purple', icon: '⚙️' }
};

function ProjectionsPage() {
  const { currentSpace } = useSpace();
  const navigate = useNavigate();
  const [projections, setProjections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (currentSpace) {
      loadProjections();
    }
  }, [currentSpace]);

  const loadProjections = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/spaces/${currentSpace.id}/projections`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProjections(response.data.data);
    } catch (err) {
      console.error('Erreur chargement projections:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, projectionId, projectionNom) => {
    e.stopPropagation(); // Empêcher la navigation vers la page détail
    
    if (!confirm(`⚠️ Supprimer la projection "${projectionNom}" ?\n\nCette action est irréversible.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_URL}/spaces/${currentSpace.id}/projections/${projectionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      alert('✅ Projection supprimée');
      loadProjections();
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('❌ Erreur lors de la suppression');
    }
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
      onClick={() => setShowCreateModal(true)}
      className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl shadow-accent-blue/30 hover:shadow-2xl hover:shadow-accent-blue/40 hover:scale-105"
    >
      <Plus className="h-5 w-5" />
      Nouvelle projection
    </button>
  );

  return (
    <PageLayout
      title="Projections Financières"
      subtitle={`${projections.length} projection${projections.length > 1 ? 's' : ''}`}
      headerActions={headerActions}
    >
      {/* Stats rapides */}
      {projections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-dark-900 rounded-2xl border border-dark-600/30 p-6 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-accent-blue/20 rounded-xl">
                <TrendingUp className="h-6 w-6 text-accent-blue" />
              </div>
              <h3 className="text-sm font-semibold text-light-400">Total projections</h3>
            </div>
            <p className="text-3xl font-bold text-white">{projections.length}</p>
          </div>

          <div className="bg-dark-900 rounded-2xl border border-dark-600/30 p-6 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-accent-purple/20 rounded-xl">
                <Calendar className="h-6 w-6 text-accent-purple" />
              </div>
              <h3 className="text-sm font-semibold text-light-400">Durée moyenne</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {Math.round(projections.reduce((sum, p) => sum + p.dureeAnnees, 0) / projections.length)} ans
            </p>
          </div>

          <div className="bg-dark-900 rounded-2xl border border-dark-600/30 p-6 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-accent-green/20 rounded-xl">
                <BarChart3 className="h-6 w-6 text-accent-green" />
              </div>
              <h3 className="text-sm font-semibold text-light-400">Périodes calculées</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {projections.reduce((sum, p) => sum + p._count.donnees, 0)}
            </p>
          </div>

          <div className="bg-dark-900 rounded-2xl border border-dark-600/30 p-6 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-accent-blue/20 rounded-xl">
                <PieChart className="h-6 w-6 text-accent-blue" />
              </div>
              <h3 className="text-sm font-semibold text-light-400">Scénarios</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {new Set(projections.map(p => p.scenario)).size}
            </p>
          </div>
        </div>
      )}

      {/* Liste des projections */}
      {projections.length > 0 ? (
        <div className="space-y-5">
          {projections.map((projection) => {
            const scenario = SCENARIOS[projection.scenario] || SCENARIOS.REALISTE;
            
            return (
              <div
                key={projection.id}
                onClick={() => navigate(`/projections/${projection.id}`)}
                className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card hover:shadow-card-hover transition p-6 cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{scenario.icon}</span>
                      <div>
                        <h3 className="text-2xl font-bold text-white group-hover:text-accent-blue transition">
                          {projection.nom}
                        </h3>
                        {projection.description && (
                          <p className="text-light-400 text-sm mt-1">{projection.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-4">
                      <span className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full border bg-${scenario.color}/20 text-${scenario.color} border-${scenario.color}/30`}>
                        {scenario.label}
                      </span>

                      <div className="flex items-center gap-2 text-light-400">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-medium">{projection.dureeAnnees} ans</span>
                      </div>

                      <div className="flex items-center gap-2 text-light-400">
                        <BarChart3 className="h-4 w-4" />
                        <span className="text-sm font-medium">{projection._count.donnees} mois calculés</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="text-right">
                      <p className="text-xs text-light-500 mb-1 font-medium">Créée le</p>
                      <p className="text-sm text-light-400">
                        {new Date(projection.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    
                    <button
                      onClick={(e) => handleDelete(e, projection.id, projection.nom)}
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
          <TrendingUp className="h-20 w-20 text-accent-blue/50 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-white mb-2">Aucune projection</h3>
          <p className="text-light-300 mb-6">
            Créez votre première projection pour anticiper l'évolution de votre patrimoine
          </p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl"
          >
            <Plus className="h-5 w-5" />
            Créer une projection
          </button>
        </div>
      )}

      {/* Modal création */}
      {showCreateModal && (
        <CreateProjectionModal 
          spaceId={currentSpace.id}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadProjections();
          }}
        />
      )}
    </PageLayout>
  );
}

// Modal de création
function CreateProjectionModal({ spaceId, onClose, onCreated }) {
  const [nom, setNom] = useState('');
  const [scenario, setScenario] = useState('REALISTE');
  const [dureeAnnees, setDureeAnnees] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/spaces/${spaceId}/projections`,
        { nom, scenario, dureeAnnees },
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
          <h2 className="text-3xl font-bold text-white mb-6">Nouvelle projection</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-light-400 mb-2">Nom *</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                placeholder="Ex: Projection 2025-2030"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-light-400 mb-2">
                Scénario
                <span className="text-xs text-light-500 ml-2">(Définit les hypothèses par défaut)</span>
              </label>
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
              >
                {Object.entries(SCENARIOS).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.icon} {info.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-light-500 mt-2">
                💡 Vous pourrez modifier les hypothèses après création
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-light-400 mb-2">Durée (années)</label>
              <input
                type="number"
                value={dureeAnnees}
                onChange={(e) => setDureeAnnees(parseInt(e.target.value))}
                min="1"
                max="10"
                className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
              />
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

export default ProjectionsPage;
