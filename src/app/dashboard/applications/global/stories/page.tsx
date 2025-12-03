"use client";

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

// Componentes
import StoriesBar from './components/StoriesBar';
import CategoryTabs from './components/CategoryTabs';
import CreateReviewModal from './components/CreateReviewModal';
import PostDetailModal from './components/PostDetailModal';
import TrendingTerms from './components/TrendingTerms';

// Feeds
import BookFeed from './components/feeds/BookFeed';

// Types & Actions
import { UserProfile, StoryCategory, StoryPost } from './types';
import { createStoryPost, getPostById } from './actions';
import createClient from '@/utils/supabase/client';

// Placeholder para áreas em desenvolvimento
const FeedUnderConstruction = ({ category }: { category: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[2rem] border border-dashed border-gray-200 mt-4">
    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-3xl text-gray-300">
      {category === 'games' ? '🎮' : category === 'movies' ? '🎬' : '🚧'}
    </div>
    <h3 className="font-bold text-gray-900 text-lg mb-2">Feed de {category} em Breve</h3>
    <p className="text-sm text-gray-500">Estamos preparando algo incrível.</p>
  </div>
);

const ProfileSideCard = ({ user, onOpenCreate }: { user: UserProfile, onOpenCreate: () => void }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
    <div className="flex flex-col items-center text-center">
      <div className="p-[2px] rounded-full bg-gradient-to-tr from-brand-purple to-brand-green mb-3">
        <div className="w-20 h-20 rounded-full border-4 border-white relative overflow-hidden bg-gray-100">
           {user.avatar_url ? (
             <Image src={user.avatar_url} alt={user.name} fill className="object-cover" />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-300"><i className="fas fa-user text-3xl"></i></div>
           )}
        </div>
      </div>
      <h2 className="font-bold text-gray-900 text-lg leading-tight">{user.name}</h2>
      <p className="text-gray-500 text-sm mb-6 font-medium">{user.username}</p>
      <button onClick={onOpenCreate} className="w-full py-3 bg-brand-purple hover:bg-[#320261] text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-purple/20 flex items-center justify-center gap-2 group">
        <i className="fas fa-plus-circle group-hover:scale-110 transition-transform"></i> Nova Publicação
      </button>
    </div>
  </div>
);

function StoriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postIdFromUrl = searchParams.get('p');

  const [activeCategory, setActiveCategory] = useState<StoryCategory>('books');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedPost, setSelectedPost] = useState<StoryPost | null>(null);
  const [feedKey, setFeedKey] = useState(0); 

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

  useEffect(() => {
    const loadDeepLinkedPost = async () => {
      if (postIdFromUrl) {
        const post = await getPostById(postIdFromUrl);
        if (post) setSelectedPost(post);
      }
    };
    loadDeepLinkedPost();
  }, [postIdFromUrl]);

  const handleOpenPostModal = (post: StoryPost) => {
    setSelectedPost(post);
    // Opcional: Atualizar URL para deep link
    // window.history.pushState(null, '', `?p=${post.id}`);
  };

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
        alert("Erro ao publicar.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 font-inter">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="hidden lg:block lg:col-span-3">
             {currentUser && <ProfileSideCard user={currentUser} onOpenCreate={() => setIsCreateModalOpen(true)} />}
          </aside>

          <main className="lg:col-span-6 space-y-6">
             <div className="lg:hidden flex items-center justify-between mb-4">
                <h1 className="font-bold text-xl text-gray-900">Stories</h1>
                <button onClick={() => setIsCreateModalOpen(true)} className="w-9 h-9 bg-brand-purple text-white rounded-full flex items-center justify-center shadow-lg">
                   <i className="fas fa-plus"></i>
                </button>
             </div>

             <div className="mb-2"><StoriesBar currentUser={currentUser} /></div>

             <div className="sticky top-0 z-20 bg-[#FDFDFD]/95 backdrop-blur-md pt-2 pb-4">
                <CategoryTabs activeCategory={activeCategory} onSelect={setActiveCategory} />
             </div>

             <div className="min-h-[600px] animate-fade-in-up">
                {activeCategory === 'books' || activeCategory === 'all' ? (
                   <BookFeed 
                      key={feedKey} 
                      userId={currentUser?.id} 
                      onPostClick={handleOpenPostModal} 
                   />
                ) : (
                   <FeedUnderConstruction category={activeCategory} />
                )}
             </div>
          </main>

          <aside className="hidden lg:block lg:col-span-3">
             <div className="sticky top-24 space-y-6">
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
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><div className="w-10 h-10 border-4 border-brand-purple rounded-full animate-spin border-t-transparent"></div></div>}>
      <StoriesContent />
    </Suspense>
  );
}