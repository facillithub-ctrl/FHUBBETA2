"use client";

import { useState } from 'react';
import Image from 'next/image';
import { StoryPost } from '../types';
import { togglePostLike } from '../actions'; 

export default function BookgramCard({ post }: { post: StoryPost }) {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [saved, setSaved] = useState(post.isSaved || false);

  const handleLike = async () => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
    try { await togglePostLike(post.id, liked); } catch (e) { /* rollback */ }
  };

  // Cores por categoria
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

  const themeClass = getCategoryColor(post.category);

  return (
    <div className="bg-white rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100/50 group">
      
      {/* HEADER */}
      <div className="p-5 pb-3 flex items-start justify-between">
        <div className="flex gap-3.5">
          <div className="w-[42px] h-[42px] rounded-full relative cursor-pointer ring-2 ring-gray-100 overflow-hidden">
             {post.user.avatar_url ? (
                <Image src={post.user.avatar_url} alt={post.user.name} fill className="object-cover" />
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

      {/* CONTEÚDO VISUAL */}
      <div className="relative w-full bg-gray-50 border-y border-gray-50/50">
         
         {/* SPORTS (Placar) */}
         {post.category === 'sports' && post.metadata?.homeTeam && (
            <div className="bg-gradient-to-br from-green-900 to-gray-900 p-6 text-white text-center relative overflow-hidden">
               <span className="text-[10px] font-bold uppercase opacity-60 mb-4 block tracking-widest relative z-10">{post.metadata.league}</span>
               <div className="flex justify-between items-center px-4 relative z-10">
                  <div className="flex flex-col items-center">
                     <div className="w-12 h-12 bg-white text-black rounded-full mb-2 flex items-center justify-center font-black text-lg">H</div>
                     <span className="text-sm font-bold">{post.metadata.homeTeam}</span>
                  </div>
                  <div className="text-4xl font-black bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/20">
                     {post.metadata.score}
                  </div>
                  <div className="flex flex-col items-center">
                     <div className="w-12 h-12 bg-white text-black rounded-full mb-2 flex items-center justify-center font-black text-lg">A</div>
                     <span className="text-sm font-bold">{post.metadata.awayTeam}</span>
                  </div>
               </div>
               <div className="mt-5 text-xs font-medium bg-green-500/20 inline-flex items-center px-3 py-1 rounded-full text-green-300 border border-green-500/30 relative z-10">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></span> Ao Vivo
               </div>
            </div>
         )}

         {/* CINEMATOGRÁFICO */}
         {['movies', 'series', 'anime'].includes(post.category) && post.coverImage && (
            <div className="relative w-full h-72 md:h-80 overflow-hidden group cursor-pointer">
               <Image src={post.coverImage} alt="Cover" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
               <div className="absolute bottom-5 left-5 right-5 text-white">
                  <h3 className="text-2xl font-bold leading-tight mb-1 drop-shadow-md">{post.title}</h3>
                  <div className="flex items-center gap-3 text-xs opacity-90 font-medium">
                     {post.metadata?.director && <span>Dir. {post.metadata.director}</span>}
                     {post.metadata?.season && <span>T{post.metadata.season}:E{post.metadata.episode}</span>}
                     {post.rating && (
                        <div className="flex text-yellow-400 gap-1 items-center bg-black/30 px-2 py-1 rounded-lg backdrop-blur-sm">
                           <i className="fas fa-star"></i> <span className="font-bold text-white">{post.rating}</span>
                        </div>
                     )}
                  </div>
               </div>
               {post.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                     <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-2xl border border-white/30 shadow-xl group-hover:scale-110 transition-transform">
                        <i className="fas fa-play ml-1"></i>
                     </div>
                  </div>
               )}
            </div>
         )}

         {/* GAMES (Progresso) */}
         {post.category === 'games' && (
            <div className="relative w-full h-60 overflow-hidden bg-gray-900 text-white group cursor-pointer">
               {post.coverImage && <Image src={post.coverImage} alt="Game" fill className="object-cover opacity-80 group-hover:opacity-60 transition-opacity" />}
               <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black via-black/60 to-transparent">
                  <div className="flex justify-between items-end mb-3">
                     <div>
                        <h3 className="font-bold text-xl drop-shadow-md">{post.title}</h3>
                        <p className="text-xs text-violet-300 font-medium flex items-center gap-2">
                           <i className="fab fa-playstation"></i> {post.metadata?.platform} • {post.metadata?.achievement}
                        </p>
                     </div>
                     <span className="text-3xl font-black italic tracking-tighter">{post.progress?.percentage}%</span>
                  </div>
                  {post.progress && (
                     <div className="w-full h-2.5 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                        <div className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 shadow-[0_0_15px_rgba(139,92,246,0.6)]" style={{width: `${post.progress.percentage}%`}}></div>
                     </div>
                  )}
               </div>
            </div>
         )}

         {/* LIVROS */}
         {post.category === 'books' && post.coverImage && (
            <div className="flex bg-white p-5 gap-5">
               <div className="w-28 h-40 bg-gray-200 rounded-lg shadow-lg flex-shrink-0 relative overflow-hidden group-hover:-translate-y-1 transition-transform duration-300">
                  <Image src={post.coverImage} alt="Book" fill className="object-cover" />
               </div>
               <div className="flex-1 py-1 flex flex-col justify-center">
                  <h3 className="font-bold text-xl text-slate-800 leading-tight mb-1">{post.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 font-medium">{post.subtitle}</p>
                  
                  {post.progress && (
                     <div className="mb-4">
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wide">
                           <span>{post.progress.status}</span>
                           <span>{post.progress.percentage}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500" style={{width: `${post.progress.percentage}%`}}></div>
                        </div>
                     </div>
                  )}
                  {post.rating && (
                     <div className="flex text-yellow-400 text-sm gap-1">
                        {[...Array(5)].map((_,i) => <i key={i} className={`fas fa-star ${i < post.rating! ? '' : 'text-gray-200'}`}></i>)}
                     </div>
                  )}
               </div>
            </div>
         )}

         {/* PODCAST / LINK */}
         {(post.category === 'podcasts' || post.type === 'link') && (
            <div className={`p-6 relative overflow-hidden ${post.category === 'podcasts' ? 'bg-cyan-900 text-white' : 'bg-gray-100 text-slate-800'}`}>
               {post.type === 'link' && post.mediaUrl && (
                  <div className="absolute inset-0 opacity-10">
                     <Image src={post.mediaUrl} alt="bg" fill className="object-cover grayscale" />
                  </div>
               )}
               
               <div className="relative z-10 flex gap-4 items-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-lg border ${post.category === 'podcasts' ? 'bg-cyan-800 border-cyan-700' : 'bg-white border-gray-200'}`}>
                     {post.category === 'podcasts' ? <i className="fas fa-play"></i> : <i className="fas fa-link text-slate-400"></i>}
                  </div>
                  <div className="flex-1">
                     {post.externalLink?.domain && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded mb-1 inline-block ${post.category === 'podcasts' ? 'bg-cyan-950/50 text-cyan-300' : 'bg-gray-200 text-gray-500'}`}>
                           {post.externalLink.domain}
                        </span>
                     )}
                     <h3 className="font-bold text-lg leading-tight">{post.title}</h3>
                     <p className={`text-xs mt-1 ${post.category === 'podcasts' ? 'opacity-80' : 'text-gray-500'}`}>
                        {post.subtitle} {post.metadata?.duration && `• ${post.metadata.duration}`}
                     </p>
                  </div>
                  {post.externalLink?.url && (
                     <a href={post.externalLink.url} target="_blank" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/10">
                        <i className="fas fa-external-link-alt text-sm"></i>
                     </a>
                  )}
               </div>
            </div>
         )}

      </div>

      {/* AÇÕES & LEGENDA */}
      <div className="p-5 pt-4">
         <p className="text-sm text-gray-700 leading-relaxed mb-3 font-medium">
            {post.content}
         </p>
         
         <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-2">
            <div className="flex gap-6 text-gray-500">
               <button onClick={handleLike} className={`flex items-center gap-2 transition-colors group ${liked ? 'text-red-500' : 'hover:text-red-500'}`}>
                  <i className={`${liked ? 'fas' : 'far'} fa-heart text-xl group-active:scale-110 transition-transform`}></i> 
                  <span className="text-xs font-bold">{likesCount}</span>
               </button>
               <button className={`flex items-center gap-2 hover:opacity-80 transition-colors group ${themeClass.split(' ')[0]}`}>
                  <i className="far fa-comment text-xl"></i> 
                  <span className="text-xs font-bold">{post.commentsCount}</span>
               </button>
               <button className="hover:text-slate-900 transition-colors"><i className="far fa-paper-plane text-xl"></i></button>
            </div>
            <button onClick={() => setSaved(!saved)}>
               <i className={`${saved ? 'fas' : 'far'} fa-bookmark text-xl ${saved ? themeClass.split(' ')[0] : 'text-gray-400 hover:text-gray-600'}`}></i>
            </button>
         </div>
      </div>
    </div>
  );
}