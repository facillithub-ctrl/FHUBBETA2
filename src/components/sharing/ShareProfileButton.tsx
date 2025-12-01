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
  
  // Opções de personalização
  const [theme, setTheme] = useState<CardTheme>('light');
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
        
        {/* --- CARD OCULTO (Renderizador) --- */}
        <div style={{ 
            position: 'fixed', 
            left: '200vw', 
            top: 0, 
            zIndex: -50,
            width: '540px', // Base maior para qualidade
            minWidth: '540px',
            height: '960px', // Proporção Stories (9:16)
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
          <div className="absolute right-0 bottom-full mb-3 w-72 rounded-2xl shadow-xl bg-white border border-gray-100 z-40 animate-fade-in-up origin-bottom-right p-4">
              
              <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-gray-800">Personalizar Card</span>
                  <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <i className="fas fa-times"></i>
                  </button>
              </div>

              {/* Tema */}
              <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${theme === 'light' ? 'border-[#42047e] text-[#42047e] bg-purple-50' : 'border-gray-200 text-gray-500'}`}
                  >
                    Claro
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${theme === 'dark' ? 'border-[#42047e] text-[#42047e] bg-purple-50' : 'border-gray-200 text-gray-500'}`}
                  >
                    Escuro
                  </button>
              </div>

              {/* Avatar Toggle */}
              <div className="flex items-center justify-between mb-4 bg-gray-50 p-2 rounded-lg">
                  <span className="text-xs font-medium text-gray-600">Incluir Foto</span>
                  <button 
                    onClick={() => setShowAvatar(!showAvatar)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${showAvatar ? 'bg-[#07f49e]' : 'bg-gray-300'}`}
                  >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${showAvatar ? 'left-6' : 'left-1'}`}></div>
                  </button>
              </div>

              <button 
                  onClick={() => {
                      if (cardRef.current) handleGenerate(cardRef.current);
                      setIsMenuOpen(false);
                  }}
                  disabled={isGenerating}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[#42047e] hover:opacity-90 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-purple-900/20"
              >
                  {isGenerating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
                  <span>{isGenerating ? 'Criando...' : 'Gerar Stories'}</span>
              </button>
          </div>
        )}
      </div>

      {/* --- PREVIEW MODAL (UX Melhorada) --- */}
      {previewUrl && (
        <div className="fixed inset-0 z-[9999] bg-[#0f0f11]/95 flex flex-col items-center justify-center p-4 animate-fade-in">
            
            {/* Header de Navegação */}
            <div className="absolute top-6 right-6 z-50">
                <button 
                    onClick={clearPreview}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-md"
                >
                    <i className="fas fa-times text-lg"></i>
                </button>
            </div>

            <div className="w-full max-w-sm flex flex-col items-center gap-6 h-full justify-center">
                
                <h3 className="text-white font-bold text-lg opacity-90">Seu Card está pronto!</h3>

                {/* Imagem (Sombra e Borda para destacar do fundo escuro) */}
                <div className="relative rounded-[20px] overflow-hidden shadow-2xl border border-white/10 w-auto max-h-[70vh]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-full object-contain block bg-white" 
                    />
                </div>

                <div className="w-full flex flex-col gap-3">
                    <button
                        onClick={handleShare}
                        className="w-full py-4 bg-[#07f49e] text-[#0f0f11] rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:brightness-110 transition-transform active:scale-95"
                    >
                        <i className="fas fa-share-nodes"></i> 
                        <span>Compartilhar / Salvar</span>
                    </button>
                    
                    <p className="text-white/40 text-xs text-center">
                        Se o compartilhamento nativo não abrir, <br/>segure na imagem para salvar na galeria.
                    </p>
                </div>
            </div>
        </div>
      )}
    </>
  );
}