import Image from 'next/image';
import { StoryPost } from '../../../../types';

export default function PromotionPost({ post }: { post: StoryPost }) {
  const discount = post.metadata?.oldPrice && post.metadata?.price 
    ? Math.round(((post.metadata.oldPrice - post.metadata.price) / post.metadata.oldPrice) * 100) 
    : 0;

  return (
    <div className="mt-2 border-2 border-dashed border-purple-200 bg-purple-50/50 rounded-xl p-5 relative overflow-hidden">
       {/* Badge de Desconto */}
       {discount > 0 && (
          <div className="absolute -right-12 top-5 bg-red-500 text-white text-xs font-bold py-1 px-12 rotate-45 shadow-sm">
             -{discount}% OFF
          </div>
       )}

       <div className="flex gap-5 items-center">
          {post.coverImage && (
             <div className="w-24 h-32 relative rounded shadow-md flex-shrink-0 bg-white p-1">
                <div className="relative w-full h-full overflow-hidden rounded">
                   <Image src={post.coverImage} alt="Promo" fill className="object-contain" />
                </div>
             </div>
          )}
          
          <div className="flex-1">
             <h3 className="font-bold text-gray-900 text-lg mb-1">{post.title}</h3>
             <p className="text-xs text-gray-500 mb-3 line-through">De: R$ {post.metadata?.oldPrice?.toFixed(2)}</p>
             
             <div className="flex items-baseline gap-1 mb-4">
                <span className="text-sm text-purple-700 font-bold">Por apenas</span>
                <span className="text-3xl font-black text-brand-purple">R$ {post.metadata?.price?.toFixed(2)}</span>
             </div>

             <a 
               href={post.metadata?.linkUrl || '#'} 
               target="_blank"
               className="inline-flex items-center gap-2 bg-brand-green hover:bg-emerald-400 text-brand-dark font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm w-full sm:w-auto justify-center"
             >
                <i className="fas fa-shopping-cart"></i>
                Aproveitar Oferta
             </a>
             
             {post.metadata?.coupon && (
                <div className="mt-3 text-xs text-gray-500">
                   Use o cupom: <span className="font-mono font-bold bg-white px-2 py-1 rounded border border-gray-200 text-gray-800 ml-1 select-all">{post.metadata.coupon}</span>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}   