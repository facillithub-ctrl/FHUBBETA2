// CAMINHO: src/app/dashboard/applications/global/stories/components/CategoryTabs.tsx
"use client";

import { StoryCategory } from "../types";

// Removido book-club da lista de abas, pois agora é comunidade
const categories: { id: StoryCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'Explorar', icon: 'fas fa-compass' },
  { id: 'books', label: 'Livros', icon: 'fas fa-book' },
  { id: 'movies', label: 'Filmes', icon: 'fas fa-film' },
  { id: 'series', label: 'Séries', icon: 'fas fa-tv' },
  { id: 'anime', label: 'Animes', icon: 'fas fa-dragon' },
  { id: 'games', label: 'Games', icon: 'fas fa-gamepad' },
  { id: 'sports', label: 'Esportes', icon: 'fas fa-futbol' },
  { id: 'podcasts', label: 'Podcasts', icon: 'fas fa-microphone' },
];

export default function CategoryTabs({ 
  activeCategory, 
  onSelect 
}: { 
  activeCategory: StoryCategory; 
  onSelect: (cat: StoryCategory) => void; 
}) {
  const getStyles = (id: string, active: boolean) => {
    if (!active) return "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300";
    
    // Cores vibrantes quando ativo
    switch(id) {
      case 'books': return "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white border-transparent shadow-md shadow-purple-200";
      case 'movies': return "bg-gradient-to-r from-red-600 to-rose-600 text-white border-transparent shadow-md shadow-red-200";
      case 'series': return "bg-gradient-to-r from-pink-600 to-rose-500 text-white border-transparent shadow-md shadow-pink-200";
      case 'anime': return "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-md shadow-orange-200";
      case 'sports': return "bg-gradient-to-r from-green-600 to-emerald-600 text-white border-transparent shadow-md shadow-green-200";
      case 'games': return "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent shadow-md shadow-violet-200";
      case 'podcasts': return "bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-transparent shadow-md shadow-cyan-200";
      default: return "bg-slate-900 text-white border-slate-900 shadow-md";
    }
  };

  return (
    <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-1 pt-1">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`flex items-center gap-2 px-5 py-2 rounded-full border text-xs font-bold whitespace-nowrap transition-all duration-300 ${getStyles(cat.id, activeCategory === cat.id)}`}
        >
          <i className={cat.icon}></i>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}