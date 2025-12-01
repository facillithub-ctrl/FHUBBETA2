"use client";

import { useRef, useState, useEffect } from 'react';
import { UserProfile } from '@/app/dashboard/types';
import { ProfileShareCard, ShareCardStats, CardTheme } from './ProfileShareCard';
import { useProfileShare } from '@/features/share'; 

interface ShareProfileButtonProps {
  profile: UserProfile;
  stats: ShareCardStats;
  className?: string;
  variant?: 'primary' | 'secondary' | 'icon';
}

export default function ShareProfileButton({ profile, stats, className = "", variant = 'primary' }: ShareProfileButtonProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Estados de Personalização
  const [theme, setTheme] = useState<CardTheme>('gradient');
  const [showAvatar, setShowAvatar] = useState(true);

  const { 
    isGenerating, 
    previewUrl, 
    safeAvatarUrl,
    safeLogoUrl, 
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
        
        {/* --- CARD OCULTO --- */}
        <div style={{ 
            position: 'fixed', 
            left: '200vw', 
            top: 0, 
            zIndex: -50,
            width: '400px', 
            minWidth: '400px',
            height: '711px',
            overflow: 'hidden'
        }}>
           {profile && (
               <ProfileShareCard 
                   innerRef={cardRef} 
                   profile={profile} 
                   stats={stats} 
                   avatarOverride={safeAvatarUrl ?? null}
                   logoOverride={safeLogoUrl ?? null} 
                   isExporting={true}
                   theme={theme}
                   showAvatar={showAvatar}
                />
            )}
        </div>

        {renderTriggerButton()}

        {/* --- MENU DE OPÇÕES --- */}
        {isMenuOpen && (
          <div className="absolute right-0 bottom-full mb-3 w-72 rounded-2xl shadow-2xl bg-white border border-gray-100 z-40 animate-fade-in-up origin-bottom-right p-3">
              
              {/* Seletor de Tema */}
              <div className="flex gap-2 mb-3 bg-gray-50 p-1 rounded-xl">
                  {['gradient', 'light', 'dark'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t as CardTheme)}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                            theme === t 
                            ? 'bg-white shadow text-brand-purple' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {t === 'gradient' ? 'Modern' : t === 'light' ? 'Clean' : 'Dark'}
                      </button>
                  ))}
              </div>

              {/* Toggle Avatar */}
              <div className="flex items-center justify-between px-2 mb-3">
                  <span className="text-xs font-medium text-gray-600">Mostrar Avatar</span>
                  <button 
                    onClick={() => setShowAvatar(!showAvatar)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${showAvatar ? 'bg-brand-purple' : 'bg-gray-200'}`}
                  >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${showAvatar ? 'left-6' : 'left-1'}`}></div>
                  </button>
              </div>

              <hr className="border-gray-100 my-2" />

              <div className="space-y-1">
                  <button 
                      onClick={() => {
                          if (cardRef.current) handleGenerate(cardRef.current);
                          setIsMenuOpen(false);
                      }}
                      disabled={isGenerating}
                      className="w-full text-left px-3 py-3 rounded-xl text-sm font-bold text-white bg-brand-purple hover:bg-brand-purple/90 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                      {isGenerating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-image"></i>}
                      <span>{isGenerating ? 'Criando...' : 'Gerar Imagem'}</span>
                  </button>

                  <button 
                    onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/u/${profile.nickname}`);
                        setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                  >
                      <i className="fas fa-link"></i>
                      <span>Copiar Link</span>
                  </button>
              </div>
          </div>
        )}
      </div>

      {/* --- PREVIEW MODAL MELHORADO --- */}
      {previewUrl && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in">
            <div className="w-full max-w-sm flex flex-col gap-6 animate-fade-in-up">
                
                <div className="flex justify-between items-center text-white/90 px-1">
                    <h3 className="font-bold text-xl">Seu Card</h3>
                    <button 
                        onClick={clearPreview}
                        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Container da Imagem com Sombra e Borda */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-auto object-contain block bg-white" 
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleShare}
                        className="w-full py-4 bg-white text-black hover:bg-gray-100 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-transform active:scale-95"
                    >
                        <i className="fas fa-share-nodes"></i> 
                        <span>Partilhar / Baixar</span>
                    </button>
                    
                    <p className="text-white/40 text-xs text-center">
                        Se o menu não abrir, segure na imagem para salvar.
                    </p>
                </div>
            </div>
        </div>
      )}
    </>
  );
}