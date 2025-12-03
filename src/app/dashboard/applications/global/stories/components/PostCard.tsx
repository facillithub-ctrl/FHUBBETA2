"use client";

import { useState } from 'react';
import Image from 'next/image';
import { StoryPost } from '../types';
import { togglePostLike } from '../actions'; 
import BookPostDispatcher from './feeds/books/BookPostDispatcher';

interface PostCardProps {
  post: StoryPost;
  onCommentClick?: (post: StoryPost) => void; // Nova prop opcional
}

export default function PostCard({ post, onCommentClick }: PostCardProps) {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [saved, setSaved] = useState(post.isSaved || false);

  const handleLike = async () => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
    try { await togglePostLike(post.id, liked); } catch (e) { /* rollback */ }
  };

  const isBookContent = post.category === 'books';

  return (
    <div className="bg-white rounded-[1.5rem] p-5 mb-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3">
           <div className="w-11 h-11 rounded-full relative bg-gray-100 border border-white shadow-sm overflow-hidden cursor-pointer">
              {post.user.avatar_url ? (
                 <Image src={post.user.avatar_url} alt={post.user.name} fill className="object-cover" />
              ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-300"><i className="fas fa-user"></i></div>
              )}
           </div>
           <div>
              <div className="flex items-center gap-2">
                 <span className="font-bold text-gray-900 text-sm">{post.user.name}</span>
                 {isBookContent && post.type !== 'status' && (
                    <span className="px-2 py-[2px] rounded text-[10px] font-bold uppercase tracking-wider bg-brand-light text-brand-purple border border-purple-100">
                       {post.type === 'first-impressions' ? '1ª Impressão' : post.type}
                    </span>
                 )}
              </div>
              <span className="text-xs text-gray-400 block mt-0.5">{post.createdAt}</span>
           </div>
        </div>
        <button className="text-gray-300 hover:text-gray-600 transition-colors"><i className="fas fa-ellipsis-h"></i></button>
      </div>

      {/* CONTEÚDO */}
      <div className="pl-0 sm:pl-[3.5rem] cursor-pointer" onClick={() => onCommentClick?.(post)}>
         {isBookContent ? (
             <BookPostDispatcher post={post} />
         ) : (
             <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                 {post.content}
                 {post.coverImage && (
                    <div className="mt-3 relative w-full h-72 rounded-xl overflow-hidden shadow-sm">
                       <Image src={post.coverImage} alt="Mídia" fill className="object-cover" />
                    </div>
                 )}
             </div>
         )}
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50 pl-0 sm:pl-[3.5rem]">
         <div className="flex gap-6">
            <button 
               onClick={handleLike} 
               className={`flex items-center gap-2 text-sm transition-colors group ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            >
               <i className={`${liked ? 'fas' : 'far'} fa-heart group-hover:scale-110 transition-transform`}></i> 
               <span className="font-semibold">{likesCount}</span>
            </button>
            
            {/* BOTÃO DE COMENTÁRIO AGORA FUNCIONAL */}
            <button 
               onClick={() => onCommentClick?.(post)}
               className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-500 transition-colors group"
            >
               <i className="far fa-comment group-hover:scale-110 transition-transform"></i>
               <span className="font-semibold">{post.commentsCount}</span>
            </button>
            
            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-500 transition-colors">
               <i className="far fa-share-square"></i>
            </button>
         </div>
         <button onClick={() => setSaved(!saved)}>
            <i className={`${saved ? 'fas text-brand-purple' : 'far text-gray-400'} fa-bookmark hover:text-brand-purple transition-colors`}></i>
         </button>
      </div>
    </div>
  );
}