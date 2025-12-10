"use client";

import React, { useState } from 'react';
import { UserProfile, StoryCategory } from '../types';
import { createStoryPost } from '../actions';

// Componentes
import StoriesBar from './StoriesBar'; // Topo com abas e stories
import CreatePostWidget from './CreatePostWidget'; // Widget estilo X/Twitter
import BookFeed from './feeds/BookFeed'; // Feed inteligente
import StoriesSidebar from './StoriesSidebar'; // Sidebar direita (Trending)
import CreateReviewModal from './CreateReviewModal'; // Modal avançado (Assumindo existência)
import { 
  Home, Hash, Bell, Bookmark, User, Users, BookOpen
} from 'lucide-react';
import Link from 'next/link';

interface Props {
  currentUser: UserProfile;
}

export default function StoriesClientPage({ currentUser }: Props) {
  const [activeCategory, setActiveCategory] = useState<StoryCategory>('all');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Wrapper para criar post simples (Status)
  const handleSimplePost = async (formData: FormData) => {
    await createStoryPost(formData);
    // O Feed se atualiza automaticamente via server actions revalidatePath, 
    // mas em uma implementação real full, usaríamos um refresh hook aqui.
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-black text-slate-900 dark:text-white font-inter flex justify-center">
      
      {/* --- COLUNA ESQUERDA (Navegação Fixa) --- */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[275px] bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block transition-transform duration-200 ease-in-out`}>
        <div className="h-full flex flex-col p-4">
          {/* Logo */}
          <div className="mb-6 px-3">
             <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20">
               F
             </div>
          </div>

          <nav className="space-y-1 flex-1">
            <NavItem href="/global/stories" icon={<Home size={26} />} label="Início" active />
            <NavItem href="/global/explore" icon={<Hash size={26} />} label="Explorar" />
            <NavItem href="/education/library" icon={<BookOpen size={26} />} label="Minha Estante" />
            <NavItem href="/global/communities" icon={<Users size={26} />} label="Comunidades" />
            <NavItem href="/global/notifications" icon={<Bell size={26} />} label="Notificações" />
            <NavItem href={`/u/${currentUser.username}`} icon={<User size={26} />} label="Perfil" />
          </nav>

          {/* Botão de Ação */}
          <button 
            onClick={() => setIsReviewModalOpen(true)}
            className="w-full mt-4 bg-brand-gradient text-white font-bold py-3.5 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <span className="text-lg">Escrever Resenha</span>
          </button>

          {/* Mini Perfil */}
          <div className="mt-6 flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-pointer transition-colors">
             <div className="w-10 h-10 rounded-full bg-gray-300 relative overflow-hidden">
                {/* Avatar Image Here */}
             </div>
             <div className="flex-1 overflow-hidden">
                <p className="font-bold text-sm truncate">{currentUser.name}</p>
                <p className="text-gray-500 text-xs truncate">@{currentUser.username}</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Overlay Mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* --- COLUNA CENTRAL (Feed) --- */}
      <main className="w-full md:w-[600px] lg:w-[640px] min-h-screen border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
        
        {/* Header & Stories (Sticky) */}
        <div className="sticky top-0 z-20 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
           <StoriesBar 
              currentUser={currentUser} 
              activeCategory={activeCategory} 
              onSelectCategory={setActiveCategory}
              onToggleSidebar={() => setMobileMenuOpen(true)}
           />
        </div>

        {/* Criar Post Rápido */}
        <div className="border-b border-gray-100 dark:border-gray-800">
           <CreatePostWidget 
              currentUser={currentUser}
              onPostCreate={handleSimplePost}
              onOpenAdvancedModal={() => setIsReviewModalOpen(true)}
           />
        </div>

        {/* FEED REAL */}
        <div className="pb-20">
           <BookFeed 
              category={activeCategory} 
              userId={currentUser.id}
           />
        </div>
      </main>

      {/* --- COLUNA DIREITA (Widgets & Trending) --- */}
      <aside className="hidden lg:block w-[350px] sticky top-0 h-screen overflow-y-auto p-4 space-y-6">
         <StoriesSidebar />
      </aside>

      {/* MODAIS */}
      {/* Aqui você integraria o Modal de Review completo se tivesse o código dele */}
      {/* <CreateReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} /> */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white p-8 rounded-2xl max-w-lg w-full">
                <h2 className="text-2xl font-bold mb-4">Criar Resenha Literária</h2>
                <p className="text-gray-500 mb-6">Funcionalidade completa de editor de review virá aqui.</p>
                <button onClick={() => setIsReviewModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Fechar</button>
            </div>
        </div>
      )}

    </div>
  );
}

// Componente Helper de Navegação
function NavItem({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <Link href={href} className={`flex items-center gap-4 p-3 rounded-full cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-800 group w-fit xl:w-full ${active ? 'font-bold' : 'font-medium'}`}>
            <div className={`${active ? 'text-brand-purple' : 'text-slate-900 dark:text-slate-200'} group-hover:text-brand-purple transition-colors`}>
                {icon}
            </div>
            <span className={`text-xl ${active ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-400'}`}>{label}</span>
        </Link>
    )
}