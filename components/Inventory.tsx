
import React, { useState } from 'react';
import { useClothes } from '../hooks/useClothes';
import { Clothe, ClotheStatus } from '../types';
import { suggestClotheDescription } from '../services/gemini';

const Inventory: React.FC = () => {
  const { clothes, loading, error, addClothe, updateClothe, updateStatus, uploadImage } = useClothes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<Partial<Clothe>>({
    name: '', category: 'Festa', size: 'M', status: ClotheStatus.AVAILABLE,
    rental_value: 0, deposit_value: 0, measurements: { busto: '', cintura: '', quadril: '' },
    image_url: ''
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '', category: 'Festa', size: 'M', status: ClotheStatus.AVAILABLE,
      rental_value: 0, deposit_value: 0, measurements: { busto: '', cintura: '', quadril: '' },
      image_url: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Clothe) => {
    setEditingId(item.id);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateClothe(editingId, formData);
      } else {
        await addClothe(formData as Clothe);
      }
      setIsModalOpen(false);
      setEditingId(null);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingId) return;

    setIsUploading(true);
    try {
      const url = await uploadImage(editingId, file);
      setFormData(prev => ({ ...prev, image_url: url }));
      alert('Imagem enviada com sucesso!');
    } catch (err) {
      alert('Erro ao enviar imagem. Verifique se o bucket de storage está configurado.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: ClotheStatus) => {
    const note = prompt('Motivo da alteração de status:') || 'Atualização manual';
    await updateStatus(id, status, note);
  };

  const filteredClothes = clothes.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedClotheForHistory = clothes.find(c => c.id === isHistoryOpen);

  if (loading && clothes.length === 0) {
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
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Acervo de Peças</h2>
          <p className="text-slate-500 font-medium">Gestão inteligente de disponibilidade e manutenção.</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Pesquisar no catálogo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-6 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none w-full lg:w-80 shadow-sm font-medium"
          />
          <button
            onClick={handleOpenAdd}
            className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 shrink-0"
          >
            + Adicionar
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredClothes.map((item) => (
          <div key={item.id} className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="relative h-72 bg-slate-50">
              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${item.status === ClotheStatus.AVAILABLE ? 'bg-green-500 text-white' :
                  item.status === ClotheStatus.RESERVED ? 'bg-amber-500 text-white' :
                    item.status === ClotheStatus.LAUNDRY ? 'bg-indigo-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                  {item.status}
                </span>
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => handleOpenEdit(item)} className="bg-white text-slate-900 p-3 rounded-full hover:bg-indigo-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 shadow-xl font-bold">
                  ✎ Editar
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{item.category} • Tam: {item.size}</div>
                <button onClick={() => setIsHistoryOpen(item.id)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600">📜 Histórico</button>
              </div>
              <h3 className="font-black text-slate-900 text-lg truncate mb-1">{item.name}</h3>
              <div className="text-xs text-slate-400 mb-6 font-medium">Rendimento: {item.rent_count} aluguéis</div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="text-xl font-black text-slate-900">R$ {item.rental_value}</div>
                <div className="flex gap-1">
                  {item.status === ClotheStatus.AVAILABLE && (
                    <button onClick={() => handleStatusUpdate(item.id, ClotheStatus.MAINTENANCE)} title="Manutenção" className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all">🛠️</button>
                  )}
                  {item.status === ClotheStatus.LAUNDRY && (
                    <button onClick={() => handleStatusUpdate(item.id, ClotheStatus.AVAILABLE)} title="Finalizar Lavagem" className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all">✨</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* History Modal */}
      {isHistoryOpen && selectedClotheForHistory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900">Linha do Tempo</h3>
              <button onClick={() => setIsHistoryOpen(null)} className="text-slate-400 hover:text-slate-900 text-3xl font-light">&times;</button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-6">
              {!selectedClotheForHistory.history?.length && <div className="text-center text-slate-400 py-10 font-bold">Nenhum evento registrado.</div>}
              {selectedClotheForHistory.history?.map((h, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-indigo-600 mt-1"></div>
                    <div className="flex-1 w-0.5 bg-slate-100 mt-1"></div>
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-slate-400">{new Date(h.date).toLocaleDateString()}</div>
                    <div className="text-sm font-black text-slate-900 mt-1">{h.status.toUpperCase()}</div>
                    <div className="text-sm text-slate-500 mt-0.5">{h.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Clothe Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6 z-50 overflow-y-auto">
          <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            <form onSubmit={handleSave}>
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-900">{editingId ? 'Editar Peça' : 'Nova Peça'}</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-3xl font-light">&times;</button>
              </div>

              <div className="p-8 grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Nome da Peça</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900"
                  >
                    <option>Festa</option>
                    <option>Noiva</option>
                    <option>Terno</option>
                    <option>Acessório</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Tamanho</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={e => setFormData({ ...formData, size: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Valor Aluguel (R$)</label>
                  <input
                    type="number"
                    value={formData.rental_value}
                    onChange={e => setFormData({ ...formData, rental_value: Number(e.target.value) })}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Valor Caução (R$)</label>
                  <input
                    type="number"
                    value={formData.deposit_value}
                    onChange={e => setFormData({ ...formData, deposit_value: Number(e.target.value) })}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900"
                  />
                </div>

                <div className="col-span-2 space-y-4 pt-4 border-t border-slate-50">
                  <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600">Mídia e Descrição</h4>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">URL da Imagem (Internet)</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={formData.image_url}
                      onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900"
                    />
                  </div>

                  {editingId && (
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Ou Enviar Arquivo Local</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          disabled={isUploading}
                          className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-3 file:px-6
                            file:rounded-2xl file:border-0
                            file:text-sm file:font-black
                            file:bg-indigo-50 file:text-indigo-700
                            hover:file:bg-indigo-100"
                        />
                        {isUploading && <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 bg-slate-50 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 font-black text-slate-400 hover:text-slate-900 transition-colors">Cancelar</button>
                <button type="submit" className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                  {editingId ? 'Salvar Alterações' : 'Salvar Peça'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


export default Inventory;
