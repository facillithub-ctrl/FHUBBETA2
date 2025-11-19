"use client";

import { useEffect, useState, useTransition, useRef, MouseEvent } from 'react';
import { Essay, getEssayDetails, submitCorrection, Annotation, AIFeedback } from '../actions';
import Image from 'next/image';

type EssayWithProfile = Essay & {
    profiles: { full_name: string | null } | null;
};

// Popup com a nova identidade visual e posicionamento corrigido
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
                className="w-full p-3 border rounded-lg text-sm mb-3 bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-[#42047e] outline-none resize-none"
                value={comment}
                onChange={e => setComment(e.target.value)}
                autoFocus
            />
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    {[
                        { id: 'erro', color: 'bg-red-500', label: 'Erro' },
                        { id: 'acerto', color: 'bg-[#07f49e]', label: 'Acerto' },
                        { id: 'sugestao', color: 'bg-[#42047e]', label: 'Sugestão' }
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
                    <button 
                        onClick={() => comment && onSave(comment, marker)} 
                        className="text-xs bg-[#42047e] text-white px-4 py-1.5 rounded-lg font-bold shadow-md hover:bg-[#2e0259] transition-colors"
                    >
                        Salvar
                    </button>
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
    const [popup, setPopup] = useState<{ x: number, y: number, selection?: string, position?: any } | null>(null);
    
    const [aiData, setAiData] = useState<AIFeedback>({
        detailed_feedback: Array(5).fill(null).map((_, i) => ({ competency: `Competência ${i+1}`, feedback: '' })),
        actionable_items: [],
        rewrite_suggestions: []
    });

    // Refs para manipulação de imagem
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const startCoords = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectionBox, setSelectionBox] = useState<{ x: number, y: number, width: number, height: number } | null>(null);

    useEffect(() => {
        getEssayDetails(essayId).then(res => {
            if (res.data) setEssay(res.data as EssayWithProfile);
        });
    }, [essayId]);

    // --- LÓGICA DE SELEÇÃO DE TEXTO ---
    const handleTextMouseUp = (e: MouseEvent) => {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed && selection.toString().trim().length > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            // Usa clientX/Y para position: fixed, garantindo que o popup apareça onde o mouse está
            setPopup({
                x: rect.left, 
                y: rect.bottom + 10, 
                selection: selection.toString()
            });
        }
    };

    // --- LÓGICA DE SELEÇÃO EM IMAGEM ---
    const handleImageMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        if (popup) { setPopup(null); return; }
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
            // Salva posição em porcentagem para ser responsivo
            const position = {
                x: (selectionBox.x / rect.width) * 100,
                y: (selectionBox.y / rect.height) * 100,
                width: (selectionBox.width / rect.width) * 100,
                height: (selectionBox.height / rect.height) * 100,
            };
            // Usa coordenadas da página para o popup
            setPopup({ x: e.clientX, y: e.clientY, position });
        }
        setSelectionBox(null);
    };

    // --- AÇÕES ---

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
        if (!essay?.content) return alert("Redação sem texto digitalizado para analisar.");
        setIsGeneratingAI(true);
        
        try {
            // Chama a API via fetch para evitar erro de dependência
            const response = await fetch('/api/generate-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: essay.content }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Erro na requisição');
            }

            setAiData(data);
            // Feedback visual sutil ao invés de alert intrusivo
            // (O ideal seria um toast, mas o alert serve para debug agora)
            alert("✨ Análise da IA gerada! Revise os campos abaixo.");
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
        // Visualização simplificada para o editor (texto selecionável)
        // As anotações feitas são mostradas na lista abaixo para não atrapalhar a seleção de novos trechos
        return <div className="whitespace-pre-wrap cursor-text outline-none" onMouseUp={handleTextMouseUp}>{essay.content}</div>;
    };

    if (!essay) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#42047e]"></div></div>;

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

            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="text-[#42047e] font-bold text-sm flex items-center gap-2 hover:underline">
                    <i className="fas fa-arrow-left"></i> Voltar
                </button>
                <button 
                    onClick={handleGenerateAI} 
                    disabled={isGeneratingAI}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white transition-all shadow-md
                        ${isGeneratingAI ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#42047e] to-[#6a0dad] hover:shadow-lg hover:scale-105 active:scale-95'}`}
                >
                    {isGeneratingAI ? <i className="fas fa-spinner fa-spin animate-spin"></i> : <i className="fas fa-robot"></i>}
                    {isGeneratingAI ? 'Analisando...' : 'Preencher com IA'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* ESQUERDA: Texto/Imagem (7 colunas) */}
                <div className="lg:col-span-7 bg-white dark:bg-dark-card p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-border min-h-[600px]">
                    <h2 className="text-2xl font-bold mb-2 dark:text-white">{essay.title}</h2>
                    <p className="text-sm text-gray-500 mb-6">Aluno: {essay.profiles?.full_name || 'Anônimo'}</p>
                    
                    <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed relative min-h-[400px]">
                         {essay.image_submission_url ? (
                             <div 
                                 ref={imageContainerRef}
                                 onMouseDown={handleImageMouseDown}
                                 onMouseMove={handleImageMouseMove}
                                 onMouseUp={handleImageMouseUp}
                                 className="relative w-full cursor-crosshair select-none"
                             >
                                 <Image src={essay.image_submission_url} alt="Redação" width={800} height={1000} className="w-full rounded-lg pointer-events-none" />
                                 {isDrawing && selectionBox && (
                                     <div className="absolute border-2 border-[#42047e] bg-[#42047e]/20" style={{ left: selectionBox.x, top: selectionBox.y, width: selectionBox.width, height: selectionBox.height }} />
                                 )}
                                 {/* Exibe anotações na imagem */}
                                 {annotations.filter(a => a.type === 'image').map(a => (
                                     <div 
                                         key={a.id} 
                                         className={`absolute border-2 cursor-pointer group ${a.marker === 'erro' ? 'border-red-500 bg-red-500/30' : a.marker === 'acerto' ? 'border-[#07f49e] bg-[#07f49e]/30' : 'border-[#42047e] bg-[#42047e]/30'}`}
                                         style={{ left: `${a.position!.x}%`, top: `${a.position!.y}%`, width: `${a.position!.width}%`, height: `${a.position!.height}%` }}
                                         onClick={() => removeAnnotation(a.id)}
                                     >
                                         <span className="absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">{a.comment}</span>
                                     </div>
                                 ))}
                             </div>
                         ) : (
                             renderHighlightedText()
                         )}
                    </div>

                    {/* Lista de Anotações de Texto */}
                    {annotations.length > 0 && !essay.image_submission_url && (
                        <div className="mt-8 pt-4 border-t dark:border-gray-700">
                            <h4 className="font-bold text-xs text-gray-400 uppercase mb-3">Anotações Realizadas</h4>
                            <div className="space-y-2">
                                {annotations.map((a, i) => (
                                    <div key={a.id} className="flex items-start justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm border border-gray-100 dark:border-gray-700">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-500 text-xs mb-1">"{a.selection?.substring(0, 30)}..."</span>
                                            <span className={`${a.marker === 'erro' ? 'text-red-600' : a.marker === 'acerto' ? 'text-[#07f49e]' : 'text-[#42047e]'}`}>
                                                {a.comment}
                                            </span>
                                        </div>
                                        <button onClick={() => removeAnnotation(a.id)} className="text-gray-400 hover:text-red-500 px-2">
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* DIREITA: Painel de Avaliação (5 colunas) */}
                <div className="lg:col-span-5 space-y-6">
                    
                    {/* Card de Notas */}
                    <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-border">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg dark:text-white">Avaliação</h3>
                            <div className="text-center">
                                <span className={`text-3xl font-black ${Object.values(grades).reduce((a,b)=>a+b,0) >= 600 ? 'text-[#07f49e]' : 'text-yellow-500'}`}>
                                    {Object.values(grades).reduce((a,b)=>a+b,0)}
                                </span>
                                <span className="block text-xs text-gray-400 font-bold uppercase">Pontos</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[1,2,3,4,5].map(i => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex justify-between text-sm dark:text-gray-300">
                                        <span className="font-medium">Competência {i}</span>
                                        <span className="font-bold">{grades[`c${i}` as keyof typeof grades]}</span>
                                    </div>
                                    <input 
                                        type="range" min="0" max="200" step="20" 
                                        value={grades[`c${i}` as keyof typeof grades]}
                                        onChange={e => setGrades(p => ({...p, [`c${i}`]: Number(e.target.value)}))}
                                        className="w-full accent-[#42047e] cursor-pointer"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Card de Feedback Geral */}
                    <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-border">
                        <h3 className="font-bold text-lg mb-2 dark:text-white">Feedback Geral</h3>
                        <textarea 
                            className="w-full p-3 border rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:ring-2 focus:ring-[#42047e] outline-none resize-y min-h-[100px]"
                            value={feedback}
                            onChange={e => setFeedback(e.target.value)}
                            placeholder="Escreva uma análise geral sobre o texto..."
                        />
                    </div>

                    {/* Card de IA Editável */}
                    <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-border">
                         <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
                            <i className="fas fa-robot text-[#42047e]"></i> Detalhes da IA
                         </h3>
                         <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {aiData.detailed_feedback.map((item, i) => (
                                <div key={i} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-transparent focus-within:border-[#42047e] transition-colors">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">{item.competency}</p>
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
                        className="w-full py-4 bg-[#07f49e] hover:bg-[#05d486] text-[#42047e] font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Enviando...' : 'Finalizar Correção'}
                    </button>
                </div>
            </div>
        </div>
    );
}