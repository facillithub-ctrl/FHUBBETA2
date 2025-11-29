"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
    getEssayDetails, 
    getCorrectionForEssay, 
    EssayCorrection, 
    AIFeedback, 
    generateAndSaveAIAnalysis,
    Annotation,
    Essay
} from '../actions';
import Image from 'next/image';
import { VerificationBadge } from '@/components/VerificationBadge';
import { useToast } from '@/contexts/ToastContext';

// --- TIPOS ---
type CorrectionWithDetails = EssayCorrection & {
  profiles: { full_name: string | null; verification_badge: string | null } | null;
  ai_feedback: AIFeedback | null;
  annotations?: Annotation[];
};

type FullEssayDetails = Essay & {
  correction: CorrectionWithDetails | null;
  profiles: { full_name: string | null } | null;
};

// Tipo auxiliar para chaves de nota
type GradeKey = 'grade_c1' | 'grade_c2' | 'grade_c3' | 'grade_c4' | 'grade_c5';

export default function EssayCorrectionView({ essayId, onBack }: { essayId: string, onBack: () => void }) {
    const [data, setData] = useState<FullEssayDetails | null>(null);
    const [correction, setCorrection] = useState<CorrectionWithDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [activeTab, setActiveTab] = useState<'humano' | 'ia' | 'plano'>('humano');
    const { addToast } = useToast();

    // Carregar Dados da Redação e Correção
    useEffect(() => {
        const load = async () => {
            try {
                const essayRes = await getEssayDetails(essayId);
                if (essayRes.data) {
                    const correctionRes = await getCorrectionForEssay(essayId);
                    const finalCorrection = correctionRes.data ? { ...correctionRes.data } as unknown as CorrectionWithDetails : null;

                    // Lógica de Aba Inicial
                    if (!finalCorrection?.feedback && finalCorrection?.ai_feedback) {
                        setActiveTab('ia');
                    }

                    setData({
                        ...(essayRes.data as unknown as FullEssayDetails),
                        correction: finalCorrection,
                    });
                    setCorrection(finalCorrection);
                }
            } catch (error) {
                console.error(error);
                addToast({ title: "Erro", message: "Não foi possível carregar os dados.", type: "error" });
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [essayId, addToast]);

    // Função para acionar a IA
    const handleGenerateAI = async () => {
        if (!data?.content) return;
        setIsGeneratingAI(true);
        setActiveTab('ia'); 

        try {
            const result = await generateAndSaveAIAnalysis(data.id, data.content, data.title || "Sem título");
            
            if (result.success && result.data) {
                setCorrection(prev => {
                    if (!prev) {
                        return { ai_feedback: result.data } as CorrectionWithDetails;
                    }
                    return { ...prev, ai_feedback: result.data };
                });
                addToast({ title: "Sucesso!", message: "Análise de IA gerada com sucesso.", type: "success" });
            } else {
                addToast({ title: "Erro", message: result.error || "Falha ao gerar análise.", type: "error" });
            }
        } catch (e) {
            addToast({ title: "Erro", message: "Erro de conexão.", type: "error" });
        } finally {
            setIsGeneratingAI(false);
        }
    };

    // Processa o texto para adicionar highlights
    const getHighlightedContent = (content: string | null, annotations: Annotation[] | undefined) => {
        if (!content) return '';
        if (!annotations || annotations.length === 0) return content;

        let highlighted = content;
        const textAnnos = annotations
            .filter(a => a.type === 'text' && a.selection)
            .sort((a, b) => (b.selection?.length || 0) - (a.selection?.length || 0));

        textAnnos.forEach(anno => {
            if (!anno.selection) return;
            let colorClass = "border-brand-purple bg-purple-50 text-brand-purple";
            if (anno.marker === 'erro') colorClass = "border-red-500 bg-red-50 text-red-600";
            if (anno.marker === 'acerto') colorClass = "border-green-500 bg-green-50 text-green-700";

            const markHtml = `
                <span class="relative group cursor-help border-b-2 ${colorClass} px-1 rounded-sm transition-colors">
                    ${anno.selection}
                    <span class="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50 text-center pointer-events-none font-sans leading-snug">
                        <strong class="block uppercase text-[10px] mb-1 text-gray-400 tracking-wider">${anno.marker}</strong>
                        ${anno.comment}
                        <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </span>
                </span>
            `;
            highlighted = highlighted.replace(anno.selection, markHtml);
        });
        return highlighted;
    };

    if (isLoading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
            <div className="w-16 h-16 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-brand-purple font-medium animate-pulse">Carregando...</p>
        </div>
    );

    if (!data) return <div className="text-center p-10 text-gray-500">Redação não encontrada.</div>;

    const rawAiData = correction?.ai_feedback;
    const aiData = (Array.isArray(rawAiData) ? rawAiData[0] : rawAiData) as AIFeedback | null | undefined;
    const hasHumanCorrection = !!correction?.feedback;

    return (
        <div className="bg-gray-50 min-h-screen pb-12 font-sans text-slate-800">
            
            {/* --- HEADER FLUTUANTE --- */}
            <div className="sticky top-4 z-40 px-4 md:px-0 mb-8 pointer-events-none">
                <div className="pointer-events-auto max-w-7xl mx-auto bg-white/90 backdrop-blur-xl border border-gray-200/60 shadow-lg rounded-2xl flex items-center justify-between p-4 md:px-6 md:py-4 transition-all">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-brand-purple hover:text-white text-gray-500 transition-all flex items-center justify-center shadow-sm">
                            <i className="fas fa-arrow-left"></i>
                        </button>
                        <div>
                            <h1 className="text-base md:text-lg font-bold text-slate-900 truncate max-w-[200px] md:max-w-md leading-tight">
                                {data.title || "Redação sem Título"}
                            </h1>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
                                    <i className="far fa-calendar"></i>
                                    {data.submitted_at ? new Date(data.submitted_at).toLocaleDateString() : 'Rascunho'}
                                </span>
                                {data.profiles?.full_name && (
                                    <span className="flex items-center gap-1 font-medium text-slate-700">
                                        <i className="far fa-user"></i> {data.profiles.full_name}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {correction?.final_grade !== undefined && (
                            <div className="hidden md:flex flex-col items-end mr-2 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Nota</span>
                                <span className={`text-lg font-black leading-none ${correction.final_grade >= 900 ? 'text-green-600' : 'text-brand-purple'}`}>
                                    {correction.final_grade}
                                </span>
                            </div>
                        )}
                        <button onClick={() => window.print()} className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-white hover:text-brand-purple hover:shadow-md transition-all" title="Baixar PDF">
                            <i className="fas fa-print"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
                
                {/* --- LEFT: REDAÇÃO --- */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden relative">
                        <div className="bg-white border-b border-gray-100 px-8 py-5 flex justify-between items-center">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <i className="fas fa-file-lines"></i> Documento Original
                            </h2>
                            {data.prompt_id && <span className="text-[10px] bg-brand-purple/5 text-brand-purple px-2 py-1 rounded border border-brand-purple/10 font-bold">TEMA OFICIAL</span>}
                        </div>

                        <div className="p-8 md:p-10 min-h-[500px]">
                            {data.image_submission_url ? (
                                <div className="rounded-xl overflow-hidden border border-gray-200 bg-slate-100 relative group shadow-inner">
                                    <Image src={data.image_submission_url} alt="Redação" width={800} height={1000} className="w-full h-auto" />
                                    {correction?.annotations?.filter(a => a.type === 'image').map(a => (
                                        <div key={a.id} className="absolute w-6 h-6 -ml-3 -mt-3 bg-brand-purple text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform z-10 group/marker" 
                                             style={{ left: `${a.position!.x}%`, top: `${a.position!.y}%` }}>
                                            <i className="fas fa-comment-alt text-[8px]"></i>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 text-white text-xs p-3 rounded-lg opacity-0 group-hover/marker:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl text-center leading-relaxed">
                                                {a.comment}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div 
                                    className="prose prose-slate max-w-none font-serif text-lg leading-loose text-slate-800"
                                    dangerouslySetInnerHTML={{ __html: getHighlightedContent(data.content, correction?.annotations || []) }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: FEEDBACK --- */}
                <div className="lg:col-span-5 space-y-6 flex flex-col">
                    
                    {/* SCORE CARD */}
                    {correction?.final_grade !== undefined && (
                        <div className="bg-white rounded-3xl p-6 shadow-lg shadow-purple-900/5 border border-purple-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-purple/10 to-indigo-100/50 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Resultado Final</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-indigo-600 tracking-tighter">
                                            {correction.final_grade}
                                        </span>
                                        <span className="text-xl text-gray-400 font-bold">/1000</span>
                                    </div>
                                </div>
                                {correction.badge && (
                                    <div className="bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg border border-yellow-200/60 flex items-center gap-2 text-xs font-bold">
                                        <i className="fas fa-medal text-yellow-500"></i> {correction.badge}
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-5 gap-2 mt-6 pt-6 border-t border-gray-100">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="flex flex-col items-center">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase mb-1">C{i}</span>
                                        <span className="text-sm font-bold text-slate-800 bg-gray-50 px-2 py-1 rounded-md min-w-[30px] text-center">
                                            {correction[`grade_c${i}` as GradeKey] ?? '-'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* GPS - RECOMENDAÇÃO DO PROFESSOR (NOVO BLOCO) */}
                    {(correction?.recommended_test_id || correction?.additional_link) && (
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-3xl p-5 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-right">
                            <div className="flex items-center gap-3 mb-3 relative z-10">
                                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                    <i className="fas fa-bullseye"></i>
                                </div>
                                <h3 className="font-bold text-red-900 text-sm">Recomendação do Professor</h3>
                            </div>
                            
                            <div className="space-y-2 relative z-10">
                                {correction.recommended_test_id && (
                                    <Link 
                                        href={`/dashboard/applications/test?testId=${correction.recommended_test_id}&action=start`} 
                                        className="flex items-center justify-between p-3 bg-white rounded-xl border border-red-100 hover:shadow-md transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <i className="fas fa-clipboard-check text-red-500"></i>
                                            <span className="text-xs font-bold text-slate-700 group-hover:text-red-600">Fazer Simulado de Reforço</span>
                                        </div>
                                        <i className="fas fa-chevron-right text-xs text-gray-400"></i>
                                    </Link>
                                )}
                                {correction.additional_link && (
                                    <Link 
                                        href={correction.additional_link} 
                                        target="_blank"
                                        className="flex items-center justify-between p-3 bg-white rounded-xl border border-red-100 hover:shadow-md transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <i className="fas fa-link text-blue-500"></i>
                                            <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600">Acessar Material Extra</span>
                                        </div>
                                        <i className="fas fa-external-link-alt text-xs text-gray-400"></i>
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TABS CONTAINER */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 flex flex-col overflow-hidden min-h-[500px]">
                        
                        <div className="px-6 pt-6 pb-2">
                            <div className="bg-gray-100/80 p-1 rounded-xl flex gap-1">
                                <button onClick={() => setActiveTab('humano')} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${activeTab === 'humano' ? 'bg-white text-brand-purple shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Professor</button>
                                <button onClick={() => setActiveTab('ia')} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${activeTab === 'ia' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>IA Analysis</button>
                                <button onClick={() => setActiveTab('plano')} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${activeTab === 'plano' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Plano</button>
                            </div>
                        </div>

                        <div className="p-6 flex-1 bg-white overflow-y-auto custom-scrollbar">
                            {/* 1. HUMANO */}
                            {activeTab === 'humano' && (
                                <div className="animate-fade-in space-y-6">
                                    {hasHumanCorrection ? (
                                        <>
                                            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                                                <div className="w-10 h-10 rounded-full bg-brand-purple/10 text-brand-purple flex items-center justify-center font-bold">
                                                    {correction?.profiles?.full_name?.charAt(0) || 'P'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                        {correction?.profiles?.full_name || 'Professor'}
                                                        <VerificationBadge badge={correction?.profiles?.verification_badge} size="12px" />
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-0.5">Corretor Especialista</p>
                                                </div>
                                            </div>
                                            <div className="prose prose-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                <p className="whitespace-pre-wrap">{correction?.feedback}</p>
                                            </div>
                                            {correction?.audio_feedback_url && (
                                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white shrink-0">
                                                        <i className="fas fa-play text-xs ml-0.5"></i>
                                                    </div>
                                                    <audio src={correction.audio_feedback_url} controls className="w-full h-8" />
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-64 text-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                <i className="fas fa-user-clock text-2xl text-slate-400"></i>
                                            </div>
                                            <p className="text-slate-900 font-medium">Aguardando correção</p>
                                            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Seu texto está na fila. Use a IA para uma prévia instantânea.</p>
                                            <button onClick={handleGenerateAI} className="mt-4 text-xs font-bold text-brand-purple bg-purple-50 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors">
                                                Gerar com IA
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 2. IA ANALYSIS */}
                            {activeTab === 'ia' && (
                                <div className="space-y-4 animate-fade-in h-full flex flex-col">
                                    {isGeneratingAI ? (
                                        <div className="flex flex-col items-center justify-center h-full gap-4 py-10">
                                            <div className="relative">
                                                <div className="w-20 h-20 border-4 border-indigo-100 rounded-full"></div>
                                                <div className="absolute top-0 left-0 w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                            <p className="text-sm font-medium text-indigo-900 animate-pulse">Analisando redação...</p>
                                        </div>
                                    ) : aiData ? (
                                        <>
                                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-start gap-3">
                                                <i className="fas fa-bolt text-indigo-500 mt-1"></i>
                                                <div>
                                                    <p className="text-sm font-bold text-indigo-900">Análise Instantânea</p>
                                                    <p className="text-xs text-indigo-700">Baseada nos critérios do ENEM.</p>
                                                </div>
                                            </div>
                                            {aiData.detailed_feedback?.map((item: { competency: string; feedback: string }, idx: number) => (
                                                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm group hover:border-indigo-200 transition-colors">
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-500 transition-colors"></span>
                                                        {item.competency}
                                                    </h4>
                                                    <p className="text-sm text-slate-600 leading-relaxed text-justify">{item.feedback}</p>
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                                            <button onClick={handleGenerateAI} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                                <i className="fas fa-bolt text-yellow-400"></i> Gerar Análise
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 3. PLANO */}
                            {activeTab === 'plano' && (
                                <div className="space-y-4 animate-fade-in">
                                    {aiData?.actionable_items ? (
                                        <>
                                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                                                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                                                    <i className="fas fa-list-check"></i>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-blue-900">Plano de Ação</p>
                                                    <p className="text-xs text-blue-700">Tarefas sugeridas.</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {aiData.actionable_items.map((item: string, idx: number) => (
                                                    <div key={idx} className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 transition-colors">
                                                        <span className="text-sm text-slate-700 font-medium">{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-12 text-slate-400">
                                            <p className="text-sm">Gere a análise de IA primeiro.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}