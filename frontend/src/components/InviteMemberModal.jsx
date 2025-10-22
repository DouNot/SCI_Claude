import { useState } from 'react';
import { Crown, Shield, Eye, Calculator, Mail, X } from 'lucide-react';

const ROLES = [
  { 
    value: 'MANAGER', 
    label: 'Gestionnaire', 
    icon: Shield, 
    color: 'accent-blue',
    description: 'Peut gérer les biens, locataires, et finances'
  },
  { 
    value: 'COMPTABLE', 
    label: 'Comptable', 
    icon: Calculator, 
    color: 'accent-green',
    description: 'Accès aux finances et rapports uniquement'
  },
  { 
    value: 'VIEWER', 
    label: 'Observateur', 
    icon: Eye, 
    color: 'light-500',
    description: 'Lecture seule, aucune modification'
  },
  { 
    value: 'OWNER', 
    label: 'Propriétaire', 
    icon: Crown, 
    color: 'accent-purple',
    description: 'Tous les droits (réservé aux OWNERs)'
  },
];

function InviteMemberModal({ onClose, onInvite, currentRole }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MANAGER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filtrer les rôles disponibles selon le rôle actuel
  const availableRoles = currentRole === 'OWNER' 
    ? ROLES 
    : ROLES.filter(r => r.value !== 'OWNER');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    try {
      setLoading(true);
      await onInvite({ email: email.toLowerCase().trim(), role });
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'envoi de l\'invitation');
      setLoading(false);
    }
  };

  const selectedRole = ROLES.find(r => r.value === role);
  const SelectedIcon = selectedRole.icon;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-[9998] backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none">
        <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-2xl max-w-2xl w-full pointer-events-auto">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">Inviter un membre</h2>
                <p className="text-light-400">Ajoutez un collaborateur à votre espace</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-dark-800 rounded-xl transition"
              >
                <X className="h-6 w-6 text-light-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-light-400 mb-2">
                  Adresse email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-light-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@email.com"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                  />
                </div>
                <p className="text-xs text-light-500 mt-2">
                  💡 L'utilisateur doit avoir un compte pour recevoir l'invitation
                </p>
              </div>

              {/* Rôle */}
              <div>
                <label className="block text-sm font-semibold text-light-400 mb-3">
                  Rôle *
                </label>
                <div className="space-y-3">
                  {availableRoles.map((r) => {
                    const Icon = r.icon;
                    const isSelected = role === r.value;

                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`w-full p-4 rounded-xl border transition-all text-left ${
                          isSelected
                            ? `bg-${r.color}/10 border-${r.color}/50 shadow-glow-${r.color.split('-')[1]}`
                            : 'bg-dark-950 border-dark-600/30 hover:border-dark-500'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${isSelected ? `bg-${r.color}/20` : 'bg-dark-800'}`}>
                            <Icon className={`h-5 w-5 ${isSelected ? `text-${r.color}` : 'text-light-500'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-bold ${isSelected ? `text-${r.color}` : 'text-white'}`}>
                                {r.label}
                              </h4>
                              {isSelected && (
                                <span className="text-xs font-semibold px-2 py-0.5 bg-accent-blue/20 text-accent-blue rounded-full">
                                  Sélectionné
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-light-400">{r.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Aperçu de l'invitation */}
              {email && (
                <div className={`bg-${selectedRole.color}/10 border border-${selectedRole.color}/30 rounded-xl p-5`}>
                  <h4 className="text-sm font-semibold text-white mb-3">📧 Aperçu de l'invitation</h4>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-${selectedRole.color}/20 rounded-lg`}>
                      <SelectedIcon className={`h-5 w-5 text-${selectedRole.color}`} />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{email}</p>
                      <p className="text-sm text-light-400">sera invité comme <span className={`text-${selectedRole.color} font-semibold`}>{selectedRole.label}</span></p>
                    </div>
                  </div>
                </div>
              )}

              {/* Erreur */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-dark-600 rounded-xl text-light-200 hover:bg-dark-800 transition font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-xl transition font-semibold disabled:opacity-50 shadow-xl"
                >
                  {loading ? 'Envoi...' : 'Envoyer l\'invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default InviteMemberModal;
