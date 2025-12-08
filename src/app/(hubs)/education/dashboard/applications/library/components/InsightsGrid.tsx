'use client'

import { LibraryInsights } from '../actions';

export default function InsightsGrid({ insights }: { insights: LibraryInsights }) {
  const Stat = ({ icon, label, value, color }: any) => (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
      <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-xl`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Stat 
        icon="fa-book-open" 
        label="Livros Lidos" 
        value={insights.booksRead} 
        color="bg-blue-50 text-royal-blue" 
      />
      <Stat 
        icon="fa-fire" 
        label="Sequência (Dias)" 
        value={insights.streakDays} 
        color="bg-orange-50 text-orange-500" 
      />
      <Stat 
        icon="fa-clock" 
        label="Tempo Médio" 
        value="24m" // (Pode ser calculado no futuro)
        color="bg-green-50 text-green-600" 
      />
      <Stat 
        icon="fa-heart" 
        label="Favorito" 
        value={insights.favoriteCategory} 
        color="bg-pink-50 text-pink-500" 
      />
    </div>
  );
}