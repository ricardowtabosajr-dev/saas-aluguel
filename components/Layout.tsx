
import React from 'react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  userEmail: string;
  userRole: UserRole;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onLogout, userEmail, userRole }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'inventory', label: 'Acervo', icon: '👗' },
    { id: 'customers', label: 'Clientes', icon: '👥' },
    { id: 'reservations', label: 'Aluguéis', icon: '📅' },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans selection:bg-indigo-100">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm">A</div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Alpha</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            title="Sair"
          >
            <span className="text-xl">Logout</span>
          </button>
        </div>
      </header>

      {/* Sidebar - Desktop */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen shadow-[1px_0_0_rgba(0,0,0,0.05)]">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">A</div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Alpha Alugueis</h1>
          </div>
          <div className="px-1">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${userRole === UserRole.ADMIN ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
              }`}>
              Plano {userRole.toUpperCase()}
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all ${activeTab === item.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 font-bold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-900 truncate">{userEmail}</div>
              <div className="text-[10px] text-slate-400 font-medium">Logado como {userRole}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl hover:text-red-600 hover:border-red-100 transition-all text-xs font-bold"
          >
            <span>Sair do sistema</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 lg:pb-0">
          <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
            {children}
          </div>
        </div>
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex justify-around items-center z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === item.id
              ? 'text-indigo-600'
              : 'text-slate-400'
              }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
            {activeTab === item.id && (
              <span className="w-1 h-1 bg-indigo-600 rounded-full"></span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
