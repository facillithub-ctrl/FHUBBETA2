/* eslint-disable @next/next/no-img-element */
import React, { forwardRef, useEffect, useState } from 'react';
import { StoryPost } from '@/app/dashboard/applications/global/stories/types';
import BookPostDispatcher from '@/app/dashboard/applications/global/stories/components/feeds/books/BookPostDispatcher';
import { preloadImage } from '@/utils/exportAsImage';

interface StoriesPostShareCardProps {
  post: StoryPost;
}

// Helper SVG para o selo (Renderização nativa garantida)
const ShareCardBadge = ({ badge }: { badge: string | null | undefined }) => {
  if (!badge) return null;
  const normalized = badge.toLowerCase();
  let color = '#3B82F6'; // Blue default
  if (normalized === 'educator' || normalized === 'green') color = '#22C55E';
  else if (normalized === 'official' || normalized === 'gold' || normalized === 'admin') color = '#EAB308';
  else if (normalized === 'featured' || normalized === 'red') color = '#EF4444';
  else if (normalized === 'legacy' || normalized === 'purple') color = '#A855F7';

  return (
    <svg viewBox="0 0 24 24" fill={color} className="w-4 h-4 ml-1 translate-y-[1px]" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  );
};

export const StoriesPostShareCard = forwardRef<HTMLDivElement, StoriesPostShareCardProps>(({ post }, ref) => {
  const { user, content, coverImage, createdAt } = post;
  const isSpecialPost = post.category === 'books';

  // ESTADOS PARA IMAGENS (Base64)
  // Iniciamos com o caminho relativo para ter algo visual imediato, mas o useEffect vai sobrescrever com Base64
  const [logoSrc, setLogoSrc] = useState<string>('/assets/images/marcas/Stories.png');
  const [avatarSrc, setAvatarSrc] = useState<string>(user.avatar_url || '');
  const [postCoverSrc, setPostCoverSrc] = useState<string>(coverImage || '');

  // PRÉ-CARREGAMENTO ROBUSTO (Estilo ProfileShareCard + Base64)
  useEffect(() => {
    const loadImages = async () => {
        // 1. LOGO: Conversão forçada para Base64
        try {
            const response = await fetch('/assets/images/marcas/Stories.png');
            if (response.ok) {
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (reader.result) setLogoSrc(reader.result as string);
                };
                reader.readAsDataURL(blob);
            }
        } catch (e) {
            console.error("Erro ao converter logo:", e);
        }

        // 2. Avatar e Capa (Usando seu utilitário de proxy/preload)
        if (user.avatar_url) {
            const base64Avatar = await preloadImage(user.avatar_url);
            if (base64Avatar) setAvatarSrc(base64Avatar);
        }

        if (coverImage) {
            const base64Cover = await preloadImage(coverImage);
            if (base64Cover) setPostCoverSrc(base64Cover);
        }
    };

    loadImages();
  }, [user.avatar_url, coverImage]);

  return (
    <div 
      ref={ref}
      id={`post-share-card-${post.id}`}
      // Layout 9:16 Fixo | Fundo Branco | Sem Sombras
      className="w-[405px] min-h-[720px] bg-white relative overflow-hidden flex flex-col font-inter text-gray-900 box-border"
    >
      {/* --- HEADER: LOGO --- */}
      <div className="pt-8 pb-5 flex justify-center w-full border-b border-gray-100">
         <img 
            src={logoSrc} 
            alt="Facillit Stories" 
            className="h-10 w-auto object-contain"
            // Lógica do ProfileShareCard: crossOrigin anonimo se não for data: URI
            {...(!logoSrc.startsWith('data:') ? { crossOrigin: "anonymous" } : {})}
         />
      </div>

      {/* --- CORPO --- */}
      <div className="flex-1 px-6 py-6 w-full flex flex-col">
         
         {/* CABEÇALHO DO AUTOR */}
         <div className="flex items-center gap-3 pb-5 mb-5 border-b border-gray-100 w-full">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                {avatarSrc ? (
                    <img 
                        src={avatarSrc} 
                        alt={user.name} 
                        className="w-full h-full object-cover"
                        {...(!avatarSrc.startsWith('data:') ? { crossOrigin: "anonymous" } : {})}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">
                        {user.name.charAt(0)}
                    </div>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center">
                    <span className="font-bold text-[15px] text-gray-900 truncate">{user.name}</span>
                    <ShareCardBadge badge={user.verification_badge || user.badge} />
                </div>
                <div className="text-gray-500 text-[12px] flex items-center gap-2 mt-0.5">
                    <span>@{user.username}</span>
                    <span className="text-gray-300">•</span>
                    <span>{createdAt}</span>
                </div>
            </div>
         </div>

         {/* CONTEÚDO DO POST (Area Flexível) */}
         <div className="flex-1 flex flex-col">
            <div className="text-[15px] leading-relaxed text-gray-800 w-full">
                {isSpecialPost ? (
                    // WRAPPER DE PROTEÇÃO DE LAYOUT:
                    // Garante que componentes complexos (reviews) não estourem a largura
                    <div className="w-full overflow-hidden [&_img]:max-w-full [&_img]:h-auto [&_img]:object-contain">
                        <BookPostDispatcher post={post} />
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {content && (
                            <p className="whitespace-pre-wrap font-medium">{content}</p>
                        )}
                        {/* Imagem do Post Padrão */}
                        {postCoverSrc && (
                            <div className="relative w-full rounded-lg overflow-hidden border border-gray-100 mt-2 bg-gray-50">
                                {/* Forçamos altura maxima para não esticar demais o card verticalmente */}
                                <img 
                                    src={postCoverSrc} 
                                    alt="Post media" 
                                    className="w-full h-auto max-h-[350px] object-cover"
                                    {...(!postCoverSrc.startsWith('data:') ? { crossOrigin: "anonymous" } : {})}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
         </div>

         {/* MÉTRICAS (Rodapé do conteúdo) */}
         <div className="pt-5 mt-auto border-t border-gray-100 flex items-center gap-6 text-gray-400 text-xs font-medium w-full">
            <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                {post.likes}
            </div>
            <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                {post.commentsCount}
            </div>
         </div>
      </div>

      {/* --- FOOTER: MENSAGEM --- */}
      <div className="py-5 px-6 text-center w-full border-t border-gray-100 bg-gray-50/50">
          <p className="text-gray-900 text-xs font-medium">
              Esse post foi feito no Facillit <span className="font-extrabold text-transparent bg-clip-text bg-brand-gradient">Stories</span>
          </p>
          <p className="text-gray-400 text-[10px] mt-1.5 font-light tracking-wide">
              Crie uma conta no Facillit Hub para conferir mais.
          </p>
      </div>

    </div>
  );
});

StoriesPostShareCard.displayName = 'StoriesPostShareCard';