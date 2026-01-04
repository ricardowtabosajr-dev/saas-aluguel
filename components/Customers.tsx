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

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-50">
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-400">Cliente</th>
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-400">Documento</th>
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-400">Contato</th>
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredCustomers.map(c => (
              <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="font-black text-slate-900">{c.name}</div>
                  <div className="text-xs text-slate-400 font-medium">{c.email}</div>
                </td>
                <td className="px-8 py-6 font-bold text-slate-600">{c.document}</td>
                <td className="px-8 py-6 font-bold text-slate-600">{c.phone}</td>
                <td className="px-8 py-6">
                  {c.is_recurring ? (
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Recorrente</span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest">Novo</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filteredCustomers.length && (
          <div className="p-20 text-center text-slate-400 font-bold">Nenhum cliente encontrado.</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <form onSubmit={handleSave}>
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-900">Novo Cliente</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-3xl font-light">&times;</button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Nome Completo</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">CPF/CNPJ</label>
                    <input required type="text" value={formData.document} onChange={e => setFormData({ ...formData, document: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Telefone</label>
                    <input required type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">E-mail</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900" />
                </div>
              </div>
              <div className="p-8 bg-slate-50 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 font-black text-slate-400 hover:text-slate-900 transition-colors">Cancelar</button>
                <button type="submit" className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">Criar Cadastro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
