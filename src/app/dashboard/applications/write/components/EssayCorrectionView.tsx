"use client";

import { useEffect, useState, useRef } from 'react';
import { Essay, getEssayDetails, getCorrectionForEssay, EssayCorrection, AIFeedback, Annotation } from '../actions';
import Image from 'next/image';
import { VerificationBadge } from '@/components/VerificationBadge';
import { useToast } from '@/contexts/ToastContext';

// Tipos
type CorrectionWithDetails = EssayCorrection & {
  profiles: { full_name: string | null; verification_badge: string | null };
  ai_feedback: AIFeedback | null;
};

type FullEssayDetails = Essay & {
  correction: CorrectionWithDetails | null;
  profiles: { full_name: string | null } | null;
};

const competencyInfo: Record<string, string> = {
    "1": "Domínio da Norma Culta",
    "2": "Compreensão do Tema",
    "3": "Organização das Ideias",
    "4": "Coesão e Coerência",
    "5": "Proposta de Intervenção"
};

export default function EssayCorrectionView({ essayId, onBack }: { essayId: string, onBack: () => void }) {
    const [data, setData] = useState<FullEssayDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'humano' | 'ia' | 'plano'>('humano');
    const { addToast } = useToast();

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const essayRes = await getEssayDetails(essayId);
                if (essayRes.data) {
                    const correctionRes = await getCorrectionForEssay(essayId);
                    const finalCorrection = correctionRes.data ? { ...correctionRes.data } as CorrectionWithDetails : null;
                    
                    // Força a aba IA se não houver correção humana ainda, mas houver IA
                    if (!finalCorrection?.feedback && finalCorrection?.ai_feedback) {
                        setActiveTab('ia');
                    }

                    setData({
                        ...(essayRes.data as FullEssayDetails),
                        correction: finalCorrection,
                    });
                }
            } catch (error) {
                console.error(error);
                addToast({ title: "Erro", message: "Erro ao carregar dados.", type: "error" });
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [essayId, addToast]);

    // Função para aplicar highlight no texto HTML
    const getHighlightedContent = (content: string | null, annotations: Annotation[] | undefined) => {
        if (!content) return '';
        if (!annotations || annotations.length === 0) return content;

        let highlighted = content;
        // Filtra apenas anotações de texto
        const textAnnos = annotations.filter(a => a.type === 'text' && a.selection);

        textAnnos.forEach(anno => {
            if (!anno.selection) return;
            // Cria um span com classe de tooltip para cada anotação
            // Usando cores baseadas no tipo de marcação
            let colorClass = "border-b-2 border-brand-purple bg-purple-50 text-brand-purple"; // Padrão Sugestão
            if (anno.marker === 'erro') colorClass = "border-b-2 border-red-500 bg-red-50 text-red-600";
            if (anno.marker === 'acerto') colorClass = "border-b-2 border-brand-green-dark bg-green-50 text-green-700";

            const markHtml = `
                <span class="relative group cursor-help ${colorClass} px-0.5 rounded-sm">
                    ${anno.selection}
                    <span class="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-50 pointer-events-none text-center">
                        ${anno.comment}
                        <svg class="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon class="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                    </span>
                </span>
            `;
            // Substituição simples (pode falhar com HTML complexo, mas funciona para textos de redação)
            highlighted = highlighted.replace(anno.selection, markHtml);
        });
        return highlighted;
    };

    const handleDownload = () => {
        window.print(); // Solução nativa e robusta para PDF
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-brand-green border-solid"></div></div>;
    if (!data) return <div className="text-center p-10 text-gray-500">Redação não encontrada.</div>;

    const { essay, correction } = { essay: data, correction: data.correction };
    const aiFeedback = correction?.ai_feedback;

    // Normaliza o feedback da IA (pode vir como array ou objeto)
    const aiData = Array.isArray(aiFeedback) ? aiFeedback[0] : aiFeedback;

    return (
        <div className="space-y-8 pb-20 font-inter text-gray-800 bg-surface-gray min-h-screen p-6">
             
             {/* --- HEADER COM GRADIENTE DA MARCA --- */}
             <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                 <div className="absolute top-0 left-0 w-full h-2 bg-brand-gradient"></div>
                 <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                     <div className="flex items-center gap-4">
                         <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-50 hover:bg-brand-purple/10 text-gray-500 hover:text-brand-purple transition-all flex items-center justify-center">
                             <i className="fas fa-arrow-left"></i>
                         </button>
                         <div>
                             <h1 className="text-2xl font-bold text-dark-text">{data.title || "Sem Título"}</h1>
                             <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <i className="far fa-calendar"></i> {data.submitted_at ? new Date(data.submitted_at).toLocaleDateString() : '-'}
                                <span className="mx-1">•</span>
                                <i className="far fa-user"></i> {data.profiles?.full_name || 'Aluno'}
                             </div>
                         </div>
                     </div>

                     <div className="flex gap-2">
                        <button onClick={handleDownload} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                            <i className="fas fa-download"></i> PDF
                        </button>
                        <button className="px-4 py-2 bg-brand-purple text-white rounded-lg text-sm font-medium hover:bg-brand-purple-light transition-colors shadow-md shadow-brand-purple/20 flex items-center gap-2">
                            <i className="fas fa-share-alt"></i> Compartilhar
                        </button>
                     </div>
                 </div>
             </div>

             <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* --- ESQUERDA: A REDAÇÃO (7 colunas) --- */}
                <div className="xl:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[600px]">
                    <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                        <h2 className="font-bold text-lg text-dark-text">Texto da Redação</h2>
                        {/* Legenda dos Comentários */}
                        <div className="flex gap-3 text-xs">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Erro</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-green"></span> Acerto</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-purple"></span> Sugestão</span>
                        </div>
                    </div>

                    {data.image_submission_url ? (
                         <div className="relative rounded-xl overflow-hidden border border-gray-200">
                            <Image src={data.image_submission_url} alt="Redação" width={800} height={1000} className="w-full h-auto" />
                            {/* Marcadores de imagem */}
                            {correction?.annotations?.filter(a => a.type === 'image').map(a => (
                                <div key={a.id} className="absolute w-6 h-6 -ml-3 -mt-3 bg-brand-purple text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white cursor-pointer group z-10" style={{ left: `${a.position!.x}%`, top: `${a.position!.y}%` }}>
                                    !
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20">
                                        {a.comment}
                                    </div>
                                </div>
                            ))}
                         </div>
                    ) : (
                        <div 
                            className="prose max-w-none font-inter text-gray-700 leading-8 text-lg"
                            dangerouslySetInnerHTML={{ __html: getHighlightedContent(data.content, correction?.annotations || []) }}
                        />
                    )}
                </div>

                {/* --- DIREITA: FEEDBACK E NOTAS (5 colunas) --- */}
                <div className="xl:col-span-5 space-y-6">
                    
                    {/* CARD DA NOTA */}
                    {correction && (
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 relative overflow-hidden">
                            <div className="flex justify-between items-center relative z-10">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Nota Final</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-6xl font-black text-brand-purple">{correction.final_grade}</span>
                                        <span className="text-xl text-gray-400 font-medium">/1000</span>
                                    </div>
                                </div>
                                {correction.badge && (
                                    <div className="flex flex-col items-center bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-100">
                                        <span className="text-3xl">🏆</span>
                                        <span className="text-xs font-bold text-yellow-700 mt-1">{correction.badge}</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Detalhamento das Competências */}
                            <div className="grid grid-cols-5 gap-2 mt-6">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="flex flex-col items-center group relative cursor-help">
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full mb-2 overflow-hidden">
                                            <div 
                                                className="h-full bg-brand-green rounded-full" 
                                                style={{ width: `${((correction[`grade_c${i}` as keyof EssayCorrection] as number) / 200) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-500">C{i}</span>
                                        <span className="text-sm font-bold text-dark-text">{correction[`grade_c${i}` as keyof EssayCorrection] as number}</span>
                                        
                                        {/* Tooltip Competência */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-gray-900 text-white text-[10px] p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                                            <p className="font-bold mb-1">Competência {i}</p>
                                            {competencyInfo[String(i)]}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PAINEL DE ABAS */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                        <div className="flex border-b border-gray-100">
                            <button onClick={() => setActiveTab('humano')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'humano' ? 'text-brand-purple border-b-2 border-brand-purple bg-purple-50/50' : 'text-gray-400 hover:text-gray-600'}`}>
                                Professor
                            </button>
                            <button onClick={() => setActiveTab('ia')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'ia' ? 'text-brand-green-dark border-b-2 border-brand-green bg-green-50/50' : 'text-gray-400 hover:text-gray-600'}`}>
                                Análise IA
                            </button>
                            <button onClick={() => setActiveTab('plano')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'plano' ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50/50' : 'text-gray-400 hover:text-gray-600'}`}>
                                Plano de Ação
                            </button>
                        </div>

                        <div className="p-6">
                            {/* ABA 1: PROFESSOR */}
                            {activeTab === 'humano' && correction && (
                                <div className="animate-fade-in space-y-5">
                                    {correction.audio_feedback_url && (
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-brand-purple"><i className="fas fa-play"></i></div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-gray-500 mb-1">Comentário de Voz</p>
                                                <audio src={correction.audio_feedback_url} controls className="w-full h-8" />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="text-sm font-bold text-dark-text mb-2 flex items-center gap-2">
                                            <i className="fas fa-comment-alt text-brand-purple"></i> Comentário Geral
                                        </h4>
                                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{correction.feedback}</p>
                                    </div>

                                    {correction.additional_link && (
                                        <a href={correction.additional_link} target="_blank" className="block bg-brand-purple/5 border border-brand-purple/10 p-4 rounded-xl hover:bg-brand-purple/10 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <i className="fas fa-link text-brand-purple text-lg"></i>
                                                <div>
                                                    <p className="text-xs font-bold text-brand-purple uppercase">Material Recomendado</p>
                                                    <p className="text-sm text-gray-700 group-hover:underline truncate">{correction.additional_link}</p>
                                                </div>
                                            </div>
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* ABA 2: IA (Garantida!) */}
                            {activeTab === 'ia' && (
                                <div className="animate-fade-in space-y-4">
                                    {aiData ? (
                                        <>
                                            <div className="bg-green-50 border border-green-100 p-4 rounded-xl mb-4">
                                                <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                                                    <i className="fas fa-robot"></i> Análise automática realizada.
                                                </p>
                                            </div>
                                            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                                {aiData.detailed_feedback?.map((item, idx) => (
                                                    <div key={idx} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow bg-white">
                                                        <h5 className="text-xs font-bold text-brand-purple uppercase mb-2 tracking-wide">{item.competency}</h5>
                                                        <p className="text-sm text-gray-600 leading-relaxed text-justify">{item.feedback}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-10 text-gray-400">
                                            <i className="fas fa-robot text-4xl mb-3 opacity-20"></i>
                                            <p>Ainda não há análise de IA disponível para esta redação.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ABA 3: PLANO DE AÇÃO */}
                            {activeTab === 'plano' && (
                                <div className="animate-fade-in space-y-4">
                                    {aiData?.actionable_items ? (
                                        <>
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="h-8 w-1 bg-brand-green rounded-full"></div>
                                                <h4 className="font-bold text-gray-800">Passos para Evoluir</h4>
                                            </div>
                                            <ul className="space-y-3">
                                                {aiData.actionable_items.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                        <div className="w-6 h-6 rounded-full bg-brand-green text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm">
                                                            {idx + 1}
                                                        </div>
                                                        <span className="text-sm text-gray-700 font-medium">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    ) : (
                                        <div className="text-center py-10 text-gray-400">
                                            <p>Plano de ação indisponível no momento.</p>
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