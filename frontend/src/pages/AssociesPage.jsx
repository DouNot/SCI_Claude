import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { associesAPI } from '../services/api';
import { Plus, Users, Mail, Phone, Percent, AlertCircle, TrendingUp, Coins, Calendar, Edit, Trash2, Building2, User as UserIcon, DollarSign } from 'lucide-react';
import AssocieForm from '../components/AssocieForm';
import PageLayout from '../components/PageLayout';
import { useSpace } from '../contexts/SpaceContext';

function AssociesPage() {
  const navigate = useNavigate();
  const [associes, setAssocies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [associeToEdit, setAssocieToEdit] = useState(null);
  const { currentSpace } = useSpace();

  useEffect(() => {
    loadAssocies();
  }, [currentSpace]);

  const loadAssocies = async () => {
    try {
      setLoading(true);
      const response = await associesAPI.getAll();
      setAssocies(response.data);
    } catch (err) {
      console.error('Erreur chargement associés:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssocie = async (associeData) => {
    try {
      await associesAPI.create(associeData);
      await loadAssocies();
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateAssocie = async (id, associeData) => {
    try {
      await associesAPI.update(id, associeData);
      await loadAssocies();
      setAssocieToEdit(null);
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleEditAssocie = (associe) => {
    setAssocieToEdit(associe);
    setShowForm(true);
  };

  const handleDeleteAssocie = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir marquer cet associé comme sorti ?')) return;
    
    try {
      await associesAPI.delete(id);
      await loadAssocies();
    } catch (err) {
      console.error('Erreur suppression associé:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setAssocieToEdit(null);
  };

  const totalPourcentage = associes.reduce((sum, a) => sum + parseFloat(a.pourcentage || 0), 0);
  const totalParts = associes.reduce((sum, a) => sum + parseInt(a.nombreParts || 0), 0);
  const isValid = Math.abs(totalPourcentage - 100) < 0.01;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-dark-950">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  const headerActions = (
    <button 
      onClick={() => setShowForm(true)}
      className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl shadow-accent-blue/30 hover:shadow-2xl hover:shadow-accent-blue/40 hover:scale-105"
    >
      <Plus className="h-5 w-5" />
      Ajouter un associé
    </button>
  );

  return (
    <PageLayout
      title={`Cap Table - ${currentSpace?.nom}`}
      subtitle={`${associes.length} associé${associes.length > 1 ? 's' : ''} • Capital social : ${currentSpace?.capitalSocial?.toLocaleString()} parts`}
      headerActions={headerActions}
    >
      {/* Validation des parts */}
      {!isValid && associes.length > 0 && (
        <div className="bg-accent-orange/10 border border-accent-orange/30 rounded-2xl p-6 mb-10">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-accent-orange/20 rounded-xl">
              <AlertCircle className="h-6 w-6 text-accent-orange" />
            </div>
            <div>
              <h3 className="font-bold text-accent-orange mb-1">Répartition des parts incorrecte</h3>
              <p className="text-sm text-light-300">
                Le total des parts doit être égal à 100%. Actuellement : {totalPourcentage.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-dark-900 rounded-2xl border border-dark-600/30 p-6 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-accent-blue/20 rounded-xl">
              <Coins className="h-6 w-6 text-accent-blue" />
            </div>
            <span className="text-sm text-light-400 font-semibold">Total Parts</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalParts.toLocaleString()}</p>
          <p className="text-xs text-accent-blue mt-1">sur {currentSpace?.capitalSocial?.toLocaleString()}</p>
        </div>

        <div className="bg-dark-900 rounded-2xl border border-dark-600/30 p-6 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-accent-purple/20 rounded-xl">
              <Percent className="h-6 w-6 text-accent-purple" />
            </div>
            <span className="text-sm text-light-400 font-semibold">Répartition</span>
          </div>
          <p className={`text-3xl font-bold ${isValid ? 'text-accent-green' : 'text-accent-orange'}`}>
            {totalPourcentage.toFixed(2)}%
          </p>
          <p className={`text-xs mt-1 ${isValid ? 'text-accent-green' : 'text-accent-orange'}`}>
            {isValid ? 'Conforme' : 'À ajuster'}
          </p>
        </div>

        <div className="bg-dark-900 rounded-2xl border border-dark-600/30 p-6 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-accent-green/20 rounded-xl">
              <TrendingUp className="h-6 w-6 text-accent-green" />
            </div>
            <span className="text-sm text-light-400 font-semibold">Parts disponibles</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {((currentSpace?.capitalSocial || 0) - totalParts).toLocaleString()}
          </p>
          <p className="text-xs text-accent-green mt-1">
            {(((currentSpace?.capitalSocial || 0) - totalParts) / (currentSpace?.capitalSocial || 1) * 100).toFixed(2)}%
          </p>
        </div>

        <div className="bg-dark-900 rounded-2xl border border-dark-600/30 p-6 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-accent-orange/20 rounded-xl">
              <Users className="h-6 w-6 text-accent-orange" />
            </div>
            <span className="text-sm text-light-400 font-semibold">Associés actifs</span>
          </div>
          <p className="text-3xl font-bold text-white">{associes.length}</p>
          <p className="text-xs text-accent-orange mt-1">
            {(associes.length > 0 ? (100 / associes.length).toFixed(1) : 0)}% moy.
          </p>
        </div>
      </div>

      {/* Barre de progression du capital */}
      <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card p-6 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Répartition du capital</h3>
          <div className={`px-4 py-2 rounded-xl font-bold text-2xl ${
            isValid ? 'bg-accent-green/20 text-accent-green border border-accent-green/30' : 'bg-accent-orange/20 text-accent-orange border border-accent-orange/30'
          }`}>
            {totalPourcentage.toFixed(2)}%
          </div>
        </div>

        {/* Barre de progression */}
        <div className="relative h-12 bg-dark-950 rounded-xl overflow-hidden border border-dark-600/30">
          {associes.map((associe, index) => {
            const colors = [
              'bg-accent-blue',
              'bg-accent-purple',
              'bg-accent-pink',
              'bg-accent-green',
              'bg-accent-orange',
              'bg-red-500',
              'bg-indigo-500',
              'bg-cyan-500'
            ];
            const color = colors[index % colors.length];
            
            return (
              <div
                key={associe.id}
                className={`absolute top-0 h-full ${color} transition-all duration-300 hover:brightness-110 cursor-pointer`}
                style={{
                  left: `${associes.slice(0, index).reduce((sum, a) => sum + parseFloat(a.pourcentage || 0), 0)}%`,
                  width: `${parseFloat(associe.pourcentage || 0)}%`
                }}
                title={`${associe.prenom} ${associe.nom} - ${associe.pourcentage}%`}
              />
            );
          })}
        </div>
      </div>

      {/* Liste des associés */}
      <div className="space-y-5">
        {associes.map((associe, index) => {
          const colors = [
            { bg: 'bg-accent-blue/20', text: 'text-accent-blue', border: 'border-accent-blue/30' },
            { bg: 'bg-accent-purple/20', text: 'text-accent-purple', border: 'border-accent-purple/30' },
            { bg: 'bg-accent-pink/20', text: 'text-accent-pink', border: 'border-accent-pink/30' },
            { bg: 'bg-accent-green/20', text: 'text-accent-green', border: 'border-accent-green/30' },
            { bg: 'bg-accent-orange/20', text: 'text-accent-orange', border: 'border-accent-orange/30' },
            { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
          ];
          const colorScheme = colors[index % colors.length];

          return (
            <div
              key={associe.id}
              className={`bg-dark-900 rounded-2xl border ${colorScheme.border} shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group`}
            >
              <div className="p-6">
                <div className="flex items-start gap-6">
                  {/* Avatar avec initiales */}
                  <div className={`w-24 h-24 ${colorScheme.bg} rounded-2xl flex flex-col items-center justify-center border ${colorScheme.border} transition-transform group-hover:scale-105 cursor-pointer`}
                    onClick={() => navigate(`/associes/${associe.id}`)}
                  >
                    {associe.type === 'PERSONNE_MORALE' ? (
                      <Building2 className={`h-10 w-10 ${colorScheme.text} mb-1`} />
                    ) : (
                      <UserIcon className={`h-10 w-10 ${colorScheme.text} mb-1`} />
                    )}
                    <span className={`text-xs ${colorScheme.text} font-semibold`}>
                      {associe.type === 'PERSONNE_MORALE' ? 'PM' : 'PP'}
                    </span>
                  </div>

                  {/* Informations */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {associe.prenom} {associe.nom}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-light-400">
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar className="h-4 w-4" />
                            Depuis {new Date(associe.dateEntree).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/associes/${associe.id}`)}
                          className="p-2.5 bg-accent-green/10 hover:bg-accent-green/20 rounded-xl border border-accent-green/20 transition"
                          title="Voir le CCA"
                        >
                          <DollarSign className="h-4 w-4 text-accent-green" />
                        </button>
                        <button
                          onClick={() => handleEditAssocie(associe)}
                          className="p-2.5 bg-accent-blue/10 hover:bg-accent-blue/20 rounded-xl border border-accent-blue/20 transition"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4 text-accent-blue" />
                        </button>
                        <button
                          onClick={() => handleDeleteAssocie(associe.id)}
                          className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/20 transition"
                          title="Marquer comme sorti"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </div>

                    {/* Statistiques de participation */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className={`${colorScheme.bg} p-4 rounded-xl border ${colorScheme.border} cursor-pointer hover:scale-105 transition`}
                        onClick={() => navigate(`/associes/${associe.id}`)}
                      >
                        <p className="text-xs text-light-500 mb-1 font-medium">Parts détenues</p>
                        <p className={`text-2xl font-bold ${colorScheme.text}`}>
                          {associe.nombreParts?.toLocaleString()}
                        </p>
                      </div>

                      <div className={`${colorScheme.bg} p-4 rounded-xl border ${colorScheme.border}`}>
                        <p className="text-xs text-light-500 mb-1 font-medium">Pourcentage</p>
                        <p className={`text-2xl font-bold ${colorScheme.text}`}>
                          {parseFloat(associe.pourcentage || 0).toFixed(2)}%
                        </p>
                      </div>

                      <div className="bg-accent-green/10 p-4 rounded-xl border border-accent-green/30 cursor-pointer hover:scale-105 transition"
                        onClick={() => navigate(`/associes/${associe.id}`)}
                      >
                        <p className="text-xs text-light-500 mb-1 font-medium">Solde CCA</p>
                        <p className="text-2xl font-bold text-accent-green">
                          {(associe.soldeCCA || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>
                    </div>

                    {/* Coordonnées */}
                    {(associe.email || associe.telephone) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {associe.email && (
                          <div className="flex items-center gap-3 p-3 bg-dark-950 rounded-xl border border-dark-600/30">
                            <Mail className="h-5 w-5 text-light-500" />
                            <a href={`mailto:${associe.email}`} className="text-light-300 hover:text-white transition truncate font-medium">
                              {associe.email}
                            </a>
                          </div>
                        )}

                        {associe.telephone && (
                          <div className="flex items-center gap-3 p-3 bg-dark-950 rounded-xl border border-dark-600/30">
                            <Phone className="h-5 w-5 text-light-500" />
                            <a href={`tel:${associe.telephone}`} className="text-light-300 hover:text-white transition font-medium">
                              {associe.telephone}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {associes.length === 0 && (
        <div className="bg-dark-900 rounded-3xl border border-dark-600/30 shadow-card p-20 text-center">
          <Users className="h-20 w-20 text-accent-blue/50 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun associé</h3>
          <p className="text-light-300 mb-6">Commencez par ajouter les associés de votre SCI</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl"
          >
            <Plus className="h-5 w-5" />
            Ajouter le premier associé
          </button>
        </div>
      )}

      {/* Modal Formulaire */}
      {showForm && (
        <AssocieForm
          onClose={closeForm}
          onSubmit={associeToEdit ? handleUpdateAssocie : handleCreateAssocie}
          associeToEdit={associeToEdit}
        />
      )}
    </PageLayout>
  );
}

export default AssociesPage;
