import React from 'react';
import Image from 'next/image';
import { StoryPost } from '../../../../types';
import { Star, BookOpen, Quote } from 'lucide-react';

export default function ReviewPost({ post }: { post: StoryPost }) {
  const { title, content, coverImage, metadata } = post;
  const rating = metadata?.rating || 0;

  return (
    <div className="flex flex-col gap-4 mt-2">
      <div className={`flex flex-col sm:flex-row gap-4 ${coverImage ? '' : 'items-center'}`}>
        
        {/* Capa do Livro */}
        {coverImage && (
          <div className="relative w-32 h-48 flex-shrink-0 shadow-lg rounded-lg overflow-hidden group transition-transform hover:scale-105 border border-slate-100">
            <Image 
              src={coverImage} 
              alt={title || "Capa"} 
              fill 
              className="object-cover"
            />
          </div>
        )}

        <div className="flex flex-col flex-1 min-w-0 justify-center">
          <div className="mb-2">
            <h3 className="text-xl font-bold text-slate-900 leading-tight">
              {title || "Review de Livro"}
            </h3>
            {metadata?.author && (
              <p className="text-sm text-slate-500 font-medium">
                por <span className="text-brand-purple">{metadata.author}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={18}
                className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-200 text-slate-200'}`}
              />
            ))}
            <span className="ml-2 text-sm text-slate-400 font-bold">{rating > 0 ? rating.toFixed(1) : ''}</span>
          </div>

          {metadata?.genre && (
            <span className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
              <BookOpen size={12} className="mr-1.5" />
              {metadata.genre}
            </span>
          )}
        </div>
      </div>

      {/* Conteúdo da Review */}
      <div className="relative bg-slate-50 p-5 rounded-xl text-slate-700 text-sm leading-relaxed border border-slate-100/50 overflow-hidden">
        {/* CORREÇÃO: Ícone de aspas como marca d'água no fundo (opacity-10 e z-0) */}
        <Quote className="absolute top-2 left-2 text-brand-purple w-12 h-12 opacity-5 pointer-events-none" />
        
        <p className="relative z-10 whitespace-pre-wrap">
           {content}
        </p>
      </div>
    </div>
  );
}