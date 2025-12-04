"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StoryPost } from '../types';
import { togglePostLike, deleteStoryPost } from '../actions'; 
import BookPostDispatcher from './feeds/books/BookPostDispatcher';
import { VerificationBadge } from '@/components/VerificationBadge'; 
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Flag } from 'lucide-react';

interface Props {
  post: StoryPost;
  currentUserId?: string;
  onCommentClick?: (post: StoryPost) => void;
}

export default function PostCard({ post, currentUserId, onCommentClick }: Props) {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const isOwner = currentUserId === post.user.id;
  
  // CORREÇÃO: Mapeia corretamente para o campo verification_badge
  // Adicionamos um fallback para 'badge' caso o type ainda tenha o campo antigo
  const badgeToDisplay = post.user.verification_badge || (post.user as any).badge || null;

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !liked;
    setLiked(newState);
    setLikesCount(prev => newState ? prev + 1 : prev - 1);
    try { await togglePostLike(post.id, liked); } catch { 
        setLiked(!newState); 
        setLikesCount(prev => !newState ? prev + 1 : prev - 1); 
    }
  };

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja excluir?")) {
        try { await deleteStoryPost(post.id); setIsDeleted(true); } 
        catch { alert("Erro ao excluir."); }
    }
  };

  const handleShare = (e: React.MouseEvent) => {
      e.stopPropagation();
      const url = `${window.location.origin}/stories?p=${post.id}`;
      navigator.clipboard.writeText(url).then(() => alert("Link copiado!"));
  };

  if (isDeleted) return null;

  return (
    <article 
        className="border-b border-gray-100 px-4 py-4 hover:bg-gray-50/20 transition-colors cursor-pointer bg-white w-full animate-in fade-in duration-500"
        onClick={() => onCommentClick?.(post)}
        onMouseLeave={() => setIsMenuOpen(false)}
    >
      <div className="flex gap-3 w-full">
         
         {/* Avatar */}
         <div className="flex-shrink-0">
            <Link href={`/u/${post.user.username.replace('@', '')}`} onClick={e => e.stopPropagation()}>
                <div className="relative w-10 h-10 rounded-full bg-gray-200 overflow-hidden hover:opacity-90 transition-opacity border border-gray-100">
                   {post.user.avatar_url ? (
                      <Image 
                        src={post.user.avatar_url} 
                        alt={post.user.name} 
                        fill 
                        className="object-cover" 
                      />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 font-bold">
                         {post.user.name.charAt(0)}
                      </div>
                   )}
                </div>
            </Link>
         </div>

         {/* Conteúdo */}
         <div className="flex-1 min-w-0">
            
            {/* Header com Nome e Selo Colados */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-1 flex-wrap text-[15px] leading-5">
                    
                    {/* Link do Nome */}
                    <Link href={`/u/${post.user.username}`} onClick={e => e.stopPropagation()} className="font-bold text-gray-900 hover:underline truncate max-w-[200px]">
                        {post.user.name}
                    </Link>
                    
                    {/* SELO VERIFICADO: Renderização corrigida */}
                    {badgeToDisplay && (
                        <div className="flex-shrink-0 inline-flex items-center pt-[2px]">
                            <VerificationBadge badge={badgeToDisplay} size="14px" />
                        </div>
                    )}
                    
                    <span className="text-gray-500 text-sm ml-1 truncate">@{post.user.username}</span>
                    <span className="text-gray-400 px-1">·</span>
                    <span className="text-gray-500 text-sm hover:underline">{post.createdAt}</span>
                </div>
                
                {/* Menu */}
                <div className="relative group/menu ml-2 flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="text-gray-400 hover:text-brand-purple p-1 rounded-full transition-colors">
                        <MoreHorizontal size={18} />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 top-6 bg-white shadow-xl border border-gray-100 rounded-lg z-50 w-32 py-1">
                            {isOwner ? (
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-2"><Trash2 size={14} /> Excluir</button>
                            ) : (
                                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 text-xs font-medium flex items-center gap-2"><Flag size={14} /> Denunciar</button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Conteúdo do Post */}
            <div className="mt-1 text-[15px] text-gray-900 whitespace-pre-wrap leading-normal break-words w-full">
                {post.category === 'books' ? (
                    <BookPostDispatcher post={post} />
                ) : (
                    <>
                        <p className="mb-2">{post.content}</p>
                        {post.coverImage && (
                            <div className="mt-2 rounded-xl overflow-hidden border border-gray-100 relative w-full aspect-video bg-gray-50">
                                <Image 
                                    src={post.coverImage} 
                                    alt="Post media" 
                                    fill 
                                    className="object-cover" 
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center mt-3 max-w-[425px] text-gray-500">
                <button onClick={(e) => { e.stopPropagation(); onCommentClick?.(post); }} className="group flex items-center gap-2 hover:text-blue-500 transition-colors">
                    <div className="p-2 -ml-2 rounded-full group-hover:bg-blue-50 transition-colors"><MessageCircle size={18} /></div>
                    <span className="text-xs font-medium">{post.commentsCount || 0}</span>
                </button>
                <button onClick={handleLike} className={`group flex items-center gap-2 transition-colors ${liked ? 'text-pink-600' : 'hover:text-pink-600'}`}>
                    <div className="p-2 rounded-full group-hover:bg-pink-50 transition-colors"><Heart size={18} className={liked ? 'fill-current' : ''} /></div>
                    <span className="text-xs font-medium">{likesCount}</span>
                </button>
                <button onClick={handleShare} className="group flex items-center gap-2 hover:text-brand-purple transition-colors">
                    <div className="p-2 rounded-full group-hover:bg-purple-50 transition-colors"><Share2 size={18} /></div>
                </button>
            </div>
         </div>
      </div>
    </article>
  );
}