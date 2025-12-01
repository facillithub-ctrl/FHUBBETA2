"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { toPng } from 'html-to-image';
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
  const cardRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  // Fecha menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- GERADOR DE IMAGEM ---
  const generateImageBlob = async () => {
    if (!cardRef.current) return null;
    
    // Promessa com Timeout para evitar travamento eterno
    const generatePromise = new Promise<Blob | null>(async (resolve, reject) => {
        try {
            await new Promise(r => setTimeout(r, 100)); // Delay para renderização

            const dataUrl = await toPng(cardRef.current!, { 
                cacheBust: false,
                pixelRatio: 2, // 2.0 é o ideal para mobile (boa qualidade e não estoura memória)
                quality: 0.95,
                skipAutoScale: true,
                backgroundColor: '#ffffff',
                fontEmbedCSS: "", 
                filter: (node) => {
                   const element = node as HTMLElement;
                   return !(element.tagName === 'I' && element.classList?.contains('fa-spinner')) &&
                          element.tagName !== 'LINK' && 
                          element.tagName !== 'SCRIPT'; 
                }
            });

            const res = await fetch(dataUrl);
            const blob = await res.blob();
            resolve(blob);

        } catch (err) {
            reject(err);
        }
    });

    // Timeout de 8 segundos
    const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 8000)
    );

    return Promise.race([generatePromise, timeoutPromise]);
  };

  // --- LÓGICA DE DOWNLOAD ---
  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateImageBlob();
      
      if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `facillit-${profile.nickname}.png`;
          link.href = url;
          link.style.display = 'none';
          
          // Anexa ao corpo para garantir funcionamento em iOS/Firefox
          document.body.appendChild(link);
          link.click();
          
          // Limpeza
          setTimeout(() => {
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
          }, 100);

          addToast({ title: 'Sucesso', message: 'Imagem baixada.', type: 'success' });
      } else {
          throw new Error("Falha na geração");
      }
    } catch (error: any) {
      console.error(error);
      if (error.message === "Timeout") {
          addToast({ title: 'Erro de Tempo', message: 'A imagem demorou muito para ser gerada.', type: 'error' });
      } else {
          addToast({ title: 'Erro', message: 'Não foi possível baixar a imagem.', type: 'error' });
      }
    } finally {
      setIsGenerating(false);
      setIsMenuOpen(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/u/${profile.nickname}`;
    navigator.clipboard.writeText(url);
    addToast({ title: 'Copiado!', message: 'Link do perfil copiado.', type: 'success' });
    setIsMenuOpen(false);
  };

  const handleWhatsApp = () => {
    const url = `${window.location.origin}/u/${profile.nickname}`;
    const text = `Dá uma olhada no meu perfil de estudos no Facillit Hub! 🚀 \n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setIsMenuOpen(false);
  };

  const renderButtonContent = () => {
    if (variant === 'icon') {
        return (
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className={`w-10 h-10 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors shadow-sm ${className}`}
                title="Compartilhar"
            >
                <i className="fas fa-share-alt"></i>
            </button>
        )
    }
    
    const baseClasses = "font-bold py-2 px-6 rounded-full transition-all shadow-sm flex items-center justify-center text-sm gap-2";
    const variantClasses = variant === 'primary' 
        ? "bg-brand-purple text-white hover:opacity-90"
        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50";

    return (
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`${baseClasses} ${variantClasses} ${className}`}
      >
        <i className="fas fa-share-alt"></i> Compartilhar
      </button>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Oculto visualmente mas presente na árvore DOM para o print */}
      <div style={{ position: 'fixed', top: 0, left: 0, zIndex: -9999, opacity: 0, pointerEvents: 'none' }}>
         {profile && <ProfileShareCard innerRef={cardRef} profile={profile} stats={stats} />}
      </div>

      {renderButtonContent()}

      {isMenuOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-64 rounded-xl shadow-2xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transform origin-bottom-right transition-all animate-fade-in-up">
            <div className="p-3 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Compartilhar Perfil</p>
            </div>
            
            <div className="p-2 space-y-1">
                
                {/* Opção 1: Baixar Imagem */}
                <button 
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-purple transition-colors flex items-center gap-3 disabled:opacity-50"
                >
                    <div className="w-8 h-8 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple shrink-0">
                        {isGenerating ? <i className="fas fa-spinner fa-spin text-xs"></i> : <i className="fas fa-download"></i>}
                    </div>
                    <span>{isGenerating ? 'Gerando...' : 'Baixar Imagem'}</span>
                </button>

                <div className="h-px bg-gray-100 my-1 mx-2"></div>

                {/* Opção 2: WhatsApp */}
                <button 
                    onClick={handleWhatsApp}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-3"
                >
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                        <i className="fab fa-whatsapp"></i>
                    </div>
                    <span>Enviar no WhatsApp</span>
                </button>

                {/* Opção 3: Copiar Link */}
                <button 
                    onClick={handleCopyLink}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-purple transition-colors flex items-center gap-3"
                >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                        <i className="fas fa-link"></i>
                    </div>
                    <span>Copiar Link</span>
                </button>
            </div>
        </div>
      )}
    </div>
  );
}