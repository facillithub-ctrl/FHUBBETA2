"use client";

import Image from 'next/image';
import { StoryPost } from '../../types';

// --- UTILITÁRIOS ---

const StarRating = ({ rating, size = "text-sm" }: { rating: number, size?: string }) => (
  <div className={`flex text-yellow-400 gap-1 ${size}`}>
    {[...Array(5)].map((_, i) => (
      <i key={i} className={`fas fa-star ${i < Math.round(rating) ? '' : 'text-gray-200'}`}></i>
    ))}
  </div>
);

// ------------------------------------------------------------------
// 1. REVIEW (Resenha Detalhada)
// Foco: Texto, Capa e Nota Equilibrados. Visual "Artigo".
// ------------------------------------------------------------------
export const BookReviewLayout = ({ post }: { post: StoryPost }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex flex-col sm:flex-row gap-5">
      <div className="w-32 h-48 bg-gray-100 rounded-lg shadow-md relative flex-shrink-0 overflow-hidden mx-auto sm:mx-0">
        {post.coverImage ? (
            <Image src={post.coverImage} alt={post.title || ''} fill className="object-cover" />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300"><i className="fas fa-book text-3xl"></i></div>
        )}
      </div>
      <div className="flex-1 text-center sm:text-left">
        <div className="flex flex-col h-full justify-between">
          <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase text-purple-600 bg-purple-50 px-2 py-1 rounded-full tracking-wide">Resenha</span>
                <span className="text-[10px] text-gray-400">{post.metadata?.pages ? `${post.metadata.pages} pág` : ''}</span>
              </div>
              <h3 className="font-bold text-xl text-gray-900 leading-tight mb-1">{post.title}</h3>
              <p className="text-gray-500 text-xs mb-3 font-medium uppercase tracking-wide">{post.metadata?.author || post.subtitle}</p>
              
              {post.rating && <div className="mb-4 flex justify-center sm:justify-start"><StarRating rating={post.rating} /></div>}
              
              <div className="text-gray-600 text-sm leading-relaxed line-clamp-4 relative">
                  {post.content}
                  <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-white to-transparent sm:hidden"></div>
              </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
              {post.tags?.slice(0, 3).map(tag => (
                <span key={tag} className="text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded-md font-medium">#{tag}</span>
              ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ------------------------------------------------------------------
// 2. RATING (Avaliação Rápida)
// Foco: A Nota é a protagonista. Layout compacto.
// ------------------------------------------------------------------
export const BookRatingLayout = ({ post }: { post: StoryPost }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-6 shadow-sm">
    <div className="flex-1">
       <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full relative overflow-hidden bg-gray-100">
             {post.coverImage && <Image src={post.coverImage} alt="Mini" fill className="object-cover" />}
          </div>
          <span className="text-xs font-bold text-gray-700 truncate max-w-[150px]">{post.title}</span>
       </div>
       <h3 className="text-lg font-bold text-gray-900 mb-2">Minha avaliação:</h3>
       {post.rating && <StarRating rating={post.rating} size="text-2xl" />}
       <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded-lg italic border-l-2 border-yellow-400">"{post.content || 'Sem comentários adicionais.'}"</p>
    </div>
    <div className="flex flex-col items-center justify-center bg-yellow-50 w-24 h-24 rounded-2xl flex-shrink-0 text-yellow-600">
       <span className="text-4xl font-black">{post.rating}</span>
       <span className="text-[10px] font-bold uppercase">de 5</span>
    </div>
  </div>
);

// ------------------------------------------------------------------
// 3. RECOMMENDATION (Recomendação Contextual)
// Foco: "Para quem é?". Design verde/positivo. Lista de motivos.
// ------------------------------------------------------------------
export const BookRecommendationLayout = ({ post }: { post: StoryPost }) => (
  <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border border-emerald-100 relative overflow-hidden shadow-sm">
    <div className="absolute top-0 right-0 p-4 opacity-10">
        <i className="fas fa-check-circle text-6xl text-emerald-600"></i>
    </div>
    
    <div className="relative z-10">
        <div className="inline-block bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase mb-4 tracking-widest">
            Recomendação
        </div>
        
        <h3 className="text-lg text-gray-800 mb-1">
            Se você gosta de <span className="font-bold text-emerald-700">{post.metadata?.targetAudience || 'bons livros'}</span>, leia:
        </h3>
        
        <div className="flex gap-5 items-start mt-4">
            <div className="w-20 h-28 relative flex-shrink-0 shadow-lg rotate-1 bg-white p-1 rounded-md border border-gray-100">
                {post.coverImage && <Image src={post.coverImage} alt="Cover" fill className="object-cover rounded-sm" />}
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-base">{post.title}</h4>
                <p className="text-xs text-gray-500 mb-3">{post.metadata?.author}</p>
                
                <div className="space-y-2">
                    {post.metadata?.reasons?.map((reason, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-white/60 p-1.5 rounded border border-emerald-50/50">
                        <i className="fas fa-check text-emerald-500 mt-1 text-xs"></i>
                        <span className="leading-tight">{reason}</span>
                    </div>
                    )) || <p className="text-sm text-gray-600">{post.content}</p>}
                </div>
            </div>
        </div>
    </div>
  </div>
);

// ------------------------------------------------------------------
// 4. INDICATION (Indicação Simples)
// Foco: Rápido e direto. Estilo "Badge".
// ------------------------------------------------------------------
export const BookIndicationLayout = ({ post }: { post: StoryPost }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between hover:border-blue-300 transition-colors cursor-pointer group">
      <div className="flex items-center gap-4">
          <div className="w-12 h-16 bg-gray-200 rounded relative overflow-hidden shadow-sm">
             {post.coverImage && <Image src={post.coverImage} alt="Mini" fill className="object-cover" />}
          </div>
          <div>
             <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0.5 block">Indicação</span>
             <h3 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{post.title}</h3>
             <p className="text-xs text-gray-500">{post.metadata?.author}</p>
          </div>
      </div>
      <div className="text-gray-300 group-hover:text-blue-500 transition-colors">
          <i className="fas fa-chevron-right"></i>
      </div>
  </div>
);

// ------------------------------------------------------------------
// 5. PROMOTION (Oferta/Promoção)
// Foco: Preço, Desconto e Botão de Ação. Cor Vermelha/Laranja.
// ------------------------------------------------------------------
export const BookPromotionLayout = ({ post }: { post: StoryPost }) => (
  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col sm:flex-row shadow-sm">
    <div className="bg-gradient-to-b from-red-50 to-white p-6 flex flex-col justify-center items-center sm:w-48 flex-shrink-0 border-r border-red-50 border-dashed relative">
       <div className="w-24 h-36 relative shadow-lg rotate-2 transition-transform hover:rotate-0 mb-3 z-10 bg-white rounded">
          {post.coverImage && <Image src={post.coverImage} alt="Book" fill className="object-cover rounded-sm" />}
       </div>
       {post.metadata?.discountPercent && (
         <div className="absolute top-4 right-4 sm:right-auto sm:left-4 bg-red-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center text-[10px] shadow-md z-20">
            -{post.metadata.discountPercent}%
         </div>
       )}
    </div>
    
    <div className="p-6 flex-1 flex flex-col justify-center">
      <div className="flex items-center gap-2 mb-1">
         <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
         <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Oferta Limitada</span>
      </div>
      <h3 className="font-bold text-lg text-gray-900 mb-1 leading-tight">{post.title}</h3>
      <p className="text-xs text-gray-500 mb-5 line-clamp-1">{post.metadata?.publisher} • {post.metadata?.author}</p>
      
      <div className="flex items-baseline gap-3 mb-5">
        <span className="text-3xl font-black text-gray-900">R$ {post.metadata?.price?.toFixed(2)}</span>
        {post.metadata?.oldPrice && (
          <span className="text-sm text-gray-400 line-through decoration-red-300">R$ {post.metadata.oldPrice.toFixed(2)}</span>
        )}
      </div>
      
      {post.externalLink && (
        <a 
          href={post.externalLink.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full sm:w-auto text-center bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2 group"
        >
          <span>Ver Oferta</span> 
          <i className="fas fa-external-link-alt text-xs opacity-70 group-hover:translate-x-1 transition-transform"></i>
        </a>
      )}
    </div>
  </div>
);

// ------------------------------------------------------------------
// 6. DISCUSSION (Debate)
// Foco: A Pergunta/Tema. Design de balão de fala ou forum.
// ------------------------------------------------------------------
export const BookDiscussionLayout = ({ post }: { post: StoryPost }) => (
  <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 relative">
     <div className="flex items-start gap-4">
        <div className="bg-indigo-100 text-indigo-600 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 text-lg">
           <i className="fas fa-comments"></i>
        </div>
        <div className="flex-1">
           <span className="text-[10px] font-bold text-indigo-400 uppercase mb-2 block">Tópico de Discussão</span>
           <h3 className="text-lg font-bold text-gray-800 mb-3 leading-snug">
              {post.content}
           </h3>
           
           {/* Contexto do Livro (Pequeno) */}
           <div className="bg-white p-3 rounded-xl border border-indigo-50 flex items-center gap-3 mt-4 max-w-md shadow-sm">
              <div className="w-8 h-12 relative bg-gray-200 rounded overflow-hidden flex-shrink-0">
                 {post.coverImage && <Image src={post.coverImage} alt="Ref" fill className="object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-xs font-bold text-gray-700 truncate">Sobre: {post.title}</p>
                 <p className="text-[10px] text-gray-400 truncate">{post.metadata?.author}</p>
              </div>
              <button className="text-xs font-bold text-indigo-600 px-3 py-1 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                 Participar
              </button>
           </div>
        </div>
     </div>
  </div>
);

// ------------------------------------------------------------------
// 7. FIRST IMPRESSIONS (Primeiras Impressões)
// Foco: Barra de progresso, Emoção (Mood).
// ------------------------------------------------------------------
export const BookFirstImpressionsLayout = ({ post }: { post: StoryPost }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xs"><i className="fas fa-eye"></i></span>
            <span className="text-xs font-bold text-gray-600">Primeiras Impressões</span>
        </div>
        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
            <span className="text-lg">{post.metadata?.mood === 'Empolgado' ? '🤩' : post.metadata?.mood === 'Confuso' ? '🤔' : post.metadata?.mood === 'Decepcionado' ? '😞' : '😮'}</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase">{post.metadata?.mood}</span>
        </div>
    </div>

    <div className="flex flex-col sm:flex-row gap-5">
      <div className="w-24 h-36 relative flex-shrink-0 mx-auto sm:mx-0 shadow-md">
        {post.coverImage && <Image src={post.coverImage} alt="Cover" fill className="object-cover rounded-md" />}
      </div>
      <div className="flex-1 space-y-4">
         <div>
            <h3 className="font-bold text-gray-900 text-base">{post.title}</h3>
            <p className="text-xs text-gray-500">{post.metadata?.author}</p>
         </div>
         
         {/* Barra de Progresso */}
         <div>
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-1">
               <span>Início</span>
               <span>{post.progress?.percentage || 0}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
               <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${post.progress?.percentage || 0}%` }}></div>
            </div>
         </div>
         
         <div className="bg-blue-50/50 p-3 rounded-xl">
            <i className="fas fa-quote-left text-blue-200 text-xs mb-1 block"></i>
            <p className="text-sm text-gray-700 italic leading-relaxed">"{post.content}"</p>
         </div>
      </div>
    </div>
  </div>
);

// ------------------------------------------------------------------
// 8. QUOTE (Citação / Trecho)
// Foco: Tipografia, Imagem de fundo, Estética.
// ------------------------------------------------------------------
export const BookQuoteLayout = ({ post }: { post: StoryPost }) => (
  <div className="relative w-full overflow-hidden rounded-2xl bg-gray-900 text-white text-center p-10 flex flex-col items-center justify-center min-h-[320px] group">
    {/* Background com Blur e Zoom no Hover */}
    {post.coverImage && (
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image 
            src={post.coverImage} 
            alt="bg" 
            fill 
            className="object-cover blur-md opacity-40 scale-110 group-hover:scale-125 transition-transform duration-1000" 
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>
    )}
    
    <div className="relative z-10 max-w-lg">
      <i className="fas fa-quote-left text-4xl text-white/20 mb-6 block"></i>
      <p className="font-serif text-2xl md:text-3xl leading-relaxed mb-8 drop-shadow-lg text-gray-50 tracking-wide">
        {post.metadata?.quote || post.content}
      </p>
      
      <div className="inline-flex items-center gap-3 bg-black/40 backdrop-blur-md pl-1 pr-4 py-1 rounded-full border border-white/10 hover:bg-black/60 transition-colors cursor-pointer">
        <div className="w-8 h-8 relative rounded-full overflow-hidden border border-white/30">
           {post.coverImage && <Image src={post.coverImage} alt="Book" fill className="object-cover" />}
        </div>
        <div className="text-left">
          <p className="font-bold text-xs text-white">{post.title}</p>
          <p className="text-[10px] text-gray-300">
             {post.metadata?.author} {post.metadata?.quotePage && <span className="opacity-60">• Pág. {post.metadata.quotePage}</span>}
          </p>
        </div>
      </div>
    </div>
  </div>
);

// ------------------------------------------------------------------
// 9. TECHNICAL (Ficha Técnica)
// Foco: Dados estruturados em Grid. Informativo.
// ------------------------------------------------------------------
export const BookTechnicalLayout = ({ post }: { post: StoryPost }) => (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col sm:flex-row">
        <div className="sm:w-36 bg-white relative min-h-[180px] border-r border-slate-100 flex items-center justify-center p-4">
             <div className="w-24 h-36 relative shadow-lg">
                {post.coverImage && <Image src={post.coverImage} alt="Cover" fill className="object-cover rounded-sm" />}
             </div>
        </div>
        <div className="p-6 flex-1">
             <div className="flex items-center gap-2 mb-4">
                <i className="fas fa-database text-slate-400"></i>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dados do Livro</span>
             </div>
             
             <h3 className="font-bold text-slate-900 text-lg mb-4 border-b border-slate-200 pb-2">{post.title}</h3>
             
             <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                 <div>
                    <span className="block text-[10px] uppercase text-slate-400 font-bold mb-0.5">Autor</span>
                    <span className="text-slate-800 font-semibold">{post.metadata?.author || '-'}</span>
                 </div>
                 <div>
                    <span className="block text-[10px] uppercase text-slate-400 font-bold mb-0.5">Editora</span>
                    <span className="text-slate-800 font-semibold">{post.metadata?.publisher || '-'}</span>
                 </div>
                 <div>
                    <span className="block text-[10px] uppercase text-slate-400 font-bold mb-0.5">Páginas</span>
                    <span className="text-slate-800 font-semibold">{post.metadata?.pages || '-'}</span>
                 </div>
                 <div>
                    <span className="block text-[10px] uppercase text-slate-400 font-bold mb-0.5">Gênero</span>
                    <span className="inline-block bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs font-bold">{post.metadata?.genre || '-'}</span>
                 </div>
             </div>
        </div>
    </div>
);

// ------------------------------------------------------------------
// 10. RANKING / LIST (Top X)
// Foco: Lista numerada, visual impactante.
// ------------------------------------------------------------------
export const BookRankingLayout = ({ post }: { post: StoryPost }) => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
    {/* Cabeçalho */}
    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-5 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-20">
            <i className="fas fa-trophy text-8xl"></i>
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 opacity-90">
                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">Top Lista</span>
            </div>
            <h3 className="font-black text-2xl leading-tight max-w-md">{post.title}</h3>
        </div>
    </div>

    {/* Lista */}
    <div className="divide-y divide-gray-50">
      {post.metadata?.rankingItems?.map((item, index) => (
        <div key={index} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group">
          {/* Posição */}
          <div className="w-10 text-center flex-shrink-0">
             <span className={`block font-black text-3xl italic ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-400' : 'text-gray-200 group-hover:text-violet-300'}`}>
                {item.position}
             </span>
          </div>
          
          {/* Capa Item */}
          <div className="w-12 h-16 bg-gray-100 rounded shadow-sm relative flex-shrink-0 overflow-hidden border border-gray-200">
             {item.image ? (
                 <Image src={item.image} alt={item.title} fill className="object-cover" />
             ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs"><i className="fas fa-book"></i></div>
             )}
          </div>

          {/* Dados */}
          <div className="flex-1 min-w-0">
             <p className="font-bold text-gray-800 text-sm leading-tight truncate">{item.title}</p>
             {item.author && <p className="text-xs text-gray-500 truncate">{item.author}</p>}
          </div>
        </div>
      )) || <div className="p-6 text-center text-gray-400 text-sm">Nenhum item na lista.</div>}
    </div>
    
    {/* Descrição Final */}
    {post.content && (
        <div className="p-4 bg-gray-50 text-xs text-gray-500 leading-relaxed border-t border-gray-100">
            {post.content}
        </div>
    )}
  </div>
);

// ------------------------------------------------------------------
// SELETOR PRINCIPAL
// ------------------------------------------------------------------
export default function BookPostRenderer({ post }: { post: StoryPost }) {
  const subtype = post.type as string; 

  switch (subtype) {
    case 'ranking': return <BookRankingLayout post={post} />;
    case 'quote': return <BookQuoteLayout post={post} />;
    case 'promotion': return <BookPromotionLayout post={post} />;
    case 'recommendation': return <BookRecommendationLayout post={post} />;
    case 'indication': return <BookIndicationLayout post={post} />;
    case 'discussion': return <BookDiscussionLayout post={post} />;
    case 'first-impressions': return <BookFirstImpressionsLayout post={post} />;
    case 'technical': return <BookTechnicalLayout post={post} />;
    case 'rating': return <BookRatingLayout post={post} />;
    case 'review': 
    default: return <BookReviewLayout post={post} />;
  }
}