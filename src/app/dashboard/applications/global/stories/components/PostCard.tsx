"use client";

import { useState } from 'react';
import Image from 'next/image';
import { StoryPost } from '../types';
import { togglePostLike } from '../actions'; 
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

  const isBookPost = post.category === 'books';

  // Tema de cores para outras categorias
  const getCategoryColor = (cat: string) => {
    if (cat === 'movies') return 'text-red-500 bg-red-50';
    if (cat === 'games') return 'text-violet-600 bg-violet-50';
    return 'text-purple-600 bg-purple-50';
  };
  const themeClass = getCategoryColor(post.category);

  return (
    <div className="mb-8 bg-white rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100/50 group">
      
      {/* HEADER */}
      <div className="p-5 pb-0 flex items-start justify-between">
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
              
              {/* Badge Dinâmica */}
              {isBookPost ? (
                  <span className="text-[9px] uppercase bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 tracking-wide font-semibold">
                      {post.type === 'status' ? 'Geral' : post.type?.replace('-', ' ')}
                  </span>
              ) : (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${themeClass}`}>
                     {post.category}
                  </span>
              )}
            </div>
            <p className="text-xs text-gray-400">{post.createdAt}</p>
          </div>
        </div>
        <button className="text-gray-300 hover:text-dark-text"><i className="fas fa-ellipsis-h"></i></button>
      </div>

      {/* CONTEÚDO */}
      <div className="px-5 pb-2 pt-1">
         {isBookPost ? (
             <BookPostRenderer post={post} />
         ) : (
             /* Layout Genérico para outros feeds */
             <div className="bg-gray-50 rounded-xl p-4 mt-2">
                 {post.coverImage && (
                    <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden bg-gray-200">
                       <Image src={post.coverImage} alt="Media" fill className="object-cover" />
                    </div>
                 )}
                 <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
             </div>
         )}
      </div>

      {/* FOOTER AÇÕES */}
      <div className="px-5 py-4 pt-2">
         <div className="flex items-center justify-between border-t border-gray-50 pt-3">
            <div className="flex gap-5 text-gray-500">
               <button onClick={handleLike} className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-red-500' : 'hover:text-red-500'}`}>
                  <i className={`${liked ? 'fas' : 'far'} fa-heart text-lg`}></i> <span className="text-xs font-bold">{likesCount}</span>
               </button>
               <button className="flex items-center gap-1.5 hover:opacity-80 hover:text-blue-500">
                  <i className="far fa-comment text-lg"></i> <span className="text-xs font-bold">{post.commentsCount}</span>
               </button>
            </div>
            <button onClick={() => setSaved(!saved)}>
               <i className={`${saved ? 'fas' : 'far'} fa-bookmark text-lg text-gray-400 hover:text-gray-600`}></i>
            </button>
         </div>
      </div>
    </div>
  );
}