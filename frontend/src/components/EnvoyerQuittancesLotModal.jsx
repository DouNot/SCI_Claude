import { useState } from 'react';
import { X, Mail, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { envoyerQuittancesLotEmail } from '../services/emailService';

const EnvoyerQuittancesLotModal = ({ mois, annee, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultats, setResultats] = useState(null);

  const moisNoms = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const handleEnvoyer = async () => {
    setLoading(true);
    setError(null);
    setResultats(null);

    try {
      const response = await envoyerQuittancesLotEmail(mois, annee);
      setResultats(response.data);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Envoi en masse
              </h2>
              <p className="text-sm text-gray-500">
                {moisNoms[mois - 1]} {annee}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {!resultats && !loading && (
            <>
              {/* Warning */}
              <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Attention</p>
                  <p>
                    Toutes les quittances du mois de <strong>{moisNoms[mois - 1]} {annee}</strong> seront
                    envoyées par email aux locataires qui ont une adresse email enregistrée.
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Ce qui sera envoyé :</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    Email professionnel personnalisé
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    Quittance PDF en pièce jointe
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    Détails de la période et du montant
                  </li>
                </ul>
              </div>
            </>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Envoi en cours...</p>
              <p className="text-sm text-gray-500 mt-1">
                Cela peut prendre quelques instants
              </p>
            </div>
          )}

          {/* Résultats */}
          {resultats && (
            <div className="space-y-4">
              {/* Succès */}
              {resultats.succes && resultats.succes.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-medium text-green-900">
                      {resultats.succes.length} quittance(s) envoyée(s)
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {resultats.succes.map((item, index) => (
                      <div key={index} className="text-sm text-green-800 bg-white rounded p-2">
                        <div className="font-medium">{item.locataire}</div>
                        <div className="text-green-600">{item.email}</div>
                        <div className="text-gray-500 text-xs">{item.bien}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Échecs */}
              {resultats.echecs && resultats.echecs.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h3 className="font-medium text-red-900">
                      {resultats.echecs.length} échec(s)
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {resultats.echecs.map((item, index) => (
                      <div key={index} className="text-sm text-red-800 bg-white rounded p-2">
                        <div className="font-medium">{item.locataire}</div>
                        <div className="text-red-600">{item.email || 'Email manquant'}</div>
                        <div className="text-gray-500 text-xs">{item.erreur}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-4 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 sticky bottom-0">
          {!resultats && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                onClick={handleEnvoyer}
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Envoyer toutes les quittances
                  </>
                )}
              </button>
            </>
          )}
          {resultats && (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
            >
              Fermer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnvoyerQuittancesLotModal;
