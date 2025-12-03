"use client";

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

// --- COMPONENTES ---
import StoriesBar from './components/StoriesBar';
import CategoryTabs from './components/CategoryTabs';
import CreateReviewModal from './components/CreateReviewModal';
import PostDetailModal from './components/PostDetailModal';
import TrendingTerms from './components/TrendingTerms';

// --- FEEDS (Os componentes que carregam os posts) ---
import BookFeed from './components/feeds/BookFeed';
import GeneralFeed from './components/feeds/GeneralFeed';
import MovieFeed from './components/feeds/MovieFeed';
import GamesFeed from './components/feeds/GamesFeed';

// --- TIPOS E ACTIONS ---
import { UserProfile, StoryCategory, StoryPost } from './types';
import { createStoryPost, getPostById } from './actions';
import createClient from '@/utils/supabase/client';

// --- SUB-COMPONENTE: CARD DE PERFIL (Lateral Esquerda) ---
const ProfileSideCard = ({ user, onOpenCreate }: { user: UserProfile, onOpenCreate: () => void }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
    <div className="flex flex-col items-center text-center">
      {/* Avatar com Borda Gradiente (Identidade da Marca) */}
      <div className="p-[2px] rounded-full bg-gradient-to-tr from-brand-purple to-brand-green mb-3">
        <div className="w-20 h-20 rounded-full border-4 border-white relative overflow-hidden bg-gray-100">
           {user.avatar_url ? (
             <Image src={user.avatar_url} alt={user.name} fill className="object-cover" />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-300">
               <i className="fas fa-user text-3xl"></i>
             </div>
           )}
        </div>
      </div>
      
      <h2 className="font-bold text-gray-900 text-lg leading-tight">{user.name}</h2>
      <p className="text-gray-500 text-sm mb-6 font-medium">{user.username}</p>
      
      {/* Stats Rápidos */}
      <div className="w-full grid grid-cols-3 gap-2 border-t border-b border-gray-50 py-4 mb-6">
         <div className="cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors">
            <span className="block font-bold text-gray-900 text-lg">12</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">Lidos</span>
         </div>
         <div className="cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors">
            <span className="block font-bold text-gray-900 text-lg">48</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">Seguidores</span>
         </div>
         <div className="cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors">
            <span className="block font-bold text-gray-900 text-lg">15</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">Seguindo</span>
         </div>
      </div>

      {/* Botão de Ação Principal */}
      <button 
        onClick={onOpenCreate}
        className="w-full py-3 bg-brand-purple hover:bg-[#320261] text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-purple/20 hover:shadow-brand-purple/40 flex items-center justify-center gap-2 group"
      >
        <i className="fas fa-plus-circle group-hover:scale-110 transition-transform"></i> 
        Nova Publicação
      </button>
    </div>

    {/* Links Rápidos do Footer */}
    <div className="mt-6 text-center">
       <p className="text-[10px] text-gray-400">
         Facillit Stories © 2024 <br/>
         <span className="hover:text-brand-purple cursor-pointer">Privacidade</span> • <span className="hover:text-brand-purple cursor-pointer">Termos</span>
       </p>
    </div>
  </div>
);

// --- COMPONENTE PRINCIPAL (LÓGICA) ---
function StoriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postIdFromUrl = searchParams.get('p');

  // --- ESTADOS ---
  const [activeCategory, setActiveCategory] = useState<StoryCategory>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedPost, setSelectedPost] = useState<StoryPost | null>(null);
  
  // Controle de Atualização do Feed (Key Force Update)
  const [feedKey, setFeedKey] = useState(0); 

  // 1. Carregar Usuário Atual
  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setCurrentUser({
          id: user.id,
          name: profile?.full_name || 'Usuário',
          avatar_url: profile?.avatar_url,
          username: profile?.nickname ? `@${profile.nickname}` : '@user',
          isVerified: profile?.is_verified,
        });
      }
    };
    loadUser();
  }, []);

  // 2. Gerenciar Deep Links (Abrir post direto pela URL)
  useEffect(() => {
    const loadDeepLinkedPost = async () => {
      if (postIdFromUrl) {
        const post = await getPostById(postIdFromUrl);
        if (post) setSelectedPost(post);
      } else {
        setSelectedPost(null);
      }
    };
    loadDeepLinkedPost();
  }, [postIdFromUrl]);

  // Handlers
  const handleClosePostModal = () => {
    setSelectedPost(null);
    router.push('/dashboard/applications/global/stories', { scroll: false });
  };

  const handlePostCreate = async (postData: Partial<StoryPost>) => {
    if (!currentUser) return;
    try {
        await createStoryPost(postData);
        // Força o feed a recarregar sem refresh na página
        setFeedKey(prev => prev + 1);
        setIsCreateModalOpen(false);
    } catch (e) {
        alert("Não foi possível publicar agora. Tente novamente.");
    }
  };

  // Renderizador de Feed Condicional
  const renderFeed = () => {
    const props = { userId: currentUser?.id, key: feedKey };
    
    switch (activeCategory) {
      case 'books': return <BookFeed {...props} />;
      case 'movies': 
      case 'series': 
      case 'anime': return <MovieFeed category={activeCategory} {...props} />;
      case 'games': return <GamesFeed {...props} />;
      default: return <GeneralFeed category={activeCategory} {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20">
      
      {/* --- CAMADA DE MODAIS --- */}
      {selectedPost && (
        <PostDetailModal 
          post={selectedPost} 
          currentUser={currentUser} 
          onClose={handleClosePostModal} 
        />
      )}

      {currentUser && (
        <CreateReviewModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
          currentUser={currentUser} 
          onPostCreate={handlePostCreate} 
        />
      )}

      {/* --- LAYOUT GRID RESPONSIVO --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 1. COLUNA ESQUERDA (PERFIL) - Desktop Only */}
          <aside className="hidden lg:block lg:col-span-3">
             {currentUser ? (
                <ProfileSideCard user={currentUser} onOpenCreate={() => setIsCreateModalOpen(true)} />
             ) : (
                // Skeleton Loading simples
                <div className="h-64 bg-gray-50 rounded-2xl animate-pulse border border-gray-100"></div>
             )}
          </aside>

          {/* 2. COLUNA CENTRAL (FEED) */}
          <main className="lg:col-span-6 space-y-6">
             
             {/* Header Mobile (Visível apenas < lg) */}
             <div className="lg:hidden flex items-center justify-between mb-4 sticky top-0 z-30 bg-[#FDFDFD]/95 backdrop-blur-sm py-2 px-2 -mx-2">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-brand-purple flex items-center justify-center text-white">
                      <i className="fas fa-feather-alt"></i>
                   </div>
                   <h1 className="font-bold text-xl text-gray-900 tracking-tight">Stories</h1>
                </div>
                <button 
                  onClick={() => setIsCreateModalOpen(true)} 
                  className="w-9 h-9 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                >
                   <i className="fas fa-plus"></i>
                </button>
             </div>

             {/* Stories (Círculos no Topo) */}
             <div className="mb-2">
                <StoriesBar currentUser={currentUser} />
             </div>

             {/* Filtros de Categoria (Sticky) */}
             <div className="sticky top-0 lg:top-0 z-20 bg-[#FDFDFD]/95 backdrop-blur-md pt-2 pb-4">
                <CategoryTabs activeCategory={activeCategory} onSelect={setActiveCategory} />
             </div>

             {/* Área do Feed */}
             <div className="min-h-[600px] animate-fade-in">
                {renderFeed()}
             </div>
          </main>

          {/* 3. COLUNA DIREITA (TRENDING) - Desktop Only */}
          <aside className="hidden lg:block lg:col-span-3">
             <div className="sticky top-24 space-y-6">
                {/* Busca */}
                <div className="relative group">
                   <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple transition-colors"></i>
                   <input 
                      type="text" 
                      placeholder="Buscar no Stories..." 
                      className="w-full bg-white border border-gray-200 rounded-full pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all shadow-sm"
                   />
                </div>

                {/* Trending Topics */}
                <TrendingTerms category={activeCategory} />
             </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

// --- EXPORT DEFAULT COM SUSPENSE ---
export default function StoriesPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FDFDFD] gap-4">
        <div className="w-12 h-12 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm font-medium animate-pulse">Carregando Stories...</p>
      </div>
    }>
      <StoriesContent />
    </Suspense>
  );
}