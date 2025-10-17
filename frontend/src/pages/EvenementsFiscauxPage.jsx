import { useState, useEffect } from 'react';
import { evenementsFiscauxAPI, biensAPI } from '../services/api';
import { Calendar, Edit, Trash2, AlertCircle, CheckCircle, Clock, Plus, Search } from 'lucide-react';
import EvenementFiscalForm from '../components/EvenementFiscalForm';
import PageLayout from '../components/PageLayout';

function EvenementsFiscauxPage() {
  const [evenements, setEvenements] = useState([]);
  const [biensList, setBiensList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [evenementToEdit, setEvenementToEdit] = useState(null);
  const [evenementToDelete, setEvenementToDelete] = useState(null);
  const [filterBien, setFilterBien] = useState('');
  const [filterStatut, setFilterStatut] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [evenementsResponse, biensResponse] = await Promise.all([
        evenementsFiscauxAPI.getAll(),
        biensAPI.getAll()
      ]);
      setEvenements(evenementsResponse.data);
      setBiensList(biensResponse.data);
      setError(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les événements fiscaux');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvenement = async (evenementData) => {
    try {
      await evenementsFiscauxAPI.create(evenementData);
      await loadData();
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateEvenement = async (id, evenementData) => {
    try {
      await evenementsFiscauxAPI.update(id, evenementData);
      await loadData();
      setEvenementToEdit(null);
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteEvenement = async (id) => {
    try {
      await evenementsFiscauxAPI.delete(id);
      await loadData();
      setEvenementToDelete(null);
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const openEditForm = (evenement) => {
    setEvenementToEdit(evenement);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEvenementToEdit(null);
  };

  const getTypeLabel = (type) => {
    const labels = {
      'TAXE_FONCIERE': 'Taxe foncière',
      'CFE': 'CFE',
      'DECLARATION_REVENUS': 'Déclaration revenus fonciers',
      'TVA': 'Déclaration TVA',
      'AUTRE': 'Autre'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      'TAXE_FONCIERE': 'bg-red-500/20 text-red-400 border-red-500/30',
      'CFE': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'DECLARATION_REVENUS': 'bg-accent-blue/20 text-accent-blue border-accent-blue/30',
      'TVA': 'bg-accent-purple/20 text-accent-purple border-accent-purple/30',
      'AUTRE': 'bg-dark-700 text-light-400 border-dark-600'
    };
    return colors[type] || 'bg-dark-700 text-light-400 border-dark-600';
  };

  const isOverdue = (dateEcheance, estPaye) => {
    if (estPaye) return false;
    return new Date(dateEcheance) < new Date();
  };

  const isDueSoon = (dateEcheance, estPaye) => {
    if (estPaye) return false;
    const today = new Date();
    const echeance = new Date(dateEcheance);
    const diffTime = echeance - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  };

  const filteredEvenements = evenements.filter(evt => {
    if (filterBien && evt.bienId !== filterBien) return false;
    if (filterStatut === 'PAYE' && !evt.estPaye) return false;
    if (filterStatut === 'IMPAYE' && evt.estPaye) return false;
    if (filterStatut === 'RETARD' && !isOverdue(evt.dateEcheance, evt.estPaye)) return false;
    return true;
  });

  const evenementsEnRetard = evenements.filter(evt => isOverdue(evt.dateEcheance, evt.estPaye)).length;
  const evenementsProchainement = evenements.filter(evt => isDueSoon(evt.dateEcheance, evt.estPaye)).length;
  const totalImpaye = evenements.filter(evt => !evt.estPaye && evt.montant).reduce((sum, evt) => sum + evt.montant, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-dark-950">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-dark-950">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 max-w-md">
          <p className="text-red-400 font-semibold mb-2">Erreur</p>
          <p className="text-light-300">{error}</p>
          <button 
            onClick={loadData} 
            className="mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-xl border border-red-500/30 transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const headerActions = (
    <button 
      onClick={() => setShowForm(true)}
      className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl shadow-accent-blue/30 hover:shadow-2xl hover:shadow-accent-blue/40 hover:scale-105"
    >
      <Plus className="h-5 w-5" />
      Ajouter un événement
    </button>
  );

  return (
    <PageLayout
      title="Événements Fiscaux"
      subtitle={`${filteredEvenements.length} événement${filteredEvenements.length > 1 ? 's' : ''}`}
      headerActions={headerActions}
    >
      {/* Alertes */}
      {(evenementsEnRetard > 0 || evenementsProchainement > 0 || totalImpaye > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {evenementsEnRetard > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-center gap-3">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <p className="font-bold text-red-400 text-lg">{evenementsEnRetard} en retard</p>
                <p className="text-sm text-light-400">Action urgente requise</p>
              </div>
            </div>
          )}
          {evenementsProchainement > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-5 flex items-center gap-3">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Clock className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <p className="font-bold text-orange-400 text-lg">{evenementsProchainement} à venir</p>
                <p className="text-sm text-light-400">Dans les 30 jours</p>
              </div>
            </div>
          )}
          {totalImpaye > 0 && (
            <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-2xl p-5 flex items-center gap-3">
              <div className="p-3 bg-accent-blue/20 rounded-xl">
                <AlertCircle className="h-6 w-6 text-accent-blue" />
              </div>
              <div>
                <p className="font-bold text-accent-blue text-lg">{totalImpaye.toLocaleString('fr-FR')} €</p>
                <p className="text-sm text-light-400">Total à payer</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filtres */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <div>
          <label className="block text-sm font-medium text-light-400 mb-2">Filtrer par bien</label>
          <select 
            value={filterBien} 
            onChange={(e) => setFilterBien(e.target.value)} 
            className="w-full px-4 py-3 bg-dark-900 border border-dark-600/30 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition shadow-card"
          >
            <option value="">Tous les biens</option>
            {biensList.map(bien => (
              <option key={bien.id} value={bien.id}>{bien.adresse}, {bien.ville}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-light-400 mb-2">Filtrer par statut</label>
          <select 
            value={filterStatut} 
            onChange={(e) => setFilterStatut(e.target.value)} 
            className="w-full px-4 py-3 bg-dark-900 border border-dark-600/30 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition shadow-card"
          >
            <option value="">Tous les statuts</option>
            <option value="PAYE">Payé</option>
            <option value="IMPAYE">Impayé</option>
            <option value="RETARD">En retard</option>
          </select>
        </div>
      </div>

      {/* Liste des événements */}
      {filteredEvenements.length === 0 ? (
        <div className="bg-dark-900 rounded-3xl border border-dark-600/30 shadow-card p-20 text-center">
          <Calendar className="h-20 w-20 text-accent-blue/50 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-white mb-2">
            {evenements.length === 0 ? 'Aucun événement fiscal' : 'Aucun événement ne correspond aux filtres'}
          </h3>
          <p className="text-light-300 mb-6">
            {evenements.length === 0 ? "Commencez par ajouter vos premiers événements fiscaux" : "Essayez de modifier vos filtres"}
          </p>
          {evenements.length === 0 && (
            <button 
              onClick={() => setShowForm(true)} 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl"
            >
              <Plus className="h-5 w-5" />
              Ajouter un événement
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {filteredEvenements.map((evenement) => {
            const overdue = isOverdue(evenement.dateEcheance, evenement.estPaye);
            const dueSoon = isDueSoon(evenement.dateEcheance, evenement.estPaye);

            return (
              <div 
                key={evenement.id} 
                className={`bg-dark-900 rounded-2xl border shadow-card hover:shadow-card-hover transition p-6 ${
                  overdue ? 'border-red-500/50 bg-red-500/5' : 
                  dueSoon ? 'border-orange-500/50 bg-orange-500/5' : 
                  evenement.estPaye ? 'border-accent-green/50 bg-accent-green/5' : 
                  'border-dark-600/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full border ${getTypeColor(evenement.type)}`}>
                        {getTypeLabel(evenement.type)}
                      </span>
                      {evenement.estPaye ? (
                        <span className="flex items-center gap-1.5 text-accent-green text-sm font-semibold">
                          <CheckCircle className="h-4 w-4" />
                          Payé
                        </span>
                      ) : overdue ? (
                        <span className="flex items-center gap-1.5 text-red-400 text-sm font-semibold">
                          <AlertCircle className="h-4 w-4" />
                          En retard
                        </span>
                      ) : dueSoon ? (
                        <span className="flex items-center gap-1.5 text-orange-400 text-sm font-semibold">
                          <Clock className="h-4 w-4" />
                          Bientôt
                        </span>
                      ) : null}
                    </div>

                    {evenement.bien && (
                      <p className="text-lg font-bold text-white mb-4">
                        {evenement.bien.adresse}, {evenement.bien.ville}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-light-500 mb-1 font-medium">Échéance</p>
                        <p className="font-semibold text-white">
                          {new Date(evenement.dateEcheance).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      {evenement.montant && (
                        <div>
                          <p className="text-sm text-light-500 mb-1 font-medium">Montant</p>
                          <p className="font-bold text-white text-lg">
                            {evenement.montant.toLocaleString('fr-FR')} €
                          </p>
                        </div>
                      )}
                      {evenement.datePaiement && (
                        <div>
                          <p className="text-sm text-light-500 mb-1 font-medium">Payé le</p>
                          <p className="font-semibold text-accent-green">
                            {new Date(evenement.datePaiement).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      )}
                    </div>

                    {evenement.notes && (
                      <p className="text-sm text-light-400 mt-4 italic bg-dark-950/50 p-3 rounded-xl">{evenement.notes}</p>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button 
                      onClick={() => openEditForm(evenement)} 
                      className="p-2.5 bg-accent-blue/10 hover:bg-accent-blue/20 rounded-xl border border-accent-blue/20 transition"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4 text-accent-blue" />
                    </button>
                    <button 
                      onClick={() => setEvenementToDelete(evenement)} 
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
      )}

      {/* Modal Formulaire */}
      {showForm && (
        <EvenementFiscalForm
          onClose={closeForm}
          onSubmit={evenementToEdit ? handleUpdateEvenement : handleCreateEvenement}
          evenementToEdit={evenementToEdit}
          biensList={biensList}
        />
      )}

      {/* Modal Suppression */}
      {evenementToDelete && (
        <>
          {/* Fond flou */}
          <div className="fixed inset-0 bg-black/60 z-[9998] backdrop-blur-sm" onClick={() => setEvenementToDelete(null)} />
          
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none">
            <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-2xl max-w-md w-full p-6 pointer-events-auto">
              <h3 className="text-xl font-bold text-white mb-4">Supprimer cet événement ?</h3>
              <p className="text-light-300 mb-2">Êtes-vous sûr de vouloir supprimer :</p>
              <p className="font-semibold text-white mb-6">{getTypeLabel(evenementToDelete.type)} - {new Date(evenementToDelete.dateEcheance).toLocaleDateString('fr-FR')}</p>
              <p className="text-sm text-red-400 mb-6">Cette action est irréversible</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setEvenementToDelete(null)} 
                  className="flex-1 px-6 py-3 border border-dark-600 rounded-xl text-light-200 hover:bg-dark-800 transition font-semibold"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => handleDeleteEvenement(evenementToDelete.id)} 
                  className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-xl transition font-semibold"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </PageLayout>
  );
}

export default EvenementsFiscauxPage;
