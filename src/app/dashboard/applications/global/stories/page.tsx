"use client";

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

// --- COMPONENTES GLOBAIS ---
import StoriesBar from './components/StoriesBar';
import CategoryTabs from './components/CategoryTabs';
import CreateReviewModal from './components/CreateReviewModal';
import PostDetailModal from './components/PostDetailModal';
import TrendingTerms from './components/TrendingTerms';

// --- FEEDS ---
// Apenas o BookFeed é importado porque é o único que existe fisicamente por enquanto
import BookFeed from './components/feeds/BookFeed';

// --- TIPOS E ACTIONS ---
import { UserProfile, StoryCategory, StoryPost } from './types';
import { createStoryPost, getPostById } from './actions';
import createClient from '@/utils/supabase/client';

// --- COMPONENTE: EM DESENVOLVIMENTO (Placeholder) ---
const FeedUnderConstruction = ({ category }: { category: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[2rem] border border-dashed border-gray-200 mt-6">
    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-3xl text-gray-300">
      {category === 'games' ? '🎮' : category === 'movies' ? '🎬' : '🚧'}
    </div>
    <h3 className="font-bold text-gray-900 text-lg mb-2">Feed de {category} em Breve</h3>
    <p className="text-sm text-gray-500 max-w-xs mx-auto">
      Estamos preparando algo incrível para os fãs de {category === 'all' ? 'conteúdo geral' : category}. Fique ligado!
    </p>
  </div>
);

// --- SIDEBAR PERFIL ---
const ProfileSideCard = ({ user, onOpenCreate }: { user: UserProfile, onOpenCreate: () => void }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24 transition-all hover:shadow-md">
    <div className="flex flex-col items-center text-center">
      <div className="p-[3px] rounded-full bg-gradient-to-tr from-brand-purple via-purple-400 to-brand-green mb-3 shadow-sm">
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
      <p className="text-gray-500 text-sm mb-6 font-medium tracking-wide">{user.username}</p>
      
      <button 
        onClick={onOpenCreate}
        className="w-full py-3 bg-brand-purple hover:bg-[#320261] text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-purple/20 hover:shadow-brand-purple/40 flex items-center justify-center gap-2 group active:scale-95"
      >
        <i className="fas fa-plus-circle group-hover:scale-110 transition-transform"></i> 
        Nova Publicação
      </button>
    </div>
  </div>
);

function StoriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postIdFromUrl = searchParams.get('p');

  // --- ESTADOS ---
  const [activeCategory, setActiveCategory] = useState<StoryCategory>('books'); 
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedPost, setSelectedPost] = useState<StoryPost | null>(null);
  const [feedKey, setFeedKey] = useState(0); 

  // Carregar Usuário
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

  // Deep Link
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

  const handleClosePostModal = () => {
    setSelectedPost(null);
    router.push('/dashboard/applications/global/stories', { scroll: false });
  };

  const handlePostCreate = async (postData: Partial<StoryPost>) => {
    if (!currentUser) return;
    try {
        await createStoryPost(postData);
        setFeedKey(prev => prev + 1);
        setIsCreateModalOpen(false);
    } catch (e) {
        alert("Erro ao publicar. Tente novamente.");
    }
  };

  // --- RENDERIZAÇÃO DO FEED ---
  const renderFeed = () => {
    const commonProps = { userId: currentUser?.id };
    
    // Se a categoria for Books, renderiza o feed real.
    // Para qualquer outra, mostra o placeholder "Em Breve".
    if (activeCategory === 'books') {
        return <BookFeed key={feedKey} {...commonProps} />;
    }
    
    return <FeedUnderConstruction category={activeCategory} />;
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 font-inter">
      {/* Modais */}
      {selectedPost && <PostDetailModal post={selectedPost} currentUser={currentUser} onClose={handleClosePostModal} />}
      {currentUser && (
        <CreateReviewModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
          currentUser={currentUser} 
          onPostCreate={handlePostCreate} 
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ESQUERDA */}
          <aside className="hidden lg:block lg:col-span-3">
             {currentUser ? (
                <ProfileSideCard user={currentUser} onOpenCreate={() => setIsCreateModalOpen(true)} />
             ) : (
                <div className="h-64 bg-gray-50 rounded-2xl animate-pulse border border-gray-100"></div>
             )}
          </aside>

          {/* CENTRO */}
          <main className="lg:col-span-6 space-y-6">
             
             {/* Header Mobile */}
             <div className="lg:hidden flex items-center justify-between mb-4 sticky top-0 z-30 bg-[#FDFDFD]/95 backdrop-blur-sm py-3 px-2 border-b border-gray-50 -mx-2">
                <h1 className="font-bold text-xl text-gray-900">Stories</h1>
                <button onClick={() => setIsCreateModalOpen(true)} className="w-9 h-9 bg-brand-purple text-white rounded-full shadow-lg flex items-center justify-center">
                   <i className="fas fa-plus"></i>
                </button>
             </div>

             <div className="mb-2"><StoriesBar currentUser={currentUser} /></div>

             <div className="sticky top-0 lg:top-0 z-20 bg-[#FDFDFD]/95 backdrop-blur-md pt-2 pb-4">
                <CategoryTabs activeCategory={activeCategory} onSelect={setActiveCategory} />
             </div>

             <div className="min-h-[600px] animate-fade-in-up">
                {renderFeed()}
             </div>
          </main>

          {/* DIREITA */}
          <aside className="hidden lg:block lg:col-span-3">
             <div className="sticky top-24 space-y-6">
                {/* Search Bar */}
                <div className="relative group">
                   <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple transition-colors"></i>
                   <input 
                      type="text" 
                      placeholder="Buscar no Stories..." 
                      className="w-full bg-white border border-gray-200 rounded-full pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all shadow-sm"
                   />
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
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><div className="animate-spin text-brand-purple text-2xl"><i className="fas fa-circle-notch"></i></div></div>}>
      <StoriesContent />
    </Suspense>
  );
}