// src/app/dashboard/applications/write/components/EssayEditor.tsx
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
    if (promptIdFromUrl) {
        return prompts.find(p => p.id === promptIdFromUrl) || null;
    }
    return prompts.find(p => p.id === essay?.prompt_id) || null;
  });

  const [showHistory, setShowHistory] = useState(false);
  const [isSimulado, setIsSimulado] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);
  const [plagiarismResult, setPlagiarismResult] = useState<PlagiarismResult | null>(null);
  const [isRestoreModalOpen, setRestoreModalOpen] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('promptId')) {
        router.replace('/dashboard/applications/write', { scroll: false });
    }
  }, [searchParams, router]);
  
  useEffect(() => {
    if (isSimulado) {
      autoSaveTimerRef.current = setInterval(() => {
        setCurrentEssay(prevEssay => {
          if(prevEssay.content && prevEssay.id) {
            startTransition(async () => {
              await saveOrUpdateEssay({ ...prevEssay, status: 'draft' });
            });
          }
          return prevEssay;
        });
      }, 60000);
    } else if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }
    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [isSimulado]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        addToast({ title: "Erro", message: "Usuário não logado.", type: 'error' });
        setUploading(false);
        return;
    }

    const filePath = `submissions/${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('essays').upload(filePath, file);

    if (uploadError) {
      addToast({ title: "Erro no Upload", message: uploadError.message, type: 'error' });
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('essays').getPublicUrl(filePath);
    setCurrentEssay(prev => ({ ...prev, image_submission_url: data.publicUrl, content: '' }));
    setUploading(false);
  };

  const handleSave = (status: 'draft' | 'submitted') => {
    if (status === 'submitted' && !currentEssay.content && !currentEssay.image_submission_url) {
        addToast({ title: "Erro", message: 'Escreva um texto ou envie uma imagem.', type: 'error' });
        return;
    }
    if (status === 'submitted' && !consent) {
        addToast({ title: "Atenção", message: 'Aceite os termos para enviar.', type: 'error' });
        return;
    }

    startTransition(async () => {
      const updatedData = {
        ...currentEssay,
        status,
        prompt_id: selectedPrompt?.id,
        consent_to_ai_training: consent,
      };
      const result = await saveOrUpdateEssay(updatedData);
      
      if (!result.error) {
        if (status === 'submitted') {
          addToast({ title: 'Sucesso!', message: 'Redação enviada para correção.', type: 'success' });
          onBack();
        } else {
          addToast({ title: 'Salvo', message: 'Rascunho salvo.', type: 'success' });
          if (result.data) setCurrentEssay(prev => ({ ...prev, id: result.data.id }));
        }
      } else {
        addToast({ title: 'Erro', message: result.error, type: 'error' });
      }
    });
  };

  const handlePlagiarismCheck = async () => {
    if (!currentEssay.content || currentEssay.content.length < 50) {
       addToast({ title: "Texto Curto", message: "Escreva mais para verificar.", type: 'error' });
       return;
    }
    setIsCheckingPlagiarism(true);
    const result = await checkForPlagiarism(currentEssay.content);
    
    // CORREÇÃO DO BUILD: Verificação explícita
    if (result.data) {
      setPlagiarismResult(result.data);
    } else {
      addToast({ title: "Erro", message: "Falha na verificação.", type: 'error' });
    }
    setIsCheckingPlagiarism(false);
  };
  
  const handleExport = () => {
      const blob = new Blob([currentEssay.content || ''], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `redacao.txt`;
      link.click();
  };

  if (!selectedPrompt && !essay?.id) {
    return <PromptSelector prompts={prompts} onSelect={setSelectedPrompt} onBack={onBack} />;
  }

  return (
    <div className="relative">
        <PlagiarismResultModal result={plagiarismResult} onClose={() => setPlagiarismResult(null)} />
        <ConfirmationModal
          isOpen={isRestoreModalOpen}
          title="Restaurar Versão"
          message="O conteúdo atual será substituído. Continuar?"
          onConfirm={() => {
             if(versionToRestore) setCurrentEssay(p => ({...p, content: versionToRestore}));
             setRestoreModalOpen(false);
          }}
          onClose={() => setRestoreModalOpen(false)}
        />
        
        <div className="flex justify-between items-center mb-4">
            <button onClick={onBack} className="text-sm text-royal-blue font-bold"><i className="fas fa-arrow-left mr-2"></i> Voltar</button>
            {isSimulado && <Timer isRunning={isSimulado} durationInSeconds={5400} onTimeUp={() => alert('Tempo Esgotado!')} />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md h-fit lg:sticky top-6">
                <h2 className="text-xl font-bold dark:text-white-text">{selectedPrompt?.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 mb-4">{selectedPrompt?.description}</p>
                <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300 max-h-96 overflow-y-auto">
                    {selectedPrompt?.motivational_text_1 && <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded"><p>{selectedPrompt.motivational_text_1}</p></div>}
                    {selectedPrompt?.motivational_text_3_image_url && (
                        <Image src={selectedPrompt.motivational_text_3_image_url} alt="Texto motivador" width={400} height={250} className="rounded w-full h-auto" />
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
                <input
                    type="text"
                    placeholder="Título da redação"
                    value={currentEssay.title || ''}
                    onChange={(e) => setCurrentEssay(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full text-2xl font-bold p-2 mb-4 bg-transparent border-b dark:text-white-text"
                />

                {currentEssay.image_submission_url ? (
                  <div className="text-center p-4">
                    <Image src={currentEssay.image_submission_url} alt="Envio" width={400} height={600} className="mx-auto rounded max-h-96 object-contain" />
                    <button onClick={() => setCurrentEssay(p => ({...p, image_submission_url: undefined}))} className="mt-2 text-red-500 text-sm underline">Remover imagem</button>
                  </div>
                ) : (
                  <>
                    <RichTextEditor
                        value={currentEssay.content || ''}
                        onChange={(c) => setCurrentEssay(p => ({ ...p, content: c }))}
                        placeholder="Escreva sua redação..."
                    />
                    <div className="text-center my-4 text-sm text-gray-500">OU</div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full py-2 border-dashed border-2 rounded text-gray-500 hover:text-royal-blue">
                      {uploading ? 'Enviando...' : 'Enviar foto da redação'}
                    </button>
                  </>
                )}
                
                <div className="flex gap-4 mt-4">
                    {currentEssay.id && <button onClick={() => setShowHistory(!showHistory)} className="text-sm text-royal-blue">Histórico</button>}
                    <button onClick={handlePlagiarismCheck} disabled={isCheckingPlagiarism} className="text-sm text-royal-blue">
                        {isCheckingPlagiarism ? 'Verificando...' : 'Verificar Plágio'}
                    </button>
                    <button onClick={handleExport} className="text-sm text-royal-blue">Exportar</button>
                </div>
                
                {showHistory && currentEssay.id && (
                    <VersionHistory essayId={currentEssay.id} onSelectVersion={(c) => { setVersionToRestore(c); setRestoreModalOpen(true); }} />
                )}

                <div className="mt-6 pt-4 border-t">
                     {!isSimulado && <button onClick={() => setIsSimulado(true)} className="text-sm text-blue-600 mb-4 block">Modo Simulado</button>}
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                        <span className="text-xs text-gray-500">Concordo com os termos e uso de dados para IA.</span>
                    </label>
                </div>

                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={() => handleSave('draft')} disabled={isPending} className="px-4 py-2 bg-gray-200 rounded text-gray-800">Rascunho</button>
                    <button onClick={() => handleSave('submitted')} disabled={isPending || !consent} className="px-4 py-2 bg-royal-blue text-white rounded">Enviar</button>
                </div>
            </div>
        </div>
    </div>
  );
}