// CAMINHO: src/app/dashboard/applications/global/stories/components/BookgramCard.tsx
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { BookReviewPost } from '../types';

export default function BookgramCard({ post }: { post: BookReviewPost }) {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [saved, setSaved] = useState(post.isSaved || false);

  const handleLike = () => {
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
    setLiked(!liked);
  };

  return (
    <div className="mb-8 p-4 rounded-3xl transition-all duration-300 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 group">
      
      {/* 1. Header Minimalista */}
      <div className="flex items-start justify-between mb-4 px-2">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 p-0.5 relative cursor-pointer ring-2 ring-transparent group-hover:ring-brand-purple/10 transition-all">
             <div className="w-full h-full rounded-full overflow-hidden relative">
               {post.user.avatar_url ? (
                  <Image src={post.user.avatar_url} alt={post.user.name} fill className="object-cover" />
               ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400"><i className="fas fa-user"></i></div>
               )}
             </div>
             {post.user.isVerified && (
               <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px]">
                 <i className="fas fa-certificate text-brand-green text-xs"></i>
               </div>
             )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-dark-text text-base leading-tight">{post.user.name}</span>
              <span className="text-gray-400 text-xs">• {post.createdAt}</span>
            </div>
            {post.readingProgress ? (
               <div className="text-xs text-brand-purple font-medium flex items-center gap-1 mt-0.5">
                  <i className="fas fa-book-reader"></i>
                  {post.readingProgress.status === 'Concluído' ? 'Terminou de ler' : `Está lendo (Pág. ${post.readingProgress.current})`}
               </div>
            ) : (
               <p className="text-xs text-gray-400">{post.user.username}</p>
            )}
          </div>
        </div>
        <button className="text-gray-300 hover:text-dark-text transition-colors p-2"><i className="fas fa-ellipsis-h"></i></button>
      </div>

      {/* 2. Conteúdo Visual + Dados */}
      <div className="relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
         {/* Se tiver review com capa, layout especial */}
         {post.type === 'review' && post.bookTitle ? (
            <div className="flex flex-col md:flex-row">
               {/* Lado Esquerdo: Capa */}
               <div className="md:w-2/5 relative h-64 md:h-auto bg-gray-200 min-h-[250px]">
                  {post.bookCover && <Image src={post.bookCover} alt="Cover" fill className="object-cover" />}
                  {/* Overlay de Rating na Capa */}
                  {post.rating !== undefined && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                       <span className="font-black text-sm">{post.rating}</span>
                       <i className="fas fa-star text-yellow-400 text-[10px]"></i>
                    </div>
                  )}
               </div>
               
               {/* Lado Direito: Detalhes */}
               <div className="md:w-3/5 p-6 flex flex-col justify-between bg-white">
                  <div>
                     <h3 className="font-bold text-xl text-dark-text leading-tight mb-1">{post.bookTitle}</h3>
                     <p className="text-sm text-gray-500 mb-4">{post.bookAuthor}</p>
                     
                     {/* Personagens (Se houver) */}
                     {post.characters && post.characters.length > 0 && (
                        <div className="mb-4">
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Personagens</p>
                           <div className="flex flex-wrap gap-2">
                              {post.characters.map((char, i) => (
                                 <span key={i} className="text-xs bg-gray-50 px-2 py-1 rounded border border-gray-100 text-gray-600">
                                    <span className="font-bold">{char.name}</span> {char.role && <span className="text-gray-400 text-[10px]">({char.role})</span>}
                                 </span>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* Texto da Review */}
                     <p className="text-sm text-gray-700 leading-relaxed line-clamp-4 italic">
                        &quot;{post.content}&quot;
                     </p>
                  </div>

                  {/* Barra de Progresso */}
                  {post.readingProgress && (
                     <div className="mt-4">
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                           <span>Progresso</span>
                           <span>{post.readingProgress.percentage}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-brand-purple to-brand-green" style={{ width: `${post.readingProgress.percentage}%` }}></div>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         ) : (
            // Layout Normal (Vídeo ou Imagem)
            <div className="relative w-full aspect-[4/3] bg-black">
               {post.mediaUrl && <Image src={post.mediaUrl} alt="Media" fill className="object-contain" />}
               {post.isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors cursor-pointer">
                     <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 text-white text-2xl shadow-xl">
                        <i className="fas fa-play ml-1"></i>
                     </div>
                  </div>
               )}
               {/* Texto sobre a imagem se não for review completa */}
               {!post.mediaUrl && (
                  <div className="absolute inset-0 flex items-center justify-center p-8 text-center bg-gradient-to-br from-indigo-50 to-purple-50">
                     <p className="text-xl font-serif italic text-gray-700">&quot;{post.content}&quot;</p>
                  </div>
               )}
            </div>
         )}
      </div>

      {/* 3. Ações Clean */}
      <div className="mt-3 px-2 flex items-center justify-between">
         <div className="flex gap-6">
            <button onClick={handleLike} className="flex items-center gap-2 group">
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
            <i className={`${saved ? 'fas text-brand-purple' : 'far text-dark-text'} fa-bookmark text-2xl transition-colors`}></i>
         </button>
      </div>

      {/* 4. Rodapé de Texto (Tags e Likes) */}
      <div className="mt-2 px-2 text-sm">
         <p className="font-bold text-dark-text mb-1">{likesCount} curtidas</p>
         {post.type !== 'review' && (
            <p className="text-gray-700">
               <span className="font-bold mr-2">{post.user.name}</span>
               {post.content}
            </p>
         )}
         {post.tags && (
            <div className="flex gap-2 mt-1">
               {post.tags.map(tag => <span key={tag} className="text-xs text-brand-purple hover:underline cursor-pointer">#{tag}</span>)}
            </div>
         )}
      </div>
    </div>
  );
}