"use client";

import { useEffect, useState, useTransition, useRef, MouseEvent } from 'react';
import { Essay, getEssayDetails, submitCorrection, Annotation, AIFeedback } from '../actions';
import Image from 'next/image';

type EssayWithProfile = Essay & {
    profiles: { full_name: string | null } | null;
};

// Popup com posição fixa (fixed) para garantir visibilidade correta sobre qualquer elemento
const AnnotationPopup = ({ position, onSave, onClose }: { 
    position: { top: number; left: number }; 
    onSave: (comment: string, marker: Annotation['marker']) => void; 
    onClose: () => void; 
}) => {
    const [comment, setComment] = useState('');
    const [marker, setMarker] = useState<Annotation['marker']>('sugestao');

    return (
        <div
            className="fixed z-[9999] bg-white dark:bg-dark-card shadow-2xl rounded-xl p-4 w-80 border border-gray-200 dark:border-dark-border animate-[fadeIn_0.2s_ease-out] origin-top-left"
            style={{ top: position.top, left: position.left }}
            onMouseDown={e => e.stopPropagation()}
        >
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Novo Comentário</h4>
            <textarea
                placeholder="Digite seu comentário aqui..."
                rows={3}
                className="w-full p-3 border rounded-lg text-sm mb-3 bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-royal-blue outline-none resize-none"
                value={comment}
                onChange={e => setComment(e.target.value)}
                autoFocus
            />
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    {[
                        { id: 'erro', color: 'bg-red-500', label: 'Erro' },
                        { id: 'acerto', color: 'bg-green-500', label: 'Acerto' },
                        { id: 'sugestao', color: 'bg-blue-500', label: 'Sugestão' }
                    ].map((m) => (
                        <button 
                            key={m.id}
                            onClick={() => setMarker(m.id as Annotation['marker'])} 
                            className={`w-6 h-6 rounded-full ${m.color} border-2 transition-transform hover:scale-110 ${marker === m.id ? 'border-black dark:border-white scale-110 ring-2 ring-offset-1' : 'border-transparent'}`} 
                            title={m.label}
                        />
                    ))}
                </div>
                <div className="flex gap-2">
                    <button onClick={onClose} className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800">Cancelar</button>
                    <button onClick={() => comment && onSave(comment, marker)} className="text-xs bg-royal-blue text-white px-4 py-1.5 rounded-lg font-bold shadow-md hover:bg-blue-700 transition-colors">Salvar</button>
                </div>
            </div>
        </div>
    );
};

export default function CorrectionInterface({ essayId, onBack }: { essayId: string; onBack: () => void }) {
    const [essay, setEssay] = useState<EssayWithProfile | null>(null);
    const [grades, setGrades] = useState({ c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 });
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, startTransition] = useTransition();
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    // Popup usa coordenadas relativas à janela (viewport)
    const [popup, setPopup] = useState<{ x: number, y: number, selection?: string, position?: any } | null>(null);
    
    const [aiData, setAiData] = useState<AIFeedback>({
        detailed_feedback: Array(5).fill(null).map((_, i) => ({ competency: `Competência ${i+1}`, feedback: '' })),
        actionable_items: [],
        rewrite_suggestions: []
    });

    useEffect(() => {
        getEssayDetails(essayId).then(res => {
            if (res.data) setEssay(res.data as EssayWithProfile);
        });
    }, [essayId]);

    // Lógica de Seleção de Texto Corrigida
    const handleTextMouseUp = (e: MouseEvent) => {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed && selection.toString().trim().length > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            // Usa rect.left e rect.bottom para posicionar o popup fixo exatamente onde a seleção ocorreu
            setPopup({
                x: rect.left, 
                y: rect.bottom + 10, 
                selection: selection.toString()
            });
        }
    };

    const handleSaveAnnotation = (comment: string, marker: Annotation['marker']) => {
        if (!popup) return;
        
        const newAnno: Annotation = {
            id: crypto.randomUUID(),
            type: popup.selection ? 'text' : 'image',
            comment,
            marker,
            selection: popup.selection,
            position: popup.position
        };
        
        setAnnotations(prev => [...prev, newAnno]);
        setPopup(null);
        window.getSelection()?.removeAllRanges();
    };

    const removeAnnotation = (id: string) => {
        if (confirm("Remover esta anotação?")) {
            setAnnotations(prev => prev.filter(a => a.id !== id));
        }
    };

    const handleGenerateAI = async () => {
        if (!essay?.content) return alert("Redação sem texto para analisar.");
        setIsGeneratingAI(true);
        
        try {
            const response = await fetch('/api/generate-feedback', {
                method: 'POST',
                body: JSON.stringify({ text: essay.content }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Erro na requisição');
            }

            setAiData(data);
            alert("✨ Análise da IA concluída com sucesso!");
        } catch (error: any) {
            console.error(error);
            alert(`Erro ao gerar IA: ${error.message}`);
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleSubmit = () => {
        if(!feedback) return alert("Preencha o feedback geral.");
        
        startTransition(async () => {
            const total = Object.values(grades).reduce((a, b) => a + b, 0);
            const result = await submitCorrection({
                essay_id: essayId,
                feedback,
                grade_c1: grades.c1, grade_c2: grades.c2, grade_c3: grades.c3, grade_c4: grades.c4, grade_c5: grades.c5,
                final_grade: total,
                annotations,
                ai_feedback: aiData
            });
            
            if(result.data) {
                alert("Correção enviada com sucesso!");
                onBack();
            } else {
                alert("Erro ao salvar: " + result.error);
            }
        });
    };

    const renderHighlightedText = () => {
        if (!essay?.content) return null;
        return <div className="whitespace-pre-wrap cursor-text" onMouseUp={handleTextMouseUp}>{essay.content}</div>;
    };

    if (!essay) return <div className="p-8 text-center animate-pulse">Carregando...</div>;

    return (
        <div className="relative min-h-screen pb-20">
            {popup && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setPopup(null)} />
                    <AnnotationPopup 
                        position={{ top: popup.y, left: popup.x }} 
                        onSave={handleSaveAnnotation} 
                        onClose={() => setPopup(null)} 
                    />
                </>
            )}

            <div className="flex justify-between items-center mb-4">
                <button onClick={onBack} className="text-royal-blue font-bold text-sm flex items-center gap-2 hover:underline">
                    <i className="fas fa-arrow-left"></i> Voltar
                </button>
                <button 
                    onClick={handleGenerateAI} 
                    disabled={isGeneratingAI}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-white transition-all shadow-md
                        ${isGeneratingAI ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:scale-105 active:scale-95'}`}
                >
                    {isGeneratingAI ? <i className="fas fa-spinner fa-spin animate-spin"></i> : <i className="fas fa-magic"></i>}
                    {isGeneratingAI ? 'Analisando...' : 'Gerar Análise com IA'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white dark:bg-dark-card p-8 rounded-xl shadow-sm border border-gray-200 dark:border-dark-border min-h-[600px]">
                    <h2 className="text-2xl font-bold mb-6 dark:text-white">{essay.title}</h2>
                    
                    <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed relative">
                         {renderHighlightedText()}
                         
                         {annotations.length > 0 && (
                             <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                 <p className="text-xs text-gray-400 font-bold uppercase">Anotações ({annotations.length})</p>
                                 <div className="flex flex-wrap gap-2 mt-2">
                                     {annotations.map((a, i) => (
                                         <span key={a.id} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border flex items-center gap-2">
                                             {a.selection?.substring(0, 15)}... 
                                             <button onClick={() => setAnnotations(p => p.filter(x => x.id !== a.id))} className="text-red-500 hover:text-red-700 text-sm font-bold">×</button>
                                         </span>
                                     ))}
                                 </div>
                             </div>
                         )}
                    </div>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-dark-border">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg dark:text-white">Avaliação</h3>
                            <span className={`text-2xl font-bold ${Object.values(grades).reduce((a,b)=>a+b,0) >= 600 ? 'text-green-600' : 'text-yellow-600'}`}>
                                {Object.values(grades).reduce((a,b)=>a+b,0)}
                            </span>
                        </div>
                        <div className="space-y-4">
                            {[1,2,3,4,5].map(i => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex justify-between text-sm dark:text-gray-300">
                                        <span>Competência {i}</span>
                                        <span className="font-bold">{grades[`c${i}` as keyof typeof grades]}</span>
                                    </div>
                                    <input 
                                        type="range" min="0" max="200" step="40" 
                                        value={grades[`c${i}` as keyof typeof grades]}
                                        onChange={e => setGrades(p => ({...p, [`c${i}`]: Number(e.target.value)}))}
                                        className="w-full accent-royal-blue cursor-pointer"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-dark-border">
                        <h3 className="font-bold text-lg mb-2 dark:text-white">Feedback Geral</h3>
                        <textarea 
                            className="w-full p-3 border rounded-lg text-sm dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-royal-blue outline-none"
                            rows={4}
                            placeholder="Pontos fortes, fracos e resumo..."
                            value={feedback}
                            onChange={e => setFeedback(e.target.value)}
                        />
                    </div>

                    <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-dark-border">
                         <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
                            <i className="fas fa-robot text-purple-500"></i> Detalhes da IA
                         </h3>
                         <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {aiData.detailed_feedback.map((item, i) => (
                                <div key={i} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-transparent focus-within:border-purple-400 transition-colors">
                                    <p className="text-xs font-bold text-gray-500 mb-1">{item.competency}</p>
                                    <textarea 
                                        className="w-full bg-transparent text-sm dark:text-white border-none p-0 focus:ring-0 resize-none"
                                        rows={3}
                                        value={item.feedback}
                                        onChange={e => {
                                            const newArr = [...aiData.detailed_feedback];
                                            newArr[i].feedback = e.target.value;
                                            setAiData(p => ({...p, detailed_feedback: newArr}));
                                        }}
                                        placeholder="Aguardando análise..."
                                    />
                                </div>
                            ))}
                         </div>
                    </div>

                    <button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting}
                        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Enviando...' : 'Finalizar Correção'}
                    </button>
                </div>
            </div>
        </div>
    );
}