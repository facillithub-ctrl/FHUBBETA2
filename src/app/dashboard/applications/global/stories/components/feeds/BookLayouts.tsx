"use client";

import Image from 'next/image';
import { StoryPost } from '../../types';

// Utilitário de Estrelas
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex text-yellow-400 gap-1 text-sm">
    {[...Array(5)].map((_, i) => (
      <i key={i} className={`fas fa-star ${i < Math.round(rating) ? '' : 'text-gray-200'}`}></i>
    ))}
  </div>
);

// 1. LAYOUT: RANKING / LISTA (Top X)
export const BookRankingLayout = ({ post }: { post: StoryPost }) => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
    {/* Cabeçalho */}
    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-5 text-white relative">
        <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-20"><i className="fas fa-trophy text-8xl"></i></div>
        <div className="relative z-10">
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">Top Lista</span>
            <h3 className="font-black text-2xl leading-tight mt-1 max-w-md">{post.title || 'Minha Lista'}</h3>
        </div>
    </div>
    {/* Itens */}
    <div className="divide-y divide-gray-50">
      {post.metadata?.rankingItems?.map((item, index) => (
        <div key={index} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group">
          <div className="w-8 text-center flex-shrink-0">
             <span className={`block font-black text-2xl italic ${index < 3 ? 'text-yellow-500' : 'text-gray-300'}`}>{item.position}</span>
          </div>
          <div className="flex-1">
             <p className="font-bold text-gray-800 text-sm leading-tight">{item.title}</p>
             {item.author && <p className="text-xs text-gray-500">{item.author}</p>}
          </div>
        </div>
      )) || <div className="p-4 text-center text-gray-400 text-sm">Lista vazia.</div>}
    </div>
    {post.content && <div className="p-4 bg-gray-50 text-xs text-gray-600 italic border-t border-gray-100">"{post.content}"</div>}
  </div>
);

// 2. LAYOUT: QUOTE (Citação)
export const BookQuoteLayout = ({ post }: { post: StoryPost }) => (
  <div className="relative w-full overflow-hidden rounded-2xl bg-gray-900 text-white text-center p-8 min-h-[280px] flex flex-col items-center justify-center">
    {post.coverImage && (
      <div className="absolute inset-0 z-0 opacity-40">
        <Image src={post.coverImage} alt="bg" fill className="object-cover blur-md scale-110" />
      </div>
    )}
    <div className="relative z-10 max-w-md">
      <i className="fas fa-quote-left text-3xl text-white/30 mb-4 block"></i>
      <p className="font-serif text-2xl leading-relaxed mb-6 drop-shadow-md italic">"{post.metadata?.quote || post.content}"</p>
      <div className="inline-flex items-center gap-2 bg-black/40 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
         <span className="text-xs font-bold">{post.title}</span>
         {post.metadata?.quotePage && <span className="text-[10px] opacity-70 border-l border-white/20 pl-2 ml-1">Pág. {post.metadata.quotePage}</span>}
      </div>
    </div>
  </div>
);

// 3. LAYOUT: PROMOTION (Oferta)
export const BookPromotionLayout = ({ post }: { post: StoryPost }) => (
  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col sm:flex-row shadow-sm group">
    <div className="bg-red-50 p-6 flex flex-col justify-center items-center sm:w-40 border-r border-red-50 border-dashed">
       <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase mb-2">Oferta</span>
       {post.metadata?.discountPercent && <span className="text-2xl font-black text-red-600">-{post.metadata.discountPercent}%</span>}
    </div>
    <div className="p-5 flex-1">
      <h3 className="font-bold text-lg text-gray-900 leading-tight">{post.title}</h3>
      <div className="flex items-baseline gap-3 my-3">
        <span className="text-3xl font-black text-gray-900">R$ {post.metadata?.price?.toFixed(2)}</span>
        {post.metadata?.oldPrice && <span className="text-sm text-gray-400 line-through">R$ {post.metadata.oldPrice.toFixed(2)}</span>}
      </div>
      {post.externalLink && (
        <a href={post.externalLink.url} target="_blank" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-black transition-colors">
          Ver Oferta <i className="fas fa-external-link-alt text-xs"></i>
        </a>
      )}
    </div>
  </div>
);

// 4. LAYOUT: RECOMMENDATION (Recomendação)
export const BookRecommendationLayout = ({ post }: { post: StoryPost }) => (
  <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
    <div className="flex items-center gap-2 mb-4">
      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Indicação</span>
      <h3 className="font-bold text-gray-800 text-sm">Para: <span className="text-emerald-700">{post.metadata?.targetAudience || 'Todos'}</span></h3>
    </div>
    <div className="flex gap-4 items-start">
      <div className="w-16 h-24 bg-white rounded shadow-sm relative flex-shrink-0">
         {post.coverImage && <Image src={post.coverImage} alt="Cover" fill className="object-cover rounded p-0.5" />}
      </div>
      <ul className="space-y-2 flex-1">
         {post.metadata?.reasons?.map((r, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700"><i className="fas fa-check text-emerald-500 mt-1 text-xs"></i> {r}</li>
         )) || <li className="text-sm text-gray-500">{post.content}</li>}
      </ul>
    </div>
  </div>
);

// 5. LAYOUT: FICHA TÉCNICA
export const BookTechnicalLayout = ({ post }: { post: StoryPost }) => (
    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-5">
        <div className="w-24 h-36 bg-white shadow-sm relative flex-shrink-0 mx-auto sm:mx-0">
             {post.coverImage && <Image src={post.coverImage} alt="Capa" fill className="object-cover p-1" />}
        </div>
        <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
             <div className="col-span-2 border-b border-slate-200 pb-2 mb-1"><h3 className="font-bold text-slate-900">{post.title}</h3></div>
             <div><span className="block text-[10px] uppercase text-slate-400 font-bold">Autor</span><span className="font-medium text-slate-700">{post.metadata?.author || '-'}</span></div>
             <div><span className="block text-[10px] uppercase text-slate-400 font-bold">Editora</span><span className="font-medium text-slate-700">{post.metadata?.publisher || '-'}</span></div>
             <div><span className="block text-[10px] uppercase text-slate-400 font-bold">Páginas</span><span className="font-medium text-slate-700">{post.metadata?.pages || '-'}</span></div>
             <div><span className="block text-[10px] uppercase text-slate-400 font-bold">Gênero</span><span className="font-medium text-slate-700">{post.metadata?.genre || '-'}</span></div>
        </div>
    </div>
);

// 6. LAYOUT: REVIEW (Padrão)
export const BookReviewLayout = ({ post }: { post: StoryPost }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
    <div className="flex gap-5 flex-col sm:flex-row">
      <div className="w-32 h-48 bg-gray-100 rounded-lg shadow relative flex-shrink-0 mx-auto sm:mx-0 overflow-hidden">
        {post.coverImage ? <Image src={post.coverImage} alt="Capa" fill className="object-cover" /> : <div className="flex items-center justify-center h-full text-gray-300"><i className="fas fa-book text-3xl"></i></div>}
      </div>
      <div className="flex-1 text-center sm:text-left">
        <div className="mb-2"><span className="text-[10px] font-bold uppercase text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Resenha</span></div>
        <h3 className="font-bold text-xl text-gray-900 mb-1">{post.title}</h3>
        <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">{post.metadata?.author || post.subtitle}</p>
        {post.rating && <div className="mb-4 flex justify-center sm:justify-start"><StarRating rating={post.rating} /></div>}
        <p className="text-sm text-gray-600 line-clamp-5 leading-relaxed">{post.content}</p>
      </div>
    </div>
  </div>
);

// --- SELETOR PRINCIPAL ---
export default function BookPostRenderer({ post }: { post: StoryPost }) {
  // Se type for undefined, fallback para review
  const type = post.type || 'review';
  
  switch (type) {
    case 'ranking': return <BookRankingLayout post={post} />;
    case 'quote': return <BookQuoteLayout post={post} />;
    case 'promotion': return <BookPromotionLayout post={post} />;
    case 'recommendation': return <BookRecommendationLayout post={post} />;
    case 'technical': return <BookTechnicalLayout post={post} />;
    case 'review': 
    default: return <BookReviewLayout post={post} />;
  }
}