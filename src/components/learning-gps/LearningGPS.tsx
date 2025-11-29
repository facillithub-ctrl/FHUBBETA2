"use client";

import React, { useEffect, useState } from 'react';
import { getLearningGPSData, GPSData } from './actions';
import { GPSAction } from './types';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { ChevronRight, ChevronDown, PenTool, CheckCircle, BookOpen } from 'lucide-react';

export default function LearningGPS() {
    const [data, setData] = useState<GPSData | null>(null);
    const [loading, setLoading] = useState(true);
    const [openModule, setOpenModule] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            const res = await getLearningGPSData();
            setData(res);
            setLoading(false);
        }
        load();
    }, []);

    const toggleModule = (mod: string) => {
        setOpenModule(openModule === mod ? null : mod);
    };

    if (loading) return <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />;
    if (!data) return null;

    return (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* 1. GPS DE APRENDIZAGEM (Cards de Prioridade - Prof + Admin) */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <LucideIcons.Compass className="text-royal-blue" size={24} />
                    <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
                        GPS de Aprendizagem
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {data.recommendations.length > 0 ? (
                        data.recommendations.map((action) => (
                            <GPSCard key={action.id} action={action} />
                        ))
                    ) : (
                        <div className="col-span-full py-8 px-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center gap-3 text-gray-400">
                            <LucideIcons.CheckCircle size={20} />
                            <span className="font-medium">Tudo em dia! Escolha um módulo abaixo para praticar.</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. MÓDULOS & AÇÕES RÁPIDAS */}
            <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Menu de Ações Rápidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* REDAÇÃO */}
                    <ModuleDropdown 
                        label="Redação" 
                        icon={PenTool} 
                        color="text-purple-600 bg-purple-50 dark:bg-purple-900/20" 
                        isOpen={openModule === 'write'} 
                        onToggle={() => toggleModule('write')}
                        actions={data.shortcuts.write}
                    />

                    {/* SIMULADOS */}
                    <ModuleDropdown 
                        label="Simulados" 
                        icon={CheckCircle} 
                        color="text-green-600 bg-green-50 dark:bg-green-900/20" 
                        isOpen={openModule === 'test'} 
                        onToggle={() => toggleModule('test')}
                        actions={data.shortcuts.test}
                    />

                    {/* BIBLIOTECA */}
                    <ModuleDropdown 
                        label="Biblioteca" 
                        icon={BookOpen} 
                        color="text-blue-600 bg-blue-50 dark:bg-blue-900/20" 
                        isOpen={openModule === 'library'} 
                        onToggle={() => toggleModule('library')}
                        actions={data.shortcuts.library}
                    />

                </div>
            </div>
        </div>
    );
}

// --- COMPONENTES AUXILIARES ---

const GPSCard = ({ action }: { action: GPSAction }) => {
    // @ts-ignore
    const Icon = LucideIcons[action.icon_name] || LucideIcons.Star;
    
    // Diferenciar visualmente ações do Professor vs Sistema
    const isTeacher = action.source === 'Professor';

    return (
        <Link 
            href={action.link}
            className="group relative flex flex-col justify-between p-5 bg-white dark:bg-[#1a1b1e] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 min-h-[160px] overflow-hidden"
        >
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full opacity-10 transition-transform group-hover:scale-150 ${action.bg_color || 'bg-blue-600'}`} />
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${action.bg_color || 'bg-blue-600'}`}>
                        <Icon size={20} />
                    </div>
                    {isTeacher ? (
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-bold uppercase rounded-full border border-red-200 animate-pulse">
                            Professor
                        </span>
                    ) : (
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-full border border-blue-100">
                            Recomendado
                        </span>
                    )}
                </div>

                <h4 className="font-bold text-gray-800 dark:text-white text-lg leading-tight mb-2 group-hover:text-royal-blue transition-colors line-clamp-2">
                    {action.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {action.description}
                </p>
            </div>

            <div className="relative z-10 mt-4 pt-3 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{action.module}</span>
                <span className="text-[10px] font-bold text-royal-blue flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Acessar <ChevronRight size={12} />
                </span>
            </div>
        </Link>
    );
};

const ModuleDropdown = ({ label, icon: Icon, color, isOpen, onToggle, actions }: any) => {
    return (
        <div className={`
            bg-white dark:bg-[#1a1b1e] rounded-2xl border transition-all duration-300 overflow-hidden
            ${isOpen ? 'border-royal-blue shadow-md ring-1 ring-royal-blue/20' : 'border-gray-200 dark:border-white/5 shadow-sm hover:border-gray-300'}
        `}>
            {/* Header Clicável */}
            <button 
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm ${color}`}>
                        <Icon size={22} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 dark:text-white">{label}</h4>
                        <p className="text-xs text-gray-500">
                            {isOpen ? 'Selecione uma opção' : `${actions.length} opções disponíveis`}
                        </p>
                    </div>
                </div>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-royal-blue' : 'text-gray-400'}`}>
                    <ChevronDown size={20} />
                </div>
            </button>

            {/* Lista Expansível */}
            <div className={`
                transition-all duration-300 ease-in-out bg-gray-50/50 dark:bg-black/20
                ${isOpen ? 'max-h-60 opacity-100 border-t border-gray-100 dark:border-white/5' : 'max-h-0 opacity-0'}
            `}>
                <div className="p-2 space-y-1">
                    {actions.map((action: GPSAction) => {
                        // @ts-ignore
                        const ActionIcon = LucideIcons[action.icon_name] || LucideIcons.Circle;
                        return (
                            <Link 
                                key={action.id} 
                                href={action.link}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white dark:hover:bg-white/10 hover:shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-white/5 transition-all group"
                            >
                                <div className="text-gray-400 group-hover:text-royal-blue transition-colors">
                                    <ActionIcon size={16} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-royal-blue transition-colors">
                                        {action.title}
                                    </div>
                                    <div className="text-[10px] text-gray-500 line-clamp-1">
                                        {action.description}
                                    </div>
                                </div>
                                <ChevronRight size={14} className="text-gray-300 group-hover:text-royal-blue opacity-0 group-hover:opacity-100 transition-all" />
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};