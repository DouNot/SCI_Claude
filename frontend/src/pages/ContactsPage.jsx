import { useState, useEffect } from 'react';
import { contactsAPI } from '../services/api';
import { Plus, Search, Phone, Mail, MapPin, Star } from 'lucide-react';
import ContactForm from '../components/ContactForm';
import PageLayout from '../components/PageLayout';

function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [contactToEdit, setContactToEdit] = useState(null);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await contactsAPI.getAll();
      setContacts(response.data);
    } catch (err) {
      console.error('Erreur chargement contacts:', err);
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

  const closeForm = () => {
    setShowForm(false);
    setContactToEdit(null);
  };

  const categories = [
    { id: 'all', label: 'Tous' },
    { id: 'ARTISAN', label: 'Artisans' },
    { id: 'NOTAIRE', label: 'Notaires' },
    { id: 'COMPTABLE', label: 'Comptables' },
    { id: 'ASSUREUR', label: 'Assureurs' },
    { id: 'BANQUE', label: 'Banques' },
    { id: 'AUTRE', label: 'Autres' }
  ];

  const filteredContacts = contacts.filter(contact => {
    const matchSearch = searchTerm === '' ||
      contact.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.entreprise?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategorie = filterCategorie === 'all' || contact.categorie === filterCategorie;

    return matchSearch && matchCategorie;
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
      Ajouter un contact
    </button>
  );

  return (
    <PageLayout
      title="Contacts utiles"
      subtitle={`${contacts.length} contact${contacts.length > 1 ? 's' : ''}`}
      headerActions={headerActions}
    >
      {/* Filtres */}
      <div className="flex items-center gap-4 mb-10">
        {/* Recherche */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-accent-blue" />
          <input
            type="text"
            placeholder="Rechercher un contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-5 py-4 bg-dark-900 rounded-2xl text-white placeholder-light-400 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition shadow-card border border-dark-600/30"
          />
        </div>

        {/* Filtres catégorie */}
        <div className="flex gap-2 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCategorie(cat.id)}
              className={`px-5 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all ${
                filterCategorie === cat.id 
                  ? 'bg-accent-blue/20 text-accent-blue shadow-glow-blue border border-accent-blue/30' 
                  : 'bg-dark-900 text-light-400 hover:text-white hover:bg-dark-800 border border-dark-600/30'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grille de contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map(contact => (
          <div
            key={contact.id}
            className="bg-dark-900 rounded-2xl border border-dark-600/30 shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all p-6"
          >
            {/* En-tête */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1.5">{contact.nom}</h3>
                {contact.entreprise && (
                  <p className="text-sm text-light-400">{contact.entreprise}</p>
                )}
              </div>
              {contact.evaluation && (
                <div className="flex items-center gap-1.5 bg-accent-purple/20 px-3 py-1.5 rounded-xl border border-accent-purple/30">
                  <Star className="h-3.5 w-3.5 text-accent-purple fill-accent-purple" />
                  <span className="text-xs font-bold text-accent-purple">{contact.evaluation}</span>
                </div>
              )}
            </div>

            {/* Catégorie */}
            <div className="mb-5">
              <span className="inline-block px-4 py-1.5 bg-accent-blue/20 text-accent-blue text-xs font-semibold rounded-full border border-accent-blue/30">
                {contact.categorie}
              </span>
            </div>

            {/* Coordonnées */}
            <div className="space-y-3 mb-5">
              {contact.telephone && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-accent-green/10 rounded-lg">
                    <Phone className="h-4 w-4 text-accent-green" />
                  </div>
                  <a href={`tel:${contact.telephone}`} className="text-light-300 hover:text-white transition font-medium">
                    {contact.telephone}
                  </a>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-accent-blue/10 rounded-lg">
                    <Mail className="h-4 w-4 text-accent-blue" />
                  </div>
                  <a href={`mailto:${contact.email}`} className="text-light-300 hover:text-white transition truncate font-medium">
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.adresse && (
                <div className="flex items-start gap-3 text-sm">
                  <div className="p-2 bg-accent-orange/10 rounded-lg">
                    <MapPin className="h-4 w-4 text-accent-orange" />
                  </div>
                  <p className="text-light-300 font-medium">{contact.adresse}</p>
                </div>
              )}
            </div>

            {/* Notes */}
            {contact.notes && (
              <div className="pt-5 border-t border-dark-700/50">
                <p className="text-xs text-light-500 line-clamp-2">{contact.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <div className="bg-dark-900 rounded-3xl border border-dark-600/30 shadow-card p-20 text-center">
          <Phone className="h-20 w-20 text-accent-blue/50 mx-auto mb-6" />
          <p className="text-light-300 text-xl">
            {searchTerm ? 'Aucun contact ne correspond à votre recherche' : 'Aucun contact'}
          </p>
        </div>
      )}

      {/* Modal Formulaire */}
      {showForm && (
        <ContactForm
          onClose={closeForm}
          onSubmit={contactToEdit ? handleUpdateContact : handleCreateContact}
          contactToEdit={contactToEdit}
        />
      )}
    </PageLayout>
  );
}

export default ContactsPage;
