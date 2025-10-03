import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';

function DocumentForm({ onClose, onSubmit, documentToEdit = null, biensList = [] }) {
  const isEditMode = !!documentToEdit;

  const [formData, setFormData] = useState({
    nom: '',
    type: 'ACTE_VENTE',
    dateDocument: '',
    dateExpiration: '',
    bienId: '',
    file: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (documentToEdit) {
      setFormData({
        nom: documentToEdit.nom || '',
        type: documentToEdit.type || 'ACTE_VENTE',
        dateDocument: documentToEdit.dateDocument ? documentToEdit.dateDocument.split('T')[0] : '',
        dateExpiration: documentToEdit.dateExpiration ? documentToEdit.dateExpiration.split('T')[0] : '',
        bienId: documentToEdit.bienId || '',
        file: null,
      });
    }
  }, [documentToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        file: e.target.files[0]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditMode) {
        // En mode édition, on ne peut modifier que les métadonnées, pas le fichier
        const { file, ...dataToUpdate } = formData;
        await onSubmit(documentToEdit.id, dataToUpdate);
      } else {
        await onSubmit(formData);
      }
      onClose();
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || `Erreur lors de ${isEditMode ? 'la modification' : 'la création'} du document`);
    } finally {
      setLoading(false);
    }
  };

  const showExpirationField = ['DPE', 'DIAGNOSTIC'].includes(formData.type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Modifier le Document' : 'Ajouter un Document'}
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

          {/* Bien concerné */}
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

          {/* Informations du document */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations du document</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du document *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Acte de vente 2023"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de document *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ACTE_VENTE">Acte de vente</option>
                  <option value="DPE">DPE (Diagnostic de Performance Énergétique)</option>
                  <option value="BAIL">Bail</option>
                  <option value="QUITTANCE">Quittance</option>
                  <option value="FACTURE">Facture</option>
                  <option value="DIAGNOSTIC">Diagnostic</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date du document
                  </label>
                  <input
                    type="date"
                    name="dateDocument"
                    value={formData.dateDocument}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {showExpirationField && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date d'expiration
                    </label>
                    <input
                      type="date"
                      name="dateExpiration"
                      value={formData.dateExpiration}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upload fichier */}
          {!isEditMode && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fichier</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700 font-semibold">
                    Choisir un fichier
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  PDF, Images ou Documents Word (max 10MB)
                </p>
                {formData.file && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {formData.file.name}
                  </p>
                )}
              </div>
            </div>
          )}

          {isEditMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Le fichier ne peut pas être modifié. Pour changer le fichier, supprimez ce document et créez-en un nouveau.
              </p>
            </div>
          )}

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
              {loading ? (isEditMode ? 'Modification...' : 'Création...') : (isEditMode ? 'Modifier' : 'Créer le document')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DocumentForm;