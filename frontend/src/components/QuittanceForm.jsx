import { useState } from 'react';
import { X } from 'lucide-react';
import { quittancesAPI } from '../services/api';

function QuittanceForm({ onClose, bauxList = [] }) {
  const [formData, setFormData] = useState({
    bailId: '',
    mois: new Date().getMonth() + 1,
    annee: new Date().getFullYear(),
    datePaiement: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Générer la quittance
      const response = await quittancesAPI.generer(formData);
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `quittance-${formData.annee}-${String(formData.mois).padStart(2, '0')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Fermer le modal
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            🧾 Générer une Quittance
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Sélection du bail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bail *
            </label>
            <select
              name="bailId"
              value={formData.bailId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionner un bail</option>
              {bauxList.map(bail => (
                <option key={bail.id} value={bail.id}>
                  {bail.bien?.adresse} - {bail.locataire?.typeLocataire === 'ENTREPRISE' 
                    ? bail.locataire?.raisonSociale 
                    : `${bail.locataire?.prenom} ${bail.locataire?.nom}`}
                </option>
              ))}
            </select>
          </div>

          {/* Période */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mois *
              </label>
              <select
                name="mois"
                value={formData.mois}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {moisOptions.map(m => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Année *
              </label>
              <input
                type="number"
                name="annee"
                value={formData.annee}
                onChange={handleChange}
                required
                min="2020"
                max="2099"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Date de paiement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de paiement (optionnel)
            </label>
            <input
              type="date"
              name="datePaiement"
              value={formData.datePaiement}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Si renseignée, apparaîtra sur la quittance
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Génération...' : 'Générer PDF'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QuittanceForm;