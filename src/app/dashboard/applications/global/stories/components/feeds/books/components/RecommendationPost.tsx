import React from 'react';
import Image from 'next/image';
import { StoryPost } from '../../../../types';
import { ThumbsUp, CheckCircle2, Users } from 'lucide-react';

export default function RecommendationPost({ post }: { post: StoryPost }) {
  const { title, coverImage, metadata } = post;
  const reasons = metadata?.reasons || [];
  const targetAudience = metadata?.targetAudience;

  return (
    <div className="mt-2 bg-emerald-50/50 rounded-xl border border-emerald-100 overflow-hidden">
      
      {/* Header Visual */}
      <div className="flex gap-4 p-4 items-start">
        {coverImage && (
           <div className="relative w-20 h-28 flex-shrink-0 rounded-md overflow-hidden shadow-sm">
              <Image src={coverImage} alt={title || "Livro"} fill className="object-cover" />
           </div>
        )}
        <div className="flex-1">
           <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                 Recomendação
              </span>
           </div>
           <h3 className="font-bold text-slate-900 leading-tight mb-2">{title}</h3>
           
           {targetAudience && (
             <div className="flex items-center gap-2 text-sm text-emerald-800 bg-white/60 p-2 rounded-lg border border-emerald-100/50">
                <Users size={16} className="flex-shrink-0" />
                <span className="font-medium">Para: {targetAudience}</span>
             </div>
           )}
        </div>
      </div>

      {/* Lista de Motivos */}
      {reasons.length > 0 && (
        <div className="px-4 pb-4">
           <p className="text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Por que ler?</p>
           <div className="space-y-2">
              {reasons.map((reason, idx) => (
                 <div key={idx} className="flex gap-3 items-start bg-white p-2.5 rounded-lg shadow-sm border border-emerald-50">
                    <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-700 leading-snug">{reason}</p>
                 </div>
              ))}
           </div>
        </div>
      )}
      
      {/* Botão de Ação */}
      <div className="bg-emerald-100/50 p-2 text-center border-t border-emerald-100">
         <button className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1 hover:underline">
            <ThumbsUp size={12} />
            Agradecer indicação
         </button>
      </div>
    </div>
  );
}