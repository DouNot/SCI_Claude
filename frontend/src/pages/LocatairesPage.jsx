import { useState, useEffect } from 'react';
import { locatairesAPI, biensAPI } from '../services/api';
import { Users, Building2, User, Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import LocataireForm from '../components/LocataireForm';

function LocatairesPage() {
  const [locataires, setLocataires] = useState([]);
  const [biens, setBiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [locataireToEdit, setLocataireToEdit] = useState(null);
  const [locataireToDelete, setLocataireToDelete] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [locatairesData, biensData] = await Promise.all([
        locatairesAPI.getAll(),
        biensAPI.getAll()
      ]);
      setLocataires(locatairesData.data);
      setBiens(biensData.data);
      setError(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les locataires');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocataire = async (locataireData) => {
    try {
      await locatairesAPI.create(locataireData);
      await loadData();
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateLocataire = async (id, locataireData) => {
    try {
      await locatairesAPI.update(id, locataireData);
      await loadData();
      setLocataireToEdit(null);
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteLocataire = async (id) => {
    try {
      await locatairesAPI.delete(id);
      await loadData();
      setLocataireToDelete(null);
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const openEditForm = (locataire) => {
    setLocataireToEdit(locataire);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setLocataireToEdit(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des locataires...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800 font-semibold mb-2">❌ Erreur</p>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadData}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">👥 Locataires</h1>
              <p className="text-gray-600 mt-1">{locataires.length} locataire(s)</p>
            </div>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              + Ajouter un Locataire
            </button>
          </div>
        </div>
      </div>

      {/* Liste des locataires */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {locataires.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun locataire pour le moment
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par ajouter votre premier locataire !
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              + Ajouter mon premier locataire
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locataires.map((locataire) => {
              const isEntreprise = locataire.typeLocataire === 'ENTREPRISE';
              
              return (
                <div
                  key={locataire.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden"
                >
                  {/* Header avec icône et actions */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isEntreprise ? (
                        <Building2 className="h-8 w-8 text-white" />
                      ) : (
                        <User className="h-8 w-8 text-white" />
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isEntreprise 
                          ? 'bg-white/20 text-white' 
                          : 'bg-white/20 text-white'
                      }`}>
                        {isEntreprise ? '🏢 Entreprise' : '👤 Particulier'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditForm(locataire)}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4 text-white" />
                      </button>
                      <button
                        onClick={() => setLocataireToDelete(locataire)}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-6">
                    {/* Nom / Raison sociale */}
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {isEntreprise ? locataire.raisonSociale : `${locataire.prenom} ${locataire.nom}`}
                    </h3>
                    
                    {/* Contact (nom pour entreprise) */}
                    {isEntreprise && (
                      <p className="text-sm text-gray-600 mb-3">
                        Contact: {locataire.prenom} {locataire.nom}
                      </p>
                    )}

                    {/* Infos entreprise */}
                    {isEntreprise && (
                      <div className="space-y-1 mb-4 text-sm">
                        {locataire.siret && (
                          <p className="text-gray-600">
                            <span className="font-semibold">SIRET:</span> {locataire.siret}
                          </p>
                        )}
                        {locataire.formeJuridique && (
                          <p className="text-gray-600">
                            <span className="font-semibold">Forme:</span> {locataire.formeJuridique}
                          </p>
                        )}
                        {locataire.capitalSocial && (
                          <p className="text-gray-600">
                            <span className="font-semibold">Capital:</span> {locataire.capitalSocial.toLocaleString('fr-FR')} €
                          </p>
                        )}
                      </div>
                    )}

                    {/* Contact */}
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {locataire.email}
                      </p>
                      {locataire.telephone && (
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {locataire.telephone}
                        </p>
                      )}
                      {locataire.ville && (
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {locataire.ville}
                        </p>
                      )}
                    </div>

                    {/* Bien loué */}
                    {locataire.bien && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-gray-500 mb-1">Bien loué:</p>
                        <p className="text-sm font-semibold text-blue-600">
                          {locataire.bien.adresse}, {locataire.bien.ville}
                        </p>
                      </div>
                    )}

                    {/* Dates */}
                    {locataire.dateEntree && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-gray-500">
                          Entrée: {new Date(locataire.dateEntree).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Formulaire */}
      {showForm && (
        <LocataireForm
          onClose={closeForm}
          onSubmit={locataireToEdit ? handleUpdateLocataire : handleCreateLocataire}
          locataireToEdit={locataireToEdit}
          biensList={biens}
        />
      )}

      {/* Modal Confirmation Suppression */}
      {locataireToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              🗑️ Supprimer ce locataire ?
            </h3>
            <p className="text-gray-600 mb-2">
              Êtes-vous sûr de vouloir supprimer :
            </p>
            <p className="font-semibold text-gray-900 mb-6">
              {locataireToDelete.typeLocataire === 'ENTREPRISE' 
                ? locataireToDelete.raisonSociale 
                : `${locataireToDelete.prenom} ${locataireToDelete.nom}`}
            </p>
            <p className="text-sm text-red-600 mb-6">
              ⚠️ Cette action est irréversible !
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setLocataireToDelete(null)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteLocataire(locataireToDelete.id)}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocatairesPage;