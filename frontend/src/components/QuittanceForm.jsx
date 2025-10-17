import { useState } from 'react';
import { X, Download, Mail, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { quittancesAPI } from '../services/api';
import { envoyerQuittanceEmail } from '../services/emailService';

function QuittanceForm({ onClose, bail, bauxList }) {
  const [selectedBailId, setSelectedBailId] = useState(bail?.id || '');
  const [formData, setFormData] = useState({
    mois: new Date().getMonth() + 1,
    annee: new Date().getFullYear(),
    datePaiement: '',
    typePeriode: 'MENSUELLE', // MENSUELLE ou TRIMESTRIELLE
  });

  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Bail sélectionné (soit passé directement, soit sélectionné dans la liste)
  const currentBail = bail || bauxList?.find(b => b.id === selectedBailId);

  // Déterminer automatiquement le type de document selon le locataire
  const typeDocument = currentBail?.locataire?.typeLocataire === 'ENTREPRISE' ? 'FACTURE' : 'QUITTANCE';

  // Déterminer le statut de paiement (seulement pour mensuel)
  const isPaye = formData.datePaiement && formData.datePaiement.trim() !== '';
  const showStatut = formData.typePeriode === 'MENSUELLE';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (!currentBail) {
      setError('Veuillez sélectionner un bail');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await quittancesAPI.generer({
        bailId: currentBail.id,
        mois: parseInt(formData.mois),
        annee: parseInt(formData.annee),
        datePaiement: formData.datePaiement || null,
        typePeriode: formData.typePeriode,
        typeDocument: typeDocument, // Automatique selon le type de locataire
      });

      // Télécharger le PDF
      const fileName = formData.typePeriode === 'TRIMESTRIELLE'
        ? `${typeDocument.toLowerCase()}-T${Math.ceil(formData.mois / 3)}-${formData.annee}.pdf`
        : `${typeDocument.toLowerCase()}-${formData.annee}-${String(formData.mois).padStart(2, '0')}.pdf`;
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      onClose();
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || 'Erreur lors de la génération du document');
    } finally {
      setLoading(false);
    }
  };

  const handleEnvoyerEmail = async () => {
    if (!currentBail) {
      setError('Veuillez sélectionner un bail');
      return;
    }

    if (!currentBail.locataire?.email) {
      setError('Aucun email trouvé pour ce locataire');
      return;
    }

    setEmailLoading(true);
    setError(null);
    setEmailSuccess(false);

    try {
      await envoyerQuittanceEmail({
        bailId: currentBail.id,
        mois: parseInt(formData.mois),
        annee: parseInt(formData.annee),
        datePaiement: formData.datePaiement || null,
        emailDestinataire: currentBail.locataire.email,
        typeDocument: typeDocument,
        typePeriode: formData.typePeriode, // Ajouter le type de période
      });

      setEmailSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setEmailLoading(false);
    }
  };

  const moisOptions = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' },
  ];

  const currentYear = new Date().getFullYear();
  const anneeOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Calculer les mois du trimestre
  const getTrimestreMois = () => {
    const moisDebut = parseInt(formData.mois);
    const mois = [];
    for (let i = 0; i < 3; i++) {
      let m = moisDebut + i;
      if (m > 12) m = m - 12;
      mois.push(moisOptions[m - 1]?.label);
    }
    return mois.join(', ');
  };

  return (
    <>
      {/* Fond flou */}
      <div 
        className="fixed inset-0 bg-black/60 z-[9998] backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div 
        className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none"
        style={{ left: '256px', padding: '2rem 4rem' }}
      >
        <div 
          className="bg-dark-900 rounded-3xl border border-dark-600/30 shadow-2xl max-w-2xl w-full pointer-events-auto max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-dark-900 border-b border-dark-700/50 px-8 py-6 flex items-center justify-between rounded-t-3xl">
            <h2 className="text-2xl font-bold text-white">
              {typeDocument === 'FACTURE' ? '🏢 Générer une facture' : '📄 Générer une quittance'}
            </h2>
            <button 
              onClick={onClose} 
              className="text-light-400 hover:text-white transition p-2 hover:bg-dark-800 rounded-xl"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleGenerate} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {emailSuccess && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
                <Mail className="h-5 w-5 text-green-400" />
                <p className="text-green-400">✅ Document envoyé par email avec succès !</p>
              </div>
            )}

            {/* Sélection du bail (si bauxList fourni) */}
            {!bail && bauxList && (
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Bail *
                </label>
                <select
                  value={selectedBailId}
                  onChange={(e) => setSelectedBailId(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-accent-blue transition"
                >
                  <option value="">Sélectionnez un bail</option>
                  {bauxList.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bien?.adresse} - {b.locataire?.typeLocataire === 'ENTREPRISE' 
                        ? b.locataire?.raisonSociale 
                        : `${b.locataire?.prenom} ${b.locataire?.nom}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Info type de document */}
            {currentBail && (
              <div className={`p-4 rounded-xl border-2 ${
                typeDocument === 'FACTURE' 
                  ? 'bg-accent-purple/10 border-accent-purple/30'
                  : 'bg-accent-blue/10 border-accent-blue/30'
              }`}>
                <div className="flex items-center gap-3">
                  <AlertCircle className={`h-5 w-5 ${typeDocument === 'FACTURE' ? 'text-accent-purple' : 'text-accent-blue'}`} />
                  <div>
                    <p className={`font-semibold ${typeDocument === 'FACTURE' ? 'text-accent-purple' : 'text-accent-blue'}`}>
                      {typeDocument === 'FACTURE' ? '🏢 Facture (avec TVA 20%)' : '📄 Quittance de loyer'}
                    </p>
                    <p className="text-sm text-light-400">
                      {typeDocument === 'FACTURE' 
                        ? 'Location professionnelle - Locataire entreprise'
                        : 'Location habitation - Locataire particulier'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Infos du bail (si bail sélectionné) */}
            {currentBail && (
              <div className="p-6 bg-dark-800/50 rounded-2xl border border-dark-700/50">
                <h3 className="text-sm font-semibold text-light-300 mb-4">Informations du bail</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-light-500 mb-1">Locataire</p>
                    <p className="text-white font-semibold">
                      {currentBail.locataire?.typeLocataire === 'ENTREPRISE' 
                        ? currentBail.locataire?.raisonSociale 
                        : `${currentBail.locataire?.prenom} ${currentBail.locataire?.nom}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-light-500 mb-1">Bien</p>
                    <p className="text-white font-semibold">{currentBail.bien?.adresse}</p>
                  </div>
                  <div>
                    <p className="text-light-500 mb-1">Loyer HC</p>
                    <p className="text-accent-green font-bold">{currentBail.loyerHC.toLocaleString('fr-FR')} €</p>
                  </div>
                  <div>
                    <p className="text-light-500 mb-1">Charges</p>
                    <p className="text-white font-semibold">{(currentBail.charges || 0).toLocaleString('fr-FR')} €</p>
                  </div>
                  {currentBail.locataire?.email && (
                    <div className="col-span-2">
                      <p className="text-light-500 mb-1 flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        Email
                      </p>
                      <p className="text-white font-semibold">{currentBail.locataire.email}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Type de période */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">📅 Type de période</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, typePeriode: 'MENSUELLE' }))}
                  className={`p-4 rounded-xl border-2 transition ${
                    formData.typePeriode === 'MENSUELLE'
                      ? 'border-accent-blue bg-accent-blue/10 text-accent-blue'
                      : 'border-gray-800 bg-[#0f0f0f] text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <p className="font-semibold mb-1">Mensuelle</p>
                  <p className="text-xs opacity-75">1 mois</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, typePeriode: 'TRIMESTRIELLE' }))}
                  className={`p-4 rounded-xl border-2 transition ${
                    formData.typePeriode === 'TRIMESTRIELLE'
                      ? 'border-accent-purple bg-accent-purple/10 text-accent-purple'
                      : 'border-gray-800 bg-[#0f0f0f] text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <p className="font-semibold mb-1">Trimestrielle</p>
                  <p className="text-xs opacity-75">3 mois en 1 document</p>
                </button>
              </div>
            </div>

            {/* Période */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                📅 Période {formData.typePeriode === 'TRIMESTRIELLE' && '(mois de début)'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Mois *
                  </label>
                  <select
                    name="mois"
                    value={formData.mois}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-accent-blue transition"
                  >
                    {moisOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Année *
                  </label>
                  <select
                    name="annee"
                    value={formData.annee}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-accent-blue transition"
                  >
                    {anneeOptions.map(annee => (
                      <option key={annee} value={annee}>
                        {annee}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {formData.typePeriode === 'TRIMESTRIELLE' && (
                <div className="mt-3 p-3 bg-accent-purple/10 rounded-xl border border-accent-purple/30">
                  <p className="text-sm text-accent-purple font-medium">
                    📅 Trimestre : {getTrimestreMois()}
                  </p>
                </div>
              )}
            </div>

            {/* Date de paiement (seulement pour mensuel) */}
            {formData.typePeriode === 'MENSUELLE' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">💰 Paiement</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Date de paiement (optionnel)
                  </label>
                  <input
                    type="date"
                    name="datePaiement"
                    value={formData.datePaiement}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-accent-blue transition"
                  />
                  <p className="text-xs text-light-500 mt-2">
                    Laisser vide si le paiement n'est pas encore effectué
                  </p>
                </div>
              </div>
            )}

            {/* Prévisualisation du statut (seulement pour mensuel) */}
            {currentBail && showStatut && (
              <div className={`p-6 rounded-2xl border-2 ${
                isPaye 
                  ? 'bg-accent-green/10 border-accent-green/30' 
                  : 'bg-accent-orange/10 border-accent-orange/30'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {isPaye ? (
                      <CheckCircle className="h-8 w-8 text-accent-green" />
                    ) : (
                      <Clock className="h-8 w-8 text-accent-orange" />
                    )}
                    <div>
                      <p className={`text-lg font-bold ${isPaye ? 'text-accent-green' : 'text-accent-orange'}`}>
                        {isPaye ? 'PAYÉ' : 'EN ATTENTE'}
                      </p>
                      <p className="text-sm text-light-400">
                        Statut du document
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-light-500 mb-1">
                      {isPaye ? 'Montant réglé' : 'Montant à régler'}
                    </p>
                    <p className={`text-2xl font-bold ${isPaye ? 'text-accent-green' : 'text-white'}`}>
                      {(currentBail.loyerHC + (currentBail.charges || 0)).toLocaleString('fr-FR')} €
                    </p>
                  </div>
                </div>
                {isPaye && formData.datePaiement && (
                  <p className="text-sm text-accent-green">
                    ✓ Payé le {new Date(formData.datePaiement).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-6 border-t border-dark-700/50">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 border border-gray-700 rounded-xl text-gray-200 hover:bg-dark-800 transition font-semibold"
                disabled={loading || emailLoading}
              >
                Annuler
              </button>
              
              {/* Bouton Email */}
              {currentBail?.locataire?.email && (
              <button
              type="button"
              onClick={handleEnvoyerEmail}
              disabled={emailLoading || loading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-green-600/30 hover:shadow-2xl hover:shadow-green-600/40 flex items-center justify-center gap-2"
              >
              {emailLoading ? (
              <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Envoi...
              </>
              ) : (
              <>
              <Mail className="h-5 w-5" />
              Envoyer par email
              </>
              )}
              </button>
              )}
              
              {/* Bouton PDF */}
              <button
                type="submit"
                disabled={loading || emailLoading || !currentBail}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light text-white rounded-xl transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-accent-blue/30 hover:shadow-2xl hover:shadow-accent-blue/40 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Génération...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Télécharger PDF
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default QuittanceForm;
