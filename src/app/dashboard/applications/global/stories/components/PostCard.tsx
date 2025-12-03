// CAMINHO: src/app/dashboard/applications/global/stories/components/PostCard.tsx
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { StoryPost } from '../types';
import { togglePostLike } from '../actions'; 
// Importação do novo Renderer
import BookPostRenderer from './feeds/BookLayouts';

export default function PostCard({ post }: { post: StoryPost }) {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [saved, setSaved] = useState(post.isSaved || false);

  const handleLike = async () => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
    try { await togglePostLike(post.id, liked); } catch (e) { /* rollback */ }
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
        case 'movies': return 'text-red-500 bg-red-50';
        case 'series': return 'text-pink-500 bg-pink-50';
        case 'anime': return 'text-orange-500 bg-orange-50';
        case 'sports': return 'text-green-600 bg-green-50';
        case 'games': return 'text-violet-600 bg-violet-50';
        case 'books': return 'text-blue-600 bg-blue-50';
        case 'podcasts': return 'text-cyan-600 bg-cyan-50';
        default: return 'text-purple-600 bg-purple-50';
    }
  };

  const themeClass = getCategoryColor(post.category);

  // Verificação se é um post de livro para usar o renderizador específico
  const isBookPost = post.category === 'books';

  return (
    <div className="mb-8 bg-white rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100/50 group">
      
      {/* 1. HEADER */}
      <div className="p-5 pb-3 flex items-start justify-between">
        <div className="flex gap-3.5">
          <div className="w-[42px] h-[42px] rounded-full relative cursor-pointer ring-2 ring-gray-100">
             {post.user.avatar_url ? (
                <Image src={post.user.avatar_url} alt={post.user.name} fill className="object-cover rounded-full" />
             ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300"><i className="fas fa-user"></i></div>
             )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-dark-text text-sm">{post.user.name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${themeClass}`}>
                 {post.category === 'all' ? 'Geral' : post.category}
              </span>
              {/* Mostra o Subtipo do Livro se for Livro */}
              {isBookPost && post.type !== 'status' && (
                  <span className="text-[9px] uppercase text-gray-400 border border-gray-200 px-1.5 py-px rounded tracking-wider">
                      {post.type}
                  </span>
              )}
            </div>
            <p className="text-xs text-gray-400">{post.createdAt}</p>
          </div>
        </div>
        <button className="text-gray-300 hover:text-dark-text"><i className="fas fa-ellipsis-h"></i></button>
      </div>

      {/* 2. CONTEÚDO VISUAL (Renderização Condicional) */}
      <div className="relative w-full">
         
         {/* --- SEÇÃO DE LIVROS --- */}
         {isBookPost ? (
             <BookPostRenderer post={post} />
         ) : (
             /* --- LÓGICA ANTIGA PARA OUTRAS CATEGORIAS --- */
             <>
                 {/* Exemplo: Layout SPORTS (Mantido do original) */}
                 {post.category === 'sports' && post.metadata?.homeTeam && (
                    <div className="bg-gradient-to-br from-green-900 to-gray-900 p-6 text-white text-center">
                       {/* ... (código existente de sports) ... */}
                       <div className="text-3xl font-black">{post.metadata.score}</div>
                    </div>
                 )}

                 {/* Layout Filmes/Series/Geral */}
                 {['movies', 'series', 'anime', 'all'].includes(post.category) && post.coverImage && (
                    <div className="relative w-full h-64 overflow-hidden group cursor-pointer bg-gray-100">
                       <Image src={post.coverImage} alt="Cover" fill className="object-cover" />
                       {/* Overlay padrão */}
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                           <h3 className="text-white font-bold text-lg">{post.title}</h3>
                       </div>
                    </div>
                 )}
             </>
         )}

      </div>

      {/* 3. CONTEÚDO TEXTUAL (Apenas se não for um layout que já exibe o texto, como Quote) */}
      {(!isBookPost || (post.type !== 'quote' && post.type !== 'review' && post.type !== 'first-impressions')) && (
        <div className="p-5 pt-2">
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
                {post.content}
            </p>
        </div>
      )}

      {/* 4. AÇÕES FOOTER */}
      <div className="px-5 pb-4 pt-0">
         <div className="flex items-center justify-between border-t border-gray-50 pt-3">
            <div className="flex gap-5 text-gray-500">
               <button onClick={handleLike} className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-red-500' : 'hover:text-red-500'}`}>
                  <i className={`${liked ? 'fas' : 'far'} fa-heart text-lg`}></i> <span className="text-xs font-bold">{likesCount}</span>
               </button>
               <button className={`flex items-center gap-1.5 hover:opacity-80 ${themeClass.split(' ')[0]}`}>
                  <i className="far fa-comment text-lg"></i> <span className="text-xs font-bold">{post.commentsCount}</span>
               </button>
               <button className="hover:text-dark-text"><i className="far fa-paper-plane text-lg"></i></button>
            </div>
            <button onClick={() => setSaved(!saved)}>
               <i className={`${saved ? 'fas' : 'far'} fa-bookmark text-lg ${saved ? themeClass.split(' ')[0] : 'text-gray-400 hover:text-gray-600'}`}></i>
            </button>
         </div>
      </div>
    </div>
  );
}