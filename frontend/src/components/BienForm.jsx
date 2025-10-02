import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function BienForm({ onClose, onSubmit, userIds, bienToEdit = null }) {
  const isEditMode = !!bienToEdit;

  const [formData, setFormData] = useState({
    adresse: '',
    ville: '',
    codePostal: '',
    pays: 'France',
    type: 'LOCAL_COMMERCIAL',  // Par défaut : Local Commercial
    surface: '',
    nbPieces: '',
    nbChambres: '',
    etage: '',
    prixAchat: '',
    fraisNotaire: '',
    dateAchat: '',
    valeurActuelle: '',
    loyerHC: '',
    charges: '',
    statut: 'LIBRE',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (bienToEdit) {
      setFormData({
        adresse: bienToEdit.adresse || '',
        ville: bienToEdit.ville || '',
        codePostal: bienToEdit.codePostal || '',
        pays: bienToEdit.pays || 'France',
        type: bienToEdit.type || 'LOCAL_COMMERCIAL',
        surface: bienToEdit.surface || '',
        nbPieces: bienToEdit.nbPieces || '',
        nbChambres: bienToEdit.nbChambres || '',
        etage: bienToEdit.etage || '',
        prixAchat: bienToEdit.prixAchat || '',
        fraisNotaire: bienToEdit.fraisNotaire || '',
        dateAchat: bienToEdit.dateAchat ? bienToEdit.dateAchat.split('T')[0] : '',
        valeurActuelle: bienToEdit.valeurActuelle || '',
        loyerHC: bienToEdit.loyerHC || '',
        charges: bienToEdit.charges || '',
        statut: bienToEdit.statut || 'LIBRE',
        description: bienToEdit.description || '',
      });
    }
  }, [bienToEdit]);

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
        await onSubmit(bienToEdit.id, formData);
      } else {
        const dataToSend = {
          ...formData,
          userId: userIds.userId,
          compteId: userIds.compteId,
        };
        await onSubmit(dataToSend);
      }
      onClose();
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || `Erreur lors de ${isEditMode ? 'la modification' : 'la création'} du bien`);
    } finally {
      setLoading(false);
    }
  };

  // Déterminer quels champs afficher selon le type
  const showDetailedFields = ['APPARTEMENT', 'MAISON'].includes(formData.type);
  const showBasicFields = ['LOCAL_COMMERCIAL', 'BUREAUX', 'HANGAR', 'PARKING', 'TERRAIN'].includes(formData.type);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditMode ? '✏️ Modifier le Bien' : '🏠 Ajouter un Bien'}
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

          {/* Localisation */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Localisation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse *
                </label>
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="15 rue Victor Hugo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville *
                </label>
                <input
                  type="text"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Paris"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code Postal *
                </label>
                <input
                  type="text"
                  name="codePostal"
                  value={formData.codePostal}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="75016"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pays
                </label>
                <input
                  type="text"
                  name="pays"
                  value={formData.pays}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Type et Caractéristiques */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏘️ Caractéristiques</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de bien *
                </label>
<select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="LOCAL_COMMERCIAL">Local Commercial</option>
                  <option value="BUREAUX">Bureaux</option>
                  <option value="HANGAR">Hangar</option>
                  <option value="APPARTEMENT">Appartement</option>
                  <option value="MAISON">Maison</option>
                  <option value="PARKING">Parking</option>
                  <option value="TERRAIN">Terrain</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Surface (m²) *
                </label>
                <input
                  type="number"
                  name="surface"
                  value={formData.surface}
                  onChange={handleChange}
                  required
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="65"
                />
              </div>
              
              {/* Champs détaillés (Appartement/Maison uniquement) */}
              {showDetailedFields && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de pièces
                    </label>
                    <input
                      type="number"
                      name="nbPieces"
                      value={formData.nbPieces}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de chambres
                    </label>
                    <input
                      type="number"
                      name="nbChambres"
                      value={formData.nbChambres}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Étage
                    </label>
                    <input
                      type="number"
                      name="etage"
                      value={formData.etage}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="4"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Financier */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Informations Financières</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix d'achat (€) *
                </label>
                <input
                  type="number"
                  name="prixAchat"
                  value={formData.prixAchat}
                  onChange={handleChange}
                  required
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="350000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frais de notaire (€)
                </label>
                <input
                  type="number"
                  name="fraisNotaire"
                  value={formData.fraisNotaire}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="28000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'achat *
                </label>
                <input
                  type="date"
                  name="dateAchat"
                  value={formData.dateAchat}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valeur actuelle estimée (€)
                </label>
                <input
                  type="number"
                  name="valeurActuelle"
                  value={formData.valeurActuelle}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="380000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loyer HC (€/mois)
                </label>
                <input
                  type="number"
                  name="loyerHC"
                  value={formData.loyerHC}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Charges (€/mois)
                </label>
                <input
                  type="number"
                  name="charges"
                  value={formData.charges}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="150"
                />
              </div>
            </div>
          </div>

          {/* Statut et Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ℹ️ Autres Informations</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="LIBRE">Libre</option>
                  <option value="LOUE">Loué</option>
                  <option value="TRAVAUX">En travaux</option>
                  <option value="VENTE">En vente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={
                    formData.type === 'LOCAL_COMMERCIAL' 
                      ? "Local commercial en pied d'immeuble, vitrine..." 
                      : "Bel appartement avec balcon..."
                  }
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
              {loading ? (isEditMode ? 'Modification...' : 'Création...') : (isEditMode ? 'Modifier' : 'Créer le bien')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BienForm;