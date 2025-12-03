"use client";

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ToastProvider } from '@/contexts/ToastContext';

// Componentes
import StoriesBar from './components/StoriesBar';
import CategoryTabs from './components/CategoryTabs';
import CreateReviewModal from './components/CreateReviewModal';
import CreatePostWidget from './components/CreatePostWidget';
import PostDetailModal from './components/PostDetailModal';
import TrendingTerms from './components/TrendingTerms'; // Importado para Sidebar

// Feeds
import BookFeed from './components/feeds/BookFeed';

// Logic
import { UserProfile, StoryCategory, StoryPost } from './types';
import { createStoryPost, getPostById } from './actions';
import createClient from '@/utils/supabase/client';

// --- ELEMENTOS ESTRUTURAIS (HOISTED) ---

// Placeholder (Fixo o erro de ReferenceError)
const FeedUnderConstruction = ({ category }: { category: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-2xl grayscale">🚧</div>
    <p className="text-gray-600 font-medium text-lg">O feed de {category} está sendo preparado.</p>
  </div>
);

// Item de Navegação Simples
const NavItem = ({ icon, label, active }: { icon: string, label: string, active?: boolean }) => (
    <div className={`flex items-center gap-4 px-4 py-3 rounded-full cursor-pointer transition-all ${active ? 'font-bold text-brand-purple bg-purple-50/50' : 'text-gray-700 hover:bg-gray-100'}`}>
        <i className={`${icon} text-lg w-6 text-center`}></i>
        <span className="text-base hidden xl:inline">{label}</span>
    </div>
);

// Sidebar Esquerda (Navegação)
const LeftSidebar = ({ user, onOpenCreate }: { user: UserProfile, onOpenCreate: () => void }) => (
  <div className="sticky top-0 h-screen overflow-y-auto w-full px-6 py-6 flex flex-col justify-between border-r border-gray-100/80">
     
     {/* Topo e Menu */}
     <div className="space-y-6">
        <Link href="/dashboard" className="text-xl font-black text-brand-purple hover:opacity-80 transition-opacity flex items-center gap-2">
           <i className="fas fa-feather-alt text-2xl"></i>
           <span className="hidden xl:inline">Facillit Stories</span>
        </Link>
        
        <nav className="space-y-1">
           <NavItem icon="fas fa-home" label="Início" active={true} />
           <NavItem icon="fas fa-hashtag" label="Explorar" />
           <NavItem icon="far fa-bell" label="Notificações" />
           <NavItem icon="far fa-bookmark" label="Salvos" />
           <NavItem icon="far fa-user" label="Perfil" />
        </nav>

        <button onClick={onOpenCreate} className="w-full py-3 bg-brand-purple text-white font-bold rounded-full shadow-md hover:bg-[#360366] transition-all text-base mt-6">
           Publicar
        </button>
     </div>

     {/* Rodapé: Perfil Mini */}
     <div className="py-4 border-t border-gray-100 mt-auto">
        <div className="flex items-center gap-3 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer w-max xl:w-full">
           <div className="w-8 h-8 rounded-full bg-gray-200 relative overflow-hidden">
               {user.avatar_url && <Image src={user.avatar_url} alt="Eu" fill className="object-cover" />}
           </div>
           <div className="hidden xl:block leading-tight">
              <p className="font-bold text-sm text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">@{user.username}</p>
           </div>
        </div>
     </div>
  </div>
);

// --- SIDEBAR DIREITA (Trends) ---
const RightSidebar = ({ category }: { category: string }) => (
  <div className="sticky top-0 h-screen overflow-y-auto pt-6 px-6 space-y-6">
      {/* Busca Clean */}
      <div className="relative group mb-6">
         <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
         <input 
           type="text" 
           placeholder="Buscar..." 
           className="w-full bg-gray-100 border-none rounded-full py-3 pl-12 pr-4 text-sm focus:bg-white focus:ring-1 focus:ring-brand-purple transition-all outline-none"
         />
      </div>

      {/* Trends Clean */}
      <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
         <h3 className="font-bold text-gray-900 text-lg mb-4">Em Alta</h3>
         <TrendingTerms category={category} />
      </div>
      
      <div className="text-[11px] text-gray-400 px-2 leading-relaxed">
         © 2024 Facillit Hub • Termos • Privacidade
      </div>
  </div>
);


function StoriesContent() {
  // ... Lógica de estado e handlers ...
  const router = useRouter();
  const searchParams = useSearchParams();
  const postIdFromUrl = searchParams.get('p');

  const [activeCategory, setActiveCategory] = useState<StoryCategory>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedPost, setSelectedPost] = useState<StoryPost | null>(null);
  const [feedKey, setFeedKey] = useState(0);

  // Carregamento de Usuário
  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setCurrentUser({
          id: user.id, name: profile?.full_name || 'Usuário', avatar_url: profile?.avatar_url,
          username: profile?.nickname || 'user', isVerified: profile?.is_verified,
          role: profile?.role || 'student', badge: profile?.badge || null
        });
      }
    };
    load();
  }, []);

  // Deep Link
  useEffect(() => {
    if (postIdFromUrl) {
       getPostById(postIdFromUrl).then(p => { if (p) setSelectedPost(p); });
    } else {
       setSelectedPost(null);
    }
  }, [postIdFromUrl]);

  const handlePostCreate = async (postData: Partial<StoryPost>) => {
    if (!currentUser) return;
    try {
        await createStoryPost(postData);
        setFeedKey(p => p + 1);
        setIsModalOpen(false);
    } catch {
        alert("Erro ao publicar.");
    }
  };

  const handleOpenPost = (post: StoryPost) => {
    setSelectedPost(post);
    router.push(`?p=${post.id}`, { scroll: false });
  };

  const handleClosePost = () => {
    setSelectedPost(null);
    router.push('/dashboard/applications/global/stories', { scroll: false });
  };

  return (
    <div className="min-h-screen bg-white font-inter flex justify-center">
      
      {/* Modais */}
      {selectedPost && <PostDetailModal post={selectedPost} currentUser={currentUser} onClose={handleClosePost} />}
      {currentUser && <CreateReviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} currentUser={currentUser} onPostCreate={handlePostCreate} />}

      {/* GRID PRINCIPAL: Layout com respiro maior (gap-8) */}
      <div className="w-full max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-[275px_1fr] xl:grid-cols-[275px_1fr_300px] gap-8">
          
          {/* 1. ESQUERDA (Navegação) */}
          <aside className="hidden lg:block">
             {currentUser && <LeftSidebar user={currentUser} onOpenCreate={() => setIsModalOpen(true)} />}
          </aside>

          {/* 2. CENTRO (Feed Principal) */}
          {/* Main com largura centralizada e bordas para criar o efeito "Timeline" */}
          <main className="w-full max-w-[650px] min-h-screen border-x border-gray-100/80 bg-white mx-auto">
             
             {/* Header Fixo */}
             <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-3 flex justify-between items-center">
                <h1 className="font-bold text-xl tracking-tight">Página Inicial</h1>
                {currentUser && <Link href={`/u/${currentUser.username}`} className="w-8 h-8 rounded-full bg-gray-100 relative overflow-hidden"><Image src={currentUser.avatar_url || ''} alt="Eu" fill className="object-cover" /></Link>}
             </div>

             {/* Stories Bar */}
             <div className="pt-4 pb-4 border-b border-gray-100 px-6">
                 <StoriesBar currentUser={currentUser} />
             </div>

             {/* WIDGET DE CRIAÇÃO */}
             {currentUser && (
                <div className="border-b border-gray-100">
                    <CreatePostWidget currentUser={currentUser} onPostCreate={handlePostCreate} onOpenAdvancedModal={() => setIsModalOpen(true)} />
                </div>
             )}

             {/* Abas de Filtro */}
             <div className="sticky top-[58px] z-30 bg-white/95 backdrop-blur border-b border-gray-100">
                <div className="py-2 px-6">
                   <CategoryTabs activeCategory={activeCategory} onSelect={setActiveCategory} />
                </div>
             </div>

             {/* O Feed */}
             <div className="pb-32">
                {activeCategory === 'books' || activeCategory === 'all' ? (
                   <BookFeed key={feedKey} userId={currentUser?.id} onPostClick={handleOpenPost} />
                ) : (
                   <FeedUnderConstruction category={activeCategory} />
                )}
             </div>
          </main>

          {/* 3. DIREITA (Trends) */}
          <aside className="hidden xl:block">
             <RightSidebar category={activeCategory} />
          </aside>

      </div>
    </div>
  );
}

export default function StoriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center bg-white"><div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin"></div></div>}>
      <ToastProvider>
        <StoriesContent />
      </ToastProvider>
    </Suspense>
  );
}