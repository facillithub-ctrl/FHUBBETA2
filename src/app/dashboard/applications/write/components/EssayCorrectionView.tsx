"use client";

import { useEffect, useState } from 'react';
import { Essay, EssayCorrection, Annotation, getEssayDetails, getCorrectionForEssay, saveAIFeedback, AIFeedback } from '../actions';
import Image from 'next/image';
import { VerificationBadge } from '@/components/VerificationBadge';
import FeedbackTabs from './FeedbackTabs';
import { useToast } from '@/contexts/ToastContext'; 

type FullEssayDetails = Essay & {
  correction: EssayCorrection | null;
  profiles: { full_name: string | null, id?: string, avatar_url?: string } | null;
};

// --- MODAL: APROVAÇÃO DE IA ---
const AIApprovalModal = ({ feedback, onSave, onCancel, isSaving }: { feedback: AIFeedback, onSave: () => void, onCancel: () => void, isSaving: boolean }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-dark-border overflow-hidden transform transition-all">
            <div className="bg-gradient-to-r from-[#42047e] to-[#07f49e] p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                        <i className="fas fa-robot text-xl"></i>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Análise Inteligente</h3>
                        <p className="text-xs opacity-90">Revise o feedback gerado pela IA.</p>
                    </div>
                </div>
                <button onClick={onCancel} className="text-white/80 hover:text-white transition-colors"><i className="fas fa-times text-xl"></i></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50 dark:bg-gray-900/50">
                {feedback.detailed_feedback?.map((item, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl border-l-4 border-[#42047e] shadow-sm">
                        <h5 className="font-bold text-[#42047e] dark:text-[#07f49e] text-sm mb-1">{item.competency}</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{item.feedback}</p>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card flex justify-end gap-3">
                <button onClick={onCancel} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Descartar</button>
                <button onClick={onSave} disabled={isSaving} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#42047e] to-[#07f49e] hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-70">
                    {isSaving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                    {isSaving ? 'Salvando...' : 'Salvar Análise'}
                </button>
            </div>
        </div>
    </div>
);

// --- MODAL: CONTESTAÇÃO ---
const ContestModal = ({ onClose, onSubmit }: { onClose: () => void, onSubmit: (reason: string) => void }) => {
    const [reason, setReason] = useState('');
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-dark-border overflow-hidden transform transition-all">
                <div className="bg-red-50 dark:bg-red-900/20 p-6 border-b border-red-100 dark:border-red-900/30 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
                        <i className="fas fa-gavel text-lg"></i>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Contestar Correção</h3>
                        <p className="text-xs text-red-600 dark:text-red-400">Envie para revisão pedagógica.</p>
                    </div>
                </div>
                
                <div className="p-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Motivo</label>
                    <textarea 
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl mb-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm resize-none"
                        rows={4}
                        placeholder="Ex: A nota da competência 3 não reflete meus argumentos..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancelar</button>
                    <button 
                        onClick={() => onSubmit(reason)} 
                        disabled={!reason.trim()}
                        className="px-6 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Enviar Contestação
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- ANOTAÇÃO FLUTUANTE ---
const AnnotationDetail = ({ annotation, onClose }: { annotation: Annotation, onClose: () => void }) => (
    <div className="absolute z-50 bg-white dark:bg-dark-card p-4 rounded-xl shadow-2xl border-l-4 border-[#42047e] animate-in fade-in slide-in-from-bottom-2 w-full max-w-sm mt-2 left-0">
        <div className="flex justify-between items-start mb-2">
            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded tracking-wider ${
                annotation.marker === 'erro' ? 'bg-red-100 text-red-700' : 
                annotation.marker === 'acerto' ? 'bg-green-100 text-green-700' : 
                'bg-blue-100 text-blue-700'
            }`}>
                {annotation.marker}
            </span>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <i className="fas fa-times"></i>
            </button>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{annotation.comment}</p>
    </div>
);

const competencyDetails = [
  { title: "C1: Norma Culta", description: "Domínio da escrita formal." },
  { title: "C2: Tema e Estrutura", description: "Compreensão da proposta." },
  { title: "C3: Argumentação", description: "Organização de informações." },
  { title: "C4: Coesão", description: "Mecanismos linguísticos." },
  { title: "C5: Proposta", description: "Solução para o problema." },
];

export default function EssayCorrectionView({ essayId, onBack }: {essayId: string, onBack: () => void}) {
    const [details, setDetails] = useState<FullEssayDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);
    
    // Estados
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [tempAIFeedback, setTempAIFeedback] = useState<AIFeedback | null>(null);
    const [showAIModal, setShowAIModal] = useState(false);
    const [showContestModal, setShowContestModal] = useState(false);
    const [isSavingAI, setIsSavingAI] = useState(false);
    const [viewMode, setViewMode] = useState<'corrected' | 'clean'>('corrected');
    
    let addToast: any = null;
    try { const toastContext = useToast(); addToast = toastContext.addToast; } catch (e) {}

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

    const handleGenerateAI = async () => {
        if (!details) return;
        setIsGeneratingAI(true);
        try {
            const cleanText = details.content ? details.content.replace(/<[^>]+>/g, '\n') : "";
            const response = await fetch('/api/generate-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ essayContent: cleanText, essayTitle: details.title })
            });
            
            const aiData = await response.json();
            if (!response.ok) throw new Error(aiData.error || 'Falha na API');
            
            setTempAIFeedback(aiData);
            setShowAIModal(true);
        } catch (error: any) {
            const msg = error.message || "Erro desconhecido";
            if(addToast) addToast({ type: 'error', message: msg });
            else alert(msg);
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleConfirmAISave = async () => {
        if (!tempAIFeedback || !details) return;
        setIsSavingAI(true);
        try {
            const result = await saveAIFeedback(essayId, tempAIFeedback);
            if (result.error) throw new Error(result.error);
            setDetails({ ...details, correction: { ...details.correction!, ai_feedback: tempAIFeedback } });
            if(addToast) addToast({ type: 'success', message: 'Análise salva!' });
            setShowAIModal(false);
            setTempAIFeedback(null);
        } catch (error: any) {
            if(addToast) addToast({ type: 'error', message: 'Erro ao salvar.' });
        } finally {
            setIsSavingAI(false);
        }
    };

    const handleDownload = () => window.print();
    const handleShare = async () => {
        try { await navigator.share({ title: 'Minha Redação', text: `Nota: ${details?.correction?.final_grade}`, url: window.location.href }); } 
        catch (e) { if(addToast) addToast({ type: 'info', message: 'Link copiado.' }); }
    };

    const handleContestSubmit = (reason: string) => {
        console.log("Contestação:", reason);
        if(addToast) addToast({ type: 'success', message: 'Contestação enviada!' });
        setShowContestModal(false);
    };

    const renderText = () => {
        if (!details?.content) return null;
        
        if (viewMode === 'clean') {
             return <div className="whitespace-pre-wrap text-lg leading-relaxed font-serif text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: details.content }} />;
        }

        const annotations = details.correction?.annotations || [];
        const clean = details.content.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
        
        if (annotations.length === 0) {
            return <div className="whitespace-pre-wrap text-lg leading-relaxed font-serif text-gray-800 dark:text-gray-200">{clean}</div>;
        }

        const paragraphs = clean.split('\n');

        return (
            <div className="space-y-4 text-lg leading-relaxed font-serif text-gray-800 dark:text-gray-200 select-text">
                {paragraphs.map((paragraph, pIdx) => {
                    if (!paragraph.trim()) return null;

                    const pAnnotations = annotations.filter(a => a.selection && paragraph.includes(a.selection));
                    if (pAnnotations.length === 0) return <p key={pIdx}>{paragraph}</p>;

                    let parts: ReactNode[] = [paragraph];
                    pAnnotations.forEach(anno => {
                        const nextParts: ReactNode[] = [];
                        parts.forEach(part => {
                            if (typeof part === 'string') {
                                const split = part.split(anno.selection!);
                                split.forEach((s, i) => {
                                    nextParts.push(s);
                                    if (i < split.length - 1) {
                                        const isActive = activeAnnotationId === anno.id;
                                        const colorClass = anno.marker === 'erro' ? 'bg-red-200 border-b-2 border-red-500' : 
                                                           anno.marker === 'acerto' ? 'bg-green-200 border-b-2 border-green-500' : 
                                                           'bg-blue-200 border-b-2 border-blue-500';
                                        
                                        nextParts.push(
                                            <span key={`${anno.id}-${i}`}
                                                onClick={(e) => { e.stopPropagation(); setActiveAnnotationId(isActive ? null : anno.id); }}
                                                className={`relative cursor-pointer px-0.5 rounded border-b-2 transition-all ${colorClass} ${isActive ? 'ring-2 ring-[#42047e] z-10' : 'hover:opacity-80'}`}>
                                                {anno.selection}
                                            </span>
                                        );
                                    }
                                });
                            } else nextParts.push(part);
                        });
                        parts = nextParts;
                    });
                    return <p key={pIdx} className="relative">{parts}</p>;
                })}
            </div>
        );
    };

    if (isLoading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#42047e]"></div></div>;
    if (!details) return <div className="p-10 text-center text-red-500">Redação não encontrada.</div>;

    // DEFINIÇÃO CRÍTICA PARA EVITAR O REFERENCE ERROR
    const activeAnnotation = details.correction?.annotations?.find(a => a.id === activeAnnotationId);
    
    const finalGrade = details.correction?.final_grade || 0;
    const gradePercent = Math.min((finalGrade / 1000) * 100, 100);
    const gradeColor = finalGrade >= 900 ? 'text-[#07f49e]' : finalGrade >= 700 ? 'text-green-500' : finalGrade >= 500 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="animate-fade-in pb-20 relative" onClick={() => setActiveAnnotationId(null)}>
            {showAIModal && tempAIFeedback && (
                <AIApprovalModal feedback={tempAIFeedback} onSave={handleConfirmAISave} onCancel={() => { setShowAIModal(false); setTempAIFeedback(null); }} isSaving={isSavingAI} />
            )}
            
            {showContestModal && (
                <ContestModal onClose={() => setShowContestModal(false)} onSubmit={handleContestSubmit} />
            )}

            {/* STICKY TOPBAR FLUTUANTE */}
            <div className="sticky top-4 z-50 max-w-6xl mx-auto bg-white/90 dark:bg-dark-card/95 backdrop-blur-lg border border-gray-200 dark:border-dark-border px-6 py-3 flex justify-between items-center shadow-lg rounded-2xl transition-all animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-gray-500 hover:text-[#42047e] font-bold flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <i className="fas fa-arrow-left"></i> <span className="hidden md:inline">Voltar</span>
                    </button>
                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 hidden md:block"></div>
                    <h1 className="text-sm font-bold text-gray-800 dark:text-white hidden md:block truncate max-w-xs">{details.title || "Redação"}</h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                        <button onClick={() => setViewMode('corrected')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'corrected' ? 'bg-white shadow text-[#42047e] dark:bg-gray-700 dark:text-white' : 'text-gray-500'}`}>Correção</button>
                        <button onClick={() => setViewMode('clean')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'clean' ? 'bg-white shadow text-[#42047e] dark:bg-gray-700 dark:text-white' : 'text-gray-500'}`}>Limpo</button>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={handleDownload} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-xl transition-colors" title="Baixar"><i className="fas fa-print"></i></button>
                        <button onClick={handleShare} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors" title="Compartilhar"><i className="fas fa-share-alt"></i></button>
                        <button onClick={() => setShowContestModal(true)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors" title="Contestar"><i className="fas fa-flag"></i></button>
                    </div>
                    
                    {details.correction && !details.correction.ai_feedback && (
                        <button onClick={handleGenerateAI} disabled={isGeneratingAI} className="ml-2 bg-gradient-to-r from-[#42047e] to-[#07f49e] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-70">
                            {isGeneratingAI ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-magic"></i>}
                            <span className="hidden sm:inline">Análise IA</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 p-6 items-start mt-4">
                <div className="xl:col-span-7 bg-white dark:bg-dark-card p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border min-h-[600px] relative">
                    {/* ANOTAÇÃO FLUTUANTE */}
                    {activeAnnotation && (
                        <div className="sticky top-24 z-30 mb-4" onClick={e => e.stopPropagation()}>
                            <AnnotationDetail annotation={activeAnnotation} onClose={() => setActiveAnnotationId(null)} />
                        </div>
                    )}
                    
                    {details.image_submission_url ? (
                        <Image src={details.image_submission_url} alt="Redação" width={800} height={1200} className="w-full h-auto rounded-xl" />
                    ) : (
                        renderText()
                    )}
                </div>

                <div className="xl:col-span-5 space-y-6 xl:sticky xl:top-24">
                    <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-dark-border relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100 dark:bg-gray-700"><div className="h-full bg-gradient-to-r from-[#42047e] to-[#07f49e]" style={{ width: `${gradePercent}%` }}></div></div>
                        <div className="flex justify-between items-center mt-2">
                            <div><p className="text-xs font-bold text-gray-400 uppercase">Nota Final</p><div className="flex items-baseline gap-1"><span className={`text-5xl font-black tracking-tighter ${gradeColor}`}>{finalGrade}</span><span className="text-lg text-gray-400 font-bold">/1000</span></div></div>
                            {details.correction?.profiles && (<div className="text-right"><p className="text-xs text-gray-400 mb-1">Corretor</p><div className="flex items-center justify-end gap-2"><span className="font-bold text-sm dark:text-white">{details.correction.profiles.full_name}</span><VerificationBadge badge={details.correction.profiles.verification_badge} /></div></div>)}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
                        <div className="p-4 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700"><span className="font-bold text-gray-700 dark:text-gray-200 text-sm">Competências</span></div>
                        <div className="divide-y divide-gray-50 dark:divide-gray-800">
                            {details.correction && competencyDetails.map((comp, i) => {
                                const grade = (details.correction as any)[`grade_c${i+1}`] as number;
                                const pct = (grade / 200) * 100;
                                const barColor = grade === 200 ? 'bg-[#07f49e]' : grade >= 160 ? 'bg-green-500' : grade >= 120 ? 'bg-yellow-400' : 'bg-red-400';
                                return (
                                    <div key={i} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="flex justify-between mb-1"><span className="text-xs font-bold text-gray-500 uppercase">{comp.title.split(':')[0]}</span><span className="font-black text-dark-text dark:text-white text-lg">{grade}</span></div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 dark:bg-gray-700"><div className={`${barColor} h-full rounded-full`} style={{ width: `${pct}%` }}></div></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden h-[600px] flex flex-col">
                        <div className="flex-1 relative">
                             <FeedbackTabs correction={details.correction} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}