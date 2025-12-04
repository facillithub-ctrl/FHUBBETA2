import React, { forwardRef, useEffect, useState } from 'react';
import { StoryPost } from '@/app/dashboard/applications/global/stories/types';
import BookPostDispatcher from '@/app/dashboard/applications/global/stories/components/feeds/books/BookPostDispatcher';
import { preloadImage } from '@/utils/exportAsImage';

interface StoriesPostShareCardProps {
  post: StoryPost;
}

// Helper SVG para o selo (Garante exportação perfeita em qualquer resolução)
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

  // Estados para armazenar as versões Base64 das imagens
  const [logoSrc, setLogoSrc] = useState<string>('/assets/images/marcas/Stories.png'); // Fallback inicial
  const [avatarSrc, setAvatarSrc] = useState<string>(user.avatar_url || '');
  const [postCoverSrc, setPostCoverSrc] = useState<string>(coverImage || '');

  // Efeito para converter TODAS as imagens críticas para Base64 ao montar
  useEffect(() => {
    const loadImages = async () => {
        // 1. LOGO: Conversão Robusta para Base64 (Correção Mobile)
        try {
            // Usamos fetch direto no caminho relativo. Funciona melhor que absolute URL em alguns mobiles.
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
            // Mantém o estado inicial (caminho relativo) se falhar
        }

        // 2. Avatar do Usuário (Externo -> Proxy)
        if (user.avatar_url) {
            const base64Avatar = await preloadImage(user.avatar_url);
            if (base64Avatar) setAvatarSrc(base64Avatar);
        }

        // 3. Capa do Post (Externo -> Proxy)
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
      // Design Minimalista: Fundo Branco, Tamanho Fixo (9:16)
      className="w-[405px] h-[720px] bg-white relative overflow-hidden flex flex-col font-inter text-gray-900"
    >
      {/* --- HEADER: LOGO + Divisória Fina --- */}
      <div className="pt-8 pb-6 flex justify-center w-full border-b border-gray-100">
         {/* CORREÇÃO MOBILE: 
            1. Usar <img> nativa.
            2. Remover crossOrigin se for Base64 ou local para evitar bloqueio.
         */}
         <img 
            src={logoSrc} 
            alt="Facillit Stories" 
            className="w-40 h-12 object-contain"
         />
      </div>

      {/* --- CORPO PRINCIPAL --- */}
      <div className="flex-1 px-8 py-6 w-full flex flex-col">
         
         {/* 1. Autor + Divisória Fina */}
         <div className="flex items-center gap-4 pb-6 mb-6 border-b border-gray-100 w-full">
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                {avatarSrc ? (
                    <img 
                        src={avatarSrc} 
                        alt={user.name} 
                        className="w-full h-full object-cover"
                        // CrossOrigin só ajuda se a url for externa e não base64, mas mal não faz aqui
                        crossOrigin={avatarSrc.startsWith('data:') ? undefined : "anonymous"}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">
                        {user.name.charAt(0)}
                    </div>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center">
                    <span className="font-bold text-[17px] text-gray-900 truncate">{user.name}</span>
                    <ShareCardBadge badge={user.verification_badge || user.badge} />
                </div>
                <div className="text-gray-500 text-[13px] flex items-center gap-2 mt-0.5">
                    <span>@{user.username}</span>
                    <span className="text-gray-300">•</span>
                    <span>{createdAt}</span>
                </div>
            </div>
         </div>

         {/* 2. Conteúdo do Post (Flex-1 para ocupar o espaço) */}
         <div className="flex-1">
            <div className="text-[18px] leading-relaxed text-gray-800">
                {isSpecialPost ? (
                    <div className="my-2">
                        <BookPostDispatcher post={post} />
                    </div>
                ) : (
                    <div>
                        {content && (
                            <p className="whitespace-pre-wrap font-medium">{content}</p>
                        )}
                        {postCoverSrc && (
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-50 mt-6 border border-gray-100">
                                <img 
                                    src={postCoverSrc} 
                                    alt="Post media" 
                                    className="w-full h-full object-cover"
                                    crossOrigin={postCoverSrc.startsWith('data:') ? undefined : "anonymous"}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
         </div>

         {/* 3. Métricas + Divisória Fina acima */}
         <div className="pt-6 mt-auto border-t border-gray-100 flex items-center gap-8 text-gray-500 text-sm font-medium w-full">
            <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                {post.likes} <span className="text-xs uppercase tracking-wider ml-1">Curtidas</span>
            </div>
            <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                {post.commentsCount} <span className="text-xs uppercase tracking-wider ml-1">Comentários</span>
            </div>
         </div>
      </div>

      {/* --- FOOTER: NOVO LAYOUT --- */}
      <div className="py-6 text-center w-full border-t border-gray-100 bg-gray-50/30">
          <p className="text-gray-900 text-xs font-medium">
              Esse post foi feito no Facillit <span className="font-bold text-transparent bg-clip-text bg-brand-gradient">Stories</span>
          </p>
          <p className="text-gray-400 text-[10px] mt-1 font-light">
              Crie uma conta no Facillit Hub para conferir mais.
          </p>
      </div>

    </div>
  );
});

StoriesPostShareCard.displayName = 'StoriesPostShareCard';