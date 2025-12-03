"use client";

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ToastProvider, useToast } from '@/contexts/ToastContext';

// Componentes
import StoriesBar from './components/StoriesBar';
import CategoryTabs from './components/CategoryTabs';
import CreateReviewModal from './components/CreateReviewModal';
import CreatePostWidget from './components/CreatePostWidget'; // Novo Widget
import PostDetailModal from './components/PostDetailModal';
import TrendingTerms from './components/TrendingTerms';

// Feeds
import BookFeed from './components/feeds/BookFeed';

// Logic
import { UserProfile, StoryCategory, StoryPost } from './types';
import { createStoryPost, getPostById } from './actions';
import createClient from '@/utils/supabase/client';

// --- NOTIFICAÇÕES EM TEMPO REAL (Mock/Hook) ---
const useRealtimeNotifications = (userId?: string) => {
  const { showToast } = useToast();
  
  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    // Escuta inserções na tabela de notificações (se existir)
    const channel = supabase
      .channel('realtime-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, 
      (payload) => {
         showToast(payload.new.message || "Nova interação!", "info");
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, showToast]);
};

const ProfileSideCard = ({ user }: { user: UserProfile }) => (
  <div className="bg-white rounded-xl p-5 border border-gray-100 sticky top-24">
      <div className="flex items-center gap-3 mb-4">
         <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden relative border border-gray-200">
            {user.avatar_url && <Image src={user.avatar_url} alt="Eu" fill className="object-cover" />}
         </div>
         <div>
            <h3 className="font-bold text-gray-900 text-sm">{user.name}</h3>
            <p className="text-gray-500 text-xs">@{user.username}</p>
         </div>
      </div>
      <div className="flex justify-between text-center border-t border-gray-50 pt-3">
          <div><span className="block font-bold text-sm">12</span><span className="text-[10px] text-gray-400">Lidos</span></div>
          <div><span className="block font-bold text-sm">482</span><span className="text-[10px] text-gray-400">Seguidores</span></div>
          <div><span className="block font-bold text-sm">35</span><span className="text-[10px] text-gray-400">Seguindo</span></div>
      </div>
  </div>
);

function StoriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postIdFromUrl = searchParams.get('p');

  const [activeCategory, setActiveCategory] = useState<StoryCategory>('all');
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedPost, setSelectedPost] = useState<StoryPost | null>(null);
  const [feedKey, setFeedKey] = useState(0); 

  // Setup Inicial
  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setCurrentUser({
          id: user.id,
          name: profile?.full_name || 'User',
          avatar_url: profile?.avatar_url,
          username: profile?.nickname || 'user',
          isVerified: profile?.is_verified,
          verificationType: profile?.role === 'teacher' ? 'green' : (profile?.is_verified ? 'blue' : null)
        });
      }
    };
    load();
  }, []);

  // Ativa notificações
  useRealtimeNotifications(currentUser?.id);

  // Deep Link Handler
  useEffect(() => {
    if (postIdFromUrl) {
       getPostById(postIdFromUrl).then(post => {
          if (post) setSelectedPost(post);
       });
    } else {
       setSelectedPost(null);
    }
  }, [postIdFromUrl]);

  const handlePostCreate = async (postData: Partial<StoryPost>) => {
    if (!currentUser) return;
    try {
        await createStoryPost(postData);
        setFeedKey(p => p + 1);
        setIsAdvancedModalOpen(false);
    } catch {
        alert("Erro ao publicar.");
    }
  };

  const handleOpenPost = (post: StoryPost) => {
    setSelectedPost(post);
    window.history.pushState(null, '', `?p=${post.id}`);
  };

  const handleClosePost = () => {
    setSelectedPost(null);
    router.push('/dashboard/applications/global/stories', { scroll: false });
  };

  return (
    <div className="min-h-screen bg-white md:bg-[#FAFAFA] font-inter">
      {selectedPost && <PostDetailModal post={selectedPost} currentUser={currentUser} onClose={handleClosePost} />}
      
      {currentUser && (
        <CreateReviewModal 
          isOpen={isAdvancedModalOpen} 
          onClose={() => setIsAdvancedModalOpen(false)} 
          currentUser={currentUser} 
          onPostCreate={handlePostCreate} 
        />
      )}

      <div className="max-w-7xl mx-auto md:px-4 lg:px-8 pt-0 md:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COLUNA ESQUERDA (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3">
             {currentUser && <ProfileSideCard user={currentUser} />}
             <div className="mt-4 text-xs text-gray-400 px-2">
                © 2024 Facillit Stories • Privacidade • Termos
             </div>
          </aside>

          {/* COLUNA CENTRAL (Feed Infinito) */}
          <main className="lg:col-span-6 bg-white min-h-screen border-x border-gray-100 pb-20">
             
             {/* Header Mobile */}
             <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between lg:hidden">
                <div className="w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center text-white"><i className="fas fa-feather-alt"></i></div>
                <h1 className="font-bold text-lg">Início</h1>
                <div className="w-8"></div>
             </div>

             {/* Stories Bar */}
             <div className="px-4 pt-4 pb-2 border-b border-gray-50">
                <StoriesBar currentUser={currentUser} />
             </div>

             {/* Widget de Criação Rápida */}
             {currentUser && (
               <CreatePostWidget 
                  currentUser={currentUser} 
                  onPostCreate={handlePostCreate} 
                  onOpenAdvancedModal={() => setIsAdvancedModalOpen(true)}
               />
             )}

             {/* Abas (Agora integradas ao feed) */}
             <div className="sticky top-[0px] md:top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100">
                <CategoryTabs activeCategory={activeCategory} onSelect={setActiveCategory} />
             </div>

             {/* Feed */}
             <div className="animate-fade-in">
                {activeCategory === 'books' || activeCategory === 'all' ? (
                   <BookFeed 
                      key={feedKey} 
                      userId={currentUser?.id} 
                      onPostClick={handleOpenPost} 
                   />
                ) : (
                   <div className="p-10 text-center text-gray-400">Em breve...</div>
                )}
             </div>
          </main>

          {/* COLUNA DIREITA (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3">
             <div className="sticky top-24">
                <div className="bg-gray-50 rounded-full px-4 py-3 mb-6 flex items-center gap-2 border border-gray-100 focus-within:bg-white focus-within:border-brand-purple transition-all">
                   <i className="fas fa-search text-gray-400"></i>
                   <input type="text" placeholder="Buscar no Facillit" className="bg-transparent outline-none text-sm w-full" />
                </div>
                <TrendingTerms category={activeCategory} />
             </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

export default function StoriesPage() {
  return (
    <ToastProvider>
      <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><div className="animate-pulse w-10 h-10 bg-brand-purple rounded-full"></div></div>}>
        <StoriesContent />
      </Suspense>
    </ToastProvider>
  );
}