import { useState } from 'react';
import { Settings, Building2, User, Bell, Lock, Database, HelpCircle } from 'lucide-react';

function ParametresPage() {
  const [activeSection, setActiveSection] = useState('sci');

  const sections = [
    { id: 'sci', label: 'Informations SCI', icon: Building2 },
    { id: 'compte', label: 'Mon compte', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'securite', label: 'Sécurité', icon: Lock },
    { id: 'donnees', label: 'Données', icon: Database },
    { id: 'aide', label: 'Aide', icon: HelpCircle }
  ];

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
                    <div className="p-4 bg-[#0f0f0f] rounded-lg border border-gray-800">
                      <h3 className="font-semibold text-white mb-2">Exporter les données</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        Téléchargez toutes vos données au format JSON
                      </p>
                      <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition">
                        Exporter
                      </button>
                    </div>

                    <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                      <h3 className="font-semibold text-red-300 mb-2">Zone dangereuse</h3>
                      <p className="text-sm text-red-200 mb-4">
                        Cette action est irréversible. Toutes vos données seront supprimées.
                      </p>
                      <button className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-semibold transition">
                        Supprimer toutes les données
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
    </div>
  );
}

export default ParametresPage;