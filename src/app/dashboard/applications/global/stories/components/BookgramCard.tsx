"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { StoryPost } from '../types';
import { useRealtimeLikes, useRealtimeComments } from '@/hooks/useStoryInteractions';

const getCategoryColor = (cat: string) => {
  switch(cat) {
      case 'movies': return 'text-red-500 bg-red-50';
      case 'series': return 'text-pink-500 bg-pink-50';
      case 'anime': return 'text-orange-500 bg-orange-50';
      case 'sports': return 'text-green-600 bg-green-50';
      case 'games': return 'text-violet-600 bg-violet-50';
      case 'podcasts': return 'text-cyan-600 bg-cyan-50';
      case 'book-club': return 'text-indigo-600 bg-indigo-50';
      default: return 'text-purple-600 bg-purple-50';
  }
};

interface BookgramCardProps {
  post: StoryPost;
  currentUserId?: string;
}

export default function BookgramCard({ post, currentUserId }: BookgramCardProps) {
  const { likesCount, isLiked, toggleLike } = useRealtimeLikes(post.id, currentUserId);
  const { comments } = useRealtimeComments(post.id);
  const [saved, setSaved] = useState(post.isSaved || false);
  const themeClass = getCategoryColor(post.category);

  // Navegação Deep Link
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL DO PERFIL: Remove '@' se vier do banco, garante formato limpo
  const rawUsername = post.user.username || 'user';
  const cleanUsername = rawUsername.startsWith('@') ? rawUsername.substring(1) : rawUsername;
  const profileLink = `/u/${cleanUsername}`;

  const openComments = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Impede borbulhamento se clicar em elementos internos
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('p', post.id);
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100/50 group">
      
      {/* HEADER */}
      <div className="p-5 pb-3 flex items-start justify-between">
        <div className="flex gap-3.5">
          <Link href={profileLink} onClick={(e) => e.stopPropagation()}>
            <div className="w-[42px] h-[42px] rounded-full relative cursor-pointer ring-2 ring-gray-100 overflow-hidden hover:ring-purple-300 transition-all">
               {post.user.avatar_url ? (
                  <Image src={post.user.avatar_url} alt={post.user.name} fill className="object-cover" />
               ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300"><i className="fas fa-user"></i></div>
               )}
            </div>
          </Link>
          
          <div>
            <div className="flex items-center gap-1.5">
              <Link href={profileLink} onClick={(e) => e.stopPropagation()} className="hover:underline flex items-center gap-1">
                 <span className="font-bold text-dark-text text-sm">{post.user.name}</span>
                 {/* SELO DE VERIFICADO */}
                 {post.user.isVerified && (
                    <span className="text-blue-500 text-[12px] flex items-center" title="Perfil Verificado">
                       <i className="fas fa-check-circle"></i>
                    </span>
                 )}
              </Link>
              
              <span className="text-gray-300">•</span>
              
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${themeClass}`}>
                 {post.category === 'all' ? 'Geral' : post.category}
              </span>
            </div>
            <p className="text-xs text-gray-400">{post.createdAt}</p>
          </div>
        </div>
        <button className="text-gray-300 hover:text-dark-text"><i className="fas fa-ellipsis-h"></i></button>
      </div>

      {/* ÁREA CLICÁVEL DO POST (Abre Modal) */}
      <div className="cursor-pointer" onClick={openComments}>
          {/* CONTEÚDO VISUAL (Exemplos simplificados, mantenha a lógica rica se tiver) */}
          <div className="relative w-full bg-gray-50 border-y border-gray-50/50">
             {post.coverImage && (
                <div className="relative w-full h-72 md:h-80 overflow-hidden">
                   <Image src={post.coverImage} alt="Cover" fill className="object-cover" />
                </div>
             )}
             {/* Se for apenas texto, adiciona um padding extra ou estilo aqui */}
          </div>

          {/* LEGENDA E TEXTO */}
          <div className="p-5 pt-4 pb-2">
             {post.title && <h3 className="font-bold text-lg mb-1">{post.title}</h3>}
             <p className="text-sm text-gray-700 leading-relaxed font-medium">
                {post.content}
             </p>
          </div>
      </div>

      {/* AÇÕES (Rodapé) */}
      <div className="p-5 pt-0">
         <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-2">
            <div className="flex gap-6 text-gray-500">
               <button 
                 onClick={(e) => { e.stopPropagation(); toggleLike(); }} 
                 className={`flex items-center gap-2 transition-colors group ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
               >
                  <i className={`${isLiked ? 'fas' : 'far'} fa-heart text-xl group-active:scale-110 transition-transform`}></i> 
                  <span className="text-xs font-bold">{likesCount}</span>
               </button>
               
               <button 
                 onClick={openComments}
                 className={`flex items-center gap-2 hover:opacity-80 transition-colors group ${themeClass.split(' ')[0]}`}
               >
                  <i className="far fa-comment text-xl"></i> 
                  <span className="text-xs font-bold">{comments.length}</span>
               </button>
               
               <button className="hover:text-slate-900 transition-colors"><i className="far fa-paper-plane text-xl"></i></button>
            </div>
            
            <button onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}>
               <i className={`${saved ? 'fas' : 'far'} fa-bookmark text-xl ${saved ? themeClass.split(' ')[0] : 'text-gray-400 hover:text-gray-600'}`}></i>
            </button>
         </div>
      </div>
    </div>
  );
}