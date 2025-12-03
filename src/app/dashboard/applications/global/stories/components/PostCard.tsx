// CAMINHO: src/app/dashboard/applications/global/stories/components/PostCard.tsx
"use client";

import { StoryPost } from '../types';
import { toggleLike } from '../actions';
import { useState } from 'react';

export default function PostCard({ post }: { post: StoryPost }) {
  const [liked, setLiked] = useState(post.user_has_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);

  const handleLike = async () => {
    // Optimistic Update
    const newStatus = !liked;
    setLiked(newStatus);
    setLikesCount(prev => newStatus ? prev + 1 : prev - 1);
    
    await toggleLike(post.id, liked || false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 animate-fade-in-up">
      {/* Cabeçalho do Post */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
             {post.profiles?.avatar_url ? (
               <img src={post.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold bg-gray-100">
                 {post.profiles?.full_name?.charAt(0) || '?'}
               </div>
             )}
          </div>
          <div>
            <p className="font-bold text-dark-text text-sm hover:underline cursor-pointer">
              {post.profiles?.full_name || 'Usuário Desconhecido'}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-4 pb-3">
        {post.content && <p className="text-gray-700 leading-relaxed text-sm mb-3">{post.content}</p>}
      </div>

      {/* Livro Relacionado (Se houver) */}
      {post.book_title && (
        <div className="px-4 pb-3">
          <div className="bg-[#F8F9FA] rounded-lg p-3 flex gap-4 items-center border border-gray-200">
            <div className="h-16 w-12 bg-gray-300 rounded shadow-sm flex-shrink-0 flex items-center justify-center text-xs text-gray-500">
              Capa
            </div>
            <div>
              <p className="font-bold text-dark-text text-sm">{post.book_title}</p>
              {post.book_author && <p className="text-xs text-gray-500">{post.book_author}</p>}
              {post.rating && (
                 <div className="flex text-yellow-400 text-xs mt-1 gap-0.5">
                   {[...Array(5)].map((_, i) => (
                     <i key={i} className={`fas fa-star ${i < post.rating! ? '' : 'text-gray-300'}`}></i>
                   ))}
                 </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between">
        <div className="flex gap-4">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 text-sm transition-colors ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
          >
            <i className={`${liked ? 'fas' : 'far'} fa-heart`}></i> <span>{likesCount}</span>
          </button>
          <button className="flex items-center gap-2 text-gray-500 text-sm hover:text-brand-purple transition-colors">
            <i className="far fa-comment"></i> <span>{post.comments_count}</span>
          </button>
        </div>
        <button className="text-gray-400 hover:text-gray-600"><i className="far fa-bookmark"></i></button>
      </div>
    </div>
  );
}