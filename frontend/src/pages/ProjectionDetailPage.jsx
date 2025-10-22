import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, TrendingUp, TrendingDown, DollarSign, Home, Calendar, 
  Settings, RefreshCw, Trash2, BarChart3, Table, LineChart as LineChartIcon,
  AlertCircle
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import PageLayout from '../components/PageLayout';
import EditHypothesesModal from '../components/EditHypothesesModal';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const SCENARIOS_CONFIG = {
  OPTIMISTE: { icon: '📈', color: 'accent-green', label: 'Optimiste' },
  REALISTE: { icon: '📊', color: 'accent-blue', label: 'Réaliste' },
  PESSIMISTE: { icon: '📉', color: 'red-400', label: 'Pessimiste' },
  PERSONNALISE: { icon: '⚙️', color: 'accent-purple', label: 'Personnalisé' },
};

function ProjectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projection, setProjection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cashflow');
  const [activeView, setActiveView] = useState('chart'); // 'chart' ou 'table'
  const [showEditModal, setShowEditModal] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    loadProjection();
  }, [id]);

  const loadProjection = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/spaces/${localStorage.getItem('currentSpaceId')}/projections/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProjection(response.data.data);
    } catch (err) {
      console.error('Erreur chargement projection:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    if (!confirm('Recalculer la projection avec les hypothèses actuelles ?')) {
      return;
    }

    try {
      setRecalculating(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/spaces/${localStorage.getItem('currentSpaceId')}/projections/${id}/calculer`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      await loadProjection();
      alert('✅ Projection recalculée avec succès !');
    } catch (err) {
      console.error('Erreur recalcul:', err);
      alert('❌ Erreur lors du recalcul');
    } finally {
      setRecalculating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('⚠️ Supprimer définitivement cette projection ?\n\nCette action est irréversible.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_URL}/spaces/${localStorage.getItem('currentSpaceId')}/projections/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      alert('✅ Projection supprimée');
      navigate('/projections');
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('❌ Erreur lors de la suppression');
    }
  };

  const handleHypothesesUpdated = async () => {
    setShowEditModal(false);
    await loadProjection();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-dark-950">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  if (!projection) {
    return (
      <PageLayout title="Projection introuvable">
        <div className="bg-dark-900 rounded-3xl border border-dark-600/30 shadow-card p-20 text-center">
          <AlertCircle className="h-20 w-20 text-red-400 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-white mb-6">Cette projection n'existe pas ou a été supprimée</h3>
          <button
            onClick={() => navigate('/projections')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour aux projections
          </button>
        </div>
      </PageLayout>
    );
  }

  const donneesAnnuelles = projection.donneesParAnnee || [];
  const scenarioConfig = SCENARIOS_CONFIG[projection.scenario] || SCENARIOS_CONFIG.REALISTE;

  const headerActions = (
    <div className="flex gap-3">
      <button
        onClick={() => navigate('/projections')}
        className="flex items-center gap-2 px-5 py-3 border border-dark-600 rounded-2xl text-light-200 hover:bg-dark-800 transition font-semibold"
      >
        <ArrowLeft className="h-5 w-5" />
        Retour
      </button>
      <button
        onClick={() => setShowEditModal(true)}
        className="p-3 border border-dark-600 rounded-2xl hover:bg-dark-800 transition"
        title="Modifier les hypothèses"
      >
        <Settings className="h-5 w-5 text-light-200" />
      </button>
      <button
        onClick={handleRecalculate}
        disabled={recalculating}
        className="p-3 border border-accent-blue/30 bg-accent-blue/10 hover:bg-accent-blue/20 rounded-2xl transition disabled:opacity-50"
        title="Recalculer"
      >
        <RefreshCw className={`h-5 w-5 text-accent-blue ${recalculating ? 'animate-spin' : ''}`} />
      </button>
      <button
        onClick={handleDelete}
        className="p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-2xl transition"
        title="Supprimer"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );

  return (
    <PageLayout
      title={projection.nom}
      subtitle={
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border bg-${scenarioConfig.color}/20 text-${scenarioConfig.color} border-${scenarioConfig.color}/30`}>
            {scenarioConfig.icon} {scenarioConfig.label}
          </span>
          <span>Sur {projection.dureeAnnees} ans</span>
          {projection.description && <span>• {projection.description}</span>}
        </div>
      }
      headerActions={headerActions}
    >
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-accent-green/20 rounded-xl">
              <TrendingUp className="h-6 w-6 text-accent-green" />
            </div>
            <h3 className="text-sm font-semibold text-light-400">Cashflow total</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(donneesAnnuelles.reduce((sum, d) => sum + d.cashflow, 0))}
          </p>
          <p className="text-sm text-accent-green mt-2">Sur {projection.dureeAnnees} ans</p>
        </div>

        <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-accent-blue/20 rounded-xl">
              <DollarSign className="h-6 w-6 text-accent-blue" />
            </div>
            <h3 className="text-sm font-semibold text-light-400">Revenus totaux</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(donneesAnnuelles.reduce((sum, d) => sum + d.revenus, 0))}
          </p>
          <p className="text-sm text-accent-blue mt-2">Revenus locatifs</p>
        </div>

        <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-accent-purple/20 rounded-xl">
              <Home className="h-6 w-6 text-accent-purple" />
            </div>
            <h3 className="text-sm font-semibold text-light-400">Patrimoine final</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {donneesAnnuelles.length > 0 
              ? formatCurrency(donneesAnnuelles[donneesAnnuelles.length - 1].patrimoine)
              : '0 €'
            }
          </p>
          <p className="text-sm text-accent-purple mt-2">Valeur nette</p>
        </div>

        <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-accent-orange/20 rounded-xl">
              <Calendar className="h-6 w-6 text-accent-orange" />
            </div>
            <h3 className="text-sm font-semibold text-light-400">Période</h3>
          </div>
          <p className="text-3xl font-bold text-white">{projection.dureeAnnees} ans</p>
          <p className="text-sm text-accent-orange mt-2">
            {new Date(projection.dateDebut).getFullYear()} - {new Date(projection.dateDebut).getFullYear() + projection.dureeAnnees}
          </p>
        </div>
      </div>

      {/* Tabs + View selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {[
            { id: 'cashflow', label: 'Cashflow', icon: TrendingUp },
            { id: 'revenus-charges', label: 'Revenus & Charges', icon: DollarSign },
            { id: 'patrimoine', label: 'Patrimoine', icon: Home },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition ${
                  activeTab === tab.id
                    ? 'bg-accent-blue/20 text-accent-blue shadow-glow-blue border border-accent-blue/30'
                    : 'bg-dark-900 text-light-400 hover:text-white hover:bg-dark-800 border border-dark-600/30'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 bg-dark-900 rounded-2xl p-2 border border-dark-600/30">
          <button
            onClick={() => setActiveView('chart')}
            className={`p-2 rounded-xl transition ${
              activeView === 'chart'
                ? 'bg-accent-blue/20 text-accent-blue'
                : 'text-light-400 hover:text-white'
            }`}
            title="Vue graphique"
          >
            <LineChartIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveView('table')}
            className={`p-2 rounded-xl transition ${
              activeView === 'table'
                ? 'bg-accent-blue/20 text-accent-blue'
                : 'text-light-400 hover:text-white'
            }`}
            title="Vue tableau"
          >
            <Table className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Contenu */}
      {activeView === 'chart' ? (
        <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card p-8">
          {activeTab === 'cashflow' && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Évolution du Cashflow</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={donneesAnnuelles}>
                  <defs>
                    <linearGradient id="colorCashflow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="annee" stroke="#888" />
                  <YAxis stroke="#888" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #404040', 
                      borderRadius: '12px',
                      padding: '12px'
                    }}
                    formatter={(value) => [formatCurrency(value), 'Cashflow']}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cashflow"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCashflow)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'revenus-charges' && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Revenus vs Charges</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={donneesAnnuelles}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="annee" stroke="#888" />
                  <YAxis stroke="#888" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #404040', 
                      borderRadius: '12px',
                      padding: '12px'
                    }}
                    formatter={(value) => formatCurrency(value)}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Bar dataKey="revenus" fill="#3b82f6" name="Revenus" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="charges" fill="#ef4444" name="Charges" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'patrimoine' && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Évolution du Patrimoine Net</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={donneesAnnuelles}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="annee" stroke="#888" />
                  <YAxis stroke="#888" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #404040', 
                      borderRadius: '12px',
                      padding: '12px'
                    }}
                    formatter={(value) => [formatCurrency(value), 'Patrimoine']}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="patrimoine"
                    stroke="#a855f7"
                    strokeWidth={3}
                    dot={{ fill: '#a855f7', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-950 border-b border-dark-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-light-400">Année</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-light-400">Revenus</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-light-400">Charges</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-light-400">Cashflow</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-light-400">Patrimoine</th>
                </tr>
              </thead>
              <tbody>
                {donneesAnnuelles.map((data, index) => (
                  <tr key={index} className="border-b border-dark-700 hover:bg-dark-800 transition">
                    <td className="px-6 py-4 text-white font-medium">{data.annee}</td>
                    <td className="px-6 py-4 text-right text-accent-blue font-semibold">{formatCurrency(data.revenus)}</td>
                    <td className="px-6 py-4 text-right text-red-400 font-semibold">{formatCurrency(data.charges)}</td>
                    <td className="px-6 py-4 text-right font-bold">
                      <span className={data.cashflow >= 0 ? 'text-accent-green' : 'text-red-400'}>
                        {formatCurrency(data.cashflow)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-accent-purple font-bold">{formatCurrency(data.patrimoine)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hypothèses */}
      {projection.hypotheses && (
        <div className="mt-10 bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Hypothèses de calcul</h3>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent-blue/10 hover:bg-accent-blue/20 border border-accent-blue/30 text-accent-blue rounded-xl transition font-semibold"
            >
              <Settings className="h-4 w-4" />
              Modifier
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Taux d\'inflation', value: `${projection.hypotheses.tauxInflation}%` },
              { label: 'Vacance locative', value: `${projection.hypotheses.tauxVacanceLocative}%` },
              { label: 'Augmentation loyer', value: `${projection.hypotheses.tauxAugmentationLoyer}%` },
              { label: 'Augmentation charges', value: `${projection.hypotheses.tauxAugmentationCharges}%` },
              { label: 'Taux d\'imposition', value: `${projection.hypotheses.tauxImposition}%` },
              { label: 'Appréciation bien', value: `${projection.hypotheses.tauxAppreciationBien}%/an` },
            ].map((item, index) => (
              <div key={index} className="bg-dark-950 p-4 rounded-xl border border-dark-600/30">
                <p className="text-sm text-light-500 mb-1 font-medium">{item.label}</p>
                <p className="text-xl font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal édition hypothèses */}
      {showEditModal && (
        <EditHypothesesModal
          projection={projection}
          onClose={() => setShowEditModal(false)}
          onUpdated={handleHypothesesUpdated}
        />
      )}
    </PageLayout>
  );
}

export default ProjectionDetailPage;
