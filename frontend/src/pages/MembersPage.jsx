import { useState, useEffect } from 'react';
import { useSpace } from '../contexts/SpaceContext';
import { useAuth } from '../contexts/AuthContext';
import { membersAPI } from '../services/api';
import { 
  Users, Plus, Mail, Crown, Shield, Eye, Calculator, 
  MoreVertical, Trash2, UserCog, Clock, CheckCircle
} from 'lucide-react';
import PageLayout from '../components/PageLayout';
import InviteMemberModal from '../components/InviteMemberModal';

const ROLE_CONFIG = {
  OWNER: { 
    label: 'Propriétaire', 
    icon: Crown, 
    color: 'accent-purple',
    description: 'Tous les droits'
  },
  MANAGER: { 
    label: 'Gestionnaire', 
    icon: Shield, 
    color: 'accent-blue',
    description: 'Gestion complète sauf suppression'
  },
  COMPTABLE: { 
    label: 'Comptable', 
    icon: Calculator, 
    color: 'accent-green',
    description: 'Accès finances et rapports'
  },
  VIEWER: { 
    label: 'Observateur', 
    icon: Eye, 
    color: 'light-500',
    description: 'Lecture seule'
  },
};

const STATUS_CONFIG = {
  ACTIVE: { label: 'Actif', color: 'accent-green', icon: CheckCircle },
  PENDING: { label: 'En attente', color: 'accent-orange', icon: Clock },
  SUSPENDED: { label: 'Suspendu', color: 'red-400', icon: Trash2 },
};

function MembersPage() {
  const { currentSpace } = useSpace();
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  // Vérifier le rôle de l'utilisateur actuel
  const currentMember = members.find(m => m.userId === user?.id);
  const canInvite = currentMember && ['OWNER', 'MANAGER'].includes(currentMember.role);
  const canManage = currentMember && currentMember.role === 'OWNER';

  useEffect(() => {
    if (currentSpace) {
      loadMembers();
    }
  }, [currentSpace]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await membersAPI.getAll(currentSpace.id);
      setMembers(response);
    } catch (err) {
      console.error('Erreur chargement membres:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (inviteData) => {
    try {
      await membersAPI.invite(currentSpace.id, inviteData);
      await loadMembers();
      setShowInviteModal(false);
    } catch (err) {
      throw err;
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await membersAPI.remove(currentSpace.id, memberId);
      await loadMembers();
      setMemberToRemove(null);
    } catch (err) {
      console.error('Erreur suppression membre:', err);
      alert(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await membersAPI.updateRole(currentSpace.id, memberId, newRole);
      await loadMembers();
    } catch (err) {
      console.error('Erreur mise à jour rôle:', err);
      alert(err.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-dark-950">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  const activeMembers = members.filter(m => m.statut === 'ACTIVE');
  const pendingMembers = members.filter(m => m.statut === 'PENDING');

  const headerActions = canInvite && (
    <button 
      onClick={() => setShowInviteModal(true)}
      className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl shadow-accent-blue/30 hover:shadow-2xl hover:shadow-accent-blue/40 hover:scale-105"
    >
      <Plus className="h-5 w-5" />
      Inviter un membre
    </button>
  );

  return (
    <PageLayout
      title={`Membres de ${currentSpace?.nom}`}
      subtitle={`${activeMembers.length} membre${activeMembers.length > 1 ? 's' : ''} actif${activeMembers.length > 1 ? 's' : ''}`}
      headerActions={headerActions}
    >
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-dark-900 rounded-2xl border border-dark-600/30 p-6 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-accent-blue/20 rounded-xl">
              <Users className="h-6 w-6 text-accent-blue" />
            </div>
            <h3 className="text-sm font-semibold text-light-400">Membres actifs</h3>
          </div>
          <p className="text-3xl font-bold text-white">{activeMembers.length}</p>
        </div>

        <div className="bg-dark-900 rounded-2xl border border-dark-600/30 p-6 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-accent-orange/20 rounded-xl">
              <Clock className="h-6 w-6 text-accent-orange" />
            </div>
            <h3 className="text-sm font-semibold text-light-400">Invitations en attente</h3>
          </div>
          <p className="text-3xl font-bold text-white">{pendingMembers.length}</p>
        </div>

        <div className="bg-dark-900 rounded-2xl border border-dark-600/30 p-6 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-accent-purple/20 rounded-xl">
              <Crown className="h-6 w-6 text-accent-purple" />
            </div>
            <h3 className="text-sm font-semibold text-light-400">Propriétaires</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {members.filter(m => m.role === 'OWNER' && m.statut === 'ACTIVE').length}
          </p>
        </div>

        <div className="bg-dark-900 rounded-2xl border border-dark-600/30 p-6 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-accent-green/20 rounded-xl">
              <Shield className="h-6 w-6 text-accent-green" />
            </div>
            <h3 className="text-sm font-semibold text-light-400">Gestionnaires</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {members.filter(m => m.role === 'MANAGER' && m.statut === 'ACTIVE').length}
          </p>
        </div>
      </div>

      {/* Invitations en attente */}
      {pendingMembers.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-5">Invitations en attente</h2>
          <div className="space-y-4">
            {pendingMembers.map((member) => {
              const roleConfig = ROLE_CONFIG[member.role];
              const RoleIcon = roleConfig.icon;

              return (
                <div
                  key={member.id}
                  className="bg-accent-orange/10 border border-accent-orange/30 rounded-2xl p-6 shadow-card"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-accent-orange/20 rounded-xl">
                        <Clock className="h-6 w-6 text-accent-orange" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-white">
                            {member.user.prenom} {member.user.nom}
                          </h3>
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border bg-${roleConfig.color}/20 text-${roleConfig.color} border-${roleConfig.color}/30`}>
                            <RoleIcon className="h-3.5 w-3.5" />
                            {roleConfig.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-light-400">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Mail className="h-4 w-4" />
                            {member.user.email}
                          </span>
                          <span className="font-medium">
                            Invité le {new Date(member.invitationSentAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {canManage && (
                      <button
                        onClick={() => setMemberToRemove(member)}
                        className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/20 transition"
                        title="Révoquer l'invitation"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Membres actifs */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-5">Membres actifs</h2>
        <div className="space-y-5">
          {activeMembers.map((member) => {
            const roleConfig = ROLE_CONFIG[member.role];
            const RoleIcon = roleConfig.icon;
            const isCurrentUser = member.userId === user?.id;

            return (
              <div
                key={member.id}
                className={`bg-dark-900 rounded-2xl border shadow-card hover:shadow-card-hover transition p-6 ${
                  isCurrentUser ? 'border-accent-blue/50 bg-accent-blue/5' : 'border-dark-600/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Avatar */}
                    <div className={`w-16 h-16 bg-${roleConfig.color}/20 rounded-xl flex items-center justify-center border border-${roleConfig.color}/30`}>
                      <span className={`text-2xl font-bold text-${roleConfig.color}`}>
                        {member.user.prenom?.[0]}{member.user.nom?.[0]}
                      </span>
                    </div>

                    {/* Informations */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">
                          {member.user.prenom} {member.user.nom}
                          {isCurrentUser && <span className="text-accent-blue text-sm ml-2">(Vous)</span>}
                        </h3>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border bg-${roleConfig.color}/20 text-${roleConfig.color} border-${roleConfig.color}/30`}>
                          <RoleIcon className="h-3.5 w-3.5" />
                          {roleConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-light-400">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Mail className="h-4 w-4" />
                          {member.user.email}
                        </span>
                        <span className="font-medium">
                          Membre depuis {new Date(member.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-xs text-light-500 mt-2">{roleConfig.description}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  {canManage && !isCurrentUser && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setMemberToRemove(member)}
                        className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/20 transition"
                        title="Retirer du Space"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal d'invitation */}
      {showInviteModal && (
        <InviteMemberModal
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInvite}
          currentRole={currentMember?.role}
        />
      )}

      {/* Modal de confirmation de suppression */}
      {memberToRemove && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[9998] backdrop-blur-sm" onClick={() => setMemberToRemove(null)} />
          
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none">
            <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-2xl max-w-md w-full p-6 pointer-events-auto">
              <h3 className="text-xl font-bold text-white mb-4">
                {memberToRemove.statut === 'PENDING' ? 'Révoquer l\'invitation ?' : 'Retirer ce membre ?'}
              </h3>
              <p className="text-light-300 mb-2">
                {memberToRemove.statut === 'PENDING' 
                  ? 'L\'invitation sera annulée et l\'utilisateur ne pourra plus rejoindre cet espace.'
                  : 'Ce membre n\'aura plus accès à cet espace et à ses données.'
                }
              </p>
              <p className="font-semibold text-white mb-6">
                {memberToRemove.user.prenom} {memberToRemove.user.nom} ({memberToRemove.user.email})
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setMemberToRemove(null)} 
                  className="flex-1 px-6 py-3 border border-dark-600 rounded-xl text-light-200 hover:bg-dark-800 transition font-semibold"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => handleRemoveMember(memberToRemove.id)} 
                  className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-xl transition font-semibold"
                >
                  {memberToRemove.statut === 'PENDING' ? 'Révoquer' : 'Retirer'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </PageLayout>
  );
}

export default MembersPage;
