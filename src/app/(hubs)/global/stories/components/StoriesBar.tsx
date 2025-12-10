"use client";

import React from 'react';
import Image from 'next/image';
import { UserProfile, StoryCategory } from '../types';
import { Plus } from 'lucide-react';

interface Props {
  currentUser: UserProfile;
  activeCategory: StoryCategory;
  onSelectCategory: (cat: StoryCategory) => void;
  onToggleSidebar: () => void;
}

const CATEGORIES = [
    { id: 'all', label: 'Para você' },
    { id: 'books', label: 'Livros' },
    { id: 'reviews', label: 'Resenhas' },
    { id: 'community', label: 'Comunidade' },
];

export default function StoriesBar({ currentUser, activeCategory, onSelectCategory, onToggleSidebar }: Props) {
  return (
    <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800">
      
      {/* 1. Header Mobile (Só aparece < lg) */}
      <div className="lg:hidden px-4 py-3 flex items-center justify-between border-b border-gray-50">
         <div onClick={onToggleSidebar} className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
            {currentUser.avatar_url && <Image src={currentUser.avatar_url} width={32} height={32} alt="Eu" />}
         </div>
         <span className="font-bold text-lg">Início</span>
         <div className="w-8" />
      </div>

      {/* 2. Categorias (Tabs Estilo X) */}
      <div className="flex w-full overflow-x-auto scrollbar-hide">
         {CATEGORIES.map(cat => (
             <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id as any)}
                className="flex-1 min-w-[80px] py-4 text-[15px] font-medium text-gray-500 hover:bg-gray-50 transition-colors relative text-center"
             >
                <span className={activeCategory === cat.id ? 'font-bold text-black' : ''}>
                    {cat.label}
                </span>
                {activeCategory === cat.id && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-brand-purple rounded-full" />
                )}
             </button>
         ))}
      </div>
    </div>
  );
}