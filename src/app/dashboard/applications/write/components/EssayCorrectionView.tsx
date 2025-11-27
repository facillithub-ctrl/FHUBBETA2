"use client";

import { useEffect, useState, useRef } from 'react';
import { Essay, getEssayDetails, getCorrectionForEssay, EssayCorrection, AIFeedback, Annotation } from '../actions';
import Image from 'next/image';
import { VerificationBadge } from '@/components/VerificationBadge';
import { useToast } from '@/contexts/ToastContext';

// --- TIPOS E INTERFACES ---
type CorrectionWithDetails = EssayCorrection & {
  profiles: { full_name: string | null; verification_badge: string | null };
  ai_feedback: AIFeedback | null;
};

type FullEssayDetails = Essay & {
  correction: CorrectionWithDetails | null;
  profiles: { full_name: string | null } | null;
};

// Descrições das competências para exibir na interface
const competencyInfo: Record<string, { title: string, desc: string }> = {
    "1": { title: "Norma Culta", desc: "Domínio da modalidade escrita formal da língua portuguesa." },
    "2": { title: "Tema e Estrutura", desc: "Compreensão da proposta e estrutura do texto dissertativo-argumentativo." },
    "3": { title: "Argumentação", desc: "Seleção, relação, organização e interpretação de informações." },
    "4": { title: "Coesão", desc: "Conhecimento dos mecanismos linguísticos para construção da argumentação." },
    "5": { title: "Proposta", desc: "Elaboração de proposta de intervenção para o problema abordado." }
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

                    // Se houver feedback de IA mas não humano, foca na IA
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
                addToast({ title: "Erro", message: "Não foi possível carregar a correção.", type: "error" });
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [essayId, addToast]);

    // --- FUNÇÕES UTILITÁRIAS ---

    // Processa o texto para adicionar highlights onde houver anotações
    const getHighlightedContent = (content: string | null, annotations: Annotation[] | undefined) => {
        if (!content) return '';
        if (!annotations || annotations.length === 0) return content;

        let highlighted = content;
        // Ordena por tamanho (maior primeiro) para evitar conflitos de replace simples
        const textAnnos = annotations
            .filter(a => a.type === 'text' && a.selection)
            .sort((a, b) => (b.selection?.length || 0) - (a.selection?.length || 0));

        textAnnos.forEach(anno => {
            if (!anno.selection) return;
            
            let colorClass = "border-brand-purple bg-purple-100 text-brand-purple"; // Sugestão
            if (anno.marker === 'erro') colorClass = "border-red-500 bg-red-100 text-red-600";
            if (anno.marker === 'acerto') colorClass = "border-brand-green bg-green-100 text-green-700";

            // Injeta HTML com Tooltip CSS
            const markHtml = `
                <span class="relative group cursor-help border-b-2 ${colorClass} px-0.5 rounded-sm transition-colors">
                    ${anno.selection}
                    <span class="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl z-50 text-center leading-snug pointer-events-none">
                        <strong class="block uppercase text-[10px] mb-1 text-gray-400 tracking-wider">${anno.marker}</strong>
                        ${anno.comment}
                        <svg class="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon class="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                    </span>
                </span>
            `;
            // Nota: replaceAll é mais seguro para múltiplas ocorrências, mas replace funciona para o primeiro match
            // Para produção real, um parser de AST seria ideal, mas este método funciona para visualização simples
            highlighted = highlighted.replace(anno.selection, markHtml);
        });
        return highlighted;
    };

    const handleDownload = () => {
        window.print(); // Abre a interface nativa de impressão (Salvar como PDF)
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        addToast({ title: "Link Copiado", message: "Link da correção copiado para a área de transferência.", type: "success" });
    };

    const handleReport = () => {
        if(confirm("Encontrou um problema nesta correção? Deseja reportar à coordenação?")) {
            addToast({ title: "Reportado", message: "Nossa equipe irá analisar o caso.", type: "success" });
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-brand-purple border-solid"></div></div>;
    if (!data) return <div className="text-center p-10 text-gray-500">Redação não encontrada.</div>;

    const { essay, correction } = { essay: data, correction: data.correction };
    // Normaliza o feedback da IA (array ou objeto)
    const aiData = Array.isArray(correction?.ai_feedback) ? correction.ai_feedback[0] : correction?.ai_feedback;

    return (
        <div className="space-y-8 pb-20 font-inter text-gray-800 bg-gray-50 min-h-screen p-4 md:p-8 animate-fade-in print:bg-white print:p-0">
             
             {/* --- HEADER (Ações e Título) --- */}
             <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden print:hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-purple to-brand-green"></div>
                 <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                     <div className="flex items-center gap-4">
                         <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-brand-purple hover:text-white text-gray-500 transition-all flex items-center justify-center shadow-sm">
                             <i className="fas fa-arrow-left"></i>
                         </button>
                         <div>
                             <h1 className="text-xl md:text-2xl font-bold text-dark-text">{data.title || "Redação sem Título"}</h1>
                             <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <i className="far fa-calendar"></i> {data.submitted_at ? new Date(data.submitted_at).toLocaleDateString() : '-'}
                                <span className="mx-1 text-gray-300">|</span>
                                <i className="far fa-user"></i> {data.profiles?.full_name || 'Aluno'}
                             </div>
                         </div>
                     </div>

                     <div className="flex gap-2">
                        <button onClick={handleDownload} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 shadow-sm">
                            <i className="fas fa-download text-brand-purple"></i> <span className="hidden sm:inline">Baixar PDF</span>
                        </button>
                        <button onClick={handleShare} className="px-4 py-2 bg-brand-purple text-white rounded-lg text-sm font-bold hover:bg-brand-purple-light transition-all shadow-md shadow-brand-purple/20 flex items-center gap-2">
                            <i className="fas fa-share-alt"></i> Compartilhar
                        </button>
                        <button onClick={handleReport} className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all" title="Reportar Erro">
                            <i className="fas fa-flag"></i>
                        </button>
                     </div>
                 </div>
             </div>
             
             <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 print:block">
                
                {/* --- COLUNA ESQUERDA: TEXTO DA REDAÇÃO (7/12) --- */}
                <div className="xl:col-span-7 space-y-6 print:w-full">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[700px] relative">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 print:hidden">
                            <h2 className="font-bold text-lg text-gray-800">Texto da Redação</h2>
                            {/* Legenda */}
                            <div className="flex gap-4 text-xs font-medium">
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Erro</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-green"></span> Acerto</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-purple"></span> Sugestão</span>
                            </div>
                        </div>

                        {data.image_submission_url ? (
                            <div className="relative w-full h-auto rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                <Image src={data.image_submission_url} alt="Redação" width={800} height={1000} className="w-full h-auto" />
                                {/* Marcadores na Imagem */}
                                {correction?.annotations?.filter(a => a.type === 'image').map(a => (
                                    <div key={a.id} className="absolute w-6 h-6 -ml-3 -mt-3 bg-brand-purple text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white cursor-pointer group z-10" style={{ left: `${a.position!.x}%`, top: `${a.position!.y}%` }}>
                                        !
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-gray-900 text-white text-xs p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20 shadow-xl text-center">
                                            {a.comment}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div 
                                className="prose max-w-none font-inter text-gray-800 leading-8 text-lg"
                                dangerouslySetInnerHTML={{ __html: getHighlightedContent(data.content, correction?.annotations || []) }}
                            />
                        )}
                    </div>
                </div>

                {/* --- DIREITA: PAINEL DE FEEDBACK (5/12) --- */}
                <div className="xl:col-span-5 space-y-6 print:w-full print:mt-8">
                    
                    {/* CARD DE NOTA FINAL */}
                    {correction && (
                        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><i className="fas fa-award text-9xl"></i></div>
                            
                            <div className="relative z-10">
                                <p className="text-gray-400 text-xs uppercase font-extrabold tracking-[0.3em] mb-2">Nota Final</p>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-green-dark tracking-tighter">
                                        {correction.final_grade}
                                    </span>
                                    <span className="text-2xl text-gray-400 font-bold">/1000</span>
                                </div>

                                {correction.badge && (
                                    <div className="mt-4 inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-5 py-2 rounded-full text-sm font-bold border border-yellow-200/50">
                                        <i className="fas fa-medal text-lg text-yellow-500"></i> {correction.badge}
                                    </div>
                                )}

                                {/* Mini Dashboard de Competências */}
                                <div className="grid grid-cols-5 gap-2 mt-8 pt-6 border-t border-gray-100">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="group relative flex flex-col items-center cursor-help">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase mb-1">C{i}</span>
                                            <span className="text-lg font-bold text-gray-800">{correction[`grade_c${i}` as keyof EssayCorrection] as number}</span>
                                            
                                            {/* Tooltip Informativo */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-white p-3 rounded-xl shadow-xl border border-gray-100 opacity-0 group-hover:opacity-100 transition-all z-20 pointer-events-none text-left">
                                                <p className="text-xs font-bold text-brand-purple mb-1">{competencyInfo[String(i)].title}</p>
                                                <p className="text-[10px] text-gray-500 leading-relaxed">{competencyInfo[String(i)].desc}</p>
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* NAVEGAÇÃO DE ABAS */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col print:shadow-none print:border-none">
                        <div className="flex border-b border-gray-100 bg-gray-50/50 print:hidden">
                            <button 
                                onClick={() => setActiveTab('humano')} 
                                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-all relative ${activeTab === 'humano' ? 'text-brand-purple bg-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                            >
                                <i className="fas fa-chalkboard-teacher mr-2 text-base"></i> Professor
                                {activeTab === 'humano' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-purple"></div>}
                            </button>
                            
                            {/* Botões de IA habilitados se houver dados */}
                            <button 
                                onClick={() => setActiveTab('ia')} 
                                disabled={!aiData}
                                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-all relative ${activeTab === 'ia' ? 'text-brand-green-dark bg-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} ${!aiData ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <i className="fas fa-robot mr-2 text-base"></i> IA
                                {activeTab === 'ia' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green"></div>}
                            </button>
                            
                            <button 
                                onClick={() => setActiveTab('plano')} 
                                disabled={!aiData}
                                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-all relative ${activeTab === 'plano' ? 'text-blue-600 bg-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} ${!aiData ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <i className="fas fa-tasks mr-2 text-base"></i> Plano
                                {activeTab === 'plano' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
                            </button>
                        </div>

                        <div className="p-6 flex-1">
                            {/* ABA 1: FEEDBACK HUMANO */}
                            <div className={activeTab === 'humano' ? 'block animate-fade-in' : 'hidden print:block'}>
                                {correction ? (
                                    <div className="space-y-6">
                                        {/* Info Corretor */}
                                        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                                {correction.profiles?.full_name?.charAt(0) || 'P'}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Corrigido por</p>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-bold text-dark-text">{correction.profiles?.full_name || 'Professor'}</span>
                                                    <VerificationBadge badge={correction.profiles?.verification_badge} size="10px" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Texto do Feedback */}
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                                <i className="fas fa-comment-dots text-brand-purple"></i> Considerações Gerais
                                            </h4>
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                                {correction.feedback}
                                            </div>
                                        </div>

                                        {/* Áudio */}
                                        {correction.audio_feedback_url && (
                                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center gap-3 print:hidden">
                                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm border border-blue-50 shrink-0">
                                                    <i className="fas fa-play ml-0.5"></i>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-blue-700 mb-1">Feedback de Voz</p>
                                                    <audio src={correction.audio_feedback_url} controls className="w-full h-8 opacity-80 hover:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Link */}
                                        {correction.additional_link && (
                                            <div className="pt-4 border-t border-gray-100">
                                                <a href={correction.additional_link} target="_blank" rel="noopener noreferrer" className="group block bg-gradient-to-r from-purple-50 to-white p-4 rounded-xl border border-purple-100 hover:shadow-md transition-all">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <div className="bg-white p-1.5 rounded-lg text-brand-purple shadow-sm group-hover:scale-110 transition-transform">
                                                            <i className="fas fa-external-link-alt"></i>
                                                        </div>
                                                        <span className="font-bold text-brand-purple text-xs uppercase">Material Recomendado</span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 truncate pl-9 group-hover:underline">{correction.additional_link}</p>
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                        <i className="far fa-clock text-3xl mb-2"></i>
                                        <p>Aguardando correção do professor.</p>
                                    </div>
                                )}
                            </div>

                            {/* ABA 2: ANÁLISE IA */}
                            <div className={activeTab === 'ia' ? 'block animate-fade-in' : 'hidden print:block print:mt-6'}>
                                {aiData ? (
                                    <div className="space-y-4">
                                        <div className="bg-green-50 border border-green-100 p-4 rounded-xl mb-4 print:hidden">
                                            <div className="flex gap-3">
                                                <div className="text-brand-green-dark text-xl"><i className="fas fa-robot"></i></div>
                                                <div>
                                                    <p className="text-sm text-green-800 font-bold">Feedback Instantâneo</p>
                                                    <p className="text-xs text-green-700">Análise detalhada gerada por Inteligência Artificial.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4 pr-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                                            {aiData.detailed_feedback?.map((item, idx) => (
                                                <div key={idx} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:border-brand-green/30 transition-colors group">
                                                    <h5 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-green"></span> {item.competency}
                                                    </h5>
                                                    <p className="text-sm text-gray-600 leading-relaxed text-justify group-hover:text-gray-800 transition-colors">{item.feedback}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                        <i className="fas fa-robot text-4xl mb-3 opacity-20"></i>
                                        <p>Análise de IA não disponível.</p>
                                    </div>
                                )}
                            </div>

                            {/* ABA 3: PLANO DE AÇÃO */}
                            <div className={activeTab === 'plano' ? 'block animate-fade-in' : 'hidden print:block print:mt-6'}>
                                {aiData?.actionable_items ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
                                            <h4 className="font-bold text-lg text-gray-800">O que melhorar?</h4>
                                        </div>
                                        <ul className="space-y-3">
                                            {aiData.actionable_items.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
                                                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-blue-600 text-xs font-bold mt-0.5 shrink-0 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                                                        {idx + 1}
                                                    </div>
                                                    <span className="text-sm text-gray-600 font-medium leading-relaxed group-hover:text-gray-800">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        
                                        {/* Dica Extra */}
                                        <div className="mt-6 p-4 bg-brand-purple/5 rounded-xl border border-brand-purple/10 text-center">
                                            <p className="text-xs text-brand-purple font-medium">
                                                <i className="fas fa-lightbulb mr-1"></i> Dica: Tente aplicar pelo menos 2 destes pontos na sua próxima redação.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                        <i className="fas fa-list-check text-4xl mb-3 opacity-20"></i>
                                        <p>Plano de ação não gerado.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        </div>
    );
}