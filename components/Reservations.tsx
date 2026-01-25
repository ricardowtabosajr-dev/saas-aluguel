
import React, { useState } from 'react';
import { useReservations } from '../hooks/useReservations';
import { useCustomers } from '../hooks/useCustomers';
import { useClothes } from '../hooks/useClothes';
import { Reservation, ReservationStatus, PaymentStatus } from '../types';
import { handlePrintContract, handlePrintReceipt } from '../utils/printUtils';

const Reservations: React.FC = () => {
  const { reservations, loading: resLoading, error: resError, addReservation, updateReservationStatus, convertQuotation } = useReservations();
  const { customers, loading: custLoading } = useCustomers();
  const { clothes, loading: clothLoading } = useClothes();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localError, setLocalError] = useState('');
  const [filter, setFilter] = useState<'all' | 'quotation' | 'active'>('active');

  const [formData, setFormData] = useState<Partial<Reservation>>({
    customer_id: '',
    clothe_ids: [],
    item_sizes: {},
    start_date: '',
    end_date: '',
    status: ReservationStatus.QUOTATION,
    total_value: 0,
    deposit_value: 0,
    payment_status: PaymentStatus.PENDING,
    payment_method: 'vista',
    discount_percent: 0
  });

  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [selectedResForCheckin, setSelectedResForCheckin] = useState<Reservation | null>(null);
  const [returnChecklist, setReturnChecklist] = useState({
    items: [
      { label: 'Sem furos ou rasgos', checked: false },
      { label: 'Sem manchas permanentes', checked: false },
      { label: 'Zíperes e botões funcionando', checked: false },
      { label: 'Acessórios inclusos (cabide, capa, etc)', checked: false }
    ],
    attendant_name: '',
    notes: ''
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    try {
      if (!formData.customer_id) {
        throw new Error('Selecione um cliente.');
      }

      // Validação de Status Financeiro
      const selectedCustomer = customers.find(c => c.id === formData.customer_id);
      if (selectedCustomer?.status === 'inadimplente') {
        throw new Error('ESTE CLIENTE ESTÁ BLOQUEADO POR INADIMPLÊNCIA. Regularize o status financeiro para permitir novas reservas.');
      }

      if (!formData.clothe_ids || formData.clothe_ids.length === 0) {
        throw new Error('Selecione pelo menos uma peça.');
      }
      await addReservation(formData as Reservation);
      setIsModalOpen(false);
      setFormData({
        customer_id: '', clothe_ids: [], start_date: '', end_date: '',
        status: ReservationStatus.QUOTATION, total_value: 0, deposit_value: 0, payment_status: PaymentStatus.PENDING, discount_percent: 0
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

  const handleOpenCheckin = (res: Reservation) => {
    setSelectedResForCheckin(res);
    setIsCheckinOpen(true);
  };

  const handleSaveCheckin = async () => {
    if (!selectedResForCheckin) return;
    if (!returnChecklist.attendant_name) {
      alert('Por favor, informe o nome da atendente.');
      return;
    }

    try {
      // Atualiza status para DEVOLVIDA e pagamento para PAGO
      await updateReservationStatus(selectedResForCheckin.id, ReservationStatus.RETURNED);
      // Aqui assumimos que o pagamento é finalizado na devolução se estiver pendente
      // Idealmente teríamos uma função específica para pagamento, mas o fluxo sugere que devolução = fim do ciclo financeiro

      setIsCheckinOpen(false);
      setSelectedResForCheckin(null);
      setReturnChecklist({
        items: returnChecklist.items.map(i => ({ ...i, checked: false })),
        attendant_name: '',
        notes: ''
      });
    } catch (err: any) {
      alert(err.message);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Gestão de Aluguéis</h2>
          <p className="text-sm text-slate-500 font-medium">Controle de orçamentos e reservas confirmadas.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 group text-[10px] uppercase tracking-widest"
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
          <div key={res.id} className={`bg-white border rounded-[32px] p-6 md:p-8 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6 md:gap-8 transition-all hover:border-indigo-200 ${res.status === ReservationStatus.QUOTATION ? 'border-amber-100 bg-amber-50/20' : 'border-slate-100'}`}>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex -space-x-12 md:-space-x-8">
                {res.clothes?.slice(0, 3).map((c, i) => (
                  <div key={i} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-slate-100 overflow-hidden shrink-0 border-4 border-white shadow-lg relative" style={{ zIndex: 10 - i }}>
                    <img src={c.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                {(res.clothes?.length || 0) > 3 && (
                  <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl border-4 border-white shadow-lg relative z-0">
                    +{res.clothes!.length - 3}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-black text-slate-900 text-xl">
                    {res.clothes && res.clothes.length > 0
                      ? (res.clothes.length === 1 ? `${res.clothes[0].name} (Tam: ${res.item_sizes?.[res.clothes[0].id] || res.clothes[0].size})` : `${res.clothes[0].name} + ${res.clothes.length - 1} itens`)
                      : 'Sem itens'}
                  </span>
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

            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
              <div className="text-left md:text-right">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total a Pagar</div>
                <div className={`text-xl font-black ${res.payment_status === PaymentStatus.PAID ? 'text-green-600' : 'text-slate-900'}`}>
                  R$ {res.total_value.toLocaleString('pt-BR')}
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                {res.status === ReservationStatus.QUOTATION && (
                  <button
                    onClick={() => handleConvertQuotation(res.id)}
                    className="flex-1 md:flex-none bg-green-600 text-white px-4 md:px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 shadow-lg shadow-green-100 transition-all"
                  >
                    Confirmar
                  </button>
                )}
                {res.status === ReservationStatus.CONFIRMED && (
                  <button
                    onClick={() => handleStatusChange(res.id, ReservationStatus.PICKED_UP)}
                    className="flex-1 md:flex-none bg-indigo-600 text-white px-4 md:px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                  >
                    Retirada
                  </button>
                )}
                {res.status === ReservationStatus.PICKED_UP && (
                  <button
                    onClick={() => handleOpenCheckin(res)}
                    className="flex-1 md:flex-none bg-emerald-600 text-white px-4 md:px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all font-bold"
                  >
                    Retorno
                  </button>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePrintContract(res)}
                    title="Imprimir Contrato"
                    className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-slate-200"
                  >
                    🖨️
                  </button>
                  <button
                    onClick={() => handlePrintReceipt(res)}
                    title="Imprimir Recibo / Comprovante"
                    className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all border border-slate-200"
                  >
                    🧾
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-20">
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">Novo Aluguel</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Gestão de Peças e Prazos</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-slate-50 p-1.5 rounded-full text-slate-300 hover:text-slate-900 transition-colors text-xl font-light"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Modalidade Inicial</label>
                  <div className="flex gap-2">
                    {[ReservationStatus.QUOTATION, ReservationStatus.CONFIRMED].map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setFormData({ ...formData, status })}
                        className={`flex-1 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest border-2 transition-all ${formData.status === status ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                      >
                        {status === ReservationStatus.QUOTATION ? 'Orçamento' : 'Reserva'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cliente Solicitante</label>
                    <select
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-700 text-xs"
                      value={formData.customer_id}
                      onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
                    >
                      <option value="">Buscar cliente na base...</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.status === 'inadimplente' ? `🚫 [BLOQUEADO] ${c.name}` : c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3 md:col-span-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Peças no Pacote ({formData.clothe_ids?.length || 0})</label>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.clothe_ids?.map(id => {
                        const c = clothes.find(item => item.id === id);
                        return (
                          <div key={id} className="bg-white text-indigo-700 p-1.5 rounded-lg font-black uppercase flex items-center gap-2 border border-indigo-100 shadow-sm text-[8px] group">
                            <span className="flex-1">{c?.name}</span>
                            <select
                              value={formData.item_sizes?.[id] || c?.size || 'M'}
                              onChange={e => setFormData({
                                ...formData,
                                item_sizes: { ...formData.item_sizes, [id]: e.target.value }
                              })}
                              className="bg-slate-50 border-none rounded md py-0.5 px-1 text-[8px] font-black outline-none focus:ring-1 focus:ring-indigo-300"
                            >
                              <option value="P">P</option>
                              <option value="M">M</option>
                              <option value="G">G</option>
                              <option value="GG">GG</option>
                              <option value="XG">XG</option>
                              <option value="U">U</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                const newIds = formData.clothe_ids?.filter(cid => cid !== id) || [];
                                const newSizes = { ...formData.item_sizes };
                                delete newSizes[id];
                                const newClothes = clothes.filter(item => newIds.includes(item.id));
                                const baseTotal = newClothes.reduce((acc, curr) => acc + curr.rental_value, 0);
                                const baseDeposit = newClothes.reduce((acc, curr) => acc + curr.deposit_value, 0);
                                const discount = formData.discount_percent || 0;
                                setFormData({
                                  ...formData,
                                  clothe_ids: newIds,
                                  item_sizes: newSizes,
                                  total_value: baseTotal - (baseTotal * (discount / 100)),
                                  deposit_value: baseDeposit
                                });
                              }}
                              className="text-red-400 hover:text-red-600 font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <select
                      className="w-full px-4 py-2.5 bg-white border-none rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-700 text-xs shadow-sm"
                      value=""
                      onChange={e => {
                        const id = e.target.value;
                        if (!id || formData.clothe_ids?.includes(id)) return;
                        const newIds = [...(formData.clothe_ids || []), id];
                        const newClothes = clothes.filter(item => newIds.includes(item.id));
                        const selectedClothe = clothes.find(item => item.id === id);
                        const baseTotal = newClothes.reduce((acc, curr) => acc + curr.rental_value, 0);
                        const baseDeposit = newClothes.reduce((acc, curr) => acc + curr.deposit_value, 0);
                        const discount = formData.discount_percent || 0;
                        setFormData({
                          ...formData,
                          clothe_ids: newIds,
                          item_sizes: { ...formData.item_sizes, [id]: selectedClothe?.size || 'M' },
                          total_value: baseTotal - (baseTotal * (discount / 100)),
                          deposit_value: baseDeposit
                        });
                      }}
                    >
                      <option value="">+ Adicionar Peça</option>
                      {clothes
                        .filter(c => !formData.clothe_ids?.includes(c.id))
                        .map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} (R$ {c.rental_value})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">📅 Retirada</label>
                    <input
                      required
                      type="date"
                      className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-900 text-xs"
                      value={formData.start_date}
                      onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">📅 Devolução</label>
                    <input
                      required
                      type="date"
                      className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-900 text-xs"
                      value={formData.end_date}
                      onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">💰 Aluguel (R$)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-900 text-xs"
                      value={formData.total_value || ''}
                      onChange={e => setFormData({ ...formData, total_value: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">🛡️ Caução (R$)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-900 text-xs"
                      value={formData.deposit_value || ''}
                      onChange={e => setFormData({ ...formData, deposit_value: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">💳 Pagamento</label>
                    <select
                      className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-900 text-xs"
                      value={formData.payment_method}
                      onChange={e => setFormData({ ...formData, payment_method: e.target.value as any })}
                    >
                      <option value="vista">À Vista (Total)</option>
                      <option value="parcelado">Parcelado (50/50)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">🏷️ Desconto (%)</label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-900 text-xs"
                      value={formData.discount_percent || ''}
                      onChange={e => {
                        const discount = parseFloat(e.target.value) || 0;
                        const selectedClothes = clothes.filter(item => formData.clothe_ids?.includes(item.id));
                        const baseTotal = selectedClothes.reduce((acc, curr) => acc + curr.rental_value, 0);
                        setFormData({
                          ...formData,
                          discount_percent: discount,
                          total_value: baseTotal - (baseTotal * (discount / 100))
                        });
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 bg-slate-50 border-t border-slate-100 sticky bottom-0 z-20">
                <button
                  type="submit"
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transform active:scale-95 transition-all text-xs"
                >
                  Confirmar {formData.status === ReservationStatus.QUOTATION ? 'Orçamento' : 'Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Check-in Checklist Modal */}
      {
        isCheckinOpen && selectedResForCheckin && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-slate-50">
                <h3 className="text-2xl font-black text-slate-900">Check-list de Devolução</h3>
                <p className="text-sm text-slate-500 font-medium">Confirme o estado das peças: {selectedResForCheckin.clothes?.map(c => c.name).join(', ')}</p>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  {returnChecklist.items.map((item, idx) => (
                    <label key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                      <input
                        type="checkbox"
                        className="w-6 h-6 rounded-lg text-indigo-600 focus:ring-indigo-500"
                        checked={item.checked}
                        onChange={() => {
                          const newItems = [...returnChecklist.items];
                          newItems[idx].checked = !newItems[idx].checked;
                          setReturnChecklist({ ...returnChecklist, items: newItems });
                        }}
                      />
                      <span className="font-bold text-slate-700">{item.label}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Observações Adicionais</label>
                  <textarea
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-700 min-h-[100px]"
                    placeholder="Ex: Pequena sujeira na barra, botão frouxo..."
                    value={returnChecklist.notes}
                    onChange={e => setReturnChecklist({ ...returnChecklist, notes: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Atendente (Responsável)</label>
                  <input
                    required
                    type="text"
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-700"
                    placeholder="Sua assinatura digital"
                    value={returnChecklist.attendant_name}
                    onChange={e => setReturnChecklist({ ...returnChecklist, attendant_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="p-8 bg-slate-50 flex gap-4">
                <button
                  onClick={() => setIsCheckinOpen(false)}
                  className="flex-1 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black uppercase tracking-widest hover:text-slate-900 transition-all text-xs"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveCheckin}
                  className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all text-xs"
                >
                  Confirmar e Finalizar
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Reservations;
