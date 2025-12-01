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

// Helper para converter DataURL em Arquivo
const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: 'image/jpeg' });
};

export default function ShareProfileButton({ profile, stats, className = "", variant = 'primary' }: ShareProfileButtonProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Estados para o Preview Mobile
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fileToShare, setFileToShare] = useState<File | null>(null);

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

  const generateImage = async () => {
    if (!cardRef.current) return null;
    
    try {
        await new Promise(r => setTimeout(r, 100));

        // Configurações otimizadas para evitar crashes e garantir renderização
        const dataUrl = await toJpeg(cardRef.current!, { 
            quality: 0.9, 
            pixelRatio: 1.5, // 1.5 é mais seguro para mobile que 2 ou 3
            cacheBust: true,
            skipAutoScale: true,
            backgroundColor: '#ffffff',
            fontEmbedCSS: "", 
        });

        if (dataUrl.length < 1000) throw new Error("Imagem gerada vazia");
        return dataUrl;
    } catch (err) {
        console.error("Erro ao gerar imagem:", err);
        return null;
    }
  };

  const handleProcess = async () => {
    setIsGenerating(true);
    try {
      // 1. Gera a imagem
      const dataUrl = await generateImage();
      
      if (!dataUrl) throw new Error("Falha na geração");

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
          // --- NOVO FLUXO MOBILE ---
          // Prepara o arquivo, mas NÃO chama navigator.share ainda.
          // Abre o modal primeiro para recuperar o "clique" do usuário depois.
          const file = await dataUrlToFile(dataUrl, `facillit-${profile.nickname}.jpg`);
          setFileToShare(file);
          setPreviewImage(dataUrl); // Isso abre o modal
          setIsMenuOpen(false);
      } else {
          // Desktop: Download direto (funciona bem)
          const link = document.createElement('a');
          link.download = `facillit-${profile.nickname}.jpg`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          addToast({ title: 'Baixado!', message: 'Imagem salva no computador.', type: 'success' });
          setIsMenuOpen(false);
      }

    } catch (error) {
      console.error(error);
      addToast({ title: 'Erro', message: 'Tente novamente.', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Ação de Compartilhar REAL (Chamada pelo botão no modal) ---
  const handleNativeShare = async () => {
      if (!fileToShare || !navigator.share) return;

      try {
          if (navigator.canShare && navigator.canShare({ files: [fileToShare] })) {
              await navigator.share({
                  files: [fileToShare],
                  title: 'Meu Card Facillit',
                  text: 'Confira meu perfil no FacillitHub!',
              });
              addToast({ title: 'Sucesso!', message: 'Compartilhado com sucesso.', type: 'success' });
          } else {
              throw new Error("Formato de arquivo não suportado pelo sistema.");
          }
      } catch (err: any) {
          // Se o usuário cancelar, não é erro crítico
          if (err.name !== 'AbortError') {
             addToast({ title: 'Atenção', message: 'Use a opção "Salvar na Galeria" abaixo.', type: 'info' });
          }
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
        {/* Card Oculto para Renderização */}
        <div style={{ position: 'fixed', top: 0, left: 0, zIndex: -9999, opacity: 0, pointerEvents: 'none', visibility: 'visible' }}>
           {profile && <ProfileShareCard innerRef={cardRef} profile={profile} stats={stats} />}
        </div>

        {renderButtonContent()}

        {isMenuOpen && (
          <div className="absolute right-0 bottom-full mb-2 w-64 rounded-xl shadow-xl bg-white border border-gray-100 z-50 animate-fade-in-up origin-bottom-right">
              <div className="p-2 space-y-1">
                  <button 
                      onClick={handleProcess}
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

      {/* --- MODAL DE PREVIEW OTIMIZADO PARA MOBILE --- */}
      {previewImage && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-4 animate-fade-in overflow-y-auto">
            <div className="relative w-full max-w-sm flex flex-col items-center gap-6 my-auto">
                
                {/* Cabeçalho do Modal */}
                <div className="w-full flex justify-between items-center text-white px-2">
                    <span className="font-bold text-lg">Seu Card</span>
                    <button 
                        onClick={() => setPreviewImage(null)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                {/* Imagem */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                    src={previewImage} 
                    alt="Share Card" 
                    className="w-full h-auto rounded-2xl shadow-2xl border border-white/10" 
                />
                
                {/* Ações Mobile */}
                <div className="w-full space-y-3">
                    {/* Botão de Compartilhamento Nativo (Agora funciona pois é acionado por clique direto) */}
                    <button
                        onClick={handleNativeShare}
                        className="w-full py-3.5 bg-brand-green hover:bg-brand-green/90 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                    >
                        <i className="fas fa-share-nodes"></i> Enviar Agora
                    </button>

                    <div className="text-center">
                        <p className="text-white/40 text-xs mt-2">
                            Ou segure na imagem para salvar na galeria
                        </p>
                    </div>
                </div>
            </div>
        </div>
      )}
    </>
  );
}