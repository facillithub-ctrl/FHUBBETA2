import React from 'react';
import Image from 'next/image';
import { StoryPost } from '../../../../types';
import { Quote } from 'lucide-react';

export default function QuotePost({ post }: { post: StoryPost }) {
  const { content, coverImage, metadata } = post;
  const author = metadata?.author || "Desconhecido";
  const source = metadata?.publisher || metadata?.title; // Usa publisher ou titulo como fonte

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden mt-2 group min-h-[200px] flex flex-col justify-center ${!coverImage ? 'bg-gradient-to-br from-brand-purple to-purple-900' : ''}`}>
      
      {/* 1. Imagem de Fundo (Se houver upload) */}
      {coverImage && (
        <>
          <Image 
            src={coverImage} 
            alt="Background" 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Overlay escuro para legibilidade */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </>
      )}

      {/* 2. Conteúdo da Citação */}
      <div className="relative z-10 p-8 text-center flex flex-col items-center">
        <Quote size={40} className="text-white/30 mb-4 fill-current" />
        
        <blockquote className="text-xl md:text-2xl font-serif text-white font-medium leading-relaxed italic drop-shadow-sm">
          "{metadata?.quoteText || content}"
        </blockquote>

        <div className="mt-6 flex flex-col items-center gap-1">
          <cite className="not-italic text-white font-bold text-base tracking-wide">
            — {author}
          </cite>
          {(source || metadata?.quotePage) && (
            <span className="text-white/60 text-xs uppercase tracking-wider font-medium">
              {source} {metadata?.quotePage ? `• Pág. ${metadata.quotePage}` : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}