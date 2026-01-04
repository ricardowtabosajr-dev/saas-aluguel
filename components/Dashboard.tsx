
import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b'];

const Dashboard: React.FC = () => {
  const { stats, loading, error } = useDashboard();

  const revenueData = [
    { name: 'Mar', value: 4200 },
    { name: 'Abr', value: 5800 },
    { name: 'Mai', value: stats?.monthlyRevenue || 0 },
  ];

  if (loading && !stats) {
    return (
      <div className="p-12 text-center text-slate-400 font-medium animate-pulse">
        Sincronizando BI...
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-12 text-center text-red-400 font-medium">
        {error || 'Erro ao carregar dashboard.'}
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Business Intelligence</h2>
          <p className="text-slate-500 font-medium mt-1">Análise estratégica do seu acervo e faturamento.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-4 py-2 text-xs font-black uppercase tracking-widest text-indigo-600">Ao Vivo</div>
          <div className="w-px h-6 bg-slate-100"></div>
          <div className="px-4 py-2 text-xs font-bold text-slate-400">Última atualização: {new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-indigo-600 p-8 rounded-[32px] shadow-2xl shadow-indigo-200 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <div className="text-indigo-100 text-xs font-black uppercase tracking-widest mb-2">Faturamento Total</div>
            <div className="text-4xl font-black">R$ {stats.monthlyRevenue.toLocaleString('pt-BR')}</div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold bg-white/10 w-fit px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              +18.4% este mês
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
          <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Taxa de Ocupação</div>
          <div className="text-4xl font-black text-slate-900">{Math.round(stats.occupancyRate)}%</div>
          <div className="mt-6 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${stats.occupancyRate}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
          <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Retenção de Clientes</div>
          <div className="text-4xl font-black text-slate-900">{stats.recurringCustomersCount}</div>
          <div className="mt-6 text-xs text-slate-500 font-medium">Clientes recorrentes ativos</div>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
          <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Reservas em Alta</div>
          <div className="text-4xl font-black text-indigo-600">{stats.futureReservations}</div>
          <div className="mt-6 text-xs text-slate-500 font-medium">Confirmadas para próximo mês</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Evolução do Faturamento</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 rounded-lg">Mês</button>
              <button className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Trimestre</button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Receita por Categoria</h3>
          <div className="h-64 mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.revenueByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.revenueByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {stats.revenueByCategory.map((item, index) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-sm font-bold text-slate-600">{item.category}</span>
                </div>
                <span className="text-sm font-black text-slate-900">R$ {item.value.toLocaleString('pt-BR')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


export default Dashboard;
