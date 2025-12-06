"use client";

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { joinOrUpdateBookClub } from '../actions';
// import { toast } from 'react-hot-toast'; // Opcional

export default function BookClubWidget({ club }: { club: any }) {
  const [isPending, startTransition] = useTransition();
  // Estado local para UI otimista
  const [progress, setProgress] = useState(club.userProgress || 0);

  if (!club) {
    return (
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white text-center">
        <p className="opacity-90">Nenhum clube ativo no momento.</p>
      </div>
    );
  }

  const handleUpdate = () => {
    // Simula avançar 1 capítulo (exemplo simples)
    const nextChapter = Math.ceil(((progress / 100) * club.total_chapters) + 1);
    if(nextChapter > club.total_chapters) return;

    const newPercent = Math.round((nextChapter / club.total_chapters) * 100);
    setProgress(newPercent);

    startTransition(async () => {
        await joinOrUpdateBookClub(club.id, nextChapter);
        // toast.success("Progresso atualizado!");
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-brand-purple to-indigo-600 p-4 flex gap-4 items-center">
        <div className="w-16 h-24 bg-gray-200 rounded-md shadow-lg flex-shrink-0 relative overflow-hidden">
             {club.cover_image ? (
                 <Image src={club.cover_image} alt={club.title} fill className="object-cover" />
             ) : (
                 <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Capa</div>
             )}
        </div>
        <div className="text-white">
          <span className="text-xs font-bold uppercase tracking-wider opacity-80">Clube do Mês</span>
          <h3 className="font-bold text-lg leading-tight">{club.title}</h3>
          <p className="text-sm opacity-90">{club.author}</p>
        </div>
      </div>

      {/* Corpo */}
      <div className="p-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1 font-bold">
            <span>Seu Progresso</span>
            <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
            <div 
                className="bg-brand-purple h-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
            ></div>
        </div>

        <div className="flex gap-2">
            <button 
                onClick={handleUpdate}
                disabled={isPending || progress >= 100}
                className="flex-1 bg-brand-purple text-white text-xs font-bold py-2 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
                {progress === 0 ? 'Iniciar Leitura' : progress >= 100 ? 'Concluído!' : 'Marcar Capítulo'}
            </button>
            <button className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                <i className="fas fa-comment-alt"></i>
            </button>
        </div>
      </div>
    </div>
  );
}