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
    bienId: biensList[0]?.id || '',
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-dark-900 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-dark-600/30">
        {/* Header */}
        <div className="sticky top-0 bg-dark-900 border-b border-dark-700/50 px-8 py-6 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-light-200 bg-clip-text text-transparent">
            {isEditMode ? 'Modifier le Prêt' : 'Ajouter un Prêt'}
          </h2>
          <button onClick={onClose} className="text-light-400 hover:text-white transition p-2 hover:bg-dark-800 rounded-xl">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
              <p className="text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Bien concerné */}
          {biensList.length > 1 && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Bien concerné</h3>
              <select
                name="bienId"
                value={formData.bienId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-dark-800 border border-dark-600/50 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
              >
                <option value="">Sélectionner un bien</option>
                {biensList.map(bien => (
                  <option key={bien.id} value={bien.id}>
                    {bien.adresse}, {bien.ville}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Caractéristiques du prêt */}
          <div>
            <h3 className="text-lg font-bold text-white mb-5">Caractéristiques du prêt</h3>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-light-300 mb-2">
                    Montant emprunté (€) *
                  </label>
                  <input
                    type="number"
                    name="montant"
                    value={formData.montant}
                    onChange={handleChange}
                    required
                    step="0.01"
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-600/50 rounded-2xl text-white placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                    placeholder="200000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-light-300 mb-2">
                    Taux d'intérêt annuel (%) *
                  </label>
                  <input
                    type="number"
                    name="taux"
                    value={formData.taux}
                    onChange={handleChange}
                    required
                    step="0.01"
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-600/50 rounded-2xl text-white placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                    placeholder="3.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-light-300 mb-2">
                    Durée (en mois) *
                  </label>
                  <input
                    type="number"
                    name="duree"
                    value={formData.duree}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-600/50 rounded-2xl text-white placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                    placeholder="240 (20 ans)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-light-300 mb-2">
                    Taux assurance annuel (%)
                  </label>
                  <input
                    type="number"
                    name="tauxAssurance"
                    value={formData.tauxAssurance}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-600/50 rounded-2xl text-white placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                    placeholder="0.36"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-light-300 mb-2">
                  Date de début *
                </label>
                <input
                  type="date"
                  name="dateDebut"
                  value={formData.dateDebut}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600/50 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                />
              </div>

              {/* Mensualité estimée */}
              {mensualiteEstimee && (
                <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-accent-blue">
                      Mensualité estimée :
                    </span>
                    <span className="text-3xl font-bold text-accent-blue">
                      {mensualiteEstimee.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </span>
                  </div>
                  <p className="text-xs text-light-400">
                    Sur {formData.duree} mois ({(formData.duree / 12).toFixed(1)} ans)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Organisme bancaire */}
          <div>
            <h3 className="text-lg font-bold text-white mb-5">Organisme bancaire</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-light-300 mb-2">
                  Nom de la banque *
                </label>
                <input
                  type="text"
                  name="organisme"
                  value={formData.organisme}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600/50 rounded-2xl text-white placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                  placeholder="Crédit Agricole"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-light-300 mb-2">
                  Numéro de contrat
                </label>
                <input
                  type="text"
                  name="numeroContrat"
                  value={formData.numeroContrat}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600/50 rounded-2xl text-white placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                  placeholder="123456789"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6 border-t border-dark-700/50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-dark-800 hover:bg-dark-700 border border-dark-600/50 rounded-2xl text-light-300 hover:text-white transition font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl text-white transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent-blue/30"
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
