// CAMINHO: src/app/dashboard/applications/global/stories/components/PostCard.tsx
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { BookReviewPost } from '../types';
import { togglePostLike } from '../actions'; 

export default function PostCard({ post }: { post: BookReviewPost }) {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [saved, setSaved] = useState(post.isSaved || false);

  const handleLike = async () => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
    try { await togglePostLike(post.id, liked); } catch (e) { /* rollback se falhar */ }
  };

  return (
    <div className="mb-8 bg-white p-0 rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100/50">
      
      {/* 1. HEADER: Perfil e Contexto */}
      <div className="p-5 flex items-start justify-between">
        <div className="flex gap-3.5">
          {/* Avatar */}
          <div className="w-[46px] h-[46px] rounded-full p-[2px] relative cursor-pointer bg-gradient-to-tr from-gray-100 to-gray-200 hover:from-brand-purple hover:to-brand-green transition-colors group/avatar">
             <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden relative">
               {post.user.avatar_url ? (
                  <Image src={post.user.avatar_url} alt={post.user.name} fill className="object-cover rounded-full" />
               ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300"><i className="fas fa-user"></i></div>
               )}
             </div>
             {post.user.isVerified && (
               <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-[3px] shadow-sm z-10">
                 <i className="fas fa-certificate text-brand-green text-[10px]"></i>
               </div>
             )}
          </div>
          
          {/* Info */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="font-bold text-dark-text text-sm hover:text-brand-purple cursor-pointer transition-colors">
                {post.user.name}
              </span>
              <span className="text-gray-300 text-[10px]">•</span>
              <span className="text-gray-400 text-xs">{post.createdAt}</span>
            </div>
            
            {/* Subtítulo Dinâmico */}
            {post.type === 'recommendation' && <span className="text-xs text-brand-purple font-medium">✨ Recomendou um livro</span>}
            {post.type === 'link' && <span className="text-xs text-blue-500 font-medium">🔗 Partilhou um link</span>}
            {post.readingProgress && (
               <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
                  <span className={post.readingProgress.status === 'Concluído' ? 'text-green-500' : 'text-brand-purple'}>
                    {post.readingProgress.status}
                  </span>
                  {post.readingProgress.status === 'Lendo' && ` • Pág. ${post.readingProgress.current}`}
               </div>
            )}
            {!post.readingProgress && !['recommendation', 'link'].includes(post.type) && (
               <p className="text-xs text-gray-400">{post.user.username}</p>
            )}
          </div>
        </div>
        <button className="text-gray-300 hover:text-dark-text transition-colors p-2"><i className="fas fa-ellipsis-h"></i></button>
      </div>

      {/* 2. CONTEÚDO VISUAL (Sem padding horizontal para full-width) */}
      <div className="relative w-full bg-gray-50 border-y border-gray-50">
         
         {/* A. REVIEW DE LIVRO (Capa + Dados) */}
         {post.type === 'review' && post.bookTitle && (
            <div className="flex flex-col md:flex-row bg-white">
               <div className="md:w-1/3 relative h-64 md:h-auto bg-gray-100 min-h-[220px] group cursor-pointer overflow-hidden">
                  {post.bookCover && <Image src={post.bookCover} alt="Capa" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />}
                  {post.rating && (
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1.5">
                       <span className="font-black text-sm text-dark-text">{post.rating}</span>
                       <i className="fas fa-star text-yellow-400 text-[10px]"></i>
                    </div>
                  )}
               </div>
               <div className="md:w-2/3 p-6 flex flex-col justify-center">
                  <h3 className="font-bold text-xl text-dark-text leading-tight mb-1">{post.bookTitle}</h3>
                  <p className="text-sm text-gray-500 mb-4">{post.bookAuthor}</p>
                  
                  {/* --- CORREÇÃO: Aspas Escapadas --- */}
                  <p className="text-sm text-gray-700 leading-relaxed italic border-l-4 border-brand-purple/20 pl-4 py-1 mb-4">
                     &quot;{post.content}&quot;
                  </p>
                  
                  {/* Tags de Personagens */}
                  {post.characters && (
                     <div className="flex flex-wrap gap-2">
                        {post.characters.map((char, i) => (
                           <span key={i} className="text-[10px] bg-gray-100 px-2 py-1 rounded-md text-gray-600 font-bold uppercase tracking-wider">
                              {char.name}
                           </span>
                        ))}
                     </div>
                  )}
               </div>
            </div>
         )}

         {/* B. LINK EXTERNO */}
         {post.type === 'link' && post.externalLink && (
            <a href={post.externalLink.url} target="_blank" className="block group bg-gray-50 hover:bg-gray-100 transition-colors">
               {post.mediaUrl && (
                 <div className="relative h-48 w-full overflow-hidden">
                    <Image src={post.mediaUrl} alt="Link Preview" fill className="object-cover" />
                 </div>
               )}
               <div className="p-4 bg-gray-50 group-hover:bg-gray-100/80 transition-colors flex justify-between items-center">
                  <div>
                     <p className="text-xs font-bold text-gray-400 uppercase mb-1">{post.externalLink.domain}</p>
                     <p className="font-bold text-dark-text leading-tight truncate max-w-md">{post.externalLink.title || post.content}</p>
                  </div>
                  <i className="fas fa-external-link-alt text-gray-300"></i>
               </div>
            </a>
         )}

         {/* C. MÍDIA PADRÃO (Vídeo/Foto) */}
         {(post.type === 'video' || (post.type === 'status' && post.mediaUrl)) && (
            <div className="relative w-full aspect-[4/3] md:aspect-video bg-black group cursor-pointer overflow-hidden">
               {post.mediaUrl && <Image src={post.mediaUrl} alt="Media" fill className="object-cover" />}
               {post.isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                     <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 text-white text-2xl shadow-xl transform group-hover:scale-110 transition-transform">
                        <i className="fas fa-play ml-1"></i>
                     </div>
                  </div>
               )}
            </div>
         )}
      </div>

      {/* 3. AÇÕES & LEGENDA */}
      <div className="p-5 pt-4">
         {/* Botões */}
         <div className="flex items-center justify-between mb-4">
            <div className="flex gap-5">
               <button onClick={handleLike} className="flex items-center gap-2 group transition-colors">
                  <i className={`text-2xl transition-transform group-active:scale-125 ${liked ? 'fas fa-heart text-red-500' : 'far fa-heart text-dark-text group-hover:text-red-500'}`}></i>
               </button>
               <button className="flex items-center gap-2 group">
                  <i className="far fa-comment text-2xl text-dark-text group-hover:text-brand-purple transition-colors"></i>
               </button>
               <button className="flex items-center gap-2 group">
                  <i className="far fa-paper-plane text-2xl text-dark-text group-hover:text-brand-green transition-colors transform group-hover:-rotate-12"></i>
               </button>
            </div>
            <button onClick={() => setSaved(!saved)}>
               <i className={`${saved ? 'fas text-brand-purple' : 'far text-dark-text'} fa-bookmark text-2xl transition-colors hover:text-brand-purple`}></i>
            </button>
         </div>

         {/* Likes & Texto */}
         <div className="mb-3">
            <p className="font-bold text-dark-text text-sm mb-2">{likesCount} curtidas</p>
            {post.type !== 'review' && post.type !== 'link' && (
               <p className="text-sm text-gray-800 leading-relaxed">
                  <span className="font-bold mr-2">{post.user.name}</span>
                  {post.content}
               </p>
            )}
            {post.tags && (
               <div className="flex gap-2 mt-2">
                  {post.tags.map(tag => (
                     <span key={tag} className="text-xs font-bold text-brand-purple hover:underline cursor-pointer">#{tag}</span>
                  ))}
               </div>
            )}
         </div>

         {/* COMENTÁRIOS (Povoado!) */}
         <div className="space-y-1">
            {post.topComments?.map((comment, idx) => (
               <p key={idx} className="text-sm text-gray-700">
                  <span className="font-bold mr-2 text-dark-text">{comment.user}</span>
                  {comment.text}
               </p>
            ))}
            {post.commentsCount > (post.topComments?.length || 0) && (
               <button className="text-xs text-gray-400 mt-2 font-medium hover:text-brand-purple">
                  Ver todos os {post.commentsCount} comentários
               </button>
            )}
         </div>
      </div>
    </div>
  );
}