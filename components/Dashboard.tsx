
import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b'];

const Dashboard: React.FC = () => {
  const { stats, loading, error } = useDashboard();

  const revenueData = [
    { name: 'Mar', value: 4200 },
    { name: 'Abr', value: 5800 },
    { name: 'Mai', value: stats?.contractedRevenue || 0 },
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
        {/* Card 1: Contratos Fechados (Volume de Negócios) */}
        <div className="bg-indigo-600 p-8 rounded-[40px] shadow-2xl shadow-indigo-100 text-white relative overflow-hidden group border border-indigo-500">
          <div className="relative z-10">
            <div className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Contratos Fechados</div>
            <div className="text-4xl font-black tabular-nums">R$ {stats.contractedRevenue.toLocaleString('pt-BR')}</div>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/10 w-fit px-4 py-2 rounded-xl backdrop-blur-md">
              <span className="text-lg">💰</span> Valor Geral
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
        </div>

        {/* Card 2: Receita em Caixa (Pagamentos Baixados) */}
        <div className="bg-emerald-500 p-8 rounded-[40px] shadow-2xl shadow-emerald-100 text-white relative overflow-hidden group border border-emerald-400">
          <div className="relative z-10">
            <div className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Receita em Caixa</div>
            <div className="text-4xl font-black tabular-nums">R$ {stats.monthlyRevenue.toLocaleString('pt-BR')}</div>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/10 w-fit px-4 py-2 rounded-xl backdrop-blur-md">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              Pagamentos Baixados
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 group hover:border-indigo-100 transition-colors">
          <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 group-hover:text-indigo-400 transition-colors">Taxa de Ocupação</div>
          <div className="text-4xl font-black text-slate-900 tabular-nums">{Math.round(stats.occupancyRate)}%</div>
          <div className="mt-6 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${stats.occupancyRate}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 group hover:border-indigo-100 transition-colors">
          <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 group-hover:text-indigo-400 transition-colors">Retenção Ativa</div>
          <div className="text-4xl font-black text-slate-900 tabular-nums">{stats.recurringCustomersCount}</div>
          <div className="mt-6 text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
            <span className="text-indigo-600 inline-block rotate-12 text-sm">👥</span>
            Clientes Recorrentes
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 group hover:border-indigo-100 transition-colors">
          <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 group-hover:text-indigo-400 transition-colors">Reservas em Alta</div>
          <div className="text-4xl font-black text-indigo-600 tabular-nums">{stats.futureReservations}</div>
          <div className="mt-6 text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
            <span className="text-indigo-600 text-sm">📅</span>
            Para o próximo mês
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Evolução de Receita</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performance mensal vs projeção</p>
            </div>
            <div className="flex gap-2 bg-slate-50 p-1 rounded-xl w-fit">
              <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white text-indigo-600 rounded-lg shadow-sm">Mês</button>
              <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Trimestre</button>
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
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 900 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 900 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px', backgroundColor: '#fff' }}
                  itemStyle={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  labelStyle={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col">
          <div className="mb-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Market Share</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Volume por categoria</p>
          </div>
          <div className="h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.revenueByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.revenueByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
              <span className="text-2xl font-black text-slate-900 leading-none">R$ {stats.monthlyRevenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
          <div className="mt-8 space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {stats.revenueByCategory.map((item, index) => (
              <div key={item.category} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.category}</span>
                </div>
                <span className="text-xs font-black text-slate-900">R$ {item.value.toLocaleString('pt-BR')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


export default Dashboard;
