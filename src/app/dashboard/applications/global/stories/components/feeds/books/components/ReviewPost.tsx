import React from 'react';
import Image from 'next/image';
import { StoryPost } from '../../../../types';
import { Star, BookOpen, Quote } from 'lucide-react';

export default function ReviewPost({ post }: { post: StoryPost }) {
  const { title, subtitle, content, coverImage, metadata } = post;
  const rating = metadata?.rating || 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Container Principal: Capa + Info */}
      <div className={`flex flex-col sm:flex-row gap-4 ${coverImage ? '' : 'items-center'}`}>
        
        {/* 1. Capa do Livro (Upload) */}
        {coverImage && (
          <div className="relative w-32 h-48 flex-shrink-0 shadow-md rounded-lg overflow-hidden group transition-transform hover:scale-105">
            <Image 
              src={coverImage} 
              alt={title || "Capa do livro"} 
              fill 
              className="object-cover"
            />
            {/* Efeito de brilho na capa */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
          </div>
        )}

        {/* 2. Informações e Avaliação */}
        <div className="flex flex-col flex-1 min-w-0 justify-center">
          
          {/* Título e Autor */}
          <div className="mb-2">
            <h3 className="text-xl font-bold text-slate-900 leading-tight">
              {title || "Sem título"}
            </h3>
            {metadata?.author && (
              <p className="text-sm text-slate-500 font-medium">
                por <span className="text-brand-purple">{metadata.author}</span>
              </p>
            )}
          </div>

          {/* Estrelas */}
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={18}
                className={`${
                  star <= rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-slate-200 text-slate-200'
                }`}
              />
            ))}
            <span className="ml-2 text-sm text-slate-400 font-bold">
              {rating > 0 ? rating.toFixed(1) : ''}
            </span>
          </div>

          {/* Badge de Gênero (se houver) */}
          {metadata?.genre && (
            <span className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
              <BookOpen size={12} className="mr-1.5" />
              {metadata.genre}
            </span>
          )}
        </div>
      </div>

      {/* 3. Texto da Review (Conteúdo) */}
      <div className="relative bg-slate-50 p-4 rounded-xl text-slate-700 text-sm leading-relaxed">
        <Quote className="absolute top-2 left-2 text-slate-200 w-8 h-8 -z-0" />
        <p className="relative z-10 whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}