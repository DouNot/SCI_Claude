import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { associesAPI } from '../services/api';
import { 
  ArrowLeft, Plus, TrendingUp, TrendingDown, DollarSign, Calendar, 
  Mail, Phone, Trash2, FileText, User as UserIcon,
  Building2, Hash
} from 'lucide-react';
import MouvementCCAModal from '../components/MouvementCCAModal';
import PageLayout from '../components/PageLayout';
import { useSpace } from '../contexts/SpaceContext';

function AssocieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentSpace } = useSpace();
  
  const [associe, setAssocie] = useState(null);
  const [mouvements, setMouvements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMouvementModal, setShowMouvementModal] = useState(false);
  const [mouvementToEdit, setMouvementToEdit] = useState(null);

  useEffect(() => {
    loadAssocieData();
  }, [id]);

  const loadAssocieData = async () => {
    try {
      setLoading(true);
      const [associeResponse, mouvementsResponse] = await Promise.all([
        associesAPI.getById(id),
        associesAPI.getMouvementsCCA(id)
      ]);
      setAssocie(associeResponse.data);
      setMouvements(mouvementsResponse.data);
    } catch (err) {
      console.error('Erreur chargement données:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMouvement = async (mouvementData) => {
    try {
      await associesAPI.createMouvementCCA(id, mouvementData);
      await loadAssocieData();
      setShowMouvementModal(false);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteMouvement = async (mouvementId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce mouvement ?')) return;
    
    try {
      await associesAPI.deleteMouvementCCA(mouvementId);
      await loadAssocieData();
    } catch (err) {
      console.error('Erreur suppression mouvement:', err);
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

  if (!associe) {
    return (
      <PageLayout title="Associé non trouvé">
        <div className="bg-dark-900 rounded-3xl border border-dark-600/30 shadow-card p-20 text-center">
          <p className="text-light-300 text-xl mb-6">Cet associé n'existe pas ou a été supprimé</p>
          <button
            onClick={() => navigate('/associes')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour aux associés
          </button>
        </div>
      </PageLayout>
    );
  }

  const totalApports = mouvements
    .filter(m => m.type === 'APPORT' || m.type === 'INTERETS')
    .reduce((sum, m) => sum + m.montant, 0);
  
  const totalRetraits = mouvements
    .filter(m => m.type === 'RETRAIT')
    .reduce((sum, m) => sum + m.montant, 0);

  const headerActions = (
    <button
      onClick={() => navigate('/associes')}
      className="flex items-center gap-2 px-5 py-3 border border-dark-600 rounded-2xl text-light-200 hover:bg-dark-800 transition font-semibold"
    >
      <ArrowLeft className="h-5 w-5" />
      Retour
    </button>
  );

  return (
    <PageLayout
      title={`${associe.prenom} ${associe.nom}`}
      subtitle={`Associé de ${currentSpace?.nom}`}
      headerActions={headerActions}
    >
      {/* En-tête Associé */}
      <div className="bg-dark-900 border border-dark-600/30 rounded-2xl shadow-card p-8 mb-10">
        <div className="flex items-start gap-8">
          {/* Avatar */}
          <div className="w-32 h-32 bg-accent-blue/20 rounded-2xl flex flex-col items-center justify-center border border-accent-blue/30">
            {associe.type === 'PERSONNE_MORALE' ? (
              <Building2 className="h-14 w-14 text-accent-blue mb-2" />
            ) : (
              <UserIcon className="h-14 w-14 text-accent-blue mb-2" />
            )}
            <span className="text-xs text-accent-blue font-semibold">
              {associe.type === 'PERSONNE_MORALE' ? 'PM' : 'PP'}
            </span>
          </div>

          {/* Informations */}
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-dark-950 p-4 rounded-xl border border-dark-600/30">
                <p className="text-xs text-light-500 mb-1 font-medium">Parts détenues</p>
                <p className="text-2xl font-bold text-accent-blue">
                  {associe.nombreParts?.toLocaleString()}
                </p>
              </div>

              <div className="bg-dark-950 p-4 rounded-xl border border-dark-600/30">
                <p className="text-xs text-light-500 mb-1 font-medium">Pourcentage</p>
                <p className="text-2xl font-bold text-accent-purple">
                  {parseFloat(associe.pourcentage || 0).toFixed(2)}%
                </p>
              </div>

              <div className="bg-dark-950 p-4 rounded-xl border border-dark-600/30">
                <p className="text-xs text-light-500 mb-1 font-medium">Date d'entrée</p>
                <p className="text-lg font-bold text-light-300">
                  {new Date(associe.dateEntree).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div className="bg-accent-green/10 p-4 rounded-xl border border-accent-green/30">
                <p className="text-xs text-light-500 mb-1 font-medium">Solde CCA</p>
                <p className="text-2xl font-bold text-accent-green">
                  {(associe.soldeCCA || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
            </div>

            {/* Coordonnées */}
            {(associe.email || associe.telephone) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {associe.email && (
                  <div className="flex items-center gap-3 p-3 bg-dark-950 rounded-xl border border-dark-600/30">
                    <Mail className="h-5 w-5 text-light-500" />
                    <a href={`mailto:${associe.email}`} className="text-light-300 hover:text-white transition font-medium">
                      {associe.email}
                    </a>
                  </div>
                )}

                {associe.telephone && (
                  <div className="flex items-center gap-3 p-3 bg-dark-950 rounded-xl border border-dark-600/30">
                    <Phone className="h-5 w-5 text-light-500" />
                    <a href={`tel:${associe.telephone}`} className="text-light-300 hover:text-white transition font-medium">
                      {associe.telephone}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistiques CCA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-accent-green/20 rounded-xl">
              <TrendingUp className="h-6 w-6 text-accent-green" />
            </div>
            <span className="text-sm text-light-400 font-semibold">Total Apports</span>
          </div>
          <p className="text-3xl font-bold text-accent-green">
            {totalApports.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>

        <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <TrendingDown className="h-6 w-6 text-red-400" />
            </div>
            <span className="text-sm text-light-400 font-semibold">Total Retraits</span>
          </div>
          <p className="text-3xl font-bold text-red-400">
            {totalRetraits.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>

        <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-accent-blue/20 rounded-xl">
              <DollarSign className="h-6 w-6 text-accent-blue" />
            </div>
            <span className="text-sm text-light-400 font-semibold">Mouvements</span>
          </div>
          <p className="text-3xl font-bold text-accent-blue">
            {mouvements.length}
          </p>
        </div>
      </div>

      {/* Section Mouvements CCA */}
      <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card overflow-hidden">
        <div className="p-6 border-b border-dark-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Historique Compte Courant Associé</h2>
            <p className="text-light-400 text-sm">{mouvements.length} mouvement{mouvements.length > 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowMouvementModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl shadow-accent-blue/30 hover:shadow-2xl hover:shadow-accent-blue/40 hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            Nouveau mouvement
          </button>
        </div>

        {/* Liste des mouvements */}
        <div className="p-6">
          {mouvements.length > 0 ? (
            <div className="space-y-5">
              {mouvements.map((mouvement) => {
                const isPositive = mouvement.type === 'APPORT' || mouvement.type === 'INTERETS';
                const colorClass = isPositive ? 'text-accent-green' : 'text-red-400';
                const bgClass = isPositive ? 'bg-accent-green/10' : 'bg-red-500/10';
                const borderClass = isPositive ? 'border-accent-green/30' : 'border-red-500/30';

                return (
                  <div
                    key={mouvement.id}
                    className={`${bgClass} border ${borderClass} rounded-2xl p-6 hover:border-opacity-70 transition group`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 ${bgClass} rounded-xl border ${borderClass}`}>
                          {mouvement.type === 'APPORT' && <TrendingUp className={`h-6 w-6 ${colorClass}`} />}
                          {mouvement.type === 'RETRAIT' && <TrendingDown className={`h-6 w-6 ${colorClass}`} />}
                          {mouvement.type === 'INTERETS' && <DollarSign className={`h-6 w-6 ${colorClass}`} />}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-1">
                                {mouvement.libelle}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-light-400">
                                <span className="flex items-center gap-1 font-medium">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(mouvement.date).toLocaleDateString('fr-FR')}
                                </span>
                                {mouvement.reference && (
                                  <span className="flex items-center gap-1 font-medium">
                                    <Hash className="h-4 w-4" />
                                    {mouvement.reference}
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className={`text-3xl font-bold ${colorClass}`}>
                              {isPositive ? '+' : '-'}{mouvement.montant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                            </p>
                          </div>

                          {mouvement.notes && (
                            <p className="text-sm text-light-400 bg-dark-950 rounded-xl p-3 border border-dark-600/30 mt-3">
                              {mouvement.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleDeleteMouvement(mouvement.id)}
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
            <div className="text-center py-16">
              <FileText className="h-20 w-20 text-accent-blue/50 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-white mb-2">Aucun mouvement</h3>
              <p className="text-light-300 mb-6">Commencez par ajouter un premier mouvement CCA</p>
              <button
                onClick={() => setShowMouvementModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl"
              >
                <Plus className="h-5 w-5" />
                Ajouter un mouvement
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Mouvement */}
      {showMouvementModal && (
        <MouvementCCAModal
          onClose={() => {
            setShowMouvementModal(false);
            setMouvementToEdit(null);
          }}
          onSubmit={handleCreateMouvement}
          associe={associe}
          mouvementToEdit={mouvementToEdit}
        />
      )}
    </PageLayout>
  );
}

export default AssocieDetailPage;
