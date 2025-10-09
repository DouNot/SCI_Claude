import { useState, useEffect } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { photosAPI } from '../services/api';

function BienForm({ onClose, onSubmit, bienToEdit = null }) {
  const isEditMode = !!bienToEdit;

  const [formData, setFormData] = useState({
    adresse: '',
    ville: '',
    codePostal: '',
    pays: 'France',
    type: 'LOCAL_COMMERCIAL',
    surface: '',
    nbPieces: '',
    nbChambres: '',
    etage: '',
    prixAchat: '',
    fraisNotaire: '',
    tauxNotaire: '',
    dateAchat: '',
    valeurActuelle: '',
    description: '',
    assuranceMensuelle: '',
    taxeFonciere: '',
  });

  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        tauxNotaire: '',
        dateAchat: bienToEdit.dateAchat ? bienToEdit.dateAchat.split('T')[0] : '',
        valeurActuelle: bienToEdit.valeurActuelle || '',
        description: bienToEdit.description || '',
        assuranceMensuelle: bienToEdit.assuranceMensuelle || '',
        taxeFonciere: bienToEdit.taxeFonciere || '',
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

  const handlePrixAchatChange = (e) => {
    const prix = parseFloat(e.target.value) || 0;
    const taux = parseFloat(formData.tauxNotaire) || 0;
    
    if (prix && taux) {
      const frais = (prix * taux) / 100;
      setFormData(prev => ({
        ...prev,
        prixAchat: e.target.value,
        fraisNotaire: frais.toFixed(2)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        prixAchat: e.target.value
      }));
    }
  };

  const handleTauxNotaireChange = (e) => {
    const taux = parseFloat(e.target.value) || 0;
    const prix = parseFloat(formData.prixAchat) || 0;
    
    if (prix && taux) {
      const frais = (prix * taux) / 100;
      setFormData(prev => ({
        ...prev,
        tauxNotaire: e.target.value,
        fraisNotaire: frais.toFixed(2)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        tauxNotaire: e.target.value
      }));
    }
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(prevPhotos => [...prevPhotos, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { tauxNotaire, ...dataToSend } = formData;
      
      let bienId;
      if (isEditMode) {
        await onSubmit(bienToEdit.id, dataToSend);
        bienId = bienToEdit.id;
      } else {
        const result = await onSubmit(dataToSend);
        bienId = result.data.id;
      }

      // Upload des photos si présentes
      if (photos.length > 0 && bienId) {
        try {
          await photosAPI.upload(bienId, photos);
        } catch (photoErr) {
          console.error('Erreur upload photos:', photoErr);
          // On continue même si l'upload des photos échoue
        }
      }

      onClose();
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || `Erreur lors de ${isEditMode ? 'la modification' : 'la création'} du bien`);
    } finally {
      setLoading(false);
    }
  };

  const showDetailedFields = ['APPARTEMENT', 'MAISON'].includes(formData.type);

  return (
    <>
      {/* Fond flou sur toute la page */}
      <div className="absolute inset-0 bg-black/60 z-[9998]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={onClose} />
      
      {/* Formulaire centré dans la zone de contenu */}
      <div className="absolute inset-0 flex items-center justify-center z-[9999]" style={{ position: 'fixed', top: 0, left: '256px', right: 0, bottom: 0, padding: '2rem 4rem', pointerEvents: 'none' }}>
        <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" style={{ pointerEvents: 'auto' }}>
        {/* Header sticky */}
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-gray-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-white">
            {isEditMode ? 'Modifier le Bien' : 'Ajouter un Bien'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition p-2 hover:bg-[#252525] rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Upload Photos */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Photos du bien</h3>
            <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 hover:border-blue-500 transition">
              <input
                type="file"
                id="photos"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <label
                htmlFor="photos"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-200 font-medium mb-1">Cliquez pour ajouter des photos</p>
                <p className="text-gray-400 text-sm">PNG, JPG jusqu'à 10MB</p>
              </label>
            </div>

            {/* Prévisualisation des photos */}
            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-800"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Localisation */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Localisation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Adresse *
                </label>
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  placeholder="15 rue Victor Hugo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  placeholder="Paris"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Code Postal *
                </label>
                <input
                  type="text"
                  name="codePostal"
                  value={formData.codePostal}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  placeholder="75016"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Pays
                </label>
                <input
                  type="text"
                  name="pays"
                  value={formData.pays}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Caractéristiques */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Caractéristiques</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Type de bien *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
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
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Surface (m²) *
                </label>
                <input
                  type="number"
                  name="surface"
                  value={formData.surface}
                  onChange={handleChange}
                  required
                  step="0.01"
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  placeholder="65"
                />
              </div>
              
              {showDetailedFields && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Nombre de pièces
                    </label>
                    <input
                      type="number"
                      name="nbPieces"
                      value={formData.nbPieces}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Nombre de chambres
                    </label>
                    <input
                      type="number"
                      name="nbChambres"
                      value={formData.nbChambres}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                      placeholder="2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Étage
                    </label>
                    <input
                      type="number"
                      name="etage"
                      value={formData.etage}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                      placeholder="4"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Informations Financières */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Informations Financières</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Prix d'achat (€) *
                </label>
                <input
                  type="number"
                  name="prixAchat"
                  value={formData.prixAchat}
                  onChange={handlePrixAchatChange}
                  required
                  step="0.01"
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  placeholder="350000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Taux frais notaire (%)
                </label>
                <input
                  type="number"
                  name="tauxNotaire"
                  value={formData.tauxNotaire || ''}
                  onChange={handleTauxNotaireChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  placeholder="7.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Frais de notaire (€)
                </label>
                <input
                  type="number"
                  name="fraisNotaire"
                  value={formData.fraisNotaire}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  placeholder="28000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Date d'achat *
                </label>
                <input
                  type="date"
                  name="dateAchat"
                  value={formData.dateAchat}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Valeur actuelle estimée (€)
                </label>
                <input
                  type="number"
                  name="valeurActuelle"
                  value={formData.valeurActuelle}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  placeholder="380000"
                />
              </div>
            </div>
          </div>

          {/* Charges annuelles */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Charges annuelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Assurance mensuelle (€/mois)
                </label>
                <input
                  type="number"
                  name="assuranceMensuelle"
                  value={formData.assuranceMensuelle}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  placeholder="45"
                />
                <p className="text-xs text-gray-500 mt-2">PNO, GLI, ou autre assurance liée au bien</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Taxe foncière annuelle (€/an)
                </label>
                <input
                  type="number"
                  name="taxeFonciere"
                  value={formData.taxeFonciere}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  placeholder="1200"
                />
                <p className="text-xs text-gray-500 mt-2">Montant annuel de la taxe foncière</p>
              </div>
            </div>
          </div>

          {/* Autres Informations */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Autres Informations</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition resize-none"
                  placeholder={
                    formData.type === 'LOCAL_COMMERCIAL' 
                      ? "Local commercial en pied d'immeuble, vitrine..." 
                      : "Bel appartement avec balcon..."
                  }
                />
              </div>
            </div>
          </div>

          {/* Boutons */}
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
              {loading ? (isEditMode ? 'Modification...' : 'Création...') : (isEditMode ? 'Modifier' : 'Créer le bien')}
            </button>
          </div>
        </form>
        </div>
      </div>
    </>
  );
}

export default BienForm;
