// CAMINHO: src/app/dashboard/applications/global/stories/components/TrendingTerms.tsx
"use client";

import { StoryCategory } from "../types";

export default function TrendingTerms({ category }: { category: StoryCategory }) {
  // Mock de termos por categoria
  const getTerms = () => {
    switch(category) {
        case 'books': return ['#BookTok', '#RomanceDeEpoca', '#StephenKing', 'Bienal do Livro', '#Fantasia'];
        case 'movies': return ['#Oscar2025', '#Duna2', 'Christopher Nolan', '#Marvel', 'Cinema Nacional'];
        case 'sports': return ['#Libertadores', 'Flamengo', 'Champions League', '#NBAFinals', 'Futebol Feminino'];
        case 'games': return ['#GTA6', 'Elden Ring', 'PlayStation 5', '#IndieGames', 'Nintendo Switch'];
        default: return ['#Viral', '#CulturaPop', 'Lançamentos', '#Review', '#Brasil'];
    }
  };

  return (
    <div className="px-4 py-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <i className="fas fa-fire text-red-500"></i>
        <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Em Alta em {category === 'all' ? 'Geral' : category}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {getTerms().map((term, i) => (
          <span 
            key={i} 
            className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-brand-purple rounded-xl text-sm font-medium cursor-pointer transition-colors border border-gray-100"
          >
            {term}
          </span>
        ))}
      </div>
    </div>
  );
}