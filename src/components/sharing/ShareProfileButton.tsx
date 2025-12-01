"use client";

import { useRef, useState } from 'react';
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
  
  // Hook customizado com toda a lógica
  const { 
    isGenerating, 
    previewUrl, 
    handleGenerate, 
    handleShare, 
    clearPreview 
 } = useProfileShare(profile.nickname || "");

  const cardRef = useRef<HTMLDivElement>(null);

  const onGenerateClick = () => {
      if (cardRef.current) {
          handleGenerate(cardRef.current);
          setIsMenuOpen(false);
      }
  };

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
      {/* 1. O Card Invisível (Fixo na tela, fora da visão, mas renderizável) */}
      <div style={{ position: 'fixed', top: 0, left: 0, zIndex: -9999, opacity: 0, pointerEvents: 'none' }}>
           {profile && <ProfileShareCard innerRef={cardRef} profile={profile} stats={stats} />}
      </div>

      <div className="relative inline-block text-left">
        {renderTriggerButton()}

        {/* 2. Menu Dropdown */}
        {isMenuOpen && (
          <div className="absolute right-0 bottom-full mb-2 w-64 rounded-xl shadow-xl bg-white border border-gray-100 z-40 animate-fade-in-up origin-bottom-right">
              <div className="p-2 space-y-1">
                  <button 
                      onClick={onGenerateClick}
                      disabled={isGenerating}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-purple/5 hover:text-brand-purple flex items-center gap-3 transition-colors"
                  >
                      {isGenerating ? (
                          <i className="fas fa-spinner fa-spin w-5 text-center text-brand-purple"></i>
                      ) : (
                          <i className="fas fa-image w-5 text-center"></i>
                      )}
                      <span>{isGenerating ? 'Criando Card...' : 'Gerar Imagem'}</span>
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

      {/* 3. O Modal de Preview (CRÍTICO: Fundo escuro e Botão de Ação) */}
      {previewUrl && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
            <div className="w-full max-w-sm flex flex-col gap-5">
                
                {/* Header do Modal */}
                <div className="flex justify-between items-center text-white px-2">
                    <h3 className="font-bold text-lg">Seu Card está pronto!</h3>
                    <button 
                        onClick={clearPreview}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* A Imagem Gerada */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-gray-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={previewUrl} 
                        alt="Preview do Card" 
                        className="w-full h-auto object-contain block" 
                    />
                </div>

                {/* Ações */}
                <div className="flex flex-col gap-3">
                    {/* O clique aqui dispara o navigator.share instantaneamente */}
                    <button
                        onClick={handleShare}
                        className="w-full py-4 bg-brand-green hover:bg-green-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                    >
                        <i className="fas fa-share-nodes"></i> Compartilhar Agora
                    </button>
                    
                    <p className="text-white/50 text-xs text-center px-4">
                        Dica: Se preferir, segure na imagem acima para salvar na galeria do seu celular.
                    </p>
                </div>
            </div>
        </div>
      )}
    </>
  );
}