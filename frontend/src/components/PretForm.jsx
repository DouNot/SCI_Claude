import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function PretForm({ onClose, onSubmit, pretToEdit = null, biensList = [] }) {
  const isEditMode = !!pretToEdit;

  const [formData, setFormData] = useState({
    montant: '',
    taux: '',
    duree: '',
    tauxAssurance: '',
    dateDebut: '',
    organisme: '',
    numeroContrat: '',
    bienId: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mensualiteEstimee, setMensualiteEstimee] = useState(null);

  useEffect(() => {
    if (pretToEdit) {
      setFormData({
        montant: pretToEdit.montant || '',
        taux: pretToEdit.taux || '',
        duree: pretToEdit.duree || '',
        tauxAssurance: pretToEdit.tauxAssurance || '',
        dateDebut: pretToEdit.dateDebut ? pretToEdit.dateDebut.split('T')[0] : '',
        organisme: pretToEdit.organisme || '',
        numeroContrat: pretToEdit.numeroContrat || '',
        bienId: pretToEdit.bienId || '',
      });
    }
  }, [pretToEdit]);

  // Calcul de la mensualité en temps réel
  useEffect(() => {
    if (formData.montant && formData.taux && formData.duree) {
      const montant = parseFloat(formData.montant);
      const tauxAnnuel = parseFloat(formData.taux);
      const duree = parseInt(formData.duree);
      const tauxAssurance = formData.tauxAssurance ? parseFloat(formData.tauxAssurance) : 0;

      const tauxMensuel = tauxAnnuel / 100 / 12;
      const mensualiteCapitalInterets = montant * (tauxMensuel * Math.pow(1 + tauxMensuel, duree)) / (Math.pow(1 + tauxMensuel, duree) - 1);
      const mensualiteAssurance = montant * (tauxAssurance / 100 / 12);
      const mensualiteTotale = mensualiteCapitalInterets + mensualiteAssurance;

      setMensualiteEstimee(mensualiteTotale);
    } else {
      setMensualiteEstimee(null);
    }
  }, [formData.montant, formData.taux, formData.duree, formData.tauxAssurance]);

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
      if (isEditMode) {
        await onSubmit(pretToEdit.id, formData);
      } else {
        await onSubmit(formData);
      }
      onClose();
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || `Erreur lors de ${isEditMode ? 'la modification' : 'la création'} du prêt`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Modifier le Prêt' : 'Ajouter un Prêt'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
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

          {/* Bien concerné */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bien concerné</h3>
            <select
              name="bienId"
              value={formData.bienId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionner un bien</option>
              {biensList.map(bien => (
                <option key={bien.id} value={bien.id}>
                  {bien.adresse}, {bien.ville}
                </option>
              ))}
            </select>
          </div>

          {/* Caractéristiques du prêt */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Caractéristiques du prêt</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant emprunté (€) *
                  </label>
                  <input
                    type="number"
                    name="montant"
                    value={formData.montant}
                    onChange={handleChange}
                    required
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="200000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taux d'intérêt annuel (%) *
                  </label>
                  <input
                    type="number"
                    name="taux"
                    value={formData.taux}
                    onChange={handleChange}
                    required
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="3.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durée (en mois) *
                  </label>
                  <input
                    type="number"
                    name="duree"
                    value={formData.duree}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="240 (20 ans)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taux assurance annuel (%)
                  </label>
                  <input
                    type="number"
                    name="tauxAssurance"
                    value={formData.tauxAssurance}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.36"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début *
                </label>
                <input
                  type="date"
                  name="dateDebut"
                  value={formData.dateDebut}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Mensualité estimée */}
              {mensualiteEstimee && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">
                      Mensualité estimée :
                    </span>
                    <span className="text-2xl font-bold text-blue-900">
                      {mensualiteEstimee.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    Sur {formData.duree} mois ({(formData.duree / 12).toFixed(1)} ans)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Organisme bancaire */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Organisme bancaire</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la banque *
                </label>
                <input
                  type="text"
                  name="organisme"
                  value={formData.organisme}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Crédit Agricole"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de contrat
                </label>
                <input
                  type="text"
                  name="numeroContrat"
                  value={formData.numeroContrat}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123456789"
                />
              </div>
            </div>
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
              {loading ? (isEditMode ? 'Modification...' : 'Création...') : (isEditMode ? 'Modifier' : 'Créer le prêt')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PretForm;