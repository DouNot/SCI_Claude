import { useState } from 'react';
import { X, Building2, Calendar, DollarSign, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function CreateSpaceModal({ onClose, onSubmit }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    siret: '',
    capitalSocial: '',
    formeJuridique: 'SCI',
    dateCreation: '',
    dateCloture: '31/12',
    regimeFiscal: 'IR',
    adresse: '',
    objetSocial: 'Gestion immobilière',
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

    // Validation basique
    if (!formData.nom.trim()) {
      setError('Le nom de la SCI est requis');
      setLoading(false);
      return;
    }

    try {
      // Préparer les données pour l'API
      const spaceData = {
        nom: formData.nom.trim(),
        siret: formData.siret.trim() || null,
        capitalSocial: formData.capitalSocial ? parseFloat(formData.capitalSocial) : null,
        formeJuridique: formData.formeJuridique,
        dateCreation: formData.dateCreation || null,
        dateCloture: formData.dateCloture || '31/12',
        regimeFiscal: formData.regimeFiscal,
        adresse: formData.adresse.trim() || null,
        objetSocial: formData.objetSocial.trim() || null,
      };

      const result = await onSubmit(spaceData);
      
      if (result.success) {
        // Fermer le modal
        onClose();
        // Naviguer vers le dashboard sans reload
        navigate('/dashboard');
      } else {
        setError(result.error || 'Erreur lors de la création');
      }
    } catch (err) {
      console.error('Erreur création SCI:', err);
      setError(err.response?.data?.error || 'Erreur lors de la création de la SCI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div 
          className="bg-slate-900 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Créer une SCI</h2>
                <p className="text-sm text-slate-400">Nouvel espace de gestion immobilière</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition p-2 hover:bg-slate-800 rounded-lg"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Informations générales */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-400" />
                Informations générales
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    Nom de la SCI *
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                    placeholder="Ex: SCI Immobilier Paris"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1">
                      Forme juridique
                    </label>
                    <select
                      name="formeJuridique"
                      value={formData.formeJuridique}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                    >
                      <option value="SCI">SCI</option>
                      <option value="SARL DE FAMILLE">SARL de famille</option>
                      <option value="SAS">SAS</option>
                      <option value="AUTRE">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1">
                      SIRET (optionnel)
                    </label>
                    <input
                      type="text"
                      name="siret"
                      value={formData.siret}
                      onChange={handleChange}
                      maxLength={14}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                      placeholder="12345678901234"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    Adresse du siège social (optionnel)
                  </label>
                  <input
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                    placeholder="123 rue de la République, 75001 Paris"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    Objet social
                  </label>
                  <textarea
                    name="objetSocial"
                    value={formData.objetSocial}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition resize-none"
                    placeholder="Ex: Gestion et location de biens immobiliers"
                  />
                </div>
              </div>
            </div>

            {/* Informations financières et fiscales */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                Informations financières et fiscales
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1">
                      Capital social (€)
                    </label>
                    <input
                      type="number"
                      name="capitalSocial"
                      value={formData.capitalSocial}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                      placeholder="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1">
                      Régime fiscal
                    </label>
                    <select
                      name="regimeFiscal"
                      value={formData.regimeFiscal}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                    >
                      <option value="IR">IR (Impôt sur le Revenu)</option>
                      <option value="IS">IS (Impôt sur les Sociétés)</option>
                    </select>
                    <p className="text-xs text-slate-400 mt-1">
                      {formData.regimeFiscal === 'IR' 
                        ? '💡 Imposition au niveau des associés' 
                        : '💡 Imposition au niveau de la société'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-400" />
                Dates importantes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    Date de création (optionnel)
                  </label>
                  <input
                    type="date"
                    name="dateCreation"
                    value={formData.dateCreation}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    Date de clôture de l'exercice
                  </label>
                  <input
                    type="text"
                    name="dateCloture"
                    value={formData.dateCloture}
                    onChange={handleChange}
                    placeholder="31/12"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Format: JJ/MM (ex: 31/12)
                  </p>
                </div>
              </div>
            </div>

            {/* Info box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex gap-3">
                <FileText className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-400 mb-1">À savoir</p>
                  <p className="text-xs text-slate-300">
                    Vous serez automatiquement ajouté comme propriétaire (OWNER) de cette SCI. 
                    Vous pourrez inviter d'autres membres et gérer les associés depuis l'espace SCI.
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-slate-700 rounded-lg text-slate-200 hover:bg-slate-800 transition font-semibold"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
              >
                {loading ? 'Création...' : 'Créer la SCI'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateSpaceModal;
