import { useState, useEffect } from 'react';
import { biensAPI, bauxAPI, facturesAPI, travauxAPI, documentsAPI, pretsAPI, evenementsFiscauxAPI } from '../services/api';
import { ArrowLeft, Edit, MapPin, Home, Calendar, Euro, FileText, Wrench, Users, TrendingUp, Plus } from 'lucide-react';
import PretForm from '../components/PretForm';

function BienDetailPage({ bienId, onNavigate }) {
  const [bien, setBien] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [baux, setBaux] = useState([]);
  const [factures, setFactures] = useState([]);
  const [travaux, setTravaux] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [prets, setPrets] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPretForm, setShowPretForm] = useState(false);

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
        evenementsFiscauxAPI.getByBien(bienId)
      ]);

      if (results[0].status === 'fulfilled') setBaux(results[0].value.data || []);
      if (results[1].status === 'fulfilled') setFactures(results[1].value.data || []);
      if (results[2].status === 'fulfilled') setTravaux(results[2].value.data || []);
      if (results[3].status === 'fulfilled') setDocuments(results[3].value.data || []);
      if (results[4].status === 'fulfilled') setPrets(results[4].value.data || []);
      if (results[5].status === 'fulfilled') setEvenements(results[5].value.data || []);

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const names = ['baux', 'factures', 'travaux', 'documents', 'prêts', 'événements'];
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
    } catch (err) {
      throw err;
    }
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: Home },
    { id: 'locataire', label: 'Locataire', icon: Users },
    { id: 'finances', label: 'Finances', icon: Euro },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'travaux', label: 'Travaux', icon: Wrench },
    { id: 'prets', label: 'Prêts', icon: TrendingUp }
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

            <button className="flex items-center gap-2 px-6 py-3 bg-dark-900 hover:bg-dark-800 rounded-2xl border border-dark-600/30 transition shadow-card">
              <Edit className="h-4 w-4 text-accent-blue" />
              <span className="font-semibold">Modifier</span>
            </button>
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
                    {bien.loyerHC > 0 && (
                      <div>
                        <p className="text-sm text-light-500 mb-1 font-medium">Loyer HC</p>
                        <p className="text-accent-green font-bold">{bien.loyerHC.toLocaleString('fr-FR')} €/mois</p>
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
            </div>
          )}

          {activeTab === 'prets' && (
            <div className="space-y-6">
              {/* Header avec bouton */}
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Prêts immobiliers</h3>
                <button
                  onClick={() => setShowPretForm(true)}
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
                    const moisRestants = Math.max(0, (pret.duree * 12) - moisEcoules);
                    const capitalRestant = pret.mensualite * moisRestants;

                    return (
                      <div key={pret.id} className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card p-6 hover:shadow-card-hover transition-all">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div>
                            <p className="text-sm text-light-500 mb-2 font-medium">Montant emprunté</p>
                            <p className="text-white font-bold text-xl">{pret.montantEmprunte.toLocaleString('fr-FR')} €</p>
                          </div>
                          <div>
                            <p className="text-sm text-light-500 mb-2 font-medium">Mensualité</p>
                            <p className="text-white font-bold text-xl">{pret.mensualite.toLocaleString('fr-FR')} €</p>
                          </div>
                          <div>
                            <p className="text-sm text-light-500 mb-2 font-medium">Taux</p>
                            <p className="text-accent-blue font-bold text-xl">{pret.tauxInteret}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-light-500 mb-2 font-medium">Capital restant</p>
                            <p className="text-accent-orange font-bold text-xl">{capitalRestant.toLocaleString('fr-FR')} €</p>
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

          {/* Autres onglets inchangés... */}
        </div>
      </div>

      {/* Modal Formulaire Prêt */}
      {showPretForm && (
        <PretForm
          onClose={() => setShowPretForm(false)}
          onSubmit={handleCreatePret}
          biensList={[bien]}
        />
      )}
    </div>
  );
}

export default BienDetailPage;
