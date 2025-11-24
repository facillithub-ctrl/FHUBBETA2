"use client";

import { useState } from 'react';
import type { EssayCorrection, AIFeedback } from '../actions';
import { VerificationBadge } from '@/components/VerificationBadge';

type CorrectionWithDetails = EssayCorrection & {
  profiles: { full_name: string | null; verification_badge: string | null };
  ai_feedback: AIFeedback | null;
};

type Props = {
  correction: CorrectionWithDetails | null;
};

export default function FeedbackTabs({ correction }: Props) {
    const [activeTab, setActiveTab] = useState<'human' | 'ai' | 'actions'>('human');
    const humanCorrection = correction;
    const aiFeedback = correction?.ai_feedback ?? null;

    const handleShare = () => {
        const text = `Consegui nota ${correction?.final_grade} no Facillit Hub! 🚀`;
        if (navigator.share) navigator.share({ title: 'Minha Nota', text, url: window.location.href });
        else navigator.clipboard.writeText(`${text} ${window.location.href}`);
    };

    return (
        <div className="flex flex-col h-full">
            {/* --- Navegação das Abas (Estilo Segmented Control) --- */}
            <div className="flex p-1.5 bg-gray-100/80 dark:bg-black/40 rounded-xl mb-6 relative backdrop-blur-sm border border-white/10">
                <button
                    onClick={() => setActiveTab('human')}
                    className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                        activeTab === 'human' 
                        ? 'bg-white dark:bg-gray-800 text-[#42047e] dark:text-[#07f49e] shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                    }`}
                >
                    <i className="fas fa-chalkboard-teacher"></i> <span className="hidden sm:inline">Professor</span>
                </button>
                <button
                    onClick={() => setActiveTab('ai')}
                    className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                        activeTab === 'ai' 
                        ? 'bg-white dark:bg-gray-800 text-[#42047e] dark:text-[#07f49e] shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                    }`}
                >
                    <i className="fas fa-robot"></i> <span className="hidden sm:inline">Análise IA</span>
                </button>
                <button
                    onClick={() => setActiveTab('actions')}
                    className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                        activeTab === 'actions' 
                        ? 'bg-white dark:bg-gray-800 text-[#42047e] dark:text-[#07f49e] shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                    }`}
                >
                    <i className="fas fa-list-check"></i> <span className="hidden sm:inline">Plano</span>
                </button>
            </div>

            {/* --- Conteúdo --- */}
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar animate-fade-in">
                
                {/* ABA 1: Correção Humana */}
                {activeTab === 'human' && humanCorrection && (
                    <div className="space-y-5">
                         {/* Perfil do Corretor */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#42047e] to-[#6a0dad] flex items-center justify-center text-white font-bold">
                                {humanCorrection.profiles?.full_name?.[0]}
                            </div>
                            <div>
                                <p className="text-sm font-bold dark:text-white flex items-center gap-1">
                                    {humanCorrection.profiles?.full_name}
                                    <VerificationBadge badge={humanCorrection.profiles?.verification_badge} />
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Corretor Especialista</p>
                            </div>
                        </div>

                        {/* Áudio Player (Se houver) */}
                        {humanCorrection.audio_feedback_url && (
                            <div className="p-4 bg-[#42047e]/5 dark:bg-[#42047e]/20 rounded-xl border border-[#42047e]/20">
                                <p className="text-xs font-bold text-[#42047e] dark:text-[#07f49e] mb-2 uppercase tracking-wider">
                                    <i className="fas fa-microphone mr-2"></i>Comentário de Voz
                                </p>
                                <audio controls className="w-full h-8 accent-[#42047e]">
                                    <source src={humanCorrection.audio_feedback_url} type="audio/webm" />
                                </audio>
                            </div>
                        )}

                        {/* Texto do Feedback */}
                        <div className="bg-white dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {humanCorrection.feedback}
                            </p>
                        </div>
                    </div>
                )}

                {/* ABA 2: Análise IA */}
                {activeTab === 'ai' && (
                    <div className="space-y-4">
                        {aiFeedback ? (
                            <>
                                <div className="p-4 bg-gradient-to-r from-[#42047e] to-[#07f49e] rounded-xl text-white shadow-lg">
                                    <div className="flex items-start gap-3">
                                        <i className="fas fa-sparkles text-xl mt-1"></i>
                                        <div>
                                            <h4 className="font-bold text-sm">Inteligência Artificial</h4>
                                            <p className="text-xs opacity-90 mt-1">Análise detalhada de padrões linguísticos e estrutura argumentativa.</p>
                                        </div>
                                    </div>
                                </div>

                                {aiFeedback.detailed_feedback?.map((item, idx) => (
                                    <div key={idx} className="group bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#07f49e] dark:hover:border-[#07f49e] transition-colors shadow-sm">
                                        <h5 className="text-xs font-bold text-[#42047e] dark:text-[#07f49e] uppercase mb-2">{item.competency}</h5>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{item.feedback}</p>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="text-center py-10 opacity-50">
                                <i className="fas fa-robot text-4xl mb-2"></i>
                                <p>Aguardando processamento da IA...</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ABA 3: Plano de Ação */}
                {activeTab === 'actions' && (
                    <div className="space-y-4">
                        {aiFeedback ? (
                            <>
                                <h4 className="font-bold text-gray-800 dark:text-white mb-2 px-1">Próximos Passos</h4>
                                <ul className="space-y-3">
                                    {aiFeedback.actionable_items?.map((item, idx) => (
                                        <li key={idx} className="flex gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-800/30">
                                            <div className="min-w-[24px] h-6 rounded-full bg-[#07f49e] flex items-center justify-center text-black text-xs font-bold">
                                                {idx + 1}
                                            </div>
                                            <span className="text-sm text-gray-700 dark:text-gray-200">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={handleShare} className="w-full mt-6 py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 font-bold text-sm hover:border-[#42047e] hover:text-[#42047e] transition-all">
                                    <i className="fas fa-share-alt mr-2"></i> Compartilhar Resultado
                                </button>
                            </>
                        ) : (
                            <div className="text-center py-10 opacity-50">
                                <p>Gere um plano com IA para ver recomendações.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}