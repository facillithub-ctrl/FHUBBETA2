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

// Helper para converter DataURL em File objeto para compartilhamento
const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: 'image/jpeg' });
};

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

  const generateImage = async () => {
    if (!cardRef.current) return null;
    
    try {
        await new Promise(r => setTimeout(r, 100));

        const dataUrl = await toJpeg(cardRef.current!, { 
            quality: 0.9,
            pixelRatio: 2, 
            cacheBust: false, // Tente 'true' se a imagem do avatar falhar
            skipAutoScale: true,
            backgroundColor: '#ffffff',
            fontEmbedCSS: "", 
        });
        return dataUrl;
    } catch (err) {
        console.error("Erro na geração da imagem:", err);
        return null;
    }
  };

  const handleProcess = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await generateImage();
      
      if (dataUrl) {
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

          if (isMobile) {
              // --- SOLUÇÃO NATIVA PARA MOBILE (Web Share API) ---
              // Tenta abrir o menu de compartilhamento nativo se suportado
              if (navigator.share && navigator.canShare) {
                  try {
                      const file = await dataUrlToFile(dataUrl, `facillit-${profile.nickname}.jpg`);
                      
                      // Verifica se o navegador suporta compartilhar arquivos
                      if (navigator.canShare({ files: [file] })) {
                          await navigator.share({
                              files: [file],
                              title: 'Meu Card Facillit',
                              text: `Confira meu perfil: facillithub.com/u/${profile.nickname}`,
                          });
                          // Sucesso no compartilhamento nativo
                          addToast({ title: 'Sucesso!', message: 'Card compartilhado.', type: 'success' });
                          setIsMenuOpen(false);
                          setIsGenerating(false);
                          return; // Sai da função, não abre o modal
                      }
                  } catch (shareError) {
                      // Se o usuário cancelar ou o navegador der erro, apenas logamos
                      // e deixamos cair no fallback do modal abaixo.
                      console.log('Web Share cancelado ou não suportado, usando fallback.', shareError);
                  }
              }

              // --- FALLBACK: Modal de Preview ---
              // Usado se o Web Share falhar ou não for suportado
              setPreviewImage(dataUrl);
              addToast({ title: 'Pronto!', message: 'Segure na imagem para salvar.', type: 'success' });
          } else {
              // --- DESKTOP: Download Direto ---
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
      console.error(error);
      addToast({ title: 'Erro', message: 'Não foi possível gerar a imagem.', type: 'error' });
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
        <div style={{ position: 'fixed', top: 0, left: 0, zIndex: -9999, opacity: 0, pointerEvents: 'none', visibility: 'visible' }}>
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
                      <span>{isGenerating ? 'Gerando...' : 'Salvar Imagem'}</span>
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

      {previewImage && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-fade-in">
            <div className="relative max-w-sm w-full bg-transparent flex flex-col items-center">
                <button 
                    onClick={() => setPreviewImage(null)}
                    className="absolute -top-12 right-0 text-white/80 hover:text-white text-sm font-medium flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md"
                >
                    Fechar <i className="fas fa-times"></i>
                </button>
                
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                    src={previewImage} 
                    alt="Share Card" 
                    className="w-full h-auto rounded-xl shadow-2xl border border-white/10" 
                />
                
                <div className="mt-6 text-center bg-black/50 p-4 rounded-xl backdrop-blur-md border border-white/10">
                    <p className="text-white font-bold text-lg mb-1 flex items-center justify-center gap-2">
                        <i className="fas fa-check-circle text-green-400"></i> Pronto!
                    </p>
                    <p className="text-white/80 text-sm">
                        Caso o compartilhamento não abra, segure na imagem acima para <strong>Salvar na Galeria</strong>.
                    </p>
                </div>
            </div>
        </div>
      )}
    </>
  );
}