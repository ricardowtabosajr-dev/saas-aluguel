
import React, { useState } from 'react';
import { useClothes } from '../hooks/useClothes';
import { ClotheStatus } from '../types';

interface LandingPageProps {
    onLoginClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
    const { clothes } = useClothes();
    const [activeCategory, setActiveCategory] = useState('Todas');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const showcasedClothes = clothes
        .filter(c => c.status === ClotheStatus.AVAILABLE)
        .filter(c => activeCategory === 'Todas' || c.category === activeCategory);

    const categories = ['Todas', ...Array.from(new Set(clothes.map(c => c.category)))].slice(0, 6);

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-2xl z-50 border-b border-slate-100/50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-black shadow-xl">A</div>
                        <span className="text-xl font-black tracking-tighter uppercase">Alpha <span className="text-slate-400 font-light">Collection</span></span>
                    </div>

                    <div className="hidden lg:flex items-center gap-10">
                        {['Nova Coleção', 'Categorias', 'Como Funciona', 'Sobre'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-black transition-all">
                                {item}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={onLoginClick}
                            className="group flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20"
                        >
                            <span>Acesso Restrito</span>
                            <span className="opacity-50 group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-32 px-6 overflow-hidden min-h-[90vh] flex items-center">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10">
                    <div className="space-y-10 animate-slide-up">
                        <div className="inline-flex items-center gap-3 bg-slate-50 border border-slate-100 px-5 py-2 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Exclusividade & Elegância</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.95] tracking-tighter">
                            Alugue a sua <br />
                            <span className="text-slate-300 italic font-light">melhor</span> versão.
                        </h1>

                        <p className="text-lg text-slate-500 font-medium max-w-lg leading-relaxed">
                            Descubra um acervo curado de trajes premium para momentos inesquecíveis. Alta costura acessível, com atendimento personalizado e ajuste perfeito.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                            <a href="#vitrine" className="w-full sm:w-auto px-12 py-6 bg-black text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-2xl shadow-black/20 text-center">
                                Explorar Acervo
                            </a>
                            <a href="#como-funciona" className="w-full sm:w-auto px-12 py-6 bg-white border-2 border-slate-100 text-slate-900 rounded-full font-black uppercase tracking-widest text-[10px] hover:border-black transition-all text-center">
                                Como Funciona
                            </a>
                        </div>
                    </div>

                    <div className="relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="aspect-[4/5] bg-slate-100 rounded-[60px] overflow-hidden relative group shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/20 to-transparent"></div>
                            {showcasedClothes[0]?.image_url ? (
                                <img
                                    src={showcasedClothes[0].image_url}
                                    className="w-full h-full object-cover grayscale-[0.2] group-hover:scale-105 transition-transform duration-1000"
                                    alt="Feature clothes"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-9xl opacity-20">👗</div>
                            )}
                            <div className="absolute bottom-10 left-10 p-8 glass rounded-[32px] max-w-xs animate-float">
                                <div className="text-[9px] font-black uppercase tracking-widest text-indigo-600 mb-2">Destaque da Semana</div>
                                <h3 className="text-xl font-black text-slate-900">Vestidos de Gala Coleção 2026</h3>
                            </div>
                        </div>

                        <div className="absolute -z-10 -top-20 -right-20 w-80 h-80 bg-indigo-50 rounded-full blur-[100px] animate-float"></div>
                        <div className="absolute -z-10 -bottom-20 -left-20 w-80 h-80 bg-purple-50 rounded-full blur-[100px] animate-float" style={{ animationDelay: '3s' }}></div>
                    </div>
                </div>
            </section>

            {/* Categories / Filter Section */}
            <section id="categorias" className="py-20 bg-slate-50/50 border-y border-slate-100/50">
                <div className="max-w-7xl mx-auto px-6 overflow-x-auto no-scrollbar">
                    <div className="flex items-center justify-center gap-4 min-w-max">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeCategory === cat ? 'bg-black text-white shadow-xl' : 'bg-white text-slate-400 hover:text-black border border-slate-100'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Vitrine / Grid Section */}
            <section id="vitrine" className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Nosso Catálogo</span>
                            <h2 className="text-5xl font-black tracking-tighter leading-none">A Peça Certa para o <br /> Seu <span className="text-slate-300">Momento.</span></h2>
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] md:max-w-xs text-right">
                            {showcasedClothes.length} ITENS DISPONÍVEIS NA CATEGORIA {activeCategory.toUpperCase()}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                        {showcasedClothes.length > 0 ? showcasedClothes.map((item) => (
                            <div key={item.id} className="group">
                                <div className="aspect-[3/4] bg-slate-50 rounded-[40px] overflow-hidden relative border border-slate-100 transition-all duration-700 group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] group-hover:-translate-y-4">
                                    {item.image_url ? (
                                        <img
                                            src={item.image_url}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                            alt={item.name}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-7xl opacity-10">👗</div>
                                    )}

                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-8 backdrop-blur-[2px]">
                                        <div className="text-center transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                                            <div className="text-white text-[10px] font-black uppercase tracking-widest mb-2">Disponível</div>
                                            <h4 className="text-white text-2xl font-black mb-4">{item.name}</h4>
                                            <div className="inline-block px-6 py-3 bg-white rounded-full text-[10px] font-black uppercase tracking-widest text-black shadow-xl">
                                                Ver Detalhes
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute top-6 left-6 z-10">
                                        <span className="glass px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 border border-white/50">
                                            Tam: {item.size}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-8 px-4 flex justify-between items-start">
                                    <div>
                                        <h5 className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.name}</h5>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black text-black">R$ {item.rental_value}</div>
                                        <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-0.5">diária</div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-40 bg-slate-50 rounded-[60px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                                <span className="text-6xl mb-6">🧥</span>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhum item disponível nesta categoria.</p>
                                <button onClick={() => setActiveCategory('Todas')} className="mt-4 text-[10px] font-black uppercase tracking-widest text-indigo-600 underline">Voltar para Todas</button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section id="como-funciona" className="py-32 bg-black text-white rounded-[80px] mx-4 mb-20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Passo a Passo</span>
                            <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">Simples, <br />Rápido e <br /><span className="text-slate-600">Premium.</span></h2>
                            <div className="space-y-12 pt-10">
                                {[
                                    { step: '01', title: 'Escolha sua Peça', desc: 'Navegue por nosso catálogo digital exclusivo e escolha o traje perfeito.' },
                                    { step: '02', title: 'Agende a Prova', desc: 'Reserve seu horário para ajustes personalizados com nossos alfaiates.' },
                                    { step: '03', title: 'Brilhe no Evento', desc: 'Retire seu traje impecável, higienizado e pronto para sua ocasião especial.' }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-8 group">
                                        <div className="text-3xl font-black text-slate-800 group-hover:text-white transition-colors duration-500">{item.step}</div>
                                        <div className="space-y-2">
                                            <h4 className="text-xl font-black">{item.title}</h4>
                                            <p className="text-slate-400 font-medium leading-relaxed max-w-sm text-sm">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="aspect-square bg-white/5 rounded-[60px] border border-white/10 p-12 flex items-center justify-center relative">
                                <div className="text-[200px] grayscale opacity-50 animate-float">👞</div>
                                <div className="absolute top-20 right-20 text-8xl animate-float" style={{ animationDelay: '2s' }}>💍</div>
                                <div className="absolute bottom-20 left-20 text-8xl animate-float" style={{ animationDelay: '4s' }}>👔</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none"></div>
            </section>

            {/* Footer */}
            <footer className="bg-white py-20 px-6 border-t border-slate-100">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-black text-sm shadow-xl">A</div>
                            <span className="text-lg font-black tracking-tighter uppercase">Alpha Collection</span>
                        </div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest max-w-[200px] leading-relaxed">
                            Onde a sofisticação encontra a conveniência.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
                        <div className="space-y-6">
                            <h6 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Navegação</h6>
                            <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <li className="hover:text-black cursor-pointer transition-colors">Catálogo</li>
                                <li className="hover:text-black cursor-pointer transition-colors">Agendamento</li>
                                <li className="hover:text-black cursor-pointer transition-colors">Privacidade</li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h6 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Contato</h6>
                            <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <li className="hover:text-black cursor-pointer transition-colors">São Paulo, SP</li>
                                <li className="hover:text-black cursor-pointer transition-colors">+55 11 99999-9999</li>
                                <li className="hover:text-black cursor-pointer transition-colors">contato@alpha.com</li>
                            </ul>
                        </div>
                    </div>

                    <div className="text-right space-y-4">
                        <div className="flex gap-4 justify-end">
                            {['In', 'Ig', 'Tw'].map(s => (
                                <div key={s} className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-[10px] font-black hover:bg-black hover:text-white transition-all cursor-pointer">
                                    {s}
                                </div>
                            ))}
                        </div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">© 2026 Alpha Curated Atelier.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
