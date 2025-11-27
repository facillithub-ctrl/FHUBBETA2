"use client";

import { useEffect, useState, ReactNode } from 'react';
import { Essay, EssayCorrection, Annotation, getEssayDetails, getCorrectionForEssay, saveAIFeedback, AIFeedback } from '../actions'; // Importe saveAIFeedback
import Image from 'next/image';
import { VerificationBadge } from '@/components/VerificationBadge';
import FeedbackTabs from './FeedbackTabs';
import { useToast } from '@/contexts/ToastContext'; 

type FullEssayDetails = Essay & {
  correction: EssayCorrection | null;
  profiles: { full_name: string | null, id?: string, avatar_url?: string } | null;
};

// --- COMPONENTE MODAL DE APROVAÇÃO DA IA ---
const AIApprovalModal = ({ feedback, onSave, onCancel, isSaving }: { feedback: AIFeedback, onSave: () => void, onCancel: () => void, isSaving: boolean }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-dark-border">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-[#42047e] to-[#07f49e] p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                        <i className="fas fa-robot text-xl"></i>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Análise de IA Gerada</h3>
                        <p className="text-xs opacity-90">Revise o feedback antes de salvar no seu histórico.</p>
                    </div>
                </div>
                <button onClick={onCancel} className="text-white/80 hover:text-white transition-colors">
                    <i className="fas fa-times text-xl"></i>
                </button>
            </div>

            {/* Content Modal - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50 dark:bg-gray-900/50">
                
                {/* Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h4 className="font-bold text-[#42047e] dark:text-white mb-2 text-sm">Pontos Fortes & Fracos</h4>
                        <ul className="text-xs space-y-2 text-gray-600 dark:text-gray-300">
                            {feedback.detailed_feedback?.slice(0, 2).map((item, i) => (
                                <li key={i}><strong>{item.competency}:</strong> {item.feedback.substring(0, 80)}...</li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h4 className="font-bold text-[#07f49e] mb-2 text-sm">Plano de Ação</h4>
                        <ul className="text-xs space-y-2 text-gray-600 dark:text-gray-300">
                            {feedback.actionable_items?.slice(0, 2).map((item, i) => (
                                <li key={i} className="flex gap-2"><i className="fas fa-check text-green-500"></i> {item}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Detalhes */}
                <div>
                    <h4 className="font-bold text-dark-text dark:text-white mb-3">Detalhamento Completo</h4>
                    <div className="space-y-3">
                        {feedback.detailed_feedback?.map((item, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl border-l-4 border-[#42047e] shadow-sm">
                                <p className="font-bold text-sm text-gray-800 dark:text-white">{item.competency}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.feedback}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Modal Actions */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-dark-card flex justify-end gap-3">
                <button 
                    onClick={onCancel}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    Descartar
                </button>
                <button 
                    onClick={onSave}
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#42047e] to-[#07f49e] hover:shadow-lg hover:scale-105 transition-all disabled:opacity-70 disabled:scale-100 flex items-center gap-2"
                >
                    {isSaving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                    {isSaving ? 'Salvando...' : 'Salvar Análise'}
                </button>
            </div>
        </div>
    </div>
);

const AnnotationDetail = ({ annotation, onClose }: { annotation: Annotation, onClose: () => void }) => (
    <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-xl border-l-4 border-[#42047e] animate-fade-in-up mb-6 relative z-20">
        <div className="flex justify-between items-start mb-2">
            <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                annotation.marker === 'erro' ? 'bg-red-100 text-red-700' : 
                annotation.marker === 'acerto' ? 'bg-green-100 text-green-700' : 
                'bg-blue-100 text-blue-700'
            }`}>
                {annotation.marker}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <i className="fas fa-times"></i>
            </button>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-200 font-medium leading-relaxed">{annotation.comment}</p>
    </div>
);

const competencyDetails = [
  { title: "C1: Norma Culta", description: "Domínio da modalidade escrita formal da língua portuguesa." },
  { title: "C2: Tema e Estrutura", description: "Compreensão da proposta e aplicação de conceitos das várias áreas de conhecimento." },
  { title: "C3: Argumentação", description: "Capacidade de selecionar, relacionar, organizar e interpretar informações." },
  { title: "C4: Coesão", description: "Conhecimento dos mecanismos linguísticos necessários para a construção da argumentação." },
  { title: "C5: Proposta de Intervenção", description: "Elaboração de proposta de intervenção para o problema abordado, respeitando os direitos humanos." },
];

export default function EssayCorrectionView({ essayId, onBack }: {essayId: string, onBack: () => void}) {
    const [details, setDetails] = useState<FullEssayDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);
    
    // Estados para IA e Modal
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [tempAIFeedback, setTempAIFeedback] = useState<AIFeedback | null>(null);
    const [showAIModal, setShowAIModal] = useState(false);
    const [isSavingAI, setIsSavingAI] = useState(false);

    const [viewMode, setViewMode] = useState<'corrected' | 'clean'>('corrected');
    
    let addToast: any = null;
    try {
        const toastContext = useToast();
        addToast = toastContext.addToast;
    } catch (e) {}

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            const essayResult = await getEssayDetails(essayId);
            if (essayResult.data) {
                const correctionResult = await getCorrectionForEssay(essayId);
                setDetails({
                    ...(essayResult.data as FullEssayDetails),
                    correction: correctionResult.data || null,
                });
            }
            setIsLoading(false);
        };
        fetchDetails();
    }, [essayId]);

    // 1. Gera o Feedback (chama API mas NÃO salva no banco ainda)
    const handleGenerateAI = async () => {
        if (!details) return;
        setIsGeneratingAI(true);
        try {
            const response = await fetch('/api/generate-feedback', {
                method: 'POST',
                body: JSON.stringify({ 
                    essayContent: details.content, 
                    essayTitle: details.title,
                    promptDescription: "Gere uma análise completa." 
                })
            });
            
            if (!response.ok) throw new Error('Falha na API');
            
            const aiData = await response.json();
            
            // Armazena temporariamente e abre o modal
            setTempAIFeedback(aiData);
            setShowAIModal(true);
            
        } catch (error) {
            console.error(error);
            if (addToast) addToast({ type: 'error', message: 'Erro ao gerar análise.' });
            else alert('Erro ao gerar análise.');
        } finally {
            setIsGeneratingAI(false);
        }
    };

    // 2. Usuário Confirma no Modal -> Salva no Banco
    const handleConfirmAISave = async () => {
        if (!tempAIFeedback || !details) return;
        setIsSavingAI(true);

        try {
            // Chama a Server Action criada no passo 1
            const result = await saveAIFeedback(essayId, tempAIFeedback);

            if (result.error) throw new Error(result.error);

            // Atualiza a UI Local
            setDetails({
                ...details,
                correction: {
                    ...details.correction!,
                    ai_feedback: tempAIFeedback
                }
            });

            if(addToast) addToast({ type: 'success', message: 'Análise salva com sucesso!' });
            setShowAIModal(false); // Fecha modal
            setTempAIFeedback(null); // Limpa temp

        } catch (error) {
            console.error(error);
            if (addToast) addToast({ type: 'error', message: 'Erro ao salvar análise.' });
        } finally {
            setIsSavingAI(false);
        }
    };

    const handleDownload = () => { window.print(); };

    const handleShare = async () => {
        const shareData = { title: 'Minha Redação', text: `Tirei ${details?.correction?.final_grade}`, url: window.location.href };
        try { if (navigator.share) await navigator.share(shareData); } catch (err) {}
    };

    const handleContest = () => {
        const reason = prompt("Descreva o motivo da contestação:");
        if (reason && addToast) addToast({ type: 'success', message: 'Contestação enviada.' });
    };

    const renderText = () => {
        if (!details?.content) return null;
        if (viewMode === 'clean') return <div className="whitespace-pre-wrap text-lg leading-relaxed text-gray-700 dark:text-gray-300 font-serif">{details.content}</div>;

        const annotations = details.correction?.annotations || [];
        if (annotations.length === 0) return <div className="whitespace-pre-wrap text-lg leading-relaxed text-gray-700 dark:text-gray-300 font-serif">{details.content}</div>;

        return (
            <div className="whitespace-pre-wrap text-lg leading-relaxed text-gray-700 dark:text-gray-300 font-serif select-text">
                {details.content.split('\n').map((paragraph, pIdx) => (
                    <p key={pIdx} className="mb-4">
                        {paragraph.split(' ').map((word, wIdx) => {
                            const cleanWord = word.replace(/[.,;!?]/g, '');
                            const match = annotations.find(a => a.selection && a.selection.includes(cleanWord) && cleanWord.length > 2);
                            
                            if (match) {
                                const isActive = activeAnnotationId === match.id;
                                const colors = {
                                    erro: isActive ? 'bg-red-200 border-red-500' : 'bg-red-100 border-red-300',
                                    acerto: isActive ? 'bg-green-200 border-green-500' : 'bg-green-100 border-green-300',
                                    sugestao: isActive ? 'bg-blue-200 border-blue-500' : 'bg-blue-100 border-blue-300',
                                };
                                const style = colors[match.marker as keyof typeof colors] || colors.sugestao;
                                
                                return (
                                    <span 
                                        key={`${pIdx}-${wIdx}`} 
                                        onClick={(e) => { e.stopPropagation(); setActiveAnnotationId(isActive ? null : match.id); }}
                                        className={`cursor-pointer px-0.5 rounded border-b-2 transition-all mx-0.5 ${style} ${isActive ? 'ring-2 ring-offset-1 ring-[#42047e]' : 'hover:opacity-80'}`}
                                    >
                                        {word}
                                    </span>
                                );
                            }
                            return <span key={`${pIdx}-${wIdx}`}>{word} </span>;
                        })}
                    </p>
                ))}
            </div>
        );
    };

    if (isLoading) return <div className="p-20 text-center flex flex-col items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#42047e] mb-4"></div>Carregando...</div>;
    if (!details) return <div className="p-12 text-center text-red-500">Erro ao carregar dados.</div>;

    const activeAnnotation = details.correction?.annotations?.find(a => a.id === activeAnnotationId);
    const finalGrade = details.correction?.final_grade || 0;
    const gradePercent = (finalGrade / 1000) * 100;
    const gradeColor = finalGrade >= 900 ? 'text-[#07f49e]' : finalGrade >= 700 ? 'text-green-500' : finalGrade >= 500 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="animate-fade-in space-y-6 pb-12" onClick={() => setActiveAnnotationId(null)}>
            
            {/* --- MODAL DE APROVAÇÃO (Renderizado Condicionalmente) --- */}
            {showAIModal && tempAIFeedback && (
                <AIApprovalModal 
                    feedback={tempAIFeedback} 
                    onSave={handleConfirmAISave} 
                    onCancel={() => { setShowAIModal(false); setTempAIFeedback(null); }} 
                    isSaving={isSavingAI} 
                />
            )}

            {/* TOPBAR */}
            <div className="bg-white dark:bg-dark-card p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border flex flex-col md:flex-row justify-between items-center gap-4 sticky top-4 z-30">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-gray-500 hover:text-[#42047e] font-bold flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 transition-colors">
                        <i className="fas fa-arrow-left"></i> Voltar
                    </button>
                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>
                    <h2 className="text-sm font-bold text-gray-700 dark:text-white hidden md:block">{details.title || "Redação"}</h2>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mr-2">
                        <button onClick={() => setViewMode('corrected')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'corrected' ? 'bg-white dark:bg-gray-600 shadow-sm text-[#42047e] dark:text-white' : 'text-gray-500'}`}>Correção</button>
                        <button onClick={() => setViewMode('clean')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'clean' ? 'bg-white dark:bg-gray-600 shadow-sm text-[#42047e] dark:text-white' : 'text-gray-500'}`}>Limpo</button>
                    </div>

                    <button onClick={handleShare} className="p-2.5 text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors"><i className="fas fa-share-alt"></i></button>
                    <button onClick={handleDownload} className="p-2.5 text-gray-500 hover:text-green-600 bg-gray-50 hover:bg-green-50 rounded-xl transition-colors"><i className="fas fa-print"></i></button>
                    <button onClick={handleContest} className="p-2.5 text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-xl transition-colors"><i className="fas fa-flag"></i></button>
                    
                    {/* Botão IA */}
                    {details.correction && !details.correction.ai_feedback && (
                        <button 
                            onClick={handleGenerateAI} 
                            disabled={isGeneratingAI}
                            className="ml-2 bg-gradient-to-r from-[#42047e] to-[#07f49e] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-70"
                        >
                            {isGeneratingAI ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
                            {isGeneratingAI ? 'Gerando...' : 'Análise IA'}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                <div className="xl:col-span-7 space-y-6">
                    <div className="bg-white dark:bg-dark-card p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border min-h-[600px] relative">
                        <div className="mb-8 border-b border-gray-100 dark:border-gray-700 pb-6">
                            <h1 className="font-black text-2xl text-dark-text dark:text-white mb-3 leading-tight">{details.title || "Redação sem Título"}</h1>
                            <div className="flex flex-wrap gap-3">
                                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400 font-medium"><i className="fas fa-calendar-alt mr-1"></i> {details.submitted_at ? new Date(details.submitted_at).toLocaleDateString() : 'N/A'}</span>
                                <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 rounded-full text-xs text-[#42047e] dark:text-purple-300 font-medium"><i className="fas fa-tag mr-1"></i> {details.prompt_id ? "Tema Definido" : "Tema Livre"}</span>
                            </div>
                        </div>
                        {activeAnnotation && <div className="sticky top-24 z-20 mb-4" onClick={e => e.stopPropagation()}><AnnotationDetail annotation={activeAnnotation} onClose={() => setActiveAnnotationId(null)} /></div>}
                        {details.image_submission_url ? <Image src={details.image_submission_url} alt="Redação" width={800} height={1100} className="w-full h-auto rounded-xl"/> : renderText()}
                    </div>
                </div>

                <div className="xl:col-span-5 space-y-6 sticky top-24">
                    <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-dark-border relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100 dark:bg-gray-700"><div className="h-full bg-gradient-to-r from-[#42047e] to-[#07f49e] transition-all duration-1000" style={{ width: `${gradePercent}%` }}></div></div>
                        <div className="flex justify-between items-center mt-2">
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Nota Final</p>
                                <div className="flex items-baseline gap-1"><span className={`text-5xl font-black tracking-tighter ${gradeColor}`}>{finalGrade}</span><span className="text-lg text-gray-400 font-bold">/1000</span></div>
                            </div>
                            {details.correction?.profiles && (
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 mb-1">Corrigido por</p>
                                    <div className="flex items-center justify-end gap-2"><p className="text-sm font-bold text-dark-text dark:text-white">{details.correction.profiles.full_name}</p><VerificationBadge badge={details.correction.profiles.verification_badge} /></div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
                        <div className="p-4 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center"><span className="font-bold text-gray-700 dark:text-gray-200 text-sm">Competências</span></div>
                        <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            {details.correction && competencyDetails.map((comp, i) => {
                                const grade = details.correction![`grade_c${i + 1}` as keyof EssayCorrection] as number;
                                const percentage = (grade / 200) * 100;
                                const barColor = grade === 200 ? 'bg-[#07f49e]' : grade >= 160 ? 'bg-green-500' : grade >= 120 ? 'bg-yellow-400' : 'bg-red-400';
                                return (
                                    <div key={i} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                        <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-gray-500 uppercase">{comp.title.split(':')[0]}</span><span className="font-black text-dark-text dark:text-white text-lg">{grade}</span></div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden"><div className={`${barColor} h-full rounded-full`} style={{ width: `${percentage}%` }}></div></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden p-1 h-[500px] flex flex-col">
                        <FeedbackTabs correction={details.correction} />
                    </div>
                </div>
            </div>
        </div>
    );
}