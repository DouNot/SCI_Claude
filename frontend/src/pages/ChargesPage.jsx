import { useState, useEffect } from 'react';
import { chargesAPI, biensAPI } from '../services/api';
import { DollarSign, Building2, Edit, Trash2, Plus, Calendar, TrendingDown, Eye, X, Check, Download } from 'lucide-react';
import ChargeForm from '../components/ChargeForm';

const TYPES_CHARGE = {
  'COPROPRIETE': 'Copropriété',
  'ASSURANCE_PNO': 'Assurance PNO',
  'ASSURANCE_GLI': 'Assurance GLI',
  'TAXE_FONCIERE': 'Taxe foncière',
  'ENTRETIEN': 'Entretien',
  'GESTION_LOCATIVE': 'Gestion locative',
  'AUTRE': 'Autre',
};

const FREQUENCES = {
  'MENSUELLE': 'Mensuelle',
  'TRIMESTRIELLE': 'Trimestrielle',
  'SEMESTRIELLE': 'Semestrielle',
  'ANNUELLE': 'Annuelle',
  'PONCTUELLE': 'Ponctuelle',
};

function ChargesPage() {
  const [charges, setCharges] = useState([]);
  const [biens, setBiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [chargeToEdit, setChargeToEdit] = useState(null);
  const [chargeToDelete, setChargeToDelete] = useState(null);
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [showPaiementModal, setShowPaiementModal] = useState(false);
  const [paiementData, setPaiementData] = useState({
    datePaiement: new Date().toISOString().split('T')[0],
    montant: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [chargesData, biensData] = await Promise.all([
        chargesAPI.getAll(),
        biensAPI.getAll()
      ]);
      setCharges(chargesData.data);
      setBiens(biensData.data);
      setError(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les charges');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCharge = async (chargeData) => {
    try {
      await chargesAPI.create(chargeData);
      await loadData();
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateCharge = async (id, chargeData) => {
    try {
      await chargesAPI.update(id, chargeData);
      await loadData();
      setChargeToEdit(null);
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteCharge = async (id) => {
    try {
      await chargesAPI.delete(id);
      await loadData();
      setChargeToDelete(null);
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleAddPaiement = async () => {
    try {
      if (!paiementData.montant || !paiementData.datePaiement) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }
      await chargesAPI.addPaiement(selectedCharge.id, paiementData);
      await loadData();
      setShowPaiementModal(false);
      setSelectedCharge(null);
      setPaiementData({
        datePaiement: new Date().toISOString().split('T')[0],
        montant: '',
        notes: '',
      });
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de l\'ajout du paiement');
    }
  };

  const openEditForm = (charge) => {
    setChargeToEdit(charge);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setChargeToEdit(null);
  };

  // Calculer le total annuel des charges
  const calculerTotalAnnuel = () => {
    return charges
      .filter(c => c.estActive)
      .reduce((sum, charge) => {
        let montantAnnuel = 0;
        switch (charge.frequence) {
          case 'MENSUELLE':
            montantAnnuel = charge.montant * 12;
            break;
          case 'TRIMESTRIELLE':
            montantAnnuel = charge.montant * 4;
            break;
          case 'SEMESTRIELLE':
            montantAnnuel = charge.montant * 2;
            break;
          case 'ANNUELLE':
            montantAnnuel = charge.montant;
            break;
          default:
            montantAnnuel = 0;
        }
        return sum + montantAnnuel;
      }, 0);
  };

  // Grouper par bien
  const chargesParBien = charges.reduce((acc, charge) => {
    const bienId = charge.bienId;
    if (!acc[bienId]) {
      acc[bienId] = [];
    }
    acc[bienId].push(charge);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-light-300">Chargement des charges...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800 font-semibold mb-2">Erreur</p>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadData}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const totalAnnuel = calculerTotalAnnuel();

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Header */}
      <div className="bg-dark-900 border-b border-dark-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-light-200 bg-clip-text text-transparent flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-accent-orange" />
                Gestion des Charges
              </h1>
              <p className="text-light-400 mt-1">{charges.length} charge(s)</p>
            </div>
            <div className="flex gap-3">
              <a
                href="http://localhost:3000/api/exports/charges"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-accent-green/10 hover:bg-accent-green/20 text-accent-green rounded-xl font-semibold transition-all border border-accent-green/30"
              >
                <Download className="h-5 w-5" />
                Exporter Excel
              </a>
              <button 
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl"
              >
                <Plus className="h-5 w-5" />
                Ajouter une charge
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-accent-orange/10 rounded-xl border border-accent-orange/20">
                <TrendingDown className="h-6 w-6 text-accent-orange" />
              </div>
              <p className="text-sm text-light-400 font-medium">Total annuel</p>
            </div>
            <p className="text-4xl font-bold text-accent-orange">{totalAnnuel.toLocaleString('fr-FR')} €</p>
            <p className="text-sm text-light-500 mt-2">~{(totalAnnuel / 12).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €/mois</p>
          </div>

          <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-accent-blue/10 rounded-xl border border-accent-blue/20">
                <DollarSign className="h-6 w-6 text-accent-blue" />
              </div>
              <p className="text-sm text-light-400 font-medium">Charges actives</p>
            </div>
            <p className="text-4xl font-bold">{charges.filter(c => c.estActive).length}</p>
          </div>

          <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-accent-green/10 rounded-xl border border-accent-green/20">
                <Building2 className="h-6 w-6 text-accent-green" />
              </div>
              <p className="text-sm text-light-400 font-medium">Biens concernés</p>
            </div>
            <p className="text-4xl font-bold">{Object.keys(chargesParBien).length}</p>
          </div>
        </div>

        {/* Liste des charges par bien */}
        {charges.length === 0 ? (
          <div className="bg-dark-900 rounded-3xl border border-dark-600/30 shadow-card p-20 text-center">
            <DollarSign className="h-20 w-20 text-accent-blue/50 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-light-300 mb-2">
              Aucune charge pour le moment
            </h3>
            <p className="text-light-500 mb-6">
              Commencez par ajouter vos charges récurrentes
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-accent-blue text-white px-6 py-3 rounded-xl hover:bg-accent-blue-light transition font-semibold inline-flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Ajouter une charge
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(chargesParBien).map(([bienId, chargesDuBien]) => {
              const bien = biens.find(b => b.id === bienId);
              if (!bien) return null;

              return (
                <div key={bienId}>
                  <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-3">
                    <Building2 className="h-6 w-6 text-accent-blue" />
                    {bien.adresse}, {bien.ville}
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {chargesDuBien.map(charge => (
                      <div
                        key={charge.id}
                        className={`bg-dark-900 rounded-2xl border ${
                          charge.estActive ? 'border-dark-600/30' : 'border-dark-700/50 opacity-60'
                        } shadow-card p-6 hover:shadow-card-hover transition`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-semibold text-white">{charge.libelle}</h4>
                              <span className="px-3 py-1 bg-accent-blue/20 text-accent-blue text-xs font-semibold rounded-full border border-accent-blue/30">
                                {TYPES_CHARGE[charge.type]}
                              </span>
                              {!charge.estActive && (
                                <span className="px-3 py-1 bg-dark-700 text-light-500 text-xs font-semibold rounded-full">
                                  Inactive
                                </span>
                              )}
                            </div>
                            {charge.notes && (
                              <p className="text-sm text-light-400 mb-3">{charge.notes}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedCharge(charge);
                                setPaiementData(prev => ({ ...prev, montant: charge.montant }));
                                setShowPaiementModal(true);
                              }}
                              className="p-2 bg-accent-green/10 hover:bg-accent-green/20 rounded-xl transition"
                              title="Enregistrer un paiement"
                            >
                              <Check className="h-4 w-4 text-accent-green" />
                            </button>
                            <button
                              onClick={() => openEditForm(charge)}
                              className="p-2 bg-accent-blue/10 hover:bg-accent-blue/20 rounded-xl transition"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4 text-accent-blue" />
                            </button>
                            <button
                              onClick={() => setChargeToDelete(charge)}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div>
                            <p className="text-sm text-light-500 mb-1">Montant</p>
                            <p className="text-white font-bold text-xl">{charge.montant.toLocaleString('fr-FR')} €</p>
                          </div>
                          <div>
                            <p className="text-sm text-light-500 mb-1">Fréquence</p>
                            <p className="text-white font-semibold">{FREQUENCES[charge.frequence]}</p>
                          </div>
                          <div>
                            <p className="text-sm text-light-500 mb-1">Date début</p>
                            <p className="text-white font-semibold">
                              {new Date(charge.dateDebut).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          {charge.jourPaiement && (
                            <div>
                              <p className="text-sm text-light-500 mb-1">Jour de paiement</p>
                              <p className="text-white font-semibold">Le {charge.jourPaiement} du mois</p>
                            </div>
                          )}
                        </div>
                        {charge.paiements && charge.paiements.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-dark-700/50">
                            <p className="text-sm text-light-500 mb-2">Derniers paiements :</p>
                            <div className="space-y-1">
                              {charge.paiements.slice(0, 3).map(paiement => (
                                <div key={paiement.id} className="flex items-center justify-between text-sm">
                                  <span className="text-light-400">
                                    {new Date(paiement.datePaiement).toLocaleDateString('fr-FR')}
                                  </span>
                                  <span className="text-accent-green font-semibold">
                                    {paiement.montant.toLocaleString('fr-FR')} €
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Formulaire */}
      {showForm && (
        <ChargeForm
          onClose={closeForm}
          onSubmit={chargeToEdit ? handleUpdateCharge : handleCreateCharge}
          chargeToEdit={chargeToEdit}
          biensList={biens}
        />
      )}

      {/* Modal Confirmation Suppression */}
      {chargeToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-dark-900 rounded-3xl border border-dark-600/30 shadow-2xl max-w-md w-full p-8">
            <h3 className="text-xl font-bold text-white mb-4">
              Supprimer cette charge ?
            </h3>
            <p className="text-light-400 mb-2">
              Êtes-vous sûr de vouloir supprimer la charge :
            </p>
            <p className="font-semibold text-white mb-4">
              {chargeToDelete.libelle}
            </p>
            <p className="text-sm text-red-400 mb-6">
              Cette action est irréversible et supprimera également l'historique des paiements.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setChargeToDelete(null)}
                className="flex-1 px-6 py-3 bg-dark-800 hover:bg-dark-700 rounded-2xl transition font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteCharge(chargeToDelete.id)}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-2xl transition font-semibold"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Paiement */}
      {showPaiementModal && selectedCharge && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-dark-900 rounded-3xl border border-dark-600/30 shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                Enregistrer un paiement
              </h3>
              <button
                onClick={() => {
                  setShowPaiementModal(false);
                  setSelectedCharge(null);
                }}
                className="text-light-400 hover:text-white transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-light-400 mb-6">{selectedCharge.libelle}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-light-300 mb-2">
                  Date de paiement
                </label>
                <input
                  type="date"
                  value={paiementData.datePaiement}
                  onChange={(e) => setPaiementData(prev => ({ ...prev, datePaiement: e.target.value }))}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-light-300 mb-2">
                  Montant
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={paiementData.montant}
                    onChange={(e) => setPaiementData(prev => ({ ...prev, montant: e.target.value }))}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-light-400">€</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-light-300 mb-2">
                  Notes (optionnel)
                </label>
                <input
                  type="text"
                  value={paiementData.notes}
                  onChange={(e) => setPaiementData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ex: Paiement par virement"
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder:text-light-500 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPaiementModal(false);
                  setSelectedCharge(null);
                }}
                className="flex-1 px-6 py-3 bg-dark-800 hover:bg-dark-700 rounded-2xl transition font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={handleAddPaiement}
                className="flex-1 px-6 py-3 bg-accent-green hover:bg-accent-green/90 rounded-2xl transition font-semibold"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChargesPage;
