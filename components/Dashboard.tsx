
import React, { useState } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b'];

const Dashboard: React.FC = () => {
  const { stats, loading, error, updateProjection, recordPayment } = useDashboard();
  const [showPendingModal, setShowPendingModal] = useState(false);

  const handleRecordPayment = async (id: string, customerName: string, remaining: number) => {
    const value = prompt(`Quanto o cliente ${customerName} está pagando? (Saldo devedor: R$ ${remaining.toLocaleString('pt-BR')})`);
    if (value && !isNaN(Number(value))) {
      try {
        await recordPayment(id, Number(value));
        alert('Pagamento registrado com sucesso!');
      } catch (err) {
        alert('Erro ao registrar pagamento.');
      }
    }
  };

  const handleSetProjection = async () => {
    const currentMonthKey = new Date().toISOString().slice(0, 7);
    const value = prompt('Qual a projeção de receita para este mês?');
    if (value && !isNaN(Number(value))) {
      await updateProjection(currentMonthKey, Number(value));
    }
  };

  const revenueData = stats?.monthlyHistory.map(item => ({
    name: item.name,
    value: item.revenue,
    projection: item.projection || 0
  })) || [];

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center p-20 animate-pulse">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs text-center">Sincronizando Business Intelligence...</p>
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Painel de Controle Alpha</h2>
          <p className="text-sm text-slate-500 font-medium">Visão geral em tempo real da sua loja.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 px-4 rounded-2xl border border-slate-100 shadow-sm self-start md:self-auto">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Atualizado às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-indigo-600 p-6 md:p-8 rounded-[32px] text-white relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2">Contratos Ativos</p>
            <h4 className="text-3xl font-black tabular-nums">R$ {stats.contractedRevenue.toLocaleString('pt-BR')}</h4>
            <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm text-[9px] font-bold">
              💰 TOTAL CONTRATADO
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        </div>

        <div className="bg-emerald-500 p-6 md:p-8 rounded-[32px] text-white relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2">Receita em Caixa</p>
            <h4 className="text-3xl font-black tabular-nums">R$ {stats.monthlyRevenue.toLocaleString('pt-BR')}</h4>
            <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm text-[9px] font-bold">
              ✅ RECEBIDO NO MÊS
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm hover:border-indigo-100 transition-all">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Taxa de Ocupação</p>
          <h4 className="text-3xl font-black text-slate-900">{Math.round(stats.occupancyRate)}%</h4>
          <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${stats.occupancyRate}%` }}></div>
          </div>
        </div>

        <button
          onClick={() => setShowPendingModal(true)}
          className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm hover:border-amber-200 hover:shadow-lg hover:shadow-amber-50 transition-all text-left group"
        >
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 group-hover:text-amber-500 transition-colors">Pendente Financeiro</p>
          <h4 className="text-3xl font-black text-amber-500 uppercase">{stats.pendingPaymentsCount}</h4>
          <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">Contratos com saldo aberto</p>
          <div className="mt-4 text-[9px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            Clique para ver detalhes <span>→</span>
          </div>
        </button>
      </div>

      {/* Modal de Pendências Financeiras */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[40px] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Pendências Financeiras</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Contratos confirmados/retirados com saldo em aberto</p>
              </div>
              <button
                onClick={() => setShowPendingModal(false)}
                className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all text-2xl font-light"
              >
                &times;
              </button>
            </div>

            <div className="p-4 md:p-8 max-h-[60vh] overflow-x-auto overflow-y-auto custom-scrollbar">
              <div className="min-w-[800px] lg:min-w-full">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Cliente</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Data Início</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Valor Total</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Pago</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Saldo Devedor</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {stats.pendingReservations.map((res) => {
                      const remaining = res.total_value - (res.amount_paid || 0);
                      return (
                        <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 font-black text-slate-900 text-sm">
                            {res.customer?.name || 'Cliente'}
                            <div className="text-[9px] font-bold text-indigo-600 uppercase tracking-tighter mt-0.5">{res.status}</div>
                          </td>
                          <td className="py-5 text-center text-sm font-bold text-slate-500">
                            {new Date(res.start_date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-5 text-right font-bold text-slate-900">R$ {res.total_value.toLocaleString('pt-BR')}</td>
                          <td className="py-5 text-right font-bold text-emerald-600">R$ {(res.amount_paid || 0).toLocaleString('pt-BR')}</td>
                          <td className="py-5 text-right font-black text-red-500">R$ {remaining.toLocaleString('pt-BR')}</td>
                          <td className="py-5 text-right">
                            <button
                              onClick={() => handleRecordPayment(res.id, res.customer?.name || 'Cliente', remaining)}
                              className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm shadow-emerald-100"
                            >
                              Baixar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {stats.pendingReservations.length === 0 && (
                  <div className="py-20 text-center">
                    <span className="text-4xl mb-4 block">🎉</span>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhuma pendência financeira encontrada!</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 bg-slate-50/50 border-t border-slate-100 text-right">
              <button
                onClick={() => setShowPendingModal(false)}
                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Middle Row: Chart & operational stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 md:p-10 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Performance vs Projeção</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Evolução de faturamento nos últimos 6 meses</p>
            </div>
            <button onClick={handleSetProjection} className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl hover:bg-slate-100 transition-all">
              DEFINIR META
            </button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 700 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Area type="monotone" name="Meta" dataKey="projection" stroke="#e2e8f0" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                <Area type="monotone" name="Realizado" dataKey="value" stroke="#6366f1" strokeWidth={4} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Indicators */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[40px] text-white overflow-hidden relative group h-full flex flex-col justify-between">
            <div>
              <h4 className="text-xl font-black mb-1">Status Operativo</h4>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Peças em fluxo hoje</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🧺</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Lavanderia</span>
                </div>
                <span className="text-xl font-black text-indigo-400">{stats.itemsInLaundryCount}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🛠️</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Manutenção</span>
                </div>
                <span className="text-xl font-black text-amber-400">{stats.itemsInMaintenanceCount}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🚨</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Atrasos Devol.</span>
                </div>
                <span className="text-xl font-black text-red-400">{stats.upcomingReturns}</span>
              </div>
            </div>

            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <span className="text-8xl">⚙️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Market Share, Top Items, Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        {/* Top Rented */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-black text-slate-900 mb-6">Peças Queridinhas</h3>
          <div className="space-y-4 flex-1">
            {stats.mostRented.map((clothe, i) => (
              <div key={clothe.id} className="flex items-center gap-4 group">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 overflow-hidden shrink-0">
                  {clothe.image_url ? (
                    <img src={clothe.image_url} alt={clothe.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">👗</div>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-xs font-black text-slate-900 truncate mb-1">{clothe.name}</h4>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>{clothe.category}</span>
                    <span className="text-indigo-600">{clothe.rent_count || 0} aluguéis</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categorias / Market Share */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col relative overflow-hidden">
          <h3 className="text-lg font-black text-slate-900 mb-2">Mix de Produtos</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Volume financeiro por categoria</p>
          <div className="h-40 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.revenueByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.revenueByCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-auto">
            {stats.revenueByCategory.slice(0, 4).map((item, index) => (
              <div key={item.category} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-[9px] font-black text-slate-500 truncate uppercase">{item.category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-900">Atividades</h3>
            <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[8px] font-black uppercase tracking-widest">Live Feed</span>
          </div>
          <div className="space-y-6 overflow-y-auto custom-scrollbar max-h-[300px] pr-2">
            {stats.recentActivities.length > 0 ? stats.recentActivities.map((act) => (
              <div key={act.id} className="relative pl-6 border-l-2 border-slate-50 pb-2">
                <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-white border-2 border-indigo-600 shadow-[0_0_10px_rgba(99,102,241,0.2)]"></div>
                <div className="flex items-baseline justify-between mb-1">
                  <h4 className="text-[10px] font-black text-slate-900 truncate pr-2 uppercase">{act.customerName}</h4>
                  <span className="text-[9px] font-bold text-slate-400 shrink-0">{act.time}</span>
                </div>
                <p className="text-[10px] font-medium text-slate-500 leading-tight line-clamp-2">{act.description}</p>
                <div className="mt-2 text-[8px] font-black text-indigo-500 uppercase tracking-widest">{act.type}</div>
              </div>
            )) : (
              <p className="text-center text-[10px] font-bold text-slate-400 uppercase py-10">Tudo calmo na loja por enquanto...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default Dashboard;
