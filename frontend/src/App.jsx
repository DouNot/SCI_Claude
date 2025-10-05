import { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import BiensPage from './pages/BiensPage';
import BienDetailPage from './pages/BienDetailPage';
import LocatairesPage from './pages/LocatairesPage';
import ContactsPage from './pages/ContactsPage';
import DocumentsPage from './pages/DocumentsPage';
import AssociesPage from './pages/AssociesPage';
import ParametresPage from './pages/ParametresPage';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedBienId, setSelectedBienId] = useState(null);

  const handleNavigate = (page, bienId = null) => {
    setCurrentPage(page);
    if (bienId) {
      setSelectedBienId(bienId);
    }
  };

  return (
    <div className="flex h-screen bg-dark-950 overflow-hidden">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      
      <div className="flex-1 overflow-y-auto relative">
        {currentPage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
        {currentPage === 'biens' && <BiensPage onNavigate={handleNavigate} />}
        {currentPage === 'bien-detail' && <BienDetailPage bienId={selectedBienId} onNavigate={handleNavigate} />}
        {currentPage === 'locataires' && <LocatairesPage />}
        {currentPage === 'contacts' && <ContactsPage />}
        {currentPage === 'documents' && <DocumentsPage />}
        {currentPage === 'associes' && <AssociesPage />}
        {currentPage === 'parametres' && <ParametresPage />}
      </div>
    </div>
  );
}

export default App;
