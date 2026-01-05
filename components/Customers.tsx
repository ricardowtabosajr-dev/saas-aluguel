import React, { useState } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { Customer } from '../types';

const Customers: React.FC = () => {
  const { customers, loading, error, addCustomer } = useCustomers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Omit<Customer, 'id'>>({
    name: '', document: '', phone: '', email: ''
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCustomer(formData);
      setIsModalOpen(false);
      setFormData({ name: '', document: '', phone: '', email: '' });
    } catch (err) {
      // Error handled by hook
    }
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
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Clientes</h2>
          <p className="text-slate-500 font-medium">Base de dados centralizada e histórico de recorrência.</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Nome, CPF ou E-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-6 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none w-full lg:w-80 shadow-sm font-medium"
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 shrink-0"
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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Cliente / E-mail</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Documento</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Telefone</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-center">Status</th>
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
                    {c.is_recurring ? (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">Fiel</span>
                    ) : (
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest">Base</span>
                    )}
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
                <h3 className="text-xl font-black text-slate-900">Novo Cliente</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-3xl font-light">&times;</button>
              </div>

              <div className="p-8 space-y-5">
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
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                    className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900 text-sm"
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-50 flex justify-end gap-3 sticky bottom-0 z-20 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 font-black text-slate-400 hover:text-slate-900 transition-colors text-xs uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 text-xs uppercase tracking-widest"
                >
                  Confirmar Cadastro
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
