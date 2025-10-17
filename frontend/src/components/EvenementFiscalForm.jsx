import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function EvenementFiscalForm({ onClose, onSubmit, evenementToEdit = null, biensList = [] }) {
  const isEditMode = !!evenementToEdit;

  const [formData, setFormData] = useState({
    type: 'TAXE_FONCIERE',
    dateEcheance: '',
    montant: '',
    datePaiement: '',
    estPaye: false,
    notes: '',
    bienId: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (evenementToEdit) {
      setFormData({
        type: evenementToEdit.type || 'TAXE_FONCIERE',
        dateEcheance: evenementToEdit.dateEcheance ? evenementToEdit.dateEcheance.split('T')[0] : '',
        montant: evenementToEdit.montant || '',
        datePaiement: evenementToEdit.datePaiement ? evenementToEdit.datePaiement.split('T')[0] : '',
        estPaye: evenementToEdit.estPaye || false,
        notes: evenementToEdit.notes || '',
        bienId: evenementToEdit.bienId || '',
      });
    }
  }, [evenementToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditMode) {
        await onSubmit(evenementToEdit.id, formData);
      } else {
        await onSubmit(formData);
      }
      onClose();
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || `Erreur lors de ${isEditMode ? 'la modification' : 'la création'} de l'événement`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Fond flou sur toute la page */}
      <div 
        className="fixed inset-0 bg-black/60 z-[9998] backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Formulaire centré */}
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none">
        <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
          
          {/* Header */}
          <div className="sticky top-0 bg-dark-900 border-b border-dark-700/50 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-white">
              {isEditMode ? '✏️ Modifier l\'Événement Fiscal' : '📅 Ajouter un Événement Fiscal'}
            </h2>
            <button 
              onClick={onClose} 
              className="text-light-400 hover:text-white transition p-2 hover:bg-dark-800 rounded-lg"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Bien concerné */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">🏠 Bien concerné</h3>
              <select
                name="bienId"
                value={formData.bienId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-dark-800 rounded-xl text-white placeholder-light-500 focus:outline-none focus:border-accent-blue transition"
              >
                <option value="">Sélectionner un bien</option>
                {biensList.map(bien => (
                  <option key={bien.id} value={bien.id}>
                    {bien.adresse}, {bien.ville}
                  </option>
                ))}
              </select>
            </div>

            {/* Détails de l'événement */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">📋 Détails de l'événement</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-light-200 mb-1">
                    Type d'événement *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-dark-800 rounded-xl text-white focus:outline-none focus:border-accent-blue transition"
                  >
                    <option value="TAXE_FONCIERE">Taxe foncière</option>
                    <option value="CFE">CFE (Cotisation Foncière des Entreprises)</option>
                    <option value="DECLARATION_REVENUS">Déclaration de revenus fonciers</option>
                    <option value="TVA">Déclaration TVA</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-light-200 mb-1">
                      Date d'échéance *
                    </label>
                    <input
                      type="date"
                      name="dateEcheance"
                      value={formData.dateEcheance}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-[#0f0f0f] border border-dark-800 rounded-xl text-white focus:outline-none focus:border-accent-blue transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-light-200 mb-1">
                      Montant (€)
                    </label>
                    <input
                      type="number"
                      name="montant"
                      value={formData.montant}
                      onChange={handleChange}
                      step="0.01"
                      className="w-full px-4 py-3 bg-[#0f0f0f] border border-dark-800 rounded-xl text-white placeholder-light-500 focus:outline-none focus:border-accent-blue transition"
                      placeholder="1200.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="estPaye"
                      checked={formData.estPaye}
                      onChange={handleChange}
                      className="w-4 h-4 text-accent-blue border-dark-700 rounded focus:ring-accent-blue focus:ring-offset-dark-900"
                    />
                    <span className="text-sm font-medium text-light-200">Payé</span>
                  </label>
                </div>

                {formData.estPaye && (
                  <div>
                    <label className="block text-sm font-medium text-light-200 mb-1">
                      Date de paiement
                    </label>
                    <input
                      type="date"
                      name="datePaiement"
                      value={formData.datePaiement}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#0f0f0f] border border-dark-800 rounded-xl text-white focus:outline-none focus:border-accent-blue transition"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-light-200 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-dark-800 rounded-xl text-white placeholder-light-500 focus:outline-none focus:border-accent-blue transition"
                    placeholder="Informations complémentaires..."
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-dark-700">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-dark-700 rounded-xl text-light-200 hover:bg-dark-800 transition font-semibold"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light text-white rounded-xl transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent-blue/20"
              >
                {loading ? (isEditMode ? 'Modification...' : 'Création...') : (isEditMode ? 'Modifier' : 'Créer l\'événement')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default EvenementFiscalForm;
