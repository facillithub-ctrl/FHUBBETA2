"use client";

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import StoriesBar from './components/StoriesBar';
import CreatePostWidget from './components/CreatePostWidget';
import CategoryTabs from './components/CategoryTabs';
import TrendingTerms from './components/TrendingTerms';
import CreateReviewModal from './components/CreateReviewModal';
import PostDetailModal from './components/PostDetailModal';
import { UserProfile, StoryCategory, StoryPost } from './types';
import createClient from '@/utils/supabase/client';
import { createStoryPost, getPostById } from './actions';

// Importação dos componentes de Feed
import GeneralFeed from './components/feeds/GeneralFeed';
import BookFeed from './components/feeds/BookFeed';
import MovieFeed from './components/feeds/MovieFeed';
import GamesFeed from './components/feeds/GamesFeed';

// Componente Wrapper para conteúdo com useSearchParams
function StoriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postIdFromUrl = searchParams.get('p'); // Pega ID se houver na URL

  const [activeCategory, setActiveCategory] = useState<StoryCategory>('all');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  // Controle de recarregamento do Feed (evita duplicatas)
  const [feedKey, setFeedKey] = useState(0);
  const [isPosting, setIsPosting] = useState(false);
  
  // Estado para Modal de Post
  const [selectedPost, setSelectedPost] = useState<StoryPost | null>(null);

  // 1. Carregar Usuário
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
          username: profile?.nickname || 'user',
          isVerified: profile?.is_verified,
        });
      }
    };
    loadUser();
  }, []);

  // 2. Abrir Modal se houver ID na URL (Deep Linking)
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

  // Fechar Modal = Limpar URL
  const closePostModal = () => {
    setSelectedPost(null);
    router.push('/dashboard/applications/global/stories', { scroll: false });
  };

  // Criar Post (Sem duplicar estado local)
  const handlePostCreate = async (postData: StoryPost | string) => {
    if (!currentUser || isPosting) return; // Evita duplo clique
    
    setIsPosting(true);
    try {
        if (typeof postData === 'string') {
            await createStoryPost({
                content: postData,
                category: activeCategory === 'all' ? 'books' : activeCategory,
                type: 'status'
            });
        } else {
            await createStoryPost(postData);
        }
        
        // APENAS mudamos a chave. O componente de Feed vai recarregar do servidor.
        // Não adicionamos manualmente ao array para evitar duplicação.
        setFeedKey(prev => prev + 1);
        
    } catch (e) {
        alert("Erro ao publicar.");
    } finally {
        setIsPosting(false);
    }
  };

  // Renderiza o Feed correto baseado na categoria
  const renderFeed = () => {
    const userId = currentUser?.id;
    // Passamos key explicitamente para forçar remontagem quando feedKey mudar
    switch (activeCategory) {
      case 'books': 
        return <BookFeed key={feedKey} userId={userId} />;
      case 'movies': 
      case 'series': 
      case 'anime': 
        return <MovieFeed key={feedKey} userId={userId} />;
      case 'games': 
        return <GamesFeed key={feedKey} userId={userId} />;
      default: 
        return <GeneralFeed key={feedKey} userId={userId} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans pb-20 relative">
      
      {/* MODAL DE COMENTÁRIOS / POST */}
      {selectedPost && (
        <PostDetailModal 
          post={selectedPost} 
          currentUser={currentUser} 
          onClose={closePostModal} 
        />
      )}

      {/* MODAL DE CRIAÇÃO COMPLETA */}
      {currentUser && (
        <CreateReviewModal 
          isOpen={isReviewModalOpen} 
          onClose={() => setIsReviewModalOpen(false)} 
          currentUser={currentUser} 
          onPostCreate={handlePostCreate} 
        />
      )}

      <div className="max-w-[1250px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 px-0 lg:px-4">
        
        {/* COLUNA PRINCIPAL */}
        <main className="lg:col-span-8 min-h-screen">
           
           {/* HEADER ESTÁTICO (Não acompanha o scroll) */}
           <div className="bg-[#FDFDFD] border-b border-gray-100 pt-6 pb-2 px-4 shadow-sm relative z-10">
              <div className="flex items-center justify-between mb-4">
                 <div className="relative w-32 h-8">
                    <Image src="/assets/images/marcas/Stories.png" alt="Stories" fill className="object-contain object-left" priority />
                 </div>
                 <div className="flex gap-2">
                    <button 
                        onClick={() => setIsReviewModalOpen(true)}
                        className="w-9 h-9 rounded-full bg-brand-purple text-white flex items-center justify-center shadow-md hover:bg-purple-700 transition-colors"
                    >
                        <i className="fas fa-plus"></i>
                    </button>
                 </div>
              </div>
              
              <StoriesBar currentUser={currentUser} />
              
              <div className="mt-4">
                 <CategoryTabs activeCategory={activeCategory} onSelect={setActiveCategory} />
              </div>
           </div>

           <div className="py-6 px-4">
              {currentUser && (
                  <div className="mb-8">
                    <CreatePostWidget currentUser={currentUser} onPostCreate={handlePostCreate} />
                  </div>
              )}
              
              {/* FEED */}
              {renderFeed()}
           </div>
        </main>

        {/* SIDEBAR */}
        <aside className="hidden lg:block lg:col-span-4 pl-6">
           <div className="sticky top-8 space-y-8 pb-10 pt-6">
              <TrendingTerms category={activeCategory} />
           </div>
        </aside>

      </div>
    </div>
  );
}

// Exportação com Suspense
export default function StoriesPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Carregando...</div>}>
      <StoriesContent />
    </Suspense>
  );
}