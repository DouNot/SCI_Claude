import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { bauxAPI } from '../services/api';

function ResilierBailModal({ bail, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    dateFin: new Date().toISOString().split('T')[0],
    motif: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Envoyer seulement les champs modifiables
      await bauxAPI.update(bail.id, {
        dateFin: formData.dateFin,
        statut: 'RESILIE',
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || 'Erreur lors de la résiliation du bail');
    } finally {
      setLoading(false);
    }
  };

  const locataireName = bail.locataire?.typeLocataire === 'ENTREPRISE'
    ? bail.locataire?.raisonSociale
    : `${bail.locataire?.prenom} ${bail.locataire?.nom}`;

  return (
    <>
      {/* Fond flou */}
      <div 
        className="fixed inset-0 bg-black/60 z-[9998] backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div 
        className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none"
        style={{ left: '256px', padding: '2rem 4rem' }}
      >
        <div 
          className="bg-dark-900 rounded-3xl border border-dark-600/30 shadow-2xl max-w-md w-full pointer-events-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center border border-red-500/20">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">
                Résilier le bail
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-light-400 hover:text-white transition-colors"
            >
              <X className="w-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Info bail */}
            <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-light-500">Bien :</span>
                  <span className="font-medium text-white">{bail.bien?.adresse}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-light-500">Locataire :</span>
                  <span className="font-medium text-white">{locataireName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-light-500">Loyer :</span>
                  <span className="font-medium text-white">
                    {bail.loyerHC?.toFixed(2)} € HC
                  </span>
                </div>
              </div>
            </div>

            {/* Date de fin */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Date de fin du bail *
              </label>
              <input
                type="date"
                value={formData.dateFin}
                onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                required
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-red-500 transition"
              />
            </div>

            {/* Motif (optionnel) */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Motif de résiliation (optionnel)
              </label>
              <textarea
                value={formData.motif}
                onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                rows={3}
                placeholder="Ex: Départ du locataire, vente du bien..."
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition resize-none"
              />
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/30">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">⚠️ Attention</p>
                <p className="text-red-300">
                  Le bail sera marqué comme résilié. Cette action ne peut pas être annulée.
                  Vous pourrez ensuite créer un nouveau bail avec un autre locataire.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-700/50">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-300 hover:text-white font-medium transition-colors"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {loading ? 'Résiliation...' : 'Résilier le bail'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default ResilierBailModal;
