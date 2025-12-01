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

// Helper para converter DataURL em Arquivo (com logs)
const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
    try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        return new File([blob], filename, { type: 'image/jpeg' });
    } catch (error) {
        throw new Error(`Falha na conversão DataURL -> File: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export default function ShareProfileButton({ profile, stats, className = "", variant = 'primary' }: ShareProfileButtonProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Estado para armazenar logs de erro visíveis na tela (caso alerts sejam bloqueados)
  const [debugLog, setDebugLog] = useState<string>(""); 

  const cardRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  // Função para logar na tela do celular
  const log = (msg: string, isError = false) => {
      console.log(msg);
      if (isError) {
          // Mostra um alert nativo para garantir que você veja o erro
          alert(`ERRO: ${msg}`);
          setDebugLog(prev => prev + "\n[ERRO] " + msg);
      } else {
          // Opcional: comentar o alert abaixo se ficar muito chato, mas útil para saber onde parou
          // alert(`INFO: ${msg}`);
          setDebugLog(prev => prev + "\n[OK] " + msg);
      }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const generateImage = async () => {
    if (!cardRef.current) {
        log("Referência do Card (cardRef) está nula!", true);
        return null;
    }
    
    try {
        log("1. Iniciando html-to-image...");
        
        // Pequeno delay para garantir renderização
        await new Promise(r => setTimeout(r, 100));

        // Verificação de segurança do tamanho
        if (cardRef.current.clientWidth === 0) {
            log("AVISO: O Card tem largura 0px. Tentando forçar visibilidade...");
        }

        const dataUrl = await toJpeg(cardRef.current!, { 
            quality: 0.85, // Reduzido levemente para evitar crash de memória
            pixelRatio: 1.5, // Reduzido de 2 para 1.5 para maior compatibilidade mobile
            cacheBust: true, // Tenta burlar cache de imagens
            skipAutoScale: true,
            backgroundColor: '#ffffff',
            fontEmbedCSS: "", // Importante: evita carregar fontes externas que bloqueiam o canvas
        });

        log(`2. Imagem gerada! Comprimento da string: ${dataUrl.length}`);
        
        if (dataUrl.length < 1000) {
            throw new Error("Imagem gerada parece estar vazia ou corrompida.");
        }

        return dataUrl;
    } catch (err: any) {
        log(`FALHA na geração da imagem (toJpeg): ${err.message || JSON.stringify(err)}`, true);
        return null;
    }
  };

  const handleProcess = async () => {
    setDebugLog("Iniciando processo...");
    setIsGenerating(true);
    
    try {
      // Passo 1: Gerar DataURL
      const dataUrl = await generateImage();
      
      if (!dataUrl) {
          throw new Error("DataURL não foi retornado.");
      }

      // Detecção de Mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      log(`Ambiente detectado: ${isMobile ? 'MOBILE' : 'DESKTOP'}`);

      if (isMobile) {
          // Passo 2: Converter para Arquivo
          log("3. Convertendo para objeto File...");
          let file: File;
          try {
             file = await dataUrlToFile(dataUrl, `facillit-${profile.nickname}.jpg`);
             log(`Arquivo criado: ${file.name} (${file.size} bytes, type: ${file.type})`);
          } catch (e: any) {
             throw new Error(`Erro ao criar arquivo: ${e.message}`);
          }

          // Passo 3: Verificar suporte a Share API
          if (!navigator.share) {
              throw new Error("Navegador NÃO suporta navigator.share");
          }

          if (!navigator.canShare) {
              log("Aviso: navigator.canShare não existe, tentando compartilhar mesmo assim...");
          } else if (!navigator.canShare({ files: [file] })) {
             throw new Error("O navegador diz que NÃO pode compartilhar este tipo de arquivo.");
          }

          // Passo 4: Compartilhar
          log("4. Abrindo menu de compartilhamento nativo...");
          try {
              await navigator.share({
                  files: [file],
                  title: 'Meu Card Facillit',
                  text: 'Confira meu perfil!',
              });
              log("SUCESSO: Compartilhamento concluído!");
              addToast({ title: 'Sucesso!', message: 'Card compartilhado.', type: 'success' });
          } catch (shareError: any) {
              if (shareError.name === 'AbortError') {
                  log("Usuário cancelou/fechou o menu de compartilhamento.");
              } else {
                  throw new Error(`Erro na API Share: ${shareError.message} / Name: ${shareError.name}`);
              }
          }

      } else {
          // Desktop: Download direto
          const link = document.createElement('a');
          link.download = `facillit-${profile.nickname}.jpg`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          addToast({ title: 'Baixado!', message: 'Imagem salva no computador.', type: 'success' });
      }
      
      setIsMenuOpen(false);

    } catch (error: any) {
      log(error.message || "Erro desconhecido", true);
      addToast({ title: 'Erro', message: 'Veja o log na tela.', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/u/${profile.nickname}`;
    navigator.clipboard.writeText(url);
    addToast({ title: 'Copiado!', message: 'Link do perfil copiado.', type: 'success' });
    setIsMenuOpen(false);
  };

  const renderButtonContent = () => {
    if (variant === 'icon') {
        return (
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className={`w-10 h-10 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors shadow-sm ${className}`}
                aria-label="Compartilhar"
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
        {/* Renderização oculta para captura */}
        <div style={{ position: 'fixed', top: 0, left: 0, zIndex: -9999, opacity: 0, pointerEvents: 'none', visibility: 'visible' }}>
           {profile && <ProfileShareCard innerRef={cardRef} profile={profile} stats={stats} />}
        </div>

        {renderButtonContent()}

        {isMenuOpen && (
          <div className="absolute right-0 bottom-full mb-2 w-72 rounded-xl shadow-xl bg-white border border-gray-100 z-50 animate-fade-in-up origin-bottom-right overflow-hidden">
              <div className="p-2 space-y-1">
                  <button 
                      onClick={handleProcess}
                      disabled={isGenerating}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-purple/5 hover:text-brand-purple flex items-center gap-3 transition-colors"
                  >
                      <i className={`fas ${isGenerating ? 'fa-spinner fa-spin' : 'fa-image'} w-5 text-center`}></i>
                      <span>{isGenerating ? 'Processando...' : 'Gerar Imagem (Debug)'}</span>
                  </button>

                  <button 
                      onClick={handleCopyLink}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-purple/5 hover:text-brand-purple flex items-center gap-3 transition-colors"
                  >
                      <i className="fas fa-link w-5 text-center"></i>
                      <span>Copiar Link</span>
                  </button>
              </div>
              
              {/* ÁREA DE LOG VISUAL NA UI (Para Debug Mobile) */}
              {debugLog && (
                  <div className="bg-gray-900 p-2 m-2 rounded text-[10px] text-green-400 font-mono overflow-auto max-h-32 whitespace-pre-wrap">
                      {debugLog}
                  </div>
              )}
          </div>
        )}
      </div>
    </>
  );
}