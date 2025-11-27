"use client";

import { useEffect, useState } from 'react';
import { 
    Essay, 
    getEssayDetails, 
    getCorrectionForEssay, 
    EssayCorrection, 
    AIFeedback, 
    generateAndSaveAIAnalysis,
    Annotation 
} from '../actions';
import Image from 'next/image';
import { VerificationBadge } from '@/components/VerificationBadge';
import { useToast } from '@/contexts/ToastContext';

// --- TIPOS ---
type CorrectionWithDetails = EssayCorrection & {
  profiles: { full_name: string | null; verification_badge: string | null };
  ai_feedback: AIFeedback | null;
};

type FullEssayDetails = Essay & {
  correction: CorrectionWithDetails | null;
  profiles: { full_name: string | null } | null;
};

// Descrições das competências
const competencyInfo: Record<string, { title: string, desc: string }> = {
    "1": { title: "Norma Culta", desc: "Domínio da modalidade escrita formal da língua portuguesa." },
    "2": { title: "Tema e Estrutura", desc: "Compreensão da proposta e estrutura do texto dissertativo-argumentativo." },
    "3": { title: "Argumentação", desc: "Seleção, relação, organização e interpretação de informações." },
    "4": { title: "Coesão", desc: "Conhecimento dos mecanismos linguísticos para construção da argumentação." },
    "5": { title: "Proposta", desc: "Elaboração de proposta de intervenção para o problema abordado." }
};

export default function EssayCorrectionView({ essayId, onBack }: { essayId: string, onBack: () => void }) {
    const [data, setData] = useState<FullEssayDetails | null>(null);
    const [correction, setCorrection] = useState<CorrectionWithDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [activeTab, setActiveTab] = useState<'humano' | 'ia' | 'plano'>('humano');
    const { addToast } = useToast();

    // Carregar Dados
    useEffect(() => {
        const load = async () => {
            try {
                const essayRes = await getEssayDetails(essayId);
                if (essayRes.data) {
                    const correctionRes = await getCorrectionForEssay(essayId);
                    const finalCorrection = correctionRes.data ? { ...correctionRes.data } as CorrectionWithDetails : null;

                    // Lógica de Aba Inicial: Prioriza Humano, se não tiver, vai para IA
                    if (!finalCorrection?.feedback && finalCorrection?.ai_feedback) {
                        setActiveTab('ia');
                    }

                    setData({
                        ...(essayRes.data as FullEssayDetails),
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

    // --- AÇÕES ---

    const handleGenerateAI = async () => {
        if (!data?.content) return;
        setIsGeneratingAI(true);
        setActiveTab('ia'); // Muda para aba de IA para mostrar o loading nela

        try {
            const result = await generateAndSaveAIAnalysis(data.id, data.content, data.title || "Sem título");
            
            if (result.success && result.data) {
                // Atualiza estado local
                setCorrection(prev => ({
                    ...prev!,
                    ai_feedback: result.data
                }));
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
                    <span class="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50 text-center pointer-events-none">
                        <strong class="block uppercase text-[10px] mb-1 text-gray-400">${anno.marker}</strong>
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="w-16 h-16 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-brand-purple font-medium animate-pulse">Carregando correção...</p>
        </div>
    );

    if (!data) return <div className="text-center p-10 text-gray-500">Redação não encontrada.</div>;

    const aiData = Array.isArray(correction?.ai_feedback) ? correction?.ai_feedback[0] : correction?.ai_feedback;
    const hasHumanCorrection = !!correction?.feedback;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 font-sans text-slate-800">
            
            {/* --- HEADER --- */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
                            <i className="fas fa-arrow-left"></i>
                        </button>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold text-slate-900 truncate max-w-[200px] md:max-w-md">
                                {data.title || "Redação sem Título"}
                            </h1>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                                    {data.submitted_at ? new Date(data.submitted_at).toLocaleDateString() : 'Rascunho'}
                                </span>
                                {data.profiles?.full_name && <span>• {data.profiles.full_name}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => window.print()} className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">
                            <i className="fas fa-print"></i> PDF
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* --- LEFT: REDAÇÃO (7/12) --- */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[calc(100vh-10rem)] p-8 relative overflow-hidden">
                        
                        {/* Grade Decorativa */}
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <i className="fas fa-file-alt text-8xl text-slate-900"></i>
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">Documento Original</h2>
                            
                            {data.image_submission_url ? (
                                <div className="rounded-xl overflow-hidden border border-gray-200 bg-slate-100 relative group">
                                    <Image src={data.image_submission_url} alt="Redação" width={800} height={1000} className="w-full h-auto" />
                                    {/* Marcadores Imagem */}
                                    {correction?.annotations?.filter(a => a.type === 'image').map(a => (
                                        <div key={a.id} className="absolute w-8 h-8 -ml-4 -mt-4 bg-brand-purple/90 backdrop-blur-sm text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform z-10" 
                                             style={{ left: `${a.position!.x}%`, top: `${a.position!.y}%` }}>
                                            <i className="fas fa-comment-alt text-[10px]"></i>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 text-white text-xs p-3 rounded-xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl text-center">
                                                {a.comment}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div 
                                    className="prose prose-slate max-w-none font-serif text-lg leading-relaxed text-slate-800"
                                    dangerouslySetInnerHTML={{ __html: getHighlightedContent(data.content, correction?.annotations || []) }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: FEEDBACK (5/12) --- */}
                <div className="lg:col-span-5 space-y-6 flex flex-col h-full">
                    
                    {/* SCORE CARD */}
                    {correction?.final_grade !== undefined && (
                        <div className="bg-gradient-to-br from-indigo-600 to-brand-purple text-white rounded-2xl p-6 shadow-lg shadow-brand-purple/20 relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                            
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Nota Geral</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black tracking-tight">{correction.final_grade}</span>
                                        <span className="text-xl text-indigo-200 font-medium">/1000</span>
                                    </div>
                                </div>
                                {correction.badge && (
                                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30 flex items-center gap-2">
                                        <i className="fas fa-medal text-yellow-300"></i>
                                        <span className="font-bold text-sm">{correction.badge}</span>
                                    </div>
                                )}
                            </div>

                            {/* Competências Mini */}
                            <div className="grid grid-cols-5 gap-1 mt-6">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="bg-black/20 rounded-lg p-2 text-center backdrop-blur-sm border border-white/10" title={competencyInfo[String(i)].title}>
                                        <span className="block text-[10px] text-indigo-200 font-bold mb-0.5">C{i}</span>
                                        <span className="block text-sm font-bold">{correction[`grade_c${i}` as keyof EssayCorrection] ?? '-'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TABS CONTAINER */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col flex-1 overflow-hidden min-h-[500px]">
                        
                        {/* TAB HEADERS */}
                        <div className="flex border-b border-gray-100">
                            <button 
                                onClick={() => setActiveTab('humano')} 
                                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'humano' ? 'text-brand-purple' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Professor
                                {activeTab === 'humano' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-purple"></span>}
                            </button>
                            <button 
                                onClick={() => setActiveTab('ia')} 
                                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'ia' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                IA Analysis
                                {activeTab === 'ia' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></span>}
                            </button>
                            <button 
                                onClick={() => setActiveTab('plano')} 
                                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'plano' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Plano
                                {activeTab === 'plano' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>}
                            </button>
                        </div>

                        {/* TAB CONTENT */}
                        <div className="p-6 flex-1 bg-gray-50/30 overflow-y-auto custom-scrollbar">
                            
                            {/* 1. HUMANO */}
                            {activeTab === 'humano' && (
                                <div className="animate-fade-in space-y-6">
                                    {hasHumanCorrection ? (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-brand-purple/10 text-brand-purple flex items-center justify-center font-bold text-lg">
                                                    {correction?.profiles?.full_name?.charAt(0) || <i className="fas fa-user"></i>}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                                                        {correction?.profiles?.full_name || 'Professor'}
                                                        <VerificationBadge badge={correction?.profiles?.verification_badge} size="12px" />
                                                    </p>
                                                    <p className="text-xs text-slate-500">Corretor Especialista</p>
                                                </div>
                                            </div>
                                            
                                            <div className="prose prose-sm prose-slate bg-white p-4 rounded-xl border border-gray-200">
                                                <p className="whitespace-pre-wrap leading-relaxed text-slate-600">{correction?.feedback}</p>
                                            </div>

                                            {correction?.audio_feedback_url && (
                                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-md">
                                                        <i className="fas fa-play text-xs ml-0.5"></i>
                                                    </div>
                                                    <audio src={correction.audio_feedback_url} controls className="w-full h-8" />
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full py-10 text-slate-400">
                                            <i className="fas fa-user-clock text-4xl mb-4 opacity-50"></i>
                                            <p className="text-sm">Aguardando correção do professor.</p>
                                            <p className="text-xs mt-2">Você pode usar a IA enquanto espera.</p>
                                            <button 
                                                onClick={() => handleGenerateAI()}
                                                className="mt-4 text-brand-purple font-bold text-sm hover:underline"
                                            >
                                                Ver Correção IA &rarr;
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 2. IA ANALYSIS */}
                            {activeTab === 'ia' && (
                                <div className="animate-fade-in h-full flex flex-col">
                                    {isGeneratingAI ? (
                                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                                            <div className="relative">
                                                <div className="w-20 h-20 border-4 border-indigo-100 rounded-full"></div>
                                                <div className="absolute top-0 left-0 w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                                <div className="absolute inset-0 flex items-center justify-center text-indigo-600 text-xl">
                                                    <i className="fas fa-robot animate-pulse"></i>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-slate-800 font-bold">Analisando Redação...</p>
                                                <p className="text-slate-500 text-xs mt-1">Verificando competências e gerando sugestões.</p>
                                            </div>
                                        </div>
                                    ) : aiData ? (
                                        <div className="space-y-4">
                                            {aiData.detailed_feedback?.map((item, idx) => (
                                                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow hover:border-indigo-100 group">
                                                    <h4 className="text-xs font-bold text-indigo-600 uppercase mb-2 flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                                        {item.competency}
                                                    </h4>
                                                    <p className="text-sm text-slate-600 leading-relaxed text-justify">{item.feedback}</p>
                                                </div>
                                            ))}
                                            
                                            {/* Disclaimer */}
                                            <p className="text-[10px] text-center text-slate-400 mt-4">
                                                Análise gerada por Inteligência Artificial (Modelo Llama 3). Pode conter imprecisões.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-8">
                                            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-2">
                                                <i className="fas fa-magic text-4xl text-indigo-500"></i>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">Correção Instantânea</h3>
                                                <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">
                                                    Receba feedback detalhado e um plano de estudos personalizado em segundos usando nossa IA.
                                                </p>
                                            </div>
                                            <button 
                                                onClick={handleGenerateAI}
                                                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                                            >
                                                <i className="fas fa-bolt"></i> Gerar Análise com IA
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 3. PLANO DE AÇÃO */}
                            {activeTab === 'plano' && (
                                <div className="animate-fade-in">
                                    {aiData?.actionable_items ? (
                                        <div className="space-y-6">
                                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                                                <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
                                                <div>
                                                    <p className="text-sm font-bold text-blue-800">Seu Plano Personalizado</p>
                                                    <p className="text-xs text-blue-600 mt-1">Baseado nos erros desta redação, foque nestas tarefas:</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {aiData.actionable_items.map((item, idx) => (
                                                    <label key={idx} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:border-blue-300 transition-all select-none">
                                                        <div className="relative flex items-center mt-0.5">
                                                            <input type="checkbox" className="peer w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                            <div className="absolute inset-0 bg-white opacity-0 peer-checked:opacity-100 pointer-events-none"></div>
                                                        </div>
                                                        <span className="text-sm text-slate-700 font-medium peer-checked:text-slate-400 peer-checked:line-through transition-colors">
                                                            {item}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
                                            <i className="fas fa-clipboard-list text-4xl mb-4 opacity-30"></i>
                                            <p>Gere a análise de IA primeiro para<br/>ver seu plano de estudos.</p>
                                            <button 
                                                onClick={() => handleGenerateAI()} 
                                                className="text-indigo-600 font-bold text-sm mt-4 hover:underline"
                                            >
                                                Gerar Agora
                                            </button>
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