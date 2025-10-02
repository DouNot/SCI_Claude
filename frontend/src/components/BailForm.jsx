import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function BailForm({ onClose, onSubmit, bailToEdit = null, biensList = [], locatairesList = [] }) {
  const isEditMode = !!bailToEdit;

  const [formData, setFormData] = useState({
    typeBail: 'COMMERCIAL',
    dateDebut: '',
    dateFin: '',
    duree: '',
    loyerHC: '',
    charges: '',
    depotGarantie: '',
    indexRevision: '',
    statut: 'ACTIF',
    bienId: '',
    locataireId: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (bailToEdit) {
      setFormData({
        typeBail: bailToEdit.typeBail || 'COMMERCIAL',
        dateDebut: bailToEdit.dateDebut ? bailToEdit.dateDebut.split('T')[0] : '',
        dateFin: bailToEdit.dateFin ? bailToEdit.dateFin.split('T')[0] : '',
        duree: bailToEdit.duree || '',
        loyerHC: bailToEdit.loyerHC || '',
        charges: bailToEdit.charges || '',
        depotGarantie: bailToEdit.depotGarantie || '',
        indexRevision: bailToEdit.indexRevision || '',
        statut: bailToEdit.statut || 'ACTIF',
        bienId: bailToEdit.bienId || '',
        locataireId: bailToEdit.locataireId || '',
      });
    }
  }, [bailToEdit]);

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
        await onSubmit(bailToEdit.id, formData);
      } else {
        await onSubmit(formData);
      }
      onClose();
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || `Erreur lors de ${isEditMode ? 'la modification' : 'la création'} du bail`);
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
            {isEditMode ? '✏️ Modifier le Bail' : '📄 Créer un Bail'}
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

          {/* Bien et Locataire */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏠 Bien et Locataire</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bien *
                </label>
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
                      {bien.type} - {bien.adresse}, {bien.ville}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Locataire *
                </label>
                <select
                  name="locataireId"
                  value={formData.locataireId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un locataire</option>
                  {locatairesList.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.typeLocataire === 'ENTREPRISE' 
                        ? loc.raisonSociale 
                        : `${loc.prenom} ${loc.nom}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Type et Durée */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Type et Durée</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de bail *
                </label>
                <select
                  name="typeBail"
                  value={formData.typeBail}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="COMMERCIAL">Commercial (3/6/9 ans)</option>
                  <option value="VIDE">Vide (3 ans min)</option>
                  <option value="MEUBLE">Meublé (1 an min)</option>
                  <option value="MIXTE">Mixte</option>
                </select>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée (mois) *
                </label>
                <input
                  type="number"
                  name="duree"
                  value={formData.duree}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="36"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin (optionnel)
                </label>
                <input
                  type="date"
                  name="dateFin"
                  value={formData.dateFin}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Laisser vide si le bail est en cours ou à reconduction tacite
                </p>
              </div>
            </div>
          </div>

          {/* Loyer et Charges */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Loyer et Charges</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loyer HC (€/mois) *
                </label>
                <input
                  type="number"
                  name="loyerHC"
                  value={formData.loyerHC}
                  onChange={handleChange}
                  required
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dépôt de garantie (€)
                </label>
                <input
                  type="number"
                  name="depotGarantie"
                  value={formData.depotGarantie}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2400"
                />
              </div>
            </div>
          </div>

          {/* Révision et Statut */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Révision et Statut</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Index de révision
                </label>
                <select
                  name="indexRevision"
                  value={formData.indexRevision}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Aucun</option>
                  <option value="IRL">IRL (Indice Référence Loyers)</option>
                  <option value="ICC">ICC (Indice Coût Construction)</option>
                  <option value="ILAT">ILAT (Indice Loyers Activités Tertiaires)</option>
                </select>
              </div>
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
                  <option value="ACTIF">Actif</option>
                  <option value="TERMINE">Terminé</option>
                  <option value="RESILIE">Résilié</option>
                </select>
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
              {loading ? (isEditMode ? 'Modification...' : 'Création...') : (isEditMode ? 'Modifier' : 'Créer le bail')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BailForm;