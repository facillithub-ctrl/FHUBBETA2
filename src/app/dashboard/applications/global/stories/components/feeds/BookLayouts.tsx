"use client";

import Image from 'next/image';
import { StoryPost } from '../../types';

// Utilitário para renderizar estrelas
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-1 text-yellow-400 text-sm">
    {[1, 2, 3, 4, 5].map((star) => (
      <i key={star} className={`${star <= rating ? 'fas' : 'far'} fa-star`}></i>
    ))}
  </div>
);

// --- COMPONENTES VISUAIS ESPECÍFICOS POR FORMATO ---

// 1. REVIEW (Layout Clássico com Capa e Texto)
const ReviewLayout = ({ post }: { post: StoryPost }) => (
  <div className="flex flex-col sm:flex-row gap-5">
    {post.coverImage && (
      <div className="w-full sm:w-32 flex-shrink-0">
        <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-all">
          <Image src={post.coverImage} alt={post.title || ''} fill className="object-cover" />
        </div>
      </div>
    )}
    <div className="flex-1">
      <div className="mb-2">
        <h3 className="font-bold text-gray-900 text-lg leading-tight">{post.title}</h3>
        <p className="text-sm text-gray-500">{post.metadata?.author}</p>
      </div>
      {post.metadata?.rating && <div className="mb-3"><StarRating rating={post.metadata.rating} /></div>}
      <p className="text-gray-700 text-sm leading-relaxed line-clamp-4 mb-3">{post.content}</p>
      
      {post.metadata?.tags && (
        <div className="flex flex-wrap gap-2">
          {post.metadata.tags.map(tag => (
            <span key={tag} className="text-[10px] px-2 py-1 bg-brand-light text-gray-600 rounded font-medium">#{tag}</span>
          ))}
        </div>
      )}
    </div>
  </div>
);

// 2. PROMOÇÃO (Foco no Preço e CTA)
const PromotionLayout = ({ post }: { post: StoryPost }) => (
  <div className="bg-gradient-to-br from-brand-purple/5 to-transparent rounded-xl p-4 border border-brand-purple/10 flex items-center gap-4">
    {post.coverImage && (
       <div className="w-20 h-28 relative rounded shadow-sm overflow-hidden flex-shrink-0">
         <Image src={post.coverImage} alt="Oferta" fill className="object-cover" />
         <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl">
            -{Math.round(((post.metadata?.oldPrice || 0) - (post.metadata?.price || 0)) / (post.metadata?.oldPrice || 1) * 100)}%
         </div>
       </div>
    )}
    <div className="flex-1">
       <span className="text-xs font-bold text-brand-purple uppercase tracking-wider mb-1 block">Oferta Relâmpago</span>
       <h3 className="font-bold text-gray-900 leading-tight mb-2">{post.title}</h3>
       <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-black text-brand-green">R$ {post.metadata?.price?.toFixed(2)}</span>
          {post.metadata?.oldPrice && (
            <span className="text-sm text-gray-400 line-through">R$ {post.metadata.oldPrice.toFixed(2)}</span>
          )}
       </div>
       <a 
         href={post.metadata?.linkUrl || '#'} 
         target="_blank"
         className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-brand-purple text-white text-xs font-bold rounded-lg hover:bg-opacity-90 transition-all"
       >
         Pegar Promoção <i className="fas fa-arrow-right ml-2"></i>
       </a>
    </div>
  </div>
);

// 3. QUOTE (Visual, Tipografia diferente)
const QuoteLayout = ({ post }: { post: StoryPost }) => (
  <div className="relative overflow-hidden rounded-xl bg-brand-dark text-white p-8 text-center group">
    {post.coverImage && (
      <div className="absolute inset-0 opacity-20 group-hover:scale-105 transition-transform duration-700">
        <Image src={post.coverImage} alt="Background" fill className="object-cover blur-sm" />
      </div>
    )}
    <div className="relative z-10 flex flex-col items-center justify-center h-full">
      <i className="fas fa-quote-left text-brand-green text-3xl mb-4 opacity-80"></i>
      <p className="font-multiara text-2xl md:text-3xl leading-relaxed mb-4 text-brand-light">
        "{post.metadata?.quoteText || post.content}"
      </p>
      <div className="text-sm text-gray-400 font-medium">
        — {post.title} <span className="mx-1">•</span> Pág. {post.metadata?.quotePage || '?'}
      </div>
    </div>
  </div>
);

// 4. RANKING (Lista Vertical)
const RankingLayout = ({ post }: { post: StoryPost }) => (
  <div className="bg-brand-light rounded-xl p-5">
    <div className="flex items-center gap-3 mb-4">
       <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
          <i className="fas fa-trophy"></i>
       </div>
       <div>
          <h3 className="font-bold text-gray-900">{post.title}</h3>
          <p className="text-xs text-gray-500">{post.content}</p>
       </div>
    </div>
    <div className="space-y-3">
      {post.metadata?.rankingItems?.map((item, idx) => (
        <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
           <span className={`font-black text-lg w-6 text-center ${idx === 0 ? 'text-yellow-500' : 'text-gray-300'}`}>
             #{item.position}
           </span>
           {item.image && (
             <div className="w-10 h-14 relative rounded overflow-hidden bg-gray-200">
                <Image src={item.image} alt={item.title} fill className="object-cover" />
             </div>
           )}
           <span className="font-medium text-sm text-gray-800">{item.title}</span>
        </div>
      ))}
    </div>
  </div>
);

// 5. FIRST IMPRESSIONS (Com barra de progresso)
const FirstImpressionsLayout = ({ post }: { post: StoryPost }) => (
  <div className="border border-gray-100 rounded-xl p-5 bg-white">
    <div className="flex gap-4 mb-4">
       {post.coverImage && (
          <div className="w-16 h-24 relative rounded shadow-sm overflow-hidden flex-shrink-0">
             <Image src={post.coverImage} alt={post.title || ''} fill className="object-cover" />
          </div>
       )}
       <div className="flex-1">
          <div className="flex justify-between items-start">
             <h3 className="font-bold text-gray-900 text-sm mb-1">{post.title}</h3>
             <span className="text-[10px] bg-brand-light px-2 py-1 rounded text-gray-600 font-bold uppercase">
               {post.metadata?.mood || 'Lendo'}
             </span>
          </div>
          <p className="text-xs text-gray-500 mb-3">{post.metadata?.author}</p>
          
          {/* Barra de Progresso */}
          <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
             <div 
               className="bg-brand-purple h-2 rounded-full transition-all duration-500" 
               style={{ width: `${post.metadata?.progress || 0}%` }}
             ></div>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">{post.metadata?.progress}% concluído</span>
       </div>
    </div>
    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg italic">
       "{post.content}"
    </div>
  </div>
);

// 6. RECOMMENDATION (Motivos)
const RecommendationLayout = ({ post }: { post: StoryPost }) => (
   <div className="bg-[#fdfbf7] border border-stone-200 rounded-xl p-5 relative overflow-hidden">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-green/10 rounded-full blur-xl"></div>
      
      <div className="relative z-10">
         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <i className="fas fa-thumbs-up text-brand-green"></i> Recomendação
         </h3>
         
         <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="flex-1">
               <h2 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h2>
               <p className="text-sm text-gray-600 mb-4 font-medium">
                  Ideal para: <span className="text-brand-purple">{post.metadata?.targetAudience}</span>
               </p>
               
               <div className="space-y-2">
                  {post.metadata?.reasons?.map((reason, i) => (
                     <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <i className="fas fa-check text-brand-green mt-1"></i>
                        <span>{reason}</span>
                     </div>
                  ))}
               </div>
            </div>
            
            {post.coverImage && (
               <div className="w-24 h-36 relative rounded-md shadow-md rotate-3 border-2 border-white flex-shrink-0 mx-auto sm:mx-0">
                  <Image src={post.coverImage} alt={post.title || ''} fill className="object-cover" />
               </div>
            )}
         </div>
      </div>
   </div>
);

// --- COMPONENTE PRINCIPAL (ROTEADOR DE LAYOUTS) ---
export default function BookPostRenderer({ post }: { post: StoryPost }) {
  switch (post.type) {
    case 'promotion': return <PromotionLayout post={post} />;
    case 'quote': return <QuoteLayout post={post} />;
    case 'ranking': return <RankingLayout post={post} />;
    case 'first-impressions': return <FirstImpressionsLayout post={post} />;
    case 'recommendation': return <RecommendationLayout post={post} />;
    case 'rating': // Layout compacto simplificado
    case 'indication':
    case 'review':
    default: return <ReviewLayout post={post} />;
  }
}