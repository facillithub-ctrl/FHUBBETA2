"use client";

import { useEffect, useState, useTransition, useRef, MouseEvent } from 'react';
import { Essay, getEssayDetails, submitCorrection, Annotation, AIFeedback } from '../actions';
import Image from 'next/image';

type EssayWithProfile = Essay & {
    profiles: { full_name: string | null } | null;
};

// Popup com posição fixa para garantir visibilidade
const AnnotationPopup = ({ position, onSave, onClose }: { 
    position: { top: number; left: number }; 
    onSave: (comment: string, marker: Annotation['marker']) => void; 
    onClose: () => void; 
}) => {
    const [comment, setComment] = useState('');
    const [marker, setMarker] = useState<Annotation['marker']>('sugestao');

    return (
        <div
            className="fixed z-[9999] bg-white dark:bg-dark-card shadow-2xl rounded-lg p-3 w-72 border border-gray-200 dark:border-dark-border animate-fade-in"
            style={{ top: position.top, left: position.left }}
            onMouseDown={e => e.stopPropagation()}
        >
            <textarea
                placeholder="Escreva seu comentário..."
                rows={3}
                className="w-full p-2 border rounded text-sm mb-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-royal-blue outline-none"
                value={comment}
                onChange={e => setComment(e.target.value)}
                autoFocus
            />
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <button 
                        onClick={() => setMarker('erro')} 
                        className={`w-6 h-6 rounded-full bg-red-500 border-2 ${marker === 'erro' ? 'border-black dark:border-white' : 'border-transparent'}`} 
                        title="Erro"
                    />
                    <button 
                        onClick={() => setMarker('acerto')} 
                        className={`w-6 h-6 rounded-full bg-green-500 border-2 ${marker === 'acerto' ? 'border-black dark:border-white' : 'border-transparent'}`} 
                        title="Acerto"
                    />
                    <button 
                        onClick={() => setMarker('sugestao')} 
                        className={`w-6 h-6 rounded-full bg-blue-500 border-2 ${marker === 'sugestao' ? 'border-black dark:border-white' : 'border-transparent'}`} 
                        title="Sugestão"
                    />
                </div>
                <div className="flex gap-2">
                    <button onClick={onClose} className="text-xs text-gray-500 hover:text-gray-700">Cancelar</button>
                    <button onClick={() => comment && onSave(comment, marker)} className="text-xs bg-royal-blue text-white px-3 py-1 rounded font-bold">Salvar</button>
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
    
    // Anotações e Popup
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
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

    // Evento ao soltar o mouse no texto
    const handleTextMouseUp = (e: MouseEvent) => {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed && selection.toString().trim().length > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            // Usa coordenadas do mouse ou do retângulo, mas com posição fixa
            setPopup({
                x: e.clientX, // Posição X do mouse na tela
                y: rect.bottom + 10, // Logo abaixo da seleção
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
            alert("Análise da IA concluída com sucesso!");
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
                alert("Correção enviada!");
                onBack();
            } else {
                alert("Erro ao salvar: " + result.error);
            }
        });
    };

    // Renderiza texto com marcações (Highlighter)
    const renderHighlightedText = () => {
        if (!essay?.content) return null;
        const textAnnos = annotations.filter(a => a.type === 'text');
        if (textAnnos.length === 0) return <div className="whitespace-pre-wrap">{essay.content}</div>;

        // Lógica simplificada de replace para exibição (em produção usaríamos uma lib de highlight mais robusta)
        let content = essay.content;
        // Nota: Esta é uma visualização simplificada para o editor. O ideal é usar dangerouslySetInnerHTML com cuidado
        // ou uma abordagem de split/join mais complexa se houver muitas anotações sobrepostas.
        
        return (
            <div className="whitespace-pre-wrap relative" onMouseUp={handleTextMouseUp}>
                {content}
                {/* Sobreposição visual das anotações não é trivial em textarea/div puro sem libs.
                    Para este exemplo funcionar bem, vamos confiar no popup aparecendo na seleção.
                    A visualização das anotações FEITAS aparecerá na 'Visualização da Correção' ou 
                    podemos listar abaixo. */}
            </div>
        );
    };

    if (!essay) return <div className="p-8 text-center">Carregando...</div>;

    return (
        <div className="relative min-h-screen pb-20">
            {/* Popup Flutuante */}
            {popup && (
                <div className="fixed inset-0 z-40" onClick={() => setPopup(null)}>
                    <AnnotationPopup 
                        position={{ top: popup.y, left: popup.x }} 
                        onSave={handleSaveAnnotation} 
                        onClose={() => setPopup(null)} 
                    />
                </div>
            )}

            <div className="flex justify-between items-center mb-4">
                <button onClick={onBack} className="text-royal-blue font-bold text-sm flex items-center gap-2">
                    <i className="fas fa-arrow-left"></i> Voltar
                </button>
                <button 
                    onClick={handleGenerateAI} 
                    disabled={isGeneratingAI}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-white transition-all ${isGeneratingAI ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg'}`}
                >
                    {isGeneratingAI ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
                    {isGeneratingAI ? 'Analisando...' : 'Gerar Análise IA'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Coluna da Esquerda: Texto/Imagem (7 colunas) */}
                <div className="lg:col-span-7 bg-white dark:bg-dark-card p-8 rounded-xl shadow-sm border border-gray-200 dark:border-dark-border min-h-[600px]">
                    <h2 className="text-2xl font-bold mb-6 dark:text-white">{essay.title}</h2>
                    
                    {essay.image_submission_url ? (
                        <div className="relative">
                             <Image src={essay.image_submission_url} alt="Redação" width={800} height={1000} className="w-full rounded" />
                             {/* Aqui entraria a lógica de clique na imagem para anotação */}
                        </div>
                    ) : (
                        <div 
                            className="prose dark:prose-invert max-w-none text-lg leading-relaxed"
                            onMouseUp={handleTextMouseUp}
                        >
                            {/* Renderização simples para permitir seleção. As anotações são salvas no estado. */}
                            <div className="whitespace-pre-wrap">{essay.content}</div>
                        </div>
                    )}
                    
                    {/* Lista de Anotações Feitas */}
                    {annotations.length > 0 && (
                        <div className="mt-8 pt-4 border-t dark:border-gray-700">
                            <h4 className="font-bold text-sm text-gray-500 mb-2">Anotações Realizadas ({annotations.length})</h4>
                            <div className="flex flex-wrap gap-2">
                                {annotations.map((a, i) => (
                                    <span key={a.id} className={`text-xs px-2 py-1 rounded border flex items-center gap-2 ${a.marker === 'erro' ? 'bg-red-50 border-red-200 text-red-700' : a.marker === 'acerto' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                                        #{i+1} {a.comment.substring(0, 20)}...
                                        <button onClick={() => setAnnotations(prev => prev.filter(x => x.id !== a.id))} className="hover:text-black"><i className="fas fa-times"></i></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Coluna da Direita: Avaliação (5 colunas) */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Notas */}
                    <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-dark-border">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg dark:text-white">Competências</h3>
                            <span className="text-2xl font-bold text-royal-blue">{Object.values(grades).reduce((a,b)=>a+b,0)}</span>
                        </div>
                        <div className="space-y-3">
                            {[1,2,3,4,5].map(i => (
                                <div key={i} className="flex items-center gap-4">
                                    <label className="text-sm font-medium w-32 dark:text-gray-300">Competência {i}</label>
                                    <input 
                                        type="range" min="0" max="200" step="20" 
                                        value={grades[`c${i}` as keyof typeof grades]}
                                        onChange={e => setGrades(p => ({...p, [`c${i}`]: Number(e.target.value)}))}
                                        className="flex-1 accent-royal-blue"
                                    />
                                    <span className="w-10 text-right font-bold text-sm dark:text-white">{grades[`c${i}` as keyof typeof grades]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feedback Geral */}
                    <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-dark-border">
                        <h3 className="font-bold text-lg mb-2 dark:text-white">Feedback Geral</h3>
                        <textarea 
                            className="w-full p-3 border rounded-lg text-sm dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-royal-blue outline-none"
                            rows={4}
                            placeholder="Escreva um comentário geral sobre o texto..."
                            value={feedback}
                            onChange={e => setFeedback(e.target.value)}
                        />
                    </div>

                    {/* Feedback IA Editável */}
                    <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-dark-border">
                         <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
                            <i className="fas fa-robot text-purple-500"></i> Detalhes da IA
                         </h3>
                         <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {aiData.detailed_feedback.map((item, i) => (
                                <div key={i} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
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
                        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
                    >
                        {isSubmitting ? 'Enviando...' : 'Finalizar Correção'}
                    </button>
                </div>
            </div>
        </div>
    );
}