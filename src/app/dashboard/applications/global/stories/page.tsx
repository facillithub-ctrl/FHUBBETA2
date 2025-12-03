"use client";

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ToastProvider } from '@/contexts/ToastContext';

// Componentes
import StoriesBar from './components/StoriesBar';
import CreateReviewModal from './components/CreateReviewModal';
import CreatePostWidget from './components/CreatePostWidget';
import PostDetailModal from './components/PostDetailModal';
import BookFeed from './components/feeds/BookFeed';

// Lógica
import { UserProfile, StoryCategory, StoryPost } from './types';
import { createStoryPost, getPostById } from './actions';
import createClient from '@/utils/supabase/client';

// --- SIDEBAR DE NAVEGAÇÃO ---
const NavigationSidebar = ({ user, onClose }: { user: UserProfile, onClose?: () => void }) => {
  const navItems = [
    { icon: 'fas fa-home', label: 'Página Inicial', href: '/dashboard/applications/global/stories', active: true },
    { icon: 'fas fa-users', label: 'Comunidade', href: '/dashboard/community' },
    { icon: 'fas fa-fire-alt', label: 'Em Alta', href: '/dashboard/trending' },
    { icon: 'far fa-bookmark', label: 'Salvos', href: '/dashboard/saved' },
    { icon: 'far fa-envelope', label: 'Mensagens', href: '/dashboard/messages' },
    { icon: 'fas fa-search', label: 'Buscar', href: '/dashboard/search' },
    { icon: 'far fa-bell', label: 'Notificações', href: '/dashboard/notifications' },
    { icon: 'fas fa-shield-alt', label: 'Clubes', href: '/dashboard/clubs' },
  ];

  return (
    <div className="h-full flex flex-col justify-between py-6 px-4 bg-white border-r border-gray-100 overflow-y-auto">
       <div className="space-y-6">
          {/* Logo e Fechar (Mobile) */}
          <div className="flex justify-between items-center pl-2">
             <Link href="/dashboard" className="text-2xl font-black text-brand-purple hover:opacity-80 transition-opacity flex items-center gap-2">
                <i className="fas fa-feather-alt"></i>
                <span className="inline">Facillit Stories</span>
             </Link>
             {onClose && (
                <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-brand-purple">
                   <i className="fas fa-times text-xl"></i>
                </button>
             )}
          </div>
          
          {/* Menu */}
          <nav className="space-y-1">
             {navItems.map((item) => (
               <Link 
                 key={item.label} 
                 href={item.href} 
                 onClick={onClose}
                 className={`flex items-center gap-4 px-4 py-3 rounded-full transition-all cursor-pointer group ${item.active ? 'font-bold text-brand-purple bg-purple-50' : 'text-gray-700 hover:bg-gray-100'}`}
               >
                  <i className={`${item.icon} text-xl w-6 text-center`}></i>
                  <span className="text-lg inline">{item.label}</span>
               </Link>
             ))}
          </nav>

          {/* Botão Publicar */}
          <button className="w-full py-3 bg-brand-gradient text-white font-bold rounded-full shadow-md hover:opacity-90 transition-all text-lg mt-4 flex items-center justify-center gap-2">
             <i className="fas fa-pen"></i>
             <span>Publicar</span>
          </button>
       </div>

       {/* Perfil Mini */}
       <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
             <div className="w-10 h-10 rounded-full bg-gray-200 relative overflow-hidden border border-gray-100">
                 {user.avatar_url && <Image src={user.avatar_url} alt="Eu" fill className="object-cover" />}
             </div>
             <div className="block leading-tight">
                <p className="font-bold text-sm text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">@{user.username}</p>
             </div>
             <i className="fas fa-ellipsis-h ml-auto text-gray-400"></i>
          </div>
       </div>
    </div>
  );
};

function StoriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postIdFromUrl = searchParams.get('p');

  const [activeCategory, setActiveCategory] = useState<StoryCategory>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedPost, setSelectedPost] = useState<StoryPost | null>(null);
  const [feedKey, setFeedKey] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleClosePost = () => {
    setSelectedPost(null);
    router.push('/dashboard/applications/global/stories', { scroll: false });
  };

  return (
    // min-h-screen para garantir altura, mas sem travar o scroll do body
    <div className="bg-white font-inter min-h-screen">
      
      {/* Modais */}
      {selectedPost && <PostDetailModal post={selectedPost} currentUser={currentUser} onClose={handleClosePost} />}
      {currentUser && <CreateReviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} currentUser={currentUser} onPostCreate={handlePostCreate} />}

      {/* --- MENU MOBILE (OVERLAY) --- */}
      {isMobileMenuOpen && currentUser && (
        <div className="fixed inset-0 z-[60] lg:hidden">
           <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
           <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-[300px] bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-300">
              <NavigationSidebar user={currentUser} onClose={() => setIsMobileMenuOpen(false)} />
           </div>
        </div>
      )}

      {/* GRID PRINCIPAL */}
      <div className="flex w-full max-w-[1600px] mx-auto items-start">
          
          {/* 1. SIDEBAR ESQUERDA (FIXA) */}
          {/* z-10 para ficar acima do feed se houver algo, mas abaixo de modais e sidebar global (normalmente z-40/50) */}
          <aside className="hidden lg:block w-[275px] flex-shrink-0 sticky top-0 h-screen z-10">
             {currentUser && <NavigationSidebar user={currentUser} />}
          </aside>

          {/* 2. ÁREA DO FEED (FLUIDA) */}
          {/* min-w-0 evita overflow horizontal em flexbox */}
          <main className="flex-1 w-full min-w-0 border-r border-gray-100/50 relative">
             
             {/* HEADER COMPLETO (SÓLIDO) */}
             {/* Sem z-index alto para não cobrir a sidebar global */}
             <div className="bg-white border-b border-gray-100">
                 <StoriesBar 
                    currentUser={currentUser} 
                    activeCategory={activeCategory} 
                    onSelectCategory={setActiveCategory} 
                    onToggleSidebar={() => setIsMobileMenuOpen(true)}
                 />
             </div>

             {/* CORPO DO FEED */}
             <div className="w-full">
                
                {/* Widget de Postar */}
                {currentUser && (
                   <div className="border-b border-gray-100 bg-white">
                       <CreatePostWidget 
                          currentUser={currentUser} 
                          onPostCreate={handlePostCreate} 
                          onOpenAdvancedModal={() => setIsModalOpen(true)} 
                       />
                   </div>
                )}

                {/* Lista Infinita */}
                <div className="pb-32">
                   {activeCategory === 'books' || activeCategory === 'all' ? (
                      <BookFeed 
                        key={feedKey} 
                        userId={currentUser?.id} 
                        onPostClick={(p) => {
                          setSelectedPost(p);
                          router.push(`?p=${p.id}`, { scroll: false });
                        }} 
                      />
                   ) : (
                      <div className="p-10 text-center text-gray-500">
                         <div className="mb-4 text-4xl">🚧</div>
                         Feed de {activeCategory} em breve.
                      </div>
                   )}
                </div>
             </div>
          </main>
      </div>
      
      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
         <Link href="/dashboard" className="text-brand-purple"><i className="fas fa-home text-xl"></i></Link>
         <Link href="/dashboard/search" className="text-gray-500"><i className="fas fa-search text-xl"></i></Link>
         <Link href="/dashboard/notifications" className="text-gray-500"><i className="far fa-bell text-xl"></i></Link>
         <Link href="/dashboard/messages" className="text-gray-500"><i className="far fa-envelope text-xl"></i></Link>
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