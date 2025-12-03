// CAMINHO: src/app/dashboard/applications/global/stories/components/feeds/BookLayouts.tsx
"use client";

import Image from 'next/image';
import { StoryPost } from '../../types';

// Utilitário para estrelas
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex text-yellow-400 gap-1 text-sm">
    {[...Array(5)].map((_, i) => (
      <i key={i} className={`fas fa-star ${i < Math.round(rating) ? '' : 'text-gray-300'}`}></i>
    ))}
  </div>
);

// 1. REVIEW (Layout Padrão Expandido)
export const BookReviewLayout = ({ post }: { post: StoryPost }) => (
  <div className="flex flex-col md:flex-row gap-4 bg-white p-4">
    <div className="w-full md:w-32 h-48 bg-gray-100 rounded-lg shadow-sm relative flex-shrink-0 overflow-hidden mx-auto md:mx-0">
      {post.coverImage && <Image src={post.coverImage} alt={post.title || ''} fill className="object-cover" />}
    </div>
    <div className="flex-1 text-center md:text-left">
      <h3 className="font-bold text-xl text-gray-800 leading-tight mb-1">{post.title}</h3>
      <p className="text-gray-500 text-sm mb-3">por {post.metadata?.author || post.subtitle}</p>
      
      {post.rating && <div className="mb-3 flex justify-center md:justify-start"><StarRating rating={post.rating} /></div>}
      
      <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
        {post.tags?.slice(0, 3).map(tag => (
          <span key={tag} className="bg-purple-50 text-purple-600 px-2 py-1 rounded text-xs font-semibold">#{tag}</span>
        ))}
      </div>
      
      <div className="text-gray-600 text-sm line-clamp-4 italic border-l-4 border-purple-200 pl-3">
        "{post.content}"
      </div>
    </div>
  </div>
);

// 2. QUOTE (Citação com visual tipográfico)
export const BookQuoteLayout = ({ post }: { post: StoryPost }) => (
  <div className="relative w-full h-80 overflow-hidden flex items-center justify-center text-center p-8">
    {/* Fundo Desfocado */}
    {post.coverImage && (
      <div className="absolute inset-0 z-0">
        <Image src={post.coverImage} alt="bg" fill className="object-cover blur-md opacity-30 scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-white/10" />
      </div>
    )}
    
    <div className="relative z-10 max-w-lg">
      <i className="fas fa-quote-left text-4xl text-purple-300 mb-4 block"></i>
      <p className="font-serif text-2xl text-gray-800 italic leading-relaxed mb-6">
        {post.metadata?.quote || post.content}
      </p>
      <div className="flex items-center justify-center gap-3">
        <div className="w-10 h-10 relative rounded-full overflow-hidden border border-gray-200 bg-white">
           {post.coverImage && <Image src={post.coverImage} alt="Book" fill className="object-cover" />}
        </div>
        <div className="text-left">
          <p className="font-bold text-sm text-gray-800">{post.title}</p>
          <p className="text-xs text-gray-500">
             {post.metadata?.author} {post.metadata?.quotePage && `• Pág. ${post.metadata.quotePage}`}
          </p>
        </div>
      </div>
    </div>
  </div>
);

// 3. PROMOTION (Foco em preço e CTA)
export const BookPromotionLayout = ({ post }: { post: StoryPost }) => (
  <div className="flex bg-gradient-to-r from-red-50 to-white border border-red-100 p-5 gap-5 items-center">
    <div className="w-24 h-36 relative shadow-lg rotate-3 transition-transform hover:rotate-0">
      {post.coverImage && <Image src={post.coverImage} alt="Book" fill className="object-cover rounded-md" />}
      <div className="absolute -top-3 -right-3 bg-red-600 text-white font-bold rounded-full w-12 h-12 flex items-center justify-center text-xs shadow-md z-10">
        -{post.metadata?.discountPercent || '??'}%
      </div>
    </div>
    
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Oferta Relâmpago</span>
      </div>
      <h3 className="font-bold text-lg text-gray-800">{post.title}</h3>
      <p className="text-xs text-gray-500 mb-4">{post.metadata?.publisher}</p>
      
      <div className="flex items-end gap-3 mb-4">
        <span className="text-3xl font-black text-red-600">R$ {post.metadata?.price?.toFixed(2)}</span>
        {post.metadata?.oldPrice && (
          <span className="text-sm text-gray-400 line-through mb-1.5">R$ {post.metadata.oldPrice.toFixed(2)}</span>
        )}
      </div>
      
      {post.externalLink && (
        <a 
          href={post.externalLink.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors shadow-red-200 shadow-lg"
        >
          {post.externalLink.label || "Pegar Promoção"} <i className="fas fa-external-link-alt"></i>
        </a>
      )}
    </div>
  </div>
);

// 4. RECOMMENDATION (3 Motivos)
export const BookRecommendationLayout = ({ post }: { post: StoryPost }) => (
  <div className="bg-emerald-50/50 p-6">
    <div className="flex items-center gap-2 mb-4">
      <i className="fas fa-check-circle text-emerald-500 text-xl"></i>
      <h3 className="font-bold text-gray-800">Recomendado para: <span className="text-emerald-700">{post.metadata?.targetAudience || 'Todos'}</span></h3>
    </div>
    
    <div className="flex gap-6">
      <div className="w-20 h-28 relative flex-shrink-0 bg-gray-200 rounded shadow-md">
        {post.coverImage && <Image src={post.coverImage} alt="Cover" fill className="object-cover rounded" />}
      </div>
      <div className="flex-1">
         <p className="font-bold text-gray-800 mb-2">{post.title}</p>
         <ul className="space-y-2">
            {post.metadata?.reasons?.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <i className="fas fa-caret-right text-emerald-400 mt-1"></i>
                <span>{reason}</span>
              </li>
            )) || <li className="text-sm text-gray-500">{post.content}</li>}
         </ul>
      </div>
    </div>
  </div>
);

// 5. FIRST IMPRESSIONS (Barra de progresso + Emoção)
export const BookFirstImpressionsLayout = ({ post }: { post: StoryPost }) => (
  <div className="bg-white p-5">
    <div className="flex gap-4 items-start">
      <div className="w-16 h-24 relative flex-shrink-0">
        {post.coverImage && <Image src={post.coverImage} alt="Cover" fill className="object-cover rounded border border-gray-100" />}
      </div>
      <div className="flex-1 w-full">
         <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-sm text-gray-800">{post.title}</h3>
              <p className="text-xs text-gray-500 mb-2">{post.metadata?.author}</p>
            </div>
            {post.metadata?.mood && (
              <span className="text-xl" title={`Mood: ${post.metadata.mood}`}>
                 {post.metadata.mood === 'Empolgado' ? '🤩' : post.metadata.mood === 'Confuso' ? '🤔' : '😮'}
              </span>
            )}
         </div>
         
         <div className="bg-gray-100 rounded-lg p-3 mb-3">
            <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
               <span>Primeiras Impressões</span>
               <span>{post.progress?.percentage || 0}% Lido</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
               <div className="bg-blue-500 h-full rounded-full" style={{ width: `${post.progress?.percentage || 0}%` }}></div>
            </div>
         </div>
         <p className="text-sm text-gray-700 leading-snug">"{post.content}"</p>
      </div>
    </div>
  </div>
);

// 6. RANKING / LISTA
export const BookRankingLayout = ({ post }: { post: StoryPost }) => (
  <div className="bg-white p-5">
    <h3 className="font-bold text-lg text-gray-800 mb-4 border-b pb-2">{post.title}</h3>
    <div className="space-y-3">
      {post.metadata?.rankingItems?.map((item, index) => (
        <div key={index} className="flex items-center gap-3 group">
          <div className="font-black text-3xl text-gray-200 w-8 text-center group-hover:text-purple-200 transition-colors">
            {item.position}
          </div>
          <div className="w-10 h-14 bg-gray-100 relative rounded flex-shrink-0">
             {item.image && <Image src={item.image} alt={item.title} fill className="object-cover rounded" />}
          </div>
          <div className="flex-1">
             <p className="font-bold text-sm text-gray-800">{item.title}</p>
             {item.author && <p className="text-xs text-gray-500">{item.author}</p>}
          </div>
        </div>
      )) || <p className="text-gray-500 text-sm">Lista vazia.</p>}
    </div>
  </div>
);

// 7. FICHA TÉCNICA
export const BookTechnicalLayout = ({ post }: { post: StoryPost }) => (
    <div className="flex bg-gray-50 p-4 gap-4 rounded-xl border border-gray-100">
        <div className="w-28 h-40 bg-white relative shadow-sm flex-shrink-0">
             {post.coverImage && <Image src={post.coverImage} alt="Cover" fill className="object-cover p-1 bg-white" />}
        </div>
        <div className="flex-1 grid grid-cols-2 gap-y-2 gap-x-4 text-sm content-center">
             <div className="col-span-2 mb-2 border-b border-gray-200 pb-2">
                 <h3 className="font-bold text-gray-800 text-lg">{post.title}</h3>
             </div>
             <div>
                <span className="block text-[10px] uppercase text-gray-400 font-bold">Autor</span>
                <span className="text-gray-800 font-medium">{post.metadata?.author || '-'}</span>
             </div>
             <div>
                <span className="block text-[10px] uppercase text-gray-400 font-bold">Editora</span>
                <span className="text-gray-800 font-medium">{post.metadata?.publisher || '-'}</span>
             </div>
             <div>
                <span className="block text-[10px] uppercase text-gray-400 font-bold">Páginas</span>
                <span className="text-gray-800 font-medium">{post.metadata?.pages || '-'}</span>
             </div>
             <div>
                <span className="block text-[10px] uppercase text-gray-400 font-bold">Gênero</span>
                <span className="text-gray-800 font-medium">{post.metadata?.genre || '-'}</span>
             </div>
        </div>
    </div>
);

// --- SELETOR PRINCIPAL ---
export default function BookPostRenderer({ post }: { post: StoryPost }) {
  // Se não houver subtipo definido, tenta inferir ou usa Review
  const subtype = post.type as string; 

  switch (subtype) {
    case 'quote': return <BookQuoteLayout post={post} />;
    case 'promotion': return <BookPromotionLayout post={post} />;
    case 'recommendation': return <BookRecommendationLayout post={post} />;
    case 'first-impressions': return <BookFirstImpressionsLayout post={post} />;
    case 'ranking': return <BookRankingLayout post={post} />;
    case 'technical': return <BookTechnicalLayout post={post} />;
    case 'rating': 
    case 'review': 
    default: return <BookReviewLayout post={post} />;
  }
}