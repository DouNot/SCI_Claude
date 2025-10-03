import { useState, useEffect } from 'react';
import { documentsAPI, biensAPI } from '../services/api';
import { FolderOpen, Edit, Trash2, Download, FileText, AlertCircle, Calendar } from 'lucide-react';
import DocumentForm from '../components/DocumentForm';

function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [biensList, setBiensList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [documentToEdit, setDocumentToEdit] = useState(null);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [filterBien, setFilterBien] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docsResponse, biensResponse] = await Promise.all([
        documentsAPI.getAll(),
        biensAPI.getAll()
      ]);
      setDocuments(docsResponse.data);
      setBiensList(biensResponse.data);
      setError(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les documents');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async (documentData) => {
    try {
      await documentsAPI.create(documentData);
      await loadData();
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateDocument = async (id, documentData) => {
    try {
      await documentsAPI.update(id, documentData);
      await loadData();
      setDocumentToEdit(null);
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteDocument = async (id) => {
    try {
      await documentsAPI.delete(id);
      await loadData();
      setDocumentToDelete(null);
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const openEditForm = (document) => {
    setDocumentToEdit(document);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setDocumentToEdit(null);
  };

  const handleDownload = (document) => {
    window.open(`http://localhost:3000${document.url}`, '_blank');
  };

  const getTypeLabel = (type) => {
    const labels = {
      'ACTE_VENTE': 'Acte de vente',
      'DPE': 'DPE',
      'BAIL': 'Bail',
      'QUITTANCE': 'Quittance',
      'FACTURE': 'Facture',
      'DIAGNOSTIC': 'Diagnostic',
      'AUTRE': 'Autre'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      'ACTE_VENTE': 'bg-purple-100 text-purple-800',
      'DPE': 'bg-green-100 text-green-800',
      'BAIL': 'bg-blue-100 text-blue-800',
      'QUITTANCE': 'bg-yellow-100 text-yellow-800',
      'FACTURE': 'bg-red-100 text-red-800',
      'DIAGNOSTIC': 'bg-orange-100 text-orange-800',
      'AUTRE': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const isExpired = (dateExpiration) => {
    if (!dateExpiration) return false;
    return new Date(dateExpiration) < new Date();
  };

  const isExpiringSoon = (dateExpiration) => {
    if (!dateExpiration) return false;
    const today = new Date();
    const expiration = new Date(dateExpiration);
    const diffTime = expiration - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  };

  // Filtrage
  const filteredDocuments = documents.filter(doc => {
    if (filterBien && doc.bienId !== filterBien) return false;
    if (filterType && doc.type !== filterType) return false;
    return true;
  });

  // Statistiques
  const documentsExpires = documents.filter(doc => isExpired(doc.dateExpiration)).length;
  const documentsExpiringSoon = documents.filter(doc => isExpiringSoon(doc.dateExpiration)).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des documents...</p>
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📁 Documents</h1>
              <p className="text-gray-600 mt-1">{filteredDocuments.length} document(s)</p>
            </div>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              + Ajouter un Document
            </button>
          </div>

          {/* Alertes */}
          {(documentsExpires > 0 || documentsExpiringSoon > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {documentsExpires > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-900">{documentsExpires} document(s) expiré(s)</p>
                    <p className="text-sm text-red-700">Action requise</p>
                  </div>
                </div>
              )}
              {documentsExpiringSoon > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-orange-900">{documentsExpiringSoon} document(s) expire(nt) bientôt</p>
                    <p className="text-sm text-orange-700">Dans les 30 prochains jours</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrer par bien
              </label>
              <select
                value={filterBien}
                onChange={(e) => setFilterBien(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les biens</option>
                {biensList.map(bien => (
                  <option key={bien.id} value={bien.id}>
                    {bien.adresse}, {bien.ville}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrer par type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les types</option>
                <option value="ACTE_VENTE">Acte de vente</option>
                <option value="DPE">DPE</option>
                <option value="BAIL">Bail</option>
                <option value="QUITTANCE">Quittance</option>
                <option value="FACTURE">Facture</option>
                <option value="DIAGNOSTIC">Diagnostic</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des documents */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredDocuments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FolderOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun document
            </h3>
            <p className="text-gray-600 mb-6">
              {documents.length === 0 
                ? "Commencez par ajouter vos premiers documents"
                : "Aucun document ne correspond aux filtres sélectionnés"}
            </p>
            {documents.length === 0 && (
              <button 
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                + Ajouter un document
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((document) => {
              const expired = isExpired(document.dateExpiration);
              const expiringSoon = isExpiringSoon(document.dateExpiration);

              return (
                <div
                  key={document.id}
                  className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden ${
                    expired ? 'border-2 border-red-500' : expiringSoon ? 'border-2 border-orange-500' : ''
                  }`}
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 flex items-center justify-between">
                    <FileText className="h-8 w-8 text-white" />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(document)}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
                        title="Télécharger"
                      >
                        <Download className="h-4 w-4 text-white" />
                      </button>
                      <button
                        onClick={() => openEditForm(document)}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4 text-white" />
                      </button>
                      <button
                        onClick={() => setDocumentToDelete(document)}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-6">
                    {/* Type */}
                    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${getTypeColor(document.type)}`}>
                      {getTypeLabel(document.type)}
                    </span>

                    {/* Nom */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {document.nom}
                    </h3>

                    {/* Bien */}
                    {document.bien && (
                      <p className="text-sm text-gray-600 mb-4">
                        {document.bien.adresse}, {document.bien.ville}
                      </p>
                    )}

                    {/* Dates */}
                    <div className="space-y-2">
                      {document.dateDocument && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Date : {new Date(document.dateDocument).toLocaleDateString('fr-FR')}</span>
                        </div>
                      )}
                      {document.dateExpiration && (
                        <div className={`flex items-center gap-2 text-sm ${
                          expired ? 'text-red-600 font-semibold' : 
                          expiringSoon ? 'text-orange-600 font-semibold' : 
                          'text-gray-600'
                        }`}>
                          <AlertCircle className="h-4 w-4" />
                          <span>
                            Expire le {new Date(document.dateExpiration).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Alerte expiration */}
                    {expired && (
                      <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800 font-semibold">
                          Document expiré
                        </p>
                      </div>
                    )}
                    {expiringSoon && !expired && (
                      <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-sm text-orange-800 font-semibold">
                          Expire bientôt
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
        <DocumentForm
          onClose={closeForm}
          onSubmit={documentToEdit ? handleUpdateDocument : handleCreateDocument}
          documentToEdit={documentToEdit}
          biensList={biensList}
        />
      )}

      {/* Modal Confirmation Suppression */}
      {documentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Supprimer ce document ?
            </h3>
            <p className="text-gray-600 mb-2">
              Êtes-vous sûr de vouloir supprimer :
            </p>
            <p className="font-semibold text-gray-900 mb-6">
              {documentToDelete.nom}
            </p>
            <p className="text-sm text-red-600 mb-6">
              Cette action est irréversible
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDocumentToDelete(null)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteDocument(documentToDelete.id)}
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

export default DocumentsPage;