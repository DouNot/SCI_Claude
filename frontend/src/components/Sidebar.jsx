import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  UserCircle, 
  FolderOpen, 
  ChevronDown, 
  ChevronRight,
  Settings, 
  UsersRound, 
  LogOut, 
  DollarSign, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Wallet, 
  Briefcase,
  CreditCard,
  Hammer,
  Calculator,
  PieChart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSpace } from '../contexts/SpaceContext';
import NotificationBell from './NotificationBell';
import SpaceSwitcher from './SpaceSwitcher';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { currentSpace } = useSpace();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // États pour les sous-menus expansibles
  const [expandedSections, setExpandedSections] = useState({
    charges: false,
    outils: false,
    parametres: false
  });

  // Menu principal
  const mainMenuItems = [
    { id: 'dashboard', path: '/dashboard', label: 'Synthèse', icon: LayoutDashboard },
    { id: 'biens', path: '/biens', label: 'Biens', icon: Home },
    { id: 'locataires', path: '/locataires', label: 'Locataires', icon: Users },
    { id: 'prets', path: '/prets', label: 'Prêts', icon: CreditCard },
    { id: 'travaux', path: '/travaux', label: 'Travaux', icon: Hammer },
  ];

  // Section Charges & Taxes
  const chargesItems = [
    { id: 'charges', path: '/charges', label: 'Charges', icon: DollarSign },
    { id: 'evenements', path: '/evenements-fiscaux', label: 'Événements fiscaux', icon: Calendar },
  ];

  // Section Outils
  const outilsItems = [
    { id: 'projections', path: '/projections', label: 'Projections', icon: TrendingUp },
    { id: 'business-plans', path: '/business-plans', label: 'Business Plan', icon: Briefcase },
    { id: 'rapports', path: '/rapports', label: 'Rapports', icon: FileText },
  ];

  // Autres pages
  const otherMenuItems = [
    { id: 'contacts', path: '/contacts', label: 'Contacts', icon: UserCircle },
    { id: 'documents', path: '/documents', label: 'Documents', icon: FolderOpen },
  ];

  const handleLogout = () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
      navigate('/login');
    }
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Vérifier si on est dans un espace SCI (DOIT être déclaré avant son utilisation)
  const isSCISpace = currentSpace?.type === 'SCI';

  // Auto-expand section si une page de cette section est active
  const isChargesSectionActive = chargesItems.some(item => isActive(item.path));
  const isOutilsSectionActive = outilsItems.some(item => isActive(item.path));

  // Déterminer ce qu'on affiche dans le profil
  const profileName = isSCISpace && currentSpace?.nom 
    ? currentSpace.nom 
    : `${user?.prenom || ''} ${user?.nom || ''}`.trim();
  
  const profileSubtext = isSCISpace && currentSpace?.nom
    ? currentSpace.formeJuridique || 'SCI'
    : user?.email || '';

  // Initiales pour l'avatar
  const avatarInitials = isSCISpace && currentSpace?.nom
    ? currentSpace.nom.substring(0, 2).toUpperCase()
    : `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`;

  // Composant pour un item de menu simple
  const MenuItem = ({ item }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    
    return (
      <button
        onClick={() => navigate(item.path)}
        className={
          active
            ? 'w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transition-all'
            : 'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all'
        }
      >
        <Icon className="h-5 w-5" />
        <span className="font-medium">{item.label}</span>
      </button>
    );
  };

  // Composant pour un sous-item de menu
  const SubMenuItem = ({ item }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    
    return (
      <button
        onClick={() => navigate(item.path)}
        className={
          active
            ? 'w-full flex items-center gap-3 pl-12 pr-4 py-2.5 rounded-xl bg-blue-500/20 text-blue-400 transition-all'
            : 'w-full flex items-center gap-3 pl-12 pr-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all'
        }
      >
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{item.label}</span>
      </button>
    );
  };

  // Composant pour une section expansible
  const ExpandableSection = ({ title, icon: Icon, items, sectionKey, sectionActive }) => {
    const isExpanded = expandedSections[sectionKey] || sectionActive;
    
    return (
      <div>
        <button
          onClick={() => toggleSection(sectionKey)}
          className={
            sectionActive
              ? 'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-800 text-white transition-all'
              : 'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all'
          }
        >
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5" />
            <span className="font-medium">{title}</span>
          </div>
          <ChevronRight 
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        </button>
        
        {isExpanded && (
          <div className="mt-1 space-y-1">
            {items.map(item => (
              <SubMenuItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-72 bg-slate-900 border-r border-slate-700 flex flex-col h-full shadow-xl">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SCI Manager</h1>
              <p className="text-xs text-slate-400">Gestion immobilière</p>
            </div>
          </div>
          <NotificationBell />
        </div>
      </div>

      {/* Space Switcher */}
      <div className="px-4 pt-4 pb-2">
        <SpaceSwitcher />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Menu principal */}
        {mainMenuItems.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}

        {/* Section Charges & Taxes */}
        <ExpandableSection
          title="Charges & Taxes"
          icon={PieChart}
          items={chargesItems}
          sectionKey="charges"
          sectionActive={isChargesSectionActive}
        />

        {/* Section Outils */}
        <ExpandableSection
          title="Outils"
          icon={Calculator}
          items={outilsItems}
          sectionKey="outils"
          sectionActive={isOutilsSectionActive}
        />

        {/* Autres pages */}
        {otherMenuItems.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </nav>

      {/* Menu Profil */}
      <div className="p-5 border-t border-slate-700">
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-slate-800 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-base">
              {avatarInitials}
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-white">
                {profileName}
              </p>
              <p className="text-xs text-slate-400">{profileSubtext}</p>
            </div>
            <ChevronDown 
              className={`h-5 w-5 text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} 
            />
          </button>

          {showProfileMenu && (
            <>
              <div 
                className="fixed inset-0 z-10 bg-black/40 backdrop-blur-sm" 
                onClick={() => setShowProfileMenu(false)}
              />
              
              <div className="absolute bottom-full left-0 right-0 mb-3 bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl py-2 z-20">
                {/* Membres et Associés : uniquement pour SCI */}
                {isSCISpace && (
                  <>
                    <button
                      onClick={() => {
                        navigate('/members');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                    >
                      <Users className="h-5 w-5 text-green-400" />
                      <span className="font-medium">Membres</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate('/associes');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                    >
                      <UsersRound className="h-5 w-5 text-purple-400" />
                      <span className="font-medium">Associés</span>
                    </button>
                    
                    <div className="border-t border-slate-600 my-2"></div>
                  </>
                )}
                
                <button
                  onClick={() => {
                    navigate('/comptes');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                >
                  <Wallet className="h-5 w-5 text-emerald-400" />
                  <span className="font-medium">Comptes</span>
                </button>
                
                <button
                  onClick={() => {
                    navigate('/parametres');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                >
                  <Settings className="h-5 w-5 text-blue-400" />
                  <span className="font-medium">Paramètres</span>
                </button>
                
                <div className="border-t border-slate-600 my-2"></div>
                
                <button 
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Déconnexion</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
