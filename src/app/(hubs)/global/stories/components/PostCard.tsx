"use client";

import React, { useState } from 'react';
import { StoryPost } from '../types';
import { togglePostLike, deleteStoryPost } from '../actions'; // Import corrigido
import { PostDispatcher } from './PostDispatcher';
import { MessageCircle, Heart, Share2, MoreHorizontal, Bookmark, Trash2 } from 'lucide-react';
import CommentsSection from './CommentsSection';
import Image from 'next/image';

interface PostCardProps {
  post: StoryPost;
  currentUserId?: string;
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  // Estado local para Optimistic UI (resposta instantânea)
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = async () => {
    const previousState = isLiked;
    // Atualiza UI instantaneamente
    setIsLiked(!previousState);
    setLikesCount(prev => !previousState ? prev + 1 : prev - 1);
    
    // Chama o server
    await togglePostLike(post.id, previousState);
  };

  const handleDelete = async () => {
    if (!confirm('Excluir este post permanentemente?')) return;
    setIsDeleting(true);
    await deleteStoryPost(post.id);
  };

  if (isDeleting) return null;

  return (
    <article className="bg-white px-4 py-3 cursor-pointer hover:bg-gray-[0.5] transition-colors relative">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="shrink-0 pt-1">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative border border-gray-100 shadow-sm">
            {post.user.avatar_url ? (
              <Image src={post.user.avatar_url} alt={post.user.name} fill className="object-cover" sizes="40px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-brand-purple text-white font-bold text-xs uppercase">
                {post.user.name[0]}
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 min-w-0">
          
          {/* Header do Post */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1.5 overflow-hidden flex-wrap leading-tight">
              <span className="font-bold text-[15px] text-gray-900 hover:underline">{post.user.name}</span>
              {post.user.isVerified && (
                 <i className="fas fa-check-circle text-blue-500 text-[12px]" title="Verificado"></i>
              )}
              <span className="text-gray-500 text-[14px] font-normal truncate">@{post.user.username}</span>
              <span className="text-gray-400 text-[13px] font-normal mx-0.5">·</span>
              <span className="text-gray-400 text-[13px] font-normal hover:underline">{post.createdAt}</span>
            </div>

            {/* Menu de Ações (3 pontinhos) */}
            <div className="relative group">
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                    className="p-1.5 text-gray-400 hover:text-brand-purple hover:bg-purple-50 rounded-full transition-colors"
                >
                    <MoreHorizontal size={16} />
                </button>
                {/* Dropdown do Menu */}
                {showMenu && (
                    <div className="absolute right-0 top-8 bg-white shadow-xl border border-gray-100 rounded-lg py-1 z-10 w-40 animate-in fade-in zoom-in-95">
                        {currentUserId === post.user.id ? (
                            <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium">
                                <Trash2 size={14} /> Excluir Post
                            </button>
                        ) : (
                            <button className="w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 flex items-center gap-2 font-medium">
                                <Bookmark size={14} /> Salvar
                            </button>
                        )}
                    </div>
                )}
            </div>
          </div>

          {/* O Dispatcher usa seus componentes ricos (Review, Ranking, etc) */}
          <div className="mt-0.5 text-[15px] text-gray-900 whitespace-pre-wrap leading-normal font-normal">
             <PostDispatcher post={post} />
          </div>

          {/* Barra de Ações (Estilo X) */}
          <div className="flex items-center justify-between mt-3 max-w-[420px] text-gray-500">
            <ActionBtn 
                icon={MessageCircle} 
                count={post.commentsCount} 
                color="blue" 
                onClick={() => setShowComments(!showComments)} 
            />
            <ActionBtn icon={Share2} count={0} color="green" />
            <ActionBtn 
                icon={Heart} 
                count={likesCount} 
                color="pink" 
                active={isLiked}
                onClick={handleLike}
            />
            <ActionBtn icon={Bookmark} count={0} color="purple" />
          </div>

          {/* Área de Comentários */}
          {showComments && (
            <div className="mt-3 pt-3 border-t border-gray-100 animate-in slide-in-from-top-2">
                <CommentsSection postId={post.id} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// Botão de Ação Reutilizável
function ActionBtn({ icon: Icon, count, color, active, onClick }: any) {
    const colorClasses: any = {
        blue: 'hover:text-blue-500 hover:bg-blue-50',
        green: 'hover:text-green-500 hover:bg-green-50',
        pink: 'hover:text-pink-600 hover:bg-pink-50',
        purple: 'hover:text-purple-600 hover:bg-purple-50',
    };

    return (
        <button 
            onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
            className={`flex items-center gap-1 group transition-all text-[13px] ${colorClasses[color]} ${active ? 'text-pink-600' : ''}`}
        >
            <div className="p-2 rounded-full transition-colors relative group-active:scale-90">
                <Icon size={18} className={active ? 'fill-current' : ''} />
            </div>
            {count > 0 && <span className="font-medium tabular-nums">{count}</span>}
        </button>
    );
}