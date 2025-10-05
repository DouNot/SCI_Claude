import { useState, useEffect } from 'react';
import { associesAPI } from '../services/api';
import { Plus, Users, Mail, Phone, Percent, AlertCircle } from 'lucide-react';
import AssocieForm from '../components/AssocieForm';

function AssociesPage() {
  const [associes, setAssocies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [associeToEdit, setAssocieToEdit] = useState(null);

  useEffect(() => {
    loadAssocies();
  }, []);

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

  const closeForm = () => {
    setShowForm(false);
    setAssocieToEdit(null);
  };

  const totalParts = associes.reduce((sum, a) => sum + a.pourcentageParts, 0);
  const isValid = Math.abs(totalParts - 100) < 0.01;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Associés de la SCI</h1>
            <p className="text-gray-400">{associes.length} associé{associes.length > 1 ? 's' : ''}</p>
          </div>

          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl font-semibold transition shadow-lg shadow-blue-500/20"
          >
            <Plus className="h-5 w-5" />
            Ajouter un associé
          </button>
        </div>

        {/* Validation des parts */}
        {!isValid && associes.length > 0 && (
          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <AlertCircle className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <h3 className="font-bold text-orange-300 mb-1">Répartition des parts incorrecte</h3>
                <p className="text-sm text-orange-200">
                  Le total des parts doit être égal à 100%. Actuellement : {totalParts.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Résumé des parts */}
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Répartition du capital</h3>
            <div className={`px-4 py-2 rounded-lg font-bold text-2xl ${
              isValid ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
            }`}>
              {totalParts.toFixed(2)}%
            </div>
          </div>

          {/* Barre de progression */}
          <div className="relative h-8 bg-gray-800 rounded-lg overflow-hidden">
            {associes.map((associe, index) => {
              const colors = [
                'bg-blue-500',
                'bg-purple-500',
                'bg-pink-500',
                'bg-green-500',
                'bg-yellow-500',
                'bg-red-500'
              ];
              const color = colors[index % colors.length];
              
              return (
                <div
                  key={associe.id}
                  className={`absolute top-0 h-full ${color} transition-all duration-300`}
                  style={{
                    left: `${associes.slice(0, index).reduce((sum, a) => sum + a.pourcentageParts, 0)}%`,
                    width: `${associe.pourcentageParts}%`
                  }}
                  title={`${associe.nom} - ${associe.pourcentageParts}%`}
                />
              );
            })}
          </div>
        </div>

        {/* Liste des associés */}
        <div className="space-y-4">
          {associes.map((associe, index) => {
            const colors = [
              { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
              { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
              { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
              { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
              { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
              { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' }
            ];
            const colorScheme = colors[index % colors.length];

            return (
              <div
                key={associe.id}
                className={`bg-[#1a1a1a] rounded-xl border ${colorScheme.border} hover:border-opacity-50 transition p-6`}
              >
                <div className="flex items-start gap-6">
                  {/* Avatar avec initiales */}
                  <div className={`w-20 h-20 ${colorScheme.bg} rounded-xl flex items-center justify-center`}>
                    <span className={`text-2xl font-bold ${colorScheme.text}`}>
                      {associe.nom.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </span>
                  </div>

                  {/* Informations */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{associe.nom}</h3>
                        <p className="text-gray-400">{associe.prenom}</p>
                      </div>

                      {/* Pourcentage */}
                      <div className={`${colorScheme.bg} px-6 py-3 rounded-xl border ${colorScheme.border}`}>
                        <div className="flex items-center gap-2">
                          <Percent className={`h-5 w-5 ${colorScheme.text}`} />
                          <span className={`text-2xl font-bold ${colorScheme.text}`}>
                            {associe.pourcentageParts}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 text-center mt-1">des parts</p>
                      </div>
                    </div>

                    {/* Coordonnées */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {associe.email && (
                        <div className="flex items-center gap-3 p-3 bg-[#0f0f0f] rounded-lg border border-gray-800">
                          <Mail className="h-5 w-5 text-gray-500" />
                          <a href={`mailto:${associe.email}`} className="text-gray-300 hover:text-white transition truncate">
                            {associe.email}
                          </a>
                        </div>
                      )}

                      {associe.telephone && (
                        <div className="flex items-center gap-3 p-3 bg-[#0f0f0f] rounded-lg border border-gray-800">
                          <Phone className="h-5 w-5 text-gray-500" />
                          <a href={`tel:${associe.telephone}`} className="text-gray-300 hover:text-white transition">
                            {associe.telephone}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Adresse */}
                    {associe.adresse && (
                      <div className="mt-4 p-3 bg-[#0f0f0f] rounded-lg border border-gray-800">
                        <p className="text-sm text-gray-300">{associe.adresse}</p>
                        {(associe.codePostal || associe.ville) && (
                          <p className="text-sm text-gray-500 mt-1">
                            {associe.codePostal} {associe.ville}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {associes.length === 0 && (
          <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-12 text-center">
            <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Aucun associé pour le moment</p>
            <p className="text-sm text-gray-500">Ajoutez les associés de votre SCI</p>
          </div>
        )}
      </div>

      {/* Modal Formulaire */}
      {showForm && (
        <AssocieForm
          onClose={closeForm}
          onSubmit={associeToEdit ? handleUpdateAssocie : handleCreateAssocie}
          associeToEdit={associeToEdit}
        />
      )}
    </div>
  );
}

export default AssociesPage;