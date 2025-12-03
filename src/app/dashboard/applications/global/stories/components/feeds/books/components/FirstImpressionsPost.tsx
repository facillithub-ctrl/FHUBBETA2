import React from 'react';
import Image from 'next/image';
import { StoryPost } from '../../../../types';
import { Hourglass } from 'lucide-react';

export default function FirstImpressionsPost({ post }: { post: StoryPost }) {
  const { title, content, coverImage, metadata } = post;
  const progress = metadata?.progress || 0;
  const mood = metadata?.mood || 'Neutro';

  const moodMap: Record<string, { color: string; icon: string }> = {
    'Empolgado': { color: 'bg-green-100 text-green-700', icon: '🤩' },
    'Confuso': { color: 'bg-orange-100 text-orange-700', icon: '🤔' },
    'Triste': { color: 'bg-blue-100 text-blue-700', icon: '😢' },
    'Chocado': { color: 'bg-purple-100 text-purple-700', icon: '😱' },
    'Neutro': { color: 'bg-gray-100 text-gray-700', icon: '😐' }
  };

  const currentMood = moodMap[mood] || moodMap['Neutro'];

  return (
    <div className="mt-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
       
       <div className="p-4 flex gap-4">
          {coverImage && (
             <div className="relative w-16 h-24 rounded overflow-hidden flex-shrink-0 border border-slate-100">
                <Image src={coverImage} alt={title || "Capa"} fill className="object-cover" />
             </div>
          )}
          
          <div className="flex-1 min-w-0">
             <div className="flex justify-between items-start">
                <div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primeiras Impressões</span>
                   <h3 className="font-bold text-slate-900 truncate">{title}</h3>
                </div>
                <div className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${currentMood.color}`}>
                   <span>{currentMood.icon}</span>
                   <span>{mood}</span>
                </div>
             </div>

             {/* Barra de Progresso */}
             <div className="mt-3">
                <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                   <span className="flex items-center gap-1"><Hourglass size={10} /> Lendo...</span>
                   <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                   <div 
                     className="bg-brand-gradient h-full rounded-full transition-all duration-500"
                     style={{ width: `${progress}%` }}
                   ></div>
                </div>
             </div>
          </div>
       </div>

       {/* Conteúdo do Texto */}
       <div className="px-4 pb-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 relative">
             <div className="absolute -top-1.5 left-6 w-3 h-3 bg-slate-50 border-t border-l border-slate-100 transform rotate-45"></div>
             {/* CORREÇÃO: Aspas escapadas para evitar erro de build */}
             <p className="text-sm text-slate-700 italic">&quot;{content}&quot;</p>
          </div>
       </div>
    </div>
  );
}