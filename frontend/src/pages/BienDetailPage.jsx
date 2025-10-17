import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { biensAPI, bauxAPI, facturesAPI, travauxAPI, documentsAPI, pretsAPI, evenementsFiscauxAPI, locatairesAPI } from '../services/api';
import { ArrowLeft, Edit, MapPin, Home, Calendar, Euro, FileText, Wrench, Users, TrendingUp, Plus, Trash2, Pencil, Eye, X, Download, Mail, Building2, Warehouse, Car, TreePine } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PretForm from '../components/PretForm';
import TravauxForm from '../components/TravauxForm';
import DocumentForm from '../components/DocumentForm';
import BailForm from '../components/BailForm';
import BienForm from '../components/BienForm';
import QuittanceForm from '../components/QuittanceForm';
import LocataireForm from '../components/LocataireForm';
import ResilierBailModal from '../components/ResilierBailModal';

function BienDetailPage() {
  const { id: bienId } = useParams();
  const navigate = useNavigate();
  const [bien, setBien] = useState(null);
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
  const [showQuittanceForm, setShowQuittanceForm] = useState(false);
  const [showLocataireForm, setShowLocataireForm] = useState(false);
  const [showResilierBailModal, setShowResilierBailModal] = useState(false);
  const [pretToEdit, setPretToEdit] = useState(null);
  const [travauxToEdit, setTravauxToEdit] = useState(null);
  const [documentToEdit, setDocumentToEdit] = useState(null);
  const [pretDetails, setPretDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Références pour le scroll automatique
  const generalRef = useRef(null);
  const pretsRef = useRef(null);
  const locataireRef = useRef(null);
  const travauxRef = useRef(null);
  const documentsRef = useRef(null);

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

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      setLoadingDetails(false);
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
        navigate('/biens');
      } catch (err) {
        console.error('Erreur suppression:', err);
        alert('Erreur lors de la suppression du bien');
      }
    }
  };

  const handleUpdateLocataire = async (id, locataireData) => {
    try {
      await locatairesAPI.update(id, locataireData);
      await loadBienData();
      setShowLocataireForm(false);
    } catch (err) {
      throw err;
    }
  };

  const navButtons = [
    { ref: generalRef, label: 'Général', icon: Home },
    { ref: pretsRef, label: 'Prêts', icon: TrendingUp, count: prets.length },
    { ref: locataireRef, label: 'Locataire', icon: Users },
    { ref: travauxRef, label: 'Travaux', icon: Wrench, count: travaux.length },
    { ref: documentsRef, label: 'Documents', icon: FileText, count: documents.length }
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
  const photoUrl = bien.photos?.find(p => p.isPrimary)?.url || bien.photos?.[0]?.url;

  // Icônes selon le type de bien (comme dans BiensCard)
  const typeIcons = {
    APPARTEMENT: Home,
    MAISON: Home,
    LOCAL_COMMERCIAL: Building2,
    BUREAUX: Building2,
    HANGAR: Warehouse,
    PARKING: Car,
    TERRAIN: TreePine
  };
  const PlaceholderIcon = typeIcons[bien.type] || Home;

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Header fixe */}
      <div className="sticky top-0 z-20 bg-dark-950/95 backdrop-blur-sm border-b border-dark-700/50">
        <div className="max-w-[1600px] mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/biens')}
              className="flex items-center gap-2 text-light-400 hover:text-white transition-all hover:gap-3"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Retour aux biens</span>
            </button>

            <div className="flex gap-3">
              <a
                href={`http://localhost:3000/api/exports/bien/${bienId}/bilan`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-accent-green/10 hover:bg-accent-green/20 rounded-2xl border border-accent-green/30 transition shadow-card"
              >
                <Download className="h-4 w-4 text-accent-green" />
                <span className="font-semibold text-accent-green">Bilan PDF</span>
              </a>
              
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

      {/* Navigation flottante */}
      <div className="sticky top-20 z-10 bg-dark-950/80 backdrop-blur-md border-b border-dark-700/50">
        <div className="max-w-[1600px] mx-auto px-8 py-4">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {navButtons.map(({ ref, label, icon: Icon, count }) => (
              <button
                key={label}
                onClick={() => scrollToSection(ref)}
                className="flex items-center gap-2 px-5 py-2.5 bg-dark-900 hover:bg-dark-800 rounded-xl border border-dark-600/30 transition shadow-card whitespace-nowrap"
              >
                <Icon className="h-4 w-4 text-accent-blue" />
                <span className="font-semibold text-sm">{label}</span>
                {count !== undefined && count > 0 && (
                  <span className="px-2 py-0.5 bg-accent-blue/20 text-accent-blue text-xs font-bold rounded-full">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 py-10">
        
        {/* Photo du bien */}
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
                <PlaceholderIcon className="h-24 w-24 text-accent-blue/40" />
              </div>
            )}
          </div>
        </div>

        {/* Section Général */}
        <div ref={generalRef} className="mb-16 scroll-mt-32">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-light-200 bg-clip-text text-transparent">
            Informations générales
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Adresse */}
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
              </div>
            </div>
          </div>
        </div>

        {/* Section Prêts */}
        <div ref={pretsRef} className="mb-16 scroll-mt-32">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-light-200 bg-clip-text text-transparent">
              Prêts immobiliers
            </h2>
            <button
              onClick={() => {
                setPretToEdit(null);
                setShowPretForm(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl"
            >
              <Plus className="h-5 w-5" />
              Ajouter un prêt
            </button>
          </div>

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
                  <div key={pret.id} className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-lg font-semibold">{pret.organisme}</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewPretDetails(pret)}
                          className="p-2 bg-accent-green/10 hover:bg-accent-green/20 rounded-xl transition"
                        >
                          <Eye className="h-4 w-4 text-accent-green" />
                        </button>
                        <button
                          onClick={() => {
                            setPretToEdit(pret);
                            setShowPretForm(true);
                          }}
                          className="p-2 bg-accent-blue/10 hover:bg-accent-blue/20 rounded-xl transition"
                        >
                          <Pencil className="h-4 w-4 text-accent-blue" />
                        </button>
                        <button
                          onClick={() => handleDeletePret(pret.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition"
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

        {/* Section Locataire */}
        <div ref={locataireRef} className="mb-16 scroll-mt-32">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-light-200 bg-clip-text text-transparent">
              Locataire actuel
            </h2>
            {!bailActif && (
              <button
                onClick={() => setShowBailForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl"
              >
                <Plus className="h-5 w-5" />
                Ajouter un locataire
              </button>
            )}
          </div>

          {bailActif ? (
            <div className="space-y-4">
              <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-sm text-light-500">Nom</p>
                      <p className="text-white font-medium text-xl">
                        {bailActif.locataire?.typeLocataire === 'ENTREPRISE' 
                          ? bailActif.locataire?.raisonSociale 
                          : `${bailActif.locataire?.prenom} ${bailActif.locataire?.nom}`}
                      </p>
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
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowLocataireForm(true)}
                      className="p-2 bg-accent-blue/10 hover:bg-accent-blue/20 rounded-xl border border-accent-blue/20 transition"
                      title="Modifier le locataire"
                    >
                      <Pencil className="h-4 w-4 text-accent-blue" />
                    </button>
                    <button
                      onClick={() => setShowResilierBailModal(true)}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/20 text-red-400 font-medium text-sm transition"
                      title="Résilier le bail"
                    >
                      Résilier
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Bouton générer quittance/facture */}
              <button
                onClick={() => setShowQuittanceForm(true)}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 hover:from-accent-blue/30 hover:to-accent-purple/30 border border-accent-blue/30 rounded-2xl text-accent-blue font-semibold transition-all shadow-card hover:shadow-card-hover"
              >
                <FileText className="h-5 w-5" />
                {bailActif.locataire?.typeLocataire === 'ENTREPRISE' 
                  ? 'Générer une facture' 
                  : 'Générer une quittance de loyer'}
              </button>
            </div>
          ) : (
            <div className="bg-dark-900 rounded-3xl border border-dark-600/30 shadow-card p-20 text-center">
              <Users className="h-20 w-20 text-accent-blue/50 mx-auto mb-6" />
              <p className="text-light-300 text-xl mb-4">Aucun locataire actif</p>
              <p className="text-light-500">Créez un bail depuis la page Locataires</p>
            </div>
          )}
        </div>

        {/* Section Travaux */}
        <div ref={travauxRef} className="mb-16 scroll-mt-32">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-light-200 bg-clip-text text-transparent">
              Travaux
            </h2>
            <button
              onClick={() => setShowTravauxForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl"
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

        {/* Section Documents */}
        <div ref={documentsRef} className="mb-16 scroll-mt-32">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-light-200 bg-clip-text text-transparent">
              Documents
            </h2>
            <button
              onClick={() => setShowDocumentForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl"
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

      {/* Modal Génération Quittance */}
      {showQuittanceForm && bailActif && (
        <QuittanceForm
          onClose={() => setShowQuittanceForm(false)}
          bail={bailActif}
        />
      )}

      {/* Modal Modification Locataire */}
      {showLocataireForm && bailActif && (
        <LocataireForm
          onClose={() => setShowLocataireForm(false)}
          onSubmit={handleUpdateLocataire}
          locataireToEdit={bailActif.locataire}
        />
      )}

      {/* Modal Résilier Bail */}
      {showResilierBailModal && bailActif && (
        <ResilierBailModal
          bail={bailActif}
          onClose={() => setShowResilierBailModal(false)}
          onSuccess={() => {
            setShowResilierBailModal(false);
            loadBienData();
          }}
        />
      )}

      {/* Modal Détails du prêt avec tableau d'amortissement */}
      {(pretDetails || loadingDetails) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setPretDetails(null)}>
          <div className="bg-dark-900 rounded-3xl border border-dark-600/30 max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {loadingDetails ? (
              <div className="p-20 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-blue mx-auto"></div>
                <p className="text-light-300 mt-6">Chargement des détails...</p>
              </div>
            ) : pretDetails ? (
              <>
                {/* Header */}
                <div className="sticky top-0 bg-dark-900 border-b border-dark-700 px-8 py-6 flex items-center justify-between z-10">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Détails du prêt</h2>
                    <p className="text-light-400">{pretDetails.organisme}</p>
                  </div>
                  <button
                    onClick={() => setPretDetails(null)}
                    className="p-3 hover:bg-dark-800 rounded-xl transition"
                  >
                    <X className="h-6 w-6 text-light-400" />
                  </button>
                </div>

                {/* Résumé */}
                <div className="p-8 border-b border-dark-700">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm text-light-500 mb-2">Montant emprunté</p>
                      <p className="text-white font-bold text-2xl">{(pretDetails.montant || 0).toLocaleString('fr-FR')} €</p>
                    </div>
                    <div>
                      <p className="text-sm text-light-500 mb-2">Taux annuel</p>
                      <p className="text-accent-blue font-bold text-2xl">{pretDetails.taux || 0}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-light-500 mb-2">Durée</p>
                      <p className="text-white font-bold text-2xl">{pretDetails.duree || 0} mois</p>
                    </div>
                    <div>
                      <p className="text-sm text-light-500 mb-2">Mensualité</p>
                      <p className="text-accent-green font-bold text-2xl">{(pretDetails.mensualite || 0).toLocaleString('fr-FR')} €</p>
                    </div>
                  </div>
                </div>

                {/* Graphique */}
                <div className="p-8 border-b border-dark-700">
                  <h3 className="text-xl font-bold text-white mb-6">Évolution du capital</h3>
                  <div className="h-80 bg-dark-950/50 rounded-2xl p-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={pretDetails.amortissement?.tableau?.filter((_, i) => i % 12 === 0) || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="mois" 
                          stroke="#9CA3AF"
                          label={{ value: 'Années', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
                        />
                        <YAxis 
                          stroke="#9CA3AF"
                          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1a1a1a', 
                            border: '1px solid #374151',
                            borderRadius: '0.75rem',
                            color: '#fff'
                          }}
                          formatter={(value) => [`${value.toLocaleString('fr-FR')} €`, '']}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="capitalRestant" 
                          name="Capital restant"
                          stroke="#f59e0b" 
                          strokeWidth={3}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="capitalAmortiCumule" 
                          name="Capital amorti"
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tableau d'amortissement */}
                <div className="p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Tableau d'amortissement</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-dark-700">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-light-400">Mois</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-light-400">Mensualité</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-light-400">Capital</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-light-400">Intérêts</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-light-400">Assurance</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-light-400">Capital restant</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pretDetails.amortissement?.tableau?.map((ligne, index) => (
                          <tr key={index} className="border-b border-dark-800 hover:bg-dark-800/30 transition">
                            <td className="py-3 px-4 text-white font-medium">{ligne.mois}</td>
                            <td className="py-3 px-4 text-right text-white">{ligne.mensualite.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                            <td className="py-3 px-4 text-right text-accent-green">{ligne.capital.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                            <td className="py-3 px-4 text-right text-accent-orange">{ligne.interets.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                            <td className="py-3 px-4 text-right text-light-400">{(ligne.assurance || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                            <td className="py-3 px-4 text-right text-white font-semibold">{ligne.capitalRestant.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totaux */}
                <div className="px-8 pb-8">
                  <div className="bg-dark-950/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Totaux</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm text-light-500 mb-1">Total payé</p>
                        <p className="text-white font-bold text-xl">
                          {((pretDetails.mensualite || 0) * (pretDetails.duree || 0)).toLocaleString('fr-FR')} €
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-light-500 mb-1">Total intérêts</p>
                        <p className="text-accent-orange font-bold text-xl">
                          {(((pretDetails.mensualite || 0) * (pretDetails.duree || 0)) - (pretDetails.montant || 0)).toLocaleString('fr-FR')} €
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-light-500 mb-1">Coût total</p>
                        <p className="text-red-400 font-bold text-xl">
                          {(((pretDetails.mensualite || 0) * (pretDetails.duree || 0))).toLocaleString('fr-FR')} €
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-light-500 mb-1">Taux effectif</p>
                        <p className="text-accent-blue font-bold text-xl">
                          {(((((pretDetails.mensualite || 0) * (pretDetails.duree || 0)) - (pretDetails.montant || 0)) / (pretDetails.montant || 1)) * 100).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default BienDetailPage;
