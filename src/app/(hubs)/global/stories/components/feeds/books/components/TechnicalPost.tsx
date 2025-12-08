import React from 'react';
import Image from 'next/image';
import { StoryPost } from '../../../../types';
import { Book, Calendar, Layers, PenTool } from 'lucide-react';

export default function TechnicalPost({ post }: { post: StoryPost }) {
  const { title, coverImage, metadata } = post;
  
  const items = [
    { label: 'Autor', value: metadata?.author, icon: <PenTool size={14} /> },
    { label: 'Editora', value: metadata?.publisher, icon: <Book size={14} /> },
    { label: 'Páginas', value: metadata?.pages, icon: <Layers size={14} /> },
    { label: 'Gênero', value: metadata?.genre, icon: <div className="w-3.5 h-3.5 rounded-full bg-brand-purple" /> },
    { label: 'Ano', value: metadata?.year, icon: <Calendar size={14} /> },
  ].filter(i => i.value);

  return (
    <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col sm:flex-row">
       
       {/* Lado Esquerdo: Capa */}
       <div className="bg-slate-100 sm:w-1/3 flex items-center justify-center p-4">
          {coverImage ? (
             <div className="relative w-24 h-36 shadow-md rounded-md overflow-hidden">
                <Image src={coverImage} alt={title || "Ficha"} fill className="object-cover" />
             </div>
          ) : (
             <div className="w-24 h-36 bg-slate-200 rounded-md flex items-center justify-center text-slate-400">
                <Book size={32} />
             </div>
          )}
       </div>

       {/* Lado Direito: Dados */}
       <div className="flex-1 p-5">
          <div className="mb-4 border-b border-slate-100 pb-2">
             <h3 className="font-bold text-lg text-slate-900">{title}</h3>
             <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Ficha Técnica</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
             {items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                   <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <span className="text-slate-400">{item.icon}</span>
                      <span>{item.label}</span>
                   </div>
                   <span className="font-medium text-slate-900 text-sm text-right group-hover:text-brand-purple transition-colors">
                      {item.value}
                   </span>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
}