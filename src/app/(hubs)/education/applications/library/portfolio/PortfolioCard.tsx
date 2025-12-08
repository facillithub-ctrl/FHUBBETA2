// src/app/dashboard/applications/library/portfolio/PortfolioCard.tsx
'use client'

import { toggleVisibility } from './actions';
import { useState } from 'react';

export default function PortfolioCard({ item }: { item: any }) {
  const [visibility, setVisibility] = useState(item.visibility);

  const handleToggle = async () => {
    const newStatus = visibility === 'public' ? 'private' : 'public';
    setVisibility(newStatus); // Otimistic update
    await toggleVisibility(item.id, visibility);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      {/* Preview Area */}
      <div className={`h-40 ${item.repository_item.origin_module === 'write' ? 'bg-blue-50' : 'bg-purple-50'} flex items-center justify-center relative group`}>
        <i className={`fas ${item.repository_item.origin_module === 'write' ? 'fa-pen-fancy' : 'fa-project-diagram'} text-4xl text-black/10`}></i>
        
        <div className="absolute top-3 right-3">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${visibility === 'public' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {visibility === 'public' ? 'Público' : 'Privado'}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 mb-2 truncate">{item.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">{item.description || 'Sem descrição.'}</p>
        
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {item.tags?.map((tag: string) => (
            <span key={tag} className="text-[10px] px-2 py-1 bg-gray-50 text-gray-600 rounded border border-gray-100">
              #{tag}
            </span>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
          <div className="flex gap-3 text-gray-400 text-xs">
            <span className="flex items-center gap-1"><i className="fas fa-eye"></i> {item.views_count}</span>
            <span className="flex items-center gap-1"><i className="fas fa-heart"></i> {item.likes_count}</span>
          </div>
          
          <button 
            onClick={handleToggle}
            className="text-xs font-medium text-royal-blue hover:text-blue-700 transition-colors"
          >
            {visibility === 'public' ? 'Tornar Privado' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  );
}