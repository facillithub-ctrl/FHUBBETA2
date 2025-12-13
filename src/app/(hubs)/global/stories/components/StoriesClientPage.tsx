"use client";

import React, { useState } from 'react';
import { UserProfile, StoryCategory } from '../types';
import { createStoryPost } from '../actions';

// Componentes
import StoriesBar from './StoriesBar';
import CreatePostWidget from './CreatePostWidget';
import BookFeed from './feeds/BookFeed';
import StoriesSidebar from './StoriesSidebar';
import CreateReviewModal from './CreateReviewModal';
import { Home, Hash, Bell, Bookmark, User, Users, BookOpen, PenTool } from 'lucide-react';
import Link from 'next/link';

interface Props {
  currentUser: UserProfile;
}

export default function StoriesClientPage({ currentUser }: Props) {
  const [activeCategory, setActiveCategory] = useState<StoryCategory>('all');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-black font-inter flex justify-center">
      
      {/* --- COLUNA ESQUERDA (Nav Fixa) --- */}
      <header className="hidden lg:flex flex-col w-[275px] h-screen sticky top-0 px-4 py-6 border-r border-gray-100 justify-between items-end pr-6">
        <div className="w-full">
          {/* Logo */}
          <Link href="/" className="block mb-8 pl-2">
             <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20">
               F
             </div>
          </Link>

          <nav className="space-y-1 w-full">
            <NavItem href="/global/stories" icon={<Home size={26} />} label="Início" active />
            <NavItem href="/global/explore" icon={<Hash size={26} />} label="Explorar" />
            <NavItem href="/education/library" icon={<BookOpen size={26} />} label="Minha Estante" />
            <NavItem href="/global/communities" icon={<Users size={26} />} label="Comunidades" />
            <NavItem href="/global/notifications" icon={<Bell size={26} />} label="Notificações" />
            <NavItem href={`/u/${currentUser.username}`} icon={<User size={26} />} label="Perfil" />
          </nav>

          {/* Botão de Ação "Escrever" */}
          <button 
            onClick={() => setIsReviewModalOpen(true)}
            className="w-full mt-8 bg-brand-gradient text-white font-bold py-3.5 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-lg"
          >
            <PenTool size={20} />
            <span className="hidden xl:inline">Publicar</span>
          </button>
        </div>

        {/* Mini Perfil */}
        <div className="w-full mt-auto flex items-center gap-3 p-3 hover:bg-gray-100 rounded-full cursor-pointer transition-colors mb-2">
             <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-200 relative">
                {currentUser.avatar_url && <img src={currentUser.avatar_url} className="w-full h-full object-cover" alt="" />}
             </div>
             <div className="hidden xl:block flex-1 overflow-hidden">
                <p className="font-bold text-sm text-gray-900 truncate">{currentUser.name}</p>
                <p className="text-gray-500 text-xs truncate">@{currentUser.username}</p>
             </div>
        </div>
      </header>

      {/* --- COLUNA CENTRAL (Feed Infinito) --- */}
      <main className="w-full md:w-[600px] min-h-screen border-r border-gray-100 bg-white pb-20">
        
        {/* Header Sticky com Blur */}
        <div className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-gray-100">
           <StoriesBar 
              currentUser={currentUser} 
              activeCategory={activeCategory} 
              onSelectCategory={setActiveCategory}
              onToggleSidebar={() => {}}
           />
        </div>

        {/* Widget de Criação Rápida */}
        <CreatePostWidget 
            currentUser={currentUser}
            onPostCreate={createStoryPost}
            onOpenAdvancedModal={() => setIsReviewModalOpen(true)}
        />
        
        <div className="h-2 bg-[#f7f9f9] border-y border-gray-100"></div>

        {/* O Feed Real */}
        <BookFeed 
            category={activeCategory} 
            userId={currentUser.id}
        />
      </main>

      {/* --- COLUNA DIREITA (Widgets) --- */}
      <aside className="hidden lg:block w-[390px] sticky top-0 h-screen overflow-y-auto custom-scrollbar">
         <StoriesSidebar />
      </aside>

      {/* MODAL DE CRIAÇÃO (Overlay) */}
      {isReviewModalOpen && (
        <CreateReviewModal 
            isOpen={isReviewModalOpen} 
            onClose={() => setIsReviewModalOpen(false)}
            currentUser={currentUser}
            onPostCreate={createStoryPost}
        />
      )}

    </div>
  );
}

// NavItem Helper
function NavItem({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <Link href={href} className="group flex items-center gap-4 p-3 rounded-full cursor-pointer transition-colors hover:bg-gray-100">
            <div className={`${active ? 'text-brand-purple' : 'text-gray-900'} relative`}>
                {icon}
                {active && <div className="absolute -top-1 -right-1 w-2 h-2 bg-brand-purple rounded-full"></div>}
            </div>
            <span className={`hidden xl:block text-xl ${active ? 'font-bold text-gray-900' : 'font-normal text-gray-700'}`}>{label}</span>
        </Link>
    )
}