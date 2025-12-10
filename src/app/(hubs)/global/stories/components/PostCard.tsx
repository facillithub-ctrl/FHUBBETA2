"use client";

import React, { useState } from 'react';
import { StoryPost } from '../types';
import { togglePostLike, deleteStoryPost } from '../actions';
import { PostDispatcher } from './PostDispatcher';
import { MessageCircle, Heart, Share2, MoreHorizontal, Bookmark, Trash2 } from 'lucide-react';
import CommentsSection from './CommentsSection';
import { VerificationBadge } from '@/components/VerificationBadge'; // Assumindo que existe, ou remova

interface PostCardProps {
  post: StoryPost;
  currentUserId?: string;
  onCommentClick?: (post: StoryPost) => void;
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = async () => {
    // Optimistic UI Update
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
    
    // Chama a server action
    await togglePostLike(post.id, isLiked);
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja apagar este post?')) return;
    setIsDeleting(true);
    await deleteStoryPost(post.id);
    // O post será removido visualmente quando o servidor revalidar o feed, 
    // ou poderíamos esconder aqui com estado local.
  };

  if (isDeleting) return null;

  const isOwner = currentUserId === post.user.id;

  return (
    <article className="px-4 py-3 hover:bg-gray-50/50 transition-colors cursor-pointer group border-b border-gray-100 dark:border-gray-800">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative border border-gray-100">
            {post.user.avatar_url ? (
              <img src={post.user.avatar_url} alt={post.user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-brand-purple text-white font-bold text-xs">
                {post.user.name[0]}
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex justify-between items-start relative">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="font-bold text-[15px] text-gray-900 dark:text-white truncate hover:underline decoration-1">
                {post.user.name}
              </span>
              
              {post.user.isVerified && (
                 <span className="text-brand-purple" title="Verificado">
                    <i className="fas fa-certificate text-[10px]"></i>
                 </span>
              )}
              
              <span className="text-gray-500 text-[14px] truncate font-normal">@{post.user.username}</span>
              <span className="text-gray-400 text-[13px] font-normal">· {post.createdAt}</span>
            </div>
            
            {/* Menu de Opções */}
            <div className="relative">
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                    className="text-gray-400 hover:text-brand-purple hover:bg-purple-50 p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                >
                    <MoreHorizontal size={16} />
                </button>
                
                {showMenu && isOwner && (
                    <div className="absolute right-0 top-8 bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 rounded-lg py-1 z-10 w-32 animate-in fade-in zoom-in-95">
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                            <Trash2 size={14} /> Apagar
                        </button>
                    </div>
                )}
            </div>
          </div>

          {/* Body do Post (Texto, Review, Imagem, etc) */}
          <div className="mt-1 text-[15px] text-gray-900 dark:text-gray-100 leading-relaxed font-normal whitespace-pre-wrap">
             {/* O Dispatcher decide como renderizar baseado no type */}
             <PostDispatcher post={post} />
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between mt-3 max-w-md">
            <ActionButton 
              icon={MessageCircle} 
              count={post.commentsCount} 
              color="blue" 
              onClick={(e: any) => { e.stopPropagation(); setShowComments(!showComments); }}
            />
            <ActionButton icon={Share2} count={0} color="green" />
            <ActionButton 
              icon={Heart} 
              count={likesCount} 
              color="pink" 
              active={isLiked}
              onClick={(e: any) => { e.stopPropagation(); handleLike(); }}
            />
            <ActionButton icon={Bookmark} count={0} color="purple" />
          </div>

          {/* Seção de Comentários */}
          {showComments && (
            <div className="mt-4 border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-2" onClick={e => e.stopPropagation()}>
                <CommentsSection postId={post.id} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function ActionButton({ icon: Icon, count, color, active, onClick }: any) {
  const colors: any = {
    blue: 'hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    green: 'hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20',
    pink: 'hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20',
    purple: 'hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20',
  };
  
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-1.5 group text-gray-500 dark:text-gray-400 transition-all ${colors[color]} ${active ? 'text-pink-600 dark:text-pink-500' : ''}`}
    >
      <div className="p-2 rounded-full transition-colors relative">
        <Icon size={18} className={active ? 'fill-current' : ''} />
      </div>
      {count > 0 && <span className="text-xs font-medium">{count}</span>}
    </button>
  );
}