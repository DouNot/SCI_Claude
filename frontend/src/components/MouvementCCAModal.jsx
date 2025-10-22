import { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, DollarSign, Calendar, FileText, Hash } from 'lucide-react';

function MouvementCCAModal({ onClose, onSubmit, associe, mouvementToEdit = null }) {
  const isEditMode = !!mouvementToEdit;

  const [formData, setFormData] = useState({
    type: 'APPORT',
    montant: '',
    libelle: '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mouvementToEdit) {
      setFormData({
        type: mouvementToEdit.type || 'APPORT',
        montant: mouvementToEdit.montant?.toString() || '',
        libelle: mouvementToEdit.libelle || '',
        date: mouvementToEdit.date 
          ? new Date(mouvementToEdit.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        reference: mouvementToEdit.reference || '',
        notes: mouvementToEdit.notes || '',
      });
    }
  }, [mouvementToEdit]);

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
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || `Erreur lors de ${isEditMode ? 'la modification' : 'l\'ajout'} du mouvement`)
    } finally {
      setLoading(false);
    }
  };

  const calculateNewSolde = () => {
    const montant = parseFloat(formData.montant) || 0;
    const currentSolde = associe.soldeCCA || 0;
    
    if (formData.type === 'APPORT' || formData.type === 'INTERETS') {
      return currentSolde + montant;
    } else if (formData.type === 'RETRAIT') {
      return currentSolde - montant;
    }
    return currentSolde;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-gray-800 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">
              {isEditMode ? 'Modifier le Mouvement CCA' : 'Nouveau Mouvement CCA'}
            </h2>
            <p className="text-gray-400">
              {associe.prenom} {associe.nom} • Solde actuel : {(associe.soldeCCA || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition p-2 hover:bg-gray-800 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Type de mouvement */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Type de mouvement *
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'APPORT' }))}
                className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                  formData.type === 'APPORT'
                    ? 'border-green-500 bg-green-500/10 text-white'
                    : 'border-gray-700 bg-[#0f0f0f] text-gray-400 hover:border-gray-600'
                }`}
              >
                <TrendingUp className="h-6 w-6" />
                <span className="font-semibold">Apport</span>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'RETRAIT' }))}
                className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                  formData.type === 'RETRAIT'
                    ? 'border-red-500 bg-red-500/10 text-white'
                    : 'border-gray-700 bg-[#0f0f0f] text-gray-400 hover:border-gray-600'
                }`}
              >
                <TrendingDown className="h-6 w-6" />
                <span className="font-semibold">Retrait</span>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'INTERETS' }))}
                className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                  formData.type === 'INTERETS'
                    ? 'border-blue-500 bg-blue-500/10 text-white'
                    : 'border-gray-700 bg-[#0f0f0f] text-gray-400 hover:border-gray-600'
                }`}
              >
                <DollarSign className="h-6 w-6" />
                <span className="font-semibold">Intérêts</span>
              </button>
            </div>
          </div>

          {/* Montant et Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Montant (€) *
              </label>
              <input
                type="number"
                name="montant"
                value={formData.montant}
                onChange={handleChange}
                required
                step="0.01"
                min="0.01"
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="1000.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Libellé */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Libellé *
            </label>
            <input
              type="text"
              name="libelle"
              value={formData.libelle}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Virement bancaire"
            />
          </div>

          {/* Référence */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Référence (optionnel)
            </label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="VIR-2025-001"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              placeholder="Informations complémentaires..."
            />
          </div>

          {/* Aperçu du nouveau solde */}
          <div className={`p-6 rounded-xl border-2 ${
            formData.type === 'RETRAIT' 
              ? 'bg-red-500/10 border-red-500/30' 
              : 'bg-green-500/10 border-green-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Nouveau solde CCA</p>
                <p className={`text-3xl font-bold ${
                  formData.type === 'RETRAIT' ? 'text-red-400' : 'text-green-400'
                }`}>
                  {calculateNewSolde().toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400 mb-1">Variation</p>
                <p className={`text-2xl font-bold ${
                  formData.type === 'RETRAIT' ? 'text-red-400' : 'text-green-400'
                }`}>
                  {formData.type === 'RETRAIT' ? '-' : '+'}{(parseFloat(formData.montant) || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border border-gray-700 rounded-xl text-gray-300 hover:bg-gray-800 transition font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
            >
              {loading 
                ? (isEditMode ? 'Modification...' : 'Ajout...') 
                : (isEditMode ? 'Modifier' : 'Ajouter le mouvement')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MouvementCCAModal;
