import { useState } from 'react';
import { X, Download } from 'lucide-react';
import { quittancesAPI } from '../services/api';

function QuittanceForm({ onClose, bail }) {
  const [formData, setFormData] = useState({
    mois: new Date().getMonth() + 1,
    annee: new Date().getFullYear(),
    datePaiement: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await quittancesAPI.generer({
        bailId: bail.id,
        mois: parseInt(formData.mois),
        annee: parseInt(formData.annee),
        datePaiement: formData.datePaiement,
      });

      // Télécharger le PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `quittance-${formData.annee}-${String(formData.mois).padStart(2, '0')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      onClose();
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de la génération de la quittance');
    } finally {
      setLoading(false);
    }
  };

  const moisOptions = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' },
  ];

  const currentYear = new Date().getFullYear();
  const anneeOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

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
          className="bg-dark-900 rounded-3xl border border-dark-600/30 shadow-2xl max-w-2xl w-full pointer-events-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-dark-900 border-b border-dark-700/50 px-8 py-6 flex items-center justify-between rounded-t-3xl">
            <h2 className="text-2xl font-bold text-white">
              📄 Générer une quittance de loyer
            </h2>
            <button 
              onClick={onClose} 
              className="text-light-400 hover:text-white transition p-2 hover:bg-dark-800 rounded-xl"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleGenerate} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Infos du bail */}
            <div className="p-6 bg-dark-800/50 rounded-2xl border border-dark-700/50">
              <h3 className="text-sm font-semibold text-light-300 mb-4">Informations du bail</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-light-500 mb-1">Locataire</p>
                  <p className="text-white font-semibold">
                    {bail.locataire?.typeLocataire === 'ENTREPRISE' 
                      ? bail.locataire?.raisonSociale 
                      : `${bail.locataire?.prenom} ${bail.locataire?.nom}`}
                  </p>
                </div>
                <div>
                  <p className="text-light-500 mb-1">Bien</p>
                  <p className="text-white font-semibold">{bail.bien?.adresse}</p>
                </div>
                <div>
                  <p className="text-light-500 mb-1">Loyer HC</p>
                  <p className="text-accent-green font-bold">{bail.loyerHC.toLocaleString('fr-FR')} €</p>
                </div>
                <div>
                  <p className="text-light-500 mb-1">Charges</p>
                  <p className="text-white font-semibold">{(bail.charges || 0).toLocaleString('fr-FR')} €</p>
                </div>
              </div>
            </div>

            {/* Période */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">📅 Période</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Mois *
                  </label>
                  <select
                    name="mois"
                    value={formData.mois}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-accent-blue transition"
                  >
                    {moisOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Année *
                  </label>
                  <select
                    name="annee"
                    value={formData.annee}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-accent-blue transition"
                  >
                    {anneeOptions.map(annee => (
                      <option key={annee} value={annee}>
                        {annee}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Date de paiement */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">💰 Paiement</h3>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Date de paiement
                </label>
                <input
                  type="date"
                  name="datePaiement"
                  value={formData.datePaiement}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-accent-blue transition"
                />
                <p className="text-xs text-light-500 mt-2">
                  Laisser vide si le paiement n'est pas encore effectué
                </p>
              </div>
            </div>

            {/* Résumé */}
            <div className="p-6 bg-gradient-to-br from-accent-blue/10 to-accent-purple/10 rounded-2xl border border-accent-blue/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-accent-blue font-medium mb-1">Montant total</p>
                  <p className="text-3xl font-bold text-white">
                    {(bail.loyerHC + (bail.charges || 0)).toLocaleString('fr-FR')} €
                  </p>
                </div>
                <Download className="h-12 w-12 text-accent-blue/50" />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-6 border-t border-dark-700/50">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 border border-gray-700 rounded-xl text-gray-200 hover:bg-dark-800 transition font-semibold"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light text-white rounded-xl transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-accent-blue/30 hover:shadow-2xl hover:shadow-accent-blue/40 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Génération...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Générer le PDF
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default QuittanceForm;
