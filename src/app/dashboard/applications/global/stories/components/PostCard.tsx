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

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !liked;
    setLiked(newState);
    setLikesCount(prev => newState ? prev + 1 : prev - 1);
    
    // Optimistic Update
    try { 
        await togglePostLike(post.id, liked); 
    } catch { 
        // Reverte se falhar
        setLiked(!newState);
        setLikesCount(prev => !newState ? prev + 1 : prev - 1);
    }
  };

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja excluir este post?")) {
        try { 
            await deleteStoryPost(post.id); 
            setIsDeleted(true); 
        } 
        catch { alert("Erro ao excluir."); }
    }
  };

  const handleShare = (e: React.MouseEvent) => {
      e.stopPropagation();
      // Copia link para área de transferência
      const url = `${window.location.origin}/stories?p=${post.id}`;
      navigator.clipboard.writeText(url).then(() => alert("Link copiado para a área de transferência!"));
  };

  if (isDeleted) return null;

  return (
    <article 
        className="border-b border-gray-100 px-4 py-4 hover:bg-gray-50/20 transition-colors cursor-pointer bg-white w-full animate-in fade-in duration-500"
        onClick={() => onCommentClick?.(post)}
    >
      <div className="flex gap-3 w-full">
         
         {/* Avatar do Usuário */}
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
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                         <span className="font-bold text-xs">{post.user.name.charAt(0)}</span>
                      </div>
                   )}
                </div>
            </Link>
         </div>

         {/* Conteúdo Principal */}
         <div className="flex-1 min-w-0">
            
            {/* Header: Nome, Badge, Data e Menu */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-1 text-[15px] leading-5 flex-wrap">
                    <Link href={`/u/${post.user.username.replace('@', '')}`} onClick={e => e.stopPropagation()} className="font-bold text-gray-900 hover:underline truncate max-w-[200px]">
                        {post.user.name}
                    </Link>
                    
                    {post.user.badge && <VerificationBadge badge={post.user.badge} size="12px" />}
                    
                    <span className="text-gray-500 truncate ml-1 text-sm">@{post.user.username}</span>
                    <span className="text-gray-400 px-1">·</span>
                    <span className="text-gray-500 text-sm hover:underline">{post.createdAt}</span>
                </div>
                
                {/* Menu de Opções */}
                <div className="relative group/menu flex-shrink-0 ml-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                        className="text-gray-400 hover:text-brand-purple p-2 rounded-full hover:bg-purple-50 transition-colors -mt-2 -mr-2"
                    >
                        <MoreHorizontal size={18} />
                    </button>
                    
                    {isMenuOpen && (
                        <div className="absolute right-0 top-8 bg-white shadow-xl border border-gray-100 rounded-lg z-50 w-32 py-1 overflow-hidden animate-in zoom-in-95 duration-100">
                            {isOwner ? (
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-2">
                                    <Trash2 size={14} /> Excluir
                                </button>
                            ) : (
                                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 text-xs font-medium flex items-center gap-2">
                                    <Flag size={14} /> Denunciar
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Conteúdo do Post (Book Dispatcher ou Texto Simples) */}
            <div className="mt-1 text-[15px] text-gray-900 whitespace-pre-wrap leading-normal break-words w-full">
                {post.category === 'books' ? (
                    <BookPostDispatcher post={post} />
                ) : (
                    <>
                        <p className="mb-2">{post.content}</p>
                        {post.coverImage && (
                            <div className="mt-3 rounded-xl overflow-hidden border border-gray-100 relative w-full aspect-video bg-gray-50">
                                <Image 
                                    src={post.coverImage} 
                                    alt="Mídia" 
                                    fill 
                                    className="object-cover" 
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Barra de Ações (Footer) */}
            <div className="flex justify-between items-center mt-3 max-w-[425px] text-gray-500">
                <button 
                    onClick={(e) => { e.stopPropagation(); onCommentClick?.(post); }} 
                    className="group flex items-center gap-2 hover:text-blue-500 transition-colors"
                >
                    <div className="p-2 -ml-2 rounded-full group-hover:bg-blue-50 transition-colors">
                        <MessageCircle size={18} />
                    </div>
                    <span className="text-xs font-medium">{post.commentsCount > 0 && post.commentsCount}</span>
                </button>

                <button 
                    onClick={handleLike} 
                    className={`group flex items-center gap-2 transition-colors ${liked ? 'text-pink-600' : 'hover:text-pink-600'}`}
                >
                    <div className="p-2 rounded-full group-hover:bg-pink-50 transition-colors">
                        <Heart size={18} className={liked ? 'fill-current' : ''} />
                    </div>
                    <span className="text-xs font-medium">{likesCount > 0 && likesCount}</span>
                </button>

                <button onClick={handleShare} className="group flex items-center gap-2 hover:text-brand-purple transition-colors">
                    <div className="p-2 rounded-full group-hover:bg-purple-50 transition-colors">
                        <Share2 size={18} />
                    </div>
                </button>
            </div>
         </div>
      </div>
    </article>
  );
}