import { useState, useEffect } from 'react';
import { biensAPI } from '../services/api';
import { Home, MapPin, TrendingUp, Euro } from 'lucide-react';

function BiensPage() {
  const [biens, setBiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les biens au montage du composant
  useEffect(() => {
    loadBiens();
  }, []);

  const loadBiens = async () => {
    try {
      setLoading(true);
      const data = await biensAPI.getAll();
      setBiens(data.data);
      setError(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les biens');
    } finally {
      setLoading(false);
    }
  };

  // Calculer la rentabilité
  const calculerRentabilite = (bien) => {
    if (!bien.loyerHC || !bien.prixAchat) return null;
    const loyerAnnuel = bien.loyerHC * 12;
    const rentabilite = (loyerAnnuel / bien.prixAchat) * 100;
    return rentabilite.toFixed(2);
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des biens...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800 font-semibold mb-2">❌ Erreur</p>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadBiens}
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
              <h1 className="text-3xl font-bold text-gray-900">🏠 Mes Biens</h1>
              <p className="text-gray-600 mt-1">{biens.length} bien(s) immobilier(s)</p>
            </div>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
              + Ajouter un Bien
            </button>
          </div>
        </div>
      </div>

      {/* Liste des biens */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {biens.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Home className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun bien pour le moment
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par ajouter votre premier bien immobilier !
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
              + Ajouter mon premier bien
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {biens.map((bien) => (
              <div
                key={bien.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden cursor-pointer"
              >
                {/* Image placeholder */}
                <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <Home className="h-20 w-20 text-white opacity-50" />
                </div>

                {/* Contenu */}
                <div className="p-6">
                  {/* Type */}
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    {bien.type}
                  </span>

                  {/* Adresse */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {bien.adresse}
                  </h3>
                  <p className="text-gray-600 flex items-center gap-1 mb-4">
                    <MapPin className="h-4 w-4" />
                    {bien.ville} ({bien.codePostal})
                  </p>

                  {/* Infos */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Surface</span>
                      <span className="font-semibold">{bien.surface} m²</span>
                    </div>
                    {bien.nbPieces && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Pièces</span>
                        <span className="font-semibold">{bien.nbPieces}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Prix d'achat</span>
                      <span className="font-semibold">
                        {bien.prixAchat.toLocaleString('fr-FR')} €
                      </span>
                    </div>
                    {bien.loyerHC && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Loyer HC</span>
                        <span className="font-semibold text-green-600">
                          {bien.loyerHC} € /mois
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Rentabilité */}
                  {calculerRentabilite(bien) && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                      <span className="text-sm text-green-800 font-medium flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Rentabilité brute
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {calculerRentabilite(bien)}%
                      </span>
                    </div>
                  )}

                  {/* Statut */}
                  <div className="mt-4 pt-4 border-t">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        bien.statut === 'LOUE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {bien.statut}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BiensPage;