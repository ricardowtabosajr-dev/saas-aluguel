
import React, { useState } from 'react';
import { useReservations } from '../hooks/useReservations';
import { useCustomers } from '../hooks/useCustomers';
import { useClothes } from '../hooks/useClothes';
import { Reservation, ReservationStatus, PaymentStatus } from '../types';

const Reservations: React.FC = () => {
  const { reservations, loading: resLoading, error: resError, addReservation, updateReservationStatus, convertQuotation } = useReservations();
  const { customers, loading: custLoading } = useCustomers();
  const { clothes, loading: clothLoading } = useClothes();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localError, setLocalError] = useState('');
  const [filter, setFilter] = useState<'all' | 'quotation' | 'active'>('active');

  const [formData, setFormData] = useState<Partial<Reservation>>({
    customer_id: '',
    clothe_id: '',
    start_date: '',
    end_date: '',
    status: ReservationStatus.QUOTATION,
    total_value: 0,
    deposit_value: 0,
    payment_status: PaymentStatus.PENDING
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    try {
      await addReservation(formData as Reservation);
      setIsModalOpen(false);
      setFormData({
        customer_id: '', clothe_id: '', start_date: '', end_date: '',
        status: ReservationStatus.QUOTATION, total_value: 0, deposit_value: 0, payment_status: PaymentStatus.PENDING
      });
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  const handleConvertQuotation = async (id: string) => {
    try {
      await convertQuotation(id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleStatusChange = async (id: string, newStatus: ReservationStatus) => {
    try {
      await updateReservationStatus(id, newStatus);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePrintContract = (res: Reservation) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const today = new Date().toLocaleDateString('pt-BR');
    const valueStr = res.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    const depositStr = (res.deposit_value || res.clothe?.deposit_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Contrato de Aluguel - ${res.customer?.name}</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
          .title { font-size: 24px; font-weight: 800; text-transform: uppercase; margin: 0; }
          .section { margin-bottom: 25px; }
          .section-title { font-weight: 800; text-transform: uppercase; font-size: 14px; color: #4f46e5; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; }
          .value { font-size: 14px; font-weight: 600; }
          .clauses { font-size: 11px; color: #475569; text-align: justify; }
          .clause-item { margin-bottom: 8px; }
          .signatures { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; text-align: center; }
          .sig-line { border-top: 1px solid #94a3b8; padding-top: 10px; font-size: 12px; font-weight: 700; }
          @media print { .no-print { display: none; } body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">Contrato de Locação de Trajes</h1>
          <p style="font-size: 12px; font-weight: 600; color: #64748b;">Reserva: #${res.id.substring(0, 8).toUpperCase()} | Data: ${today}</p>
        </div>

        <div class="section">
          <div class="section-title">1. Partes</div>
          <div class="grid">
            <div>
              <div class="label">Locadora</div>
              <div class="value">CLOSET SAAS - GESTÃO DE ALUGUÉIS</div>
            </div>
            <div>
              <div class="label">Locatário(a)</div>
              <div class="value">${res.customer?.name}</div>
              <div class="value">Contato: ${res.customer?.phone || '---'}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">2. Objeto e Prazos</div>
          <div class="grid">
            <div>
              <div class="label">Item(ns) Alugado(s)</div>
              <div class="value">${res.clothe?.name} (${res.clothe?.category})</div>
              <div class="value">Tamanho: ${res.clothe?.size}</div>
            </div>
            <div>
              <div class="label">Período de Locação</div>
              <div class="value">De: ${new Date(res.start_date).toLocaleDateString('pt-BR')}</div>
              <div class="value">Até: ${new Date(res.end_date).toLocaleDateString('pt-BR')}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">3. Valores e Caução</div>
          <div class="grid">
            <div>
              <div class="label">Valor Total do Aluguel</div>
              <div class="value">R$ ${valueStr}</div>
            </div>
            <div>
              <div class="label">Valor Caução (Garantia)</div>
              <div class="value">R$ ${depositStr}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">4. Cláusulas e Condições Gerais (Normas Vigentes)</div>
          <div class="clauses">
            <div class="clause-item"><strong>4.1. ESTADO DO TRAJE:</strong> O Locatário declara receber o traje em perfeitas condições de uso, conservação e limpeza, obrigando-se a devolvê-lo no mesmo estado sob pena de arcar com custos de manutenção.</div>
            <div class="clause-item"><strong>4.2. DEVOLUÇÃO E ATRASO:</strong> A devolução deverá ocorrer na data aprazada. O atraso injustificado implicará em multa de 10% sobre o valor da locação por cada dia de atraso, acrescido de juros moratórios.</div>
            <div class="clause-item"><strong>4.3. DANOS E EXTRAVIO:</strong> Conforme normas de locação, danos como rasgos, manchas permanentes ou queimaduras serão cobrados do Locatário através do caução ou cobrança complementar se o dano exceder a garantia.</div>
            <div class="clause-item"><strong>4.4. HIGIENE:</strong> A lavagem técnica é de responsabilidade exclusiva da Locadora. O Locatário NÃO deve efetuar qualquer tipo de lavagem ou ajuste por conta própria.</div>
            <div class="clause-item"><strong>4.5. CANCELAMENTO:</strong> Reservas canceladas com menos de 7 dias úteis não terão direito a reembolso do sinal de reserva, conforme política de vacância.</div>
            <div class="clause-item"><strong>4.6. RESPONSABILIDADE:</strong> O Locatário assume total responsabilidade civil e criminal pelo uso e posse do bem locado durante o período descrito neste contrato.</div>
          </div>
        </div>

        <div class="signatures">
          <div>
            <div class="sig-line">CLOSET SAAS (Locadora)</div>
          </div>
          <div>
            <div class="sig-line">${res.customer?.name} (Locatário)</div>
          </div>
        </div>

        <script>
          window.onload = () => { 
            window.print();
            setTimeout(() => { window.close(); }, 500);
          };
        <\/script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };
  const filteredReservations = reservations.filter(res => {
    if (filter === 'all') return true;
    if (filter === 'quotation') return res.status === ReservationStatus.QUOTATION;
    return res.status !== ReservationStatus.QUOTATION && res.status !== ReservationStatus.CANCELLED;
  });

  const isLoading = resLoading || custLoading || clothLoading;

  if (isLoading && !reservations.length) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Aluguéis</h2>
          <p className="text-slate-500 font-medium">Controle de orçamentos e reservas confirmadas.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 group"
        >
          <span className="text-xl group-hover:rotate-90 transition-transform">+</span>
          Nova Operação
        </button>
      </div>

      <div className="flex gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit shadow-sm">
        {(['active', 'quotation', 'all'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {tab === 'active' ? 'Ativas' : tab === 'quotation' ? 'Orçamentos' : 'Todos'}
          </button>
        ))}
      </div>

      {(resError || localError) && (
        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl font-bold border border-red-100">
          {resError || localError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredReservations.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
            <div className="text-4xl mb-4">📭</div>
            <div className="text-slate-400 font-bold">Nenhum registro encontrado nesta categoria.</div>
          </div>
        )}
        {filteredReservations.map(res => (
          <div key={res.id} className={`bg-white border rounded-[32px] p-8 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-8 transition-all hover:border-indigo-200 ${res.status === ReservationStatus.QUOTATION ? 'border-amber-100 bg-amber-50/20' : 'border-slate-100'}`}>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-slate-100 overflow-hidden shrink-0 border-4 border-white shadow-lg">
                <img src={res.clothe?.image_url} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-black text-slate-900 text-xl">{res.clothe?.name}</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${res.status === ReservationStatus.QUOTATION ? 'bg-amber-100 text-amber-700' :
                    res.status === ReservationStatus.PICKED_UP ? 'bg-indigo-100 text-indigo-700' :
                      res.status === ReservationStatus.RETURNED ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                    {res.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-600">👤</span>
                    {res.customer?.name}
                  </div>
                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-600">📅</span>
                    {new Date(res.start_date).toLocaleDateString('pt-BR')} — {new Date(res.end_date).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-12">
              <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total a Pagar</div>
                <div className={`text-xl font-black ${res.payment_status === PaymentStatus.PAID ? 'text-green-600' : 'text-slate-900'}`}>
                  R$ {res.total_value.toLocaleString('pt-BR')}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {res.status === ReservationStatus.QUOTATION && (
                  <button
                    onClick={() => handleConvertQuotation(res.id)}
                    className="bg-green-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-700 shadow-lg shadow-green-100 transition-all"
                  >
                    Confirmar Reserva
                  </button>
                )}
                {res.status === ReservationStatus.CONFIRMED && (
                  <button
                    onClick={() => handleStatusChange(res.id, ReservationStatus.PICKED_UP)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                  >
                    Efetuar Retirada
                  </button>
                )}
                {res.status === ReservationStatus.PICKED_UP && (
                  <button
                    onClick={() => handleStatusChange(res.id, ReservationStatus.RETURNED)}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all"
                  >
                    Check-in Retorno
                  </button>
                )}
                <button
                  onClick={() => handlePrintContract(res)}
                  title="Imprimir Contrato"
                  className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-slate-200"
                >
                  🖨️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[48px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-black text-slate-900">Novo Aluguel</h3>
                <p className="text-slate-400 font-medium">Inicie um orçamento ou reserva direta.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-slate-100 p-3 rounded-full text-slate-400 hover:text-slate-900 transition-colors text-3xl font-light">
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Modalidade Inicial</label>
                  <div className="flex gap-2">
                    {[ReservationStatus.QUOTATION, ReservationStatus.CONFIRMED].map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setFormData({ ...formData, status })}
                        className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${formData.status === status ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-400'}`}
                      >
                        {status === ReservationStatus.QUOTATION ? 'Orçamento (Livre)' : 'Reserva (Bloqueia)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Cliente</label>
                  <select
                    required
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-700"
                    value={formData.customer_id}
                    onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
                  >
                    <option value="">Buscar cliente...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Peça</label>
                  <select
                    required
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-700"
                    value={formData.clothe_id}
                    onChange={e => {
                      const cloth = clothes.find(c => c.id === e.target.value);
                      setFormData({
                        ...formData,
                        clothe_id: e.target.value,
                        total_value: cloth?.rental_value || 0,
                        deposit_value: cloth?.deposit_value || 0
                      });
                    }}
                  >
                    <option value="">Escolha uma peça...</option>
                    {clothes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} (R$ {c.rental_value})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Data Retirada</label>
                  <input required type="date" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Data Devolução</label>
                  <input required type="date" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Valor do Aluguel (R$)</label>
                  <input required type="number" step="0.01" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold" value={formData.total_value} onChange={e => setFormData({ ...formData, total_value: parseFloat(e.target.value) })} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Valor de Caução (R$)</label>
                  <input required type="number" step="0.01" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold" value={formData.deposit_value} onChange={e => setFormData({ ...formData, deposit_value: parseFloat(e.target.value) })} />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transform active:scale-95 transition-all"
                >
                  Criar {formData.status === ReservationStatus.QUOTATION ? 'Orçamento' : 'Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
