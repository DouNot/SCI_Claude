import { useState, useEffect } from 'react';
import { useSpace } from '../contexts/SpaceContext';
import { Briefcase, Plus, Download, FileText, Trash2, Loader, Eye, Calculator } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const TYPES_PROJET = {
  ACQUISITION: { label: 'Acquisition', icon: '🏢', description: 'Achat d\'un bien immobilier' },
  REFINANCEMENT: { label: 'Refinancement', icon: '🔄', description: 'Renégociation de prêts existants' },
  TRAVAUX: { label: 'Travaux', icon: '🔨', description: 'Financement de travaux' },
};

const STATUTS = {
  BROUILLON: { label: 'Brouillon', color: 'accent-orange', icon: '✏️' },
  GENERE: { label: 'Généré', color: 'accent-blue', icon: '📄' },
  VALIDE: { label: 'Validé', color: 'accent-green', icon: '✅' },
  REJETE: { label: 'Rejeté', color: 'red-500', icon: '❌' },
};

function BusinessPlansPage() {
  const { currentSpace } = useSpace();
  const [businessPlans, setBusinessPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [generating, setGenerating] = useState(null);
  const [previewPlan, setPreviewPlan] = useState(null);

  useEffect(() => {
    if (currentSpace) {
      loadBusinessPlans();
    }
  }, [currentSpace]);

  const loadBusinessPlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/spaces/${currentSpace.id}/business-plans`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBusinessPlans(response.data.data);
    } catch (err) {
      console.error('Erreur chargement business plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerer = async (businessPlanId) => {
    if (!confirm('Générer le business plan PDF ?')) return;

    try {
      setGenerating(businessPlanId);
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/spaces/${currentSpace.id}/business-plans/${businessPlanId}/generer`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await loadBusinessPlans();
      alert('Business plan généré avec succès !');
    } catch (err) {
      console.error('Erreur génération:', err);
      alert('Erreur lors de la génération');
    } finally {
      setGenerating(null);
    }
  };

  const handleDownload = async (businessPlanId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/spaces/${currentSpace.id}/business-plans/${businessPlanId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `business_plan_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Erreur téléchargement:', err);
      alert('Erreur lors du téléchargement');
    }
  };

  const handlePreview = (bp) => {
    setPreviewPlan(bp);
  };

  const handleDelete = async (businessPlanId) => {
    if (!confirm('Supprimer ce business plan ?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_URL}/spaces/${currentSpace.id}/business-plans/${businessPlanId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await loadBusinessPlans();
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-dark-950">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  const headerActions = (
    <button
      onClick={() => setShowCreateModal(true)}
      className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl shadow-accent-blue/30 hover:shadow-2xl hover:shadow-accent-blue/40 hover:scale-105"
    >
      <Plus className="h-5 w-5" />
      Nouveau business plan
    </button>
  );

  return (
    <PageLayout
      title="Business Plans Bancaires"
      subtitle={`${businessPlans.length} business plan${businessPlans.length > 1 ? 's' : ''}`}
      headerActions={headerActions}
    >
      {businessPlans.length > 0 ? (
        <div className="space-y-5">
          {businessPlans.map((bp) => {
            const typeInfo = TYPES_PROJET[bp.type] || TYPES_PROJET.ACQUISITION;
            const statutInfo = STATUTS[bp.statut] || STATUTS.BROUILLON;
            const isGenerating = generating === bp.id;

            return (
              <div
                key={bp.id}
                className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card hover:shadow-card-hover transition p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{typeInfo.icon}</span>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{bp.nom}</h3>
                        <p className="text-light-400 text-sm mt-1">
                          {typeInfo.label} • {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(bp.montantDemande)}
                        </p>
                      </div>
                    </div>

                    {bp.description && (
                      <p className="text-light-300 text-sm mb-4">{bp.description}</p>
                    )}

                    <div className="flex items-center gap-6 mt-4">
                      <span className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full border bg-${statutInfo.color}/20 text-${statutInfo.color} border-${statutInfo.color}/30`}>
                        {statutInfo.icon} {statutInfo.label}
                      </span>

                      <div className="flex items-center gap-2 text-light-400">
                        <Calculator className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {Math.floor(bp.dureePret / 12)} ans • {bp.tauxEstime?.toFixed(2) || '3.50'}%
                        </span>
                      </div>

                      {bp.banqueDestination && (
                        <div className="flex items-center gap-2 text-light-400">
                          <Briefcase className="h-4 w-4" />
                          <span className="text-sm font-medium">{bp.banqueDestination}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {bp.statut === 'BROUILLON' && (
                      <button
                        onClick={() => handleGenerer(bp.id)}
                        disabled={isGenerating}
                        className="p-2.5 bg-accent-green/10 hover:bg-accent-green/20 rounded-xl border border-accent-green/20 transition disabled:opacity-50"
                        title="Générer le PDF"
                      >
                        {isGenerating ? (
                          <Loader className="h-4 w-4 text-accent-green animate-spin" />
                        ) : (
                          <FileText className="h-4 w-4 text-accent-green" />
                        )}
                      </button>
                    )}

                    {(bp.statut === 'GENERE' || bp.statut === 'VALIDE') && bp.urlPdf && (
                      <>
                        <button
                          onClick={() => handlePreview(bp)}
                          className="p-2.5 bg-accent-purple/10 hover:bg-accent-purple/20 rounded-xl border border-accent-purple/20 transition"
                          title="Prévisualiser"
                        >
                          <Eye className="h-4 w-4 text-accent-purple" />
                        </button>
                        
                        <button
                          onClick={() => handleDownload(bp.id)}
                          className="p-2.5 bg-accent-blue/10 hover:bg-accent-blue/20 rounded-xl border border-accent-blue/20 transition"
                          title="Télécharger"
                        >
                          <Download className="h-4 w-4 text-accent-blue" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleDelete(bp.id)}
                      className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/20 transition"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-dark-900 rounded-3xl border border-dark-600/30 shadow-card p-20 text-center">
          <Briefcase className="h-20 w-20 text-accent-blue/50 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun business plan</h3>
          <p className="text-light-300 mb-6">
            Créez votre premier business plan pour présenter votre projet à une banque
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl"
          >
            <Plus className="h-5 w-5" />
            Créer un business plan
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreateBusinessPlanModal
          spaceId={currentSpace.id}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadBusinessPlans();
          }}
        />
      )}

      {previewPlan && (
        <PreviewModal
          businessPlan={previewPlan}
          spaceId={currentSpace.id}
          onClose={() => setPreviewPlan(null)}
          onDownload={() => handleDownload(previewPlan.id)}
        />
      )}
    </PageLayout>
  );
}

function PreviewModal({ businessPlan, spaceId, onClose, onDownload }) {
  const token = localStorage.getItem('token');
  const pdfUrl = `${API_URL}/spaces/${spaceId}/business-plans/${businessPlan.id}/preview?token=${token}`;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 z-[9998] backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none">
        <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col pointer-events-auto">
          <div className="p-6 border-b border-dark-700 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{businessPlan.nom}</h2>
              <p className="text-light-400 text-sm mt-1">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(businessPlan.montantDemande)} • {Math.floor(businessPlan.dureePret / 12)} ans
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={onDownload} className="flex items-center gap-2 px-5 py-2.5 bg-accent-green/10 hover:bg-accent-green/20 rounded-xl border border-accent-green/30 transition">
                <Download className="h-4 w-4 text-accent-green" />
                <span className="text-accent-green font-semibold">Télécharger</span>
              </button>
              <button onClick={onClose} className="px-5 py-2.5 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-600 transition text-light-200 font-semibold">
                Fermer
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <iframe src={pdfUrl} className="w-full h-full" title="Prévisualisation du business plan" />
          </div>
        </div>
      </div>
    </>
  );
}

// 🎯 FORMULAIRE ENRICHI - 3 onglets
function CreateBusinessPlanModal({ spaceId, onClose, onCreated }) {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('ACQUISITION');
  const [montantDemande, setMontantDemande] = useState('');
  const [dureePret, setDureePret] = useState(240);
  const [tauxEstime, setTauxEstime] = useState(3.5);
  const [banqueDestination, setBanqueDestination] = useState('');
  const [contactBanque, setContactBanque] = useState('');
  
  const [adresseBien, setAdresseBien] = useState('');
  const [villeBien, setVilleBien] = useState('');
  const [typeBien, setTypeBien] = useState('');
  const [surfaceBien, setSurfaceBien] = useState('');
  const [loyerPrevisionnel, setLoyerPrevisionnel] = useState('');
  const [chargesPrevues, setChargesPrevues] = useState('');
  const [estimationNotaire, setEstimationNotaire] = useState('');
  
  const [objectifProjet, setObjectifProjet] = useState('');
  const [dureeDetention, setDureeDetention] = useState('');
  const [strategieFinancement, setStrategieFinancement] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [genererImmediatement, setGenererImmediatement] = useState(true);
  const [activeTab, setActiveTab] = useState('general');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const hypotheses = {
        bien: {
          adresse: adresseBien,
          ville: villeBien,
          type: typeBien,
          surface: surfaceBien ? parseFloat(surfaceBien) : null,
          loyerPrevisionnel: loyerPrevisionnel ? parseFloat(loyerPrevisionnel) : null,
          chargesPrevues: chargesPrevues ? parseFloat(chargesPrevues) : null,
          estimationNotaire: estimationNotaire ? parseFloat(estimationNotaire) : null,
        },
        strategie: {
          objectif: objectifProjet,
          dureeDetention: dureeDetention ? parseInt(dureeDetention) : null,
          strategieFinancement,
        },
      };

      const response = await axios.post(
        `${API_URL}/spaces/${spaceId}/business-plans`,
        {
          nom,
          description,
          type,
          montantDemande: parseFloat(montantDemande),
          dureePret: parseInt(dureePret),
          tauxEstime: parseFloat(tauxEstime),
          banqueDestination,
          contactBanque,
          hypotheses,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (genererImmediatement) {
        await axios.post(
          `${API_URL}/spaces/${spaceId}/business-plans/${response.data.data.id}/generer`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert('Business plan créé et généré avec succès !');
      }

      onCreated();
    } catch (err) {
      console.error('Erreur création:', err);
      alert('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[9998] backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none overflow-y-auto">
        <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-2xl max-w-4xl w-full p-8 pointer-events-auto my-8 max-h-[90vh] overflow-y-auto">
          <h2 className="text-3xl font-bold text-white mb-2">Nouveau business plan</h2>
          <p className="text-light-400 text-sm mb-6">Plus vous remplissez d'informations, plus le business plan sera complet et convaincant</p>

          <div className="flex gap-2 mb-6 border-b border-dark-700">
            {['general', 'bien', 'strategie'].map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'text-accent-blue border-accent-blue'
                    : 'text-light-400 border-transparent hover:text-white'
                }`}
              >
                {idx + 1}. {tab === 'general' ? 'Général' : tab === 'bien' ? 'Bien ciblé' : 'Stratégie'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-light-400 mb-2">Nom du projet *</label>
                  <input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                    placeholder="Ex: Acquisition immeuble Paris 11e"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-light-400 mb-2">Description du projet</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                    placeholder="Décrivez brièvement votre projet d'investissement..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-light-400 mb-2">Type de projet *</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                    >
                      {Object.entries(TYPES_PROJET).map(([key, info]) => (
                        <option key={key} value={key}>
                          {info.icon} {info.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-light-400 mb-2">Montant demandé (€) *</label>
                    <input
                      type="number"
                      value={montantDemande}
                      onChange={(e) => setMontantDemande(e.target.value)}
                      required
                      min="0"
                      step="1000"
                      className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                      placeholder="250000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-light-400 mb-2">Durée (mois) *</label>
                    <input
                      type="number"
                      value={dureePret}
                      onChange={(e) => setDureePret(e.target.value)}
                      required
                      min="12"
                      max="360"
                      className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                    />
                    <p className="text-xs text-light-500 mt-1">{Math.floor(dureePret / 12)} ans</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-light-400 mb-2">Taux estimé (%)</label>
                    <input
                      type="number"
                      value={tauxEstime}
                      onChange={(e) => setTauxEstime(e.target.value)}
                      min="0"
                      max="10"
                      step="0.1"
                      className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-light-400 mb-2">Banque destinataire</label>
                    <input
                      type="text"
                      value={banqueDestination}
                      onChange={(e) => setBanqueDestination(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                      placeholder="Ex: Crédit Agricole"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-light-400 mb-2">Contact banque</label>
                    <input
                      type="text"
                      value={contactBanque}
                      onChange={(e) => setContactBanque(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                      placeholder="Ex: M. Dupont"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bien' && (
              <div className="space-y-6">
                <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-xl p-4 mb-4">
                  <p className="text-sm text-accent-blue">
                    <strong>💡 Conseil :</strong> Plus vous détaillez le bien ciblé, plus le business plan sera convaincant pour la banque.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-light-400 mb-2">Adresse du bien</label>
                    <input
                      type="text"
                      value={adresseBien}
                      onChange={(e) => setAdresseBien(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                      placeholder="Ex: 15 rue de la Paix"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-light-400 mb-2">Ville</label>
                    <input
                      type="text"
                      value={villeBien}
                      onChange={(e) => setVilleBien(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                      placeholder="Ex: Paris 11e"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-light-400 mb-2">Type de bien</label>
                    <select
                      value={typeBien}
                      onChange={(e) => setTypeBien(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="Appartement">Appartement</option>
                      <option value="Maison">Maison</option>
                      <option value="Immeuble">Immeuble</option>
                      <option value="Local commercial">Local commercial</option>
                      <option value="Bureau">Bureau</option>
                      <option value="Entrepôt">Entrepôt</option>
                      <option value="Terrain">Terrain</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-light-400 mb-2">Surface (m²)</label>
                    <input
                      type="number"
                      value={surfaceBien}
                      onChange={(e) => setSurfaceBien(e.target.value)}
                      min="0"
                      step="0.1"
                      className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                      placeholder="85"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-light-400 mb-2">Loyer prévisionnel (€/mois)</label>
                    <input
                      type="number"
                      value={loyerPrevisionnel}
                      onChange={(e) => setLoyerPrevisionnel(e.target.value)}
                      min="0"
                      step="10"
                      className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                      placeholder="1200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-light-400 mb-2">Charges prévues (€/mois)</label>
                    <input
                      type="number"
                      value={chargesPrevues}
                      onChange={(e) => setChargesPrevues(e.target.value)}
                      min="0"
                      step="10"
                      className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                      placeholder="150"
                    />
                    <p className="text-xs text-light-500 mt-1">TF, PNO, entretien</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-light-400 mb-2">Estimation notaire (€)</label>
                    <input
                      type="number"
                      value={estimationNotaire}
                      onChange={(e) => setEstimationNotaire(e.target.value)}
                      min="0"
                      step="1000"
                      className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                      placeholder="260000"
                    />
                    <p className="text-xs text-light-500 mt-1">Estimation officielle</p>
                  </div>
                </div>

                {loyerPrevisionnel && chargesPrevues && montantDemande && dureePret && tauxEstime && (
                  <div className="bg-accent-green/10 border border-accent-green/30 rounded-xl p-4">
                    <p className="text-sm font-semibold text-accent-green mb-2">📊 Cashflow prévisionnel estimé :</p>
                    {(() => {
                      const loyer = parseFloat(loyerPrevisionnel);
                      const charges = parseFloat(chargesPrevues);
                      const montant = parseFloat(montantDemande);
                      const duree = parseInt(dureePret);
                      const taux = parseFloat(tauxEstime);
                      
                      const tauxMensuel = (taux / 100) / 12;
                      const mensualite = (montant * tauxMensuel * Math.pow(1 + tauxMensuel, duree)) / (Math.pow(1 + tauxMensuel, duree) - 1);
                      const cashflow = loyer - charges - mensualite;
                      
                      return (
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-light-400">Loyer :</span>
                            <p className="font-bold text-white">{loyer.toFixed(2)} €</p>
                          </div>
                          <div>
                            <span className="text-light-400">Charges :</span>
                            <p className="font-bold text-white">-{charges.toFixed(2)} €</p>
                          </div>
                          <div>
                            <span className="text-light-400">Mensualité :</span>
                            <p className="font-bold text-white">-{mensualite.toFixed(2)} €</p>
                          </div>
                          <div>
                            <span className="text-light-400">Cashflow :</span>
                            <p className={`font-bold text-xl ${cashflow >= 0 ? 'text-accent-green' : 'text-red-400'}`}>
                              {cashflow >= 0 ? '+' : ''}{cashflow.toFixed(2)} €/mois
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'strategie' && (
              <div className="space-y-6">
                <div className="bg-accent-purple/10 border border-accent-purple/30 rounded-xl p-4 mb-4">
                  <p className="text-sm text-accent-purple">
                    <strong>💡 Conseil :</strong> La stratégie explique POURQUOI ce projet maintenant et comment il s'inscrit dans votre vision long terme.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-light-400 mb-2">Objectif du projet</label>
                  <textarea
                    value={objectifProjet}
                    onChange={(e) => setObjectifProjet(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                    placeholder="Ex: Diversification géographique, optimisation fiscale IR/IS, constitution d'un patrimoine locatif stable..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-light-400 mb-2">Stratégie de financement</label>
                  <textarea
                    value={strategieFinancement}
                    onChange={(e) => setStrategieFinancement(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                    placeholder="Ex: Réutilisation du cashflow des biens existants pour l'apport, optimisation de l'effet de levier..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-light-400 mb-2">Durée de détention prévue (années)</label>
                  <input
                    type="number"
                    value={dureeDetention}
                    onChange={(e) => setDureeDetention(e.target.value)}
                    min="1"
                    max="50"
                    className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                    placeholder="15"
                  />
                  <p className="text-xs text-light-500 mt-1">Vision long terme, transmission patrimoniale, etc.</p>
                </div>
              </div>
            )}

            <div className="border-t border-dark-700 pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="generer"
                  checked={genererImmediatement}
                  onChange={(e) => setGenererImmediatement(e.target.checked)}
                  className="w-5 h-5 rounded accent-accent-blue"
                />
                <label htmlFor="generer" className="text-sm text-light-300">
                  Générer le PDF immédiatement
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-dark-600 rounded-xl text-light-200 hover:bg-dark-800 transition font-semibold"
                >
                  Annuler
                </button>
                
                {activeTab !== 'general' && (
                  <button
                    type="button"
                    onClick={() => {
                      const tabs = ['general', 'bien', 'strategie'];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1]);
                    }}
                    className="px-6 py-3 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-600 transition text-light-200 font-semibold"
                  >
                    ← Précédent
                  </button>
                )}

                {activeTab !== 'strategie' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const tabs = ['general', 'bien', 'strategie'];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1]);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-xl transition font-semibold"
                  >
                    Suivant →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-xl transition font-semibold disabled:opacity-50"
                  >
                    {loading ? 'Création...' : '✓ Créer le business plan'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default BusinessPlansPage;
