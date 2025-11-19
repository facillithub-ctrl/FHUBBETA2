"use client";

import { useState, useTransition, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Essay, EssayPrompt, saveOrUpdateEssay, checkForPlagiarism } from '../actions';
import PromptSelector from './PromptSelector';
import createClient from '@/utils/supabase/client';
import Image from 'next/image';
import VersionHistory from './VersionHistory';
import Timer from './Timer';
import PlagiarismResultModal, { type PlagiarismResult } from './PlagiarismResultModal';
import { useToast } from '@/contexts/ToastContext';
import ConfirmationModal from '@/components/ConfirmationModal';
import RichTextEditor from '@/components/DynamicRichTextEditor';
import Link from 'next/link';

type Props = {
  essay: Partial<Essay> | null;
  prompts: EssayPrompt[];
  onBack: () => void;
};

export default function EssayEditor({ essay, prompts, onBack }: Props) {
  // ... (Lógica e Hooks mantidos) ...
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentEssay, setCurrentEssay] = useState(essay || {});
  const [consent, setConsent] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const { addToast } = useToast();
  
  const [selectedPrompt, setSelectedPrompt] = useState<EssayPrompt | null>(() => {
    const promptIdFromUrl = searchParams.get('promptId');
    if (promptIdFromUrl) return prompts.find(p => p.id === promptIdFromUrl) || null;
    return prompts.find(p => p.id === essay?.prompt_id) || null;
  });

  const [showHistory, setShowHistory] = useState(false);
  const [isSimulado, setIsSimulado] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);
  const [plagiarismResult, setPlagiarismResult] = useState<PlagiarismResult | null>(null);
  const [isRestoreModalOpen, setRestoreModalOpen] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<string | null>(null);

  useEffect(() => { if (searchParams.get('promptId')) router.replace('/dashboard/applications/write', { scroll: false }); }, [searchParams, router]);
  
  useEffect(() => {
    if (isSimulado) {
      autoSaveTimerRef.current = setInterval(() => {
        setCurrentEssay(prevEssay => {
          if(prevEssay.content && prevEssay.id) {
            startTransition(async () => { await saveOrUpdateEssay({ ...prevEssay, status: 'draft' }); });
          }
          return prevEssay;
        });
      }, 60000);
    } else if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    return () => { if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current); };
  }, [isSimulado]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { addToast({ title: "Erro", message: "Usuário não logado.", type: 'error' }); setUploading(false); return; }
    const filePath = `submissions/${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('essays').upload(filePath, file);
    if (uploadError) { addToast({ title: "Erro", message: uploadError.message, type: 'error' }); setUploading(false); return; }
    const { data } = supabase.storage.from('essays').getPublicUrl(filePath);
    setCurrentEssay(prev => ({ ...prev, image_submission_url: data.publicUrl, content: '' }));
    setUploading(false);
  };

  const handleSave = (status: 'draft' | 'submitted') => {
    if (status === 'submitted' && !currentEssay.content && !currentEssay.image_submission_url) { addToast({ title: "Atenção", message: 'Escreva um texto ou envie uma imagem.', type: 'error' }); return; }
    if (status === 'submitted' && !consent) { addToast({ title: "Atenção", message: 'Aceite os termos para enviar.', type: 'error' }); return; }
    startTransition(async () => {
      const updatedData = { ...currentEssay, status, prompt_id: selectedPrompt?.id, consent_to_ai_training: consent };
      const result = await saveOrUpdateEssay(updatedData);
      if (!result.error) {
        if (status === 'submitted') { addToast({ title: 'Sucesso!', message: 'Redação enviada.', type: 'success' }); onBack(); } 
        else { addToast({ title: 'Salvo', message: 'Rascunho salvo.', type: 'success' }); if (result.data) setCurrentEssay(prev => ({ ...prev, id: result.data.id })); }
      } else { addToast({ title: 'Erro', message: result.error, type: 'error' }); }
    });
  };

  const handlePlagiarismCheck = async () => {
    if (!currentEssay.content || currentEssay.content.length < 50) { addToast({ title: "Texto Curto", message: "Escreva mais.", type: 'error' }); return; }
    setIsCheckingPlagiarism(true);
    const result = await checkForPlagiarism(currentEssay.content);
    if (result.data) setPlagiarismResult(result.data); else addToast({ title: "Erro", message: "Falha na verificação.", type: 'error' });
    setIsCheckingPlagiarism(false);
  };
  
  const handleExport = () => {
      const blob = new Blob([currentEssay.content || ''], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${currentEssay.title || 'redacao'}.txt`;
      link.click();
  };

  if (!selectedPrompt && !essay?.id) return <PromptSelector prompts={prompts} onSelect={setSelectedPrompt} onBack={onBack} />;

  return (
    <div className="relative">
        <PlagiarismResultModal result={plagiarismResult} onClose={() => setPlagiarismResult(null)} />
        <ConfirmationModal isOpen={isRestoreModalOpen} title="Restaurar Versão" message="Substituir conteúdo atual?" onConfirm={() => { if(versionToRestore) setCurrentEssay(p => ({...p, content: versionToRestore})); setRestoreModalOpen(false); }} onClose={() => setRestoreModalOpen(false)} />
        
        <div className="flex justify-between items-center mb-4">
            <button onClick={onBack} className="text-sm text-[#42047e] font-bold flex items-center gap-2"><i className="fas fa-arrow-left"></i> Voltar</button>
            {isSimulado && <Timer isRunning={isSimulado} durationInSeconds={5400} onTimeUp={() => alert('Tempo Esgotado!')} />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-border h-fit lg:sticky top-6">
                <h2 className="text-xl font-bold dark:text-white">{selectedPrompt?.title}</h2>
                <p className="text-sm text-gray-500 mb-4">{selectedPrompt?.source}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{selectedPrompt?.description}</p>
                <h3 className="font-bold text-sm uppercase text-gray-400 mb-3">Textos Motivadores</h3>
                <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300 max-h-96 overflow-y-auto pr-2">
                    {selectedPrompt?.motivational_text_1 && <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"><p className="whitespace-pre-wrap">{selectedPrompt.motivational_text_1}</p></div>}
                    {selectedPrompt?.motivational_text_2 && <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"><p className="whitespace-pre-wrap">{selectedPrompt.motivational_text_2}</p></div>}
                    {selectedPrompt?.motivational_text_3_image_url && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <Image src={selectedPrompt.motivational_text_3_image_url} alt="Texto motivador" width={400} height={250} className="rounded w-full h-auto mb-2" />
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-border">
                <input type="text" placeholder="Título da redação" value={currentEssay.title || ''} onChange={(e) => setCurrentEssay(prev => ({ ...prev, title: e.target.value }))} className="w-full text-2xl font-bold p-2 mb-4 bg-transparent border-b dark:text-white focus:border-[#42047e] outline-none placeholder-gray-300" />

                {currentEssay.image_submission_url ? (
                  <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-xl">
                    <Image src={currentEssay.image_submission_url} alt="Envio" width={400} height={600} className="mx-auto rounded-lg max-h-96 object-contain" />
                    <button onClick={() => setCurrentEssay(p => ({...p, image_submission_url: undefined}))} className="mt-4 text-red-500 font-bold text-sm hover:underline">Remover imagem</button>
                  </div>
                ) : (
                  <>
                    <RichTextEditor value={currentEssay.content || ''} onChange={(c) => setCurrentEssay(p => ({ ...p, content: c }))} placeholder="Comece a escrever aqui..." />
                    <div className="text-center my-4"><span className="text-xs text-gray-400 uppercase font-bold tracking-wider">OU</span></div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#42047e] hover:text-[#42047e] transition-colors font-medium flex items-center justify-center gap-2">
                      <i className="fas fa-camera"></i> {uploading ? 'Enviando...' : 'Enviar foto da folha'}
                    </button>
                  </>
                )}
                
                <div className="flex flex-wrap items-center gap-3 mt-6 pb-6 border-b dark:border-gray-700">
                    {!currentEssay.image_submission_url && (
                        <button onClick={handlePlagiarismCheck} disabled={isCheckingPlagiarism} className="px-4 py-2 rounded-lg bg-[#42047e]/10 text-[#42047e] text-sm font-bold hover:bg-[#42047e]/20 transition-colors flex items-center gap-2">
                            {isCheckingPlagiarism ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>} Verificar Plágio
                        </button>
                    )}
                    <button onClick={handleExport} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
                        <i className="fas fa-download"></i> Exportar
                    </button>
                    {currentEssay.id && !currentEssay.image_submission_url && (
                        <button onClick={() => setShowHistory(!showHistory)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 ml-auto">
                            <i className="fas fa-history"></i> Histórico
                        </button>
                    )}
                </div>
                
                {showHistory && currentEssay.id && <VersionHistory essayId={currentEssay.id} onSelectVersion={(c) => { setVersionToRestore(c); setRestoreModalOpen(true); }} />}

                <div className="mt-6 space-y-4">
                     {!isSimulado && (
                        <button onClick={() => setIsSimulado(true)} className="text-[#42047e] font-bold text-sm hover:underline flex items-center gap-2">
                             <i className="fas fa-stopwatch"></i> Ativar Modo Simulado
                        </button>
                     )}
                     <label className="flex items-center gap-3 p-3 rounded-lg bg-[#42047e]/5 border border-[#42047e]/20 cursor-pointer transition-colors hover:bg-[#42047e]/10">
                        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="w-5 h-5 text-[#42047e] rounded border-gray-300 focus:ring-[#42047e]" />
                        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                            Concordo com a <Link href="/recursos/direito-autoral" target="_blank" className="text-[#42047e] underline">Política de Direitos</Link> e uso de dados para IA.
                        </span>
                    </label>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <button onClick={() => handleSave('draft')} disabled={isPending} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50">Salvar Rascunho</button>
                    <button onClick={() => handleSave('submitted')} disabled={isPending || !consent} className="px-8 py-3 bg-[#42047e] text-white font-bold rounded-xl shadow-lg hover:bg-[#2e0259] transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center gap-2">
                        {isPending ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>} Enviar
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}