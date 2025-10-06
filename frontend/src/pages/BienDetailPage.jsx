import { useState, useEffect } from 'react';
import { biensAPI, bauxAPI, facturesAPI, travauxAPI, documentsAPI, pretsAPI, evenementsFiscauxAPI, locatairesAPI } from '../services/api';
import { ArrowLeft, Edit, MapPin, Home, Calendar, Euro, FileText, Wrench, Users, TrendingUp, Plus, Trash2, Pencil, Eye, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PretForm from '../components/PretForm';
import TravauxForm from '../components/TravauxForm';
import DocumentForm from '../components/DocumentForm';
import BailForm from '../components/BailForm';
import BienForm from '../components/BienForm';

function BienDetailPage({ bienId, onNavigate }) {
  const [bien, setBien] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [baux, setBaux] = useState([]);
  const [factures, setFactures] = useState([]);
  const [travaux, setTravaux] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [prets, setPrets] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [locataires, setLocataires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPretForm, setShowPretForm] = useState(false);
  const [showBailForm, setShowBailForm] = useState(false);
  const [showTravauxForm, setShowTravauxForm] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [showBienForm, setShowBienForm] = useState(false);
  const [pretToEdit, setPretToEdit] = useState(null);
  const [travauxToEdit, setTravauxToEdit] = useState(null);
  const [documentToEdit, setDocumentToEdit] = useState(null);
  const [pretDetails, setPretDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (bienId) {
      loadBienData();
    }
  }, [bienId]);

  const loadBienData = async () => {
    try {
      setLoading(true);
      
      const bienRes = await biensAPI.getById(bienId);
      setBien(bienRes.data);

      const results = await Promise.allSettled([
        bauxAPI.getByBien(bienId),
        facturesAPI.getByBien(bienId),
        travauxAPI.getByBien(bienId),
        documentsAPI.getByBien(bienId),
        pretsAPI.getByBien(bienId),
        evenementsFiscauxAPI.getByBien(bienId),
        locatairesAPI.getAll()
      ]);

      if (results[0].status === 'fulfilled') setBaux(results[0].value.data || []);
      if (results[1].status === 'fulfilled') setFactures(results[1].value.data || []);
      if (results[2].status === 'fulfilled') setTravaux(results[2].value.data || []);
      if (results[3].status === 'fulfilled') setDocuments(results[3].value.data || []);
      if (results[4].status === 'fulfilled') setPrets(results[4].value.data || []);
      if (results[5].status === 'fulfilled') setEvenements(results[5].value.data || []);
      if (results[6].status === 'fulfilled') setLocataires(results[6].value.data || []);

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const names = ['baux', 'factures', 'travaux', 'documents', 'prêts', 'événements', 'locataires'];
          console.warn(`Impossible de charger les ${names[index]}:`, result.reason.message);
        }
      });
    } catch (err) {
      console.error('Erreur chargement données bien:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePret = async (pretData) => {
    try {
      await pretsAPI.create({ ...pretData, bienId });
      await loadBienData();
      setShowPretForm(false);
      setPretToEdit(null);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdatePret = async (id, pretData) => {
    try {
      await pretsAPI.update(id, pretData);
      await loadBienData();
      setShowPretForm(false);
      setPretToEdit(null);
    } catch (err) {
      throw err;
    }
  };

  const handleDeletePret = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce prêt ?')) {
      try {
        await pretsAPI.delete(id);
        await loadBienData();
      } catch (err) {
        console.error('Erreur suppression:', err);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const viewPretDetails = async (pret) => {
    try {
      setLoadingDetails(true);
      const response = await pretsAPI.getById(pret.id);
      setPretDetails(response.data);
    } catch (err) {
      console.error('Erreur:', err);
      alert('Impossible de charger les détails du prêt');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCreateTravaux = async (travauxData) => {
    try {
      await travauxAPI.create({ ...travauxData, bienId });
      await loadBienData();
      setShowTravauxForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleCreateDocument = async (documentData) => {
    try {
      await documentsAPI.create({ ...documentData, bienId });
      await loadBienData();
      setShowDocumentForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleCreateBail = async (bailData) => {
    try {
      await bauxAPI.create({ ...bailData, bienId });
      await loadBienData();
      setShowBailForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateBien = async (id, bienData) => {
    try {
      await biensAPI.update(id, bienData);
      await loadBienData();
      setShowBienForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteBien = async () => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ce bien ?\n\n${bien.adresse}, ${bien.ville}\n\n⚠️ Cette action est irréversible et supprimera également tous les baux, documents et travaux associés !`)) {
      try {
        await biensAPI.delete(bienId);
        onNavigate('biens'); // Retour à la liste des biens
      } catch (err) {
        console.error('Erreur suppression:', err);
        alert('Erreur lors de la suppression du bien');
      }
    }
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: Home },
    { id: 'prets', label: 'Prêts', icon: TrendingUp },
    { id: 'locataire', label: 'Locataire', icon: Users },
    { id: 'travaux', label: 'Travaux', icon: Wrench },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-dark-950">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  if (!bien) {
    return (
      <div className="flex items-center justify-center h-full bg-dark-950 text-white">
        <p>Bien introuvable</p>
      </div>
    );
  }

  const bailActif = baux.find(b => b.statut === 'ACTIF');
  const photoUrl = bien.photos?.find(p => p.estPrincipale)?.url || bien.photos?.[0]?.url;

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Header fixe */}
      <div className="sticky top-0 z-10 bg-dark-950/95 backdrop-blur-sm border-b border-dark-700/50">
        <div className="max-w-[1600px] mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigate('biens')}
              className="flex items-center gap-2 text-light-400 hover:text-white transition-all hover:gap-3"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Retour aux biens</span>
            </button>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowBienForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-dark-900 hover:bg-dark-800 rounded-2xl border border-dark-600/30 transition shadow-card"
              >
                <Edit className="h-4 w-4 text-accent-blue" />
                <span className="font-semibold">Modifier</span>
              </button>
              
              <button 
                onClick={handleDeleteBien}
                className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 rounded-2xl border border-red-500/30 transition shadow-card"
              >
                <Trash2 className="h-4 w-4 text-red-400" />
                <span className="font-semibold text-red-400">Supprimer</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 py-10">
        
        {/* Carousel photos */}
        <div className="mb-10">
          <div className="bg-dark-900 rounded-3xl border border-dark-600/30 shadow-card overflow-hidden" style={{ height: '400px' }}>
            {photoUrl ? (
              <img
                src={`http://localhost:3000${photoUrl}`}
                alt={bien.adresse}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-800 to-dark-700">
                <Home className="h-24 w-24 text-accent-blue/40" />
              </div>
            )}
          </div>
        </div>

        {/* Onglets */}
        <div className="mb-10">
          <div className="flex gap-3 border-b border-dark-700/50 overflow-x-auto pb-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all relative whitespace-nowrap rounded-t-xl ${
                    activeTab === tab.id
                      ? 'text-accent-blue bg-dark-900'
                      : 'text-light-400 hover:text-white hover:bg-dark-900/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenu des onglets */}
        <div>
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informations principales */}
              <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card p-6">
                <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                  <div className="p-2 bg-accent-blue/10 rounded-lg">
                    <MapPin className="h-5 w-5 text-accent-blue" />
                  </div>
                  Adresse
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-light-500 mb-1 font-medium">Adresse complète</p>
                    <p className="text-white font-semibold text-lg">{bien.adresse}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-light-500 mb-1 font-medium">Code postal</p>
                      <p className="text-white font-semibold">{bien.codePostal}</p>
                    </div>
                    <div>
                      <p className="text-sm text-light-500 mb-1 font-medium">Ville</p>
                      <p className="text-white font-semibold">{bien.ville}</p>
                    </div>
                  </div>
                  {bien.complement && (
                    <div>
                      <p className="text-sm text-light-500 mb-1 font-medium">Complément</p>
                      <p className="text-white font-semibold">{bien.complement}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Valeurs */}
              <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card p-6">
                <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                  <div className="p-2 bg-accent-green/10 rounded-lg">
                    <Euro className="h-5 w-5 text-accent-green" />
                  </div>
                  Valeurs
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-light-500 mb-1 font-medium">Prix d'achat</p>
                    <p className="text-white font-bold text-2xl">{bien.prixAchat.toLocaleString('fr-FR')} €</p>
                  </div>
                  <div>
                    <p className="text-sm text-light-500 mb-1 font-medium">Valeur actuelle</p>
                    <p className="text-white font-bold text-2xl">{(bien.valeurActuelle || bien.prixAchat).toLocaleString('fr-FR')} €</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dark-700/50">
                    <div>
                      <p className="text-sm text-light-500 mb-1 font-medium">Frais notaire</p>
                      <p className="text-white font-semibold">{(bien.fraisNotaire || 0).toLocaleString('fr-FR')} €</p>
                    </div>
                    {bien.loyerActuel && bien.loyerActuel > 0 && (
                      <div>
                        <p className="text-sm text-light-500 mb-1 font-medium">Loyer actuel HC</p>
                        <p className="text-accent-green font-bold">{bien.loyerActuel.toLocaleString('fr-FR')} €/mois</p>
                      </div>
                    )}
                    {bien.chargesActuelles && bien.chargesActuelles > 0 && (
                      <div>
                        <p className="text-sm text-light-500 mb-1 font-medium">Charges actuelles</p>
                        <p className="text-white font-semibold">{bien.chargesActuelles.toLocaleString('fr-FR')} €/mois</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Caractéristiques */}
              <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card p-6">
                <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                  <div className="p-2 bg-accent-purple/10 rounded-lg">
                    <Home className="h-5 w-5 text-accent-purple" />
                  </div>
                  Caractéristiques
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-light-500 mb-1 font-medium">Type</p>
                    <p className="text-white font-semibold">{bien.type.replace(/_/g, ' ')}</p>
                  </div>
                  {bien.surface && (
                    <div>
                      <p className="text-sm text-light-500 mb-1 font-medium">Surface</p>
                      <p className="text-white font-semibold">{bien.surface} m²</p>
                    </div>
                  )}
                  {bien.nombrePieces && (
                    <div>
                      <p className="text-sm text-light-500 mb-1 font-medium">Nombre de pièces</p>
                      <p className="text-white font-semibold">{bien.nombrePieces}</p>
                    </div>
                  )}
                  {bien.anneeConstruction && (
                    <div>
                      <p className="text-sm text-light-500 mb-1 font-medium">Année construction</p>
                      <p className="text-white font-semibold">{bien.anneeConstruction}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card p-6">
                <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                  <div className="p-2 bg-accent-orange/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-accent-orange" />
                  </div>
                  Dates importantes
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-light-500 mb-1 font-medium">Date d'achat</p>
                    <p className="text-white font-semibold">
                      {new Date(bien.dateAchat).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  {bien.dateDisponibilite && (
                    <div>
                      <p className="text-sm text-light-500 mb-1 font-medium">Date de disponibilité</p>
                      <p className="text-white font-semibold">
                        {new Date(bien.dateDisponibilite).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Locataire actuel */}
              {bien.locataireActuel && (
                <div className="lg:col-span-2 bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card p-6">
                  <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                    <div className="p-2 bg-accent-blue/10 rounded-lg">
                      <Users className="h-5 w-5 text-accent-blue" />
                    </div>
                    Locataire actuel
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-light-500 mb-1 font-medium">
                        {bien.locataireActuel.typeLocataire === 'ENTREPRISE' ? 'Raison sociale' : 'Nom'}
                      </p>
                      <p className="text-white font-bold text-xl">
                        {bien.locataireActuel.typeLocataire === 'ENTREPRISE' 
                          ? bien.locataireActuel.raisonSociale 
                          : `${bien.locataireActuel.prenom} ${bien.locataireActuel.nom}`}
                      </p>
                    </div>
                    {bien.bailActif && (
                      <>
                        <div>
                          <p className="text-sm text-light-500 mb-1 font-medium">Loyer mensuel HC</p>
                          <p className="text-accent-green font-bold text-xl">
                            {bien.bailActif.loyerHC.toLocaleString('fr-FR')} €
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-light-500 mb-1 font-medium">Début du bail</p>
                          <p className="text-white font-semibold">
                            {new Date(bien.bailActif.dateDebut).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </>
                    )}
                    {bien.locataireActuel.email && (
                      <div>
                        <p className="text-sm text-light-500 mb-1 font-medium">Email</p>
                        <p className="text-white font-medium">{bien.locataireActuel.email}</p>
                      </div>
                    )}
                    {bien.locataireActuel.telephone && (
                      <div>
                        <p className="text-sm text-light-500 mb-1 font-medium">Téléphone</p>
                        <p className="text-white font-medium">{bien.locataireActuel.telephone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'prets' && (
            <div className="space-y-6">
              {/* Header avec bouton */}
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Prêts immobiliers</h3>
                <button
                  onClick={() => {
                    setPretToEdit(null);
                    setShowPretForm(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl shadow-accent-blue/30 hover:shadow-2xl hover:shadow-accent-blue/40 hover:scale-105"
                >
                  <Plus className="h-5 w-5" />
                  Ajouter un prêt
                </button>
              </div>

              {/* Liste des prêts */}
              {prets.length > 0 ? (
                <div className="space-y-4">
                  {prets.map(pret => {
                    const moisEcoules = Math.floor((new Date() - new Date(pret.dateDebut)) / (1000 * 60 * 60 * 24 * 30));
                    const moisRestants = Math.max(0, (pret.duree) - moisEcoules);
                    const montant = parseFloat(pret.montant || 0);
                    const tauxMensuel = (parseFloat(pret.taux || 0) / 100) / 12;
                    const mensualite = montant * (tauxMensuel * Math.pow(1 + tauxMensuel, pret.duree)) / (Math.pow(1 + tauxMensuel, pret.duree) - 1);
                    const capitalRestant = mensualite * moisRestants;

                    return (
                      <div key={pret.id} className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card p-6 hover:shadow-card-hover transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="text-lg font-semibold">{pret.organisme}</h4>
                          <div className="flex gap-2">
                            <button
                              onClick={() => viewPretDetails(pret)}
                              className="p-2 bg-accent-green/10 hover:bg-accent-green/20 rounded-xl transition"
                              title="Voir détails"
                            >
                              <Eye className="h-4 w-4 text-accent-green" />
                            </button>
                            <button
                              onClick={() => {
                                setPretToEdit(pret);
                                setShowPretForm(true);
                              }}
                              className="p-2 bg-accent-blue/10 hover:bg-accent-blue/20 rounded-xl transition"
                              title="Modifier"
                            >
                              <Pencil className="h-4 w-4 text-accent-blue" />
                            </button>
                            <button
                              onClick={() => handleDeletePret(pret.id)}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div>
                            <p className="text-sm text-light-500 mb-2 font-medium">Montant emprunté</p>
                            <p className="text-white font-bold text-xl">{(pret.montant || 0).toLocaleString('fr-FR')} €</p>
                          </div>
                          <div>
                            <p className="text-sm text-light-500 mb-2 font-medium">Mensualité</p>
                            <p className="text-white font-bold text-xl">{(mensualite || 0).toLocaleString('fr-FR')} €</p>
                          </div>
                          <div>
                            <p className="text-sm text-light-500 mb-2 font-medium">Taux</p>
                            <p className="text-accent-blue font-bold text-xl">{pret.taux || 0}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-light-500 mb-2 font-medium">Capital restant</p>
                            <p className="text-accent-orange font-bold text-xl">{(capitalRestant || 0).toLocaleString('fr-FR')} €</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-dark-900 rounded-3xl border border-dark-600/30 shadow-card p-20 text-center">
                  <TrendingUp className="h-20 w-20 text-accent-blue/50 mx-auto mb-6" />
                  <p className="text-light-300 text-xl mb-4">Aucun prêt</p>
                  <p className="text-light-500">Ajoutez un prêt pour suivre vos financements immobiliers</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'locataire' && (
            <div className="space-y-6">
              {/* Header avec bouton */}
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Locataire actuel</h3>
                {!bailActif && (
                  <button
                    onClick={() => setShowBailForm(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl shadow-accent-blue/30 hover:shadow-2xl hover:shadow-accent-blue/40 hover:scale-105"
                  >
                    <Plus className="h-5 w-5" />
                    Ajouter un locataire
                  </button>
                )}
              </div>

              {bailActif ? (
                <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card p-6">
                  <h3 className="text-lg font-semibold mb-4">Locataire actuel</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-light-500">Nom</p>
                      <p className="text-white font-medium text-xl">{bailActif.locataire?.nom}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-light-500">Loyer HC</p>
                        <p className="text-accent-green font-semibold">{bailActif.loyerHC.toLocaleString('fr-FR')} €</p>
                      </div>
                      <div>
                        <p className="text-sm text-light-500">Charges</p>
                        <p className="text-white font-medium">{(bailActif.charges || 0).toLocaleString('fr-FR')} €</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-light-500">Début du bail</p>
                        <p className="text-white font-medium">{new Date(bailActif.dateDebut).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-light-500">Fin du bail</p>
                        <p className="text-white font-medium">{new Date(bailActif.dateFin).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-dark-900 rounded-3xl border border-dark-600/30 shadow-card p-20 text-center">
                  <Users className="h-20 w-20 text-accent-blue/50 mx-auto mb-6" />
                  <p className="text-light-300 text-xl mb-4">Aucun locataire actif</p>
                  <p className="text-light-500">Créez un bail depuis la page Locataires</p>
                </div>
              )}

              {baux.length > 0 && (
                <div className="mt-6 bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card p-6">
                  <h3 className="text-lg font-semibold mb-4">Historique des baux</h3>
                  <div className="space-y-3">
                    {baux.map(bail => (
                      <div key={bail.id} className="flex items-center justify-between p-4 bg-dark-800 rounded-xl border border-dark-700/50">
                        <div>
                          <p className="text-white font-medium">{bail.locataire?.nom}</p>
                          <p className="text-sm text-light-400">
                            {new Date(bail.dateDebut).toLocaleDateString('fr-FR')} - 
                            {bail.dateFin ? new Date(bail.dateFin).toLocaleDateString('fr-FR') : 'En cours'}
                          </p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-xs font-semibold ${
                          bail.statut === 'ACTIF' ? 'bg-accent-green/20 text-accent-green border border-accent-green/30' : 'bg-dark-700 text-light-400'
                        }`}>
                          {bail.statut}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'travaux' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Travaux</h3>
                <button
                  onClick={() => setShowTravauxForm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl shadow-accent-blue/30 hover:shadow-2xl hover:shadow-accent-blue/40 hover:scale-105"
                >
                  <Plus className="h-5 w-5" />
                  Ajouter des travaux
                </button>
              </div>

              {travaux.length > 0 ? (
                <div className="space-y-4">
                  {travaux.map(t => (
                    <div key={t.id} className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold">{t.description}</h4>
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          t.statut === 'TERMINE' ? 'bg-accent-green/20 text-accent-green border border-accent-green/30' :
                          t.statut === 'EN_COURS' ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30' :
                          'bg-dark-700 text-light-400'
                        }`}>
                          {t.statut}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-light-500 mb-1">Date</p>
                          <p className="text-white font-medium">
                            {t.dateDebut ? new Date(t.dateDebut).toLocaleDateString('fr-FR') : 'Non planifié'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-light-500 mb-1">Coût</p>
                          <p className="text-white font-bold text-lg">{(t.coutReel || t.coutEstime || 0).toLocaleString('fr-FR')} €</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-dark-900 rounded-3xl border border-dark-600/30 shadow-card p-20 text-center">
                  <Wrench className="h-20 w-20 text-accent-blue/50 mx-auto mb-6" />
                  <p className="text-light-300 text-xl mb-4">Aucun travaux</p>
                  <p className="text-light-500">Ajoutez des travaux pour suivre les rénovations</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Documents</h3>
                <button
                  onClick={() => setShowDocumentForm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl shadow-accent-blue/30 hover:shadow-2xl hover:shadow-accent-blue/40 hover:scale-105"
                >
                  <Plus className="h-5 w-5" />
                  Ajouter un document
                </button>
              </div>

              {documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-center gap-4 p-5 bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card hover:shadow-card-hover transition cursor-pointer">
                      <div className="p-3 bg-accent-blue/10 rounded-xl">
                        <FileText className="h-8 w-8 text-accent-blue" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{doc.nom}</p>
                        <p className="text-sm text-light-400">{doc.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-dark-900 rounded-3xl border border-dark-600/30 shadow-card p-20 text-center">
                  <FileText className="h-20 w-20 text-accent-blue/50 mx-auto mb-6" />
                  <p className="text-light-300 text-xl mb-4">Aucun document</p>
                  <p className="text-light-500">Ajoutez des documents pour organiser vos fichiers</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showPretForm && (
        <PretForm
          onClose={() => {
            setShowPretForm(false);
            setPretToEdit(null);
          }}
          onSubmit={pretToEdit ? handleUpdatePret : handleCreatePret}
          pretToEdit={pretToEdit}
          biensList={[bien]}
        />
      )}

      {showTravauxForm && (
        <TravauxForm
          onClose={() => setShowTravauxForm(false)}
          onSubmit={handleCreateTravaux}
          biensList={[bien]}
        />
      )}

      {showDocumentForm && (
        <DocumentForm
          onClose={() => setShowDocumentForm(false)}
          onSubmit={handleCreateDocument}
          biensList={[bien]}
        />
      )}

      {showBailForm && (
        <BailForm
          onClose={() => setShowBailForm(false)}
          onSubmit={handleCreateBail}
          biensList={[bien]}
          locatairesList={locataires}
          onLocataireCreated={loadBienData}
        />
      )}

      {showBienForm && (
        <BienForm
          onClose={() => setShowBienForm(false)}
          onSubmit={handleUpdateBien}
          bienToEdit={bien}
        />
      )}

      {/* Modal Détails du prêt avec tableau d'amortissement */}
      {pretDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-dark-900 rounded-3xl border border-dark-600/30 shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-dark-900/95 backdrop-blur-sm border-b border-dark-700/50 px-8 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                Détails du prêt - {pretDetails.organisme}
              </h2>
              <button 
                onClick={() => setPretDetails(null)} 
                className="text-light-400 hover:text-white transition p-2 hover:bg-dark-800 rounded-xl"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-8 space-y-8">
              {/* Résumé */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-accent-blue/20 to-accent-blue/5 border border-accent-blue/30 rounded-2xl p-5">
                  <p className="text-sm text-accent-blue font-medium mb-2">Mensualité totale</p>
                  <p className="text-2xl font-bold text-white">
                    {pretDetails.amortissement.mensualiteTotale.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </p>
                </div>
                <div className="bg-gradient-to-br from-accent-green/20 to-accent-green/5 border border-accent-green/30 rounded-2xl p-5">
                  <p className="text-sm text-accent-green font-medium mb-2">Coût total</p>
                  <p className="text-2xl font-bold text-white">
                    {pretDetails.amortissement.coutTotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </p>
                </div>
                <div className="bg-gradient-to-br from-accent-orange/20 to-accent-orange/5 border border-accent-orange/30 rounded-2xl p-5">
                  <p className="text-sm text-accent-orange font-medium mb-2">Coût intérêts</p>
                  <p className="text-2xl font-bold text-white">
                    {pretDetails.amortissement.coutInterets.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </p>
                </div>
                <div className="bg-gradient-to-br from-accent-purple/20 to-accent-purple/5 border border-accent-purple/30 rounded-2xl p-5">
                  <p className="text-sm text-accent-purple font-medium mb-2">Coût assurance</p>
                  <p className="text-2xl font-bold text-white">
                    {pretDetails.amortissement.coutAssurance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </p>
                </div>
              </div>

              {/* Graphique d'évolution */}
              <div className="bg-dark-800 rounded-2xl border border-dark-700/50 p-6">
                <h3 className="text-xl font-bold text-white mb-6">
                  Évolution Capital / Intérêts
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={pretDetails.amortissement.tableau.filter((_, index) => index % Math.ceil(pretDetails.amortissement.tableau.length / 50) === 0)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="mois" 
                      label={{ value: 'Mois', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF' }}
                    />
                    <YAxis 
                      label={{ value: 'Montant (€)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
                      tickFormatter={(value) => value.toLocaleString('fr-FR')}
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF' }}
                    />
                    <Tooltip 
                      formatter={(value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'}
                      labelFormatter={(label) => `Mois ${label}`}
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '12px', color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                    <Line 
                      type="monotone" 
                      dataKey="capitalRestant" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="Capital restant dû"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="capitalAmortiCumule" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="Capital amorti cumulé"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="interets" 
                      stroke="#f97316" 
                      strokeWidth={3}
                      name="Intérêts"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Tableau d'amortissement */}
              <div className="bg-dark-800 rounded-2xl border border-dark-700/50 p-6">
                <h3 className="text-xl font-bold text-white mb-6">
                  Tableau d'amortissement
                </h3>
                <div className="overflow-x-auto rounded-xl border border-dark-700/50">
                  <table className="min-w-full">
                    <thead className="bg-dark-700/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-light-300 uppercase tracking-wider">Mois</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-light-300 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-light-300 uppercase tracking-wider">Mensualité</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-light-300 uppercase tracking-wider">Capital</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-light-300 uppercase tracking-wider">Intérêts</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-light-300 uppercase tracking-wider">Assurance</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-light-300 uppercase tracking-wider">Restant dû</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-700/50">
                      {pretDetails.amortissement.tableau.map((ligne, index) => (
                        <tr key={ligne.mois} className={index % 2 === 0 ? 'bg-dark-800' : 'bg-dark-800/50'}>
                          <td className="px-6 py-4 text-sm font-semibold text-white">{ligne.mois}</td>
                          <td className="px-6 py-4 text-sm text-light-300">
                            {new Date(ligne.date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 text-sm text-white text-right font-medium">
                            {ligne.mensualite.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </td>
                          <td className="px-6 py-4 text-sm text-accent-green text-right font-bold">
                            {ligne.capital.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </td>
                          <td className="px-6 py-4 text-sm text-accent-orange text-right font-semibold">
                            {ligne.interets.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </td>
                          <td className="px-6 py-4 text-sm text-accent-purple text-right font-semibold">
                            {ligne.assurance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </td>
                          <td className="px-6 py-4 text-sm text-accent-blue text-right font-bold">
                            {ligne.capitalRestant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-dark-900/95 backdrop-blur-sm border-t border-dark-700/50 px-8 py-6">
              <button
                onClick={() => setPretDetails(null)}
                className="w-full px-6 py-4 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl text-white font-bold transition-all shadow-xl shadow-accent-blue/30 hover:shadow-2xl hover:shadow-accent-blue/40"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BienDetailPage;
