"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StoryPost } from '../types';
import { togglePostLike, deleteStoryPost } from '../actions'; 
import BookPostDispatcher from './feeds/books/BookPostDispatcher';
import { VerificationBadge } from '@/components/VerificationBadge';

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
    try { await togglePostLike(post.id, liked); } catch { /* rollback */ }
  };

  const handleDelete = async () => {
    if (confirm("Excluir este post permanentemente?")) {
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
    // DESIGN CLEAN: Sem background branco isolado, sem sombra.
    <article 
        className="border-b border-gray-100 px-4 py-4 hover:bg-gray-50/50 transition-colors cursor-pointer bg-white"
        onClick={() => onCommentClick?.(post)}
    >
      <div className="flex gap-3">
         {/* Avatar */}
         <div className="flex-shrink-0">
            <Link href={`/u/${post.user.username.replace('@', '')}`} onClick={e => e.stopPropagation()}>
                <div className="w-10 h-10 rounded-full bg-gray-200 relative overflow-hidden hover:opacity-90">
                   {post.user.avatar_url ? (
                      <Image src={post.user.avatar_url} alt={post.user.name} fill className="object-cover" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400"><i className="fas fa-user"></i></div>
                   )}
                </div>
            </Link>
         </div>

         <div className="flex-1 min-w-0">
            {/* Header: Nome e Metadados */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-1 text-[15px] leading-5 flex-wrap">
                    <Link href={`/u/${post.user.username.replace('@', '')}`} onClick={e => e.stopPropagation()} className="font-bold text-gray-900 hover:underline truncate">
                        {post.user.name}
                    </Link>
                    <VerificationBadge badge={post.user.badge} size="4px" />
                    <span className="text-gray-500 truncate ml-1 text-sm">@{post.user.username}</span>
                    <span className="text-gray-400 px-1">·</span>
                    <span className="text-gray-500 text-sm hover:underline">{post.createdAt}</span>
                </div>
                
                {/* Menu 3 Pontos */}
                <div className="relative group/menu">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                        className="text-gray-400 hover:text-brand-purple p-1 rounded-full transition-colors -mt-1 -mr-2"
                    >
                        <i className="fas fa-ellipsis-h text-sm"></i>
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 top-6 bg-white shadow-xl border border-gray-100 rounded-lg z-50 w-32 py-1 animate-in fade-in zoom-in-95 duration-100">
                            {isOwner ? (
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-2">
                                    <i className="far fa-trash-alt"></i> Excluir
                                </button>
                            ) : (
                                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 text-xs font-medium flex items-center gap-2">
                                    <i className="far fa-flag"></i> Denunciar
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Conteúdo do Post */}
            <div className="mt-1 text-[15px] text-gray-900 whitespace-pre-wrap leading-normal">
                {post.category === 'books' ? (
                    <BookPostDispatcher post={post} />
                ) : (
                    <>
                        <p>{post.content}</p>
                        {post.coverImage && (
                            <div className="mt-3 rounded-xl overflow-hidden border border-gray-100 relative w-full aspect-video">
                                <Image src={post.coverImage} alt="Mídia" fill className="object-cover" />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer de Ações */}
            <div className="flex justify-between items-center mt-3 max-w-[425px] text-gray-500">
                <button 
                    className="group flex items-center gap-2 hover:text-blue-500 transition-colors"
                    onClick={(e) => { e.stopPropagation(); onCommentClick?.(post); }}
                >
                    <div className="p-2 -ml-2 rounded-full group-hover:bg-blue-50 transition-colors">
                        <i className="far fa-comment text-[18px]"></i>
                    </div>
                    <span className="text-xs">{post.commentsCount > 0 && post.commentsCount}</span>
                </button>

                <button 
                    className={`group flex items-center gap-2 transition-colors ${liked ? 'text-pink-600' : 'hover:text-pink-600'}`}
                    onClick={handleLike}
                >
                    <div className="p-2 rounded-full group-hover:bg-pink-50 transition-colors">
                        <i className={`${liked ? 'fas' : 'far'} fa-heart text-[18px]`}></i>
                    </div>
                    <span className="text-xs">{likesCount > 0 && likesCount}</span>
                </button>

                <button className="group flex items-center gap-2 hover:text-green-500 transition-colors">
                    <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
                        <i className="fas fa-retweet text-[18px]"></i>
                    </div>
                </button>

                <button onClick={handleShare} className="group flex items-center gap-2 hover:text-brand-purple transition-colors">
                    <div className="p-2 rounded-full group-hover:bg-purple-50 transition-colors">
                        <i className="fas fa-share-nodes text-[18px]"></i>
                    </div>
                </button>
            </div>
         </div>
      </div>
    </article>
  );
}