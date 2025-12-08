"use client";

import { useState } from 'react';
import { toggleActionPlanItem, ActionPlan } from '../actions';

export default function PracticePlanWidget({ plans }: { plans: ActionPlan[] }) {
    // Estado local para atualização otimista (sem esperar o banco responder)
    const [items, setItems] = useState(plans);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleToggle = async (item: ActionPlan) => {
        // Se não tiver ID da redação original, não tem como salvar no banco
        if (!item.source_essay) return; 
        
        setLoadingId(item.id);

        // 1. Atualização Otimista na UI
        const newStatus = !item.is_completed;
        setItems(prev => prev.map(p => p.id === item.id ? { ...p, is_completed: newStatus } : p));

        try {
            // 2. Atualiza no Banco (precisamos passar o ID da essay original para encontrar o registro)
            // Nota: A action precisa ser capaz de identificar qual essay contém este item.
            // Aqui assumimos que o 'source_essay' é o ID ou Título único.
            // O ideal é que o objeto 'item' tenha essay_id vindo da action getUserActionPlans.
            await toggleActionPlanItem(item.id, item.text, newStatus);
        } catch (error) {
            console.error("Erro ao salvar:", error);
            // Reverte em caso de erro
            setItems(prev => prev.map(p => p.id === item.id ? { ...p, is_completed: !newStatus } : p));
        } finally {
            setLoadingId(null);
        }
    };

    // Cálculos de Progresso
    const total = items.length;
    const completed = items.filter(i => i.is_completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border h-full flex flex-col overflow-hidden">
            
            {/* Header com Gradiente e Progresso */}
            <div className="bg-gradient-to-r from-[#42047e] to-[#07f49e] p-5 text-white flex-shrink-0">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <i className="fas fa-tasks"></i> Plano de Prática
                        </h3>
                        <p className="text-xs opacity-90 text-white/80">Metas baseadas na IA</p>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-black">{percentage}%</span>
                    </div>
                </div>
                {/* Barra de Progresso */}
                <div className="w-full bg-black/20 rounded-full h-1.5 backdrop-blur-sm">
                    <div 
                        className="bg-white h-1.5 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Lista de Itens com Scroll */}
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                {items.length > 0 ? (
                    <div className="space-y-2">
                        {items.map((item) => (
                            <div 
                                key={item.id} 
                                onClick={() => handleToggle(item)}
                                className={`group flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                                    item.is_completed 
                                    ? 'bg-gray-50 border-transparent opacity-60 dark:bg-gray-800/50' 
                                    : 'bg-white border-gray-100 hover:border-[#42047e]/30 hover:shadow-sm dark:bg-dark-card dark:border-gray-700'
                                }`}
                            >
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                                    item.is_completed 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : 'border-gray-300 group-hover:border-[#42047e] text-transparent'
                                }`}>
                                    {loadingId === item.id ? (
                                        <i className="fas fa-spinner fa-spin text-[10px]"></i>
                                    ) : (
                                        <i className="fas fa-check text-[10px]"></i>
                                    )}
                                </div>
                                
                                <div className="flex-1">
                                    <p className={`text-sm font-medium transition-colors ${
                                        item.is_completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'
                                    }`}>
                                        {item.text}
                                    </p>
                                    {item.source_essay && (
                                        <span className="text-[10px] text-gray-400 mt-1 block">
                                            <i className="fas fa-link mr-1"></i> {item.source_essay}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-6">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                            <i className="fas fa-clipboard-check text-xl"></i>
                        </div>
                        <p className="text-sm">Seu plano de estudos está vazio.</p>
                        <p className="text-xs mt-1">Envie uma redação para gerar metas.</p>
                    </div>
                )}
            </div>
        </div>
    );
}