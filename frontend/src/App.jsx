import { useState } from 'react';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import BiensPage from './pages/BiensPage';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      
      {currentPage === 'dashboard' && <DashboardPage />}
      {currentPage === 'biens' && <BiensPage />}
    </div>
  );
}

export default App;