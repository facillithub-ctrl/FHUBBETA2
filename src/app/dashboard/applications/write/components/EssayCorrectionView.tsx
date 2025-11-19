"use client";

import { useEffect, useState, useTransition } from 'react';
import { Essay, EssayCorrection, Annotation, getEssayDetails, getCorrectionForEssay, AIFeedback, StudyPlan, saveStudyPlan } from '../actions';
import Image from 'next/image';
import FeedbackTabs from './FeedbackTabs';
import { VerificationBadge } from '@/components/VerificationBadge';
import { useToast } from '@/contexts/ToastContext';

type CorrectionWithDetails = EssayCorrection & {
  profiles: { full_name: string | null; verification_badge: string | null };
  ai_feedback: AIFeedback | null;
  study_plan?: StudyPlan | null;
};

type FullEssayDetails = Essay & {
  correction: CorrectionWithDetails | null;
  profiles: { full_name: string | null } | null;
};

const StudyPlanModal = ({ plan, essayId, onClose }: { plan: StudyPlan, essayId: string, onClose: () => void }) => {
    const { addToast } = useToast();
    const [isSaving, startTransition] = useTransition();

    const handleSave = () => {
        startTransition(async () => {
            const result = await saveStudyPlan(plan, essayId);
            if (result.success) {
                addToast({ title: "Plano Salvo!", message: "Você pode acessá-lo na sua Dashboard.", type: "success" });
                onClose();
            } else {
                addToast({ title: "Erro", message: "Não foi possível salvar o plano.", type: "error" });
            }
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 border border-gray-200 dark:border-dark-border" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-6 border-b dark:border-gray-700 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-royal-blue flex items-center gap-2">
                            <i className="fas fa-rocket"></i> Plano de Melhoria
                        </h2>
                        <p className="text-sm text-gray-500">Gerado por IA • Personalizado para você</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times text-xl"></i></button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                     <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-xl border border-green-100 dark:border-green-800/30">
                        <h3 className="font-bold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2"><i className="fas fa-check-circle"></i> Pontos Fortes</h3>
                        <ul className="space-y-2">{plan.strengths.map((s, i) => <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"><span className="text-green-500">•</span> {s}</li>)}</ul>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-xl border border-red-100 dark:border-red-800/30">
                        <h3 className="font-bold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2"><i className="fas fa-bullseye"></i> A Melhorar</h3>
                        <ul className="space-y-2">{plan.weaknesses.map((w, i) => <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"><span className="text-red-500">•</span> {w}</li>)}</ul>
                    </div>
                </div>

                <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2"><i className="fas fa-calendar-alt text-purple-500"></i> Cronograma Sugerido</h3>
                <div className="space-y-3 mb-8">
                    {plan.weekly_schedule.map((item, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 border rounded-xl dark:border-dark-border bg-gray-50 dark:bg-gray-800/50">
                            <span className="bg-royal-blue text-white text-xs font-bold px-3 py-1.5 rounded-lg w-fit sm:w-24 text-center uppercase">{item.day}</span>
                            <div className="flex-1">
                                <p className="font-bold text-sm text-gray-800 dark:text-white">{item.activity}</p>
                                <p className="text-xs text-gray-500">Foco: {item.focus}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-700">
                    <button onClick={onClose} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Fechar</button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="bg-green-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                        Salvar Plano
                    </button>
                </div>
            </div>
        </div>
    );
};

const renderAnnotatedText = (text: string, annotations: Annotation[] | null | undefined) => {
    if (!text) return null;
    const textAnnotations = annotations?.filter(a => a.type === 'text' && a.selection) || [];
    if (textAnnotations.length === 0) return <div className="whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-300">{text}</div>;

    let parts: (string | React.ReactNode)[] = [text];
    textAnnotations.forEach((anno) => {
        const newParts: (string | React.ReactNode)[] = [];
        parts.forEach(part => {
            if (typeof part === 'string') {
                const index = part.indexOf(anno.selection!);
                if (index !== -1) {
                    const before = part.substring(0, index);
                    const match = part.substring(index, index + anno.selection!.length);
                    const after = part.substring(index + anno.selection!.length);
                    if (before) newParts.push(before);
                    const markerColor = anno.marker === 'erro' ? 'border-red-500 bg-red-100' : anno.marker === 'acerto' ? 'border-green-500 bg-green-100' : 'border-blue-500 bg-blue-100';
                    newParts.push(<span key={anno.id} className={`border-b-2 ${markerColor} relative group cursor-help px-0.5 rounded-sm`}>{match}<span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10 transform translate-y-1 group-hover:translate-y-0">{anno.comment}</span></span>);
                    if (after) newParts.push(after);
                } else { newParts.push(part); }
            } else { newParts.push(part); }
        });
        parts = newParts;
    });
    return <div className="whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-300">{parts}</div>;
};

export default function EssayCorrectionView({ essayId, onBack }: {essayId: string, onBack: () => void}) {
    const [details, setDetails] = useState<FullEssayDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'corrected' | 'comparison'>('corrected');
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
    const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            try {
                const essayResult = await getEssayDetails(essayId);
                if (essayResult.data) {
                    const correctionResult = await getCorrectionForEssay(essayId);
                    setDetails({
                        ...(essayResult.data as FullEssayDetails),
                        correction: correctionResult.data as any,
                    });
                }
            } catch (error) { console.error("Erro:", error); } finally { setIsLoading(false); }
        };
        fetchDetails();
    }, [essayId]);

    const handleGenerateStudyPlan = async () => {
        if (!details?.content || !details?.correction) return;
        setIsGeneratingPlan(true);
        try {
            const res = await fetch('/api/generate-study-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    essayContent: details.content,
                    feedback: details.correction.feedback,
                    grades: { c1: details.correction.grade_c1, c2: details.correction.grade_c2, c3: details.correction.grade_c3, c4: details.correction.grade_c4, c5: details.correction.grade_c5 }
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setStudyPlan(data);
        } catch (e: any) { alert(`Erro: ${e.message}`); } finally { setIsGeneratingPlan(false); }
    };

    if (isLoading) return <div className="text-center p-8">Carregando...</div>;
    if (!details) return <div className="text-center p-8">Erro ao carregar.</div>;

    const { title, content, correction, image_submission_url } = details;
    const annotations = correction?.annotations;
    const isTextView = content && !image_submission_url;

    return (
        <div className="pb-12">
            {studyPlan && <StudyPlanModal plan={studyPlan} essayId={essayId} onClose={() => setStudyPlan(null)} />}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-sm font-bold text-gray-500 hover:text-royal-blue flex items-center gap-2"><i className="fas fa-arrow-left"></i> Voltar</button>
                    {isTextView && correction && (
                        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex text-xs font-bold">
                            <button onClick={() => setViewMode('corrected')} className={`px-3 py-1.5 rounded-md ${viewMode === 'corrected' ? 'bg-white dark:bg-gray-700 shadow text-royal-blue' : 'text-gray-500'}`}>Correção</button>
                            <button onClick={() => setViewMode('comparison')} className={`px-3 py-1.5 rounded-md ${viewMode === 'comparison' ? 'bg-white dark:bg-gray-700 shadow text-royal-blue' : 'text-gray-500'}`}>Comparar</button>
                        </div>
                    )}
                </div>
                <button onClick={handleGenerateStudyPlan} disabled={isGeneratingPlan || !correction} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center gap-2">
                    {isGeneratingPlan ? <><i className="fas fa-spinner fa-spin"></i> Gerando...</> : <><i className="fas fa-magic"></i> Gerar Plano de Melhoria</>}
                </button>
            </div>

            <div className={`grid grid-cols-1 ${viewMode === 'comparison' ? 'lg:grid-cols-2' : 'lg:grid-cols-12'} gap-8`}>
                <div className={`${viewMode === 'comparison' ? 'lg:col-span-1' : 'lg:col-span-7'} space-y-6`}>
                    <div className="bg-white dark:bg-dark-card p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-border min-h-[600px]">
                        <h2 className="text-2xl font-bold mb-6 dark:text-white">{title || "Redação sem Título"}</h2>
                        {image_submission_url ? (
                            <div className="relative w-full"><Image src={image_submission_url} alt="Redação" width={800} height={1100} className="w-full rounded-lg" /></div>
                        ) : (
                            <div className="prose dark:prose-invert max-w-none text-lg">{viewMode === 'comparison' ? content : renderAnnotatedText(content!, annotations)}</div>
                        )}
                    </div>
                </div>

                {viewMode !== 'comparison' && (
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-border sticky top-6">
                            <div className="flex justify-between items-center mb-6 pb-6 border-b dark:border-gray-700">
                                <h2 className="font-bold text-xl dark:text-white">Nota Final</h2>
                                <span className="text-4xl font-black text-royal-blue">{correction?.final_grade}</span>
                            </div>
                            {correction ? (
                                <div className="space-y-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="flex-1 bg-gray-100 h-2 rounded-full"><div className="bg-royal-blue h-full rounded-full" style={{ width: `${(correction[`grade_c${i}` as keyof EssayCorrection] as number / 200) * 100}%` }} /></div>
                                            <span className="font-bold w-8 text-right">{correction[`grade_c${i}` as keyof EssayCorrection]}</span>
                                        </div>
                                    ))}
                                    <div className="mt-8 pt-6 border-t dark:border-gray-700"><FeedbackTabs correction={correction} /></div>
                                </div>
                            ) : (
                                <p className="text-center text-gray-500">Aguardando correção...</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}