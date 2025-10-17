import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Home, Users, UserCircle, FolderOpen, ChevronDown, Settings, UsersRound, LogOut, DollarSign, FileText, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import SpaceSwitcher from './SpaceSwitcher';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const menuItems = [
    { id: 'dashboard', path: '/dashboard', label: 'Synthèse', icon: LayoutDashboard },
    { id: 'biens', path: '/biens', label: 'Patrimoine', icon: Home },
    { id: 'locataires', path: '/locataires', label: 'Locataires', icon: Users },
    { id: 'charges', path: '/charges', label: 'Charges', icon: DollarSign },
    { id: 'evenements', path: '/evenements-fiscaux', label: 'Événements fiscaux', icon: Calendar },
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
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={
                active
                  ? 'w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transition-all'
                  : 'w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all'
              }
            >
              <Icon className="h-5 w-5" />
              <span className="font-semibold text-base">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Menu Profil */}
      <div className="p-5 border-t border-slate-700">
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-slate-800 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-base">
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-white">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-xs text-slate-400">{user?.email}</p>
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
