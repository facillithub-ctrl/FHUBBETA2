"use client";

import { useEffect, useState, useTransition, useRef, MouseEvent } from 'react';
import { Essay, getEssayDetails, submitCorrection, Annotation, AIFeedback } from '../actions';
import Image from 'next/image';
import createClient from '@/utils/supabase/client';
import { useToast } from '@/contexts/ToastContext';

type EssayWithProfile = Essay & {
    profiles: { full_name: string | null } | null;
};

type AnnotationPopupProps = {
    position: { top: number; left: number };
    onSave: (comment: string, marker: 'sugestao' | 'acerto' | 'erro') => void;
    onClose: () => void;
};

const AnnotationPopup = ({ position, onSave, onClose }: AnnotationPopupProps) => {
    const [comment, setComment] = useState('');
    const [marker, setMarker] = useState<'sugestao' | 'acerto' | 'erro'>('sugestao');
    const textRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => { if (textRef.current) textRef.current.focus(); }, []);

    return (
        <div 
            className="fixed z-[9999] bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-4 w-80 border border-gray-100 dark:border-gray-600 animate-fade-in ring-1 ring-black/5"
            style={{ top: position.top, left: position.left }}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <i className="fas fa-comment-alt"></i> Novo Comentário
                </span>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <i className="fas fa-times"></i>
                </button>
            </div>
            <textarea
                ref={textRef}
                placeholder="Escreva sua observação..."
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-3 focus:ring-2 focus:ring-royal-blue/50 focus:border-royal-blue focus:outline-none transition-all resize-none placeholder-gray-400"
            />
            <div className="flex justify-between items-center gap-3">
                <div className="relative flex-1">
                    <select
                        value={marker}
                        onChange={(e) => setMarker(e.target.value as any)}
                        className="w-full text-xs font-medium p-2 pl-3 pr-8 border border-gray-200 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none cursor-pointer hover:border-royal-blue transition-colors focus:outline-none focus:ring-2 focus:ring-royal-blue/20"
                    >
                        <option value="sugestao">💡 Sugestão</option>
                        <option value="acerto">✅ Acerto</option>
                        <option value="erro">❌ Erro</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                        <i className="fas fa-chevron-down text-[10px]"></i>
                    </div>
                </div>
                <button 
                    onClick={() => { if(comment.trim()) onSave(comment, marker) }} 
                    className="text-xs bg-royal-blue text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                    Salvar
                </button>
            </div>
        </div>
    );
};

export default function CorrectionInterface({ essayId, onBack }: { essayId: string; onBack: () => void }) {
    const [essay, setEssay] = useState<EssayWithProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();
    
    const [feedback, setFeedback] = useState('');
    const [grades, setGrades] = useState({ c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 });
    const [badge, setBadge] = useState('');
    const [additionalLink, setAdditionalLink] = useState('');
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    
    const [popupState, setPopupState] = useState<{ visible: boolean; top: number; left: number; selectionText?: string; position?: Annotation['position'] }>({ visible: false, top: 0, left: 0 });
    const [isSubmitting, startTransition] = useTransition();
    
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isUploadingAudio, setIsUploadingAudio] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectionBox, setSelectionBox] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
    const startCoords = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

    const supabase = createClient();

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            const { data } = await getEssayDetails(essayId);
            if (data) setEssay(data as EssayWithProfile);
            setIsLoading(false);
        };
        load();
    }, [essayId]);

    const handleTextMouseUp = () => {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed && selection.toString().trim()) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setPopupState({
                visible: true,
                top: rect.bottom + 10,
                left: rect.left + (rect.width / 2) - 140, 
                selectionText: selection.toString()
            });
        }
    };

    const handleImageMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        if (popupState.visible) {
            setPopupState(prev => ({ ...prev, visible: false }));
            return;
        }
        e.preventDefault();
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
            setPopupState({
                visible: true,
                left: e.clientX,
                top: e.clientY + 10,
                position
            });
        }
        setSelectionBox(null);
    };

    const handleSaveAnnotation = (comment: string, marker: 'erro' | 'acerto' | 'sugestao') => {
        const newAnnotation: Annotation = {
            id: crypto.randomUUID(),
            type: popupState.position ? 'image' : 'text',
            comment,
            marker,
            selection: popupState.selectionText,
            position: popupState.position
        };

        setAnnotations(prev => [...prev, newAnnotation]);
        setPopupState({ visible: false, top: 0, left: 0 });
        if (window.getSelection) window.getSelection()?.removeAllRanges();
    };

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
        } catch { addToast({ title: "Erro", message: "Erro ao acessar microfone.", type: "error" }); }
    };

    const stopRecording = () => { mediaRecorderRef.current?.stop(); setIsRecording(false); };

    const handleSubmit = async () => {
        const final_grade = Object.values(grades).reduce((a, b) => a + b, 0);
        if (!feedback) return addToast({ title: "Atenção", message: "O feedback geral é obrigatório.", type: "error" });

        startTransition(async () => {
            let uploadedAudioUrl = null;
            if (audioBlob) {
                setIsUploadingAudio(true);
                const { data: { user } } = await supabase.auth.getUser();
                const filePath = `audio-feedbacks/${user?.id}/${essayId}-${Date.now()}.webm`;
                const { error } = await supabase.storage.from('audio_feedbacks').upload(filePath, audioBlob);
                if (!error) {
                    const { data } = supabase.storage.from('audio_feedbacks').getPublicUrl(filePath);
                    uploadedAudioUrl = data.publicUrl;
                }
                setIsUploadingAudio(false);
            }

            const result = await submitCorrection({
                essay_id: essayId,
                feedback,
                grade_c1: grades.c1, grade_c2: grades.c2, grade_c3: grades.c3, grade_c4: grades.c4, grade_c5: grades.c5,
                final_grade,
                audio_feedback_url: uploadedAudioUrl,
                annotations,
                badge: badge || null,
                additional_link: additionalLink || null
            });

            if (!result.error) {
                addToast({ title: "Sucesso", message: "Correção enviada!", type: "success" });
                onBack();
            } else {
                addToast({ title: "Erro", message: "Erro ao enviar correção.", type: "error" });
                console.error(result.error);
            }
        });
    };

    const renderAnnotatedText = (content: string) => {
        const textAnnotations = annotations.filter(a => a.type === 'text');
        if (textAnnotations.length === 0) {
            return <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-lg leading-relaxed font-serif text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: content }} />;
        }

        return (
            <div className="relative">
                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-lg leading-relaxed font-serif text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: content }} />
                <div className="mt-8 space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Comentários Realizados</h4>
                    {textAnnotations.map((anno) => (
                         <div key={anno.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm dark:bg-yellow-900/20 dark:border-yellow-800 flex gap-3 items-start group">
                            <div className="bg-yellow-100 text-yellow-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">
                                <i className="fas fa-quote-right"></i>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 border-l-2 border-yellow-400 pl-2 italic">
                                    &quot;{anno.selection?.substring(0, 60)}{anno.selection && anno.selection.length > 60 ? '...' : ''}&quot;
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{anno.comment}</p>
                            </div>
                            <button onClick={() => setAnnotations(annotations.filter(a => a.id !== anno.id))} className="ml-auto text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <i className="fas fa-trash"></i>
                            </button>
                         </div>
                    ))}
                </div>
            </div>
        );
    };

    if (isLoading || !essay) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-blue"></div></div>;

    return (
        <div className="relative min-h-screen pb-20 bg-gray-50 dark:bg-gray-900">
            {popupState.visible && (
                <AnnotationPopup 
                    position={popupState} 
                    onSave={handleSaveAnnotation} 
                    onClose={() => setPopupState(prev => ({ ...prev, visible: false }))} 
                />
            )}

            <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/90 dark:border-gray-800 px-6 py-4 shadow-sm mb-6 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{essay.title || "Redação sem Título"}</h1>
                        <p className="text-xs text-gray-500">{essay.profiles?.full_name} • {essay.submitted_at ? new Date(essay.submitted_at).toLocaleDateString() : ''}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                     <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Nota Atual</p>
                        <p className="text-2xl font-black text-royal-blue">{Object.values(grades).reduce((a, b) => a + b, 0)}</p>
                    </div>
                     <button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting || isUploadingAudio}
                        className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-green-700 transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                    >
                        {isSubmitting ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-check"></i>}
                        {isSubmitting ? 'Enviando...' : 'Finalizar'}
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 min-h-[80vh] p-8 relative overflow-hidden" onMouseUp={handleTextMouseUp}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    {essay.image_submission_url ? (
                        <div 
                            className="relative w-full h-full flex justify-center cursor-crosshair"
                            ref={imageContainerRef}
                            onMouseDown={handleImageMouseDown}
                            onMouseMove={handleImageMouseMove}
                            onMouseUp={handleImageMouseUp}
                        >
                            <Image src={essay.image_submission_url} alt="Redação" width={800} height={1200} className="object-contain max-w-full h-auto rounded-lg shadow-lg" draggable={false} />
                            
                            {isDrawing && selectionBox && (
                                <div className="absolute border-2 border-royal-blue bg-royal-blue/10 rounded" style={{ left: selectionBox.x, top: selectionBox.y, width: selectionBox.width, height: selectionBox.height, pointerEvents: 'none' }} />
                            )}

                            {annotations.filter(a => a.type === 'image').map(a => (
                                <div key={a.id} className="absolute border-2 border-yellow-400 bg-yellow-400/20 cursor-help group rounded" style={{ left: `${a.position!.x}%`, top: `${a.position!.y}%`, width: `${a.position!.width}%`, height: `${a.position!.height}%` }}>
                                    <div className="absolute -top-2 -right-2">
                                        <button onClick={(e) => { e.stopPropagation(); setAnnotations(annotations.filter(an => an.id !== a.id)); }} className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"><i className="fas fa-times"></i></button>
                                    </div>
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-xl arrow-bottom whitespace-nowrap z-20">
                                        {a.comment}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : renderAnnotatedText(essay.content || '')}
                </div>

                <div className="space-y-6">
                    
                    <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2"><i className="fas fa-star text-yellow-400"></i> Avaliação por Competência</h3>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-2">Comp. {i}</label>
                                    <input 
                                        type="number" 
                                        value={grades[`c${i}` as keyof typeof grades]} 
                                        onChange={e => setGrades({...grades, [`c${i}`]: Math.min(200, Math.max(0, Number(e.target.value)))})} 
                                        className="w-20 p-1.5 text-center border rounded-md font-bold text-royal-blue focus:ring-2 focus:ring-royal-blue focus:outline-none bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        step="20" min="0" max="200"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2"><i className="fas fa-comment-dots text-blue-500"></i> Análise e Feedback</h3>
                        <textarea 
                            rows={6} 
                            value={feedback}
                            onChange={e => setFeedback(e.target.value)}
                            placeholder="Escreva uma análise construtiva sobre os pontos fortes e fracos..."
                            className="w-full p-4 border rounded-xl text-sm mb-4 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-royal-blue focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none transition-colors"
                        />
                        
                        <div className="flex flex-col gap-3">
                            {!isRecording && !audioUrl && (
                                <button onClick={startRecording} className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-bold text-gray-500 hover:border-royal-blue hover:text-royal-blue hover:bg-blue-50 transition-all">
                                    <i className="fas fa-microphone"></i> Gravar Feedback em Áudio
                                </button>
                            )}
                            {isRecording && (
                                <button onClick={stopRecording} className="flex items-center justify-center gap-2 w-full py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-bold animate-pulse">
                                    <div className="w-3 h-3 bg-red-600 rounded-full"></div> Parar Gravação...
                                </button>
                            )}
                            {audioUrl && (
                                <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm"><i className="fas fa-play"></i></div>
                                    <audio src={audioUrl} controls className="flex-1 h-8 w-full" />
                                    <button onClick={() => { setAudioBlob(null); setAudioUrl(null); }} className="text-gray-400 hover:text-red-500 transition-colors"><i className="fas fa-trash-alt"></i></button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2"><i className="fas fa-award text-purple-500"></i> Reconhecimento & Recursos</h3>
                        
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-gray-400 mb-2">Atribuir Selo</label>
                            <select 
                                value={badge} 
                                onChange={e => setBadge(e.target.value)} 
                                className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            >
                                <option value="">Selecionar Selo...</option>
                                <option value="Exemplar">🏆 Redação Exemplar</option>
                                <option value="Destaque">⭐ Destaque da Turma</option>
                                <option value="Criativo">🎨 Criatividade</option>
                                <option value="Analítico">🧠 Pensamento Analítico</option>
                                <option value="Superação">🚀 Superação</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Recomendação de Estudo</label>
                            <div className="relative">
                                <i className="fas fa-link absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input 
                                    type="text" 
                                    value={additionalLink} 
                                    onChange={e => setAdditionalLink(e.target.value)} 
                                    placeholder="Cole um link aqui..." 
                                    className="w-full pl-9 p-2.5 border rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting || isUploadingAudio}
                        className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-transform hover:scale-[1.02] active:scale-100 shadow-lg disabled:opacity-50 disabled:scale-100"
                    >
                        {isSubmitting ? 'Enviando...' : 'Finalizar Correção'}
                    </button>

                </div>
            </div>
        </div>
    );
}