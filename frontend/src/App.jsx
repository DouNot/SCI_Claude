import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SpaceProvider, useSpace } from './contexts/SpaceContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

// Pages publiques
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Pages protégées
import DashboardPage from './pages/DashboardPage';
import BiensPage from './pages/BiensPage';
import BienDetailPage from './pages/BienDetailPage';
import LocatairesPage from './pages/LocatairesPage';
import ContactsPage from './pages/ContactsPage';
import DocumentsPage from './pages/DocumentsPage';
import AssociesPage from './pages/AssociesPage';
import ParametresPage from './pages/ParametresPage';
import ChargesPage from './pages/ChargesPage';
import EvenementsFiscauxPage from './pages/EvenementsFiscauxPage';

// Layout pour les pages protégées
const ProtectedLayout = ({ children }) => {
  const { currentSpace } = useSpace();
  
  return (
    <div className="flex h-screen bg-dark-950 overflow-hidden">
      <Sidebar />
      <div 
        key={currentSpace?.id} 
        className="flex-1 overflow-y-auto relative"
      >
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SpaceProvider>
          <Routes>
            {/* Routes publiques */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Routes protégées */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <DashboardPage />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/biens"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <BiensPage />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/biens/:id"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <BienDetailPage />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/locataires"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <LocatairesPage />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/charges"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <ChargesPage />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/evenements-fiscaux"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <EvenementsFiscauxPage />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/contacts"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <ContactsPage />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <DocumentsPage />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/associes"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <AssociesPage />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/parametres"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <ParametresPage />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </SpaceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
