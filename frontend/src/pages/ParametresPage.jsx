import { useState, useEffect } from 'react';
import { Settings, Building2, User, Bell, Lock, Database, HelpCircle, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { useSpace } from '../contexts/SpaceContext';
import { spaceService } from '../services/spaceService';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function ParametresPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('espaces');
  const { spaces, currentSpace, refreshSpaces } = useSpace();
  const { token, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null); // ID de l'espace à supprimer
  const [deleteDataModal, setDeleteDataModal] = useState(false);
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);

  const sections = [
    { id: 'espaces', label: 'Mes espaces', icon: Building2 },
    { id: 'compte', label: 'Mon compte', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'securite', label: 'Sécurité', icon: Lock },
    { id: 'donnees', label: 'Données', icon: Database },
    { id: 'aide', label: 'Aide', icon: HelpCircle }
  ];

  const handleDeleteSpace = async (spaceId) => {
    try {
      setLoading(true);
      await spaceService.archiveSpace(spaceId, token);
      await refreshSpaces();
      setDeleteModal(null);
      alert('SCI supprimée avec succès');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert(error.response?.data?.error || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllData = async () => {
    try {
      setLoading(true);
      await userService.deleteAllData(token);
      setDeleteDataModal(false);
      alert('✅ Toutes vos données ont été supprimées');
      // Recharger la page pour réinitialiser l'état
      window.location.reload();
    } catch (error) {
      console.error('Erreur suppression données:', error);
      alert(error.response?.data?.error || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await userService.deleteAccount(token);
      // Déconnexion automatique
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur suppression compte:', error);
      alert(error.response?.data?.error || 'Erreur lors de la suppression');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Paramètres</h1>
          <p className="text-gray-400">Gérez les paramètres de votre application</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Menu latéral */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-2">
              {sections.map(section => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      activeSection === section.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-[#252525]'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contenu */}
          <div className="lg:col-span-3">
            {activeSection === 'espaces' && (
              <div className="space-y-6">
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
                  <h2 className="text-xl font-bold mb-6">Mes espaces</h2>
                  
                  <div className="space-y-4">
                    {spaces.map(space => (
                      <div 
                        key={space.id} 
                        className={`p-5 rounded-xl border transition ${
                          space.id === currentSpace?.id
                            ? 'bg-blue-500/10 border-blue-500/30'
                            : 'bg-[#0f0f0f] border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Building2 className="h-5 w-5 text-blue-400" />
                              <h3 className="text-lg font-semibold text-white">{space.nom}</h3>
                              {space.id === currentSpace?.id && (
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">
                                  Actif
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-3">
                              <div>
                                <p className="text-xs text-gray-500">Type</p>
                                <p className="text-sm text-gray-300">
                                  {space.type === 'PERSONAL' ? 'Espace personnel' : 'SCI'}
                                </p>
                              </div>
                              {space.siret && (
                                <div>
                                  <p className="text-xs text-gray-500">SIRET</p>
                                  <p className="text-sm text-gray-300">{space.siret}</p>
                                </div>
                              )}
                              {space.regimeFiscal && (
                                <div>
                                  <p className="text-xs text-gray-500">Régime fiscal</p>
                                  <p className="text-sm text-gray-300">{space.regimeFiscal}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-xs text-gray-500">Biens</p>
                                <p className="text-sm text-gray-300">{space.nbBiens || 0}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {/* Bouton éditer (pour plus tard) */}
                            {/* <button
                              className="p-2 hover:bg-gray-800 rounded-lg transition"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4 text-gray-400" />
                            </button> */}
                            
                            {/* Bouton supprimer (uniquement pour les SCI) */}
                            {space.type !== 'PERSONAL' && (
                              <button
                                onClick={() => setDeleteModal(space.id)}
                                className="p-2 hover:bg-red-500/10 rounded-lg transition group"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4 text-gray-400 group-hover:text-red-400 transition" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {spaces.length === 1 && spaces[0].type === 'PERSONAL' && (
                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-sm text-blue-400">
                        💡 Vous pouvez créer une SCI depuis le switcher d'espaces dans la sidebar.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'sci' && (
              <div className="space-y-6">
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
                  <h2 className="text-xl font-bold mb-6">Informations de la SCI</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Nom de la SCI
                      </label>
                      <input
                        type="text"
                        defaultValue="Ma SCI"
                        className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        SIRET
                      </label>
                      <input
                        type="text"
                        placeholder="123 456 789 00012"
                        className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Adresse du siège social
                      </label>
                      <input
                        type="text"
                        placeholder="12 rue Example"
                        className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Code postal
                        </label>
                        <input
                          type="text"
                          placeholder="75001"
                          className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Ville
                        </label>
                        <input
                          type="text"
                          placeholder="Paris"
                          className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                        />
                      </div>
                    </div>

                    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition">
                      Enregistrer les modifications
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'compte' && (
              <div className="space-y-6">
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
                  <h2 className="text-xl font-bold mb-6">Mon compte</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue="admin@masci.fr"
                        className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Nom d'affichage
                      </label>
                      <input
                        type="text"
                        defaultValue="Administrateur"
                        className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition">
                      Enregistrer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
                  <h2 className="text-xl font-bold mb-6">Préférences de notifications</h2>
                  
                  <div className="space-y-4">
                    {[
                      { label: 'Baux expirant bientôt', desc: 'Recevoir une alerte 60 jours avant' },
                      { label: 'Événements fiscaux', desc: 'Rappel 30 jours avant échéance' },
                      { label: 'Documents expirant', desc: 'Alerte pour DPE, diagnostics, etc.' },
                      { label: 'Nouveaux loyers', desc: 'Notification à chaque paiement' }
                    ].map((notif, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-lg border border-gray-800">
                        <div>
                          <p className="font-medium text-white">{notif.label}</p>
                          <p className="text-sm text-gray-400">{notif.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'securite' && (
              <div className="space-y-6">
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
                  <h2 className="text-xl font-bold mb-6">Sécurité</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Mot de passe actuel
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition">
                      Changer le mot de passe
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/30 rounded-xl p-6">
                  <h3 className="font-bold text-orange-300 mb-2">Version 2.0 : Authentification</h3>
                  <p className="text-sm text-orange-200">
                    L'authentification complète sera disponible dans la prochaine version.
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'donnees' && (
              <div className="space-y-6">
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
                  <h2 className="text-xl font-bold mb-6">Gestion des données</h2>
                  
                  <div className="space-y-4">
                    {/* Supprimer toutes les données */}
                    <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
                      <div className="flex items-start gap-3 mb-3">
                        <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-orange-300 mb-2">Supprimer toutes les données</h3>
                          <p className="text-sm text-orange-200 mb-4">
                            Cette action supprime toutes vos SCI, biens, baux, locataires, documents, etc.
                            <br />
                            <strong>Votre compte reste actif</strong> avec un espace personnel vide.
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setDeleteDataModal(true)}
                        className="px-6 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg font-semibold transition"
                      >
                        Supprimer toutes les données
                      </button>
                    </div>

                    {/* Supprimer le compte */}
                    <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                      <div className="flex items-start gap-3 mb-3">
                        <Trash2 className="h-5 w-5 text-red-400 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-red-300 mb-2">Supprimer le compte</h3>
                          <p className="text-sm text-red-200 mb-4">
                            <strong>⚠️ Action définitive et irréversible !</strong>
                            <br />
                            Toutes vos données ET votre compte seront complètement supprimés.
                            Vous serez déconnecté automatiquement.
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setDeleteAccountModal(true)}
                        className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-semibold transition"
                      >
                        Supprimer le compte
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'aide' && (
              <div className="space-y-6">
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
                  <h2 className="text-xl font-bold mb-6">Aide et support</h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-[#0f0f0f] rounded-lg border border-gray-800">
                      <h3 className="font-semibold text-white mb-1">Version</h3>
                      <p className="text-gray-400">Je sais app v1.0.0</p>
                    </div>

                    <div className="p-4 bg-[#0f0f0f] rounded-lg border border-gray-800">
                      <h3 className="font-semibold text-white mb-1">Documentation</h3>
                      <p className="text-sm text-gray-400 mb-3">
                        Consultez la documentation complète du projet
                      </p>
                      <button className="text-blue-400 hover:text-blue-300 transition">
                        Voir la documentation →
                      </button>
                    </div>

                    <div className="p-4 bg-[#0f0f0f] rounded-lg border border-gray-800">
                      <h3 className="font-semibold text-white mb-1">Support</h3>
                      <p className="text-sm text-gray-400">
                        Pour toute question ou problème, contactez le support
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal suppression toutes les données */}
      {deleteDataModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" 
            onClick={() => setDeleteDataModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Supprimer toutes les données</h3>
              </div>
              
              <p className="text-gray-300 mb-6">
                Êtes-vous sûr de vouloir supprimer toutes vos données ?
                <br /><br />
                <strong className="text-orange-400">Cette action supprime :</strong>
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Toutes vos SCI</li>
                  <li>Tous vos biens immobiliers</li>
                  <li>Tous vos baux et locataires</li>
                  <li>Tous vos documents</li>
                  <li>Toutes vos factures et charges</li>
                  <li>Tous vos contacts et associés</li>
                </ul>
                <br />
                <strong className="text-green-400">✓ Votre compte reste actif</strong> avec un espace personnel vide.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteDataModal(false)}
                  disabled={loading}
                  className="flex-1 px-6 py-3 border border-gray-700 rounded-lg text-gray-200 hover:bg-gray-800 transition font-semibold"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteAllData}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Suppression...' : 'Supprimer tout'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal suppression compte */}
      {deleteAccountModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" 
            onClick={() => setDeleteAccountModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl border border-red-500/50 max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-500/10 rounded-xl">
                  <Trash2 className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Supprimer le compte</h3>
              </div>
              
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                <p className="text-red-300 font-bold text-center">
                  ⚠️ ACTION DÉFINITIVE ET IRRÉVERSIBLE ⚠️
                </p>
              </div>
              
              <p className="text-gray-300 mb-6">
                Cette action va :
                <ul className="list-disc ml-5 mt-2 space-y-1 text-red-300">
                  <li>Supprimer <strong>TOUTES</strong> vos données</li>
                  <li>Supprimer <strong>VOTRE COMPTE</strong></li>
                  <li>Vous déconnecter immédiatement</li>
                </ul>
                <br />
                <strong className="text-red-400">Vous ne pourrez JAMAIS récupérer ces données.</strong>
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteAccountModal(false)}
                  disabled={loading}
                  className="flex-1 px-6 py-3 border border-gray-700 rounded-lg text-gray-200 hover:bg-gray-800 transition font-semibold"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Suppression...' : 'SUPPRIMER'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de confirmation de suppression SCI */}
      {deleteModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" 
            onClick={() => setDeleteModal(null)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-500/10 rounded-xl">
                  <Trash2 className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Supprimer la SCI</h3>
              </div>
              
              <p className="text-gray-300 mb-6">
                Êtes-vous sûr de vouloir supprimer cette SCI ? Cette action est irréversible.
                <br /><br />
                <strong className="text-red-400">⚠️ Toutes les données associées (biens, baux, documents, etc.) seront supprimées.</strong>
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal(null)}
                  disabled={loading}
                  className="flex-1 px-6 py-3 border border-gray-700 rounded-lg text-gray-200 hover:bg-gray-800 transition font-semibold"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDeleteSpace(deleteModal)}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ParametresPage;