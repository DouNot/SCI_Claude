import { useState, useEffect } from 'react';
import { X, User, Building2, Calendar, Euro } from 'lucide-react';
import { useSpace } from '../contexts/SpaceContext';

function AssocieForm({ onClose, onSubmit, associeToEdit = null }) {
  const isEditMode = !!associeToEdit;
  const { currentSpace } = useSpace();

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    type: 'PERSONNE_PHYSIQUE',
    nombreParts: '',
    valeurNominale: '',
    dateEntree: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculer le pourcentage en temps réel
  const calculatePourcentage = () => {
    if (!formData.nombreParts || !currentSpace?.capitalSocial) return 0;
    return ((parseFloat(formData.nombreParts) / parseFloat(currentSpace.capitalSocial)) * 100).toFixed(2);
  };

  useEffect(() => {
    if (associeToEdit) {
      setFormData({
        nom: associeToEdit.nom || '',
        prenom: associeToEdit.prenom || '',
        email: associeToEdit.email || '',
        telephone: associeToEdit.telephone || '',
        type: associeToEdit.type || 'PERSONNE_PHYSIQUE',
        nombreParts: associeToEdit.nombreParts?.toString() || '',
        valeurNominale: associeToEdit.valeurNominale?.toString() || '',
        dateEntree: associeToEdit.dateEntree 
          ? new Date(associeToEdit.dateEntree).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      });
    }
  }, [associeToEdit]);

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
      // Préparer les données
      const dataToSend = {
        ...formData,
        nombreParts: parseInt(formData.nombreParts),
        valeurNominale: formData.valeurNominale ? parseFloat(formData.valeurNominale) : null,
        spaceId: currentSpace.id,
      };

      if (isEditMode) {
        await onSubmit(associeToEdit.id, dataToSend);
      } else {
        await onSubmit(dataToSend);
      }
      onClose();
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || `Erreur lors de ${isEditMode ? 'la modification' : 'la création'} de l'associé`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-gray-800 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">
              {isEditMode ? "Modifier l'Associé" : 'Nouvel Associé'}
            </h2>
            <p className="text-gray-400">
              {currentSpace?.nom} • Capital social : {currentSpace?.capitalSocial?.toLocaleString()} parts
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
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Type d'associé */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Type d'associé *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'PERSONNE_PHYSIQUE' }))}
                className={`p-4 rounded-xl border-2 transition flex items-center gap-3 ${
                  formData.type === 'PERSONNE_PHYSIQUE'
                    ? 'border-blue-500 bg-blue-500/10 text-white'
                    : 'border-gray-700 bg-[#0f0f0f] text-gray-400 hover:border-gray-600'
                }`}
              >
                <User className="h-5 w-5" />
                <span className="font-semibold">Personne Physique</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'PERSONNE_MORALE' }))}
                className={`p-4 rounded-xl border-2 transition flex items-center gap-3 ${
                  formData.type === 'PERSONNE_MORALE'
                    ? 'border-purple-500 bg-purple-500/10 text-white'
                    : 'border-gray-700 bg-[#0f0f0f] text-gray-400 hover:border-gray-600'
                }`}
              >
                <Building2 className="h-5 w-5" />
                <span className="font-semibold">Personne Morale</span>
              </button>
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <User className="h-5 w-5 text-blue-400" />
              Identité
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Dupont"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Jean"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="jean.dupont@exemple.fr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>
          </div>

          {/* Participation au capital */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Euro className="h-5 w-5 text-green-400" />
              Participation au Capital
            </h3>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre de parts *
                  </label>
                  <input
                    type="number"
                    name="nombreParts"
                    value={formData.nombreParts}
                    onChange={handleChange}
                    required
                    min="1"
                    max={currentSpace?.capitalSocial || 1000}
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="100"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Capital social : {currentSpace?.capitalSocial?.toLocaleString()} parts
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pourcentage
                  </label>
                  <div className="px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <p className="text-3xl font-bold text-green-400">
                      {calculatePourcentage()}%
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Calculé automatiquement</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valeur nominale (optionnel)
                </label>
                <input
                  type="number"
                  name="valeurNominale"
                  value={formData.valeurNominale}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="1.00"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Valeur d'une part sociale
                </p>
              </div>
            </div>
          </div>

          {/* Date d'entrée */}
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-purple-400" />
              Date d'entrée
            </h3>
            <input
              type="date"
              name="dateEntree"
              value={formData.dateEntree}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
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
                ? (isEditMode ? 'Modification...' : 'Création...') 
                : (isEditMode ? "Modifier l'associé" : "Créer l'associé")
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssocieForm;
