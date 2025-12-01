"use client";

import { useState, useRef, useEffect } from 'react';
import { toJpeg } from 'html-to-image';
import { UserProfile } from '@/app/dashboard/types';
import { useToast } from '@/contexts/ToastContext';
import { ProfileShareCard, ShareCardStats } from './ProfileShareCard';

interface ShareProfileButtonProps {
  profile: UserProfile;
  stats: ShareCardStats;
  className?: string;
  variant?: 'primary' | 'secondary' | 'icon';
}

export default function ShareProfileButton({ profile, stats, className = "", variant = 'primary' }: ShareProfileButtonProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Estados para o novo fluxo
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [shareFile, setShareFile] = useState<File | null>(null);
  const [errorLog, setErrorLog] = useState<string>(""); // Log visível para debug

  const cardRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Função auxiliar de log
  const logError = (msg: string, err?: any) => {
      const fullMsg = `${msg} ${err ? JSON.stringify(err, Object.getOwnPropertyNames(err)) : ''}`;
      console.error(fullMsg);
      setErrorLog(prev => prev + "\n- " + msg);
      addToast({ title: 'Erro', message: msg, type: 'error' });
  };

  const generateImage = async () => {
    if (!cardRef.current) return null;
    
    try {
        // Delay crucial para renderização
        await new Promise(r => setTimeout(r, 100));

        const dataUrl = await toJpeg(cardRef.current!, { 
            quality: 0.9,
            pixelRatio: 1.5, // 1.5 é o "sweet spot" para performance mobile
            cacheBust: true,
            skipAutoScale: true,
            backgroundColor: '#ffffff',
            fontEmbedCSS: "", // Evita travar tentando buscar fontes
        });

        if (!dataUrl || dataUrl.length < 100) throw new Error("Imagem gerada vazia");
        return dataUrl;

    } catch (err: any) {
        logError("Falha na renderização (html-to-image)", err);
        return null;
    }
  };

  // PASSO 1: Apenas gera a imagem e prepara o arquivo
  const handlePreparePreview = async () => {
    setErrorLog(""); // Limpa logs anteriores
    setIsGenerating(true);
    
    try {
      const dataUrl = await generateImage();
      
      if (dataUrl) {
          // Converte para File imediatamente para deixar pronto na memória
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], `facillit-${profile.nickname}.jpg`, { type: 'image/jpeg' });

          setShareFile(file);
          setPreviewUrl(dataUrl); // Isso abre o Modal
          setIsMenuOpen(false); // Fecha o menu pequeno
      }
    } catch (error: any) {
      logError("Erro ao preparar imagem", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // PASSO 2: Compartilha o arquivo JÁ PRONTO (Clique instantâneo = Sucesso)
  const handleShareAction = async () => {
      if (!shareFile) return;

      // Verifica suporte do navegador
      if (!navigator.share) {
          logError("Seu navegador não suporta compartilhamento nativo. Salve a imagem manualmente.");
          return;
      }

      if (navigator.canShare && !navigator.canShare({ files: [shareFile] })) {
          logError("O navegador bloqueou este tipo de arquivo.");
          return;
      }

      try {
          await navigator.share({
              files: [shareFile],
              title: 'Meu Perfil Facillit',
              text: `Confira meu perfil: ${window.location.origin}/u/${profile.nickname}`,
          });
          addToast({ title: 'Sucesso!', message: 'Compartilhado.', type: 'success' });
      } catch (err: any) {
          if (err.name !== 'AbortError') {
             logError("Falha ao abrir menu de compartilhar", err);
          }
      }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/u/${profile.nickname}`;
    navigator.clipboard.writeText(url);
    addToast({ title: 'Copiado!', message: 'Link copiado.', type: 'success' });
    setIsMenuOpen(false);
  };

  // Renderização condicional do botão principal
  const renderButtonContent = () => {
    if (variant === 'icon') {
        return (
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className={`w-10 h-10 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors shadow-sm ${className}`}
            >
                <i className="fas fa-share-alt"></i>
            </button>
        )
    }
    return (
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`font-bold py-2 px-6 rounded-full transition-all shadow-sm flex items-center justify-center text-sm gap-2 bg-brand-purple text-white hover:opacity-90 ${className}`}
      >
        <i className="fas fa-share-alt"></i> Compartilhar
      </button>
    );
  }

  return (
    <>
      <div className="relative inline-block text-left" ref={menuRef}>
        {/* Elemento Invisível para Captura */}
        <div style={{ position: 'fixed', top: 0, left: 0, zIndex: -9999, opacity: 0, pointerEvents: 'none', visibility: 'visible' }}>
           {profile && <ProfileShareCard innerRef={cardRef} profile={profile} stats={stats} />}
        </div>

        {renderButtonContent()}

        {isMenuOpen && (
          <div className="absolute right-0 bottom-full mb-2 w-64 rounded-xl shadow-xl bg-white border border-gray-100 z-50 animate-fade-in-up origin-bottom-right">
              <div className="p-2 space-y-1">
                  <button 
                      onClick={handlePreparePreview}
                      disabled={isGenerating}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-purple/5 hover:text-brand-purple flex items-center gap-3 transition-colors"
                  >
                      <i className={`fas ${isGenerating ? 'fa-spinner fa-spin' : 'fa-image'} w-5 text-center`}></i>
                      <span>{isGenerating ? 'Gerando...' : 'Gerar Imagem'}</span>
                  </button>

                  <button 
                      onClick={handleCopyLink}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-purple/5 hover:text-brand-purple flex items-center gap-3 transition-colors"
                  >
                      <i className="fas fa-link w-5 text-center"></i>
                      <span>Copiar Link</span>
                  </button>
              </div>
          </div>
        )}
      </div>

      {/* --- MODAL DE PREVIEW E COMPARTILHAMENTO --- */}
      {previewUrl && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-4 animate-fade-in overflow-y-auto backdrop-blur-sm">
            
            <div className="w-full max-w-sm flex flex-col gap-4 relative">
                {/* Botão Fechar */}
                <button 
                    onClick={() => { setPreviewUrl(null); setShareFile(null); setErrorLog(""); }}
                    className="absolute -top-12 right-0 bg-white/10 w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/20"
                >
                    <i className="fas fa-times"></i>
                </button>

                {/* Área da Imagem */}
                <div className="bg-white/5 p-2 rounded-2xl border border-white/10 shadow-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-auto rounded-xl block" 
                    />
                </div>

                {/* Controles de Ação */}
                <div className="flex flex-col gap-3 mt-2">
                    <button
                        onClick={handleShareAction}
                        className="w-full py-4 bg-green-500 hover:bg-green-600 active:scale-95 transition-all text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                    >
                        <i className="fas fa-share-nodes text-xl"></i> 
                        Enviar / Postar
                    </button>
                    
                    <p className="text-white/40 text-xs text-center px-4">
                        Se o botão acima não funcionar, segure na imagem para salvar na galeria.
                    </p>

                    {/* Área de Erros Visível (Debug) */}
                    {errorLog && (
                        <div className="mt-4 p-3 bg-red-900/50 rounded-lg border border-red-500/30">
                            <p className="text-red-200 text-xs font-mono font-bold mb-1">Log de Erros:</p>
                            <pre className="text-[10px] text-red-300 whitespace-pre-wrap">{errorLog}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </>
  );
}