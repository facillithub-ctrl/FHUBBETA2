// src/app/dashboard/applications/write/components/EssayCorrectionView.tsx
"use client";

import { useEffect, useState } from 'react';
import { getEssayDetails, getCorrectionForEssay, EssayCorrection } from '../actions';
import { useToast } from '@/contexts/ToastContext';
import Image from 'next/image';

export default function EssayCorrectionView({ essayId, onBack }: {essayId: string, onBack: () => void}) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [analyzingFeedback, setAnalyzingFeedback] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        const load = async () => {
            const essayRes = await getEssayDetails(essayId);
            const correctionRes = await getCorrectionForEssay(essayId);
            
            if (essayRes.data) {
                // Garante que a correção seja nula se não vierem dados
                setData({ essay: essayRes.data, correction: correctionRes.data || null });
            }
            setLoading(false);
        };
        load();
    }, [essayId]);

    const handleAnalyzeFeedback = async () => {
        if (!data?.correction?.feedback) return;
        
        setAnalyzingFeedback(true);
        try {
            const response = await fetch('/api/generate-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: `FEEDBACK DO PROFESSOR: ${data.correction.feedback}. NOTA FINAL: ${data.correction.final_grade}. TEXTO ORIGINAL DO ALUNO: ${data.essay.content}`,
                    title: "ANÁLISE DE FEEDBACK",
                    theme: "Explicar correção"
                })
            });
            
            const result = await response.json();
            setAiSummary(result.general_comment || "Não foi possível gerar o resumo.");
            
        } catch (error) {
            addToast({ title: "Erro", message: "Erro ao analisar feedback.", type: 'error' });
        } finally {
            setAnalyzingFeedback(false);
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse">A carregar correção...</div>;
    if (!data) return <div className="p-8 text-center">Erro ao carregar dados.</div>;

    const { essay, correction } = data;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pb-10">
            {/* Header da Nota */}
            <div className="bg-gradient-to-r from-[#42047e] to-[#07f49e] text-white p-8 rounded-b-[2rem] shadow-xl mb-8">
                <button onClick={onBack} className="mb-4 text-white/80 hover:text-white text-sm font-bold flex items-center">
                    <i className="fas fa-arrow-left mr-2"></i> Voltar
                </button>
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{essay.title || "Redação sem título"}</h1>
                        <p className="opacity-90 text-sm">
                            Corrigido por: {correction?.profiles?.full_name || 'A aguardar correção...'}
                        </p>
                    </div>
                    {correction && (
                        <div className="text-center mt-4 md:mt-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                            <span className="block text-xs uppercase font-bold opacity-80">Nota Final</span>
                            <span className="text-5xl font-black">{correction.final_grade}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna Esquerda: O Texto Corrigido */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                            <i className="fas fa-file-alt mr-2 text-[#42047e]"></i> Texto Avaliado
                        </h3>
                        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
                             {essay.image_submission_url ? (
                                <Image src={essay.image_submission_url} alt="Redação" width={800} height={1000} className="w-full rounded-lg" />
                            ) : (
                                <div dangerouslySetInnerHTML={{ __html: essay.content || '<p>Sem conteúdo textual.</p>' }} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Coluna Direita: Feedback e IA */}
                <div className="space-y-6">
                    {correction ? (
                        <>
                            {/* Feedback do Professor */}
                            <div className="bg-white dark:bg-[#121212] p-6 rounded-2xl shadow-sm border-l-4 border-[#42047e]">
                                <h3 className="font-bold text-[#42047e] mb-4">Comentários do Professor</h3>
                                <div 
                                    className="text-sm text-gray-600 dark:text-gray-300 prose dark:prose-invert"
                                    dangerouslySetInnerHTML={{ __html: correction.feedback || "Sem comentários escritos." }}
                                />
                            </div>

                            {/* Detalhe das Notas - COM PROTEÇÃO CONTRA ERRO */}
                            <div className="bg-white dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
                                <h3 className="font-bold mb-4 dark:text-white">Detalhamento</h3>
                                <div className="space-y-3">
                                    {[1,2,3,4,5].map(c => (
                                        <div key={c} className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition">
                                            <span className="text-xs font-bold text-gray-500">Competência {c}</span>
                                            <span className="font-bold text-[#42047e] dark:text-[#07f49e]">
                                                {(correction as any)[`grade_c${c}`] ?? '-'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Botão da IA e Resumo */}
                            <div className="bg-gradient-to-br from-gray-900 to-black text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#07f49e] blur-[60px] opacity-20 rounded-full pointer-events-none"></div>
                                
                                <h3 className="font-bold mb-2 flex items-center gap-2">
                                    <i className="fas fa-robot text-[#07f49e]"></i> Assistente IA
                                </h3>
                                
                                {!aiSummary ? (
                                    <>
                                        <p className="text-sm text-gray-400 mb-4">Não percebeste alguma parte da correção? A IA pode explicar.</p>
                                        <button 
                                            onClick={handleAnalyzeFeedback}
                                            disabled={analyzingFeedback}
                                            className="w-full bg-[#07f49e] text-black font-bold py-3 rounded-xl hover:bg-white transition shadow-lg flex justify-center items-center gap-2"
                                        >
                                            {analyzingFeedback ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-lightbulb"></i>}
                                            {analyzingFeedback ? "A Analisar..." : "Explicar Correção"}
                                        </button>
                                    </>
                                ) : (
                                    <div className="animate-fadeIn">
                                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10 mb-4">
                                            <p className="text-sm italic text-gray-200 leading-relaxed">"{aiSummary}"</p>
                                        </div>
                                        <button 
                                            onClick={() => setAiSummary(null)}
                                            className="text-xs text-gray-400 hover:text-white underline w-full text-center"
                                        >
                                            Fechar explicação
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-100 dark:border-yellow-800 text-center">
                            <i className="fas fa-clock text-yellow-500 text-3xl mb-2"></i>
                            <p className="text-sm font-bold text-yellow-700 dark:text-yellow-400">Em Correção</p>
                            <p className="text-xs text-gray-500 mt-1">A tua redação foi recebida e será corrigida em breve.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}