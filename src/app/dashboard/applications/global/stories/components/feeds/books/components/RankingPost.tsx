import React from 'react';
import Image from 'next/image';
import { StoryPost, RankingItem } from '../../../../types';
import { Trophy, Medal } from 'lucide-react';

export default function RankingPost({ post }: { post: StoryPost }) {
  const { title, content, metadata } = post;
  const items: RankingItem[] = metadata?.rankingItems || [];

  return (
    <div className="mt-2">
      {/* Cabeçalho do Ranking */}
      <div className="bg-brand-gradient p-4 rounded-t-xl text-white flex items-center gap-3 shadow-sm">
        <div className="p-2 bg-white/20 rounded-full">
          <Trophy size={20} className="text-yellow-300 fill-current" />
        </div>
        <div>
          <h3 className="font-bold text-lg leading-tight">{title || "Ranking"}</h3>
          <p className="text-white/80 text-xs">{items.length} itens listados</p>
        </div>
      </div>

      {/* Descrição Opcional */}
      {content && (
        <div className="bg-white px-4 py-3 border-x border-slate-100 text-slate-600 text-sm">
          {content}
        </div>
      )}

      {/* Lista de Itens */}
      <div className="bg-white rounded-b-xl border border-slate-100 border-t-0 divide-y divide-slate-50 overflow-hidden">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group">
            
            {/* Posição (Medalha ou Número) */}
            <div className="flex-shrink-0 w-8 flex justify-center">
              {index === 0 ? (
                <Medal size={24} className="text-yellow-500" />
              ) : index === 1 ? (
                <Medal size={24} className="text-gray-400" />
              ) : index === 2 ? (
                <Medal size={24} className="text-amber-700" />
              ) : (
                <span className="text-lg font-black text-slate-300">#{index + 1}</span>
              )}
            </div>

            {/* Imagem do Item (Se houver) */}
            {item.image && (
              <div className="relative w-12 h-16 rounded-md overflow-hidden shadow-sm flex-shrink-0 bg-slate-100">
                <Image src={item.image} alt={item.title} fill className="object-cover" />
              </div>
            )}

            {/* Detalhes */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-800 text-sm truncate">{item.title}</h4>
              {item.author && <p className="text-xs text-slate-500 truncate">{item.author}</p>}
              {item.description && (
                <p className="text-xs text-slate-400 mt-1 line-clamp-1 group-hover:line-clamp-none transition-all">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="p-6 text-center text-slate-400 text-sm">
            Nenhum item neste ranking.
          </div>
        )}
      </div>
    </div>
  );
}