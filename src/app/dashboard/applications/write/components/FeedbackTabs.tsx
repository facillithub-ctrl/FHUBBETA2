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
        className={`px-4 py-2 font-bold text-xs rounded-full transition-all duration-300 border ${
            isActive 
            ? 'bg-[#42047e] text-white border-[#42047e] shadow-md' 
            : 'bg-transparent text-gray-500 border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
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
        // H-FULL é crucial aqui para ocupar a altura do pai
        <div className="h-full flex flex-col p-4">
            
            {/* Cabeçalho Fixo */}
            <div className="flex space-x-2 border-b border-gray-100 dark:border-gray-700 pb-4 mb-4 flex-shrink-0">
                <TabButton label="Professor" isActive={activeTab === 'human'} onClick={() => setActiveTab('human')} />
                {aiFeedback && <TabButton label="Análise IA" isActive={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />}
                {aiFeedback && <TabButton label="Plano" isActive={activeTab === 'actions'} onClick={() => setActiveTab('actions')} />}
            </div>

            {/* Área de Conteúdo Scrollável - min-h-0 é o segredo do flexbox scroll */}
            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2 space-y-4">
                
                {activeTab === 'human' && (
                    <div className="animate-fade-in space-y-4">
                        {humanCorrection ? (
                            <>
                                {humanCorrection.audio_feedback_url && (
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <h4 className="font-bold mb-2 text-xs text-gray-500 uppercase flex items-center gap-2"><i className="fas fa-microphone text-[#42047e]"></i> Áudio</h4>
                                        <audio controls className="w-full h-8"><source src={humanCorrection.audio_feedback_url} type="audio/webm" /></audio>
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-white mb-3 text-sm flex items-center gap-2">
                                        <i className="fas fa-comment-alt text-[#42047e]"></i> Comentários Gerais
                                    </h4>
                                    <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl whitespace-pre-wrap leading-relaxed border border-gray-100 dark:border-gray-700">
                                        {humanCorrection.feedback || "Sem comentários escritos."}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-20 text-gray-400">
                                <i className="fas fa-clock text-4xl mb-3 opacity-30"></i>
                                <p>Aguardando correção do professor.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'ai' && aiFeedback && (
                    <div className="space-y-4 animate-fade-in">
                        {aiFeedback.detailed_feedback?.map((item, index) => (
                            <div key={index} className="p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm">
                                <p className="font-bold text-xs text-[#42047e] dark:text-[#07f49e] mb-2 uppercase tracking-wider">{item.competency}</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{item.feedback}</p>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'actions' && aiFeedback && (
                     <div className="animate-fade-in">
                        <div className="bg-gradient-to-br from-[#42047e] to-[#07f49e] p-5 rounded-2xl text-white mb-6 shadow-lg">
                            <h4 className="font-bold text-lg mb-1">Plano de Estudos</h4>
                            <p className="opacity-90 text-xs">Foco personalizado para nota 1000.</p>
                        </div>
                        <ul className="space-y-3">
                            {aiFeedback.actionable_items?.map((item, index) => (
                                <li key={index} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <i className="fas fa-check-circle text-[#07f49e] mt-1"></i>
                                    <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                                        {typeof item === 'string' ? item : (item as any).text}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}