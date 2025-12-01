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
  const menuRef = useRef<HTMLDivElement>(null); // Referência para fechar ao clicar fora
  const { addToast } = useToast();

  // Fecha o menu se clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- FUNÇÃO GERADORA DE IMAGEM (Reutilizável) ---
  const generateImageBlob = async () => {
    if (!cardRef.current) return null;
    
    // Pequeno delay para garantir renderização
    await new Promise(resolve => setTimeout(resolve, 200));

    const dataUrl = await toPng(cardRef.current, { 
        cacheBust: false,
        pixelRatio: 4, 
        quality: 1.0,
        skipAutoScale: true,
        backgroundColor: '#ffffff',
        fontEmbedCSS: "", 
        filter: (node) => {
           const element = node as HTMLElement;
           return !(element.tagName === 'I' && element.classList?.contains('fa-spinner')) &&
                  element.tagName !== 'LINK'; 
        }
    });

    const res = await fetch(dataUrl);
    return await res.blob();
  };

  // 1. Ação: Compartilhamento Nativo (Stories / Mobile)
  const handleNativeShare = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateImageBlob();
      if (!blob) throw new Error("Falha ao gerar");

      const file = new File([blob], `perfil-${profile.nickname}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Perfil Facillit - @${profile.nickname}`,
          text: `Confira meu perfil no Facillit Hub!`,
        });
      } else {
        addToast({ title: 'Indisponível', message: 'Seu navegador não suporta compartilhamento direto. Tente baixar.', type: 'info' });
      }
    } catch (error) {
      console.error(error);
      addToast({ title: 'Erro', message: 'Erro ao gerar imagem.', type: 'error' });
    } finally {
      setIsGenerating(false);
      setIsMenuOpen(false);
    }
  };

  // 2. Ação: Baixar Imagem (Desktop)
  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateImageBlob();
      if (!blob) throw new Error("Falha ao gerar");
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `facillit-perfil-${profile.nickname}.png`;
      link.href = url;
      link.click();
      
      URL.revokeObjectURL(url);
      addToast({ title: 'Download Concluído', message: 'Imagem salva no seu dispositivo.', type: 'success' });
    } catch (error) {
      addToast({ title: 'Erro', message: 'Erro ao baixar imagem.', type: 'error' });
    } finally {
      setIsGenerating(false);
      setIsMenuOpen(false);
    }
  };

  // 3. Ação: Copiar Link
  const handleCopyLink = () => {
    const url = `${window.location.origin}/u/${profile.nickname}`;
    navigator.clipboard.writeText(url);
    addToast({ title: 'Link Copiado', message: 'Link do perfil copiado para a área de transferência.', type: 'success' });
    setIsMenuOpen(false);
  };

  // 4. Ação: WhatsApp (Texto)
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
                title="Opções de Compartilhamento"
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
      {/* Oculto visualmente mas presente para o print */}
      <div style={{ position: 'fixed', top: 0, left: 0, zIndex: -9999, opacity: 0, pointerEvents: 'none' }}>
         {profile && <ProfileShareCard innerRef={cardRef} profile={profile} stats={stats} />}
      </div>

      {/* Botão Principal */}
      {renderButtonContent()}

      {/* --- MENU DROPDOWN / POPOVER --- */}
      {isMenuOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-64 rounded-xl shadow-2xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transform origin-bottom-right transition-all animate-fade-in-up">
            <div className="p-3 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Compartilhar Perfil</p>
            </div>
            
            <div className="p-2 space-y-1">
                
                {/* Opção 1: Stories / Nativo */}
                <button 
                    onClick={handleNativeShare}
                    disabled={isGenerating}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-purple transition-colors flex items-center gap-3"
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white shadow-sm">
                        {isGenerating ? <i className="fas fa-spinner fa-spin text-xs"></i> : <i className="fab fa-instagram"></i>}
                    </div>
                    <div>
                        <span className="block">Postar / Stories</span>
                        <span className="text-[10px] text-gray-400 font-normal">Abrir app nativo</span>
                    </div>
                </button>

                {/* Opção 2: Baixar */}
                <button 
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-purple transition-colors flex items-center gap-3"
                >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                        {isGenerating ? <i className="fas fa-spinner fa-spin text-xs"></i> : <i className="fas fa-download"></i>}
                    </div>
                    <span>Baixar Imagem</span>
                </button>

                <div className="h-px bg-gray-100 my-1 mx-2"></div>

                {/* Opção 3: WhatsApp */}
                <button 
                    onClick={handleWhatsApp}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-3"
                >
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <i className="fab fa-whatsapp"></i>
                    </div>
                    <span>Enviar no WhatsApp</span>
                </button>

                {/* Opção 4: Copiar Link */}
                <button 
                    onClick={handleCopyLink}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-purple transition-colors flex items-center gap-3"
                >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
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