import React, { useState } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { Customer } from '../types';

const Customers: React.FC = () => {
  const { customers, loading, error, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Omit<Customer, 'id'>>({
    name: '',
    document: '',
    phone: '',
    email: '',
    address: '',
    cep: '',
    status: 'ativo',
    internal_notes: ''
  });

  const handleCepSearch = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          cep: cleanCep,
          address: `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`
        }));
      }
    } catch (err) {
      // Falha silenciosa no CEP
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    const cleanCpf = formData.document.replace(/\D/g, '');
    if (cleanCpf.length < 11) {
      alert('CPF/CNPJ inválido. Digite apenas números.');
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      alert('Telefone inválido. Informe o DDD e o número.');
      return;
    }

    const cleanCep = (formData.cep || '').replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      alert('CEP inválido. Deve conter 8 dígitos.');
      return;
    }

    try {
      if (editingId) {
        await updateCustomer(editingId, formData);
      } else {
        await addCustomer(formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({
        name: '',
        document: '',
        phone: '',
        email: '',
        address: '',
        cep: '',
        status: 'ativo',
        internal_notes: ''
      });
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente ${name}? Esta ação não pode ser desfeita e pode afetar o histórico de reservas.`)) {
      try {
        await deleteCustomer(id);
      } catch (err) {
        alert('Erro ao excluir cliente. Verifique se ele possui reservas vinculadas.');
      }
    }
  };

  const handleEdit = (customer: Customer) => {
    setFormData({
      name: customer.name,
      document: customer.document,
      phone: customer.phone,
      email: customer.email,
      address: customer.address || '',
      cep: customer.cep || '',
      status: customer.status || 'ativo',
      internal_notes: customer.internal_notes || ''
    });
    setEditingId(customer.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      name: '',
      document: '',
      phone: '',
      email: '',
      address: '',
      cep: '',
      status: 'ativo',
      internal_notes: ''
    });
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.document.includes(searchTerm)
  );

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Gestão de Clientes</h2>
          <p className="text-sm text-slate-500 font-medium">Base de dados centralizada e histórico de recorrência.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full lg:w-auto">
          <input
            type="text"
            placeholder="Nome, CPF ou E-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-6 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none w-full lg:w-80 shadow-sm font-medium text-sm"
          />
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({
                name: '',
                document: '',
                phone: '',
                email: '',
                address: '',
                status: 'ativo',
                internal_notes: ''
              });
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 shrink-0 text-[10px] uppercase tracking-widest whitespace-nowrap"
          >
            + Novo Cliente
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl font-bold">
          {error}
        </div>
      )}

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Cliente / E-mail</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Documento</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Telefone</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-center">Status / Histórico</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCustomers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-8 py-5">
                    <div className="font-black text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">{c.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{c.email}</div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-600 tracking-tight">{c.document}</td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-600 tracking-tight">{c.phone}</td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex flex-col items-center gap-1">
                      {c.status === 'inadimplente' ? (
                        <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-red-100 w-fit">
                          🚫 Inadimplente
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100 w-fit">
                          ✅ Ativo
                        </span>
                      )}

                      <span className="text-[10px] font-bold text-slate-400 tracking-tight">
                        {c.reservations_count} Reserva(s)
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(c)}
                        className="text-slate-400 hover:text-indigo-600 font-bold text-xs bg-slate-100 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="text-slate-400 hover:text-red-600 font-bold text-xs bg-slate-100 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filteredCustomers.length && (
          <div className="p-20 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhum cliente na base...</div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6 z-50 overflow-y-auto">
          <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <form onSubmit={handleSave}>
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-20">
                <h3 className="text-xl font-black text-slate-900">{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h3>
                <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-900 text-3xl font-light">&times;</button>
              </div>

              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome Completo</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Maria Oliveira Silva"
                    className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">CPF / CNPJ</label>
                    <input
                      required
                      type="text"
                      value={formData.document}
                      onChange={e => setFormData({ ...formData, document: e.target.value })}
                      placeholder="000.000.000-00"
                      className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Telefone WhatsApp</label>
                    <input
                      required
                      type="text"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">E-mail Principal</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                    className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900 text-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5 col-span-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">CEP</label>
                    <input
                      required
                      type="text"
                      value={formData.cep}
                      onChange={e => {
                        const val = e.target.value;
                        setFormData({ ...formData, cep: val });
                        if (val.replace(/\D/g, '').length === 8) handleCepSearch(val);
                      }}
                      placeholder="00000-000"
                      className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Endereço Completo</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Rua, Número, Bairro, Cidade - UF"
                      className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Status Financeiro</label>
                    <select
                      value={formData.status || 'ativo'}
                      onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900 text-sm appearance-none"
                    >
                      <option value="ativo">✅ Ativo (Regular)</option>
                      <option value="inadimplente">🚫 Inadimplente (Bloqueado)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Histórico</label>
                    <div className="w-full px-5 py-3 bg-slate-100 border-none rounded-xl font-bold text-slate-500 text-sm select-none cursor-not-allowed">
                      {editingId ? 'Recalculado automático' : 'Novo registro'}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Observações Internas (Restrito)</label>
                  <textarea
                    rows={3}
                    value={formData.internal_notes || ''}
                    onChange={e => setFormData({ ...formData, internal_notes: e.target.value })}
                    placeholder="Anotações sobre comportamento, preferências ou pendências..."
                    className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900 text-sm"
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 sticky bottom-0 z-20">
                <button
                  type="submit"
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transform active:scale-95 transition-all text-[10px]"
                >
                  {editingId ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
