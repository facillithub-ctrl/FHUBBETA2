// src/app/dashboard/applications/write/components/FeedbackTabs.tsx
"use client";

import { useState } from 'react';
import type { EssayCorrection, AIFeedback } from '../actions';
import { VerificationBadge } from '@/components/VerificationBadge';

// CORREÇÃO: Alinhado com EssayCorrectionView. 
// 1. Usa Omit para limpar ai_feedback base antes de redefinir.
// 2. Permite que profiles seja null.
type CorrectionWithDetails = Omit<EssayCorrection, 'ai_feedback'> & {
  profiles: { full_name: string | null; verification_badge: string | null } | null; 
  ai_feedback: AIFeedback | null;
};

type Props = {
  correction: CorrectionWithDetails | null;
};

const TabButton = ({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 font-semibold text-sm rounded-md transition-colors ${
            isActive ? 'bg-royal-blue text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
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
        <div>
            <div className="flex space-x-2 border-b dark:border-gray-700 mb-4">
                <TabButton label="Correção Humana" isActive={activeTab === 'human'} onClick={() => setActiveTab('human')} />
                {aiFeedback && <TabButton label="Análise por IA" isActive={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />}
                {aiFeedback && <TabButton label="Plano de Ação" isActive={activeTab === 'actions'} onClick={() => setActiveTab('actions')} />}
            </div>

            <div>
                {activeTab === 'human' && (
                    <div>
                        {humanCorrection ? (
                            <div className="space-y-4">
                                {humanCorrection.audio_feedback_url && (
                                    <div className="mb-4">
                                        <h4 className="font-bold mb-2 dark:text-white-text">Feedback em Áudio</h4>
                                        <audio controls className="w-full"><source src={humanCorrection.audio_feedback_url} type="audio/webm" /></audio>
                                    </div>
                                )}
                                <h4 className="font-bold dark:text-white-text">Feedback Geral</h4>
                                <div className="text-sm text-gray-700 dark:text-dark-text-muted bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md whitespace-pre-wrap">{humanCorrection.feedback}</div>
                                <div className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                                    {/* Verificação segura para profiles */}
                                    <span>Corrigido por: {humanCorrection.profiles?.full_name || 'Corretor não identificado'}</span>
                                    {humanCorrection.profiles?.verification_badge && (
                                        <VerificationBadge badge={humanCorrection.profiles.verification_badge} />
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">Aguardando correção humana.</p>
                        )}
                    </div>
                )}

                {activeTab === 'ai' && aiFeedback && (
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-bold text-lg mb-2 dark:text-white-text">Análise Detalhada por Competência</h4>
                            <ul className="space-y-3">
                                {aiFeedback.detailed_feedback.map((item, index) => (
                                    <li key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                        <p className="font-semibold text-sm dark:text-white">{item.competency}</p>
                                        <p className="text-sm text-text-muted dark:text-dark-text-muted">{item.feedback}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'actions' && aiFeedback && (
                     <div>
                        <h4 className="font-bold text-lg mb-2 dark:text-white-text">Seu Plano de Ação</h4>
                        <p className="text-sm text-text-muted dark:text-dark-text-muted mb-4">Com base na análise, foque nestes pontos para melhorar sua próxima redação:</p>
                        <ul className="space-y-3">
                            {aiFeedback.actionable_items.map((item, index) => (
                                <li key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                    <i className="fas fa-check-circle text-royal-blue mt-1"></i>
                                    <span className="text-sm font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}