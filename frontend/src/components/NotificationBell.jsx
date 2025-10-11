import { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2, CheckCheck, AlertCircle, Calendar, Home, DollarSign, Wrench } from 'lucide-react';
import { notificationsAPI } from '../services/api';

const PRIORITE_COLORS = {
  'BASSE': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  'NORMALE': 'text-light-400 bg-dark-700/50 border-dark-600',
  'HAUTE': 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  'URGENTE': 'text-red-400 bg-red-500/10 border-red-500/30',
};

const TYPE_ICONS = {
  'LOYER': Calendar,
  'CHARGE': DollarSign,
  'BAIL': Home,
  'FISCAL': AlertCircle,
  'TRAVAUX': Wrench,
  'AUTRE': Bell,
};

function NotificationBell() {
  const [showPanel, setShowPanel] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nonLuesCount, setNonLuesCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    
    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(() => {
      loadNotifications();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll();
      setNotifications(response.data);
      setNonLuesCount(response.data.filter(n => n.statut === 'NON_LUE').length);
    } catch (err) {
      console.error('Erreur chargement notifications:', err);
    }
  };

  const handleMarquerCommeLue = async (id) => {
    try {
      await notificationsAPI.marquerCommeLue(id);
      await loadNotifications();
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const handleMarquerToutesCommeLues = async () => {
    try {
      setLoading(true);
      await notificationsAPI.marquerToutesCommeLues();
      await loadNotifications();
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSupprimer = async (id) => {
    try {
      await notificationsAPI.delete(id);
      await loadNotifications();
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const handleSupprimerToutesLues = async () => {
    try {
      setLoading(true);
      await notificationsAPI.supprimerToutesLues();
      await loadNotifications();
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenererNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.generer();
      await loadNotifications();
      if (response.count === 0) {
        alert('Aucune nouvelle notification à générer');
      } else {
        alert(`${response.count} nouvelle(s) notification(s) générée(s)`);
      }
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la génération des notifications');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <>
      {/* Bouton cloche */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-3 hover:bg-slate-800 rounded-2xl transition"
      >
        <Bell className="h-6 w-6 text-slate-300" />
        {nonLuesCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {nonLuesCount > 9 ? '9+' : nonLuesCount}
          </span>
        )}
      </button>

      {/* Panneau des notifications */}
      {showPanel && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowPanel(false)}
          />
          
          {/* Panneau */}
          <div className="fixed right-4 top-20 w-96 max-h-[600px] bg-dark-900 border border-dark-600/30 rounded-3xl shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-dark-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Bell className="h-5 w-5 text-accent-blue" />
                  Notifications
                </h3>
                <button
                  onClick={() => setShowPanel(false)}
                  className="text-light-400 hover:text-white transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleMarquerToutesCommeLues}
                  disabled={loading || nonLuesCount === 0}
                  className="flex-1 px-3 py-2 bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue text-sm font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCheck className="h-4 w-4" />
                  Tout lire
                </button>
                <button
                  onClick={handleSupprimerToutesLues}
                  disabled={loading}
                  className="flex-1 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Effacer lues
                </button>
              </div>
              
              <button
                onClick={handleGenererNotifications}
                disabled={loading}
                className="w-full mt-2 px-3 py-2 bg-accent-green/10 hover:bg-accent-green/20 text-accent-green text-sm font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Générer les alertes automatiques
              </button>
            </div>

            {/* Liste des notifications */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-16 w-16 text-light-600 mx-auto mb-4 opacity-50" />
                  <p className="text-light-400">Aucune notification</p>
                  <p className="text-light-500 text-sm mt-1">
                    Tout est sous contrôle !
                  </p>
                </div>
              ) : (
                notifications.map(notif => {
                  const Icon = TYPE_ICONS[notif.type] || Bell;
                  const isNonLue = notif.statut === 'NON_LUE';
                  
                  return (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-2xl border transition ${
                        isNonLue
                          ? 'bg-accent-blue/5 border-accent-blue/30'
                          : 'bg-dark-800/50 border-dark-700/50'
                      } ${PRIORITE_COLORS[notif.priorite]}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl ${PRIORITE_COLORS[notif.priorite]}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-white text-sm">
                              {notif.titre}
                            </h4>
                            {isNonLue && (
                              <span className="flex-shrink-0 w-2 h-2 bg-accent-blue rounded-full mt-1"></span>
                            )}
                          </div>
                          
                          <p className="text-light-400 text-xs mb-2">
                            {notif.message}
                          </p>
                          
                          {notif.dateEcheance && (
                            <p className="text-light-500 text-xs mb-2">
                              Échéance : {formatDate(notif.dateEcheance)}
                            </p>
                          )}
                          
                          <div className="flex gap-2 mt-2">
                            {isNonLue && (
                              <button
                                onClick={() => handleMarquerCommeLue(notif.id)}
                                className="px-3 py-1 bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue text-xs font-medium rounded-lg transition flex items-center gap-1"
                              >
                                <Check className="h-3 w-3" />
                                Marquer lue
                              </button>
                            )}
                            <button
                              onClick={() => handleSupprimer(notif.id)}
                              className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-lg transition flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default NotificationBell;
