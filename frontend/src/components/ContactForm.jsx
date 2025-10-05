import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function ContactForm({ onClose, onSubmit, contactToEdit = null }) {
  const isEditMode = !!contactToEdit;

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    entreprise: '',
    type: 'ARTISAN',
    email: '',
    telephone: '',
    adresse: '',
    siteWeb: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (contactToEdit) {
      setFormData({
        nom: contactToEdit.nom || '',
        prenom: contactToEdit.prenom || '',
        entreprise: contactToEdit.entreprise || '',
        type: contactToEdit.type || 'ARTISAN',
        email: contactToEdit.email || '',
        telephone: contactToEdit.telephone || '',
        adresse: contactToEdit.adresse || '',
        siteWeb: contactToEdit.siteWeb || '',
        notes: contactToEdit.notes || '',
      });
    }
  }, [contactToEdit]);

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
        await onSubmit(contactToEdit.id, formData);
      } else {
        await onSubmit(formData);
      }
      onClose();
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || `Erreur lors de ${isEditMode ? 'la modification' : 'la création'} du contact`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Fond flou sur toute la page */}
      <div className="absolute inset-0 bg-black/60 z-[9998]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={onClose} />
      
      {/* Formulaire centré dans la zone de contenu */}
      <div className="absolute inset-0 flex items-center justify-center z-[9999]" style={{ position: 'fixed', top: 0, left: '256px', right: 0, bottom: 0, padding: '2rem 4rem', pointerEvents: 'none' }}>
        <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" style={{ pointerEvents: 'auto' }}>
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {isEditMode ? 'Modifier le Contact' : 'Ajouter un Contact'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition p-2 hover:bg-[#252525] rounded-lg">
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

          {/* Type de contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Type de contact</h3>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
            >
              <option value="NOTAIRE">Notaire</option>
              <option value="COMPTABLE">Comptable</option>
              <option value="AVOCAT">Avocat</option>
              <option value="AGENT_IMMO">Agent Immobilier</option>
              <option value="ARTISAN">Artisan</option>
              <option value="SYNDIC">Syndic</option>
              <option value="ASSUREUR">Assureur</option>
              <option value="BANQUIER">Banquier</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>

          {/* Informations principales */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Informations principales</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                    placeholder="Dupont"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                    placeholder="Jean"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Entreprise / Cabinet
                </label>
                <input
                  type="text"
                  name="entreprise"
                  value={formData.entreprise}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  placeholder="Cabinet Dupont & Associés"
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Coordonnées</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                    placeholder="contact@exemple.fr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  placeholder="12 rue de la Paix, 75001 Paris"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Site Web
                </label>
                <input
                  type="url"
                  name="siteWeb"
                  value={formData.siteWeb}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  placeholder="https://www.exemple.fr"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Notes</h3>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition resize-none"
              placeholder="Notes personnelles sur ce contact..."
            />
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
              {loading ? (isEditMode ? 'Modification...' : 'Création...') : (isEditMode ? 'Modifier' : 'Créer le contact')}
            </button>
          </div>
        </form>
        </div>
      </div>
    </>
  );
}

export default ContactForm;
