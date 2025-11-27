"use client";

import { useEffect, useState, ReactElement } from 'react';
import { Essay, EssayCorrection, Annotation, getEssayDetails, getCorrectionForEssay, AIFeedback } from '../actions';
import Image from 'next/image';
import { VerificationBadge } from '@/components/VerificationBadge';

// --- TIPOS ---
type CorrectionWithDetails = EssayCorrection & {
  profiles: { full_name: string | null; verification_badge: string | null };
  ai_feedback: AIFeedback | null;
};

type FullEssayDetails = Essay & {
  correction: CorrectionWithDetails | null;
  profiles: { full_name: string | null } | null;
};

// --- ESTILOS E HELPERS ---
const markerStyles = {
    erro: { color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
    acerto: { color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
    sugestao: { color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
};

// --- COMPONENTE PRINCIPAL ---
export default function EssayCorrectionView({ essayId, onBack }: {essayId: string, onBack: () => void}) {
    const [details, setDetails] = useState<FullEssayDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'humano' | 'ia' | 'plano'>('humano');

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            const essayResult = await getEssayDetails(essayId);

            if (essayResult.data) {
                const correctionResult = await getCorrectionForEssay(essayId);
                const finalCorrection = correctionResult.data ? { ...correctionResult.data } as CorrectionWithDetails : null;

                setDetails({
                    ...(essayResult.data as FullEssayDetails),
                    correction: finalCorrection,
                });
            }
            setIsLoading(false);
        };
        fetchDetails();
    }, [essayId]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-blue"></div></div>;
    if (!details) return <div className="text-center p-8 text-gray-500">Redação não encontrada.</div>;

    const { title, content, correction, image_submission_url } = details;
    const annotations = correction?.annotations || [];

    // --- RENDERIZADORES ---

    // Renderiza o texto com marcações
    const renderAnnotatedText = () => {
        if (!content) return <p className="text-gray-400 italic">Sem conteúdo textual.</p>;
        
        const textAnnotations = annotations.filter(a => a.type === 'text');
        if (textAnnotations.length === 0) {
            return <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed font-serif" dangerouslySetInnerHTML={{ __html: content }} />;
        }

        return (
            <div className="relative">
                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed font-serif" dangerouslySetInnerHTML={{ __html: content }} />
                
                {/* Lista Lateral de Anotações para não quebrar o HTML */}
                <div className="mt-8 space-y-3 border-t pt-6 dark:border-gray-700">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Comentários no Texto</h4>
                    {textAnnotations.map((anno, i) => {
                        const style = markerStyles[anno.marker];
                        return (
                            <div key={i} className={`p-4 rounded-lg border ${style.bg} ${style.border} shadow-sm transition-transform hover:scale-[1.01]`}>
                                <div className="flex items-start gap-3">
                                    <div className={`mt-0.5 text-lg ${style.color}`}>
                                        {anno.marker === 'erro' ? <i className="fas fa-times-circle"></i> : anno.marker === 'acerto' ? <i className="fas fa-check-circle"></i> : <i className="fas fa-lightbulb"></i>}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800 dark:text-gray-900 mb-1 italic border-l-2 border-black/20 pl-2">
                                            "{anno.selection}"
                                        </p>
                                        <p className="text-sm text-gray-700 dark:text-gray-800">{anno.comment}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* --- HEADER --- */}
            <div className="flex items-center justify-between bg-white dark:bg-dark-card p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-royal-blue hover:bg-blue-50 transition-all">
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-dark-text dark:text-white leading-tight">{title || "Redação sem Título"}</h1>
                        <p className="text-xs text-gray-500">Enviada em {details.submitted_at ? new Date(details.submitted_at).toLocaleDateString() : 'Data desconhecida'}</p>
                    </div>
                </div>
                
                {/* NOTA FINAL EM DESTAQUE */}
                {correction && (
                    <div className="text-right bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg border border-green-100 dark:border-green-800">
                        <p className="text-[10px] uppercase font-bold text-green-600 dark:text-green-400 tracking-wider">Nota Final</p>
                        <p className="text-3xl font-black text-green-700 dark:text-green-300">{correction.final_grade}</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* --- ESQUERDA: CONTEÚDO DA REDAÇÃO --- */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-dark-card p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 min-h-[600px] relative">
                        {image_submission_url ? (
                            <div className="relative w-full h-auto rounded-lg overflow-hidden border dark:border-gray-600 bg-gray-100">
                                <Image src={image_submission_url} alt="Redação" width={800} height={1200} className="w-full h-auto" />
                                {annotations?.filter(a => a.type === 'image').map(a => (
                                    <div key={a.id} className="absolute border-2 border-yellow-400 bg-yellow-400/30 cursor-help group rounded-sm shadow-lg hover:shadow-yellow-400/50 transition-shadow" style={{ left: `${a.position!.x}%`, top: `${a.position!.y}%`, width: `${a.position!.width}%`, height: `${a.position!.height}%` }}>
                                         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 z-20 shadow-xl pointer-events-none">
                                            {a.comment}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                         </div>
                                    </div>
                                ))}
                            </div>
                        ) : renderAnnotatedText()}
                    </div>
                </div>

                {/* --- DIREITA: PAINEL DE FEEDBACK --- */}
                <div className="space-y-6">
                    
                    {/* 1. SELO DE RECONHECIMENTO */}
                    {correction?.badge && (
                        <div className="bg-gradient-to-r from-yellow-100 via-orange-100 to-yellow-100 p-1 rounded-2xl shadow-md animate-fade-in-up">
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
                                    <i className="fas fa-medal"></i>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wide">Reconhecimento</p>
                                    <p className="text-lg font-bold text-gray-800 dark:text-white">{correction.badge}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. TABS DE NAVEGAÇÃO */}
                    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="flex border-b dark:border-gray-700">
                            <button onClick={() => setActiveTab('humano')} className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'humano' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                <i className="fas fa-user-tie mr-2"></i> Professor
                            </button>
                            {correction?.ai_feedback && (
                                <>
                                    <button onClick={() => setActiveTab('ia')} className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'ia' ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600 dark:bg-purple-900/20 dark:text-purple-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                        <i className="fas fa-robot mr-2"></i> IA
                                    </button>
                                    <button onClick={() => setActiveTab('plano')} className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'plano' ? 'bg-green-50 text-green-600 border-b-2 border-green-600 dark:bg-green-900/20 dark:text-green-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                        <i className="fas fa-list-check mr-2"></i> Plano
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="p-6">
                            {/* ABA 1: CORREÇÃO HUMANA */}
                            {activeTab === 'humano' && correction && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-royal-blue font-bold">
                                            {correction.profiles?.full_name?.charAt(0) || 'P'}
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-bold">Corrigido por</p>
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm font-bold text-dark-text dark:text-white">{correction.profiles?.full_name || 'Professor'}</span>
                                                <VerificationBadge badge={correction.profiles?.verification_badge} size="10px" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-2">Feedback Geral</h3>
                                        <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700">
                                            {correction.feedback}
                                        </div>
                                    </div>

                                    {correction.audio_feedback_url && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm shrink-0"><i className="fas fa-play text-xs"></i></div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-1">Comentário de Voz</p>
                                                <audio src={correction.audio_feedback_url} controls className="w-full h-6" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Notas por Competência</h4>
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="flex justify-between text-sm py-1.5 border-b border-dashed border-gray-100 dark:border-gray-700 last:border-0">
                                                <span className="text-gray-600 dark:text-gray-400">Competência {i}</span>
                                                <span className="font-bold text-dark-text dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
                                                    {correction[`grade_c${i}` as keyof EssayCorrection] as number}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {correction.additional_link && (
                                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <a href={correction.additional_link} target="_blank" rel="noopener noreferrer" className="group block bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800/50 hover:shadow-md transition-all">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <i className="fas fa-external-link-alt text-blue-500 group-hover:scale-110 transition-transform"></i>
                                                    <span className="font-bold text-blue-800 dark:text-blue-300 text-xs">Material Recomendado</span>
                                                </div>
                                                <p className="text-xs text-blue-600/80 dark:text-blue-400 truncate">{correction.additional_link}</p>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ABA 2: FEEDBACK IA */}
                            {activeTab === 'ia' && correction?.ai_feedback && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800/50">
                                        <h4 className="font-bold text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-2"><i className="fas fa-robot"></i> Análise Automática</h4>
                                        <p className="text-xs text-purple-700 dark:text-purple-400 mb-4">Feedback detalhado gerado pela nossa Inteligência Artificial.</p>
                                    </div>
                                    <div className="space-y-3">
                                        {(!Array.isArray(correction.ai_feedback) ? correction.ai_feedback : correction.ai_feedback[0])?.detailed_feedback.map((item, i) => (
                                            <div key={i} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                                <p className="font-bold text-xs text-gray-500 uppercase mb-1">{item.competency}</p>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">{item.feedback}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ABA 3: PLANO DE AÇÃO */}
                            {activeTab === 'plano' && correction?.ai_feedback && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800/50">
                                        <h4 className="font-bold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2"><i className="fas fa-list-check"></i> Próximos Passos</h4>
                                        <p className="text-xs text-green-700 dark:text-green-400">Foque nestes pontos para melhorar sua próxima nota.</p>
                                    </div>
                                    <ul className="space-y-2">
                                        {(!Array.isArray(correction.ai_feedback) ? correction.ai_feedback : correction.ai_feedback[0])?.actionable_items.map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 p-3 bg-white dark:bg-dark-card rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                                                <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 text-xs mt-0.5 shrink-0">
                                                    {i + 1}
                                                </div>
                                                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}