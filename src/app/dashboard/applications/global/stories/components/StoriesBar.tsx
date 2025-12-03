"use client";

import React from 'react';
import Image from 'next/image';
import { UserProfile, StoryCategory } from '../types';
import CategoryTabs from './CategoryTabs';

const MOCK_STORIES = [
    { id: '1', name: 'Facillit', hasUnseen: true, img: '/assets/images/time/igor.jpg' },
    { id: '2', name: 'Pedro', hasUnseen: false, img: '/assets/images/time/pedro.JPG' },
    { id: '3', name: 'Escola', hasUnseen: true, img: null },
    { id: '4', name: 'Clube', hasUnseen: true, img: null },
    { id: '5', name: 'Evento', hasUnseen: false, img: null },
];

interface StoriesBarProps {
  currentUser: UserProfile | null;
  activeCategory: StoryCategory;
  onSelectCategory: (cat: StoryCategory) => void;
  onToggleSidebar: () => void;
}

export default function StoriesBar({ currentUser, activeCategory, onSelectCategory, onToggleSidebar }: StoriesBarProps) {
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    // Sem Z-Index aqui para evitar sobreposição da Sidebar Global
    <div className="w-full bg-white relative">
      
      {/* 1. TÍTULO, HAMBÚRGUER E CABEÇALHO */}
      <div className="px-4 py-3 cursor-pointer border-b border-gray-50 flex items-center gap-3">
         {/* Botão Hambúrguer (Só Mobile) */}
         <button 
            onClick={(e) => { e.stopPropagation(); onToggleSidebar(); }}
            className="lg:hidden p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
         >
            <i className="fas fa-bars text-xl"></i>
         </button>

         <div onClick={scrollToTop} className="flex-1">
            <h1 className="font-bold text-xl text-gray-900">Página Inicial</h1>
         </div>

         {/* Ícone de perfil mobile (Opcional) */}
         <div className="lg:hidden w-8 h-8 rounded-full bg-gray-200 relative overflow-hidden border border-gray-100">
            {currentUser?.avatar_url && <Image src={currentUser.avatar_url} alt="Eu" fill className="object-cover" />}
         </div>
      </div>

      {/* 2. ÁREA DE STORIES */}
      <div className="px-4 py-3 w-full">
        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
          
          {/* Meu Story */}
          <div className="flex flex-col items-center gap-1 min-w-[68px] cursor-pointer group">
             <div className="relative w-[60px] h-[60px] rounded-full p-[2px] border-2 border-dashed border-gray-300 group-hover:border-brand-purple transition-colors">
                <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden relative">
                   {currentUser?.avatar_url ? (
                      <Image src={currentUser.avatar_url} alt="Eu" fill className="object-cover" />
                   ) : (
                      <div className="flex items-center justify-center h-full w-full text-gray-400"><i className="fas fa-user"></i></div>
                   )}
                </div>
                {/* GRADIENTE */}
                <div className="absolute bottom-0 right-0 bg-brand-gradient text-white rounded-full w-5 h-5 flex items-center justify-center border-2 border-white text-[10px] shadow-sm">
                   <i className="fas fa-plus"></i>
                </div>
             </div>
             <span className="text-[11px] font-medium text-gray-600 truncate w-16 text-center">Seu Story</span>
          </div>

          {/* Outros Stories */}
          {MOCK_STORIES.map((story) => (
            <div key={story.id} className="flex flex-col items-center gap-1 min-w-[68px] cursor-pointer group">
              <div className={`relative w-[64px] h-[64px] rounded-full p-[2px] transition-transform duration-200 group-hover:scale-105 ${story.hasUnseen ? 'bg-brand-gradient' : 'bg-gray-200'}`}>
                 <div className="w-full h-full rounded-full border-2 border-white bg-white overflow-hidden relative">
                    {story.img ? (
                       <Image src={story.img} alt={story.name} fill className="object-cover" />
                    ) : (
                       <div className="flex items-center justify-center h-full w-full text-gray-300 bg-gray-100">
                          <i className="fas fa-user"></i>
                       </div>
                    )}
                 </div>
              </div>
              <span className="text-[11px] font-medium text-gray-600 truncate w-16 text-center">
                 {story.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. ABAS DE CATEGORIA */}
      <div className="px-4 pb-0 w-full overflow-x-auto scrollbar-hide">
         <CategoryTabs activeCategory={activeCategory} onSelect={onSelectCategory} />
      </div>
    </div>
  );
}