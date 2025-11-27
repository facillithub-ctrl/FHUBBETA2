"use client";

import { useEffect, useState, useTransition, useRef, MouseEvent, ReactNode } from 'react';
import { Essay, getEssayDetails, submitCorrection, Annotation, AIFeedback } from '../actions';
import Image from 'next/image';
import createClient from '@/utils/supabase/client';

// --- TIPOS ---

type EssayWithProfile = Essay & {
    profiles: { full_name: string | null } | null;
};

type CommonError = { id: string; error_type: string };

type AnnotationPopupProps = {
    position: { top: number; left: number };
    onSave: (comment: string, marker: Annotation['marker']) => void;
    onClose: () => void;
};

// Componente do Popup de Anotação (Posicionado Absolute no Body ou Container Relativo)
const AnnotationPopup = ({ position, onSave, onClose }: AnnotationPopupProps) => {
    const [comment, setComment] = useState('');
    const [marker, setMarker] = useState<Annotation['marker']>('sugestao');

    // Foca no textarea ao abrir
    const textRef = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        if (textRef.current) textRef.current.focus();
    }, []);

    const handleSave = () => {
        if (comment.trim()) {
            onSave(comment, marker);
        }
    };

    return (
        <div
            className="absolute z-50 bg-white dark:bg-dark-card shadow-xl rounded-lg p-3 w-72 border border-gray-200 dark:border-gray-600 animate-fade-in"
            style={{ top: position.top, left: position.left }}
            // Impede que o clique no popup feche o popup (propagação)
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Novo Comentário</span>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times"></i></button>
            </div>
            <textarea
                ref={textRef}
                placeholder="Digite seu comentário aqui..."
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 mb-3 focus:ring-2 focus:ring-royal-blue focus:outline-none"
            />
            <div className="flex justify-between items-center gap-2">
                <select
                    value={marker}
                    onChange={(e) => setMarker(e.target.value as Annotation['marker'])}
                    className="text-xs p-1.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 flex-1"
                >
                    <option value="sugestao">💡 Sugestão</option>
                    <option value="acerto">✅ Acerto</option>
                    <option value="erro">❌ Erro</option>
                </select>
                <button onClick={handleSave} className="text-xs bg-royal-blue text-white px-4 py-2 rounded-md font-bold hover:bg-blue-700">Salvar</button>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
export default function CorrectionInterface({ essayId, onBack }: { essayId: string; onBack: () => void }) {
    const [essay, setEssay] = useState<EssayWithProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const [feedback, setFeedback] = useState('');
    const [grades, setGrades] = useState({ c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 });
    const [isSubmitting, startTransition] = useTransition();
    
    const [commonErrors, setCommonErrors] = useState<CommonError[]>([]);
    const [selectedErrors, setSelectedErrors] = useState<Set<string>>(new Set());

    // Estado para Áudio
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isUploadingAudio, setIsUploadingAudio] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Estado para Anotações
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [popupState, setPopupState] = useState<{ visible: boolean; top: number; left: number; selectionText?: string; position?: Annotation['position'] }>({ visible: false, top: 0, left: 0 });
    
    // Refs para container de texto e imagem
    const textContainerRef = useRef<HTMLDivElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    // Estados para desenho na imagem
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectionBox, setSelectionBox] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
    const startCoords = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

    const [manualAIFeedback, setManualAIFeedback] = useState<AIFeedback>({
        detailed_feedback: Array(5).fill({ competency: '', feedback: '' }).map((_, i) => ({ competency: `Competência ${i + 1}`, feedback: '' })),
        actionable_items: [''],
        rewrite_suggestions: [],
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            const { data: errorsData } = await supabase.from('common_errors').select('id, error_type');
            setCommonErrors(errorsData || []);

            const result = await getEssayDetails(essayId);
            if (result.data) setEssay(result.data as EssayWithProfile);
            else setError(result.error || 'Erro ao carregar');
            setIsLoading(false);
        };
        fetchInitialData();
    }, [essayId, supabase]);

    // --- FUNÇÕES DE ANOTAÇÃO DE TEXTO ---
    
    const handleTextMouseUp = (e: MouseEvent<HTMLDivElement>) => {
        const selection = window.getSelection();
        
        // Verifica se há seleção válida dentro do container de texto
        if (selection && !selection.isCollapsed && selection.toString().trim() !== '' && textContainerRef.current?.contains(selection.anchorNode)) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            // Calcula posição relativa ao viewport + scroll para garantir que o popup apareça perto do texto
            // Adiciona um pequeno offset para não cobrir o texto
            setPopupState({ 
                visible: true, 
                left: rect.left + (rect.width / 2) - 100, // Centraliza horizontalmente (aprox)
                top: rect.bottom + window.scrollY + 10, // Abaixo da seleção
                selectionText: selection.toString() 
            });
        } else {
            // Se clicou e não selecionou nada, fecha o popup (a menos que o clique tenha sido NO popup, tratado no onMouseDown dele)
            // Nota: O evento onMouseDown do popup tem stopPropagation, então aqui é seguro fechar se chegar no container
            // Mas precisamos cuidado para não fechar imediatamente ao terminar de selecionar.
            // A lógica de fechar é melhor gerida por um botão de fechar ou clique fora específico.
        }
    };

    // --- FUNÇÕES DE ANOTAÇÃO DE IMAGEM ---

    const handleImageMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        if (popupState.visible) {
            setPopupState({ ...popupState, visible: false });
            return;
        }
        e.preventDefault(); // Evita drag da imagem
        setIsDrawing(true);
        const rect = imageContainerRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        startCoords.current = { x, y };
        setSelectionBox({ x, y, width: 0, height: 0 });
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
        if (selectionBox && (selectionBox.width > 10 || selectionBox.height > 10)) { // Mínimo de tamanho para evitar cliques acidentais
            const rect = imageContainerRef.current!.getBoundingClientRect();
            
            // Posição relativa em porcentagem para responsividade
            const position = {
                x: (selectionBox.x / rect.width) * 100,
                y: (selectionBox.y / rect.height) * 100,
                width: (selectionBox.width / rect.width) * 100,
                height: (selectionBox.height / rect.height) * 100,
            };

            // Posiciona o popup perto da caixa desenhada
            setPopupState({ 
                visible: true, 
                left: e.pageX, 
                top: e.pageY + 10, 
                position 
            });
        }
        setSelectionBox(null);
    };

    const handleSaveAnnotation = (comment: string, marker: Annotation['marker']) => {
        let newAnnotation: Annotation;
        
        if (popupState.selectionText) {
            newAnnotation = {
                id: crypto.randomUUID(),
                type: 'text',
                selection: popupState.selectionText,
                comment,
                marker,
            };
        } else if (popupState.position) {
            newAnnotation = {
                id: crypto.randomUUID(),
                type: 'image',
                position: popupState.position,
                comment,
                marker,
            };
        } else { return; }

        setAnnotations(prev => [...prev, newAnnotation]);
        setPopupState({ ...popupState, visible: false, selectionText: undefined, position: undefined });
        
        // Limpa seleção de texto do navegador
        if (window.getSelection) {
            window.getSelection()?.removeAllRanges();
        }
    };

    // ... (Lógica de Gravação de Áudio e Upload mantém-se igual à anterior) ...
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                audioChunksRef.current = [];
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch { alert("Erro ao acessar microfone."); }
    };
    const stopRecording = () => { mediaRecorderRef.current?.stop(); setIsRecording(false); };
    const uploadAudio = async () => {
        if (!audioBlob) return null;
        setIsUploadingAudio(true);
        const { data: { user } } = await supabase.auth.getUser();
        const filePath = `audio-feedbacks/${user?.id}/${essayId}-${Date.now()}.webm`;
        const { error } = await supabase.storage.from('audio_feedbacks').upload(filePath, audioBlob);
        if (error) { setIsUploadingAudio(false); return null; }
        const { data } = supabase.storage.from('audio_feedbacks').getPublicUrl(filePath);
        setIsUploadingAudio(false);
        return data.publicUrl;
    };

    const handleSubmit = async () => {
        const final_grade = Object.values(grades).reduce((a, b) => a + b, 0);
        if (!feedback) return alert("Adicione um feedback geral.");
        
        startTransition(async () => {
            let url = null;
            if (audioBlob) url = await uploadAudio();
            
            const result = await submitCorrection({
                essay_id: essayId, feedback, grade_c1: grades.c1, grade_c2: grades.c2, grade_c3: grades.c3, grade_c4: grades.c4, grade_c5: grades.c5,
                final_grade, audio_feedback_url: url, annotations, ai_feedback: manualAIFeedback,
            });

            if (!result.error) {
                alert('Correção enviada!');
                onBack();
            } else {
                alert('Erro ao enviar: ' + result.error);
            }
        });
    };

    // Renderização do texto com anotações já salvas
    const renderAnnotatedText = (text: string) => {
        // Esta é uma implementação simplificada. Para destacar múltiplas ocorrências da mesma palavra corretamente,
        // seria necessário um algoritmo mais complexo baseado em índices de range.
        // Esta versão assume substituição global para visualização rápida.
        
        const textAnnotations = annotations.filter(a => a.type === 'text');
        if (!textAnnotations.length) return <div className="whitespace-pre-wrap">{text}</div>;

        let parts: (string | ReactNode)[] = [text];
        
        textAnnotations.forEach((anno) => {
            const newParts: (string | ReactNode)[] = [];
            parts.forEach(part => {
                if (typeof part !== 'string') {
                    newParts.push(part);
                    return;
                }
                // Divide a string pela seleção da anotação
                // Nota: Isso destaca TODAS as ocorrências da string selecionada. 
                const split = part.split(anno.selection!);
                split.forEach((str, idx) => {
                    newParts.push(str);
                    if (idx < split.length - 1) {
                        newParts.push(
                            <mark key={`${anno.id}-${idx}`} className="bg-yellow-200 dark:bg-yellow-900 cursor-pointer relative group rounded px-1">
                                {anno.selection}
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-48 bg-black text-white text-xs p-2 rounded hidden group-hover:block z-50">
                                    {anno.comment}
                                </span>
                            </mark>
                        );
                    }
                });
            });
            parts = newParts;
        });

        return <div className="whitespace-pre-wrap leading-relaxed">{parts}</div>;
    };

    if (isLoading || !essay) return <div className="p-8 text-center">Carregando...</div>;

    return (
        <div className="relative">
            {/* POPUP DE ANOTAÇÃO */}
            {popupState.visible && (
                <AnnotationPopup
                    position={{ top: popupState.top, left: popupState.left }}
                    onSave={handleSaveAnnotation}
                    onClose={() => setPopupState(prev => ({ ...prev, visible: false }))}
                />
            )}

            <div className="flex justify-between items-center mb-4">
                <button onClick={onBack} className="text-sm text-gray-600 hover:text-royal-blue flex items-center gap-2"><i className="fas fa-arrow-left"></i> Voltar</button>
                <h2 className="font-bold text-xl">Corrigindo: {essay.title}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* COLUNA DA REDAÇÃO (TEXTO OU IMAGEM) */}
                <div className="bg-white dark:bg-dark-card p-4 rounded-lg shadow border dark:border-gray-700 relative min-h-[500px]">
                    {essay.image_submission_url ? (
                        <div
                            ref={imageContainerRef}
                            onMouseDown={handleImageMouseDown}
                            onMouseMove={handleImageMouseMove}
                            onMouseUp={handleImageMouseUp}
                            className="relative w-full h-full cursor-crosshair select-none"
                        >
                            <Image src={essay.image_submission_url} alt="Redação" width={800} height={1000} className="w-full h-auto rounded" draggable={false} />
                            
                            {/* Caixa de Seleção em Tempo Real */}
                            {isDrawing && selectionBox && (
                                <div className="absolute border-2 border-royal-blue bg-royal-blue/20" style={{ left: selectionBox.x, top: selectionBox.y, width: selectionBox.width, height: selectionBox.height, pointerEvents: 'none' }} />
                            )}

                            {/* Anotações Salvas na Imagem */}
                            {annotations.filter(a => a.type === 'image').map(a => (
                                <div key={a.id} className="absolute border-2 border-yellow-500 bg-yellow-500/20 group" style={{ left: `${a.position!.x}%`, top: `${a.position!.y}%`, width: `${a.position!.width}%`, height: `${a.position!.height}%` }}>
                                    <div className="absolute -top-8 left-0 bg-black text-white text-xs p-1 rounded hidden group-hover:block z-10 whitespace-nowrap">{a.comment}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div 
                            ref={textContainerRef}
                            onMouseUp={handleTextMouseUp}
                            className="prose dark:prose-invert max-w-none p-2 cursor-text"
                        >
                            {renderAnnotatedText(essay.content || '')}
                        </div>
                    )}
                </div>

                {/* COLUNA DE FERRAMENTAS DE CORREÇÃO */}
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg h-fit space-y-6">
                    
                    {/* Notas */}
                    <div>
                        <h3 className="font-bold mb-3">Atribuir Notas (0-200)</h3>
                        <div className="grid grid-cols-5 gap-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i}>
                                    <label className="block text-xs text-center mb-1 text-gray-500">C{i}</label>
                                    <input 
                                        type="number" min="0" max="200" step="20"
                                        value={grades[`c${i}` as keyof typeof grades]}
                                        onChange={(e) => setGrades({...grades, [`c${i}`]: Number(e.target.value)})}
                                        className="w-full p-1 text-center border rounded dark:bg-gray-700"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 text-right font-bold text-lg text-royal-blue">
                            Total: {Object.values(grades).reduce((a, b) => a + b, 0)}
                        </div>
                    </div>

                    {/* Erros Comuns */}
                    <div>
                        <h3 className="font-bold mb-2 text-sm">Tags de Erros</h3>
                        <div className="flex flex-wrap gap-2">
                            {commonErrors.map(err => (
                                <button 
                                    key={err.id} 
                                    onClick={() => {
                                        const newSet = new Set(selectedErrors);
                                        newSet.has(err.id) ? newSet.delete(err.id) : newSet.add(err.id);
                                        setSelectedErrors(newSet);
                                    }}
                                    className={`text-xs px-2 py-1 rounded-full border ${selectedErrors.has(err.id) ? 'bg-royal-blue text-white' : 'bg-white dark:bg-gray-700'}`}
                                >
                                    {err.error_type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Feedback Geral */}
                    <div>
                        <h3 className="font-bold mb-2">Feedback Geral</h3>
                        <textarea 
                            rows={5} 
                            value={feedback} 
                            onChange={e => setFeedback(e.target.value)}
                            className="w-full p-3 border rounded-md dark:bg-gray-700 focus:ring-2 focus:ring-royal-blue focus:outline-none"
                            placeholder="Escreva uma análise construtiva..."
                        />
                        
                        {/* Gravador de Áudio */}
                        <div className="mt-3 flex items-center gap-3">
                             {!isRecording && !audioUrl && (
                                <button onClick={startRecording} className="flex items-center gap-2 text-sm text-gray-600 bg-white border px-3 py-1.5 rounded hover:bg-gray-50">
                                    <i className="fas fa-microphone text-red-500"></i> Gravar Áudio
                                </button>
                             )}
                             {isRecording && (
                                <button onClick={stopRecording} className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded animate-pulse">
                                    <i className="fas fa-stop"></i> Parar (Gravando...)
                                </button>
                             )}
                             {audioUrl && (
                                 <div className="flex items-center gap-2 w-full bg-white p-2 rounded border">
                                     <audio src={audioUrl} controls className="h-8 w-full" />
                                     <button onClick={() => { setAudioBlob(null); setAudioUrl(null); }} className="text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button>
                                 </div>
                             )}
                        </div>
                    </div>

                    {/* Ações Finais */}
                    <button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting || isUploadingAudio}
                        className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-lg"
                    >
                        {isSubmitting ? 'Enviando...' : 'Finalizar Correção'}
                    </button>

                </div>
            </div>
        </div>
    );
}