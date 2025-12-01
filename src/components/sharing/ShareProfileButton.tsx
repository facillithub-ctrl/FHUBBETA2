"use client";

import { useRef, useState, useEffect } from 'react';
import { UserProfile } from '@/app/dashboard/types';
import { ProfileShareCard, ShareCardStats } from './ProfileShareCard';
import { useProfileShare } from '@/features/share'; 

interface ShareProfileButtonProps {
  profile: UserProfile;
  stats: ShareCardStats;
  className?: string;
  variant?: 'primary' | 'secondary' | 'icon';
}

export default function ShareProfileButton({ profile, stats, className = "", variant = 'primary' }: ShareProfileButtonProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const { 
    isGenerating, 
    previewUrl, 
    safeAvatarUrl,
    prepareEnvironment,
    handleGenerate, 
    handleShare, 
    clearPreview 
  } = useProfileShare(profile.nickname || "", profile.avatar_url);

  const cardRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Preload ao abrir
  useEffect(() => {
      if (isMenuOpen) prepareEnvironment();
  }, [isMenuOpen, prepareEnvironment]);

  const renderTriggerButton = () => {
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
  };

  return (
    <>
      <div className="relative inline-block text-left" ref={menuRef}>
        
        {/* --- CARD OCULTO (Renderização Off-Screen) --- */}
        {/* left: 200vw garante que está fora da tela, mas visível para a engine de renderização */}
        <div style={{ position: 'fixed', left: '200vw', top: 0, zIndex: -50 }}>
           {profile && (
               <ProfileShareCard 
                   innerRef={cardRef} 
                   profile={profile} 
                   stats={stats} 
                   avatarOverride={safeAvatarUrl ?? null} 
                   isExporting={true} // Ativa o modo leve (sem blur)
                />
            )}
        </div>

        {renderTriggerButton()}

        {isMenuOpen && (
          <div className="absolute right-0 bottom-full mb-2 w-64 rounded-xl shadow-xl bg-white border border-gray-100 z-40 animate-fade-in-up origin-bottom-right">
              <div className="p-2 space-y-1">
                  <button 
                      onClick={() => {
                          if (cardRef.current) handleGenerate(cardRef.current);
                          setIsMenuOpen(false);
                      }}
                      disabled={isGenerating}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-purple/5 hover:text-brand-purple flex items-center gap-3 transition-colors disabled:opacity-50"
                  >
                      {isGenerating ? (
                          <i className="fas fa-spinner fa-spin w-5 text-center text-brand-purple"></i>
                      ) : (
                          <i className="fas fa-image w-5 text-center"></i>
                      )}
                      <span>{isGenerating ? 'Criando PNG...' : 'Baixar Imagem'}</span>
                  </button>

                  <button 
                    onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/u/${profile.nickname}`);
                        setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-purple/5 hover:text-brand-purple flex items-center gap-3 transition-colors"
                  >
                      <i className="fas fa-link w-5 text-center"></i>
                      <span>Copiar Link</span>
                  </button>
              </div>
          </div>
        )}
      </div>

      {/* --- PREVIEW MODAL --- */}
      {previewUrl && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
            <div className="w-full max-w-sm flex flex-col gap-5">
                <div className="flex justify-between items-center text-white px-2">
                    <h3 className="font-bold text-lg">Card Gerado!</h3>
                    <button 
                        onClick={clearPreview}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-gray-900">
                    {/* Exibe o PNG gerado */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-auto object-contain block" 
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleShare}
                        className="w-full py-4 bg-brand-green hover:bg-green-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                    >
                        <i className="fas fa-share-nodes"></i> Enviar / Postar
                    </button>
                    <p className="text-white/50 text-xs text-center px-4">
                        Se não funcionar, segure na imagem para salvar na galeria.
                    </p>
                </div>
            </div>
        </div>
      )}
    </>
  );
}