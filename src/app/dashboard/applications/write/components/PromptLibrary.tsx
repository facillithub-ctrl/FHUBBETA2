"use client";

import { useState } from 'react';
import Image from 'next/image';
import { EssayPrompt } from '../actions';

type Props = {
    prompts: EssayPrompt[];
    onSelectPrompt: (prompt: EssayPrompt) => void;
    onBack: () => void;
};

export default function PromptLibrary({ prompts, onSelectPrompt, onBack }: Props) {
    const [filter, setFilter] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const filteredPrompts = prompts.filter(p => {
        const matchesText = p.title.toLowerCase().includes(filter.toLowerCase()) || 
                            (p.description && p.description.toLowerCase().includes(filter.toLowerCase()));
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        return matchesText && matchesCategory;
    });

    const categories = ['all', ...Array.from(new Set(prompts.map(p => p.category || 'Geral')))];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header da Biblioteca */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500">
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 dark:text-white">Biblioteca de Temas</h2>
                        <p className="text-sm text-gray-500">Explore e escolha um tema para praticar.</p>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input 
                            type="text" 
                            placeholder="Buscar tema..." 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 w-full focus:ring-2 focus:ring-[#42047e] outline-none"
                        />
                    </div>
                    <select 
                        value={selectedCategory} 
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#42047e] outline-none"
                    >
                        <option value="all">Todas Categorias</option>
                        {categories.filter(c => c !== 'all').map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grid de Temas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrompts.map(prompt => (
                    <div key={prompt.id} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full">
                        <div className="relative h-40 bg-gray-200 dark:bg-gray-800">
                            {prompt.image_url ? (
                                <Image src={prompt.image_url} alt={prompt.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#42047e]/10 to-[#07f49e]/10">
                                    <i className="fas fa-book-open text-4xl text-[#42047e] opacity-30"></i>
                                </div>
                            )}
                            <div className="absolute top-3 left-3">
                                <span className="bg-white/90 dark:bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#42047e] dark:text-[#07f49e] shadow-sm">
                                    {prompt.category || 'Geral'}
                                </span>
                            </div>
                        </div>
                        
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2 line-clamp-2">{prompt.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4 flex-1">
                                {prompt.description || "Sem descrição disponível."}
                            </p>
                            
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                    <i className="fas fa-signal"></i> Dificuldade: {prompt.difficulty || 1}/5
                                </div>
                                <button 
                                    onClick={() => onSelectPrompt(prompt)}
                                    className="bg-[#42047e] hover:bg-[#360368] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                                >
                                    Escrever <i className="fas fa-pen-nib"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredPrompts.length === 0 && (
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-3xl">
                        <i className="fas fa-search"></i>
                    </div>
                    <p className="text-gray-500">Nenhum tema encontrado para sua busca.</p>
                </div>
            )}
        </div>
    );
}