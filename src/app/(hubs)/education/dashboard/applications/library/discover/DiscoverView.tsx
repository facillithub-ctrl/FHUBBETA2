'use client'

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import type { DiscoverData, OfficialContent } from './actions';

interface DiscoverViewProps {
  data: DiscoverData;
  onContentSelect: (item: OfficialContent) => void;
}

export default function DiscoverView({ data, onContentSelect }: DiscoverViewProps) {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [heroIndex, setHeroIndex] = useState(0);

  // Combina tudo para filtrar
  const allContent = useMemo(() => [
    ...(data?.featured || []),
    ...(data?.math || []),
    ...(data?.literature || []),
    ...(data?.science || [])
  ], [data]);

  // Lógica de Filtro
  const filteredContent = useMemo(() => {
    if (activeFilter === 'Todos') return allContent;
    
    // Filtro flexível (por tipo ou por matéria)
    return allContent.filter((item) => {
       const typeMatch = item.content_type?.toLowerCase() === activeFilter.toLowerCase();
       const subjectMatch = item.subject === activeFilter;
       return typeMatch || subjectMatch;
    });
  }, [activeFilter, allContent]);

  // Carrossel Automático
  useEffect(() => {
    if (data?.featured?.length > 1) {
        const interval = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % data.featured.length);
        }, 5000);
        return () => clearInterval(interval);
    }
  }, [data]);

  const featuredItem = data?.featured[heroIndex];

  return (
    <div className="space-y-10 pb-20 animate-fade-in">
            
      {/* 1. HERO SECTION */}
      <div className="relative w-full h-[450px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl group bg-gray-900">
         {featuredItem ? (
           <>
             {/* Imagem de Fundo com Animação */}
             <div className="absolute inset-0">
                <Image 
                   src={featuredItem.cover_image || featuredItem.url || '/assets/images/placeholder-module.png'} 
                   alt={featuredItem.title} 
                   fill 
                   className="object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105"
                   priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent"></div>
             </div>

             {/* Texto e Botões */}
             <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 text-white z-10">
                <div className="max-w-2xl space-y-4">
                    <div className="flex items-center gap-3">
                       <span className="bg-brand-purple text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-purple-500/30">
                          Destaque
                       </span>
                       <span className="text-gray-300 text-xs font-medium uppercase tracking-widest border-l border-gray-500 pl-3">
                          {featuredItem.subject || 'Geral'}
                       </span>
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-xl">
                       {featuredItem.title}
                    </h1>
                    
                    <p className="text-gray-200 text-lg line-clamp-2 md:line-clamp-3 font-light drop-shadow-md max-w-xl">
                       {featuredItem.description || 'Conteúdo exclusivo selecionado para impulsionar seus estudos.'}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 pt-4">
                       <button 
                          onClick={() => onContentSelect(featuredItem)}
                          className="bg-white text-black px-8 py-3.5 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center gap-3 shadow-xl hover:-translate-y-1"
                       >
                          <i className="fas fa-play"></i> Ler Agora
                       </button>
                    </div>
                </div>
             </div>

             {/* Bolinhas do Carrossel */}
             <div className="absolute bottom-8 right-8 flex gap-2 z-20">
                {data.featured.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setHeroIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === heroIndex ? 'w-8 bg-brand-purple' : 'w-2 bg-white/50 hover:bg-white'}`}
                    />
                ))}
             </div>
           </>
         ) : (
           <div className="w-full h-full flex items-center justify-center text-white/20">
              <i className="fas fa-film text-6xl"></i>
           </div>
         )}
      </div>

      {/* 2. FILTROS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 sticky top-0 z-20 py-4 bg-[#F8F9FA]/95 backdrop-blur-md -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex gap-3 overflow-x-auto w-full md:w-auto scrollbar-hide pb-2 md:pb-0">
              {['Todos', 'Matemática', 'Literatura', 'Ciências', 'video', 'book'].map((filter) => (
                  <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                          activeFilter === filter 
                          ? 'bg-black text-white border-black shadow-lg' 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                  >
                      {filter === 'video' ? 'Vídeos' : filter === 'book' ? 'Livros' : filter}
                  </button>
              ))}
          </div>
      </div>

      {/* 3. LISTAS DE CONTEÚDO */}
      <div className="space-y-12">
          
          {/* Se estiver filtrado, mostra Grid. Se não, mostra Swimlanes (Linhas) */}
          {activeFilter !== 'Todos' ? (
              <div className="animate-fade-in">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <i className="fas fa-filter text-brand-purple"></i> Resultados: {activeFilter}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {filteredContent.map((item) => (
                          <CardItem key={item.id} item={item} onClick={() => onContentSelect(item)} />
                      ))}
                  </div>
              </div>
          ) : (
              <>
                <SectionRow 
                    title="Matemática e Lógica" 
                    icon="fa-calculator"
                    items={data.math} 
                    onItemClick={onContentSelect} 
                />
                
                <SectionRow 
                    title="Clássicos da Literatura" 
                    icon="fa-book-reader"
                    items={data.literature} 
                    onItemClick={onContentSelect} 
                />

                <SectionRow 
                    title="Universo da Ciência" 
                    icon="fa-flask"
                    items={data.science} 
                    onItemClick={onContentSelect} 
                />
              </>
          )}
      </div>
    </div>
  );
}

// Subcomponentes para o View
const SectionRow = ({ title, icon, items, onItemClick }: any) => {
    if (!items || items.length === 0) return null;
    return (
        <div className="group/section">
            <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-8 h-8 rounded-lg bg-royal-blue/10 flex items-center justify-center text-royal-blue">
                    <i className={`fas ${icon}`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                <div className="flex-1 h-px bg-gray-100 ml-4 group-hover/section:bg-gray-200 transition-colors"></div>
                <button className="text-xs font-bold text-gray-400 hover:text-royal-blue transition-colors uppercase tracking-wider">Ver Tudo</button>
            </div>
            
            <div className="flex gap-5 overflow-x-auto pb-8 pt-2 px-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-royal-blue/20">
                {items.map((item: any) => (
                    <CardItem key={item.id} item={item} onClick={() => onItemClick(item)} />
                ))}
            </div>
        </div>
    )
}

const CardItem = ({ item, onClick }: any) => (
    <div onClick={onClick} className="min-w-[180px] w-[180px] flex-shrink-0 group cursor-pointer relative">
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-sm group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-300 bg-gray-200">
            <Image 
                src={item.cover_image || item.url || '/assets/images/placeholder-book.png'} 
                alt={item.title} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                 <div className="w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-transform duration-300">
                    <i className="fas fa-play text-black ml-1 text-lg"></i>
                 </div>
            </div>
            {/* Badge */}
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[9px] font-bold text-white uppercase">
                {item.content_type === 'book' ? 'Livro' : item.content_type === 'video' ? 'Vídeo' : 'Doc'}
            </div>
        </div>
        <div className="mt-3 px-1">
            <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-royal-blue transition-colors" title={item.title}>{item.title}</h4>
            <p className="text-xs text-gray-500 truncate">{item.author || 'FHub Oficial'}</p>
        </div>
    </div>
);