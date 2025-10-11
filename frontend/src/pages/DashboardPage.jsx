import { useState, useEffect } from 'react';
import { biensAPI, bauxAPI, evenementsFiscauxAPI, pretsAPI, chargesAPI } from '../services/api';
import { TrendingUp, Home, AlertCircle, Euro, ArrowUpRight, ChevronDown, Download } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement);

function DashboardPage({ onNavigate }) {
  const [biens, setBiens] = useState([]);
  const [baux, setBaux] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [prets, setPrets] = useState([]);
  const [charges, setCharges] = useState([]);
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
      const [biensRes, bauxRes, evenementsRes, pretsRes, chargesRes] = await Promise.all([
        biensAPI.getAll(),
        bauxAPI.getAll(),
        evenementsFiscauxAPI.getAll(),
        pretsAPI.getAll(),
        chargesAPI.getAll()
      ]);
      setBiens(biensRes.data);
      setBaux(bauxRes.data);
      setEvenements(evenementsRes.data);
      setPrets(pretsRes.data);
      setCharges(chargesRes.data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les biens selon la catégorie
  const biensFiltres = categoryFilter === 'all' 
    ? biens 
    : biens.filter(b => b.type === categoryFilter);

  // Calculs financiers sur les biens filtrés
  const nombreBiens = biensFiltres.length;
  const valeurTotaleBrute = biensFiltres.reduce((sum, b) => sum + (b.valeurActuelle || b.prixAchat), 0);
  
  // Filtrer les prêts des biens filtrés
  const bienIdsFilters = new Set(biensFiltres.map(b => b.id));
  const pretsFiltres = categoryFilter === 'all' ? prets : prets.filter(p => bienIdsFilters.has(p.bienId));
  
  // Filtrer les charges des biens filtrés (uniquement les charges actives)
  const chargesFiltrees = categoryFilter === 'all' 
    ? charges.filter(c => c.estActive) 
    : charges.filter(c => c.estActive && bienIdsFilters.has(c.bienId));

  // Fonction utilitaire pour calculer le nombre de mois entre deux dates
  const calculerMoisEcoules = (dateDebut, dateFin) => {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    
    let mois = (fin.getFullYear() - debut.getFullYear()) * 12;
    mois += fin.getMonth() - debut.getMonth();
    
    // Ajuster si le jour du mois de fin est avant le jour du mois de début
    if (fin.getDate() < debut.getDate()) {
      mois--;
    }
    
    return Math.max(0, mois);
  };

  const capitalRestantDu = pretsFiltres.reduce((sum, p) => {
    const moisEcoules = calculerMoisEcoules(new Date(p.dateDebut), new Date());
    const moisRestants = Math.max(0, parseInt(p.duree) - moisEcoules);
    const montant = parseFloat(p.montant || 0);
    const tauxMensuel = (parseFloat(p.taux || 0) / 100) / 12;
    
    if (tauxMensuel === 0) {
      // Si pas de taux, capital restant = montant restant linéaire
      return sum + (montant * moisRestants / parseInt(p.duree));
    }
    
    const mensualite = montant * (tauxMensuel * Math.pow(1 + tauxMensuel, parseInt(p.duree))) / (Math.pow(1 + tauxMensuel, parseInt(p.duree)) - 1);
    
    // Formule du capital restant dû
    const capitalRestant = mensualite * ((Math.pow(1 + tauxMensuel, moisRestants) - 1) / (tauxMensuel * Math.pow(1 + tauxMensuel, moisRestants)));
    
    return sum + (isNaN(capitalRestant) ? 0 : capitalRestant);
  }, 0);

  const valeurTotaleNette = valeurTotaleBrute - capitalRestantDu;
  const coutAcquisition = biensFiltres.reduce((sum, b) => sum + b.prixAchat + (b.fraisNotaire || 0), 0);
  const loyersMensuels = biensFiltres.reduce((sum, b) => sum + (b.loyerActuel || 0), 0);
  
  // Pour une SCI locative : on mesure le cash-flow (trésorerie réelle)
  // Cash-flow = Loyers - Mensualités totales (capital + intérêts + assurance) - Assurances PNO - Taxe foncière
  const loyersAnnuels = loyersMensuels * 12;
  
  // Calculer les mensualités totales (tout ce qui sort du compte)
  const mensualitesPrets = pretsFiltres.reduce((sum, p) => sum + (parseFloat(p.mensualite) || 0), 0);
  const chargesPrets = mensualitesPrets * 12;
  
  // Calculer les charges annuelles à partir des charges (et non plus des champs du bien)
  const calculerChargesAnnuelles = () => {
    return chargesFiltrees.reduce((sum, charge) => {
      let montantAnnuel = 0;
      switch (charge.frequence) {
        case 'MENSUELLE':
          montantAnnuel = charge.montant * 12;
          break;
        case 'TRIMESTRIELLE':
          montantAnnuel = charge.montant * 4;
          break;
        case 'SEMESTRIELLE':
          montantAnnuel = charge.montant * 2;
          break;
        case 'ANNUELLE':
          montantAnnuel = charge.montant;
          break;
        case 'PONCTUELLE':
          montantAnnuel = 0; // On ne compte pas les charges ponctuelles dans le calcul annuel
          break;
        default:
          montantAnnuel = 0;
      }
      return sum + montantAnnuel;
    }, 0);
  };
  
  const autresChargesAnnuelles = calculerChargesAnnuelles();
  
  // Total des charges annuelles
  const chargesAnnuelles = chargesPrets + autresChargesAnnuelles;
  
  const cashFlowAnnuel = loyersAnnuels - chargesAnnuelles;
  const prixAchatTotal = biensFiltres.reduce((sum, b) => sum + b.prixAchat, 0);
  const tauxRentabiliteNet = prixAchatTotal > 0 ? ((cashFlowAnnuel / prixAchatTotal) * 100).toFixed(2) : 0;

  // Génération données graphique (dépend de timeRange et viewType)
  const generateChartData = () => {
    const labels = [];
    const dataPoints = [];
    const endDate = new Date();
    let startDate;
    let stepDays;

    // Définir la plage de temps en fonction du filtre
    switch(timeRange) {
      case '1J':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        stepDays = 1; // 1 jour
        break;
      case '7J':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        stepDays = 1; // 1 jour
        break;
      case '1M':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        stepDays = 1; // 1 jour
        break;
      case 'YTD':
        startDate = new Date(endDate.getFullYear(), 0, 1);
        const totalDaysYTD = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        stepDays = Math.max(1, Math.floor(totalDaysYTD / 52)); // Max 52 points
        break;
      case '1A':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        stepDays = 7; // 1 semaine
        break;
      case 'TOUT':
      default:
        // Utiliser la date du premier bien acheté
        const premierBien = biensFiltres.length > 0 
          ? [...biensFiltres].sort((a, b) => new Date(a.dateAchat) - new Date(b.dateAchat))[0]
          : null;
        
        if (premierBien) {
          startDate = new Date(premierBien.dateAchat);
        } else {
          // Si pas de biens, montrer les 12 derniers mois
          startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 1);
        }
        
        const totalDaysTout = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        
        // Adapter le step selon la durée totale
        if (totalDaysTout <= 30) {
          stepDays = 1; // Tous les jours si moins d'un mois
        } else if (totalDaysTout <= 90) {
          stepDays = 2; // Tous les 2 jours si moins de 3 mois
        } else if (totalDaysTout <= 365) {
          stepDays = 7; // Toutes les semaines si moins d'un an
        } else if (totalDaysTout <= 730) {
          stepDays = 14; // Toutes les 2 semaines si moins de 2 ans
        } else {
          stepDays = 30; // Tous les mois si plus de 2 ans
        }
        break;
    }

    // Générer les points de données
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i <= totalDays; i += stepDays) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Ne pas dépasser la date du jour
      if (date > endDate) break;
      
      // Format de date selon la période
      let dateLabel;
      if (timeRange === '1J') {
        dateLabel = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      } else if (timeRange === '7J' || timeRange === '1M') {
        dateLabel = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      } else if (totalDays <= 365) {
        dateLabel = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      } else {
        dateLabel = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      }
      labels.push(dateLabel);
      
      // Calculer le capital restant dû à cette date précise
      // IMPORTANT : Ne compter que les prêts des biens déjà achetés à cette date
      const capitalRestantDuADate = pretsFiltres.reduce((sum, p) => {
        // Trouver le bien associé à ce prêt
        const bienAssocie = biensFiltres.find(b => b.id === p.bienId);
        
        // Si pas de bien associé, ignorer ce prêt
        if (!bienAssocie || !bienAssocie.dateAchat) {
          return sum;
        }
        
        // Vérifier si le bien a été acheté avant ou à cette date
        const dateAchatBien = new Date(bienAssocie.dateAchat);
        const dateAchatNormalisee = new Date(dateAchatBien.getFullYear(), dateAchatBien.getMonth(), dateAchatBien.getDate());
        const datePointNormalisee = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        // Si le bien n'a pas encore été acheté à cette date, ignorer le prêt
        if (dateAchatNormalisee > datePointNormalisee) {
          return sum;
        }
        
        // Le bien a été acheté, calculer le capital restant dû
        const dateDebutPret = new Date(p.dateDebut);
        const moisEcoules = calculerMoisEcoules(dateDebutPret, date);
        const moisRestants = Math.max(0, parseInt(p.duree) - moisEcoules);
        const montant = parseFloat(p.montant || 0);
        const tauxMensuel = (parseFloat(p.taux || 0) / 100) / 12;
        
        // Si le prêt n'a pas encore commencé, capital restant = montant total
        if (date < dateDebutPret) {
          return sum + montant;
        }
        
        // Si le prêt est terminé, capital restant = 0
        if (moisRestants <= 0) {
          return sum + 0;
        }
        
        if (tauxMensuel === 0) {
          // Si pas de taux, capital restant = montant restant linéaire
          return sum + (montant * moisRestants / parseInt(p.duree));
        }
        
        const mensualite = montant * (tauxMensuel * Math.pow(1 + tauxMensuel, parseInt(p.duree))) / (Math.pow(1 + tauxMensuel, parseInt(p.duree)) - 1);
        
        // Formule du capital restant dû
        const capitalRestant = mensualite * ((Math.pow(1 + tauxMensuel, moisRestants) - 1) / (tauxMensuel * Math.pow(1 + tauxMensuel, moisRestants)));
        
        return sum + (isNaN(capitalRestant) ? 0 : capitalRestant);
      }, 0);
      
      // Calculer la valeur des biens achetés AVANT ou À cette date
      const valeurBiensPossedes = biensFiltres.reduce((sum, bien) => {
        if (!bien.dateAchat) return sum;
        
        const dateAchatBien = new Date(bien.dateAchat);
        // Normaliser les dates en ignorant l'heure pour comparer uniquement les jours
        const dateAchatNormalisee = new Date(dateAchatBien.getFullYear(), dateAchatBien.getMonth(), dateAchatBien.getDate());
        const datePointNormalisee = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        // Si le bien a été acheté avant ou à cette date, on compte sa valeur
        if (dateAchatNormalisee <= datePointNormalisee) {
          return sum + (bien.valeurActuelle || bien.prixAchat);
        }
        return sum;
      }, 0);
      
      // Calculer le patrimoine à cette date
      let value;
      if (viewType === 'brut') {
        // Patrimoine brut = valeur des biens possédés à cette date
        value = valeurBiensPossedes;
      } else {
        // Patrimoine net = valeur des biens possédés - capital restant dû à cette date
        value = valeurBiensPossedes - capitalRestantDuADate;
      }
      
      dataPoints.push(Math.round(value));
    }
    
    return { labels, dataPoints };
  };

  // Régénérer quand les filtres changent
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

  // Répartition par type de bien
  const biensParType = biens.reduce((acc, bien) => {
    const type = bien.type || 'AUTRE';
    if (!acc[type]) {
      acc[type] = { count: 0, valeur: 0 };
    }
    acc[type].count++;
    acc[type].valeur += (bien.valeurActuelle || bien.prixAchat);
    return acc;
  }, {});

  const typeLabels = {
    'LOCAL_COMMERCIAL': 'Locaux commerciaux',
    'APPARTEMENT': 'Appartements',
    'MAISON': 'Maisons',
    'BUREAUX': 'Bureaux',
    'PARKING': 'Parkings',
    'TERRAIN': 'Terrains',
    'HANGAR': 'Hangars',
    'AUTRE': 'Autres'
  };

  const typeColors = {
    'LOCAL_COMMERCIAL': '#3b82f6',
    'APPARTEMENT': '#8b5cf6',
    'MAISON': '#10b981',
    'BUREAUX': '#f59e0b',
    'PARKING': '#ef4444',
    'TERRAIN': '#06b6d4',
    'HANGAR': '#ec4899',
    'AUTRE': '#6b7280'
  };

  const repartitionData = {
    labels: Object.keys(biensParType).map(type => typeLabels[type] || type),
    datasets: [{
      data: Object.values(biensParType).map(item => item.count),
      backgroundColor: Object.keys(biensParType).map(type => typeColors[type] || '#6b7280'),
      borderColor: '#1a1a1a',
      borderWidth: 3,
      hoverOffset: 8
    }]
  };

  const repartitionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          color: '#e8e9ef',
          padding: 20,
          font: {
            size: 13,
            weight: '500'
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(28, 28, 36, 0.95)',
        titleColor: '#fff',
        bodyColor: '#e8e9ef',
        borderColor: '#3b82f6',
        borderWidth: 1,
        padding: 16,
        displayColors: true,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: (context) => {
            const type = Object.keys(biensParType)[context.dataIndex];
            const data = biensParType[type];
            return [
              `${context.parsed} bien${context.parsed > 1 ? 's' : ''}`,
              `Valeur: ${data.valeur.toLocaleString('fr-FR')} €`
            ];
          }
        }
      }
    }
  };

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
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-light-200 bg-clip-text text-transparent">
                Patrimoine
              </h1>
              <a
                href="http://localhost:3000/api/exports/dashboard/excel"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-accent-green/10 hover:bg-accent-green/20 text-accent-green rounded-xl text-sm font-semibold transition-all border border-accent-green/30"
              >
                <Download className="h-4 w-4" />
                Excel
              </a>
              <a
                href="http://localhost:3000/api/exports/dashboard/pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-semibold transition-all border border-red-500/30"
              >
                <Download className="h-4 w-4" />
                PDF
              </a>
              <div className="flex gap-2 bg-dark-900 rounded-2xl p-2 border border-dark-600/30">
                <button
                  onClick={() => setViewType('brut')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    viewType === 'brut'
                      ? 'bg-accent-blue/20 text-accent-blue shadow-glow-blue'
                      : 'text-light-400 hover:text-white hover:bg-dark-800'
                  }`}
                >
                  Brut
                </button>
                <button
                  onClick={() => setViewType('net')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    viewType === 'net'
                      ? 'bg-accent-blue/20 text-accent-blue shadow-glow-blue'
                      : 'text-light-400 hover:text-white hover:bg-dark-800'
                  }`}
                >
                  Net
                </button>
              </div>
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
              <p className="text-xs text-light-500 mb-3 font-medium">Cash-flow annuel - {currentCategory.label}</p>
              <div className="flex items-end gap-3">
                <p className={`text-5xl font-bold ${
                  cashFlowAnnuel >= 0 ? 'text-accent-green' : 'text-red-400'
                }`}>
                  {cashFlowAnnuel >= 0 ? '+' : ''}{cashFlowAnnuel.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €/an
                </p>
                <div className={`flex items-center gap-1.5 mb-2 ${
                  tauxRentabiliteNet >= 0 ? 'text-accent-green' : 'text-red-400'
                }`}>
                  <span className="text-lg font-bold">{tauxRentabiliteNet}%</span>
                  {tauxRentabiliteNet >= 0 && <ArrowUpRight className="h-5 w-5" />}
                </div>
              </div>
            </div>

            <div className="p-5 bg-dark-800/50 rounded-2xl border border-dark-700/50 mb-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-light-400">Loyers annuels</span>
                  <span className="text-accent-green font-semibold">+{loyersAnnuels.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="h-px bg-dark-700 my-2"></div>
                <div className="flex justify-between">
                  <span className="text-light-400">Mensualités de prêt</span>
                  <span className="text-red-400 font-semibold">-{chargesPrets.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-light-400">Autres charges (assurances, taxes...)</span>
                  <span className="text-red-400 font-semibold">-{autresChargesAnnuelles.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</span>
                </div>
                <div className="h-px bg-dark-700 my-2"></div>
                <div className="flex justify-between">
                  <span className="text-light-300 font-semibold">Cash-flow net</span>
                  <span className={`font-bold ${
                    cashFlowAnnuel >= 0 ? 'text-accent-green' : 'text-red-400'
                  }`}>
                    {cashFlowAnnuel.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-dark-800/50 rounded-2xl border border-dark-700/50">
              <p className="text-sm text-light-400 leading-relaxed">
                Le cash-flow mesure l'argent qui entre et sort réellement de votre poche. 
                Un cash-flow négatif signifie que vous devez compléter avec votre épargne, 
                mais le capital remboursé augmente votre patrimoine net.
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

        {/* Répartition par type */}
        {biens.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-light-200 bg-clip-text text-transparent">
              Répartition par type de bien
            </h2>
            <div className="bg-dark-900 rounded-3xl p-8 border border-dark-600/30 shadow-card" style={{ height: '400px' }}>
              <Doughnut data={repartitionData} options={repartitionOptions} />
            </div>
          </div>
        )}

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
