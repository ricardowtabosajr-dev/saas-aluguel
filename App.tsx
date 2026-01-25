
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Customers from './components/Customers';
import Reservations from './components/Reservations';
import Auth from './components/Auth';
import LandingPage from './components/LandingPage';
import { UserRole } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<{ email: string, role: UserRole } | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isInitializing, setIsInitializing] = useState(true);
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('closet_user_v2');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setShowLanding(false);
    }
    setIsInitializing(false);
  }, []);

  const handleLogin = (email: string) => {
    const role = email.includes('admin') ? UserRole.ADMIN : UserRole.STAFF;
    const userData = { email, role };
    setUser(userData);
    localStorage.setItem('closet_user_v2', JSON.stringify(userData));
    setShowLanding(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('closet_user_v2');
    setShowLanding(true);
  };

  if (isInitializing) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) {
    if (showLanding) {
      return (
        <LandingPage
          onLoginClick={() => setShowLanding(false)}
        />
      );
    }
    return <Auth onLogin={handleLogin} onBackToLanding={() => setShowLanding(true)} />;
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={handleLogout}
      userEmail={user.email}
      userRole={user.role}
    >
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'inventory' && <Inventory />}
      {activeTab === 'customers' && <Customers />}
      {activeTab === 'reservations' && <Reservations />}
    </Layout>
  );
};

export default App;
