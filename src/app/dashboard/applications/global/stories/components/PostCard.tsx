"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StoryPost } from '../types';
import { togglePostLike, deleteStoryPost } from '../actions'; 
import BookPostDispatcher from './feeds/books/BookPostDispatcher';


// IMPORTAÇÃO CORRETA DO SEU COMPONENTE
import { VerificationBadge } from '@/components/VerificationBadge';

interface Props {
  post: StoryPost;
  currentUserId?: string; // Necessário para saber se pode deletar
  onCommentClick?: (post: StoryPost) => void;
}

export default function PostCard({ post, currentUserId, onCommentClick }: Props) {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [saved, setSaved] = useState(post.isSaved || false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const isOwner = currentUserId === post.user.id;

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita abrir o modal ao curtir
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
    try { await togglePostLike(post.id, liked); } catch (e) { /* rollback silencioso */ }
  };

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja excluir este post? Essa ação não pode ser desfeita.")) {
        try {
            await deleteStoryPost(post.id);
            setIsDeleted(true); // Remove visualmente do feed
        } catch (e) {
            alert("Erro ao excluir post.");
        }
    }
  };

  const handleShare = (e: React.MouseEvent) => {
      e.stopPropagation();
      const url = `${window.location.origin}/stories?p=${post.id}`;
      navigator.clipboard.writeText(url).then(() => alert("Link copiado!"));
  };

  if (isDeleted) return null;

  // Determina qual dispatcher usar
  const isBook = post.category === 'books';
  const isGame = post.category === 'games';

  return (
    // DESIGN FLUIDO: Borda inferior apenas, padding lateral removido em mobile
    <article className="bg-white md:rounded-xl border-b md:border border-gray-100 p-4 hover:bg-gray-50/50 transition-colors cursor-pointer group relative">
      
      <div className="flex gap-3">
         {/* Avatar Linkado */}
         <Link href={`/u/${post.user.username.replace('@', '')}`} onClick={e => e.stopPropagation()} className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gray-200 relative overflow-hidden border border-gray-200">
               {post.user.avatar_url ? (
                  <Image src={post.user.avatar_url} alt={post.user.name} fill className="object-cover" />
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400"><i className="fas fa-user"></i></div>
               )}
            </div>
         </Link>

         <div className="flex-1 min-w-0">
            {/* Cabeçalho do Post */}
            <div className="flex justify-between items-start">
               <div className="flex items-center gap-1 flex-wrap">
                  <Link href={`/u/${post.user.username.replace('@', '')}`} onClick={e => e.stopPropagation()} className="group/link">
                      <span className="font-bold text-gray-900 text-sm group-hover/link:underline">{post.user.name}</span>
                  </Link>
                  
                  {/* USANDO O COMPONENTE DE VERIFICAÇÃO REAL */}
                  <VerificationBadge badge={post.user.badge} size="4px" />

                  <span className="text-gray-500 text-xs">· {post.createdAt}</span>
               </div>

               {/* Menu de Opções */}
               <div className="relative">
                   <button 
                     className="text-gray-400 hover:text-brand-purple p-1 -mt-1 -mr-2"
                     onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                   >
                      <i className="fas fa-ellipsis-h"></i>
                   </button>

                   {isMenuOpen && (
                       <div className="absolute right-0 top-6 w-40 bg-white shadow-xl border border-gray-100 rounded-lg z-20 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
                           {isOwner ? (
                               <button 
                                 onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                                 className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                               >
                                   <i className="fas fa-trash"></i> Excluir Post
                               </button>
                           ) : (
                               <button className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                   <i className="fas fa-flag"></i> Denunciar
                               </button>
                           )}
                       </div>
                   )}
               </div>
            </div>
            
            {/* Username abaixo do nome para clareza */}
            <div className="text-xs text-gray-400 -mt-0.5 mb-1">{post.user.username}</div>

            {/* Conteúdo clicável (abre o modal de detalhes via prop onCommentClick ou similar) */}
            <div onClick={() => onCommentClick?.(post)}>
                {isBook ? (
                    <BookPostDispatcher post={post} />
                ) : isGame ? (
                    <GamePostDispatcher post={post} />
                ) : (
                    <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap mt-1">
                        {post.content}
                        {post.coverImage && (
                            <div className="mt-3 relative w-full h-64 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                <Image src={post.coverImage} alt="Mídia" fill className="object-cover" />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Barra de Ações */}
            <div className="flex items-center justify-between mt-3 max-w-md pr-4">
               <button 
                 onClick={handleLike} 
                 className={`flex items-center gap-1.5 text-xs group transition-colors ${liked ? 'text-pink-600' : 'text-gray-500 hover:text-pink-600'}`}
               >
                  <div className="p-2 -ml-2 rounded-full group-hover:bg-pink-50 transition-colors">
                     <i className={`${liked ? 'fas' : 'far'} fa-heart text-sm`}></i>
                  </div>
                  <span className={liked ? 'font-bold' : ''}>{likesCount > 0 && likesCount}</span>
               </button>

               <button 
                 onClick={(e) => { e.stopPropagation(); onCommentClick?.(post); }}
                 className="flex items-center gap-1.5 text-xs text-gray-500 group hover:text-blue-500 transition-colors"
               >
                  <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                     <i className="far fa-comment text-sm"></i>
                  </div>
                  <span>{post.commentsCount > 0 && post.commentsCount}</span>
               </button>

               <button onClick={handleShare} className="flex items-center gap-1.5 text-xs text-gray-500 group hover:text-green-500 transition-colors">
                  <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
                     <i className="fas fa-share-nodes text-sm"></i>
                  </div>
               </button>

               <button onClick={(e) => { e.stopPropagation(); setSaved(!saved); }} className={`flex items-center gap-1.5 text-xs group transition-colors ${saved ? 'text-brand-purple' : 'text-gray-500 hover:text-brand-purple'}`}>
                  <div className="p-2 rounded-full group-hover:bg-purple-50 transition-colors">
                     <i className={`${saved ? 'fas' : 'far'} fa-bookmark text-sm`}></i>
                  </div>
               </button>
            </div>
         </div>
      </div>
    </article>
  );
}