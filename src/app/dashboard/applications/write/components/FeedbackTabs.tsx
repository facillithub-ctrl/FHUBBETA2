"use client";

import { useState } from 'react';
import type { EssayCorrection } from '../actions';
import { VerificationBadge } from '@/components/VerificationBadge';

type Props = {
  correction: EssayCorrection | null;
};

const TabButton = ({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 font-bold text-sm rounded-full transition-all duration-300 ${
            isActive 
            ? 'bg-[#42047e] text-white shadow-md' 
            : 'bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
    >
        {label}
    </button>
);

export default function FeedbackTabs({ correction }: Props) {
    const [activeTab, setActiveTab] = useState<'human' | 'ai' | 'actions'>('human');

    const humanCorrection = correction;
    const aiFeedback = correction?.ai_feedback ?? null;

    return (
        <div className="h-full flex flex-col">
            <div className="flex space-x-2 border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
                <TabButton label="Professor" isActive={activeTab === 'human'} onClick={() => setActiveTab('human')} />
                {aiFeedback && <TabButton label="Análise IA" isActive={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />}
                {aiFeedback && <TabButton label="Plano de Ação" isActive={activeTab === 'actions'} onClick={() => setActiveTab('actions')} />}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {activeTab === 'human' && (
                    <div className="animate-fade-in">
                        {humanCorrection ? (
                            <div className="space-y-6">
                                {humanCorrection.audio_feedback_url && (
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                                        <h4 className="font-bold mb-2 text-sm text-gray-700 dark:text-white flex items-center gap-2">
                                            <i className="fas fa-microphone text-[#42047e]"></i> Feedback de Voz
                                        </h4>
                                        <audio controls className="w-full h-8"><source src={humanCorrection.audio_feedback_url} type="audio/webm" /></audio>
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-bold text-dark-text dark:text-white mb-2 flex items-center gap-2">
                                        <i className="fas fa-comment-alt text-[#42047e]"></i> Comentários Gerais
                                    </h4>
                                    <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl whitespace-pre-wrap leading-relaxed border border-gray-100 dark:border-gray-700">
                                        {humanCorrection.feedback}
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-2 text-xs text-gray-400 mt-2">
                                    <span>Corrigido por: {humanCorrection.profiles?.full_name}</span>
                                    <VerificationBadge badge={humanCorrection.profiles?.verification_badge} />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                <i className="fas fa-clock text-2xl mb-2"></i>
                                <p>Aguardando correção humana.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'ai' && aiFeedback && (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <h4 className="font-bold text-lg mb-4 text-dark-text dark:text-white flex items-center gap-2">
                                <i className="fas fa-robot text-[#07f49e]"></i> Análise por Competência
                            </h4>
                            <ul className="space-y-3">
                                {/* CORREÇÃO AQUI: Optional Chaining ?. e fallback || [] */}
                                {aiFeedback.detailed_feedback?.map((item, index) => (
                                    <li key={index} className="p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all">
                                        <p className="font-bold text-sm text-[#42047e] dark:text-[#07f49e] mb-1">{item.competency}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.feedback}</p>
                                    </li>
                                )) || <p className="text-gray-500">Sem detalhes disponíveis.</p>}
                            </ul>
                        </div>
                        
                        {/* Sugestões de Reescrita */}
                        {aiFeedback.rewrite_suggestions && aiFeedback.rewrite_suggestions.length > 0 && (
                             <div>
                                <h4 className="font-bold text-lg mb-4 text-dark-text dark:text-white mt-6">
                                    <i className="fas fa-pen-fancy text-purple-500 mr-2"></i> Sugestões de Melhoria
                                </h4>
                                <div className="space-y-4">
                                    {aiFeedback.rewrite_suggestions.map((item, idx) => (
                                        <div key={idx} className="grid grid-cols-1 gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-sm">
                                            <div className="text-red-500 line-through opacity-70 bg-red-50 w-fit px-2 rounded">{item.original}</div>
                                            <div className="text-green-600 font-medium bg-green-50 w-fit px-2 rounded gap-2 flex items-center">
                                                <i className="fas fa-arrow-right text-xs"></i> {item.suggestion}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        )}
                    </div>
                )}

                {activeTab === 'actions' && aiFeedback && (
                     <div className="animate-fade-in">
                        <div className="bg-gradient-to-r from-[#42047e] to-[#07f49e] p-6 rounded-2xl text-white mb-6 shadow-lg">
                            <h4 className="font-bold text-xl mb-2"><i className="fas fa-tasks mr-2"></i> Plano de Estudos</h4>
                            <p className="opacity-90 text-sm">A IA identificou estes pontos focais para você atingir a nota 1000.</p>
                        </div>
                        
                        <ul className="space-y-3">
                            {/* CORREÇÃO AQUI TAMBÉM */}
                            {aiFeedback.actionable_items?.map((item, index) => (
                                <li key={index} className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl group hover:border-[#42047e] transition-colors">
                                    <div className="w-6 h-6 rounded-full bg-purple-100 text-[#42047e] flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-[#42047e] group-hover:text-white transition-colors">
                                        <span className="text-xs font-bold">{index + 1}</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item}</span>
                                </li>
                            )) || <p className="text-gray-500">Nenhum plano gerado.</p>}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}