import { useState, useEffect } from 'react';
import { locatairesAPI, bauxAPI, biensAPI } from '../services/api';
import { Plus, Search, Users, Building2, User, FileText, Pencil, Trash2, ExternalLink } from 'lucide-react';
import LocataireForm from '../components/LocataireForm';
import QuittanceForm from '../components/QuittanceForm';
import ResilierBailModal from '../components/ResilierBailModal';
import PageLayout from '../components/PageLayout';

function LocatairesPage({ onNavigate }) {
  const [locataires, setLocataires] = useState([]);
  const [baux, setBaux] = useState([]);
  const [biens, setBiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [locataireToEdit, setLocataireToEdit] = useState(null);
  const [showQuittanceForm, setShowQuittanceForm] = useState(false);
  const [showResilierBailModal, setShowResilierBailModal] = useState(false);
  const [selectedBail, setSelectedBail] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [locatairesRes, bauxRes, biensRes] = await Promise.all([
        locatairesAPI.getAll(),
        bauxAPI.getAll(),
        biensAPI.getAll()
      ]);
      setLocataires(locatairesRes.data);
      setBaux(bauxRes.data);
      setBiens(biensRes.data);
    } catch (err) {
      console.error('Erreur chargement locataires:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocataire = async (locataireData) => {
    try {
      await locatairesAPI.create(locataireData);
      await loadData();
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateLocataire = async (id, locataireData) => {
    try {
      await locatairesAPI.update(id, locataireData);
      await loadData();
      setLocataireToEdit(null);
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setLocataireToEdit(null);
  };

  const handleDeleteLocataire = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce locataire ?\n\nCette action est irréversible.')) {
      try {
        await locatairesAPI.delete(id);
        await loadData();
      } catch (err) {
        console.error('Erreur suppression:', err);
        alert('Erreur lors de la suppression du locataire');
      }
    }
  };

  const openEditForm = (locataire) => {
    setLocataireToEdit(locataire);
    setShowForm(true);
  };

  const openQuittanceForm = (bail) => {
    setSelectedBail(bail);
    setShowQuittanceForm(true);
  };

  const openResilierBailModal = (bail) => {
    setSelectedBail(bail);
    setShowResilierBailModal(true);
  };

  const getLocataireBaux = (locataireId) => {
    return baux.filter(b => b.locataireId === locataireId);
  };

  const isLocataireActif = (locataireId) => {
    return baux.some(b => b.locataireId === locataireId && b.statut === 'ACTIF');
  };

  const filteredLocataires = locataires.filter(loc => {
    const matchSearch = searchTerm === '' || 
      loc.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.email?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'actifs') return matchSearch && isLocataireActif(loc.id);
    if (filterStatus === 'anciens') return matchSearch && !isLocataireActif(loc.id);
    return matchSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-dark-950">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  const headerActions = (
    <button 
      onClick={() => setShowForm(true)}
      className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl shadow-accent-blue/30 hover:shadow-2xl hover:shadow-accent-blue/40 hover:scale-105"
    >
      <Plus className="h-5 w-5" />
      Ajouter un locataire
    </button>
  );

  const activeCount = locataires.filter(l => isLocataireActif(l.id)).length;

  return (
    <PageLayout
      title="Locataires"
      subtitle={`${locataires.length} locataire${locataires.length > 1 ? 's' : ''} • ${activeCount} actif${activeCount > 1 ? 's' : ''}`}
      headerActions={headerActions}
    >
      {/* Filtres */}
      <div className="flex items-center gap-4 mb-10">
        {/* Recherche */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-accent-blue" />
          <input
            type="text"
            placeholder="Rechercher un locataire..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-5 py-4 bg-dark-900 rounded-2xl text-white placeholder-light-400 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition shadow-card border border-dark-600/30"
          />
        </div>

        {/* Filtres statut */}
        <div className="flex gap-3 bg-dark-900 rounded-2xl p-2 shadow-card border border-dark-600/30">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              filterStatus === 'all' ? 'bg-accent-blue/20 text-accent-blue shadow-glow-blue' : 'text-light-400 hover:text-white hover:bg-dark-800'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilterStatus('actifs')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              filterStatus === 'actifs' ? 'bg-accent-blue/20 text-accent-blue shadow-glow-blue' : 'text-light-400 hover:text-white hover:bg-dark-800'
            }`}
          >
            Actifs
          </button>
          <button
            onClick={() => setFilterStatus('anciens')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              filterStatus === 'anciens' ? 'bg-accent-blue/20 text-accent-blue shadow-glow-blue' : 'text-light-400 hover:text-white hover:bg-dark-800'
            }`}
          >
            Anciens
          </button>
        </div>
      </div>

      {/* Liste des locataires */}
      <div className="space-y-5">
        {filteredLocataires.map(locataire => {
          const locataireBaux = getLocataireBaux(locataire.id);
          const bailActif = locataireBaux.find(b => b.statut === 'ACTIF');
          const isActif = isLocataireActif(locataire.id);

          return (
            <div
              key={locataire.id}
              className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card hover:shadow-card-hover hover:scale-[1.01] transition-all p-7"
            >
              <div className="flex items-start gap-5">
                {/* Avatar */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  locataire.type === 'ENTREPRISE' ? 'bg-accent-blue/10 border border-accent-blue/20' : 'bg-accent-purple/10 border border-accent-purple/20'
                }`}>
                  {locataire.type === 'ENTREPRISE' ? (
                    <Building2 className="h-8 w-8 text-accent-blue" />
                  ) : (
                    <User className="h-8 w-8 text-accent-purple" />
                  )}
                </div>

                {/* Infos principales */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1.5">{locataire.nom}</h3>
                      <p className="text-sm text-light-400">
                        {locataire.type === 'ENTREPRISE' ? 'Entreprise' : 'Particulier'}
                        {locataire.email && ` • ${locataire.email}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        isActif ? 'bg-accent-green/20 text-accent-green border border-accent-green/30' : 'bg-dark-800 text-light-400 border border-dark-700'
                      }`}>
                        {isActif ? '● Actif' : 'Ancien'}
                      </span>
                      <button
                        onClick={() => openEditForm(locataire)}
                        className="p-2.5 bg-accent-blue/10 hover:bg-accent-blue/20 rounded-xl border border-accent-blue/20 transition"
                        title="Modifier"
                      >
                        <Pencil className="h-4 w-4 text-accent-blue" />
                      </button>
                      <button
                        onClick={() => handleDeleteLocataire(locataire.id)}
                        className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/20 transition"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Bail actif */}
                  {bailActif && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 bg-dark-800/50 rounded-2xl border border-dark-700/50">
                        <div>
                          <p className="text-xs text-light-500 mb-2 font-medium">Bien loué</p>
                          <button
                            onClick={() => onNavigate && onNavigate('bien-detail', bailActif.bienId)}
                            className="text-sm text-white font-semibold hover:text-accent-blue transition flex items-center gap-2 group"
                          >
                            {bailActif.bien?.adresse}
                            <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition" />
                          </button>
                        </div>
                        <div>
                          <p className="text-xs text-light-500 mb-2 font-medium">Loyer mensuel</p>
                          <p className="text-sm text-accent-green font-bold">
                            {bailActif.loyerHC.toLocaleString('fr-FR')} € HC
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-light-500 mb-2 font-medium">Fin du bail</p>
                          <p className="text-sm text-white font-semibold">
                            {new Date(bailActif.dateFin).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      
                      {/* Bouton générer quittance/facture */}
                      <div className="space-y-3">
                        <button
                          onClick={() => openQuittanceForm(bailActif)}
                          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 hover:from-accent-blue/30 hover:to-accent-purple/30 border border-accent-blue/30 rounded-2xl text-accent-blue font-semibold transition-all shadow-card hover:shadow-card-hover"
                        >
                          <FileText className="h-5 w-5" />
                          {bailActif.locataire?.typeLocataire === 'ENTREPRISE' 
                            ? 'Générer une facture' 
                            : 'Générer une quittance de loyer'}
                        </button>
                        <button
                          onClick={() => openResilierBailModal(bailActif)}
                          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl text-red-400 font-semibold transition-all shadow-card hover:shadow-card-hover"
                        >
                          Résilier le bail
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Historique */}
                  {locataireBaux.length > 1 && (
                    <div className="mt-4 text-sm text-light-400 font-medium">
                      Historique: {locataireBaux.length} bail{locataireBaux.length > 1 ? 'aux' : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLocataires.length === 0 && (
        <div className="bg-dark-900 rounded-3xl border border-dark-600/30 shadow-card p-20 text-center">
          <Users className="h-20 w-20 text-accent-blue/50 mx-auto mb-6" />
          <p className="text-light-300 text-xl">
            {searchTerm ? 'Aucun locataire ne correspond à votre recherche' : 'Aucun locataire'}
          </p>
        </div>
      )}

      {/* Modal Formulaire */}
      {showForm && (
        <LocataireForm
          onClose={closeForm}
          onSubmit={locataireToEdit ? handleUpdateLocataire : handleCreateLocataire}
          locataireToEdit={locataireToEdit}
        />
      )}

      {/* Modal Génération Quittance */}
      {showQuittanceForm && selectedBail && (
        <QuittanceForm
          onClose={() => {
            setShowQuittanceForm(false);
            setSelectedBail(null);
          }}
          bail={selectedBail}
        />
      )}

      {/* Modal Résilier Bail */}
      {showResilierBailModal && selectedBail && (
        <ResilierBailModal
          bail={selectedBail}
          onClose={() => {
            setShowResilierBailModal(false);
            setSelectedBail(null);
          }}
          onSuccess={() => {
            setShowResilierBailModal(false);
            setSelectedBail(null);
            loadData();
          }}
        />
      )}
    </PageLayout>
  );
}

export default LocatairesPage;
