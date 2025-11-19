"use client";

import { useState, useTransition, useRef, useEffect } from 'react';
import Link from 'next/link';
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
// MUDANÇA: Importamos o novo editor nativo em vez do DynamicRichTextEditor
import NativeRichTextEditor from '@/components/NativeRichTextEditor'; 

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
            console.log("A guardar rascunho automaticamente...");
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
  }, [isSimulado, startTransition]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        addToast({ title: "Erro de Autenticação", message: "Não tens sessão iniciada para fazer o upload.", type: 'error' });
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
        addToast({ title: "Conteúdo em falta", message: 'Escreve um texto ou envia uma imagem para submeter.', type: 'error' });
        return;
    }
    if (status === 'submitted' && !consent) {
        addToast({ title: "Termos Não Aceites", message: 'Precisas de concordar com os termos antes de enviar.', type: 'error' });
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
          setIsSimulado(false);
          addToast({ title: 'Redação Enviada!', message: 'A tua redação foi enviada para correção. Boa sorte!', type: 'success' });
          onBack();
        } else {
          addToast({ title: 'Rascunho Guardado', message: 'O teu progresso foi guardado com sucesso.', type: 'success' });
        }
      } else {
        addToast({ title: 'Erro ao Guardar', message: result.error, type: 'error' });
      }
    });
  };

  const handleRestoreVersion = (content: string) => {
    setVersionToRestore(content);
    setRestoreModalOpen(true);
  };

  const executeRestore = () => {
    if (versionToRestore !== null) {
      setCurrentEssay(prev => ({ ...prev, content: versionToRestore }));
    }
    setRestoreModalOpen(false);
    setVersionToRestore(null);
    setShowHistory(false);
    addToast({ title: "Versão Restaurada", message: "O conteúdo anterior foi carregado no editor.", type: 'success' });
  };

  const handlePlagiarismCheck = async () => {
    if (!currentEssay.content || currentEssay.content.trim().length < 100) {
      addToast({ title: "Texto Insuficiente", message: "Escreve pelo menos 100 caracteres para verificar o plágio.", type: 'error' });
      return;
    }
    setIsCheckingPlagiarism(true);
    const result = await checkForPlagiarism(currentEssay.content);
    if (result.data) {
      setPlagiarismResult(result.data);
    } else {
      addToast({ title: "Erro na Verificação", message: result.error!, type: 'error' });
    }
    setIsCheckingPlagiarism(false);
  };
  
  const handleExport = () => {
      // Cria um blob simples de texto. Futuramente podemos melhorar para PDF.
      const element = document.createElement("a");
      // Remove tags HTML básicas para exportação em .txt
      const plainText = currentEssay.content?.replace(/<[^>]+>/g, '\n') || '';
      const file = new Blob([plainText], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${currentEssay.title || 'minha_redacao'}.txt`;
      document.body.appendChild(element); // Necessário para Firefox
      element.click();
      document.body.removeChild(element);
  };

  if (!selectedPrompt && !essay) {
    return <PromptSelector prompts={prompts} onSelect={setSelectedPrompt} onBack={onBack} />;
  }

  return (
    <div className="relative min-h-screen pb-20">
        <PlagiarismResultModal result={plagiarismResult} onClose={() => setPlagiarismResult(null)} />
        <ConfirmationModal
          isOpen={isRestoreModalOpen}
          title="Restaurar Versão?"
          message="O conteúdo atual no editor será permanentemente substituído. Desejas continuar?"
          onConfirm={executeRestore}
          onClose={() => setRestoreModalOpen(false)}
          confirmText="Sim, Restaurar"
        />
        
        <div className="flex justify-between items-center mb-6">
            <button onClick={onBack} className="text-sm text-[#42047e] font-bold hover:underline flex items-center">
                <i className="fas fa-arrow-left mr-2"></i> Voltar
            </button>
            {isSimulado && (
                <div className="animate-pulse">
                    <Timer isRunning={isSimulado} durationInSeconds={5400} onTimeUp={() => addToast({ title: "Tempo Esgotado!", message: "O teu tempo para o simulado acabou.", type: 'error'})} />
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Coluna da Esquerda: Detalhes do Tema */}
            <div className="bg-white dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 h-fit lg:sticky top-6">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#42047e] to-[#07f49e] mb-2">
                    {selectedPrompt?.title}
                </h2>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
                    <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{selectedPrompt?.source}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                    {selectedPrompt?.description}
                </p>
                
                <h3 className="font-bold text-md mb-4 border-b dark:border-gray-800 pb-2 text-[#42047e] dark:text-white">
                    Textos Motivadores
                </h3>
                <div className="space-y-6 text-sm text-gray-600 dark:text-gray-300 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedPrompt?.motivational_text_1 && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border-l-4 border-[#42047e]">
                            <p className="whitespace-pre-wrap leading-relaxed">{selectedPrompt.motivational_text_1}</p>
                        </div>
                    )}
                    {selectedPrompt?.motivational_text_2 && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border-l-4 border-[#07f49e]">
                            <p className="whitespace-pre-wrap leading-relaxed">{selectedPrompt.motivational_text_2}</p>
                        </div>
                    )}
                    {selectedPrompt?.motivational_text_3_image_url && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                            <Image 
                                src={selectedPrompt.motivational_text_3_image_url} 
                                alt="Texto motivador visual" 
                                width={500} 
                                height={300} 
                                className="rounded-lg w-full h-auto mb-2 object-cover shadow-md" 
                            />
                            {selectedPrompt.motivational_text_3_description && <p className="text-xs italic mb-1 opacity-80">{selectedPrompt.motivational_text_3_description}</p>}
                            {selectedPrompt.motivational_text_3_image_source && <p className="text-[10px] text-gray-400 uppercase">Fonte: {selectedPrompt.motivational_text_3_image_source}</p>}
                        </div>
                    )}
                </div>
            </div>

            {/* Coluna da Direita: Editor */}
            <div className="bg-white dark:bg-[#121212] p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col">
                <input
                    type="text"
                    placeholder="Título da tua redação..."
                    value={currentEssay.title || ''}
                    onChange={(e) => setCurrentEssay(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full text-2xl font-bold p-2 mb-6 bg-transparent border-b-2 border-transparent focus:border-[#42047e] focus:outline-none transition-colors placeholder-gray-300 dark:text-white"
                />

                {currentEssay.image_submission_url ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                    <div className="relative w-full max-w-md">
                        <Image 
                            src={currentEssay.image_submission_url} 
                            alt="Redação enviada" 
                            width={500} 
                            height={700} 
                            className="w-full h-auto rounded-lg shadow-md" 
                        />
                        <button 
                            onClick={() => setCurrentEssay(prev => ({...prev, image_submission_url: undefined}))}
                            className="absolute -top-4 -right-4 bg-red-500 text-white w-8 h-8 rounded-full hover:bg-red-600 shadow-lg flex items-center justify-center transition-transform hover:scale-110"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <p className="mt-4 text-sm text-gray-500 font-medium">Imagem carregada com sucesso.</p>
                  </div>
                ) : (
                  <>
                    {/* MUDANÇA: Componente NativeRichTextEditor Substituído */}
                    <div className="flex-1 min-h-[400px]">
                        <NativeRichTextEditor
                            value={currentEssay.content || ''}
                            onChange={(content) => setCurrentEssay(prev => ({ ...prev, content }))}
                            placeholder="Começa a escrever aqui... O nosso editor guarda tudo automaticamente."
                        />
                    </div>

                    <div className="relative my-8 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                        </div>
                        <span className="relative bg-white dark:bg-[#121212] px-4 text-xs text-gray-400 uppercase tracking-widest font-bold">
                            ou envia uma foto
                        </span>
                    </div>

                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/jpg" className="hidden" />
                    <button 
                        onClick={() => fileInputRef.current?.click()} 
                        disabled={uploading} 
                        className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 hover:border-[#42047e] hover:text-[#42047e] hover:bg-[#42047e]/5 transition-all flex flex-col items-center gap-2 group"
                    >
                      <i className={`fas ${uploading ? 'fa-spinner fa-spin' : 'fa-camera'} text-2xl group-hover:scale-110 transition-transform`}></i>
                      <span className="font-bold text-sm">{uploading ? 'A enviar...' : 'Clique para enviar uma foto da folha de redação'}</span>
                    </button>
                  </>
                )}
                
                {/* Barra de Ferramentas Inferior (Histórico, Plágio, Exportar) */}
                {currentEssay.id && !currentEssay.image_submission_url && (
                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setShowHistory(!showHistory)} 
                                    className="px-3 py-2 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition"
                                    disabled={!currentEssay.id}
                                >
                                    <i className="fas fa-history mr-2"></i>{showHistory ? 'Ocultar Histórico' : 'Ver Histórico'}
                                </button>
                                <button 
                                    onClick={handleExport} 
                                    className="px-3 py-2 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition"
                                >
                                    <i className="fas fa-file-export mr-2"></i>Exportar .TXT
                                </button>
                            </div>
                            <button 
                                onClick={handlePlagiarismCheck} 
                                disabled={isCheckingPlagiarism} 
                                className="px-4 py-2 rounded-lg text-xs font-bold text-[#42047e] bg-[#42047e]/10 hover:bg-[#42047e]/20 transition flex items-center"
                            >
                                <i className={`fas ${isCheckingPlagiarism ? 'fa-spinner fa-spin' : 'fa-search'} mr-2`}></i>
                                {isCheckingPlagiarism ? 'A verificar...' : 'Verificar Plágio'}
                            </button>
                        </div>
                        {showHistory && <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl"><VersionHistory essayId={currentEssay.id as string} onSelectVersion={handleRestoreVersion} /></div>}
                    </div>
                )}

                {/* Área de Submissão e Termos */}
                <div className="mt-8 space-y-6">
                     {!isSimulado && (
                        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
                            <div>
                                <h4 className="font-bold text-[#42047e] dark:text-blue-400 text-sm">Modo Simulado</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Cronómetro de 90 minutos estilo prova.</p>
                            </div>
                            <button onClick={() => setIsSimulado(true)} className="bg-[#42047e] text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-[#350365] transition shadow-sm">
                                Iniciar
                            </button>
                        </div>
                     )}

                     <label className="flex items-start gap-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                        <div className="relative flex items-center">
                            <input 
                                type="checkbox" 
                                checked={consent} 
                                onChange={(e) => setConsent(e.target.checked)} 
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 checked:border-[#07f49e] checked:bg-[#07f49e] transition-all" 
                            />
                            <i className="fas fa-check absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xs opacity-0 peer-checked:opacity-100 pointer-events-none"></i>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight mt-0.5 select-none">
                            Declaro que li e concordo com a <Link href="/recursos/direito-autoral" target="_blank" className="underline font-bold text-[#42047e] hover:text-[#07f49e]">Política de Direitos de Autor</Link> e autorizo o uso da minha redação para processamento pela Inteligência Artificial do Facillit Hub.
                        </span>
                    </label>

                    <div className="flex gap-4 pt-4 border-t dark:border-gray-800">
                        <button 
                            onClick={() => handleSave('draft')} 
                            disabled={isPending} 
                            className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold py-3 px-4 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50"
                        >
                            {isPending ? 'A guardar...' : 'Guardar Rascunho'}
                        </button>
                        <button 
                            onClick={() => handleSave('submitted')} 
                            disabled={isPending || !consent} 
                            className="flex-1 bg-gradient-to-r from-[#42047e] to-[#07f49e] text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 transition shadow-md disabled:opacity-50 disabled:shadow-none"
                        >
                            {isPending ? 'A enviar...' : 'Enviar para Correção'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
} 