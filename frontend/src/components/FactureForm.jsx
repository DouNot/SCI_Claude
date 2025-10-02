import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function FactureForm({ onClose, onSubmit, factureToEdit = null, biensList = [] }) {
  const isEditMode = !!factureToEdit;

  const [formData, setFormData] = useState({
    fournisseur: '',
    numero: '',
    montantTTC: '',
    montantHT: '',
    tva: '',
    tauxTVA: '',
    dateFacture: '',
    datePaiement: '',
    categorie: 'TRAVAUX',
    sousCategorie: '',
    description: '',
    estPaye: false,
    estDeductible: true,
    bienId: '',
    fichier: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (factureToEdit) {
      setFormData({
        fournisseur: factureToEdit.fournisseur || '',
        numero: factureToEdit.numero || '',
        montantTTC: factureToEdit.montantTTC || '',
        montantHT: factureToEdit.montantHT || '',
        tva: factureToEdit.tva || '',
        tauxTVA: '',
        dateFacture: factureToEdit.dateFacture ? factureToEdit.dateFacture.split('T')[0] : '',
        datePaiement: factureToEdit.datePaiement ? factureToEdit.datePaiement.split('T')[0] : '',
        categorie: factureToEdit.categorie || 'TRAVAUX',
        sousCategorie: factureToEdit.sousCategorie || '',
        description: factureToEdit.description || '',
        estPaye: factureToEdit.estPaye || false,
        estDeductible: factureToEdit.estDeductible !== false,
        bienId: factureToEdit.bienId || '',
        fichier: null,
      });
    }
  }, [factureToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      fichier: e.target.files[0]
    }));
  };

  const handleTauxTVAChange = (e) => {
    const taux = parseFloat(e.target.value) || 0;
    const ttc = parseFloat(formData.montantTTC) || 0;
    
    if (ttc && taux) {
      const ht = ttc / (1 + taux / 100);
      const tva = ttc - ht;
      setFormData(prev => ({
        ...prev,
        tauxTVA: e.target.value,
        montantHT: ht.toFixed(2),
        tva: tva.toFixed(2)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        tauxTVA: e.target.value
      }));
    }
  };

  const handleTTCChange = (e) => {
    const ttc = parseFloat(e.target.value) || 0;
    const taux = parseFloat(formData.tauxTVA) || 0;
    
    if (ttc && taux) {
      const ht = ttc / (1 + taux / 100);
      const tva = ttc - ht;
      setFormData(prev => ({
        ...prev,
        montantTTC: e.target.value,
        montantHT: ht.toFixed(2),
        tva: tva.toFixed(2)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        montantTTC: e.target.value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditMode) {
        const { fichier, tauxTVA, ...dataToUpdate } = formData;
        await onSubmit(factureToEdit.id, dataToUpdate);
      } else {
        const { tauxTVA, ...dataToSend } = formData;
        await onSubmit(dataToSend);
      }
      onClose();
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || `Erreur lors de ${isEditMode ? 'la modification' : 'la création'} de la facture`);
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
            {isEditMode ? 'Modifier la Facture' : 'Ajouter une Facture'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
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

          {/* Bien */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bien concerné</h3>
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
                  {bien.adresse}, {bien.ville}
                </option>
              ))}
            </select>
          </div>

          {/* Fournisseur */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fournisseur</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du fournisseur *
                </label>
                <input
                  type="text"
                  name="fournisseur"
                  value={formData.fournisseur}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Entreprise X"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de facture
                </label>
                <input
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="FAC-2024-001"
                />
              </div>
            </div>
          </div>

          {/* Montants */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Montants</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant TTC (€) *
                </label>
                <input
                  type="number"
                  name="montantTTC"
                  value={formData.montantTTC}
                  onChange={handleTTCChange}
                  required
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1200.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taux TVA (%)
                </label>
                <input
                  type="number"
                  name="tauxTVA"
                  value={formData.tauxTVA || ''}
                  onChange={handleTauxTVAChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant HT (€)
                </label>
                <input
                  type="number"
                  name="montantHT"
                  value={formData.montantHT}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1000.00"
                />
              </div>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TVA (€)
              </label>
              <input
                type="number"
                name="tva"
                value={formData.tva}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="200.00"
              />
            </div>
          </div>

          {/* Dates */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de facture *
                </label>
                <input
                  type="date"
                  name="dateFacture"
                  value={formData.dateFacture}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de paiement
                </label>
                <input
                  type="date"
                  name="datePaiement"
                  value={formData.datePaiement}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Catégories */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Catégorie</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie *
                </label>
                <select
                  name="categorie"
                  value={formData.categorie}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="TRAVAUX">Travaux</option>
                  <option value="ENTRETIEN">Entretien</option>
                  <option value="FOURNITURE">Fourniture</option>
                  <option value="TAXE_FONCIERE">Taxe Foncière</option>
                  <option value="ASSURANCE">Assurance</option>
                  <option value="COPROPRIETE">Copropriété</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sous-catégorie
                </label>
                <input
                  type="text"
                  name="sousCategorie"
                  value={formData.sousCategorie}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Plomberie, Électricité..."
                />
              </div>
            </div>
          </div>

          {/* Description */}
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
              placeholder="Description de la facture..."
            />
          </div>

          {/* Fichier */}
          {!isEditMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fichier (PDF, JPG, PNG)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Checkboxes */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="estPaye"
                checked={formData.estPaye}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Payée</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="estDeductible"
                checked={formData.estDeductible}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Déductible fiscalement</span>
            </label>
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
              {loading ? (isEditMode ? 'Modification...' : 'Création...') : (isEditMode ? 'Modifier' : 'Créer la facture')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FactureForm;