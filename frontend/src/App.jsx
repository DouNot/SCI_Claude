import { useState } from 'react';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import BiensPage from './pages/BiensPage';
import LocatairesPage from './pages/LocatairesPage';
import BauxPage from './pages/BauxPage';
import FacturesPage from './pages/FacturesPage';
import TravauxPage from './pages/TravauxPage';
import ContactsPage from './pages/ContactsPage';
import PretsPage from './pages/PretsPage';
import AssociesPage from './pages/AssociesPage';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      
      {currentPage === 'dashboard' && <DashboardPage />}
      {currentPage === 'biens' && <BiensPage />}
      {currentPage === 'locataires' && <LocatairesPage />}
      {currentPage === 'baux' && <BauxPage />}
      {currentPage === 'factures' && <FacturesPage />}
      {currentPage === 'travaux' && <TravauxPage />}
      {currentPage === 'contacts' && <ContactsPage />}
      {currentPage === 'prets' && <PretsPage />}
      {currentPage === 'associes' && <AssociesPage />}
    </div>
  );
}

export default App;