"use client";

import { useEffect, useState, ReactElement, useTransition } from 'react';
import { getEssayDetails, getCorrectionForEssay, saveStudyPlan, Annotation } from '../actions';
import { useToast } from '@/contexts/ToastContext';

const cleanHtml = (html: string) => { 
    if (typeof window === 'undefined') return html; 
    const doc = new DOMParser().parseFromString(html, 'text/html'); 
    return doc.body.textContent || ""; 
};

const markerStyles = { 
    erro: { bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-b-2 border-red-500', text: 'text-red-600' }, 
    acerto: { bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-b-2 border-green-500', text: 'text-green-600' }, 
    sugestao: { bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-b-2 border-blue-500', text: 'text-blue-600' } 
};

const renderAnnotatedText = (content: string, annotations: Annotation[] | null | undefined): ReactElement => {
    if (!content) return <p>Texto indisponível.</p>;
    if (!annotations || annotations.length === 0) return <div className="whitespace-pre-wrap leading-relaxed text-lg text-gray-700 dark:text-gray-300 font-serif" dangerouslySetInnerHTML={{ __html: content }} />;
    
    const plainText = cleanHtml(content);
    let parts: (string | ReactElement)[] = [plainText];
    const textAnnotations = annotations.filter(a => a.type === 'text' && a.selection);

    textAnnotations.forEach((anno, i) => {
        const newParts: (string | ReactElement)[] = [];
        parts.forEach((part) => {
            if (typeof part !== 'string') { newParts.push(part); return; }
            const split = part.split(anno.selection!);
            for (let j = 0; j < split.length; j++) {
                newParts.push(split[j]);
                if (j < split.length - 1) {
                    newParts.push(
                        <span key={`${anno.id}-${j}`} className={`relative group cursor-help ${markerStyles[anno.marker].bg} ${markerStyles[anno.marker].border} px-0.5 rounded-t`}>
                            {anno.selection}
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#1A1A1D] text-white text-xs rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 border border-white/10">
                                <strong className={`block mb-1 uppercase text-[10px] font-bold`}>{anno.marker}</strong> {anno.comment}
                            </span>
                        </span>
                    );
                }
            }
        });
        parts = newParts;
    });
    return <div className="whitespace-pre-wrap leading-loose text-lg text-gray-700 dark:text-gray-300 font-serif">{parts}</div>;
};

export default function EssayCorrectionView({ essayId, onBack }: {essayId: string, onBack: () => void}) {
    const [details, setDetails] = useState<any>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [popupStep, setPopupStep] = useState<'loading' | 'result'>('loading');
    const { addToast } = useToast();
    const [isSaving, startSaving] = useTransition();

    useEffect(() => {
        const load = async () => {
            const essay = await getEssayDetails(essayId);
            if (essay.data) {
                const correction = await getCorrectionForEssay(essayId);
                setDetails({ ...essay.data, correction: correction.data || null });
            }
        };
        load();
    }, [essayId]);

    const handleGeneratePlanClick = () => {
        setShowPopup(true);
        setPopupStep('loading');
        
        fetch('/api/generate-study-plan', {
            method: 'POST',
            body: JSON.stringify({ essayId })
        }).then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error();
            
            setDetails((prev: any) => {
                const correction = prev.correction || {};
                const ai_feedback = correction.ai_feedback || {};
                return {
                    ...prev,
                    correction: {
                        ...correction,
                        ai_feedback: {
                            ...ai_feedback,
                            actionable_items: data.tasks.map((t: any) => t.text)
                        }
                    }
                };
            });
            setPopupStep('result');
        }).catch(() => {
            addToast({ title: 'Erro', message: 'Falha ao gerar plano.', type: 'error' });
            setShowPopup(false);
        });
    };

    const handleSaveToDashboard = () => {
        const items = details?.correction?.ai_feedback?.actionable_items || [];
        const tasksToSave = items.map((t: string) => ({ id: crypto.randomUUID(), text: t, completed: false }));
        startSaving(async () => {
            await saveStudyPlan(essayId, tasksToSave);
            addToast({ title: 'Plano Salvo!', message: 'Verifique na aba "Meus Planos".', type: 'success' });
            setShowPopup(false);
        });
    };

    if (!details) return <div className="flex h-96 items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-purple border-t-transparent"></div></div>;

    const { correction, content, title } = details;
    const aiItems = correction?.ai_feedback?.actionable_items || [];

    return (
        <div className="max-w-7xl mx-auto pb-12 relative">
            {showPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#1A1A1D] w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 relative">
                        {popupStep === 'loading' ? (
                            <div className="p-10 text-center">
                                <div className="w-24 h-24 mx-auto mb-6 relative flex items-center justify-center">
                                    <div className="absolute inset-0 border-4 border-brand-purple/20 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-4xl">🤖</span>
                                </div>
                                <h3 className="text-xl font-bold mb-2 dark:text-white">IA Analisando...</h3>
                                <p className="text-gray-500 text-sm">Identificando erros e criando estratégias.</p>
                            </div>
                        ) : (
                            <div className="p-8 animate-fade-in-up">
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-xl font-black text-brand-purple"><i className="fas fa-sparkles mr-2"></i> Plano Gerado!</h3>
                                    <button onClick={() => setShowPopup(false)} className="text-gray-400 hover:text-red-500"><i className="fas fa-times"></i></button>
                                </div>
                                <div className="bg-brand-purple/5 p-4 rounded-2xl mb-6 max-h-60 overflow-y-auto custom-scrollbar border border-brand-purple/10">
                                    <ul className="space-y-3">
                                        {aiItems.map((item: string, i: number) => (
                                            <li key={i} className="flex gap-3 text-sm text-gray-700 dark:text-gray-200"><div className="mt-0.5 w-4 h-4 rounded-full border-2 border-brand-purple flex-shrink-0"></div>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                                <button onClick={handleSaveToDashboard} disabled={isSaving} className="w-full py-3.5 bg-brand-purple text-white font-bold rounded-xl hover:bg-brand-green hover:text-brand-dark transition-all shadow-lg transform hover:-translate-y-0.5">
                                    {isSaving ? 'Salvando...' : 'Adicionar ao Dashboard'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-8">
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-purple transition-colors"><i className="fas fa-arrow-left"></i> Voltar</button>
                <button onClick={handleGeneratePlanClick} className="px-5 py-2 bg-white text-brand-purple border border-brand-purple font-bold rounded-xl hover:bg-brand-purple hover:text-white transition-colors flex items-center gap-2 shadow-sm"><i className="fas fa-robot"></i> Gerar Plano com IA</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-150px)]">
                <div className="lg:col-span-7 bg-white dark:bg-dark-card rounded-[2rem] shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col">
                     <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5"><h1 className="text-xl font-black text-dark-text dark:text-white line-clamp-1">{title}</h1></div>
                    <div className="p-8 overflow-y-auto flex-1 custom-scrollbar bg-white dark:bg-dark-card">{renderAnnotatedText(content || "", correction?.annotations)}</div>
                </div>
                <div className="lg:col-span-5 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                    <div className="bg-white dark:bg-dark-card p-6 rounded-[2rem] shadow-md border border-gray-100 dark:border-white/5">
                        <div className="flex justify-between items-end mb-6">
                            <div><p className="text-xs font-bold text-gray-400 uppercase">Nota Final</p><p className="text-5xl font-black text-brand-purple">{correction?.final_grade || 0}</p></div>
                            <div className="text-right"><div className="flex gap-1">{[1,2,3,4,5].map(c => (<div key={c} className="w-8 h-16 bg-gray-100 dark:bg-white/10 rounded-lg flex flex-col justify-end items-center overflow-hidden relative"><div className="w-full bg-brand-green opacity-80" style={{ height: `${(correction?.[`grade_c${c}` as keyof EssayCorrection] as number / 200) * 100}%` }}></div><span className="absolute bottom-1 text-[8px] font-bold text-dark-text mix-blend-multiply">C{c}</span></div>))}</div></div>
                        </div>
                        <div className="bg-brand-purple/5 p-5 rounded-2xl border border-brand-purple/10"><p className="text-xs font-bold text-brand-purple uppercase mb-2 flex items-center gap-2"><i className="fas fa-comment-alt"></i> Feedback do Corretor</p><p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">"{correction?.feedback || "Sem feedback disponível."}"</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
}