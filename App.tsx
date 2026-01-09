
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Listings from './pages/Listings';
import PropertyDetail from './pages/PropertyDetail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { supabase } from './services/supabaseClient';
import { User } from './types';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdmin && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('prosper_auth');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (!supabase) return;

    // Check for existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ username: session.user.email || 'Admin', isAuthenticated: true });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ username: session.user.email || 'Admin', isAuthenticated: true });
        localStorage.setItem('prosper_auth', JSON.stringify({ username: session.user.email, isAuthenticated: true }));
      } else {
        setUser(null);
        localStorage.removeItem('prosper_auth');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (u: { username: string }) => {
    const newUser = { ...u, isAuthenticated: true };
    setUser(newUser);
    localStorage.setItem('prosper_auth', JSON.stringify(newUser));
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('prosper_auth');
  };

  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/propiedades" element={<Listings />} />
          <Route path="/propiedad/:id" element={<PropertyDetail />} />
          <Route 
            path="/admin" 
            element={
              user?.isAuthenticated ? (
                <AdminDashboard onLogout={handleLogout} />
              ) : (
                <AdminLogin onLogin={handleLogin} />
              )
            } 
          />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
