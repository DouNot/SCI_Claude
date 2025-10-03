import { LayoutDashboard, Home, Users, FileText, Receipt, Wrench, UserCircle, DollarSign, UsersRound } from 'lucide-react';

function Navbar({ currentPage, onNavigate }) {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo/Titre */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">🏠 SCI Claude</h1>
          </div>

          {/* Menu Navigation */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-semibold ${
                currentPage === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </button>
            
            <button
              onClick={() => onNavigate('biens')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-semibold ${
                currentPage === 'biens'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="h-5 w-5" />
              Mes Biens
            </button>

            <button
              onClick={() => onNavigate('locataires')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-semibold ${
                currentPage === 'locataires'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="h-5 w-5" />
              Locataires
            </button>

            <button
              onClick={() => onNavigate('baux')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-semibold ${
                currentPage === 'baux'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileText className="h-5 w-5" />
              Baux
            </button>

            <button
              onClick={() => onNavigate('factures')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-semibold ${
                currentPage === 'factures'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Receipt className="h-5 w-5" />
              Factures
            </button>

            <button
              onClick={() => onNavigate('travaux')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-semibold ${
                currentPage === 'travaux'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Wrench className="h-5 w-5" />
              Travaux
            </button>

            <button
              onClick={() => onNavigate('contacts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-semibold ${
                currentPage === 'contacts'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <UserCircle className="h-5 w-5" />
              Contacts
            </button>

            <button
              onClick={() => onNavigate('prets')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-semibold ${
                currentPage === 'prets'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <DollarSign className="h-5 w-5" />
              Prêts
            </button>

            <button
              onClick={() => onNavigate('associes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-semibold ${
                currentPage === 'associes'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <UsersRound className="h-5 w-5" />
              Associés
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;