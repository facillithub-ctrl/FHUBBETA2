// CAMINHO: src/app/dashboard/applications/global/stories/components/PostCard.tsx
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { StoryPost } from '../types';
import { togglePostLike } from '../actions'; 

export default function PostCard({ post }: { post: StoryPost }) {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [saved, setSaved] = useState(post.isSaved || false);

  const handleLike = async () => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
    try { await togglePostLike(post.id, liked); } catch (e) { /* rollback */ }
  };

  // Cores por categoria para badges e detalhes
  const getCategoryColor = (cat: string) => {
    switch(cat) {
        case 'movies': return 'text-red-500 bg-red-50';
        case 'series': return 'text-pink-500 bg-pink-50';
        case 'anime': return 'text-orange-500 bg-orange-50';
        case 'sports': return 'text-green-600 bg-green-50';
        case 'games': return 'text-violet-600 bg-violet-50';
        case 'podcasts': return 'text-cyan-600 bg-cyan-50';
        default: return 'text-purple-600 bg-purple-50';
    }
  };

  const themeClass = getCategoryColor(post.category);

  return (
    <div className="mb-8 bg-white rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100/50 group">
      
      {/* 1. HEADER: Perfil + Badge de Categoria */}
      <div className="p-5 pb-3 flex items-start justify-between">
        <div className="flex gap-3.5">
          <div className="w-[42px] h-[42px] rounded-full relative cursor-pointer ring-2 ring-gray-100">
             {post.user.avatar_url ? (
                <Image src={post.user.avatar_url} alt={post.user.name} fill className="object-cover rounded-full" />
             ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300"><i className="fas fa-user"></i></div>
             )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-dark-text text-sm">{post.user.name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${themeClass}`}>
                 {post.category === 'all' ? 'Geral' : post.category}
              </span>
            </div>
            <p className="text-xs text-gray-400">{post.createdAt}</p>
          </div>
        </div>
        <button className="text-gray-300 hover:text-dark-text"><i className="fas fa-ellipsis-h"></i></button>
      </div>

      {/* 2. CONTEÚDO VISUAL (Layouts Modulares) */}
      <div className="relative w-full bg-gray-50">
         
         {/* LAYOUT: SPORTS (Placar) */}
         {post.category === 'sports' && post.metadata?.homeTeam && (
            <div className="bg-gradient-to-br from-green-900 to-gray-900 p-6 text-white text-center">
               <span className="text-[10px] font-bold uppercase opacity-60 mb-4 block tracking-widest">{post.metadata.league}</span>
               <div className="flex justify-between items-center px-4">
                  <div className="flex flex-col items-center">
                     <div className="w-12 h-12 bg-white rounded-full mb-2 flex items-center justify-center text-black font-bold">H</div>
                     <span className="text-sm font-bold">{post.metadata.homeTeam}</span>
                  </div>
                  <div className="text-3xl font-black bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                     {post.metadata.score}
                  </div>
                  <div className="flex flex-col items-center">
                     <div className="w-12 h-12 bg-white rounded-full mb-2 flex items-center justify-center text-black font-bold">A</div>
                     <span className="text-sm font-bold">{post.metadata.awayTeam}</span>
                  </div>
               </div>
               <div className="mt-4 text-xs font-medium bg-green-500/20 inline-block px-3 py-1 rounded-full text-green-300">
                  <i className="fas fa-circle text-[8px] mr-2 animate-pulse"></i> Ao Vivo
               </div>
            </div>
         )}

         {/* LAYOUT: FILMES/SERIES/ANIME (Cinematográfico) */}
         {['movies', 'series', 'anime'].includes(post.category) && post.coverImage && (
            <div className="relative w-full h-64 overflow-hidden group cursor-pointer">
               <Image src={post.coverImage} alt="Cover" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
               <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold leading-tight mb-1">{post.title}</h3>
                  <div className="flex items-center gap-3 text-xs opacity-90">
                     {post.metadata?.director && <span>Dir. {post.metadata.director}</span>}
                     {post.metadata?.season && <span>T{post.metadata.season}:E{post.metadata.episode}</span>}
                     {post.rating && (
                        <div className="flex text-yellow-400 gap-0.5">
                           <i className="fas fa-star"></i> <span className="font-bold text-white">{post.rating}</span>
                        </div>
                     )}
                  </div>
               </div>
               {/* Play Button Overlay */}
               {post.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                     <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xl border border-white/30">
                        <i className="fas fa-play ml-1"></i>
                     </div>
                  </div>
               )}
            </div>
         )}

         {/* LAYOUT: GAMES (Progresso) */}
         {post.category === 'games' && (
            <div className="relative w-full h-56 overflow-hidden bg-gray-900 text-white">
               {post.coverImage && <Image src={post.coverImage} alt="Game" fill className="object-cover opacity-60" />}
               <div className="absolute bottom-0 w-full p-5 bg-gradient-to-t from-black via-black/50 to-transparent">
                  <div className="flex justify-between items-end mb-2">
                     <div>
                        <h3 className="font-bold text-lg">{post.title}</h3>
                        <p className="text-xs text-violet-300">{post.metadata?.platform} • {post.metadata?.achievement}</p>
                     </div>
                     <span className="text-2xl font-black italic">{post.progress?.percentage}%</span>
                  </div>
                  {post.progress && (
                     <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" style={{width: `${post.progress.percentage}%`}}></div>
                     </div>
                  )}
               </div>
            </div>
         )}

         {/* LAYOUT: LIVROS (Clássico) */}
         {post.category === 'books' && post.coverImage && (
            <div className="flex bg-white p-4 gap-4">
               <div className="w-24 h-36 bg-gray-200 rounded-lg shadow-md flex-shrink-0 relative overflow-hidden">
                  <Image src={post.coverImage} alt="Book" fill className="object-cover" />
               </div>
               <div className="flex-1 py-1">
                  <h3 className="font-bold text-lg leading-tight mb-1">{post.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{post.subtitle}</p>
                  
                  {post.progress && (
                     <div className="mb-3">
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                           <span>{post.progress.status}</span>
                           <span>{post.progress.percentage}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                           <div className="h-full bg-purple-500" style={{width: `${post.progress.percentage}%`}}></div>
                        </div>
                     </div>
                  )}
                  {post.rating && (
                     <div className="flex text-yellow-400 text-xs gap-1">
                        {[...Array(5)].map((_,i) => <i key={i} className={`fas fa-star ${i < post.rating! ? '' : 'text-gray-200'}`}></i>)}
                     </div>
                  )}
               </div>
            </div>
         )}

         {/* LAYOUT: PODCAST (Audio Wave) */}
         {post.category === 'podcasts' && (
            <div className="bg-cyan-900 text-white p-6 relative overflow-hidden">
               <div className="absolute -right-10 -top-10 text-cyan-800 opacity-20 text-9xl"><i className="fas fa-microphone"></i></div>
               <div className="relative z-10 flex gap-4 items-center">
                  <div className="w-16 h-16 bg-cyan-800 rounded-xl flex items-center justify-center text-2xl shadow-lg border border-cyan-700">
                     <i className="fas fa-play"></i>
                  </div>
                  <div>
                     <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-950/50 px-2 py-1 rounded text-cyan-300">Episódio Novo</span>
                     <h3 className="font-bold text-lg leading-tight mt-1">{post.title}</h3>
                     <p className="text-xs opacity-80">{post.subtitle} • {post.metadata?.duration}</p>
                  </div>
               </div>
               {/* Fake Audio Visualizer */}
               <div className="flex items-end gap-1 h-8 mt-6 opacity-60">
                  {[...Array(20)].map((_,i) => (
                     <div key={i} className="flex-1 bg-cyan-400 rounded-t-sm" style={{height: `${Math.random() * 100}%`}}></div>
                  ))}
               </div>
            </div>
         )}

      </div>

      {/* 3. CONTEÚDO TEXTUAL & AÇÕES */}
      <div className="p-5 pt-4">
         <p className="text-sm text-gray-700 leading-relaxed mb-3">
            {post.content}
         </p>
         
         <div className="flex items-center justify-between border-t border-gray-50 pt-3">
            <div className="flex gap-5 text-gray-500">
               <button onClick={handleLike} className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-red-500' : 'hover:text-red-500'}`}>
                  <i className={`${liked ? 'fas' : 'far'} fa-heart text-lg`}></i> <span className="text-xs font-bold">{likesCount}</span>
               </button>
               <button className={`flex items-center gap-1.5 hover:opacity-80 ${themeClass.split(' ')[0]}`}>
                  <i className="far fa-comment text-lg"></i> <span className="text-xs font-bold">{post.commentsCount}</span>
               </button>
               <button className="hover:text-dark-text"><i className="far fa-paper-plane text-lg"></i></button>
            </div>
            <button onClick={() => setSaved(!saved)}>
               <i className={`${saved ? 'fas' : 'far'} fa-bookmark text-lg ${saved ? themeClass.split(' ')[0] : 'text-gray-400 hover:text-gray-600'}`}></i>
            </button>
         </div>
      </div>
    </div>
  );
}