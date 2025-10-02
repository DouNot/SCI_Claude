import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function LocataireForm({ onClose, onSubmit, locataireToEdit = null, biensList = [] }) {
  const isEditMode = !!locataireToEdit;

  const [formData, setFormData] = useState({
    typeLocataire: 'ENTREPRISE',
    raisonSociale: '',
    siret: '',
    formeJuridique: '',
    capitalSocial: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    codePostal: '',
    dateNaissance: '',
    profession: '',
    dateEntree: '',
    dateSortie: '',
    bienId: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (locataireToEdit) {
      setFormData({
        typeLocataire: locataireToEdit.typeLocataire || 'ENTREPRISE',
        raisonSociale: locataireToEdit.raisonSociale || '',
        siret: locataireToEdit.siret || '',
        formeJuridique: locataireToEdit.formeJuridique || '',
        capitalSocial: locataireToEdit.capitalSocial || '',
        nom: locataireToEdit.nom || '',
        prenom: locataireToEdit.prenom || '',
        email: locataireToEdit.email || '',
        telephone: locataireToEdit.telephone || '',
        adresse: locataireToEdit.adresse || '',
        ville: locataireToEdit.ville || '',
        codePostal: locataireToEdit.codePostal || '',
        dateNaissance: locataireToEdit.dateNaissance ? locataireToEdit.dateNaissance.split('T')[0] : '',
        profession: locataireToEdit.profession || '',
        dateEntree: locataireToEdit.dateEntree ? locataireToEdit.dateEntree.split('T')[0] : '',
        dateSortie: locataireToEdit.dateSortie ? locataireToEdit.dateSortie.split('T')[0] : '',
        bienId: locataireToEdit.bienId || '',
      });
    }
  }, [locataireToEdit]);

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
        await onSubmit(locataireToEdit.id, formData);
      } else {
        await onSubmit(formData);
      }
      onClose();
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || `Erreur lors de ${isEditMode ? 'la modification' : 'la création'} du locataire`);
    } finally {
      setLoading(false);
    }
  };

  const isEntreprise = formData.typeLocataire === 'ENTREPRISE';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditMode ? '✏️ Modifier le Locataire' : '👤 Ajouter un Locataire'}
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

          {/* Type de locataire */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Type de locataire</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="typeLocataire"
                  value="ENTREPRISE"
                  checked={formData.typeLocataire === 'ENTREPRISE'}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="font-medium">🏢 Entreprise</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="typeLocataire"
                  value="PARTICULIER"
                  checked={formData.typeLocataire === 'PARTICULIER'}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="font-medium">👤 Particulier</span>
              </label>
            </div>
          </div>

          {/* Informations Entreprise (si ENTREPRISE) */}
          {isEntreprise && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🏢 Informations Entreprise</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Raison sociale *
                  </label>
                  <input
                    type="text"
                    name="raisonSociale"
                    value={formData.raisonSociale}
                    onChange={handleChange}
                    required={isEntreprise}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="SARL Innovation Tech"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SIRET
                  </label>
                  <input
                    type="text"
                    name="siret"
                    value={formData.siret}
                    onChange={handleChange}
                    maxLength="14"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="12345678901234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Forme juridique
                  </label>
                  <select
                    name="formeJuridique"
                    value={formData.formeJuridique}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner</option>
                    <option value="SARL">SARL</option>
                    <option value="SAS">SAS</option>
                    <option value="SASU">SASU</option>
                    <option value="SA">SA</option>
                    <option value="EURL">EURL</option>
                    <option value="SCI">SCI</option>
                    <option value="AUTO_ENTREPRENEUR">Auto-entrepreneur</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capital social (€)
                  </label>
                  <input
                    type="number"
                    name="capitalSocial"
                    value={formData.capitalSocial}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10000"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact / Identité */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isEntreprise ? '👤 Contact (Représentant)' : '👤 Identité'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Dupont"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Jean"
                />
              </div>
              
              {/* Champs spécifiques PARTICULIER */}
              {!isEntreprise && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de naissance
                    </label>
                    <input
                      type="date"
                      name="dateNaissance"
                      value={formData.dateNaissance}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profession
                    </label>
                    <input
                      type="text"
                      name="profession"
                      value={formData.profession}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ingénieur"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📞 Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={isEntreprise ? "contact@entreprise.fr" : "jean.dupont@example.com"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📍 {isEntreprise ? 'Adresse Siège Social' : 'Adresse'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12 rue de la Paix"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville
                </label>
                <input
                  type="text"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Paris"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code Postal
                </label>
                <input
                  type="text"
                  name="codePostal"
                  value={formData.codePostal}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="75001"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏠 Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bien loué
                </label>
                <select
                  name="bienId"
                  value={formData.bienId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Aucun bien</option>
                  {biensList.map(bien => (
                    <option key={bien.id} value={bien.id}>
                      {bien.adresse}, {bien.ville}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'entrée
                </label>
                <input
                  type="date"
                  name="dateEntree"
                  value={formData.dateEntree}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de sortie
                </label>
                <input
                  type="date"
                  name="dateSortie"
                  value={formData.dateSortie}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              {loading ? (isEditMode ? 'Modification...' : 'Création...') : (isEditMode ? 'Modifier' : 'Créer le locataire')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LocataireForm;