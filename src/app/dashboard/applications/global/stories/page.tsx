"use client";

import { useState, useEffect, Suspense, useRef } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

// Components
import StoriesBar from './components/StoriesBar';
import CreatePostWidget from './components/CreatePostWidget';
import CategoryTabs from './components/CategoryTabs';
import TrendingTerms from './components/TrendingTerms';
import CreateReviewModal from './components/CreateReviewModal';
import PostDetailModal from './components/PostDetailModal';

// Types & Actions
import { UserProfile, StoryCategory, StoryPost } from './types';
import { createStoryPost, getPostById } from './actions';
import createClient from '@/utils/supabase/client';

// Feeds
import GeneralFeed from './components/feeds/GeneralFeed';
import BookFeed from './components/feeds/BookFeed';
import MovieFeed from './components/feeds/MovieFeed';
import GamesFeed from './components/feeds/GamesFeed';

// --- SUB-COMPONENTE: CARD DE PERFIL LATERAL (MODERNO) ---
const ProfileSideCard = ({ user, onOpenCreate }: { user: UserProfile, onOpenCreate: () => void }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
    {/* Capa Decorativa */}
    <div className="h-24 bg-gradient-to-r from-violet-600 to-purple-500 relative">
        <div className="absolute inset-0 bg-[url('/assets/images/pattern.png')] opacity-10"></div>
    </div>
    
    <div className="px-5 pb-5 relative">
      {/* Avatar Sobreposto */}
      <div className="-mt-10 mb-3 flex justify-between items-end">
        <div className="w-[72px] h-[72px] rounded-full border-4 border-white shadow-md relative bg-gray-200">
           {user.avatar_url ? (
             <Image src={user.avatar_url} alt={user.name} fill className="object-cover rounded-full" />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-400"><i className="fas fa-user text-2xl"></i></div>
           )}
        </div>
        {user.isVerified && (
            <span className="mb-8 mr-1 text-blue-500 bg-white rounded-full p-1 shadow-sm" title="Verificado">
                <i className="fas fa-check-circle text-lg"></i>
            </span>
        )}
      </div>

      {/* Infos */}
      <h3 className="font-bold text-gray-900 text-lg leading-tight">{user.name}</h3>
      <p className="text-gray-500 text-sm mb-4">{user.username}</p>

      {/* Stats Grid */}
      <div className="flex justify-between border-t border-b border-gray-50 py-3 mb-4 text-center">
         <div>
            <span className="block font-bold text-gray-800 text-sm">{user.readCount || 12}</span>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Lidos</span>
         </div>
         <div className="border-l border-gray-100 mx-2"></div>
         <div>
            <span className="block font-bold text-gray-800 text-sm">{user.followers || 48}</span>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Seguidores</span>
         </div>
         <div className="border-l border-gray-100 mx-2"></div>
         <div>
            <span className="block font-bold text-gray-800 text-sm">{user.following || 15}</span>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Seguindo</span>
         </div>
      </div>

      {/* Botão Principal */}
      <button 
        onClick={onOpenCreate}
        className="w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2 group"
      >
        <i className="fas fa-plus bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-[10px] group-hover:scale-110 transition-transform"></i>
        Nova Publicação
      </button>
    </div>
  </div>
);

function StoriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postIdFromUrl = searchParams.get('p');

  // Estados
  const [activeCategory, setActiveCategory] = useState<StoryCategory>('all');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedPost, setSelectedPost] = useState<StoryPost | null>(null);
  
  // Controle de Feed
  const [feedKey, setFeedKey] = useState(0); 
  const isPostingRef = useRef(false);

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

  const closePostModal = () => {
    setSelectedPost(null);
    router.push('/dashboard/applications/global/stories', { scroll: false });
  };

  const handlePostCreate = async (postData: Partial<StoryPost> | string) => {
    if (!currentUser || isPostingRef.current) return;
    isPostingRef.current = true;
    
    try {
        if (typeof postData === 'string') {
            await createStoryPost({
                content: postData,
                category: activeCategory === 'all' ? 'all' : activeCategory,
                type: 'status'
            });
        } else {
            await createStoryPost(postData);
        }
        setFeedKey(prev => prev + 1);
        setIsReviewModalOpen(false);
    } catch (e) {
        console.error(e);
        alert("Erro ao publicar.");
    } finally {
        setTimeout(() => { isPostingRef.current = false; }, 500);
    }
  };

  const renderFeed = () => {
    const userId = currentUser?.id;
    const props = { userId };
    // Key separada do spread props
    const key = feedKey;

    switch (activeCategory) {
      case 'books': return <BookFeed key={key} {...props} />;
      case 'movies': case 'series': case 'anime': return <MovieFeed key={key} {...props} />;
      case 'games': return <GamesFeed key={key} {...props} />;
      default: return <GeneralFeed key={key} {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans pb-20">
      
      {/* MODAIS */}
      {selectedPost && (
        <PostDetailModal post={selectedPost} currentUser={currentUser} onClose={closePostModal} />
      )}

      {currentUser && (
        <CreateReviewModal 
          isOpen={isReviewModalOpen} 
          onClose={() => setIsReviewModalOpen(false)} 
          currentUser={currentUser} 
          onPostCreate={handlePostCreate} 
        />
      )}

      {/* CONTAINER GRID - 3 COLUNAS (MODERNO) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* 1. COLUNA ESQUERDA (PERFIL & NAV) - Visível apenas em telas grandes */}
          <aside className="hidden lg:block lg:col-span-3">
             <div className="sticky top-6">
                {currentUser ? (
                    <ProfileSideCard user={currentUser} onOpenCreate={() => setIsReviewModalOpen(true)} />
                ) : (
                    <div className="h-48 bg-white rounded-2xl animate-pulse mb-6"></div>
                )}
                
                {/* Menu Rápido Lateral */}
                <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
                    <ul className="space-y-1">
                        <li>
                            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-900 bg-gray-50 rounded-xl transition-colors">
                                <i className="fas fa-home text-purple-600"></i> Feed Principal
                            </button>
                        </li>
                        <li>
                            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors">
                                <i className="far fa-bookmark"></i> Itens Salvos
                            </button>
                        </li>
                        <li>
                            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors">
                                <i className="far fa-bell"></i> Notificações
                            </button>
                        </li>
                    </ul>
                </nav>

                <div className="mt-6 text-xs text-gray-400 px-4 leading-relaxed">
                   <p>© 2024 FacillitHub Stories.</p>
                   <p>Termos • Privacidade • Cookies</p>
                </div>
             </div>
          </aside>

          {/* 2. COLUNA CENTRAL (FEED) - Principal */}
          <main className="lg:col-span-6 min-h-screen space-y-6">
             
             {/* HEADER MOBILE (Só aparece em telas pequenas) */}
             <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative w-28 h-6">
                    <Image src="/assets/images/marcas/Stories.png" alt="Stories" fill className="object-contain object-left" />
                </div>
                <button 
                   onClick={() => setIsReviewModalOpen(true)}
                   className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center"
                >
                   <i className="fas fa-plus"></i>
                </button>
             </div>

             {/* STORY CIRCLES */}
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <StoriesBar currentUser={currentUser} />
             </div>

             {/* WIDGET DE CRIAÇÃO (Versão Compacta) */}
             {currentUser && activeCategory === 'all' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-3 items-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setIsReviewModalOpen(true)}>
                   <div className="w-10 h-10 rounded-full relative bg-gray-200 flex-shrink-0">
                      {currentUser.avatar_url && <Image src={currentUser.avatar_url} alt="Eu" fill className="object-cover rounded-full" />}
                   </div>
                   <div className="flex-1 bg-gray-100 h-10 rounded-full flex items-center px-4 text-gray-400 text-sm">
                      No que você está pensando, {currentUser.name.split(' ')[0]}?
                   </div>
                   <div className="text-purple-600 px-2">
                      <i className="fas fa-image text-xl"></i>
                   </div>
                </div>
             )}

             {/* ABAS STICKY (Prendem no topo ao rolar, mas abaixo do header do navegador) */}
             <div className="sticky top-2 z-30 bg-[#FAFAFA]/95 backdrop-blur-sm py-2 -mx-2 px-2 transition-all">
                <CategoryTabs activeCategory={activeCategory} onSelect={setActiveCategory} />
             </div>

             {/* FEED INFINITO */}
             <div className="space-y-6 min-h-[500px]">
                {renderFeed()}
             </div>
          </main>

          {/* 3. COLUNA DIREITA (TRENDING) */}
          <aside className="hidden lg:block lg:col-span-3">
             <div className="sticky top-6 space-y-6">
                
                {/* Search Bar Visual */}
                <div className="relative group">
                   <i className="fas fa-search absolute left-4 top-3.5 text-gray-400 group-focus-within:text-purple-500 transition-colors"></i>
                   <input 
                      type="text" 
                      placeholder="Buscar no Stories..." 
                      className="w-full bg-white border border-gray-200 rounded-full pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-purple-100 focus:border-purple-300 outline-none transition-all shadow-sm"
                   />
                </div>

                <TrendingTerms category={activeCategory} />

                {/* Card Promocional (Exemplo) */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/20 transition-all"></div>
                   <h4 className="font-bold text-lg mb-2 relative z-10">Clube do Livro</h4>
                   <p className="text-indigo-100 text-xs mb-4 relative z-10">Participe das discussões semanais e ganhe badges exclusivos.</p>
                   <button className="bg-white text-indigo-700 text-xs font-bold px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors relative z-10">
                      Entrar Agora
                   </button>
                </div>
             </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

export default function StoriesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-gray-50"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <StoriesContent />
    </Suspense>
  );
}  