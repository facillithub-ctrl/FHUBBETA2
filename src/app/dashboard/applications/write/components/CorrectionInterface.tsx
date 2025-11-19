"use client";

import { useEffect, useState, useTransition, useRef, MouseEvent, ReactNode } from 'react';
import { Essay, getEssayDetails, submitCorrection, Annotation, AIFeedback } from '../actions';
import Image from 'next/image';
import createClient from '@/utils/supabase/client';

type EssayWithProfile = Essay & {
    profiles: { full_name: string | null } | null;
};

type AnnotationPopupProps = {
    position: { top: number; left: number };
    onSave: (comment: string, marker: Annotation['marker']) => void;
    onClose: () => void;
};

const AnnotationPopup = ({ position, onSave, onClose }: AnnotationPopupProps) => {
    const [comment, setComment] = useState('');
    const [marker, setMarker] = useState<Annotation['marker']>('sugestao');

    const handleSave = () => {
        if (comment.trim()) {
            onSave(comment, marker);
        }
    };

    return (
        <div
            className="absolute z-50 bg-white dark:bg-dark-card shadow-xl rounded-lg p-3 w-64 border dark:border-dark-border"
            style={{ top: position.top, left: position.left }}
            onMouseDown={(e) => e.stopPropagation()} 
        >
            <textarea
                placeholder="Comentário..."
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-2 focus:ring-2 focus:ring-royal-blue outline-none"
                autoFocus
            />
            <div className="flex justify-between items-center">
                <select
                    value={marker}
                    onChange={(e) => setMarker(e.target.value as Annotation['marker'])}
                    className="text-xs p-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none"
                >
                    <option value="sugestao">Sugestão</option>
                    <option value="acerto">Acerto</option>
                    <option value="erro">Erro</option>
                </select>
                <div className="flex gap-1">
                    <button onClick={onClose} className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700 dark:text-gray-400">Cancelar</button>
                    <button onClick={handleSave} className="text-xs bg-royal-blue text-white px-3 py-1 rounded-md font-bold hover:bg-blue-700">Salvar</button>
                </div>
            </div>
        </div>
    );
};

export default function CorrectionInterface({ essayId, onBack }: { essayId: string; onBack: () => void }) {
    const [essay, setEssay] = useState<EssayWithProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [feedback, setFeedback] = useState('');
    const [grades, setGrades] = useState({ c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 });
    const [isSubmitting, startTransition] = useTransition();
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [popupState, setPopupState] = useState<{ visible: boolean; x: number; y: number; selectionText?: string; position?: any }>({ visible: false, x: 0, y: 0 });
    
    const [manualAIFeedback, setManualAIFeedback] = useState<AIFeedback>({
        detailed_feedback: Array(5).fill({ competency: '', feedback: '' }).map((_, i) => ({ competency: `Competência ${i+1}`, feedback: '' })),
        actionable_items: [''],
        rewrite_suggestions: [],
    });

    const [isDrawing, setIsDrawing] = useState(false);
    const [selectionBox, setSelectionBox] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const startCoords = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

    useEffect(() => {
        getEssayDetails(essayId).then(res => {
            if (res.data) setEssay(res.data as EssayWithProfile);
            setIsLoading(false);
        });
    }, [essayId]);

    // --- LÓGICA DE SELEÇÃO DE TEXTO ---
    const handleTextMouseUp = () => {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed && selection.toString().trim() !== '') {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            const scrollX = window.scrollX;
            const scrollY = window.scrollY;

            setPopupState({ 
                visible: true, 
                x: rect.left + scrollX, 
                y: rect.bottom + scrollY + 5, 
                selectionText: selection.toString() 
            });
        } else {
             setPopupState(prev => prev.visible ? { ...prev, visible: false } : prev);
        }
    };

    // --- LÓGICA DE IMAGEM ---
    const handleImageMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        if (popupState.visible) {
            setPopupState(prev => ({ ...prev, visible: false }));
            return;
        }
        setIsDrawing(true);
        const rect = imageContainerRef.current!.getBoundingClientRect();
        startCoords.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        setSelectionBox({ x: startCoords.current.x, y: startCoords.current.y, width: 0, height: 0 });
    };

    const handleImageMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!isDrawing) return;
        const rect = imageContainerRef.current!.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        const x = Math.min(startCoords.current.x, currentX);
        const y = Math.min(startCoords.current.y, currentY);
        const width = Math.abs(currentX - startCoords.current.x);
        const height = Math.abs(currentY - startCoords.current.y);
        setSelectionBox({ x, y, width, height });
    };

    const handleImageMouseUp = (e: MouseEvent<HTMLDivElement>) => {
        setIsDrawing(false);
        if (selectionBox && (selectionBox.width > 10 || selectionBox.height > 10)) {
            const rect = imageContainerRef.current!.getBoundingClientRect();
            const position = {
                x: (selectionBox.x / rect.width) * 100,
                y: (selectionBox.y / rect.height) * 100,
                width: (selectionBox.width / rect.width) * 100,
                height: (selectionBox.height / rect.height) * 100,
            };
            setPopupState({ visible: true, x: e.pageX, y: e.pageY, position });
        }
        setSelectionBox(null);
    };

    const handleSaveAnnotation = (comment: string, marker: Annotation['marker']) => {
        const newAnnotation: Annotation = {
            id: crypto.randomUUID(),
            type: popupState.selectionText ? 'text' : 'image',
            comment,
            marker,
            selection: popupState.selectionText,
            position: popupState.position
        };
        setAnnotations(prev => [...prev, newAnnotation]);
        setPopupState({ visible: false, x: 0, y: 0 });
        window.getSelection()?.removeAllRanges();
    };

    const removeAnnotation = (id: string) => {
        if (confirm("Remover esta anotação?")) {
            setAnnotations(prev => prev.filter(a => a.id !== id));
        }
    };

    const handleGenerateAI = async () => {
        if (!essay?.content) return alert("Não há texto para analisar.");
        setIsGeneratingAI(true);
        try {
            const res = await fetch('/api/generate-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: essay.content }),
            });
            
            const data = await res.json();

            if (!res.ok) {
                // Agora mostramos a mensagem exata do erro (ex: "Chave de API não configurada")
                throw new Error(data.error || `Erro ${res.status}`);
            }
            
            setManualAIFeedback(data);
            alert("Feedback gerado com sucesso! Revise os campos abaixo.");
        } catch (error: any) {
            console.error(error);
            alert(`Falha ao gerar feedback: ${error.message}`);
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleSubmit = () => {
        const total = Object.values(grades).reduce((a, b) => a + b, 0);
        if (!feedback) return alert("Adicione um feedback geral.");

        startTransition(async () => {
            const result = await submitCorrection({
                essay_id: essayId,
                feedback,
                grade_c1: grades.c1,
                grade_c2: grades.c2,
                grade_c3: grades.c3,
                grade_c4: grades.c4,
                grade_c5: grades.c5,
                final_grade: total,
                annotations,
                ai_feedback: manualAIFeedback
            });

            if (result.data) {
                alert("Correção enviada!");
                onBack();
            } else {
                alert(`Erro: ${result.error}`);
            }
        });
    };

    const renderAnnotatedText = () => {
        if (!essay?.content) return null;
        const textAnnotations = annotations.filter(a => a.type === 'text' && a.selection);
        if (textAnnotations.length === 0) return <div className="whitespace-pre-wrap">{essay.content}</div>;

        let parts: (string | ReactNode)[] = [essay.content];

        textAnnotations.forEach((anno) => {
            const newParts: (string | ReactNode)[] = [];
            parts.forEach(part => {
                if (typeof part === 'string') {
                    const index = part.indexOf(anno.selection!);
                    if (index !== -1) {
                        const before = part.substring(0, index);
                        const match = part.substring(index, index + anno.selection!.length);
                        const after = part.substring(index + anno.selection!.length);
                        
                        if (before) newParts.push(before);
                        newParts.push(
                            <span 
                                key={anno.id} 
                                className={`cursor-pointer border-b-2 ${anno.marker === 'erro' ? 'border-red-500 bg-red-100 dark:bg-red-900/30' : anno.marker === 'acerto' ? 'border-green-500 bg-green-100 dark:bg-green-900/30' : 'border-blue-500 bg-blue-100 dark:bg-blue-900/30'} relative group`}
                                onClick={() => removeAnnotation(anno.id)}
                            >
                                {match}
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max max-w-xs px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity">
                                    {anno.comment}
                                </span>
                            </span>
                        );
                        if (after) newParts.push(after);
                    } else {
                        newParts.push(part);
                    }
                } else {
                    newParts.push(part);
                }
            });
            parts = newParts;
        });

        return <div className="whitespace-pre-wrap">{parts}</div>;
    };

    if (isLoading) return <div className="p-8 text-center">Carregando...</div>;
    if (!essay) return <div className="p-8 text-center">Redação não encontrada.</div>;

    return (
        <div className="relative min-h-screen">
            {popupState.visible && (
                <AnnotationPopup 
                    position={{ top: popupState.y, left: popupState.x }} 
                    onSave={handleSaveAnnotation} 
                    onClose={() => setPopupState(prev => ({ ...prev, visible: false }))} 
                />
            )}
            
            <button onClick={onBack} className="mb-4 text-sm text-royal-blue font-bold flex items-center gap-2"><i className="fas fa-arrow-left"></i> Voltar</button>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Área da Redação */}
                <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow border dark:border-dark-border">
                    <h2 className="text-xl font-bold mb-2 dark:text-white">{essay.title}</h2>
                    <p className="text-sm text-gray-500 mb-4">Aluno: {essay.profiles?.full_name || 'Anônimo'}</p>
                    
                    {essay.image_submission_url ? (
                        <div 
                            ref={imageContainerRef}
                            onMouseDown={handleImageMouseDown}
                            onMouseMove={handleImageMouseMove}
                            onMouseUp={handleImageMouseUp}
                            className="relative w-full cursor-crosshair select-none"
                        >
                            <Image src={essay.image_submission_url} alt="Redação" width={800} height={1000} className="w-full rounded-md pointer-events-none" />
                            
                            {isDrawing && selectionBox && (
                                <div className="absolute border-2 border-royal-blue bg-royal-blue/20" style={{ left: selectionBox.x, top: selectionBox.y, width: selectionBox.width, height: selectionBox.height }} />
                            )}

                            {annotations.filter(a => a.type === 'image').map(a => (
                                <div 
                                    key={a.id} 
                                    className={`absolute border-2 cursor-pointer group ${a.marker === 'erro' ? 'border-red-500 bg-red-500/20' : a.marker === 'acerto' ? 'border-green-500 bg-green-500/20' : 'border-blue-500 bg-blue-500/20'}`}
                                    style={{ left: `${a.position!.x}%`, top: `${a.position!.y}%`, width: `${a.position!.width}%`, height: `${a.position!.height}%` }}
                                    onClick={() => removeAnnotation(a.id)}
                                >
                                    <span className="absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {a.comment}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div 
                            onMouseUp={handleTextMouseUp} 
                            className="prose dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md min-h-[500px]"
                        >
                            {renderAnnotatedText()}
                        </div>
                    )}
                </div>

                {/* Painel de Avaliação */}
                <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow border dark:border-dark-border space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg dark:text-white">Avaliação</h3>
                        <div className="text-2xl font-bold text-royal-blue">{Object.values(grades).reduce((a,b)=>a+b,0)}</div>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                        {[1,2,3,4,5].map(i => (
                            <div key={i}>
                                <label className="block text-xs font-bold mb-1 dark:text-gray-400">C{i}</label>
                                <input 
                                    type="number" step="20" min="0" max="200" 
                                    value={grades[`c${i}` as keyof typeof grades]}
                                    onChange={(e) => setGrades(p => ({ ...p, [`c${i}`]: Number(e.target.value) }))}
                                    className="w-full p-1 border rounded text-center dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1 dark:text-gray-300">Feedback Geral</label>
                        <textarea 
                            rows={5} 
                            value={feedback} 
                            onChange={(e) => setFeedback(e.target.value)}
                            className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            placeholder="Escreva sua avaliação..."
                        />
                    </div>

                    <div className="border-t dark:border-gray-700 pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg dark:text-white">Feedback IA</h3>
                            <button 
                                onClick={handleGenerateAI} 
                                disabled={isGeneratingAI || !essay.content}
                                className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1"
                            >
                                {isGeneratingAI ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-robot"></i>}
                                {isGeneratingAI ? 'Gerando...' : 'Gerar com IA'}
                            </button>
                        </div>

                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                            {manualAIFeedback.detailed_feedback.map((item, i) => (
                                <div key={i}>
                                    <label className="text-xs font-bold dark:text-gray-400">{item.competency}</label>
                                    <textarea 
                                        rows={2}
                                        value={item.feedback}
                                        onChange={(e) => {
                                            const newFeed = [...manualAIFeedback.detailed_feedback];
                                            newFeed[i].feedback = e.target.value;
                                            setManualAIFeedback(p => ({ ...p, detailed_feedback: newFeed }));
                                        }}
                                        className="w-full p-2 border rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting}
                        className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                        {isSubmitting ? 'Enviando...' : 'Finalizar Correção'}
                    </button>
                </div>
            </div>
        </div>
    );
}