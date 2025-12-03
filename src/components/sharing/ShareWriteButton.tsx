"use client";

import { useRef, useState, useEffect } from 'react';
import { UserProfile } from '@/app/dashboard/types';
import { WriteShareCard, WriteShareStats } from './WriteShareCard';
import { useProfileShare } from '@/features/share'; 

interface ShareWriteButtonProps {
  profile: UserProfile | null | undefined; // Permite nulo para evitar erros de TS
  stats: WriteShareStats;
  className?: string;
  variant?: 'primary' | 'secondary' | 'icon';
}

export function ShareWriteButton({ 
    profile, 
    stats, 
    className = "", 
    variant = 'primary' 
}: ShareWriteButtonProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAvatar, setShowAvatar] = useState(true);

  // CORREÇÃO DO ERRO: 
  // Usa 'profile?.nickname' para não quebrar se profile for undefined.
  // Se não tiver perfil, passa string vazia, o hook lida com isso.
  const { 
    isGenerating, 
    previewUrl, 
    safeAvatarUrl,
    safeLogoUrl, 
    prepareEnvironment,
    handleGenerate, 
    handleShare, 
    clearPreview 
  } = useProfileShare(profile?.nickname || "", profile?.avatar_url);

  const cardRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Se não houver perfil carregado, não renderiza nada para evitar outros erros
  if (!profile) return null;

  // Fecha o menu ao clicar fora
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Prepara o ambiente (carrega imagens) assim que o menu abre
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
      if (isMenuOpen) prepareEnvironment();
  }, [isMenuOpen, prepareEnvironment]);

  const renderTriggerButton = () => {
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
    return (
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`font-bold py-2 px-6 rounded-full transition-all shadow-sm flex items-center justify-center text-sm gap-2 bg-[#42047e] text-white hover:opacity-90 ${className}`}
      >
        <i className="fas fa-share-alt"></i> Compartilhar Resultado
      </button>
    );
  };

  return (
    <>
      <div className="relative inline-block text-left" ref={menuRef}>
        
        {/* RENDERIZADOR (Oculto) */}
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
            {/* Garantia extra de que o card só renderiza com o profile */}
           {profile && (
               <WriteShareCard 
                   innerRef={cardRef} 
                   profile={profile} 
                   stats={stats} 
                   logoOverride={safeLogoUrl ?? null} 
                   isExporting={true}
                />
            )}
        </div>

        {renderTriggerButton()}

        {/* MENU DROPDOWN */}
        {isMenuOpen && (
          <div className="absolute right-0 bottom-full mb-3 w-72 rounded-2xl shadow-xl bg-white border border-gray-100 z-40 animate-fade-in-up origin-bottom-right p-4">
              
              <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-gray-800">Compartilhar Redação</span>
                  <button onClick={() => setIsMenuOpen(false)} className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400">
                      <i className="fas fa-times text-xs"></i>
                  </button>
              </div>

              {/* Toggle Avatar */}
              <div className="flex items-center justify-between mb-5 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-700">Mostrar meu perfil</span>
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
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-[#42047e] hover:opacity-90 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-purple-900/20 disabled:opacity-70"
              >
                  {isGenerating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
                  <span>{isGenerating ? 'A criar...' : 'Gerar Story'}</span>
              </button>
          </div>
        )}
      </div>

      {/* MODAL DE SUCESSO (PREVIEW) */}
      {previewUrl && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in bg-[#050505]">
            
            <div className="relative w-full max-w-5xl h-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
                
                <button 
                    onClick={clearPreview}
                    className="absolute top-4 left-4 md:top-0 md:left-0 md:right-auto md:-top-12 flex items-center gap-2 text-white hover:text-gray-300 transition-colors bg-white/10 px-5 py-2.5 rounded-full z-50 font-bold text-sm border border-white/5"
                >
                    <i className="fas fa-chevron-left"></i>
                    <span>Voltar</span>
                </button>

                <div className="relative h-[65vh] md:h-[85vh] w-auto aspect-[9/16] rounded-xl overflow-hidden shadow-2xl bg-[#121212] flex-shrink-0 mt-12 md:mt-0 ring-1 ring-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={previewUrl} 
                        alt="Story Preview" 
                        className="w-full h-full object-contain block" 
                    />
                </div>

                <div className="flex flex-col items-center md:items-start gap-6 w-full max-w-xs animate-slide-up text-center md:text-left">
                    <div>
                        <h2 className="text-3xl font-extrabold text-white mb-2">Pronto! 🚀</h2>
                        <p className="text-gray-400 text-sm leading-relaxed font-medium">
                            Partilhe este card nos seus stories e marque a @facillit.
                        </p>
                    </div>

                    <div className="flex flex-col w-full gap-3">
                        <button
                            onClick={handleShare}
                            className="w-full py-4 bg-[#07f49e] hover:bg-[#05dcb6] text-[#0f0f11] rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95"
                        >
                            <i className="fas fa-share"></i> 
                            <span>Partilhar</span>
                        </button>

                        <a 
                            href={previewUrl}
                            download={`facillit-write-${profile.nickname}.png`}
                            className="w-full py-4 bg-[#1a1a1c] hover:bg-[#252529] text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 border border-white/5 transition-all active:scale-95"
                        >
                            <i className="fas fa-download text-gray-400"></i>
                            <span>Guardar</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
      )}
    </>
  );
}