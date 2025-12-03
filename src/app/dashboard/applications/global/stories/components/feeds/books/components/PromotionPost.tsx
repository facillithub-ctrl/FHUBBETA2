import React from 'react';
import Image from 'next/image';
import { StoryPost } from '../../../../types';
import { Tag, ShoppingBag, ExternalLink, Clock } from 'lucide-react';

export default function PromotionPost({ post }: { post: StoryPost }) {
  const { title, content, coverImage, metadata } = post;
  
  const price = metadata?.price;
  const oldPrice = metadata?.oldPrice;
  const discount = metadata?.discountPercent;
  const link = metadata?.linkUrl || '#';

  return (
    <div className="mt-2 rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-white">
      
      {/* 1. Imagem de Capa (Destaque) */}
      {coverImage && (
        <div className="relative w-full h-48 bg-slate-100">
          <Image 
            src={coverImage} 
            alt={title || "Oferta"} 
            fill 
            className="object-cover"
          />
          {/* Badge de Desconto Flutuante */}
          {discount && discount > 0 && (
            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm animate-pulse">
              -{discount}% OFF
            </div>
          )}
        </div>
      )}

      {/* 2. Conteúdo da Oferta */}
      <div className="p-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg line-clamp-2">
              {title || "Oferta Imperdível"}
            </h3>
            <p className="text-slate-500 text-sm mt-1 line-clamp-2">
              {content}
            </p>
          </div>
          
          {/* Preço */}
          <div className="text-right flex-shrink-0">
            {oldPrice && (
              <span className="block text-xs text-slate-400 line-through">
                R$ {oldPrice.toFixed(2)}
              </span>
            )}
            {price && (
              <span className="block text-xl font-black text-green-600">
                R$ {price.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* 3. Footer / Ação */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center text-xs text-slate-400 gap-1">
            <Clock size={14} />
            <span>Expira em breve</span>
          </div>

          <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-brand-gradient text-white px-4 py-2 rounded-full text-sm font-bold shadow-md hover:opacity-90 transition-all hover:scale-105"
          >
            <ShoppingBag size={16} />
            Pegar Oferta
          </a>
        </div>
      </div>
    </div>
  );
}