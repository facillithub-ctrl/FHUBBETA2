"use client";

import { useEffect, useState, useTransition, useRef, MouseEvent } from 'react';
// Importação de Ações
import { Essay, getEssayDetails, submitCorrection, Annotation, AIFeedback, generateAndSaveAIAnalysis } from '../actions';
// Importação para buscar testes (para o GPS)
import { getTestsForTeacher } from '@/app/(hubs)/education/applications/test/actions';
import Image from 'next/image';
import createClient from '@/utils/supabase/client';
import { useToast } from '@/contexts/ToastContext';

type EssayWithProfile = Essay & { profiles: { full_name: string | null } | null; };
type AnnotationPopupProps = { position: { top: number; left: number }; onSave: (comment: string, marker: 'sugestao' | 'acerto' | 'erro') => void; onClose: () => void; };

const AnnotationPopup = ({ position, onSave, onClose }: AnnotationPopupProps) => {
    const [comment, setComment] = useState('');
    const [marker, setMarker] = useState<'sugestao' | 'acerto' | 'erro'>('sugestao');
    const textRef = useRef<HTMLTextAreaElement>(null);
    useEffect(() => { if (textRef.current) textRef.current.focus(); }, []);

    return (
        <div className="fixed z-[9999] bg-white shadow-2xl rounded-xl p-4 w-80 border border-gray-200 animate-fade-in ring-1 ring-black/5" style={{ top: position.top, left: position.left }} onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2"><i className="fas fa-comment-alt"></i> Novo Comentário</span>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times"></i></button>
            </div>
            <textarea ref={textRef} placeholder="Escreva sua observação..." rows={3} value={comment} onChange={(e) => setComment(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 mb-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" />
            <div className="flex justify-between items-center gap-3">
                <select value={marker} onChange={(e) => setMarker(e.target.value as any)} className="flex-1 text-xs font-medium p-2 border border-gray-200 rounded-lg bg-white">
                    <option value="sugestao">💡 Sugestão</option>
                    <option value="acerto">✅ Acerto</option>
                    <option value="erro">❌ Erro</option>
                </select>
                <button onClick={() => { if(comment.trim()) onSave(comment, marker) }} className="text-xs bg-brand-purple text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-purple-light">Salvar</button>
            </div>
        </div>
    );
};

export default function CorrectionInterface({ essayId, onBack }: { essayId: string; onBack: () => void }) {
    const [essay, setEssay] = useState<EssayWithProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();
    
    // Estados de Correção
    const [feedback, setFeedback] = useState('');
    const [grades, setGrades] = useState({ c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 });
    const [badge, setBadge] = useState('');
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [aiFeedbackData, setAiFeedbackData] = useState<AIFeedback | null>(null);
    
    // Estados do GPS (Novos)
    const [availableTests, setAvailableTests] = useState<any[]>([]);
    const [recommendedTestId, setRecommendedTestId] = useState('');
    const [additionalLink, setAdditionalLink] = useState('');

    const [popupState, setPopupState] = useState<{ visible: boolean; top: number; left: number; selectionText?: string; position?: Annotation['position'] }>({ visible: false, top: 0, left: 0 });
    const [isSubmitting, startTransition] = useTransition();
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

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
            
            // Carrega testes para o GPS
            const tests = await getTestsForTeacher();
            if (tests.data) setAvailableTests(tests.data);
            
            setIsLoading(false);
        };
        load();
    }, [essayId]);

    const handleGenerateAI = async () => {
        if (!essay?.content) return addToast({ title: "Erro", message: "Sem texto para analisar.", type: "error" });
        setIsGeneratingAI(true);
        addToast({ title: "IA", message: "Gerando análise...", type: "success" });
        try {
            const result = await generateAndSaveAIAnalysis(essay.id, essay.content, essay.title || "Sem título");
            if ('data' in result && result.data) {
                setAiFeedbackData(result.data as unknown as AIFeedback);
                addToast({ title: "Sucesso", message: "Análise da IA gerada!", type: "success" });
            } else if ('error' in result) {
                addToast({ title: "Erro IA", message: result.error as string, type: "error" });
            }
        } catch (error) {
            addToast({ title: "Erro", message: "Falha na conexão com a IA.", type: "error" });
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleTextMouseUp = () => {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed && selection.toString().trim()) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setPopupState({ visible: true, top: rect.bottom + 10, left: rect.left + (rect.width / 2) - 140, selectionText: selection.toString() });
        }
    };

    const handleImageMouseDown = (e: MouseEvent<HTMLDivElement>) => { if (popupState.visible) { setPopupState(prev => ({ ...prev, visible: false })); return; } e.preventDefault(); setIsDrawing(true); const rect = imageContainerRef.current!.getBoundingClientRect(); startCoords.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }; setSelectionBox({ x: startCoords.current.x, y: startCoords.current.y, width: 0, height: 0 }); };
    const handleImageMouseMove = (e: MouseEvent<HTMLDivElement>) => { if (!isDrawing) return; const rect = imageContainerRef.current!.getBoundingClientRect(); const currentX = e.clientX - rect.left; const currentY = e.clientY - rect.top; const x = Math.min(startCoords.current.x, currentX); const y = Math.min(startCoords.current.y, currentY); const width = Math.abs(currentX - startCoords.current.x); const height = Math.abs(currentY - startCoords.current.y); setSelectionBox({ x, y, width, height }); };
    const handleImageMouseUp = (e: MouseEvent<HTMLDivElement>) => { setIsDrawing(false); if (selectionBox && (selectionBox.width > 10 || selectionBox.height > 10)) { const rect = imageContainerRef.current!.getBoundingClientRect(); const position = { x: (selectionBox.x / rect.width) * 100, y: (selectionBox.y / rect.height) * 100, width: (selectionBox.width / rect.width) * 100, height: (selectionBox.height / rect.height) * 100, }; setPopupState({ visible: true, left: e.clientX, top: e.clientY + 10, position }); } setSelectionBox(null); };
    
    const handleSaveAnnotation = (comment: string, marker: 'erro' | 'acerto' | 'sugestao') => { 
        const newAnnotation: Annotation = { id: crypto.randomUUID(), type: popupState.position ? 'image' : 'text', comment, marker, selection: popupState.selectionText, position: popupState.position }; 
        setAnnotations(prev => [...prev, newAnnotation]); 
        setPopupState({ visible: false, top: 0, left: 0 }); 
        if (window.getSelection) window.getSelection()?.removeAllRanges(); 
    };
    
    const startRecording = async () => { try { const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); mediaRecorderRef.current = new MediaRecorder(stream); mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data); mediaRecorderRef.current.onstop = () => { const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); setAudioBlob(blob); setAudioUrl(URL.createObjectURL(blob)); audioChunksRef.current = []; }; mediaRecorderRef.current.start(); setIsRecording(true); } catch { addToast({ title: "Erro", message: "Erro ao acessar microfone.", type: "error" }); } };
    const stopRecording = () => { mediaRecorderRef.current?.stop(); setIsRecording(false); };

    const handleSubmit = async () => {
        const final_grade = Object.values(grades).reduce((a, b) => a + b, 0);
        if (!feedback) return addToast({ title: "Atenção", message: "Feedback obrigatório.", type: "error" });

        startTransition(async () => {
            let uploadedAudioUrl = null;
            if (audioBlob) {
                setIsUploadingAudio(true);
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const filePath = `audio-feedbacks/${user.id}/${essayId}-${Date.now()}.webm`;
                    const { error } = await supabase.storage.from('audio_feedbacks').upload(filePath, audioBlob);
                    if (!error) { const { data } = supabase.storage.from('audio_feedbacks').getPublicUrl(filePath); uploadedAudioUrl = data.publicUrl; }
                }
                setIsUploadingAudio(false);
            }

            const result = await submitCorrection({
                essay_id: essayId, 
                feedback, 
                grade_c1: grades.c1, 
                grade_c2: grades.c2, 
                grade_c3: grades.c3, 
                grade_c4: grades.c4, 
                grade_c5: grades.c5,
                final_grade, 
                audio_feedback_url: uploadedAudioUrl, 
                annotations, 
                badge: badge || null, 
                ai_feedback: aiFeedbackData,
                // NOVOS CAMPOS GPS
                recommended_test_id: recommendedTestId || undefined,
                additional_link: additionalLink || undefined
            });

            if (!result.error) { addToast({ title: "Sucesso", message: "Correção enviada!", type: "success" }); onBack(); } else { addToast({ title: "Erro", message: result.error, type: "error" }); }
        });
    };
    
    if (isLoading || !essay) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div></div>;

    return (
        <div className="relative min-h-screen pb-20 bg-surface-gray font-inter">
            {popupState.visible && <AnnotationPopup position={popupState} onSave={handleSaveAnnotation} onClose={() => setPopupState(prev => ({ ...prev, visible: false }))} />}

            <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-sm mb-6 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"><i className="fas fa-arrow-left"></i></button>
                    <div><h1 className="text-lg font-bold text-gray-900 leading-tight">{essay.title || "Redação sem Título"}</h1><p className="text-xs text-gray-500">{essay.profiles?.full_name}</p></div>
                </div>
                <div className="flex items-center gap-4">
                     <div className="text-right"><p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Nota Atual</p><p className="text-2xl font-black text-brand-purple">{Object.values(grades).reduce((a, b) => a + b, 0)}</p></div>
                     <button onClick={handleSubmit} disabled={isSubmitting || isUploadingAudio} className="bg-brand-green-dark text-white px-6 py-2.5 rounded-lg font-bold hover:bg-brand-green transition-all shadow-md flex items-center gap-2">{isSubmitting ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-check"></i>} {isSubmitting ? 'Enviando...' : 'Finalizar'}</button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* ÁREA DA REDAÇÃO (ESQUERDA) */}
                <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[80vh] p-8 relative overflow-hidden" onMouseUp={handleTextMouseUp}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-brand-gradient"></div>
                    {essay.image_submission_url ? (
                        <div className="relative w-full h-full flex justify-center cursor-crosshair" ref={imageContainerRef} onMouseDown={handleImageMouseDown} onMouseMove={handleImageMouseMove} onMouseUp={handleImageMouseUp}>
                            <Image src={essay.image_submission_url} alt="Redação" width={800} height={1200} className="object-contain max-w-full h-auto rounded-lg shadow-lg" draggable={false} />
                            {isDrawing && selectionBox && <div className="absolute border-2 border-brand-purple bg-brand-purple/10 rounded" style={{ left: selectionBox.x, top: selectionBox.y, width: selectionBox.width, height: selectionBox.height, pointerEvents: 'none' }} />}
                            {annotations.filter(a => a.type === 'image').map(a => ( <div key={a.id} className="absolute border-2 border-yellow-400 bg-yellow-400/20 cursor-help group rounded" style={{ left: `${a.position!.x}%`, top: `${a.position!.y}%`, width: `${a.position!.width}%`, height: `${a.position!.height}%` }}><div className="absolute -top-2 -right-2"><button onClick={(e) => { e.stopPropagation(); setAnnotations(annotations.filter(an => an.id !== a.id)); }} className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"><i className="fas fa-times"></i></button></div><div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-xl arrow-bottom whitespace-nowrap z-20">{a.comment}</div></div> ))}
                        </div>
                    ) : (
                         <div className="relative">
                            <div className="prose max-w-none whitespace-pre-wrap text-lg leading-relaxed font-serif text-gray-800" dangerouslySetInnerHTML={{ __html: essay.content || '' }} />
                            <div className="mt-8 space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Anotações</h4>
                                {annotations.map((anno, i) => (
                                    <div key={i} className="p-3 bg-purple-50 border border-purple-100 rounded-lg flex gap-3 items-start group">
                                        <span className="font-bold text-brand-purple/70 text-xs mt-0.5">#{i+1}</span>
                                        <div><p className="text-sm font-bold text-gray-700 mb-1 italic">&quot;{anno.selection?.substring(0, 40)}...&quot;</p><p className="text-sm text-gray-600">{anno.comment}</p></div>
                                        <button onClick={() => setAnnotations(annotations.filter(a => a.id !== anno.id))} className="ml-auto text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><i className="fas fa-trash"></i></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ÁREA DE FERRAMENTAS (DIREITA) */}
                <div className="space-y-6">
                    {/* Painel IA */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2"><i className="fas fa-robot text-brand-purple"></i> Assistente de Correção</h3>
                        <button onClick={handleGenerateAI} disabled={isGeneratingAI} className="w-full py-3 border-2 border-brand-purple text-brand-purple rounded-xl font-bold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2">{isGeneratingAI ? 'Analisando...' : 'Gerar Análise com IA'}</button>
                        {aiFeedbackData && <div className="mt-3 text-xs text-green-600 bg-green-50 p-2 rounded text-center border border-green-100">Análise gerada e anexada!</div>}
                    </div>

                    {/* Avaliação */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2"><i className="fas fa-star text-yellow-400"></i> Avaliação</h3>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => ( <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"><label className="text-sm font-bold text-gray-700 ml-2">Comp. {i}</label><input type="number" value={grades[`c${i}` as keyof typeof grades]} onChange={e => setGrades({...grades, [`c${i}`]: Math.min(200, Math.max(0, Number(e.target.value)))})} className="w-20 p-1.5 text-center border rounded-md font-bold text-brand-purple focus:ring-2 focus:ring-brand-purple focus:outline-none bg-white" step="20" min="0" max="200" /></div> ))}
                        </div>
                    </div>

                    {/* Feedback e Áudio */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2"><i className="fas fa-comment-dots text-blue-500"></i> Feedback</h3>
                        <textarea rows={6} value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Escreva uma análise construtiva..." className="w-full p-4 border rounded-xl text-sm mb-4 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-purple focus:outline-none resize-none transition-colors" />
                        
                        <div className="flex flex-col gap-3">
                            {!isRecording && !audioUrl && <button onClick={startRecording} className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-bold text-gray-500 hover:border-brand-purple hover:text-brand-purple hover:bg-purple-50 transition-all"><i className="fas fa-microphone"></i> Gravar Feedback</button>}
                            {isRecording && <button onClick={stopRecording} className="flex items-center justify-center gap-2 w-full py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-bold animate-pulse"><i className="fas fa-stop"></i> Parar Gravação...</button>}
                            {audioUrl && <div className="flex items-center gap-3 bg-purple-50 p-3 rounded-xl border border-purple-100"><div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-brand-purple shadow-sm"><i className="fas fa-play"></i></div><audio src={audioUrl} controls className="flex-1 h-8 w-full" /><button onClick={() => { setAudioBlob(null); setAudioUrl(null); }} className="text-gray-400 hover:text-red-500 transition-colors"><i className="fas fa-trash-alt"></i></button></div>}
                        </div>
                    </div>

                    {/* GPS e Extras */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2"><i className="fas fa-compass text-green-500"></i> GPS de Estudo</h3>
                        
                        {/* Seletor de Teste Recomendado */}
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-gray-400 mb-2">Recomendar Simulado (Reforço)</label>
                            <select 
                                value={recommendedTestId} 
                                onChange={e => setRecommendedTestId(e.target.value)} 
                                className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 focus:outline-none"
                            >
                                <option value="">Nenhum teste específico</option>
                                {availableTests.map((t: any) => (
                                    <option key={t.id} value={t.id}>{t.title} ({t.subject || 'Geral'})</option>
                                ))}
                            </select>
                        </div>

                        {/* Link Extra */}
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-gray-400 mb-2">Link Extra (Vídeo/Artigo)</label>
                            <div className="relative">
                                <i className="fas fa-link absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input 
                                    type="text" 
                                    value={additionalLink} 
                                    onChange={e => setAdditionalLink(e.target.value)} 
                                    placeholder="https://..." 
                                    className="w-full pl-9 p-2.5 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 focus:outline-none" 
                                />
                            </div>
                        </div>

                        {/* Selo */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Atribuir Selo (Gamification)</label>
                            <select value={badge} onChange={e => setBadge(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-brand-purple focus:outline-none">
                                <option value="">Nenhum</option>
                                <option value="Exemplar">🏆 Redação Exemplar</option>
                                <option value="Destaque">⭐ Destaque da Turma</option>
                                <option value="Criativo">🎨 Criatividade</option>
                                <option value="Analítico">🧠 Pensamento Analítico</option>
                                <option value="Superação">🚀 Superação</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}