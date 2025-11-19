"use client";

import { useEffect, useState } from 'react';
import { Essay, EssayCorrection, getEssayDetails, getCorrectionForEssay, AIFeedback } from '../actions';
import Image from 'next/image';
import Link from 'next/link';

// Tipos auxiliares
type FullEssayDetails = Essay & {
  correction: (EssayCorrection & { ai_feedback: AIFeedback | null, profiles: any }) | null;
  profiles: { full_name: string | null } | null;
};

export default function EssayCorrectionView({ essayId, onBack }: {essayId: string, onBack: () => void}) {
    const [details, setDetails] = useState<FullEssayDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'feedback' | 'actionPlan' | 'original'>('feedback');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const essay = await getEssayDetails(essayId);
            if(essay.data) {
                const correction = await getCorrectionForEssay(essayId);
                setDetails({ ...essay.data, correction: correction.data || null });
            }
            setLoading(false);
        };
        load();
    }, [essayId]);

    if (loading) return <div className="flex items-center justify-center h-96 text-[#42047e] animate-pulse">A carregar a tua evolução...</div>;
    if (!details) return <div className="p-8 text-center">Redação não encontrada.</div>;

    const { correction, content, title, image_submission_url } = details;
    const aiFeedback = correction?.ai_feedback;

    // Cores da marca para gradientes
    const brandGradient = "bg-gradient-to-r from-[#42047e] to-[#07f49e]";

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pb-20">
            {/* Header da Correção */}
            <div className={`${brandGradient} text-white p-8 rounded-b-[3rem] shadow-xl mb-8`}>
                <div className="max-w-6xl mx-auto">
                    <button onClick={onBack} className="mb-6 flex items-center text-white/80 hover:text-white transition">
                        <i className="fas fa-arrow-left mr-2"></i> Voltar ao Painel
                    </button>
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div>
                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block backdrop-blur-sm">Correção Finalizada</span>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">{title || "Sem Título"}</h1>
                            <p className="text-white/90">Enviado em {new Date(details.submitted_at!).toLocaleDateString('pt-PT')}</p>
                        </div>
                        {correction && (
                            <div className="text-center bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
                                <p className="text-xs uppercase font-bold opacity-80">Nota Final</p>
                                <p className="text-5xl font-black tracking-tighter">{correction.final_grade}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Coluna da Esquerda: Redação Original */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Navegação Interna */}
                    <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 pb-2">
                        <button 
                            onClick={() => setActiveTab('feedback')}
                            className={`pb-2 font-bold transition ${activeTab === 'feedback' ? 'text-[#42047e] dark:text-[#07f49e] border-b-2 border-[#07f49e]' : 'text-gray-400'}`}
                        >
                            Análise Detalhada
                        </button>
                        <button 
                            onClick={() => setActiveTab('actionPlan')}
                            className={`pb-2 font-bold transition ${activeTab === 'actionPlan' ? 'text-[#42047e] dark:text-[#07f49e] border-b-2 border-[#07f49e]' : 'text-gray-400'}`}
                        >
                            Plano de Ação
                        </button>
                        <button 
                            onClick={() => setActiveTab('original')}
                            className={`pb-2 font-bold transition ${activeTab === 'original' ? 'text-[#42047e] dark:text-[#07f49e] border-b-2 border-[#07f49e]' : 'text-gray-400'}`}
                        >
                            Meu Texto
                        </button>
                    </div>

                    {activeTab === 'feedback' && correction && (
                        <div className="bg-white dark:bg-[#121212] rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
                            <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Competências</h3>
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((c, i) => (
                                    <div key={i} className="group p-4 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition border border-transparent hover:border-[#42047e]/20">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-[#42047e] dark:text-[#07f49e]">Competência {c}</span>
                                            <span className="bg-white dark:bg-black px-3 py-1 rounded-lg font-bold text-sm shadow-sm">
                                                {(correction as any)[`grade_c${c}`]} pontos
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                            {/* Aqui podes mapear o feedback detalhado da IA se disponível */}
                                            {aiFeedback?.detailed_feedback?.find((f: any) => f.competency.includes(c.toString()))?.feedback || "Feedback geral indisponível para esta competência."}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'actionPlan' && aiFeedback && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl border border-indigo-100 dark:border-gray-700">
                                <h3 className="text-xl font-bold mb-4 text-[#42047e] dark:text-white flex items-center">
                                    <i className="fas fa-rocket mr-2"></i> Passos para Evoluir
                                </h3>
                                <ul className="space-y-3">
                                    {aiFeedback.actionable_items?.map((item: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-3 bg-white dark:bg-black/40 p-3 rounded-lg">
                                            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-[#07f49e] text-[#42047e] flex items-center justify-center font-bold text-xs mt-0.5">{idx + 1}</span>
                                            <span className="text-gray-700 dark:text-gray-200 text-sm">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {aiFeedback.rewrite_suggestions && (
                                <div className="bg-white dark:bg-[#121212] p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Sugestões de Reespcrita</h3>
                                    <div className="grid gap-4">
                                        {aiFeedback.rewrite_suggestions.map((sug: any, idx: number) => (
                                            <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
                                                <div className="text-red-500/80 text-sm line-through">{sug.original}</div>
                                                <div className="text-green-600 dark:text-[#07f49e] text-sm font-medium">{sug.suggestion}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'original' && (
                        <div className="bg-white dark:bg-[#121212] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 prose dark:prose-invert max-w-none">
                            {image_submission_url ? (
                                <Image src={image_submission_url} alt="Redação" width={800} height={1000} className="w-full h-auto rounded-lg" />
                            ) : (
                                <div dangerouslySetInnerHTML={{ __html: content || '' }} />
                            )}
                        </div>
                    )}
                </div>

                {/* Coluna da Direita: Resumo e Corretor */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-4">Corrigido por</h3>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-xl">👨‍🏫</div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{correction?.profiles?.full_name || "IA Facillit"}</p>
                                <p className="text-xs text-gray-500">Especialista em Linguagens</p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                            "{correction?.feedback || "Excelente esforço! Segue o plano de ação para atingires a nota 1000."}"
                        </div>
                    </div>
                    
                    {/* Call to Action para nova redação */}
                    <div className={`${brandGradient} p-6 rounded-2xl text-white text-center shadow-lg`}>
                        <h3 className="font-bold text-lg mb-2">Pronto para praticar?</h3>
                        <p className="text-sm text-white/90 mb-4">A constância leva à perfeição.</p>
                        <button onClick={onBack} className="w-full bg-white text-[#42047e] font-bold py-3 rounded-xl hover:bg-gray-100 transition shadow-md">
                            Escrever Nova Redação
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}