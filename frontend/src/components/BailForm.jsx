import { useState, useEffect } from 'react';
import { X, Plus, Lock, Unlock } from 'lucide-react';
import LocataireForm from './LocataireForm';

function BailForm({ onClose, onSubmit, bailToEdit = null, biensList = [], locatairesList = [], onLocataireCreated }) {
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
    refactureTaxeFonciere: false,
    montantTaxeFonciere: '', // Snapshot de la TF au moment de la création
    partRefactureTF: '100', // Pourcentage par défaut
    montantRefactureTF: '', // Calculé automatiquement
    statut: 'ACTIF',
    bienId: '',
    locataireId: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLocataireForm, setShowLocataireForm] = useState(false);
  const [tfLocked, setTfLocked] = useState(true); // Verrouillé par défaut
  const [bienTaxeFonciere, setBienTaxeFonciere] = useState(null);

  // Pré-remplir le formulaire en mode édition ou avec un bien spécifique
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
        refactureTaxeFonciere: bailToEdit.refactureTaxeFonciere || false,
        montantTaxeFonciere: bailToEdit.montantTaxeFonciere || '',
        partRefactureTF: bailToEdit.partRefactureTF || '100',
        montantRefactureTF: bailToEdit.montantRefactureTF || '',
        statut: bailToEdit.statut || 'ACTIF',
        bienId: bailToEdit.bienId || '',
        locataireId: bailToEdit.locataireId || '',
      });
      setTfLocked(false); // En mode édition, permettre modification
    } else if (biensList.length === 1) {
      // Si un seul bien est passé, le pré-sélectionner
      setFormData(prev => ({
        ...prev,
        bienId: biensList[0].id
      }));
    }
  }, [bailToEdit, biensList]);

  // Auto-remplir la TF quand un bien est sélectionné
  useEffect(() => {
    if (formData.bienId && !isEditMode) {
      const selectedBien = biensList.find(b => b.id === formData.bienId);
      if (selectedBien) {
        setBienTaxeFonciere(selectedBien.taxeFonciere);
        
        if (selectedBien.taxeFonciere && selectedBien.taxeFonciere > 0) {
          setFormData(prev => ({
            ...prev,
            montantTaxeFonciere: selectedBien.taxeFonciere.toString()
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            montantTaxeFonciere: ''
          }));
        }
      }
    }
  }, [formData.bienId, biensList, isEditMode]);

  // Calculer automatiquement le montant refacturé
  useEffect(() => {
    if (formData.refactureTaxeFonciere && formData.montantTaxeFonciere && formData.partRefactureTF) {
      const tf = parseFloat(formData.montantTaxeFonciere) || 0;
      const part = parseFloat(formData.partRefactureTF) || 0;
      const montantRefacture = (tf * part) / 100;
      
      setFormData(prev => ({
        ...prev,
        montantRefactureTF: montantRefacture.toFixed(2)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        montantRefactureTF: ''
      }));
    }
  }, [formData.refactureTaxeFonciere, formData.montantTaxeFonciere, formData.partRefactureTF]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

  const handleLocataireCreated = async (newLocataireId) => {
    // Mettre à jour le formulaire avec le nouveau locataire
    setFormData(prev => ({
      ...prev,
      locataireId: newLocataireId
    }));
    setShowLocataireForm(false);
    
    // Notifier le parent pour recharger la liste des locataires
    if (onLocataireCreated) {
      await onLocataireCreated();
    }
  };

  return (
    <>
      {/* Fond flou sur toute la page */}
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
      
      {/* Formulaire centré dans la zone de contenu */}
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
          className="bg-[#1a1a1a] rounded-2xl border border-gray-800 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" 
          style={{ pointerEvents: 'auto' }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#1a1a1a] border-b border-gray-800 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-white">
              {isEditMode ? '✏️ Modifier le Bail' : '📄 Créer un Bail'}
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

            {/* Bien et Locataire */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">🏠 Bien et Locataire</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Bien *
                  </label>
                  <select
                    name="bienId"
                    value={formData.bienId}
                    onChange={handleChange}
                    required
                    disabled={biensList.length === 1}
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Sélectionner un bien</option>
                    {biensList.map(bien => (
                      <option key={bien.id} value={bien.id}>
                        {bien.type} - {bien.adresse}, {bien.ville}
                      </option>
                    ))}
                  </select>
                  {biensList.length === 1 && (
                    <p className="text-xs text-gray-500 mt-1">
                      🟢 Bien pré-sélectionné
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Locataire *
                  </label>
                  <div className="flex gap-2">
                    <select
                      name="locataireId"
                      value={formData.locataireId}
                      onChange={handleChange}
                      required
                      className="flex-1 px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
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
                    <button
                      type="button"
                      onClick={() => setShowLocataireForm(true)}
                      className="px-4 py-3 bg-accent-blue/20 hover:bg-accent-blue/30 border border-accent-blue/30 rounded-lg text-accent-blue transition flex items-center gap-2"
                      title="Créer un nouveau locataire"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Type et Durée */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">📋 Type et Durée</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Type de bail *
                  </label>
                  <select
                    name="typeBail"
                    value={formData.typeBail}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                  >
                    <option value="COMMERCIAL">Commercial (3/6/9 ans)</option>
                    <option value="VIDE">Vide (3 ans min)</option>
                    <option value="MEUBLE">Meublé (1 an min)</option>
                    <option value="MIXTE">Mixte</option>
                  </select>
                </div>
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
                    Durée (mois) *
                  </label>
                  <input
                    type="number"
                    name="duree"
                    value={formData.duree}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                    placeholder="36"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Date de fin (optionnel)
                  </label>
                  <input
                    type="date"
                    name="dateFin"
                    value={formData.dateFin}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Laisser vide si le bail est en cours ou à reconduction tacite
                  </p>
                </div>
              </div>
            </div>

            {/* Loyer et Charges */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">💰 Loyer et Charges</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Loyer HC (€/mois) *
                  </label>
                  <input
                    type="number"
                    name="loyerHC"
                    value={formData.loyerHC}
                    onChange={handleChange}
                    required
                    step="0.01"
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                    placeholder="1200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Charges (€/mois)
                  </label>
                  <input
                    type="number"
                    name="charges"
                    value={formData.charges}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                    placeholder="150"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Dépôt de garantie (€)
                  </label>
                  <input
                    type="number"
                    name="depotGarantie"
                    value={formData.depotGarantie}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                    placeholder="2400"
                  />
                </div>
              </div>
            </div>

            {/* Taxe Foncière - NOUVEAU */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">🏛️ Taxe Foncière</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-[#0f0f0f] border border-gray-800 rounded-lg">
                  <input
                    type="checkbox"
                    id="refactureTaxeFonciere"
                    name="refactureTaxeFonciere"
                    checked={formData.refactureTaxeFonciere}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-700 bg-[#0f0f0f] text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <label htmlFor="refactureTaxeFonciere" className="text-white font-medium cursor-pointer select-none">
                    Refacturer la taxe foncière au locataire
                  </label>
                </div>
                
                {formData.refactureTaxeFonciere && (
                  <div className="animate-fade-in space-y-4">
                    {/* Message si pas de TF sur le bien */}
                    {!bienTaxeFonciere && formData.bienId && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                        <p className="text-yellow-400 text-sm">
                          ⚠️ Ce bien n'a pas de taxe foncière renseignée. 
                          <br />
                          <a 
                            href={`/biens/${formData.bienId}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="underline hover:text-yellow-300"
                          >
                            Renseignez-la dans la fiche du bien
                          </a> ou entrez-la manuellement ci-dessous.
                        </p>
                      </div>
                    )}

                    {/* Montant TF avec bouton verrouillage */}
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-1">
                        Montant de la Taxe Foncière (€/an)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="montantTaxeFonciere"
                          value={formData.montantTaxeFonciere}
                          onChange={handleChange}
                          disabled={tfLocked && !isEditMode && bienTaxeFonciere}
                          step="0.01"
                          className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed pr-12"
                          placeholder="1500"
                        />
                        {!isEditMode && bienTaxeFonciere && (
                          <button
                            type="button"
                            onClick={() => setTfLocked(!tfLocked)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                            title={tfLocked ? "Déverrouiller pour modifier" : "Verrouiller"}
                          >
                            {tfLocked ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
                          </button>
                        )}
                      </div>
                      {bienTaxeFonciere && tfLocked && !isEditMode && (
                        <p className="text-xs text-green-400 mt-1">
                          ✅ Auto-rempli depuis le bien ({bienTaxeFonciere.toLocaleString('fr-FR')} €/an)
                        </p>
                      )}
                    </div>

                    {/* Part refacturée */}
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-1">
                        Part refacturée au locataire (%)
                      </label>
                      <input
                        type="number"
                        name="partRefactureTF"
                        value={formData.partRefactureTF}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        step="1"
                        className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                        placeholder="100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Pourcentage de la taxe foncière à refacturer (0-100%)
                      </p>
                    </div>

                    {/* Montant calculé */}
                    {formData.montantRefactureTF && (
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-blue-200 font-medium">Montant refacturé :</span>
                          <span className="text-blue-400 text-xl font-bold">
                            {parseFloat(formData.montantRefactureTF).toLocaleString('fr-FR')} € / an
                          </span>
                        </div>
                        <p className="text-xs text-blue-300 mt-2">
                          Soit {(parseFloat(formData.montantRefactureTF) / 12).toFixed(2)} € / mois
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Révision et Statut */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">📈 Révision et Statut</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Index de révision
                  </label>
                  <select
                    name="indexRevision"
                    value={formData.indexRevision}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                  >
                    <option value="">Aucun</option>
                    <option value="IRL">IRL (Indice Référence Loyers)</option>
                    <option value="ILC">ILC (Indice Loyers Commerciaux)</option>
                    <option value="ICC">ICC (Indice Coût Construction)</option>
                    <option value="ILAT">ILAT (Indice Loyers Activités Tertiaires)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Statut
                  </label>
                  <select
                    name="statut"
                    value={formData.statut}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                  >
                    <option value="ACTIF">Actif</option>
                    <option value="TERMINE">Terminé</option>
                    <option value="RESILIE">Résilié</option>
                  </select>
                </div>
              </div>
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
                {loading ? (isEditMode ? 'Modification...' : 'Création...') : (isEditMode ? 'Modifier' : 'Créer le bail')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal pour créer un nouveau locataire */}
      {showLocataireForm && (
        <LocataireForm
          onClose={() => setShowLocataireForm(false)}
          onSubmit={async (locataireData) => {
            // Créer le locataire en utilisant le service API (avec token)
            const { locatairesAPI } = await import('../services/api');
            const response = await locatairesAPI.create(locataireData);
            await handleLocataireCreated(response.data.id);
          }}
        />
      )}
    </>
  );
}

export default BailForm;
