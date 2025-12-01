"use client";

import { useState, useRef, useEffect } from 'react';
import { toJpeg } from 'html-to-image'; // MUDANÇA: Usar JPEG é mais leve e rápido no mobile
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

  // --- GERADOR DE IMAGEM BLINDADO ---
  const generateImage = async () => {
    if (!cardRef.current) return null;
    
    try {
        // Pequeno delay para garantir que o CSS carregou
        await new Promise(r => setTimeout(r, 100));

        // Configuração segura para Mobile (JPEG + Ratio 2)
        const dataUrl = await toJpeg(cardRef.current!, { 
            quality: 0.95,
            pixelRatio: 2, // 2 é o equilíbrio perfeito. 3+ trava o iOS.
            cacheBust: false,
            skipAutoScale: true,
            backgroundColor: '#ffffff',
            fontEmbedCSS: "", // Evita erro de CORS em fontes
        });
        return dataUrl;
    } catch (err) {
        console.error("Erro na geração:", err);
        return null;
    }
  };

  const handleProcess = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await generateImage();
      
      if (dataUrl) {
          // Detecta se é dispositivo móvel (básico)
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

          if (isMobile) {
              // NO MOBILE: Mostra o preview para salvar manualmente (Download auto falha no iOS)
              setPreviewImage(dataUrl);
              addToast({ title: 'Pronto!', message: 'Segure na imagem para salvar nos seus Stories.', type: 'success' });
          } else {
              // NO DESKTOP: Baixa automaticamente
              const link = document.createElement('a');
              link.download = `facillit-${profile.nickname}.jpg`;
              link.href = dataUrl;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              addToast({ title: 'Baixado!', message: 'Imagem salva no computador.', type: 'success' });
          }
          
          setIsMenuOpen(false);
      } else {
          throw new Error("Falha na geração");
      }
    } catch (error) {
      addToast({ title: 'Erro', message: 'Tente novamente.', type: 'error' });
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
        <div style={{ position: 'fixed', top: 0, left: 0, zIndex: -9999, opacity: 0, pointerEvents: 'none' }}>
           {profile && <ProfileShareCard innerRef={cardRef} profile={profile} stats={stats} />}
        </div>

        {renderButtonContent()}

        {isMenuOpen && (
          <div className="absolute right-0 bottom-full mb-2 w-56 rounded-xl shadow-xl bg-white border border-gray-100 z-50 animate-fade-in-up origin-bottom-right">
              <div className="p-2 space-y-1">
                  <button 
                      onClick={handleProcess}
                      disabled={isGenerating}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-purple/5 hover:text-brand-purple flex items-center gap-3 transition-colors"
                  >
                      <i className={`fas ${isGenerating ? 'fa-spinner fa-spin' : 'fa-image'} w-5 text-center`}></i>
                      <span>{isGenerating ? 'Gerando...' : 'Gerar Cartão'}</span>
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

      {/* MODAL DE PREVIEW (CRÍTICO PARA MOBILE) */}
      {previewImage && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-fade-in">
            <div className="relative max-w-sm w-full">
                <button 
                    onClick={() => setPreviewImage(null)}
                    className="absolute -top-12 right-0 text-white/80 hover:text-white text-sm font-medium flex items-center gap-2"
                >
                    Fechar <i className="fas fa-times-circle text-xl"></i>
                </button>
                
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                    src={previewImage} 
                    alt="Share Card" 
                    className="w-full h-auto rounded-xl shadow-2xl border border-white/10" 
                />
                
                <div className="mt-6 text-center">
                    <p className="text-white font-bold text-lg mb-1">Pronto!</p>
                    <p className="text-white/60 text-sm">Segure na imagem para salvar ou compartilhar nos Stories.</p>
                </div>
            </div>
        </div>
      )}
    </>
  );
}