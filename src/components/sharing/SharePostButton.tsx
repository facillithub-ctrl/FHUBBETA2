"use client";

import { useState, useRef } from 'react';
import { StoryPost } from '@/app/(hubs)/global/stories/types';
import { useToast } from '@/contexts/ToastContext';
import { exportAsImage } from '@/utils/exportAsImage';
import { StoriesPostShareCard } from './StoriesPostShareCard';
import { Share2, Link as LinkIcon, Instagram, Download, X } from 'lucide-react';

interface SharePostButtonProps {
  post: StoryPost;
  variant?: 'icon' | 'full';
  className?: string;
}

export default function SharePostButton({ post, variant = 'icon', className = '' }: SharePostButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  const postUrl = typeof window !== 'undefined' ? `${window.location.origin}/stories?p=${post.id}` : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      addToast({ 
        title: "Link Copiado!", 
        message: "O link do post foi copiado para a área de transferência.", 
        type: 'success' 
      });
    } catch {
      addToast({ title: "Erro", message: "Falha ao copiar link.", type: 'error' });
    }
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      await exportAsImage(cardRef.current, `post-${post.user.username}-${post.id}`);
      addToast({ 
        title: "Imagem Salva!", 
        message: "O card para Instagram Stories foi baixado.", 
        type: 'success' 
      });
    } catch (e) {
      console.error(e);
      addToast({ title: "Erro", message: "Falha ao gerar imagem.", type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      {/* Botão Gatilho */}
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
        className={`group flex items-center gap-2 hover:text-brand-purple transition-colors ${className}`}
        title="Compartilhar"
      >
        <div className={`p-2 rounded-full group-hover:bg-purple-50 transition-colors`}>
            <Share2 size={18} />
        </div>
        {variant === 'full' && <span className="text-sm font-medium">Compartilhar</span>}
      </button>

      {/* Modal de Compartilhamento */}
      {isOpen && (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            
            {/* Esquerda: Visualização do Card (Gerador) */}
            <div className="w-full md:w-1/2 bg-gray-100 p-8 flex items-center justify-center relative overflow-hidden">
                <div className="scale-[0.6] md:scale-[0.7] shadow-2xl rounded-2xl origin-center">
                    <StoriesPostShareCard ref={cardRef} post={post} />
                </div>
            </div>

            {/* Direita: Ações */}
            <div className="w-full md:w-1/2 p-8 flex flex-col relative bg-white">
                <button 
                    onClick={() => setIsOpen(false)} 
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Compartilhar Post</h3>
                    <p className="text-gray-500 text-sm">Leve esta discussão para outras redes ou convide amigos para participar.</p>
                </div>

                <div className="space-y-4 flex-1">
                    
                    {/* Ação 1: Copiar Link */}
                    <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
                            <LinkIcon size={16} />
                            <span>Link Direto</span>
                        </div>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={postUrl} 
                                readOnly 
                                className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-500 focus:outline-none"
                            />
                            <button 
                                onClick={handleCopyLink}
                                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
                            >
                                Copiar
                            </button>
                        </div>
                    </div>

                    {/* Ação 2: Instagram Stories */}
                    <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/50 flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                            <Instagram size={16} />
                            <span>Instagram Stories</span>
                        </div>
                        <p className="text-xs text-gray-600">
                            Baixe o card personalizado e poste nos seus stories marcando o autor.
                        </p>
                        <button 
                            onClick={handleDownloadImage}
                            disabled={isExporting}
                            className="w-full py-3 bg-brand-gradient text-white rounded-lg font-bold shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                        >
                            {isExporting ? (
                                <span className="animate-pulse">Gerando imagem...</span>
                            ) : (
                                <>
                                    <Download size={18} />
                                    Baixar Card para Stories
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}