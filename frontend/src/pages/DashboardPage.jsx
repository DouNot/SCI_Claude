import { useState, useEffect } from 'react';
import { biensAPI } from '../services/api';
import { Home, TrendingUp, Euro, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function DashboardPage() {
  const [biens, setBiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    nombreBiens: 0,
    valeurTotale: 0,
    loyersMensuels: 0,
    rentabiliteMoyenne: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await biensAPI.getAll();
      const biensData = data.data;
      setBiens(biensData);
      
      // Calculer les stats
      calculerStats(biensData);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculerStats = (biensData) => {
    const nombreBiens = biensData.length;
    
    const valeurTotale = biensData.reduce((sum, bien) => {
      return sum + (bien.valeurActuelle || bien.prixAchat || 0);
    }, 0);
    
    const loyersMensuels = biensData.reduce((sum, bien) => {
      return sum + (bien.loyerHC || 0);
    }, 0);
    
    // Rentabilité moyenne
    const biensAvecLoyer = biensData.filter(b => b.loyerHC && b.prixAchat);
    const rentabiliteMoyenne = biensAvecLoyer.length > 0
      ? biensAvecLoyer.reduce((sum, bien) => {
          const rentabilite = ((bien.loyerHC * 12) / bien.prixAchat) * 100;
          return sum + rentabilite;
        }, 0) / biensAvecLoyer.length
      : 0;

    setStats({
      nombreBiens,
      valeurTotale,
      loyersMensuels,
      rentabiliteMoyenne: rentabiliteMoyenne.toFixed(2),
    });
  };

  // Données pour graphique répartition par type
  const getDataParType = () => {
    const typeCounts = {};
    biens.forEach(bien => {
      typeCounts[bien.type] = (typeCounts[bien.type] || 0) + 1;
    });
    
    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type,
      value: count,
    }));
  };

  // Données pour graphique répartition par ville
  const getDataParVille = () => {
    const villeCounts = {};
    biens.forEach(bien => {
      villeCounts[bien.ville] = (villeCounts[bien.ville] || 0) + 1;
    });
    
    return Object.entries(villeCounts).map(([ville, count]) => ({
      ville,
      nombre: count,
    }));
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble de votre patrimoine immobilier</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Nombre de biens */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Nombre de biens</p>
            <p className="text-3xl font-bold text-gray-900">{stats.nombreBiens}</p>
          </div>

          {/* Valeur totale */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Euro className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Valeur totale</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.valeurTotale.toLocaleString('fr-FR')} €
            </p>
          </div>

          {/* Loyers mensuels */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Loyers mensuels</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.loyersMensuels.toLocaleString('fr-FR')} €
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Soit {(stats.loyersMensuels * 12).toLocaleString('fr-FR')} € /an
            </p>
          </div>

          {/* Rentabilité moyenne */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Rentabilité moyenne</p>
            <p className="text-3xl font-bold text-gray-900">{stats.rentabiliteMoyenne}%</p>
            <p className="text-xs text-gray-500 mt-1">Rentabilité brute</p>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Répartition par type */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Répartition par type</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getDataParType()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getDataParType().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Répartition par ville */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Répartition par ville</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getDataParVille()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ville" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="nombre" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tableau récapitulatif */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">Récapitulatif des biens</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bien</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Surface</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valeur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loyer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rentabilité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {biens.map((bien) => {
                  const rentabilite = bien.loyerHC && bien.prixAchat
                    ? (((bien.loyerHC * 12) / bien.prixAchat) * 100).toFixed(2)
                    : '-';
                  
                  return (
                    <tr key={bien.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{bien.adresse}</div>
                        <div className="text-sm text-gray-500">{bien.ville}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {bien.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bien.surface} m²
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(bien.valeurActuelle || bien.prixAchat).toLocaleString('fr-FR')} €
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bien.loyerHC ? `${bien.loyerHC} €` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        {rentabilite !== '-' ? `${rentabilite}%` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          bien.statut === 'LOUE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {bien.statut}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;