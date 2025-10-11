import { useState } from 'react';
import { LayoutDashboard, Home, Users, UserCircle, FolderOpen, ChevronDown, Settings, UsersRound, LogOut, DollarSign } from 'lucide-react';
import NotificationBell from './NotificationBell';

function Sidebar({ currentPage, onNavigate }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Synthèse', icon: LayoutDashboard },
    { id: 'biens', label: 'Patrimoine', icon: Home },
    { id: 'locataires', label: 'Locataires', icon: Users },
    { id: 'charges', label: 'Charges', icon: DollarSign },
    { id: 'contacts', label: 'Contacts', icon: UserCircle },
    { id: 'documents', label: 'Documents', icon: FolderOpen },
  ];

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
              <h1 className="text-xl font-bold text-white">Je sais app</h1>
              <p className="text-xs text-slate-400">Gestion SCI</p>
            </div>
          </div>
          <NotificationBell />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || (currentPage === 'bien-detail' && item.id === 'biens');
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={
                isActive
                  ? 'w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-300 hover:text-white hover:bg-slate-800'
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
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-slate-800"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-base">
              MS
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-white">Ma SCI</p>
              <p className="text-xs text-slate-400">Compte principal</p>
            </div>
            <ChevronDown className={showProfileMenu ? 'h-5 w-5 text-slate-400 rotate-180' : 'h-5 w-5 text-slate-400'} />
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
                    onNavigate('associes');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-700 text-slate-300 hover:text-white"
                >
                  <UsersRound className="h-5 w-5 text-purple-400" />
                  <span className="font-medium">Associés</span>
                </button>
                
                <button
                  onClick={() => {
                    onNavigate('parametres');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-700 text-slate-300 hover:text-white"
                >
                  <Settings className="h-5 w-5 text-blue-400" />
                  <span className="font-medium">Paramètres</span>
                </button>
                
                <div className="border-t border-slate-600 my-2"></div>
                
                <button 
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-500/10 text-red-400 hover:text-red-300"
                  onClick={() => alert('Déconnexion (V2)')}
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
