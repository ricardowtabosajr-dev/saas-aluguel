
import React, { useState } from 'react';

interface AuthProps {
  onLogin: (email: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate Supabase Auth
    onLogin(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 selection:bg-indigo-100">
      <div className="w-full max-w-md bg-white rounded-[48px] shadow-2xl shadow-indigo-100/50 overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-500">
        <div className="p-10 pb-6">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-indigo-600 rounded-[24px] flex items-center justify-center text-white font-black text-3xl mx-auto mb-6 shadow-xl shadow-indigo-200">A</div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Alpha Alugueis de Roupas</h1>
            <p className="text-slate-400 mt-3 font-medium text-sm px-4">
              {isLogin ? 'Bem-vindo de volta ao comando da sua loja.' : 'Comece a gerir seu acervo de forma profissional.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">E-mail de Acesso</label>
              <input
                required
                type="email"
                placeholder="nome@sualoja.com"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-100 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Senha</label>
                {isLogin && <button type="button" className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700">Esqueci</button>}
              </div>
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-100 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-5 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-[24px] shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all transform active:scale-95 group flex items-center justify-center gap-3"
            >
              {isLogin ? 'Entrar no Sistema' : 'Criar Minha Loja'}
              <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </form>
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 hover:text-indigo-600 transition-colors"
          >
            {isLogin ? 'Novo por aqui? Cadastre sua loja agora' : 'Já possui uma conta? Faça login aqui'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
