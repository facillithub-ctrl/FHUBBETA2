"use client";

import { useState, useMemo } from 'react';
import { EssayPrompt } from '../actions';
import Image from 'next/image';

type Props = {
  prompts: EssayPrompt[];
  onSelect: (prompt: EssayPrompt) => void;
  onBack: () => void;
};

// Card estilo "Capa de Filme"
const PromptCard = ({ prompt, onSelect }: { prompt: EssayPrompt, onSelect: (p: EssayPrompt) => void }) => {
    return (
        <div 
            className="group relative bg-white dark:bg-dark-card rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full"
            onClick={() => onSelect(prompt)}
        >
            {/* Imagem / Header */}
            <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-800">
                {prompt.image_url ? (
                    <Image src={prompt.image_url} alt={prompt.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-brand-purple/20 to-brand-green/20">
                        <i className="fas fa-pen-fancy text-4xl text-brand-purple/40"></i>
                    </div>
                )}
                <div className="absolute top-3 left-3">
                    <span className="bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-text-primary dark:text-white uppercase tracking-wider shadow-sm">
                        {prompt.category || 'Geral'}
                    </span>
                </div>
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-brand-green text-brand-purple font-bold px-4 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform shadow-lg">
                        Escrever Agora
                    </span>
                </div>
            </div>

            {/* Conteúdo */}
            <div className="p-5 flex flex-col flex-grow">
                <h2 className="text-lg font-bold text-text-primary dark:text-white mb-2 leading-tight group-hover:text-brand-purple transition-colors">
                    {prompt.title}
                </h2>
                
                <p className="text-sm text-text-secondary line-clamp-2 mb-4 flex-grow">
                    {prompt.description || 'Sem descrição disponível.'}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                    {prompt.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] bg-gray-100 dark:bg-gray-800 text-text-secondary px-2 py-1 rounded-md">
                            #{tag}
                        </span>
                    ))}
                    {prompt.difficulty && (
                        <div className="ml-auto flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <i key={i} className={`fas fa-star text-[10px] ${i < (prompt.difficulty || 0) ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-700'}`}></i>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function PromptSelector({ prompts, onSelect, onBack }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = useMemo(() => {
    const allCategories = prompts.map(p => p.category).filter(Boolean) as string[];
    return ['Todos', ...Array.from(new Set(allCategories))];
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    return prompts.filter(prompt => {
      const matchesCategory = selectedCategory === 'Todos' || prompt.category === selectedCategory;
      const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (prompt.description && prompt.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [prompts, selectedCategory, searchTerm]);

  return (
    <div className="animate-fade-in-right">
      {/* Header de Navegação */}
      <div className="flex items-center gap-4 mb-8">
        <button 
            onClick={onBack} 
            className="w-10 h-10 rounded-full bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
            <i className="fas fa-arrow-left text-text-secondary"></i>
        </button>
        <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-white">Biblioteca de Temas</h1>
            <p className="text-sm text-text-secondary">Escolha um desafio para hoje.</p>
        </div>
      </div>
      
      {/* Barra de Filtros Glassmorphism */}
      <div className="sticky top-4 z-20 bg-white/80 dark:bg-black/60 backdrop-blur-xl p-2 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm mb-8 flex flex-col md:flex-row gap-3">
        <div className="relative flex-grow">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Pesquisar temas..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full py-2.5 pl-10 pr-4 bg-transparent border-none focus:ring-0 text-sm text-text-primary dark:text-white placeholder-gray-400"
          />
        </div>
        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden md:block self-center"></div>
        <div className="flex-shrink-0 overflow-x-auto flex gap-2 px-2 md:px-0 pb-2 md:pb-0 no-scrollbar">
           {categories.map(cat => (
               <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat 
                      ? 'bg-brand-purple text-white shadow-md shadow-brand-purple/20' 
                      : 'bg-gray-100 dark:bg-gray-800 text-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
               >
                   {cat}
               </button>
           ))}
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
        {filteredPrompts.map(prompt => (
          <PromptCard key={prompt.id} prompt={prompt} onSelect={onSelect} />
        ))}
        {filteredPrompts.length === 0 && (
            <div className="col-span-full py-20 text-center">
                <div className="inline-block p-6 rounded-full bg-gray-50 dark:bg-gray-800 mb-4">
                    <i className="fas fa-search text-3xl text-gray-300"></i>
                </div>
                <p className="text-text-muted">Nenhum tema encontrado.</p>
            </div>
        )}
      </div>
    </div>
  );
}