"use client";

import { useEffect, useState, useTransition } from 'react';
import { 
    Essay, EssayCorrection, Annotation, getEssayDetails, getCorrectionForEssay, 
    AIFeedback, StudyPlan, saveStudyPlan 
} from '../actions';
import Image from 'next/image';
import FeedbackTabs from './FeedbackTabs';
import { useToast } from '@/contexts/ToastContext';

// --- Tipos ---
type CorrectionWithDetails = EssayCorrection & {
  profiles: { full_name: string | null; verification_badge: string | null };
  ai_feedback: AIFeedback | null;
  study_plan?: StudyPlan | null;
};

type FullEssayDetails = Essay & {
  correction: CorrectionWithDetails | null;
  profiles: { full_name: string | null } | null;
};

// --- Componentes Auxiliares ---

const GradeBar = ({ label, score, max = 200 }: { label: string; score: number; max?: number }) => {
    const percentage = (score / max) * 100;
    const isHigh = percentage >= 80;
    const isMedium = percentage >= 60 && percentage < 80;
    const barColor = isHigh ? 'bg-[#07f49e]' : isMedium ? 'bg-yellow-400' : 'bg-red-400';

    return (
        <div className="group mb-3 last:mb-0">
            <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</span>
                <span className="text-sm font-black text-dark-text dark:text-white">{score} <span className="text-gray-400 font-normal text-xs">/ {max}</span></span>
            </div>
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${barColor} rounded-full transition-all duration-1000 ease-out group-hover:shadow-[0_0_10px_rgba(7,244,158,0.5)]`} 
                    style={{ width: `${percentage}%` }} 
                />
            </div>
        </div>
    );
};

const StudyPlanModal = ({ plan, essayId, onClose }: { plan: StudyPlan, essayId: string, onClose: () => void }) => {
    const { addToast } = useToast();
    const [isSaving, startTransition] = useTransition();

    const handleSave = () => {
        startTransition(async () => {
            const result = await saveStudyPlan(plan, essayId);
            if (result.success) {
                addToast({ title: "Sucesso!", message: "Plano salvo na sua área de estudos.", type: "success" });
                onClose();
            } else {
                addToast({ title: "Erro", message: "Não foi possível salvar o plano.", type: "error" });
            }
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-white/10">
                <div className="bg-gradient-to-r from-[#42047e] to-[#07f49e] p-6 text-white shrink-0 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2"><i className="fas fa-rocket"></i> Plano de Ação IA</h2>
                    <button onClick={onClose}><i className="fas fa-times"></i></button>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar space-y-8 flex-1">
                    <div className="grid md:grid-cols-2 gap-6">
                         <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-2xl border border-green-100">
                            <h3 className="font-bold text-[#07f49e] mb-4">Pontos Fortes</h3>
                            <ul className="space-y-2">{plan.strengths.map((s, i) => <li key={i} className="text-sm dark:text-gray-300">• {s}</li>)}</ul>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100">
                            <h3 className="font-bold text-red-500 mb-4">A Melhorar</h3>
                            <ul className="space-y-2">{plan.weaknesses.map((w, i) => <li key={i} className="text-sm dark:text-gray-300">• {w}</li>)}</ul>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-4 dark:text-white">Cronograma Sugerido</h3>
                        <div className="grid gap-3">
                            {plan.weekly_schedule.map((item, i) => (
                                <div key={i} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border dark:border-gray-700">
                                    <span className="font-bold text-[#42047e] w-24">{item.day}</span>
                                    <div className="flex-1"><p className="font-bold dark:text-white">{item.activity}</p><p className="text-xs text-gray-500">{item.focus}</p></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3 shrink-0 bg-gray-50 dark:bg-gray-800">
                    <button onClick={onClose} className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-200 rounded-lg">Cancelar</button>
                    <button onClick={handleSave} disabled={isSaving} className="bg-[#07f49e] text-[#42047e] font-bold py-2 px-6 rounded-lg shadow-lg">
                        {isSaving ? 'Salvando...' : 'Salvar Plano'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Lógica de Renderização de Texto com Anotações ---
const renderAnnotatedText = (text: string, annotations: Annotation[] | null | undefined) => {
    if (!text) return <p className="text-gray-400 italic">Sem conteúdo.</p>;
    
    // Se não houver anotações, retorna o texto puro formatado
    const textAnnotations = annotations?.filter(a => a.type === 'text' && a.selection && text.includes(a.selection)) || [];
    if (textAnnotations.length === 0) {
        return <div className="whitespace-pre-wrap leading-loose text-lg text-gray-800 dark:text-gray-200 font-serif">{text}</div>;
    }

    let parts: (string | React.ReactNode)[] = [text];

    textAnnotations.forEach((anno) => {
        const newParts: (string | React.ReactNode)[] = [];
        parts.forEach(part => {
            if (typeof part === 'string') {
                const selection = anno.selection!;
                const splitArr = part.split(selection);
                
                if (splitArr.length > 1) {
                    splitArr.forEach((subPart, index) => {
                        newParts.push(subPart);
                        if (index < splitArr.length - 1) {
                            // Definição de cores baseada no tipo de erro
                            let markClass = '';
                            let icon = '';
                            if (anno.marker === 'erro') {
                                markClass = 'border-red-500 bg-red-100/50 text-red-900 dark:text-red-100 dark:bg-red-900/40';
                                icon = 'fa-times-circle';
                            } else if (anno.marker === 'sugestao') {
                                markClass = 'border-yellow-500 bg-yellow-100/50 text-yellow-900 dark:text-yellow-100 dark:bg-yellow-900/40';
                                icon = 'fa-lightbulb';
                            } else {
                                markClass = 'border-[#07f49e] bg-[#07f49e]/20 text-green-900 dark:text-green-100';
                                icon = 'fa-check-circle';
                            }

                            newParts.push(
                                <span key={`${anno.id}-${index}`} className={`relative group cursor-pointer border-b-2 mx-0.5 px-1 rounded transition-colors ${markClass}`}>
                                    {selection}
                                    {/* Tooltip Flutuante */}
                                    <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 
                                        bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-xs rounded-xl shadow-2xl 
                                        border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 
                                        transition-all duration-200 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                                        <div className="flex items-center gap-2 mb-1 pb-1 border-b dark:border-gray-700">
                                            <i className={`fas ${icon}`}></i>
                                            <span className="font-bold uppercase text-[10px] tracking-wider">{anno.marker}</span>
                                        </div>
                                        <p className="leading-relaxed">{anno.comment}</p>
                                        {/* Seta do Tooltip */}
                                        <svg className="absolute text-white dark:text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                                            <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
                                        </svg>
                                    </span>
                                </span>
                            );
                        }
                    });
                } else {
                    newParts.push(part);
                }
            } else {
                newParts.push(part);
            }
        });
        parts = newParts;
    });

    return <div className="whitespace-pre-wrap leading-loose text-lg text-gray-800 dark:text-gray-200 font-serif">{parts}</div>;
};

export default function EssayCorrectionView({ essayId, onBack }: {essayId: string, onBack: () => void}) {
    const [details, setDetails] = useState<FullEssayDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'corrected' | 'comparison'>('corrected');
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
    const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
    const { addToast } = useToast();

    useEffect(() => {
        const load = async () => {
             setIsLoading(true);
             try {
                const d = await getEssayDetails(essayId);
                const c = await getCorrectionForEssay(essayId);
                // @ts-ignore
                if(d.data) setDetails({...d.data, correction: c.data});
             } catch(e) { console.error(e); } finally { setIsLoading(false); }
        };
        load();
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
                    grades: { 
                        c1: details.correction.grade_c1, c2: details.correction.grade_c2, c3: details.correction.grade_c3, c4: details.correction.grade_c4, c5: details.correction.grade_c5 
                    }
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setStudyPlan(data);
        } catch (e: any) { addToast({title: 'Erro', message: e.message, type: 'error'}); } finally { setIsGeneratingPlan(false); }
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center"><i className="fas fa-circle-notch fa-spin text-4xl text-[#42047e]"></i></div>;
    if (!details) return <div className="p-8 text-center">Erro ao carregar detalhes.</div>;

    const { title, content, correction, image_submission_url, submitted_at } = details;
    const annotations = correction?.annotations;

    return (
        <div className="pb-20 animate-fade-in-right">
            {studyPlan && <StudyPlanModal plan={studyPlan} essayId={essayId} onClose={() => setStudyPlan(null)} />}

            {/* Topbar Fixa com Ações */}
            <div className="sticky top-0 z-30 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 py-3 mb-6 transition-all shadow-sm">
                <div className="max-w-[1600px] mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <button onClick={onBack} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-[#42047e] hover:text-white transition-all">
                            <i className="fas fa-arrow-left"></i>
                        </button>
                        <div className="flex flex-col">
                            <h1 className="font-bold text-base dark:text-white leading-tight truncate max-w-[200px] sm:max-w-md">{title || 'Redação sem título'}</h1>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <i className="far fa-clock"></i> {new Date(submitted_at!).toLocaleDateString()}
                                {correction && <span className="bg-green-100 text-green-700 px-1.5 rounded text-[10px] font-bold">CORRIGIDA</span>}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                         {content && !image_submission_url && (
                            <div className="hidden md:flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                <button onClick={() => setViewMode('corrected')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'corrected' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-500'}`}>Correção</button>
                                <button onClick={() => setViewMode('comparison')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'comparison' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-500'}`}>Lado a Lado</button>
                            </div>
                         )}
                        <button onClick={handleGenerateStudyPlan} disabled={isGeneratingPlan || !correction} className="bg-gradient-to-r from-[#42047e] to-[#07f49e] text-white px-5 py-2 rounded-full font-bold text-xs shadow-lg hover:shadow-[#07f49e]/20 hover:scale-105 transition-all flex items-center gap-2">
                            {isGeneratingPlan ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>} Plano IA
                        </button>
                    </div>
                </div>
            </div>

            {/* Conteúdo Principal */}
            <div className={`max-w-[1600px] mx-auto px-4 grid grid-cols-1 ${viewMode === 'comparison' ? 'lg:grid-cols-2' : 'lg:grid-cols-12'} gap-8 items-start`}>
                
                {/* --- LADO ESQUERDO: TEXTO DA REDAÇÃO --- */}
                <div className={`${viewMode === 'comparison' ? 'lg:col-span-1' : 'lg:col-span-7'} flex flex-col gap-6`}>
                    <div className="bg-white dark:bg-gray-900 p-8 sm:p-12 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 min-h-[80vh] relative">
                         {/* Elemento Visual de "Papel" */}
                         <div className="absolute top-0 left-10 bottom-0 w-px bg-red-400/20 hidden sm:block"></div>
                         
                         <div className="relative z-10 pl-0 sm:pl-8">
                            {image_submission_url ? (
                                <div className="relative w-full rounded-lg overflow-hidden border dark:border-gray-700">
                                    <Image src={image_submission_url} alt="Redação" width={800} height={1100} className="w-full h-auto" />
                                </div>
                            ) : (
                                renderAnnotatedText(content!, viewMode === 'comparison' ? null : annotations)
                            )}
                         </div>
                    </div>
                </div>

                {/* --- LADO DIREITO: PAINEL DE CORREÇÃO --- */}
                {viewMode !== 'comparison' && (
                    <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                        
                        {/* Card de Nota - Design Premium */}
                        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 p-6">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#42047e]/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                            <div className="relative z-10 flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nota Final</h3>
                                    <div className="text-5xl font-black text-[#42047e] dark:text-white mt-1">{correction?.final_grade || 0}</div>
                                </div>
                                <div className="text-right">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#07f49e]/20 text-[#07f49e]">
                                        <i className="fas fa-trophy text-xl"></i>
                                    </div>
                                </div>
                            </div>

                            {/* Barras de Competência */}
                            <div className="space-y-2 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <GradeBar key={i} label={`Competência ${i}`} score={correction?.[`grade_c${i}` as keyof EssayCorrection] as number || 0} />
                                ))}
                            </div>
                        </div>

                        {/* Abas de Feedback Detalhado */}
                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 p-1 h-[500px] flex flex-col">
                            <FeedbackTabs correction={correction} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}