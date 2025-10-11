import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const TYPES_CHARGE = [
  { value: 'COPROPRIETE', label: 'Charges de copropriété' },
  { value: 'ASSURANCE_PNO', label: 'Assurance PNO' },
  { value: 'ASSURANCE_GLI', label: 'Assurance GLI' },
  { value: 'TAXE_FONCIERE', label: 'Taxe foncière' },
  { value: 'ENTRETIEN', label: 'Entretien/Maintenance' },
  { value: 'GESTION_LOCATIVE', label: 'Gestion locative' },
  { value: 'AUTRE', label: 'Autre' },
];

const FREQUENCES = [
  { value: 'MENSUELLE', label: 'Mensuelle' },
  { value: 'TRIMESTRIELLE', label: 'Trimestrielle' },
  { value: 'SEMESTRIELLE', label: 'Semestrielle' },
  { value: 'ANNUELLE', label: 'Annuelle' },
  { value: 'PONCTUELLE', label: 'Ponctuelle' },
];

function ChargeForm({ onClose, onSubmit, chargeToEdit, biensList }) {
  const [formData, setFormData] = useState({
    type: '',
    libelle: '',
    montant: '',
    frequence: 'MENSUELLE',
    dateDebut: '',
    dateFin: '',
    jourPaiement: '',
    estActive: true,
    notes: '',
    bienId: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (chargeToEdit) {
      setFormData({
        type: chargeToEdit.type || '',
        libelle: chargeToEdit.libelle || '',
        montant: chargeToEdit.montant || '',
        frequence: chargeToEdit.frequence || 'MENSUELLE',
        dateDebut: chargeToEdit.dateDebut ? new Date(chargeToEdit.dateDebut).toISOString().split('T')[0] : '',
        dateFin: chargeToEdit.dateFin ? new Date(chargeToEdit.dateFin).toISOString().split('T')[0] : '',
        jourPaiement: chargeToEdit.jourPaiement || '',
        estActive: chargeToEdit.estActive !== undefined ? chargeToEdit.estActive : true,
        notes: chargeToEdit.notes || '',
        bienId: chargeToEdit.bienId || '',
      });
    } else if (biensList && biensList.length === 1) {
      setFormData(prev => ({ ...prev, bienId: biensList[0].id }));
    }
  }, [chargeToEdit, biensList]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.type || !formData.libelle || !formData.montant || !formData.dateDebut) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      if (chargeToEdit) {
        await onSubmit(chargeToEdit.id, formData);
      } else {
        await onSubmit(formData);
      }
      onClose();
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-dark-900 rounded-3xl border border-dark-600/30 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-dark-900/95 backdrop-blur-sm border-b border-dark-700/50 px-8 py-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {chargeToEdit ? 'Modifier la charge' : 'Nouvelle charge'}
          </h2>
          <button
            onClick={onClose}
            className="text-light-400 hover:text-white transition p-2 hover:bg-dark-800 rounded-xl"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Bien */}
          <div>
            <label className="block text-sm font-semibold text-light-300 mb-2">
              Bien concerné
            </label>
            <select
              name="bienId"
              value={formData.bienId}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition"
            >
              <option value="">Charge globale (non associée à un bien)</option>
              {biensList && biensList.map(bien => (
                <option key={bien.id} value={bien.id}>
                  {bien.adresse}, {bien.ville}
                </option>
              ))}
            </select>
            <p className="text-xs text-light-500 mt-1">Laissez vide pour une charge globale de la SCI</p>
          </div>

          {/* Type et Libellé */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-light-300 mb-2">
                Type de charge <span className="text-red-400">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition"
              >
                <option value="">Sélectionner</option>
                {TYPES_CHARGE.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-light-300 mb-2">
                Libellé <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="libelle"
                value={formData.libelle}
                onChange={handleChange}
                required
                placeholder="Ex: Charges copropriété T1 2025"
                className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder:text-light-500 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition"
              />
            </div>
          </div>

          {/* Montant et Fréquence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-light-300 mb-2">
                Montant <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="montant"
                  value={formData.montant}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder:text-light-500 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-light-400 text-sm">
                  €
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-light-300 mb-2">
                Fréquence <span className="text-red-400">*</span>
              </label>
              <select
                name="frequence"
                value={formData.frequence}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition"
              >
                {FREQUENCES.map(freq => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-light-300 mb-2">
                Date de début <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="dateDebut"
                value={formData.dateDebut}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-light-300 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                name="dateFin"
                value={formData.dateFin}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition"
              />
              <p className="text-xs text-light-500 mt-1">Optionnel</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-light-300 mb-2">
                Jour de paiement
              </label>
              <input
                type="number"
                name="jourPaiement"
                value={formData.jourPaiement}
                onChange={handleChange}
                min="1"
                max="31"
                placeholder="Ex: 5"
                className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder:text-light-500 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition"
              />
              <p className="text-xs text-light-500 mt-1">Jour du mois (1-31)</p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-light-300 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Notes supplémentaires..."
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder:text-light-500 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition resize-none"
            />
          </div>

          {/* Statut */}
          <div className="flex items-center gap-3 p-4 bg-dark-800/50 rounded-xl border border-dark-700/50">
            <input
              type="checkbox"
              id="estActive"
              name="estActive"
              checked={formData.estActive}
              onChange={handleChange}
              className="w-5 h-5 rounded border-dark-600 bg-dark-700 text-accent-blue focus:ring-2 focus:ring-accent-blue/20"
            />
            <label htmlFor="estActive" className="text-sm font-medium text-light-300 cursor-pointer">
              Charge active
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-dark-800 hover:bg-dark-700 rounded-2xl border border-dark-600 transition font-semibold text-light-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-accent-blue hover:bg-accent-blue-light rounded-2xl transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enregistrement...' : chargeToEdit ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChargeForm;
