"use client";

import { useEffect, useState, useTransition, useRef, MouseEvent, ReactNode } from 'react';
import { Essay, getEssayDetails, submitCorrection, Annotation, AIFeedback, checkForPlagiarism } from '../actions';
import Image from 'next/image';
import createClient from '@/utils/supabase/client';
import { VerificationBadge } from '@/components/VerificationBadge';

type EssayWithProfile = Essay & {
    profiles: { full_name: string | null } | null;
};

type CommonError = { id: string; error_type: string };

// --- COMPONENTE POPUP DE ANOTAÇÃO ---
type AnnotationPopupProps = {
    position: { top: number; left: number };
    onSave: (comment: string, marker: Annotation['marker']) => void;
    onClose: () => void;
};

const AnnotationPopup = ({ position, onSave, onClose }: AnnotationPopupProps) => {
    const [comment, setComment] = useState('');
    const [marker, setMarker] = useState<Annotation['marker']>('sugestao');

    const handleSave = () => {
        if (comment.trim()) onSave(comment, marker);
    };

    return (
        <div
            className="fixed z-50 bg-white dark:bg-dark-card shadow-2xl rounded-xl p-4 w-72 border border-gray-200 dark:border-dark-border animate-in fade-in zoom-in-95 duration-200"
            style={{ top: position.top, left: position.left }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Novo Comentário</h4>
                <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors"><i className="fas fa-times"></i></button>
            </div>
            
            <textarea
                placeholder="Digite seu comentário..."
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#42047e] focus:outline-none mb-3 resize-none"
                autoFocus
            />
            
            <div className="flex justify-between items-center gap-2">
                <select
                    value={marker}
                    onChange={(e) => setMarker(e.target.value as Annotation['marker'])}
                    className="text-xs p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer flex-1"
                >
                    <option value="sugestao">💡 Sugestão</option>
                    <option value="acerto">✅ Acerto</option>
                    <option value="erro">❌ Erro</option>
                </select>
                <button 
                    onClick={handleSave} 
                    className="text-xs bg-[#42047e] hover:bg-[#360368] text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-md"
                >
                    Salvar
                </button>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
export default function CorrectionInterface({ essayId, onBack }: { essayId: string; onBack: () => void }) {
    const [essay, setEssay] = useState<EssayWithProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    // Estados de Correção
    const [feedback, setFeedback] = useState('');
    const [grades, setGrades] = useState({ c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 });
    const [isSubmitting, startTransition] = useTransition();
    const [plagiarismResult, setPlagiarismResult] = useState<{ similarity: number, source?: string } | null>(null);
    const [checkingPlagiarism, setCheckingPlagiarism] = useState(false);

    // Estados de Multimídia
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Estados de Anotação
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [popupState, setPopupState] = useState<{ visible: boolean; x: number; y: number; selectionText?: string; position?: Annotation['position'] }>({ visible: false, x: 0, y: 0 });
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false); // Para seleção em imagem (futuro box selection)

    // Inicialização
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            const result = await getEssayDetails(essayId);
            if (result.data) {
                setEssay(result.data as EssayWithProfile);
            }
            setIsLoading(false);
        };
        fetchInitialData();
    }, [essayId]);

    // --- HANDLERS DE NOTA ---
    const handleGradeChange = (c: keyof typeof grades, value: string) => {
        let num = parseInt(value, 10);
        if (isNaN(num)) num = 0;
        if (num > 200) num = 200;
        if (num < 0) num = 0;
        // Arredonda para múltiplos de 20 ou 40 se desejar, mas deixaremos livre por enquanto
        setGrades(prev => ({ ...prev, [c]: num }));
    };

    const totalGrade = Object.values(grades).reduce((a, b) => a + b, 0);

    // --- HANDLERS DE PLÁGIO ---
    const handleCheckPlagiarism = async () => {
        if (!essay?.content) return;
        setCheckingPlagiarism(true);
        const res = await checkForPlagiarism(essay.content);
        if (res.data) {
            setPlagiarismResult({ 
                similarity: res.data.similarity_percentage, 
                source: res.data.matches[0]?.source 
            });
        }
        setCheckingPlagiarism(false);
    };

    // --- HANDLERS DE ÁUDIO ---
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
        } catch (e) {
            alert("Erro ao acessar microfone.");
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    };

    // --- HANDLERS DE ANOTAÇÃO (TEXTO) ---
    const handleTextMouseUp = (e: MouseEvent<HTMLDivElement>) => {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed && selection.toString().trim() !== '') {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            // Calcula posição relativa à viewport para o popup fixed
            setPopupState({ 
                visible: true, 
                x: rect.left + (rect.width / 2) - 144, // Centraliza (144 é metade da largura do popup)
                y: rect.bottom + 10, 
                selectionText: selection.toString() 
            });
        }
    };

    // --- HANDLERS DE ANOTAÇÃO (IMAGEM) ---
    const handleImageClick = (e: MouseEvent<HTMLDivElement>) => {
        if (popupState.visible) {
            setPopupState({ visible: false, x: 0, y: 0 });
            return;
        }
        const rect = imageContainerRef.current!.getBoundingClientRect();
        const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
        const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

        setPopupState({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            position: { x: xPercent, y: yPercent, width: 0, height: 0 }
        });
    };

    const saveAnnotation = (comment: string, marker: Annotation['marker']) => {
        const newAnno: Annotation = {
            id: crypto.randomUUID(),
            type: popupState.selectionText ? 'text' : 'image',
            comment,
            marker,
            selection: popupState.selectionText,
            position: popupState.position
        };
        setAnnotations([...annotations, newAnno]);
        setPopupState({ visible: false, x: 0, y: 0 });
        window.getSelection()?.removeAllRanges(); // Limpa seleção visual
    };

    const removeAnnotation = (id: string) => {
        if(confirm('Remover esta anotação?')) {
            setAnnotations(annotations.filter(a => a.id !== id));
        }
    };

    // --- SUBMISSÃO ---
    const handleSubmit = async () => {
        if (!feedback) return alert("Por favor, forneça um feedback geral.");

        startTransition(async () => {
            let uploadedAudioUrl = null;
            
            // Upload Audio se existir
            if (audioBlob) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const path = `feedback-audio/${user.id}/${essayId}-${Date.now()}.webm`;
                    const { error } = await supabase.storage.from('essays_assets').upload(path, audioBlob);
                    if (!error) {
                        const { data } = supabase.storage.from('essays_assets').getPublicUrl(path);
                        uploadedAudioUrl = data.publicUrl;
                    }
                }
            }

            const result = await submitCorrection({
                essay_id: essayId,
                feedback,
                grade_c1: grades.c1,
                grade_c2: grades.c2,
                grade_c3: grades.c3,
                grade_c4: grades.c4,
                grade_c5: grades.c5,
                final_grade: totalGrade,
                audio_feedback_url: uploadedAudioUrl,
                annotations,
                ai_feedback: null // Professor pode ou não gerar, aqui assumimos manual
            });

            if (result.error) {
                alert(`Erro: ${result.error}`);
            } else {
                alert("Correção enviada com sucesso!");
                onBack();
            }
        });
    };

    if (isLoading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#42047e]"></div></div>;
    if (!essay) return <div className="p-10 text-center">Redação não encontrada.</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20" onClick={() => popupState.visible && setPopupState(prev => ({...prev, visible: false}))}>
            
            {/* POPUP DE ANOTAÇÃO */}
            {popupState.visible && (
                <AnnotationPopup 
                    position={{ top: popupState.y, left: popupState.x }}
                    onSave={saveAnnotation}
                    onClose={() => setPopupState({ visible: false, x: 0, y: 0 })}
                />
            )}

            {/* STICKY HEADER DE AÇÕES */}
            <div className="sticky top-0 z-40 bg-white/90 dark:bg-dark-card/90 backdrop-blur-lg border-b border-gray-200 dark:border-dark-border px-6 py-3 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-gray-500 hover:text-[#42047e] font-bold flex items-center gap-2 transition-colors">
                        <i className="fas fa-arrow-left"></i> Voltar
                    </button>
                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 hidden md:block"></div>
                    <div>
                        <h2 className="text-sm font-bold text-gray-800 dark:text-white truncate max-w-xs">{essay.title || "Sem Título"}</h2>
                        <p className="text-xs text-gray-500">{essay.profiles?.full_name}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleCheckPlagiarism} 
                        disabled={checkingPlagiarism}
                        className={`text-xs font-bold px-3 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                            plagiarismResult 
                            ? (plagiarismResult.similarity > 10 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200')
                            : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200'
                        }`}
                    >
                        {checkingPlagiarism ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
                        {plagiarismResult 
                            ? `${plagiarismResult.similarity.toFixed(1)}% Plágio` 
                            : "Verificar Plágio"
                        }
                    </button>

                    <button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-[#42047e] to-[#07f49e] text-white text-sm font-bold px-6 py-2 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-70"
                    >
                        {isSubmitting ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                        {isSubmitting ? 'Enviando...' : 'Enviar Correção'}
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-6">
                
                {/* COLUNA ESQUERDA: CONTEÚDO (7/12) */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white dark:bg-dark-card p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border min-h-[600px]">
                        
                        {essay.image_submission_url ? (
                            <div 
                                ref={imageContainerRef}
                                className="relative w-full h-auto cursor-crosshair bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden"
                                onClick={handleImageClick}
                            >
                                <Image src={essay.image_submission_url} alt="Redação" width={800} height={1200} className="w-full h-auto pointer-events-none" />
                                
                                {/* Renderiza Pinos de Anotação */}
                                {annotations.filter(a => a.type === 'image').map(a => (
                                    <div 
                                        key={a.id}
                                        className="absolute transform -translate-x-1/2 -translate-y-full group cursor-pointer"
                                        style={{ left: `${a.position?.x}%`, top: `${a.position?.y}%` }}
                                        onClick={(e) => { e.stopPropagation(); removeAnnotation(a.id); }}
                                    >
                                        <i className={`fas fa-map-marker-alt text-3xl drop-shadow-md ${
                                            a.marker === 'erro' ? 'text-red-500' : a.marker === 'acerto' ? 'text-green-500' : 'text-blue-500'
                                        }`}></i>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                            {a.comment}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div 
                                onMouseUp={handleTextMouseUp}
                                className="font-serif text-lg leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap select-text"
                            >
                                {/* Renderização Visual com Highlights em Tempo Real */}
                                {/* NOTA: Para edição real, usamos split simples. Em produção, annotations precisam de offsets. */}
                                {essay.content?.split('\n').map((paragraph, pIdx) => {
                                    // Limpeza para visualização
                                    const cleanP = paragraph.replace(/<[^>]+>/g, '');
                                    if (!cleanP.trim()) return <br key={pIdx} />;

                                    const pAnnotations = annotations.filter(a => a.selection && cleanP.includes(a.selection));
                                    
                                    if (pAnnotations.length === 0) return <p key={pIdx} className="mb-4">{cleanP}</p>;

                                    // Highlight simples (substitui primeira ocorrência)
                                    let parts: ReactNode[] = [cleanP];
                                    pAnnotations.forEach(anno => {
                                        const newParts: ReactNode[] = [];
                                        parts.forEach(part => {
                                            if (typeof part === 'string') {
                                                const split = part.split(anno.selection!);
                                                split.forEach((s, i) => {
                                                    newParts.push(s);
                                                    if (i < split.length - 1) {
                                                        const color = anno.marker === 'erro' ? 'bg-red-200 border-red-500' : anno.marker === 'acerto' ? 'bg-green-200 border-green-500' : 'bg-blue-200 border-blue-500';
                                                        newParts.push(
                                                            <span 
                                                                key={anno.id} 
                                                                className={`px-1 rounded border-b-2 cursor-pointer ${color}`}
                                                                title={anno.comment}
                                                                onClick={(e) => { e.stopPropagation(); removeAnnotation(anno.id); }}
                                                            >
                                                                {anno.selection}
                                                            </span>
                                                        );
                                                    }
                                                });
                                            } else newParts.push(part);
                                        });
                                        parts = newParts;
                                    });

                                    return <p key={pIdx} className="mb-4">{parts}</p>;
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUNA DIREITA: FERRAMENTAS (5/12) */}
                <div className="lg:col-span-5 space-y-6">
                    
                    {/* CARD NOTA */}
                    <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-dark-border">
                        <div className="flex justify-between items-end mb-6">
                            <h3 className="font-bold text-gray-700 dark:text-white">Avaliação</h3>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase">Nota Final</p>
                                <p className="text-4xl font-black text-[#42047e] dark:text-[#07f49e]">{totalGrade}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                                    <label className="col-span-3 text-xs font-bold text-gray-500 uppercase">Comp. {i}</label>
                                    <div className="col-span-7">
                                        <input 
                                            type="range" 
                                            min="0" max="200" step="20"
                                            value={grades[`c${i}` as keyof typeof grades]}
                                            onChange={(e) => handleGradeChange(`c${i}` as keyof typeof grades, e.target.value)}
                                            className="w-full accent-[#42047e] cursor-pointer"
                                        />
                                    </div>
                                    <input 
                                        type="number"
                                        value={grades[`c${i}` as keyof typeof grades]}
                                        onChange={(e) => handleGradeChange(`c${i}` as keyof typeof grades, e.target.value)}
                                        className="col-span-2 text-center border rounded p-1 text-sm font-bold dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CARD FEEDBACK */}
                    <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
                        <h3 className="font-bold text-gray-700 dark:text-white mb-4 flex items-center gap-2">
                            <i className="fas fa-comment-alt text-[#42047e]"></i> Feedback Geral
                        </h3>
                        
                        {/* Gravador de Voz */}
                        <div className="mb-4 flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            {!isRecording && !audioUrl && (
                                <button onClick={startRecording} className="text-xs font-bold text-[#42047e] flex items-center gap-2 hover:bg-white p-2 rounded transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center"><i className="fas fa-microphone"></i></div>
                                    Gravar Áudio
                                </button>
                            )}
                            {isRecording && (
                                <button onClick={stopRecording} className="text-xs font-bold text-red-500 flex items-center gap-2 animate-pulse">
                                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center"><i className="fas fa-stop"></i></div>
                                    Parar Gravação
                                </button>
                            )}
                            {audioUrl && (
                                <div className="flex items-center gap-2 w-full">
                                    <audio src={audioUrl} controls className="h-8 w-full" />
                                    <button onClick={() => { setAudioUrl(null); setAudioBlob(null); }} className="text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button>
                                </div>
                            )}
                        </div>

                        <textarea 
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Escreva sua análise geral sobre o desempenho do aluno, pontos fortes e pontos a melhorar..."
                            rows={8}
                            className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#42047e] focus:outline-none resize-none"
                        />
                        
                        <div className="mt-2 flex gap-2">
                            {['Excelente argumentação', 'Melhorar coesão', 'Fuga ao tema', 'Proposta incompleta'].map(tag => (
                                <button 
                                    key={tag} 
                                    onClick={() => setFeedback(prev => prev + (prev ? '\n' : '') + tag + '. ')}
                                    className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                    + {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}