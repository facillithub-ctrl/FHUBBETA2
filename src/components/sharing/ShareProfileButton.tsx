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
        className={`font-bold py-2 px-6 rounded-full transition-all shadow-sm flex items-center justify-center text-sm gap-2 bg-[#42047e] text-white hover:opacity-90 ${className}`}
      >
        <i className="fas fa-share-alt"></i> Compartilhar
      </button>
    );
  };

  return (
    <>
      <div className="relative inline-block text-left" ref={menuRef}>
        
        {/* RENDERIZADOR OFF-SCREEN (540x960 base para Full HD) */}
        <div style={{ 
            position: 'fixed', 
            left: '200vw', 
            top: 0, 
            zIndex: -50,
            width: '540px', 
            minWidth: '540px',
            height: '960px',
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

        {isMenuOpen && (
          <div className="absolute right-0 bottom-full mb-3 w-80 rounded-2xl shadow-2xl bg-white border border-gray-100 z-40 animate-fade-in-up origin-bottom-right p-4">
              
              <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-gray-800">Criar Story</span>
                  <button onClick={() => setIsMenuOpen(false)} className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500">
                      <i className="fas fa-times text-xs"></i>
                  </button>
              </div>

              {/* Seletor de Estilo */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={`py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${theme === 'light' ? 'border-[#42047e] text-[#42047e] bg-purple-50' : 'border-gray-100 bg-gray-50 text-gray-500'}`}
                  >
                    <div className="w-3 h-3 rounded-full border border-gray-300 bg-white"></div>
                    Claro
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${theme === 'dark' ? 'border-[#42047e] text-[#42047e] bg-purple-50' : 'border-gray-100 bg-gray-900 text-white'}`}
                  >
                    <div className="w-3 h-3 rounded-full border border-gray-600 bg-gray-800"></div>
                    Escuro
                  </button>
              </div>

              {/* Avatar Toggle */}
              <div className="flex items-center justify-between mb-5 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-700">Exibir Foto de Perfil</span>
                  <button 
                    onClick={() => setShowAvatar(!showAvatar)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${showAvatar ? 'bg-[#07f49e]' : 'bg-gray-300'}`}
                  >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${showAvatar ? 'left-6' : 'left-1'}`}></div>
                  </button>
              </div>

              <button 
                  onClick={() => {
                      if (cardRef.current) handleGenerate(cardRef.current);
                      setIsMenuOpen(false);
                  }}
                  disabled={isGenerating}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-[#42047e] hover:opacity-90 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-purple-900/20"
              >
                  {isGenerating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-arrow-down"></i>}
                  <span>{isGenerating ? 'Gerando...' : 'Baixar / Compartilhar'}</span>
              </button>
          </div>
        )}
      </div>

      {/* --- POPUP DE VISUALIZAÇÃO (Desktop & Mobile Otimizado) --- */}
      {previewUrl && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full h-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-8 relative">
                
                {/* Botão Fechar Flutuante */}
                <button 
                    onClick={clearPreview}
                    className="absolute top-0 right-0 md:-top-8 md:-right-8 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full text-white flex items-center justify-center transition-all backdrop-blur-md z-50"
                >
                    <i className="fas fa-times text-lg"></i>
                </button>

                {/* Área da Imagem */}
                <div className="relative h-full max-h-[80vh] w-auto aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#0f0f11]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={previewUrl} 
                        alt="Stories Preview" 
                        className="w-full h-full object-contain" 
                    />
                </div>

                {/* Painel de Ações */}
                <div className="flex flex-col gap-4 w-full max-w-xs text-center md:text-left">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Pronto!</h3>
                        <p className="text-gray-400 text-sm">A imagem está pronta para ser partilhada nos seus Stories.</p>
                    </div>

                    <button
                        onClick={handleShare}
                        className="w-full py-4 bg-[#07f49e] hover:bg-[#06d68a] text-[#0f0f11] rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition-all active:scale-95"
                    >
                        <i className="fas fa-share-alt"></i> 
                        <span>Partilhar Agora</span>
                    </button>

                    <a 
                        href={previewUrl}
                        download={`facillit-stories-${profile.nickname}.png`}
                        className="w-full py-4 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 border border-white/5 transition-all"
                    >
                        <i className="fas fa-download"></i>
                        <span>Salvar na Galeria</span>
                    </a>
                </div>
            </div>
        </div>
      )}
    </>
  );
}