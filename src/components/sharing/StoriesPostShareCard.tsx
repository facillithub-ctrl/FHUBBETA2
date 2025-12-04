import React, { forwardRef } from 'react';
import Image from 'next/image';
import { StoryPost } from '@/app/dashboard/applications/global/stories/types';
import BookPostDispatcher from '@/app/dashboard/applications/global/stories/components/feeds/books/BookPostDispatcher';

interface StoriesPostShareCardProps {
  post: StoryPost;
}

// Helper para renderizar o selo como SVG (Garante que saia no print)
const ShareCardBadge = ({ badge }: { badge: string | null | undefined }) => {
  if (!badge) return null;

  const normalized = badge.toLowerCase();
  let color = '#3B82F6'; // Blue default

  if (normalized === 'educator' || normalized === 'green') color = '#22C55E';
  else if (normalized === 'official' || normalized === 'gold' || normalized === 'admin') color = '#EAB308';
  else if (normalized === 'featured' || normalized === 'red') color = '#EF4444';
  else if (normalized === 'legacy' || normalized === 'purple') color = '#A855F7';

  return (
    <svg 
      viewBox="0 0 24 24" 
      fill={color} 
      className="w-4 h-4 ml-1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  );
};

export const StoriesPostShareCard = forwardRef<HTMLDivElement, StoriesPostShareCardProps>(({ post }, ref) => {
  const { user, content, coverImage, createdAt } = post;
  const isSpecialPost = post.category === 'books';

  return (
    <div 
      ref={ref}
      id={`post-share-card-${post.id}`}
      // Design 100% Branco e Limpo
      className="w-[405px] h-[720px] bg-white relative overflow-hidden flex flex-col font-inter text-gray-900"
    >
      {/* --- HEADER: LOGO STORIES (Maior) --- */}
      <div className="pt-12 pb-6 flex justify-center w-full">
         <div className="relative w-48 h-16"> 
            <Image 
                src="/assets/images/marcas/Stories.png" 
                alt="Facillit Stories" 
                fill 
                className="object-contain"
                priority
            />
         </div>
      </div>

      {/* --- ÁREA CENTRAL: POST --- */}
      <div className="flex-1 px-8 w-full flex flex-col">
         
         {/* Cabeçalho do Usuário */}
         <div className="flex items-center gap-3 mb-5 w-full">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                {user.avatar_url ? (
                    <Image src={user.avatar_url} alt={user.name} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-gray-100 text-lg">
                        {user.name.charAt(0)}
                    </div>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center">
                    <span className="font-bold text-[16px] text-gray-900 truncate max-w-[200px]">{user.name}</span>
                    {/* Badge SVG Customizado */}
                    <ShareCardBadge badge={user.verification_badge || user.badge} />
                </div>
                <div className="text-gray-500 text-sm flex items-center gap-1">
                    <span>@{user.username}</span>
                    <span>•</span>
                    <span>{createdAt}</span>
                </div>
            </div>
         </div>

         {/* Conteúdo */}
         <div className="text-[17px] leading-relaxed text-gray-800 flex-1">
            {isSpecialPost ? (
                // Ajuste de margem para o card de livros ficar alinhado
                <div className="mt-2">
                    <BookPostDispatcher post={post} />
                </div>
            ) : (
                <div className="space-y-4">
                    {content && (
                        <p className="whitespace-pre-wrap font-medium">{content}</p>
                    )}
                    {coverImage && (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-50 mt-4">
                            <Image 
                                src={coverImage} 
                                alt="Post media" 
                                fill 
                                className="object-cover" 
                            />
                        </div>
                    )}
                </div>
            )}
         </div>

         {/* Métricas (Visual Limpo) */}
         <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-6 text-gray-400 text-sm font-medium w-full">
            <div className="flex items-center gap-2">
                {/* SVG Icons para garantir exportação */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                {post.likes}
            </div>
            <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                {post.commentsCount}
            </div>
         </div>
      </div>

      {/* --- FOOTER: CTA --- */}
      <div className="py-12 px-8 text-center w-full mt-auto">
          <div className="inline-block border-2 border-brand-purple text-brand-purple font-extrabold text-lg py-3 px-8 rounded-full">
              Crie sua conta no Facillit Hub
          </div>
          <p className="text-gray-400 text-xs mt-4 font-medium tracking-widest uppercase">facillit.com.br</p>
      </div>

    </div>
  );
});

StoriesPostShareCard.displayName = 'StoriesPostShareCard';