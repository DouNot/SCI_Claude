import { useState, useEffect } from 'react';
import { biensAPI, bauxAPI, evenementsFiscauxAPI, pretsAPI } from '../services/api';
import { TrendingUp, Home, AlertCircle, Euro, ArrowUpRight, ChevronDown } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function DashboardPage({ onNavigate }) {
  const [biens, setBiens] = useState([]);
  const [baux, setBaux] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [prets, setPrets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('TOUT');
  const [viewType, setViewType] = useState('brut');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [biensRes, bauxRes, evenementsRes, pretsRes] = await Promise.all([
        biensAPI.getAll(),
        bauxAPI.getAll(),
        evenementsFiscauxAPI.getAll(),
        pretsAPI.getAll()
      ]);
      setBiens(biensRes.data);
      setBaux(bauxRes.data);
      setEvenements(evenementsRes.data);
      setPrets(pretsRes.data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculs financiers
  const nombreBiens = biens.length;
  const valeurTotaleBrute = biens.reduce((sum, b) => sum + (b.valeurActuelle || b.prixAchat), 0);
  
  const capitalRestantDu = prets.reduce((sum, p) => {
    const moisEcoules = Math.floor((new Date() - new Date(p.dateDebut)) / (1000 * 60 * 60 * 24 * 30));
    const moisRestants = Math.max(0, (p.duree * 12) - moisEcoules);
    return sum + (p.mensualite * moisRestants);
  }, 0);

  const valeurTotaleNette = valeurTotaleBrute - capitalRestantDu;
  const coutAcquisition = biens.reduce((sum, b) => sum + b.prixAchat + (b.fraisNotaire || 0), 0);
  const plusValue = valeurTotaleNette - coutAcquisition;
  const plusValuePct = coutAcquisition > 0 ? ((plusValue / coutAcquisition) * 100).toFixed(1) : 0;
  const loyersMensuels = biens.reduce((sum, b) => sum + (b.loyerHC || 0), 0);

  // Génération données graphique
  const generateChartData = () => {
    const labels = [];
    const dataPoints = [];
    const startDate = new Date('2023-09-18');
    const endDate = new Date();
    const totalMonths = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24 * 30));
    
    for (let i = 0; i <= totalMonths; i += 2) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      labels.push(date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }));
      
      const progress = i / totalMonths;
      const value = coutAcquisition + (plusValue * progress);
      dataPoints.push(Math.round(value));
    }
    
    return { labels, dataPoints };
  };

  const { labels, dataPoints } = generateChartData();

  const chartData = {
    labels: labels,
    datasets: [{
      data: dataPoints,
      borderColor: '#3b82f6',
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.01)');
        return gradient;
      },
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 8,
      pointHoverBackgroundColor: '#3b82f6',
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 3,
      borderWidth: 3
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: { 
        enabled: true,
        backgroundColor: 'rgba(28, 28, 36, 0.95)',
        titleColor: '#fff',
        bodyColor: '#e8e9ef',
        borderColor: '#3b82f6',
        borderWidth: 1,
        padding: 16,
        displayColors: false,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 14 },
        callbacks: {
          label: (context) => context.parsed.y.toLocaleString('fr-FR') + ' €'
        }
      }
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: { 
          color: '#8b8fa8',
          maxTicksLimit: 8,
          font: { size: 12 }
        },
        border: { display: false }
      },
      y: { 
        grid: { 
          color: '#34364a',
          drawBorder: false
        },
        ticks: { 
          color: '#8b8fa8',
          font: { size: 12 },
          callback: (value) => (value / 1000).toFixed(0) + ' k €'
        },
        border: { display: false }
      }
    }
  };

  // Alertes
  const bauxExpirantBientot = baux.filter(bail => {
    if (!bail.dateFin || bail.statut !== 'ACTIF') return false;
    const diffDays = Math.ceil((new Date(bail.dateFin) - new Date()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 60;
  });

  const evenementsProches = evenements.filter(evt => {
    if (evt.estPaye) return false;
    const diffDays = Math.ceil((new Date(evt.dateEcheance) - new Date()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  });

  const categories = [
    { id: 'all', label: 'Toutes les catégories' },
    { id: 'APPARTEMENT', label: 'Appartements' },
    { id: 'MAISON', label: 'Maisons' },
    { id: 'LOCAL_COMMERCIAL', label: 'Locaux commerciaux' }
  ];

  const currentCategory = categories.find(c => c.id === categoryFilter) || categories[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-dark-950">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <div className="max-w-[1600px] mx-auto px-8 py-10 animate-fade-in">
        
        {/* Header avec filtres */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-8">
            <div className="relative">
              <button className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-white to-light-200 bg-clip-text text-transparent hover:opacity-80 transition">
                Patrimoine {viewType === 'brut' ? 'brut' : 'net'}
                <ChevronDown className="h-6 w-6 text-accent-blue" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button 
                  onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                  className="flex items-center gap-2 px-5 py-3 bg-dark-900 rounded-2xl hover:bg-dark-800 transition border border-dark-600/30 shadow-card"
                >
                  <span className="text-sm text-light-300 font-medium">{currentCategory.label}</span>
                  <ChevronDown className="h-4 w-4 text-light-400" />
                </button>

                {showCategoryMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowCategoryMenu(false)}
                    />
                    <div className="absolute top-full mt-2 right-0 bg-dark-900 rounded-2xl shadow-2xl py-2 min-w-[240px] z-20 border border-dark-600/50">
                      {categories.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setCategoryFilter(cat.id);
                            setShowCategoryMenu(false);
                          }}
                          className="w-full text-left px-5 py-3 text-sm hover:bg-dark-800 transition text-light-300 font-medium"
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2 bg-dark-900 rounded-2xl p-2 border border-dark-600/30 shadow-card">
                {['1J', '7J', '1M', 'YTD', '1A', 'TOUT'].map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      timeRange === range 
                        ? 'bg-accent-blue/20 text-accent-blue shadow-glow-blue' 
                        : 'text-light-400 hover:text-white hover:bg-dark-800'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-light-500 mb-2">
              {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
            <p className="text-6xl font-bold tracking-tight bg-gradient-to-r from-white to-light-200 bg-clip-text text-transparent">
              {(viewType === 'brut' ? valeurTotaleBrute : valeurTotaleNette).toLocaleString('fr-FR')} €
            </p>
          </div>
        </div>

        {/* Graphique + Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 bg-dark-900 rounded-3xl p-8 border border-dark-600/30 shadow-card" style={{ height: '460px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>

          <div className="bg-dark-900 rounded-3xl p-8 border border-dark-600/30 shadow-card">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold">Performance</h3>
              <ChevronDown className="h-5 w-5 text-light-400" />
            </div>

            <div className="mb-8">
              <p className="text-xs text-light-500 mb-3 font-medium">Plus-value - Tout</p>
              <div className="flex items-end gap-3">
                <p className={`text-5xl font-bold ${plusValue >= 0 ? 'text-accent-green' : 'text-red-400'}`}>
                  {plusValue >= 0 ? '+' : ''}{plusValue.toLocaleString('fr-FR')} €
                </p>
                <div className={`flex items-center gap-1.5 mb-2 ${plusValuePct >= 0 ? 'text-accent-green' : 'text-red-400'}`}>
                  <span className="text-lg font-bold">{plusValuePct >= 0 ? '+' : ''}{plusValuePct}%</span>
                  {plusValuePct >= 0 && <ArrowUpRight className="h-5 w-5" />}
                </div>
              </div>
            </div>

            <div className="p-5 bg-dark-800/50 rounded-2xl border border-dark-700/50">
              <p className="text-sm text-light-400 leading-relaxed">
                La plus-value latente est la différence entre votre prix d'achat unitaire et le prix actuel. 
                Ce montant ne tient pas compte des plus-values réalisées.
              </p>
            </div>

            <button className="mt-8 text-sm text-accent-blue hover:text-accent-blue-light font-semibold flex items-center gap-2 transition-all hover:gap-3">
              En savoir plus
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-dark-900 rounded-2xl p-6 border border-dark-600/30 shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-accent-blue/10 rounded-xl border border-accent-blue/20">
                <Home className="h-6 w-6 text-accent-blue" />
              </div>
              <p className="text-sm text-light-400 font-medium">Nombre de biens</p>
            </div>
            <p className="text-4xl font-bold">{nombreBiens}</p>
          </div>

          <div className="bg-dark-900 rounded-2xl p-6 border border-dark-600/30 shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-accent-green/10 rounded-xl border border-accent-green/20">
                <TrendingUp className="h-6 w-6 text-accent-green" />
              </div>
              <p className="text-sm text-light-400 font-medium">Valeur nette</p>
            </div>
            <p className="text-4xl font-bold">{valeurTotaleNette.toLocaleString('fr-FR')} €</p>
          </div>

          <div className="bg-dark-900 rounded-2xl p-6 border border-dark-600/30 shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-accent-purple/10 rounded-xl border border-accent-purple/20">
                <Euro className="h-6 w-6 text-accent-purple" />
              </div>
              <p className="text-sm text-light-400 font-medium">Loyers mensuels</p>
            </div>
            <p className="text-4xl font-bold">{loyersMensuels.toLocaleString('fr-FR')} €</p>
            <p className="text-xs text-light-500 mt-2 font-medium">+{(loyersMensuels * 12).toLocaleString('fr-FR')} €/an</p>
          </div>

          <div className="bg-dark-900 rounded-2xl p-6 border border-dark-600/30 shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-accent-orange/10 rounded-xl border border-accent-orange/20">
                <TrendingUp className="h-6 w-6 text-accent-orange rotate-180" />
              </div>
              <p className="text-sm text-light-400 font-medium">Dette totale</p>
            </div>
            <p className="text-4xl font-bold text-accent-orange">{capitalRestantDu.toLocaleString('fr-FR')} €</p>
          </div>
        </div>

        {/* Alertes */}
        {(bauxExpirantBientot.length > 0 || evenementsProches.length > 0) && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-light-200 bg-clip-text text-transparent">Alertes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bauxExpirantBientot.length > 0 && (
                <div className="bg-dark-900 border border-accent-orange/30 rounded-2xl p-7 hover:border-accent-orange/50 transition shadow-card hover:shadow-card-hover cursor-pointer">
                  <div className="flex items-start gap-5">
                    <div className="p-4 bg-accent-orange/10 rounded-2xl border border-accent-orange/20">
                      <AlertCircle className="h-7 w-7 text-accent-orange" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-accent-orange text-lg mb-2">Baux expirant bientôt</h3>
                      <p className="text-sm text-light-300 mb-4 font-medium">
                        {bauxExpirantBientot.length} bail{bauxExpirantBientot.length > 1 ? 'aux' : ''} dans les 60 jours
                      </p>
                      {bauxExpirantBientot.slice(0, 3).map(bail => (
                        <div key={bail.id} className="text-sm text-light-400 mb-2">
                          • {bail.locataire?.nom || 'Locataire'} - {new Date(bail.dateFin).toLocaleDateString('fr-FR')}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {evenementsProches.length > 0 && (
                <div className="bg-dark-900 border border-red-400/30 rounded-2xl p-7 hover:border-red-400/50 transition shadow-card hover:shadow-card-hover cursor-pointer">
                  <div className="flex items-start gap-5">
                    <div className="p-4 bg-red-400/10 rounded-2xl border border-red-400/20">
                      <AlertCircle className="h-7 w-7 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-red-400 text-lg mb-2">Événements fiscaux</h3>
                      <p className="text-sm text-light-300 mb-4 font-medium">
                        {evenementsProches.length} échéance{evenementsProches.length > 1 ? 's' : ''} dans 30 jours
                      </p>
                      {evenementsProches.slice(0, 3).map(evt => (
                        <div key={evt.id} className="text-sm text-light-400 mb-2">
                          • {evt.type} - {evt.montant.toLocaleString('fr-FR')} € - {new Date(evt.dateEcheance).toLocaleDateString('fr-FR')}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default DashboardPage;
