import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invitationsAPI } from '../services/api';
import { CheckCircle, XCircle, Mail, Users, Shield, Crown, Eye, Calculator, Loader } from 'lucide-react';

const ROLE_CONFIG = {
  OWNER: { label: 'Propriétaire', icon: Crown, color: 'accent-purple' },
  MANAGER: { label: 'Gestionnaire', icon: Shield, color: 'accent-blue' },
  COMPTABLE: { label: 'Comptable', icon: Calculator, color: 'accent-green' },
  VIEWER: { label: 'Observateur', icon: Eye, color: 'light-500' },
};

function InvitationPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAccept = async () => {
    try {
      setAccepting(true);
      setError('');
      const response = await invitationsAPI.accept(token);
      setSuccess(response.message);
      
      // Rediriger vers le dashboard après 2 secondes
      setTimeout(() => {
        window.location.href = '/'; // Force un rechargement complet
      }, 2000);
    } catch (err) {
      console.error('Erreur acceptation:', err);
      setError(err.response?.data?.error || 'Erreur lors de l\'acceptation de l\'invitation');
      setAccepting(false);
    }
  };

  const handleReject = async () => {
    if (!confirm('Êtes-vous sûr de refuser cette invitation ?')) return;

    try {
      setRejecting(true);
      setError('');
      await invitationsAPI.reject(token);
      setSuccess('Invitation refusée');
      
      // Rediriger vers le dashboard après 1 seconde
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      console.error('Erreur refus:', err);
      setError(err.response?.data?.error || 'Erreur lors du refus de l\'invitation');
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success */}
        {success ? (
          <div className="bg-dark-900 rounded-3xl border border-dark-600/30 shadow-2xl p-12 text-center">
            <div className="w-20 h-20 bg-accent-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-accent-green" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">{success}</h1>
            <p className="text-light-400 mb-8">Vous allez être redirigé...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mx-auto"></div>
          </div>
        ) : (
          <div className="bg-dark-900 rounded-3xl border border-dark-600/30 shadow-2xl p-12">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-accent-blue/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="h-12 w-12 text-accent-blue" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">Invitation reçue</h1>
              <p className="text-light-300 text-lg">
                Vous avez été invité à rejoindre un espace collaboratif
              </p>
            </div>

            {/* Contenu */}
            <div className="bg-dark-950 rounded-2xl border border-dark-600/30 p-8 mb-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent-blue/20 rounded-xl">
                    <Users className="h-6 w-6 text-accent-blue" />
                  </div>
                  <div>
                    <p className="text-sm text-light-500 font-medium mb-1">Vous rejoindrez</p>
                    <p className="text-xl font-bold text-white">Cliquez sur "Accepter" pour voir les détails</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent-purple/20 rounded-xl">
                    <Shield className="h-6 w-6 text-accent-purple" />
                  </div>
                  <div>
                    <p className="text-sm text-light-500 font-medium mb-1">Votre rôle</p>
                    <p className="text-xl font-bold text-white">À déterminer lors de l'acceptation</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-xl p-5 mb-8">
              <p className="text-sm text-light-300">
                💡 <strong>Important :</strong> En acceptant cette invitation, vous aurez accès aux données de l'espace selon votre rôle attribué.
              </p>
            </div>

            {/* Erreur */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 mb-8">
                <p className="text-sm text-red-400">❌ {error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleReject}
                disabled={accepting || rejecting}
                className="flex-1 px-8 py-4 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {rejecting ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Refus...
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5" />
                    Refuser
                  </>
                )}
              </button>
              <button
                onClick={handleAccept}
                disabled={accepting || rejecting}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl shadow-accent-blue/30 hover:shadow-2xl hover:shadow-accent-blue/40 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {accepting ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Acceptation...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Accepter l'invitation
                  </>
                )}
              </button>
            </div>

            {/* Lien retour */}
            <div className="text-center mt-8">
              <button
                onClick={() => navigate('/')}
                className="text-light-500 hover:text-white transition text-sm"
              >
                Retour au tableau de bord
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InvitationPage;
