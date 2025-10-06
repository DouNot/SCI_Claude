import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function TravauxForm({ onClose, onSubmit, travauxToEdit = null, biensList = [] }) {
  const isEditMode = !!travauxToEdit;

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type: 'REPARATION',
    categorie: 'RENOVATION',
    artisan: '',
    dateDebut: '',
    dateFin: '',
    coutEstime: '',
    coutReel: '',
    etat: 'PLANIFIE',
    bienId: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (travauxToEdit) {
      setFormData({
        titre: travauxToEdit.titre || '',
        description: travauxToEdit.description || '',
        type: travauxToEdit.type || 'REPARATION',
        categorie: travauxToEdit.categorie || 'RENOVATION',
        artisan: travauxToEdit.artisan || '',
        dateDebut: travauxToEdit.dateDebut ? travauxToEdit.dateDebut.split('T')[0] : '',
        dateFin: travauxToEdit.dateFin ? travauxToEdit.dateFin.split('T')[0] : '',
        coutEstime: travauxToEdit.coutEstime || '',
        coutReel: travauxToEdit.coutReel || '',
        etat: travauxToEdit.etat || 'PLANIFIE',
        bienId: travauxToEdit.bienId || '',
      });
    }
  }, [travauxToEdit]);

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
        await onSubmit(travauxToEdit.id, formData);
      } else {
        await onSubmit(formData);
      }
      onClose();
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || `Erreur lors de ${isEditMode ? 'la modification' : 'la création'} des travaux`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Fond flou */}
      <div 
        className="absolute inset-0 bg-black/60 z-[9998]" 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backdropFilter: 'blur(8px)', 
          WebkitBackdropFilter: 'blur(8px)' 
        }} 
        onClick={onClose} 
      />
      
      <div 
        className="absolute inset-0 flex items-center justify-center z-[9999]" 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: '256px', 
          right: 0, 
          bottom: 0, 
          padding: '2rem 4rem', 
          pointerEvents: 'none' 
        }}
      >
        <div 
          className="bg-[#1a1a1a] rounded-2xl border border-gray-800 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" 
          style={{ pointerEvents: 'auto' }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#1a1a1a] border-b border-gray-800 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-white">
              {isEditMode ? '✏️ Modifier les Travaux' : '🔨 Ajouter des Travaux'}
            </h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-white transition p-2 hover:bg-[#252525] rounded-lg"
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

            {/* Bien */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">🏠 Bien concerné</h3>
              <select
                name="bienId"
                value={formData.bienId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
            >
              <option value="">Sélectionner un bien</option>
              {biensList.map(bien => (
                <option key={bien.id} value={bien.id}>
                  {bien.adresse}, {bien.ville}
                </option>
              ))}
            </select>
          </div>

            {/* Informations générales */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">📋 Informations générales</h3>
            <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                  Titre des travaux *
                </label>
                <input
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleChange}
                  required
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  placeholder="Rénovation salle de bain"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                  >
                    <option value="REPARATION">Réparation</option>
                    <option value="AMELIORATION">Amélioration</option>
                    <option value="ENTRETIEN">Entretien</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Catégorie *
                  </label>
                  <select
                    name="categorie"
                    value={formData.categorie}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                  >
                    <option value="RENOVATION">Rénovation</option>
                    <option value="PLOMBERIE">Plomberie</option>
                    <option value="ELECTRICITE">Électricité</option>
                    <option value="PEINTURE">Peinture</option>
                    <option value="MENUISERIE">Menuiserie</option>
                    <option value="CHAUFFAGE">Chauffage</option>
                    <option value="TOITURE">Toiture</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Artisan / Entreprise
                  </label>
                  <input
                    type="text"
                    name="artisan"
                    value={formData.artisan}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                    placeholder="Entreprise Dupont"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  placeholder="Détails des travaux..."
                />
              </div>
            </div>
          </div>

            {/* Dates */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">📅 Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Date de début *
                </label>
                <input
                  type="date"
                  name="dateDebut"
                  value={formData.dateDebut}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Date de fin (estimée)
                </label>
                <input
                  type="date"
                  name="dateFin"
                  value={formData.dateFin}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
          </div>

            {/* Coûts */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">💰 Coûts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Coût estimé (€) *
                </label>
                <input
                  type="number"
                  name="coutEstime"
                  value={formData.coutEstime}
                  onChange={handleChange}
                  required
                  step="0.01"
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Coût réel (€)
                </label>
                <input
                  type="number"
                  name="coutReel"
                  value={formData.coutReel}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  placeholder="5200"
                />
              </div>
            </div>
          </div>

            {/* État */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">📊 Statut</h3>
            <select
              name="etat"
              value={formData.etat}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
            >
              <option value="PLANIFIE">Planifié</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINE">Terminé</option>
              <option value="ANNULE">Annulé</option>
            </select>
          </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-700 rounded-lg text-gray-200 hover:bg-[#252525] transition font-semibold"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
              >
                {loading ? (isEditMode ? 'Modification...' : 'Création...') : (isEditMode ? 'Modifier' : 'Créer les travaux')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default TravauxForm;