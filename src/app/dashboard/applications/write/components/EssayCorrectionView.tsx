"use client";

import { useEffect, useState, ReactElement, useTransition } from 'react';
import { Essay, EssayCorrection, Annotation, getEssayDetails, getCorrectionForEssay, AIFeedback, saveStudyPlan } from '../actions';
import Image from 'next/image';
import { useToast } from '@/contexts/ToastContext';
import FeedbackTabs from './FeedbackTabs';

// ... (Tipos e funções auxiliares de texto mantidos iguais para brevidade, mas incluídos no componente final) ...
// (Assumindo que cleanHtml, renderAnnotatedText e CompetencyModal estão definidos acima como antes)

// Função auxiliar de limpeza
const cleanHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};

// ... (Código de renderAnnotatedText e MarkerStyles igual ao anterior) ...
// ... (CompetencyModal igual ao anterior) ...
// VOU INCLUIR TUDO PARA SER COPIAR-COLAR SEGURO:

const markerStyles = {
    erro: { bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-b-2 border-red-500', text: 'text-red-600' },
    acerto: { bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-b-2 border-green-500', text: 'text-green-600' },
    sugestao: { bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-b-2 border-blue-500', text: 'text-blue-600' },
};

const renderAnnotatedText = (content: string, annotations: Annotation[] | null | undefined): ReactElement => {
    if (!content) return <p>Texto indisponível.</p>;
    if (!annotations || annotations.length === 0) return <div className="whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />;

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
                                <strong className={`block mb-1 uppercase text-[10px] font-bold`}>{anno.marker}</strong>
                                {anno.comment}
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

// COMPONENTE PRINCIPAL
export default function EssayCorrectionView({ essayId, onBack }: {essayId: string, onBack: () => void}) {
    const [details, setDetails] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'feedback' | 'plan'>('feedback');
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false); // Estado da animação
    const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
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

    // Simula a geração do plano com IA
    const handleGeneratePlan = () => {
        setIsGeneratingPlan(true);
        // Simula tempo de processamento
        setTimeout(() => {
            setIsGeneratingPlan(false);
            setActiveTab('plan');
        }, 2500);
    };

    const toggleCheck = (idx: number) => {
        setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const calculateProgress = () => {
        const items = details?.correction?.ai_feedback?.actionable_items || [];
        if (items.length === 0) return 0;
        const checkedCount = Object.values(checkedItems).filter(Boolean).length;
        return Math.round((checkedCount / items.length) * 100);
    };

    if (!details) return <div className="flex h-96 items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-purple border-t-transparent"></div></div>;

    const { correction, content, title } = details;
    const actionableItems = correction?.ai_feedback?.actionable_items || [];
    const progress = calculateProgress();

    return (
        <div className="max-w-7xl mx-auto pb-12">
            {/* Topbar de Navegação */}
            <div className="flex items-center justify-between mb-8">
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-purple transition-colors">
                    <i className="fas fa-arrow-left"></i> Voltar para Lista
                </button>
                <div className="text-right">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green text-xs font-bold mb-1 border border-brand-green/20">
                        <i className="fas fa-check-circle"></i> Corrigida
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-150px)]">
                
                {/* COLUNA ESQUERDA: TEXTO (7 cols) */}
                <div className="lg:col-span-7 bg-white dark:bg-dark-card rounded-[2rem] shadow-xl border border-gray-100 dark:border-white/5 flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                        <div>
                            <h1 className="text-xl font-black text-dark-text dark:text-white line-clamp-1">{title}</h1>
                            <p className="text-xs text-gray-500 mt-1">Correção por: <span className="font-bold text-brand-purple">{correction?.profiles?.full_name || 'IA'}</span></p>
                        </div>
                    </div>
                    <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                         {renderAnnotatedText(content || "", correction?.annotations)}
                    </div>
                </div>

                {/* COLUNA DIREITA: INTERATIVA (5 cols) */}
                <div className="lg:col-span-5 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-2">
                    
                    {/* Card da Nota com Design Premium */}
                    <div className="bg-gradient-to-br from-brand-purple to-indigo-900 text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                        <div className="relative z-10 flex justify-between items-end">
                            <div>
                                <p className="text-sm font-medium opacity-80 mb-1 uppercase tracking-widest">Nota Final</p>
                                <div className="text-7xl font-black tracking-tighter leading-none">
                                    {correction?.final_grade || 0}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold opacity-50 mb-1">/1000</div>
                                <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold">
                                    {correction?.final_grade >= 900 ? 'Excelente 🌟' : 'Bom Trabalho 👍'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Painel de Feedback e Ação */}
                    <div className="bg-white dark:bg-dark-card rounded-[2rem] shadow-lg border border-gray-100 dark:border-white/5 flex-1 flex flex-col overflow-hidden">
                        {/* Tabs */}
                        <div className="flex p-2 gap-2 border-b border-gray-100 dark:border-white/5">
                            <button 
                                onClick={() => setActiveTab('feedback')} 
                                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'feedback' ? 'bg-brand-purple/10 text-brand-purple' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
                            >
                                Detalhes
                            </button>
                            <button 
                                onClick={() => setActiveTab('plan')} 
                                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'plan' ? 'bg-brand-green/10 text-brand-green' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
                            >
                                Plano de Ação
                            </button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto">
                            {activeTab === 'feedback' ? (
                                <div className="space-y-6 animate-fade-in-right">
                                    <div className="space-y-3">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-transparent hover:border-brand-purple/20 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-brand-purple/10 text-brand-purple flex items-center justify-center font-bold text-xs">C{i}</div>
                                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Competência {i}</span>
                                                </div>
                                                <span className="font-black text-dark-text dark:text-white">
                                                    {correction?.[`grade_c${i}` as keyof EssayCorrection] || 0}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-brand-purple/5 p-5 rounded-2xl border border-brand-purple/10">
                                        <p className="text-xs font-bold text-brand-purple uppercase mb-2 tracking-wider">Comentário Geral</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                                            "{correction?.feedback || "Sem comentário."}"
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col">
                                    {isGeneratingPlan ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
                                            <div className="w-20 h-20 bg-brand-green/20 rounded-full flex items-center justify-center">
                                                <i className="fas fa-magic text-3xl text-brand-green animate-spin-slow"></i>
                                            </div>
                                            <h3 className="text-xl font-bold text-dark-text dark:text-white">A IA está a analisar...</h3>
                                            <p className="text-sm text-gray-500 max-w-xs">Criando um plano personalizado com base nos seus erros.</p>
                                        </div>
                                    ) : actionableItems.length > 0 ? (
                                        <div className="animate-fade-in-up space-y-6">
                                            {/* Barra de Progresso */}
                                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-xs font-bold uppercase text-gray-500">Seu Progresso</span>
                                                    <span className="text-xs font-bold text-brand-green">{progress}% Concluído</span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
                                                    <div className="bg-brand-green h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                                                </div>
                                            </div>

                                            {/* Checklist */}
                                            <div className="space-y-3">
                                                {actionableItems.map((item: string, idx: number) => (
                                                    <div 
                                                        key={idx} 
                                                        onClick={() => toggleCheck(idx)}
                                                        className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${checkedItems[idx] ? 'bg-brand-green/10 border-brand-green/30' : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 hover:border-brand-purple/30'}`}
                                                    >
                                                        <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${checkedItems[idx] ? 'bg-brand-green border-brand-green text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                                                            {checkedItems[idx] && <i className="fas fa-check text-xs"></i>}
                                                        </div>
                                                        <span className={`text-sm font-medium transition-all ${checkedItems[idx] ? 'text-gray-500 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
                                                            {item}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                                            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-400 text-3xl">
                                                <i className="fas fa-clipboard-list"></i>
                                            </div>
                                            <p className="text-dark-text font-bold mb-2">Nenhum plano ativo</p>
                                            <p className="text-sm text-gray-500 mb-6">Gere um plano de ação com IA para focar nos pontos fracos desta redação.</p>
                                            <button onClick={handleGeneratePlan} className="px-6 py-3 bg-brand-dark text-white font-bold rounded-xl hover:bg-brand-purple transition-colors shadow-lg">
                                                <i className="fas fa-magic mr-2 text-brand-green"></i> Gerar Plano com IA
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