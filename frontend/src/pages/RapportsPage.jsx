import { useState, useEffect } from 'react';
import { useSpace } from '../contexts/SpaceContext';
import { FileText, Plus, Download, Calendar, FileCheck, Trash2, Loader } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const TYPES_RAPPORT = {
  COMPLET: { label: 'Complet', icon: '📊', description: 'Rapport détaillé complet' },
  SIMPLIFIE: { label: 'Simplifié', icon: '📝', description: 'Rapport synthétique' },
  FISCAL: { label: 'Fiscal', icon: '💼', description: 'Pour déclaration fiscale' },
};

const STATUTS = {
  BROUILLON: { label: 'Brouillon', color: 'accent-orange', icon: '✏️' },
  GENERE: { label: 'Généré', color: 'accent-green', icon: '✅' },
  ARCHIVE: { label: 'Archivé', color: 'light-500', icon: '📦' },
};

function RapportsPage() {
  const { currentSpace } = useSpace();
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [generating, setGenerating] = useState(null);

  useEffect(() => {
    if (currentSpace) {
      loadRapports();
    }
  }, [currentSpace]);

  const loadRapports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/spaces/${currentSpace.id}/rapports`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRapports(response.data.data);
    } catch (err) {
      console.error('Erreur chargement rapports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerer = async (rapportId) => {
    if (!confirm('Générer le rapport PDF ?')) return;

    try {
      setGenerating(rapportId);
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/spaces/${currentSpace.id}/rapports/${rapportId}/generer`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await loadRapports();
      alert('Rapport généré avec succès !');
    } catch (err) {
      console.error('Erreur génération:', err);
      alert('Erreur lors de la génération');
    } finally {
      setGenerating(null);
    }
  };

  const handleDownload = async (rapportId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/spaces/${currentSpace.id}/rapports/${rapportId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Erreur téléchargement:', err);
      alert('Erreur lors du téléchargement');
    }
  };

  const handleDelete = async (rapportId) => {
    if (!confirm('Supprimer ce rapport ?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_URL}/spaces/${currentSpace.id}/rapports/${rapportId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await loadRapports();
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-dark-950">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  const headerActions = (
    <button 
      onClick={() => setShowCreateModal(true)}
      className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl shadow-accent-blue/30 hover:shadow-2xl hover:shadow-accent-blue/40 hover:scale-105"
    >
      <Plus className="h-5 w-5" />
      Nouveau rapport
    </button>
  );

  return (
    <PageLayout
      title="Rapports Annuels"
      subtitle={`${rapports.length} rapport${rapports.length > 1 ? 's' : ''}`}
      headerActions={headerActions}
    >
      {/* Stats */}
      {rapports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-dark-900 rounded-2xl border border-dark-600/30 p-6 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-accent-blue/20 rounded-xl">
                <FileText className="h-6 w-6 text-accent-blue" />
              </div>
              <h3 className="text-sm font-semibold text-light-400">Total rapports</h3>
            </div>
            <p className="text-3xl font-bold text-white">{rapports.length}</p>
          </div>

          <div className="bg-dark-900 rounded-2xl border border-dark-600/30 p-6 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-accent-green/20 rounded-xl">
                <FileCheck className="h-6 w-6 text-accent-green" />
              </div>
              <h3 className="text-sm font-semibold text-light-400">Générés</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {rapports.filter(r => r.statut === 'GENERE').length}
            </p>
          </div>

          <div className="bg-dark-900 rounded-2xl border border-dark-600/30 p-6 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-accent-purple/20 rounded-xl">
                <Calendar className="h-6 w-6 text-accent-purple" />
              </div>
              <h3 className="text-sm font-semibold text-light-400">Dernière année</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {rapports.length > 0 ? Math.max(...rapports.map(r => r.annee)) : '-'}
            </p>
          </div>

          <div className="bg-dark-900 rounded-2xl border border-dark-600/30 p-6 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-accent-blue/20 rounded-xl">
                <Download className="h-6 w-6 text-accent-blue" />
              </div>
              <h3 className="text-sm font-semibold text-light-400">Taille totale</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {formatFileSize(rapports.reduce((sum, r) => sum + (r.tailleFichier || 0), 0))}
            </p>
          </div>
        </div>
      )}

      {/* Liste des rapports */}
      {rapports.length > 0 ? (
        <div className="space-y-5">
          {rapports.map((rapport) => {
            const typeInfo = TYPES_RAPPORT[rapport.type] || TYPES_RAPPORT.COMPLET;
            const statutInfo = STATUTS[rapport.statut] || STATUTS.BROUILLON;
            const isGenerating = generating === rapport.id;

            return (
              <div
                key={rapport.id}
                className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card hover:shadow-card-hover transition p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{typeInfo.icon}</span>
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          {rapport.nom}
                        </h3>
                        <p className="text-light-400 text-sm mt-1">
                          Année {rapport.annee} • {typeInfo.label}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-4">
                      <span className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full border bg-${statutInfo.color}/20 text-${statutInfo.color} border-${statutInfo.color}/30`}>
                        {statutInfo.icon} {statutInfo.label}
                      </span>

                      <div className="flex items-center gap-2 text-light-400">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {new Date(rapport.dateDebut).toLocaleDateString('fr-FR')} - {new Date(rapport.dateFin).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      {rapport.tailleFichier && (
                        <div className="flex items-center gap-2 text-light-400">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm font-medium">{formatFileSize(rapport.tailleFichier)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {rapport.statut === 'BROUILLON' && (
                      <button
                        onClick={() => handleGenerer(rapport.id)}
                        disabled={isGenerating}
                        className="p-2.5 bg-accent-green/10 hover:bg-accent-green/20 rounded-xl border border-accent-green/20 transition disabled:opacity-50"
                        title="Générer le PDF"
                      >
                        {isGenerating ? (
                          <Loader className="h-4 w-4 text-accent-green animate-spin" />
                        ) : (
                          <FileCheck className="h-4 w-4 text-accent-green" />
                        )}
                      </button>
                    )}

                    {rapport.statut === 'GENERE' && rapport.urlPdf && (
                      <button
                        onClick={() => handleDownload(rapport.id)}
                        className="p-2.5 bg-accent-blue/10 hover:bg-accent-blue/20 rounded-xl border border-accent-blue/20 transition"
                        title="Télécharger"
                      >
                        <Download className="h-4 w-4 text-accent-blue" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(rapport.id)}
                      className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/20 transition"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-dark-900 rounded-3xl border border-dark-600/30 shadow-card p-20 text-center">
          <FileText className="h-20 w-20 text-accent-blue/50 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun rapport</h3>
          <p className="text-light-300 mb-6">
            Créez votre premier rapport annuel pour documenter votre activité
          </p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-2xl font-semibold transition-all shadow-xl"
          >
            <Plus className="h-5 w-5" />
            Créer un rapport
          </button>
        </div>
      )}

      {/* Modal création */}
      {showCreateModal && (
        <CreateRapportModal 
          spaceId={currentSpace.id}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadRapports();
          }}
        />
      )}
    </PageLayout>
  );
}

// Modal de création
function CreateRapportModal({ spaceId, onClose, onCreated }) {
  const currentYear = new Date().getFullYear();
  const [nom, setNom] = useState(`Rapport ${currentYear}`);
  const [annee, setAnnee] = useState(currentYear);
  const [type, setType] = useState('COMPLET');
  const [loading, setLoading] = useState(false);
  const [genererImmediatement, setGenererImmediatement] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Créer le rapport
      const response = await axios.post(
        `${API_URL}/spaces/${spaceId}/rapports`,
        { nom, annee, type },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Générer immédiatement si demandé
      if (genererImmediatement) {
        await axios.post(
          `${API_URL}/spaces/${spaceId}/rapports/${response.data.data.id}/generer`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert('Rapport créé et généré avec succès !');
      }

      onCreated();
    } catch (err) {
      console.error('Erreur création:', err);
      alert('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-[9998] backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none">
        <div className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-2xl max-w-lg w-full p-8 pointer-events-auto">
          <h2 className="text-3xl font-bold text-white mb-6">Nouveau rapport</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-light-400 mb-2">Nom *</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                placeholder="Ex: Rapport Annuel 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-light-400 mb-2">Année *</label>
              <input
                type="number"
                value={annee}
                onChange={(e) => setAnnee(parseInt(e.target.value))}
                min="2000"
                max={currentYear + 1}
                required
                className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-light-400 mb-2">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 bg-dark-950 border border-dark-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
              >
                {Object.entries(TYPES_RAPPORT).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.icon} {info.label} - {info.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="generer"
                checked={genererImmediatement}
                onChange={(e) => setGenererImmediatement(e.target.checked)}
                className="w-5 h-5 rounded accent-accent-blue"
              />
              <label htmlFor="generer" className="text-sm text-light-300">
                Générer le PDF immédiatement
              </label>
            </div>

            <div className="flex gap-4 pt-6">
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
                className="flex-1 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue-light hover:to-accent-purple-light rounded-xl transition font-semibold disabled:opacity-50"
              >
                {loading ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default RapportsPage;
