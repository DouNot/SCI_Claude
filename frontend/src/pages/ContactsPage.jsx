import { useState, useEffect } from 'react';
import { contactsAPI } from '../services/api';
import { UserCircle, Edit, Trash2, Mail, Phone, MapPin, Globe, Building2 } from 'lucide-react';
import ContactForm from '../components/ContactForm';

function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [contactToEdit, setContactToEdit] = useState(null);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await contactsAPI.getAll();
      setContacts(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContact = async (contactData) => {
    try {
      await contactsAPI.create(contactData);
      await loadContacts();
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateContact = async (id, contactData) => {
    try {
      await contactsAPI.update(id, contactData);
      await loadContacts();
      setContactToEdit(null);
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      await contactsAPI.delete(id);
      await loadContacts();
      setContactToDelete(null);
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const openEditForm = (contact) => {
    setContactToEdit(contact);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setContactToEdit(null);
  };

  const getTypeLabel = (type) => {
    const labels = {
      NOTAIRE: 'Notaire',
      COMPTABLE: 'Comptable',
      AVOCAT: 'Avocat',
      AGENT_IMMO: 'Agent Immobilier',
      ARTISAN: 'Artisan',
      SYNDIC: 'Syndic',
      ASSUREUR: 'Assureur',
      BANQUIER: 'Banquier',
      AUTRE: 'Autre',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      NOTAIRE: 'bg-purple-100 text-purple-800',
      COMPTABLE: 'bg-blue-100 text-blue-800',
      AVOCAT: 'bg-red-100 text-red-800',
      AGENT_IMMO: 'bg-green-100 text-green-800',
      ARTISAN: 'bg-orange-100 text-orange-800',
      SYNDIC: 'bg-teal-100 text-teal-800',
      ASSUREUR: 'bg-indigo-100 text-indigo-800',
      BANQUIER: 'bg-pink-100 text-pink-800',
      AUTRE: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const filteredContacts = filterType === 'ALL' 
    ? contacts 
    : contacts.filter(c => c.type === filterType);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des contacts...</p>
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
            onClick={loadContacts}
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
              <h1 className="text-3xl font-bold text-gray-900">👥 Contacts Professionnels</h1>
              <p className="text-gray-600 mt-1">{filteredContacts.length} contact(s)</p>
            </div>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              + Ajouter un Contact
            </button>
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterType === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous ({contacts.length})
            </button>
            {['NOTAIRE', 'COMPTABLE', 'AVOCAT', 'AGENT_IMMO', 'ARTISAN', 'SYNDIC', 'ASSUREUR', 'BANQUIER', 'AUTRE'].map(type => {
              const count = contacts.filter(c => c.type === type).length;
              if (count === 0) return null;
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filterType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getTypeLabel(type)} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Liste des contacts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredContacts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <UserCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun contact pour le moment
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par ajouter vos contacts professionnels
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              + Ajouter un contact
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserCircle className="h-10 w-10 text-white" />
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(contact.type)}`}>
                      {getTypeLabel(contact.type)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditForm(contact)}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4 text-white" />
                    </button>
                    <button
                      onClick={() => setContactToDelete(contact)}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6">
                  {/* Nom */}
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {contact.prenom} {contact.nom}
                  </h3>
                  
                  {/* Entreprise */}
                  {contact.entreprise && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Building2 className="h-4 w-4" />
                      <span>{contact.entreprise}</span>
                    </div>
                  )}

                  {/* Coordonnées */}
                  <div className="space-y-2 mb-4">
                    {contact.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <a href={`mailto:${contact.email}`} className="hover:text-blue-600 truncate">
                          {contact.email}
                        </a>
                      </div>
                    )}
                    {contact.telephone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <a href={`tel:${contact.telephone}`} className="hover:text-blue-600">
                          {contact.telephone}
                        </a>
                      </div>
                    )}
                    {contact.adresse && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="line-clamp-1">{contact.adresse}</span>
                      </div>
                    )}
                    {contact.siteWeb && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Globe className="h-4 w-4 flex-shrink-0" />
                        <a 
                          href={contact.siteWeb} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 truncate"
                        >
                          Site web
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {contact.notes && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Notes</p>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {contact.notes}
                      </p>
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
        <ContactForm
          onClose={closeForm}
          onSubmit={contactToEdit ? handleUpdateContact : handleCreateContact}
          contactToEdit={contactToEdit}
        />
      )}

      {/* Modal Confirmation Suppression */}
      {contactToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Supprimer ce contact ?
            </h3>
            <p className="text-gray-600 mb-2">
              Êtes-vous sûr de vouloir supprimer le contact :
            </p>
            <p className="font-semibold text-gray-900 mb-2">
              {contactToDelete.prenom} {contactToDelete.nom}
            </p>
            {contactToDelete.entreprise && (
              <p className="text-sm text-gray-600 mb-4">
                {contactToDelete.entreprise}
              </p>
            )}
            <p className="text-sm text-red-600 mb-6">
              Cette action est irréversible
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setContactToDelete(null)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteContact(contactToDelete.id)}
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

export default ContactsPage;