import React, { useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import FRAAtlas from './pages/FRAAtlas';
import DSS from './pages/DSS';
import DigitizedRecords from './pages/DigitizedRecords';
// About merged into HomePage
import FRAChat from './pages/FRAChat';
import { AuthProvider, useAuth } from './lib/auth/AuthProvider';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading } = useAuth();
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  return <>{children}</>;
};

function App() {
  // Simulated auth state for demo without backend
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return window.sessionStorage.getItem('va_demo_auth') === '1';
  });
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signin');

  const authScreen = useMemo(() => (
    authView === 'signin' ? (
      <SignIn
        onSuccess={() => { window.sessionStorage.setItem('va_demo_auth', '1'); setIsAuthenticated(true); }}
        goToSignUp={() => setAuthView('signup')}
      />
    ) : (
      <SignUp
        onSuccess={() => { window.sessionStorage.setItem('va_demo_auth', '1'); setIsAuthenticated(true); }}
        goToSignIn={() => setAuthView('signin')}
      />
    )
  ), [authView]);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {isAuthenticated && <Navbar />}
          <main>
            {isAuthenticated ? (
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/atlas" element={<ProtectedRoute><FRAAtlas /></ProtectedRoute>} />
                <Route path="/dss" element={<ProtectedRoute><DSS /></ProtectedRoute>} />
                <Route path="/records" element={<ProtectedRoute><DigitizedRecords /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><FRAChat /></ProtectedRoute>} />
              </Routes>
            ) : (
              authScreen
            )}
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;