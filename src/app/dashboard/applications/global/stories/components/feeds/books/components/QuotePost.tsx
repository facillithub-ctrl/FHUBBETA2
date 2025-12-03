import React from 'react';
import Image from 'next/image';
import { StoryPost } from '../../../../types';
import { Quote } from 'lucide-react';

export default function QuotePost({ post }: { post: StoryPost }) {
  const { content, coverImage, metadata } = post;
  const author = metadata?.author || "Autor Desconhecido";
  const source = metadata?.publisher || metadata?.title;

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden mt-2 group min-h-[240px] flex flex-col justify-center items-center ${!coverImage ? 'bg-brand-gradient' : ''} shadow-md`}>
      
      {coverImage && (
        <>
          <Image 
            src={coverImage} 
            alt="Background" 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
        </>
      )}

      <div className="relative z-10 p-8 text-center flex flex-col items-center">
        <Quote size={32} className="text-white/40 mb-4 fill-current" />
        
        {/* CORREÇÃO AQUI: Aspas escapadas (&quot;) */}
        <blockquote className="text-xl md:text-2xl font-serif text-white font-medium leading-relaxed italic drop-shadow-sm">
          &quot;{metadata?.quoteText || content}&quot;
        </blockquote>

        <div className="mt-6 flex flex-col items-center gap-1">
          <cite className="not-italic text-white font-bold text-base tracking-wide border-t border-white/20 pt-2 px-4">
            {author}
          </cite>
          {(source || metadata?.quotePage) && (
            <span className="text-white/70 text-xs uppercase tracking-wider font-medium">
              {source} {metadata?.quotePage ? `• Pág. ${metadata.quotePage}` : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}