import { useState, useEffect } from 'react';
import { facturesAPI, biensAPI } from '../services/api';
import { Receipt, Building2, Edit, Trash2, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import FactureForm from '../components/FactureForm';

function FacturesPage() {
  const [factures, setFactures] = useState([]);
  const [biens, setBiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [factureToEdit, setFactureToEdit] = useState(null);
  const [factureToDelete, setFactureToDelete] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [facturesData, biensData] = await Promise.all([
        facturesAPI.getAll(),
        biensAPI.getAll()
      ]);
      setFactures(facturesData.data);
      setBiens(biensData.data);
      setError(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les factures');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFacture = async (factureData) => {
    try {
      await facturesAPI.create(factureData);
      await loadData();
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateFacture = async (id, factureData) => {
    try {
      await facturesAPI.update(id, factureData);
      await loadData();
      setFactureToEdit(null);
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteFacture = async (id) => {
    try {
      await facturesAPI.delete(id);
      await loadData();
      setFactureToDelete(null);
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const openEditForm = (facture) => {
    setFactureToEdit(facture);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setFactureToEdit(null);
  };

  const getCategorieColor = (categorie) => {
    const colors = {
      TRAVAUX: 'bg-orange-100 text-orange-800',
      ENTRETIEN: 'bg-blue-100 text-blue-800',
      FOURNITURE: 'bg-purple-100 text-purple-800',
      TAXE_FONCIERE: 'bg-red-100 text-red-800',
      ASSURANCE: 'bg-green-100 text-green-800',
      COPROPRIETE: 'bg-yellow-100 text-yellow-800',
      AUTRE: 'bg-gray-100 text-gray-800',
    };
    return colors[categorie] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des factures...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800 font-semibold mb-2">Erreur</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Factures</h1>
              <p className="text-gray-600 mt-1">{factures.length} facture(s)</p>
            </div>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              + Ajouter une Facture
            </button>
          </div>
        </div>
      </div>

      {/* Liste des factures */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {factures.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Receipt className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune facture pour le moment
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par ajouter votre première facture
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              + Ajouter une facture
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {factures.map((facture) => (
              <div
                key={facture.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Receipt className="h-8 w-8 text-white" />
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategorieColor(facture.categorie)}`}>
                      {facture.categorie}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditForm(facture)}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4 text-white" />
                    </button>
                    <button
                      onClick={() => setFactureToDelete(facture)}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6">
                  {/* Fournisseur */}
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {facture.fournisseur}
                  </h3>
                  {facture.numero && (
                    <p className="text-sm text-gray-600 mb-3">N° {facture.numero}</p>
                  )}

                  {/* Bien */}
                  <div className="mb-4 pb-4 border-b">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      Bien
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {facture.bien?.adresse}
                    </p>
                    <p className="text-sm text-gray-600">{facture.bien?.ville}</p>
                  </div>

                  {/* Montants */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Montant TTC</span>
                      <span className="font-bold text-gray-900">
                        {facture.montantTTC?.toLocaleString('fr-FR')} €
                      </span>
                    </div>
                    {facture.montantHT && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Montant HT</span>
                        <span className="font-semibold">
                          {facture.montantHT?.toLocaleString('fr-FR')} €
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="text-sm text-gray-600 mb-1">
                      Date: {new Date(facture.dateFacture).toLocaleDateString('fr-FR')}
                    </div>
                    {facture.datePaiement && (
                      <div className="text-sm text-gray-600">
                        Payée le: {new Date(facture.datePaiement).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>

                  {/* Statuts */}
                  <div className="flex gap-2 items-center">
                    {facture.estPaye ? (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Payée
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-orange-600">
                        <XCircle className="h-4 w-4" />
                        Non payée
                      </span>
                    )}
                    {facture.estDeductible && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        Déductible
                      </span>
                    )}
                  </div>

                  {/* Fichier */}
                  {facture.url && (
                    <div className="mt-4 pt-4 border-t">
                      <a
                        href={`http://localhost:3000${facture.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Voir le fichier
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Formulaire */}
      {showForm && (
        <FactureForm
          onClose={closeForm}
          onSubmit={factureToEdit ? handleUpdateFacture : handleCreateFacture}
          factureToEdit={factureToEdit}
          biensList={biens}
        />
      )}

      {/* Modal Confirmation Suppression */}
      {factureToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Supprimer cette facture ?
            </h3>
            <p className="text-gray-600 mb-2">
              Êtes-vous sûr de vouloir supprimer la facture :
            </p>
            <p className="font-semibold text-gray-900 mb-2">
              {factureToDelete.fournisseur}
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Montant: {factureToDelete.montantTTC?.toLocaleString('fr-FR')} €
            </p>
            <p className="text-sm text-red-600 mb-6">
              Cette action est irréversible
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setFactureToDelete(null)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteFacture(factureToDelete.id)}
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

export default FacturesPage;
