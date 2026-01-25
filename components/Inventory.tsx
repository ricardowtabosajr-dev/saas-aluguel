
import React, { useState } from 'react';
import { useClothes } from '../hooks/useClothes';
import { Clothe, ClotheStatus } from '../types';
import { suggestClotheDescription } from '../services/gemini';
import * as XLSX from 'xlsx';

const Inventory: React.FC = () => {
  const { clothes, loading, error, addClothe, updateClothe, deleteClothe, updateStatus, uploadImage, importClothes } = useClothes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState<{ [key: string]: number }>({});

  const [formData, setFormData] = useState<Partial<Clothe>>({
    name: '', category: 'Festa', size: 'M', status: ClotheStatus.AVAILABLE,
    rental_value: 0, deposit_value: 0, measurements: { busto: '', cintura: '', quadril: '' },
    image_url: '',
    images: []
  });

  const handleExportTemplate = () => {
    const template = [
      {
        'Nome da Peça': 'Ex: Vestido Gala Sereia',
        'Categoria': 'Festa',
        'Tamanho': 'M',
        'Valor do Aluguel': 250.00,
        'Valor do Caução': 150.00,
        'Status': 'disponivel',
        'URL da Imagem': 'https://link-da-imagem.com/foto.jpg',
        'Medida Busto': '90',
        'Medida Cintura': '70',
        'Medida Quadril': '95'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Modelo Importação');
    XLSX.writeFile(wb, 'modelo_importacao_acervo.xlsx');
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        const formattedClothes = data.map(row => ({
          name: row['Nome da Peça'] || '',
          category: row['Categoria'] || 'Festa',
          size: String(row['Tamanho'] || 'M'),
          rental_value: Number(row['Valor do Aluguel'] || 0),
          deposit_value: Number(row['Valor do Caução'] || 0),
          status: (row['Status'] || ClotheStatus.AVAILABLE) as ClotheStatus,
          image_url: row['URL da Imagem'] || '',
          measurements: {
            busto: String(row['Medida Busto'] || ''),
            cintura: String(row['Medida Cintura'] || ''),
            quadril: String(row['Medida Quadril'] || '')
          },
          images: row['URL da Imagem'] ? [row['URL da Imagem']] : []
        }));

        await importClothes(formattedClothes);
        alert(`${formattedClothes.length} peças importadas com sucesso!`);
      } catch (err) {
        alert('Erro ao processar o arquivo. Certifique-se de seguir o modelo correto.');
      } finally {
        setIsImporting(false);
        e.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '', category: 'Festa', size: 'M', status: ClotheStatus.AVAILABLE,
      rental_value: 0, deposit_value: 0, measurements: { busto: '', cintura: '', quadril: '' },
      image_url: '',
      images: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Clothe) => {
    setEditingId(item.id);
    setFormData({ ...item, images: item.images || [] });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!editingId) return;
    if (window.confirm('Tem certeza que deseja excluir esta peça permanentemente do acervo? Esta ação não pode ser desfeita.')) {
      try {
        await deleteClothe(editingId);
        setIsModalOpen(false);
        setEditingId(null);
      } catch (err) {
        alert('Erro ao excluir peça. Verifique se ela possui reservas vinculadas.');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Garantir que a image_url principal seja a primeira do array se houver imagens
      const finalFormData = { ...formData };
      if (formData.images && formData.images.length > 0 && !formData.image_url) {
        finalFormData.image_url = formData.images[0];
      }

      if (editingId) {
        await updateClothe(editingId, finalFormData);
      } else {
        await addClothe(finalFormData as Clothe);
      }
      setIsModalOpen(false);
      setEditingId(null);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Se não houver editingId, usa um ID temporário único para o bucket de storage
      const uploadId = editingId || `temp-${Math.random().toString(36).substr(2, 9)}`;
      const url = await uploadImage(uploadId, file);

      const newImages = [...(formData.images || []), url];
      setFormData(prev => ({
        ...prev,
        images: newImages,
        image_url: prev.image_url || url
      }));
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
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Acervo de Peças</h2>
          <p className="text-sm text-slate-500 font-medium">Gestão inteligente de disponibilidade e manutenção.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full lg:w-auto">
          <input
            type="text"
            placeholder="Pesquisar no catálogo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-6 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none w-full lg:w-80 shadow-sm font-medium text-sm"
          />

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportTemplate}
              className="flex-1 sm:flex-none px-4 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest shadow-sm"
              title="Baixar planilha modelo"
            >
              📥 Modelo
            </button>

            <label className="flex-1 sm:flex-none cursor-pointer px-4 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black hover:bg-emerald-100 transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest shadow-emerald-100 shadow-md">
              <span>📤 Importar</span>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleImportExcel}
                className="hidden"
                disabled={isImporting}
              />
              {isImporting && <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>}
            </label>

            <button
              onClick={handleOpenAdd}
              className="flex-[2] sm:flex-none bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 shrink-0 text-[10px] uppercase tracking-widest"
            >
              + Adicionar
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredClothes.map((item) => {
          const itemImages = Array.from(new Set([
            item.image_url,
            ...(item.images || [])
          ])).filter(Boolean) as string[];

          const currentIndex = activeImageIndex[item.id] || 0;
          const currentDisplayImage = itemImages[currentIndex] || item.image_url;

          return (
            <div key={item.id} className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-[500px]">
              <div className="relative flex-1 bg-slate-50 flex overflow-hidden">
                {/* Lateral Thumbnails */}
                {itemImages.length > 1 && (
                  <div className="w-16 bg-white/80 backdrop-blur-md border-r border-slate-100 p-2 flex flex-col gap-2 z-10 overflow-y-auto no-scrollbar">
                    {itemImages.map((img, idx) => (
                      <button
                        key={idx}
                        onMouseEnter={() => setActiveImageIndex(prev => ({ ...prev, [item.id]: idx }))}
                        onClick={() => setActiveImageIndex(prev => ({ ...prev, [item.id]: idx }))}
                        className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${currentIndex === idx ? 'border-indigo-600 shadow-md scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <img
                          src={img || 'https://via.placeholder.com/50'}
                          className="w-full h-full object-cover"
                          onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50'}
                        />
                      </button>
                    ))}
                  </div>
                )}

                <div className="relative flex-1 group/img">
                  <img
                    src={currentDisplayImage || 'https://via.placeholder.com/400x600?text=Sem+Imagem'}
                    alt={item.name}
                    onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x600?text=Link+Invalido'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                  />

                  <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${item.status === ClotheStatus.AVAILABLE ? 'bg-green-500 text-white' :
                      item.status === ClotheStatus.RESERVED ? 'bg-amber-500 text-white' :
                        item.status === ClotheStatus.LAUNDRY ? 'bg-indigo-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                    <button onClick={() => handleOpenEdit(item)} className="bg-white text-slate-900 px-5 py-2.5 rounded-full hover:bg-indigo-600 hover:text-white transition-all transform translate-y-4 group-hover/img:translate-y-0 duration-300 shadow-xl font-black text-xs">
                      ✎ Editar
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{item.category} • Tam: {item.size}</div>
                  <button onClick={() => setIsHistoryOpen(item.id)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600">📜 Histórico</button>
                </div>
                <h3 className="font-black text-slate-900 text-lg truncate mb-1">{item.name}</h3>
                <div className="text-xs text-slate-400 mb-4 font-medium">Rendimento: {item.rent_count} aluguéis</div>

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
          );
        })}
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-20">
              <h3 className="text-xl font-black text-slate-900">{editingId ? 'Editar Peça' : 'Nova Peça'}</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-slate-100 p-2 rounded-full text-slate-400 hover:text-slate-900 transition-colors text-2xl font-light"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome da Peça</label>
                    <input
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900 text-sm"
                      placeholder="Ex: Vestido Gala Sereia"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Categoria</label>
                    <input
                      required
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900 text-sm"
                      placeholder="Ex: Vestidos"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tamanho</label>
                    <input
                      required
                      value={formData.size}
                      onChange={e => setFormData({ ...formData, size: e.target.value })}
                      className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900 text-sm"
                      placeholder="Ex: M / 42"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Aluguel (R$)</label>
                    <input
                      type="number"
                      value={formData.rental_value}
                      onChange={e => setFormData({ ...formData, rental_value: Number(e.target.value) })}
                      className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Caução (R$)</label>
                    <input
                      type="number"
                      value={formData.deposit_value}
                      onChange={e => setFormData({ ...formData, deposit_value: Number(e.target.value) })}
                      className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900 text-sm"
                    />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Status Operacional</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as ClotheStatus })}
                      className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900 text-sm"
                    >
                      <option value={ClotheStatus.AVAILABLE}>Disponível para Aluguel</option>
                      <option value={ClotheStatus.MAINTENANCE}>Em Manutenção</option>
                      <option value={ClotheStatus.LAUNDRY}>Na Lavanderia</option>
                      <option value={ClotheStatus.RESERVED}>Reservado (Manual)</option>
                    </select>
                  </div>

                  <div className="col-span-2 space-y-4 pt-4 border-t border-slate-50">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Galeria de Mídia</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nova URL de Foto</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="https://..."
                              id="newImageURL"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const input = e.currentTarget;
                                  if (input.value) {
                                    setFormData(prev => ({ ...prev, images: [...(prev.images || []), input.value] }));
                                    input.value = '';
                                  }
                                }
                              }}
                              className="flex-1 px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const input = document.getElementById('newImageURL') as HTMLInputElement;
                                if (input.value) {
                                  setFormData(prev => ({ ...prev, images: [...(prev.images || []), input.value] }));
                                  input.value = '';
                                }
                              }}
                              className="bg-indigo-600 text-white px-3 py-2 rounded-xl font-black hover:bg-indigo-700 transition-all text-[10px]"
                            >
                              ADD
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-slate-100 bg-slate-50/50">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            disabled={isUploading}
                            className="block w-full text-[10px] text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                          />
                          {isUploading && <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>}
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gerenciar Fotos ({formData.images?.length || 0})</label>
                          <div className="grid grid-cols-4 gap-2 max-h-[120px] overflow-y-auto custom-scrollbar p-1">
                            {formData.images?.map((img, idx) => (
                              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-100 group shadow-sm bg-slate-100">
                                <img src={img} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== idx) }))}
                                  className="absolute inset-0 bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-black text-[8px] uppercase"
                                >
                                  EXCLUIR
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center block">Capa Principal</label>
                        <div className="bg-slate-50 rounded-2xl p-2 flex flex-col items-center justify-center border border-slate-100 aspect-square overflow-hidden shadow-inner relative">
                          {formData.images && formData.images.length > 0 ? (
                            <img
                              src={formData.images[0]}
                              alt="Preview"
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <div className="text-slate-300 font-bold text-center text-[8px] uppercase tracking-widest">Sem fotos</div>
                          )}
                          <div className="absolute bottom-2 right-2 bg-indigo-600 text-[8px] text-white px-2 py-1 rounded-md font-black shadow-lg">PREVIEW</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 flex justify-between items-center border-t border-slate-100 sticky bottom-0 z-20">
                <div>
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-6 py-3 font-black text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all text-[10px] uppercase tracking-widest"
                    >
                      Excluir Peça
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-black text-slate-400 hover:text-slate-900 transition-colors text-[10px] uppercase tracking-widest">Cancelar</button>
                  <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 text-[10px] uppercase tracking-widest">
                    {editingId ? 'Salvar Peça' : 'Cadastrar Item'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


export default Inventory;
