import { useState } from 'react';
import { X, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { envoyerQuittanceEmail } from '../services/emailService';

const EnvoyerQuittanceModal = ({ quittance, bail, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState(bail?.locataire?.email || '');

  const handleEnvoyer = async () => {
    if (!email) {
      setError('Veuillez saisir une adresse email');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await envoyerQuittanceEmail({
        bailId: bail.id,
        mois: quittance.mois,
        annee: quittance.annee,
        datePaiement: quittance.datePaiement,
        emailDestinataire: email,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  const locataireName = bail?.locataire?.typeLocataire === 'ENTREPRISE'
    ? bail?.locataire?.raisonSociale
    : `${bail?.locataire?.prenom} ${bail?.locataire?.nom}`;

  const moisNoms = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const periode = `${moisNoms[quittance.mois - 1]} ${quittance.annee}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Envoyer par email
            </h2>
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
          {/* Info quittance */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Locataire :</span>
                <span className="font-medium text-gray-900">{locataireName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Période :</span>
                <span className="font-medium text-gray-900">{periode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Montant :</span>
                <span className="font-medium text-gray-900">
                  {quittance.montantTotal?.toFixed(2)} €
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Statut :</span>
                <span className={`font-medium ${
                  quittance.estPaye ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {quittance.estPaye ? 'Payé' : 'En attente'}
                </span>
              </div>
            </div>
          </div>

          {/* Email destinataire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email du destinataire
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Info message */}
          <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              La quittance sera envoyée en pièce jointe au format PDF avec un email professionnel.
            </p>
          </div>

          {/* Erreur */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            onClick={handleEnvoyer}
            disabled={loading || !email}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Envoyer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnvoyerQuittanceModal;
