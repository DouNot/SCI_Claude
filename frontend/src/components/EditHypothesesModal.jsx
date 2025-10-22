import { useState } from 'react';
import { X, TrendingUp, Percent, DollarSign, Home, Calendar, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function EditHypothesesModal({ projection, onClose, onUpdated }) {
  const [hypotheses, setHypotheses] = useState(projection.hypotheses || {
    tauxInflation: 2.0,
    tauxVacanceLocative: 5.0,
    tauxAugmentationLoyer: 2.0,
    tauxAugmentationCharges: 3.0,
    tauxActualisation: 4.0,
    tauxImposition: 30.0,
    provisionTravauxAnnuelle: 0,
    inclureRevente: false,
    anneeRevente: projection.dureeAnnees,
    tauxAppreciationBien: 2.0,
    fraisVente: 8.0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setHypotheses(prev => ({
      ...prev,
      [field]: field === 'inclureRevente' ? value : parseFloat(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `${API_URL}/spaces/${localStorage.getItem('currentSpaceId')}/projections/${projection.id}/hypotheses`,
        hypotheses,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Recalculer automatiquement après mise à jour des hypothèses
      await axios.post(
        `${API_URL}/spaces/${localStorage.getItem('currentSpaceId')}/projections/${projection.id}/calculer`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('✅ Hypothèses mises à jour et projection recalculée !');
      onUpdated();
    } catch (err) {
      console.error('Erreur mise à jour:', err);
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-[9998] backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none overflow-y-auto">
        <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-2xl max-w-4xl w-full my-8 pointer-events-auto">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">Modifier les hypothèses</h2>
                <p className="text-light-400">Ajustez les paramètres de votre projection</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-dark-800 rounded-xl transition"
              >
                <X className="h-6 w-6 text-light-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Hypothèses générales */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent-blue" />
                  Hypothèses générales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-light-400 mb-2">
                      Taux d'inflation (%)
                    </label>
                    <div className="relative">
                      <Percent className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-light-500" />
                      <input
                        type="number"
                        step="0.1"
                        value={hypotheses.tauxInflation}
                        onChange={(e) => handleChange('tauxInflation', e.target.value)}
                        className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                      />
                    </div>
                    <p className="text-xs text-light-500 mt-1">Impact sur l'évolution des prix</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-light-400 mb-2">
                      Taux de vacance locative (%)
                    </label>
                    <div className="relative">
                      <Percent className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-light-500" />
                      <input
                        type="number"
                        step="0.1"
                        value={hypotheses.tauxVacanceLocative}
                        onChange={(e) => handleChange('tauxVacanceLocative', e.target.value)}
                        className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                      />
                    </div>
                    <p className="text-xs text-light-500 mt-1">Période sans locataire par an</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-light-400 mb-2">
                      Augmentation annuelle loyer (%)
                    </label>
                    <div className="relative">
                      <Percent className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-light-500" />
                      <input
                        type="number"
                        step="0.1"
                        value={hypotheses.tauxAugmentationLoyer}
                        onChange={(e) => handleChange('tauxAugmentationLoyer', e.target.value)}
                        className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-light-400 mb-2">
                      Augmentation annuelle charges (%)
                    </label>
                    <div className="relative">
                      <Percent className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-light-500" />
                      <input
                        type="number"
                        step="0.1"
                        value={hypotheses.tauxAugmentationCharges}
                        onChange={(e) => handleChange('tauxAugmentationCharges', e.target.value)}
                        className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hypothèses de rentabilité */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-accent-green" />
                  Rentabilité et fiscalité
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-light-400 mb-2">
                      Taux d'actualisation (%)
                    </label>
                    <div className="relative">
                      <Percent className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-light-500" />
                      <input
                        type="number"
                        step="0.1"
                        value={hypotheses.tauxActualisation}
                        onChange={(e) => handleChange('tauxActualisation', e.target.value)}
                        className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                      />
                    </div>
                    <p className="text-xs text-light-500 mt-1">Valeur temps de l'argent</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-light-400 mb-2">
                      Taux d'imposition (%)
                    </label>
                    <div className="relative">
                      <Percent className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-light-500" />
                      <input
                        type="number"
                        step="0.1"
                        value={hypotheses.tauxImposition}
                        onChange={(e) => handleChange('tauxImposition', e.target.value)}
                        className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                      />
                    </div>
                    <p className="text-xs text-light-500 mt-1">IR ou IS applicable</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-light-400 mb-2">
                      Provision travaux annuelle (€)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-light-500" />
                      <input
                        type="number"
                        step="100"
                        value={hypotheses.provisionTravauxAnnuelle}
                        onChange={(e) => handleChange('provisionTravauxAnnuelle', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hypothèses de revente */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Home className="h-5 w-5 text-accent-purple" />
                  Revente du bien
                </h3>
                
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="inclureRevente"
                    checked={hypotheses.inclureRevente}
                    onChange={(e) => handleChange('inclureRevente', e.target.checked)}
                    className="w-5 h-5 rounded accent-accent-blue"
                  />
                  <label htmlFor="inclureRevente" className="text-sm text-light-300 font-medium">
                    Inclure une revente dans la projection
                  </label>
                </div>

                {hypotheses.inclureRevente && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-semibold text-light-400 mb-2">
                        Année de revente
                      </label>
                      <div className="relative">
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-light-500" />
                        <input
                          type="number"
                          min="1"
                          max={projection.dureeAnnees}
                          value={hypotheses.anneeRevente}
                          onChange={(e) => handleChange('anneeRevente', e.target.value)}
                          className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-light-400 mb-2">
                        Appréciation annuelle (%)
                      </label>
                      <div className="relative">
                        <Percent className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-light-500" />
                        <input
                          type="number"
                          step="0.1"
                          value={hypotheses.tauxAppreciationBien}
                          onChange={(e) => handleChange('tauxAppreciationBien', e.target.value)}
                          className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-light-400 mb-2">
                        Frais de vente (%)
                      </label>
                      <div className="relative">
                        <Percent className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-light-500" />
                        <input
                          type="number"
                          step="0.1"
                          value={hypotheses.fraisVente}
                          onChange={(e) => handleChange('fraisVente', e.target.value)}
                          className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-xl p-5">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-accent-blue flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-light-300">
                      <strong>Important :</strong> La modification des hypothèses recalculera automatiquement toute la projection. Les données mensuelles seront mises à jour en conséquence.
                    </p>
                  </div>
                </div>
              </div>

              {/* Erreur */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
                  <p className="text-sm text-red-400">❌ {error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-4">
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-xl transition font-semibold disabled:opacity-50 shadow-xl"
                >
                  {loading ? 'Mise à jour...' : 'Enregistrer et recalculer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditHypothesesModal;
