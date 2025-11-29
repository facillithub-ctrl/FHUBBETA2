"use client";

import React, { useEffect, useState } from 'react';
import { getLearningGPSData } from './actions';
import { GPSData, LearningAction } from './types';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';

const ActionCard = ({ action }: { action: LearningAction }) => {
    // Carrega o ícone dinamicamente baseado no nome salvo no banco
    // @ts-ignore
    const IconComponent = LucideIcons[action.icon_name] || LucideIcons.Star;
    const bgColor = action.bg_color || 'bg-blue-600';

    return (
        <Link 
            href={action.link}
            className="group relative flex flex-col justify-between p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 min-h-[160px] overflow-hidden"
        >
            {/* Imagem de Fundo (se houver) */}
            {action.image_url && (
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity bg-center bg-cover" style={{ backgroundImage: `url(${action.image_url})` }}></div>
            )}

            {/* Conteúdo */}
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg shadow-md ${bgColor}`}>
                        <IconComponent size={20} />
                    </div>
                    {action.priority === 'high' && (
                        <span className="animate-pulse px-2 py-1 bg-red-100 text-red-600 text-[10px] font-bold uppercase rounded-full tracking-wider border border-red-200">
                            Prioridade
                        </span>
                    )}
                </div>

                <div>
                    <h4 className="font-bold text-gray-800 dark:text-white text-lg leading-tight group-hover:text-royal-blue transition-colors">
                        {action.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                        {action.description}
                    </p>
                </div>
            </div>

            {/* Rodapé */}
            <div className="relative z-10 mt-4 pt-3 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                    {action.module}
                </span>
                <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center gap-1">
                    {action.button_text || 'Acessar'} <LucideIcons.ChevronRight size={12} />
                </span>
            </div>
            
            {/* Borda Colorida no Hover */}
            <div className={`absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-500/20 pointer-events-none transition-all`}></div>
        </Link>
    );
};

// ... (SkeletonLoader e Componente Principal mantêm-se similares, apenas use ActionCard atualizado)

export default function LearningGPS() {
    const [data, setData] = useState<GPSData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'recommended' | 'pending'>('all');

    useEffect(() => {
        async function load() {
            try {
                const result = await getLearningGPSData();
                setData(result);
            } catch (e) {
                console.error("Failed to load GPS", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>)}
        </div>
    );
    
    if (!data) return null;

    const filteredActions = filter === 'all' 
        ? data.actions 
        : data.actions.filter(a => a.category === filter);

    return (
        <div className="w-full mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-green">
                            GPS de Aprendizagem
                        </span>
                        <LucideIcons.Compass className="text-blue-600 animate-pulse" size={24} />
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Seu roteiro personalizado para evoluir hoje.
                    </p>
                </div>

                <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    {[
                        { id: 'all', label: 'Tudo' },
                        { id: 'recommended', label: 'Para Você' },
                        { id: 'pending', label: 'Escola' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id as any)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                filter === tab.id 
                                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredActions.length > 0 ? (
                    filteredActions.slice(0, 4).map((action) => (
                        <ActionCard key={action.id} action={action} />
                    ))
                ) : (
                    <div className="col-span-full py-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 text-sm">Tudo em dia! Aproveite para descansar ou explorar a biblioteca.</p>
                    </div>
                )}
            </div>
        </div>
    );
}