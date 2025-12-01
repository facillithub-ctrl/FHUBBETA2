"use client";

import { useState, useRef, useEffect } from 'react';
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
  
  // Estado para o Modal de Fallback (Visualização)
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
  const generateImage = async () => {
    if (!cardRef.current) return null;
    
    try {
        await new Promise(r => setTimeout(r, 100)); // Delay para renderização

        const dataUrl = await toPng(cardRef.current!, { 
            cacheBust: false,
            pixelRatio: 2, // 2.0 é o ideal para mobile
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
        return dataUrl;
    } catch (err) {
        console.error(err);
        return null;
    }
  };

  // --- LÓGICA MISTA: DOWNLOAD + PREVIEW ---
  const handleDownloadProcess = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await generateImage();
      
      if (dataUrl) {
          // 1. Tenta o download automático (Funciona bem em Desktop/Android)
          try {
            const link = document.createElement('a');
            link.download = `facillit-${profile.nickname}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (e) {
            console.warn("Download automático bloqueado, usando fallback visual.");
          }

          // 2. SEMPRE abre o preview para garantir (Mobile Friendly)
          setPreviewImage(dataUrl);
          setIsMenuOpen(false); // Fecha o menu
          
          addToast({ title: 'Imagem Gerada!', message: 'Se o download não iniciou, salve manualmente.', type: 'success' });
      } else {
          throw new Error("Falha na geração");
      }
    } catch (error) {
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
          <div className="absolute right-0 bottom-full mb-2 w-64 rounded-xl shadow-2xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transform origin-bottom-right transition-all animate-fade-in-up">
              <div className="p-3 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Compartilhar Perfil</p>
              </div>
              
              <div className="p-2 space-y-1">
                  
                  {/* Opção 1: Baixar / Visualizar */}
                  <button 
                      onClick={handleDownloadProcess}
                      disabled={isGenerating}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-purple transition-colors flex items-center gap-3 disabled:opacity-50"
                  >
                      <div className="w-8 h-8 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple shrink-0">
                          {isGenerating ? <i className="fas fa-spinner fa-spin text-xs"></i> : <i className="fas fa-download"></i>}
                      </div>
                      <span>{isGenerating ? 'Gerando...' : 'Baixar Imagem'}</span>
                  </button>

                  <div className="h-px bg-gray-100 my-1 mx-2"></div>

                  <button 
                      onClick={handleWhatsApp}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-3"
                  >
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                          <i className="fab fa-whatsapp"></i>
                      </div>
                      <span>WhatsApp</span>
                  </button>

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

      {/* --- MODAL DE PREVIEW DA IMAGEM (Mobile Friendly) --- */}
      {previewImage && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-sm w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
                
                {/* Header do Modal */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="font-bold text-gray-800">Seu Cartão de Perfil</h3>
                        <p className="text-xs text-gray-500">Pronto para compartilhar!</p>
                    </div>
                    <button 
                        onClick={() => setPreviewImage(null)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Área da Imagem */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-100 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={previewImage} 
                        alt="Preview" 
                        className="w-full h-auto rounded-lg shadow-md border border-gray-200" 
                    />
                </div>

                {/* Footer com Instrução */}
                <div className="p-4 bg-white border-t border-gray-100 text-center">
                    <p className="text-sm font-medium text-brand-purple mb-2">
                        <i className="fas fa-hand-pointer mr-2"></i>
                        Segure na imagem para Salvar
                    </p>
                    <button 
                        onClick={() => setPreviewImage(null)}
                        className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
}