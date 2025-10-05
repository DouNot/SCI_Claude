import { useState, useEffect } from 'react';
import { documentsAPI, biensAPI } from '../services/api';
import { Plus, Search, FileText, Download, Calendar } from 'lucide-react';
import DocumentForm from '../components/DocumentForm';
import PageLayout from '../components/PageLayout';

function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [biens, setBiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [documentToEdit, setDocumentToEdit] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const [docsRes, biensRes] = await Promise.all([
        documentsAPI.getAll(),
        biensAPI.getAll()
      ]);
      setDocuments(docsRes.data);
      setBiens(biensRes.data);
    } catch (err) {
      console.error('Erreur chargement documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async (documentData) => {
    try {
      await documentsAPI.create(documentData);
      await loadDocuments();
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateDocument = async (id, documentData) => {
    try {
      await documentsAPI.update(id, documentData);
      await loadDocuments();
      setDocumentToEdit(null);
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setDocumentToEdit(null);
  };

  const types = [
    { id: 'all', label: 'Tous' },
    { id: 'ACTE_VENTE', label: 'Actes de vente' },
    { id: 'DPE', label: 'DPE' },
    { id: 'BAIL', label: 'Baux' },
    { id: 'DIAGNOSTIC', label: 'Diagnostics' },
    { id: 'FACTURE', label: 'Factures' },
    { id: 'AUTRE', label: 'Autres' }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchSearch = searchTerm === '' ||
      doc.nom?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchType = filterType === 'all' || doc.type === filterType;

    return matchSearch && matchType;
  });

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
      Ajouter un document
    </button>
  );

  return (
    <PageLayout
      title="Documents"
      subtitle={`${documents.length} document${documents.length > 1 ? 's' : ''}`}
      headerActions={headerActions}
    >
      {/* Filtres */}
      <div className="flex items-center gap-4 mb-10">
        {/* Recherche */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-accent-blue" />
          <input
            type="text"
            placeholder="Rechercher un document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-5 py-4 bg-dark-900 rounded-2xl text-white placeholder-light-400 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition shadow-card border border-dark-600/30"
          />
        </div>

        {/* Filtres type */}
        <div className="flex gap-2 overflow-x-auto">
          {types.map(type => (
            <button
              key={type.id}
              onClick={() => setFilterType(type.id)}
              className={`px-5 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all ${
                filterType === type.id 
                  ? 'bg-accent-blue/20 text-accent-blue shadow-glow-blue border border-accent-blue/30' 
                  : 'bg-dark-900 text-light-400 hover:text-white hover:bg-dark-800 border border-dark-600/30'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map(doc => (
          <div
            key={doc.id}
            className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all p-6 cursor-pointer group"
          >
            {/* Icône + Nom */}
            <div className="flex items-start gap-4 mb-5">
              <div className="p-3 bg-accent-blue/10 rounded-xl border border-accent-blue/20">
                <FileText className="h-6 w-6 text-accent-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold mb-1.5 truncate group-hover:text-accent-blue transition">
                  {doc.nom}
                </h3>
                <p className="text-sm text-light-400 font-medium">{doc.type.replace(/_/g, ' ')}</p>
              </div>
            </div>

            {/* Bien associé */}
            {doc.bien && (
              <div className="mb-4 p-3 bg-dark-800/50 rounded-xl border border-dark-700/50">
                <p className="text-sm text-light-300 font-medium">
                  📍 {doc.bien.adresse}, {doc.bien.ville}
                </p>
              </div>
            )}

            {/* Date d'expiration */}
            {doc.dateExpiration && (
              <div className="flex items-center gap-3 text-sm mb-5">
                <div className="p-2 bg-accent-orange/10 rounded-lg">
                  <Calendar className="h-4 w-4 text-accent-orange" />
                </div>
                <span className="text-light-400 font-medium">
                  Expire le {new Date(doc.dateExpiration).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}

            {/* Action */}
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-700/50 transition font-medium">
              <Download className="h-4 w-4 text-accent-green" />
              <span className="text-sm">Télécharger</span>
            </button>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="bg-dark-900 rounded-3xl border border-dark-600/30 shadow-card p-20 text-center">
          <FileText className="h-20 w-20 text-accent-blue/50 mx-auto mb-6" />
          <p className="text-light-300 text-xl">
            {searchTerm ? 'Aucun document ne correspond à votre recherche' : 'Aucun document'}
          </p>
        </div>
      )}

      {/* Modal Formulaire */}
      {showForm && (
        <DocumentForm
          onClose={closeForm}
          onSubmit={documentToEdit ? handleUpdateDocument : handleCreateDocument}
          documentToEdit={documentToEdit}
          biensList={biens}
        />
      )}
    </PageLayout>
  );
}

export default DocumentsPage;
