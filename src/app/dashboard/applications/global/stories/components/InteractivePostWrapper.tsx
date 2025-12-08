'use client';

import React, { useState, useOptimistic, useTransition } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { togglePostLike } from '../actions';
import { VerificationBadge } from '@/components/VerificationBadge'; // Importando seu componente existente
import { UserProfile } from '../types';
import { cn } from '@/utils/utils';
import Image from 'next/image';

interface WrapperProps {
  postId: string;
  user: UserProfile;
  createdAt: string;
  initialLikes: number;
  initialComments: number;
  isLiked: boolean;
  isSaved?: boolean;
  children: React.ReactNode;
}

export function InteractivePostWrapper({ 
  postId, user, createdAt, initialLikes, initialComments, isLiked, isSaved, children 
}: WrapperProps) {
  
  // UI Otimista para Like Instantâneo
  const [optimisticLikes, setOptimisticLikes] = useOptimistic(
    { count: initialLikes, liked: isLiked },
    (state, newLikedState: boolean) => ({
      count: state.count + (newLikedState ? 1 : -1),
      liked: newLikedState,
    })
  );

  const [isPending, startTransition] = useTransition();
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    const newState = !optimisticLikes.liked;
    startTransition(async () => {
      setOptimisticLikes(newState);
      try {
        await togglePostLike(postId, newState);
      } catch (error) {
        setOptimisticLikes(!newState); // Reverte em caso de erro
      }
    });
  };

  return (
    <article className="bg-white dark:bg-[#121214] rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 mb-6 overflow-hidden hover:shadow-md transition-shadow duration-200">
      
      {/* Header Padronizado */}
      <div className="px-5 pt-5 pb-2 flex justify-between items-start">
        <div className="flex gap-3">
          <div className="relative w-11 h-11">
            <div className="w-full h-full rounded-full overflow-hidden ring-2 ring-gray-50 dark:ring-white/5 relative">
                {user.avatar_url ? (
                    <Image src={user.avatar_url} alt={user.name} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {user.name.charAt(0)}
                    </div>
                )}
            </div>
          </div>
          
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-900 dark:text-white text-[15px] hover:underline cursor-pointer">
                {user.name}
              </span>
              
              {/* Badge de Verificação Real */}
              {user.isVerified && (
                <VerificationBadge type={user.verification_badge || 'identity'} />
              )}
              
              {user.role === 'teacher' && (
                <span className="ml-1 px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                  Educador
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="hover:underline cursor-pointer">@{user.username}</span>
              <span className="text-gray-300">•</span>
              <span>{createdAt}</span>
            </div>
          </div>
        </div>
        
        <button className="text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 p-2 rounded-full transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Conteúdo Dinâmico Injetado */}
      <div className="px-5 py-1">
        {children}
      </div>

      {/* Barra de Ações */}
      <div className="px-5 py-4 flex items-center justify-between border-t border-gray-50 dark:border-white/5 mt-2">
        <div className="flex gap-6">
          <button 
            onClick={handleLike}
            disabled={isPending}
            className="flex items-center gap-2 group focus:outline-none"
          >
            <div className={cn(
              "p-2 rounded-full transition-colors group-hover:bg-pink-50 dark:group-hover:bg-pink-900/20",
              optimisticLikes.liked && "text-pink-600 bg-pink-50 dark:bg-pink-900/10"
            )}>
              <Heart className={cn(
                "w-5 h-5 transition-transform duration-200", 
                optimisticLikes.liked ? "fill-current text-pink-600 scale-110" : "text-gray-500"
              )} />
            </div>
            <span className={cn(
              "text-sm font-medium transition-colors",
              optimisticLikes.liked ? "text-pink-600" : "text-gray-500 group-hover:text-pink-600"
            )}>
              {optimisticLikes.count}
            </span>
          </button>

          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 group focus:outline-none"
          >
            <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
              <MessageCircle className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-500 group-hover:text-blue-600">
              {initialComments}
            </span>
          </button>

          <button className="flex items-center gap-2 group focus:outline-none">
            <div className="p-2 rounded-full group-hover:bg-green-50 dark:group-hover:bg-green-900/20 transition-colors">
              <Share2 className="w-5 h-5 text-gray-500 group-hover:text-green-600" />
            </div>
          </button>
        </div>

        <button className="text-gray-400 hover:text-blue-600 transition-colors">
          <Bookmark className={cn("w-5 h-5", isSaved && "fill-current text-blue-600")} />
        </button>
      </div>

      {/* Seção de Comentários */}
      {showComments && (
        <div className="bg-gray-50/50 dark:bg-white/[0.02] px-5 py-4 border-t border-gray-100 dark:border-white/5 animate-in fade-in slide-in-from-top-2">
           <div className="flex gap-3 mb-4">
             <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative">
                <Image src="/assets/images/accont.svg" alt="Eu" fill className="object-cover" />
             </div>
             <div className="flex-1 relative">
                <input 
                  type="text" 
                  placeholder="Escreva um comentário..."
                  className="w-full bg-white dark:bg-[#1A1A1E] border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                />
             </div>
           </div>
           {/* Placeholder de comentários vazios */}
           <div className="text-center py-6 text-gray-400 text-sm">
             <p>Ainda não há comentários. Seja o primeiro!</p>
           </div>
        </div>
      )}
    </article>
  );
}