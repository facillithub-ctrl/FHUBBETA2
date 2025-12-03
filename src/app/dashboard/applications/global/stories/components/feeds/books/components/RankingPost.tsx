import Image from 'next/image';
import { StoryPost } from '../../../../types';

export default function RankingPost({ post }: { post: StoryPost }) {
  return (
    <div className="mt-2">
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-t-xl border-b border-orange-100 flex items-center gap-3">
         <div className="bg-orange-100 p-2 rounded-full text-orange-600">
            <i className="fas fa-crown text-xl"></i>
         </div>
         <div>
            <h3 className="font-bold text-gray-800 text-lg">{post.title}</h3>
            <p className="text-xs text-orange-600 font-bold uppercase tracking-wide">Top Lista</p>
         </div>
      </div>
      
      <div className="bg-white border border-gray-100 rounded-b-xl p-4 space-y-3">
        {post.metadata?.rankingItems?.map((item, index) => (
          <div key={index} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors group">
            {/* Posição */}
            <span className={`text-2xl font-black w-8 text-center ${index === 0 ? 'text-yellow-500 scale-125' : 'text-gray-300'}`}>
               #{item.position}
            </span>
            
            {/* Mini Capa */}
            {item.image && (
               <div className="w-10 h-14 relative rounded overflow-hidden shadow-sm flex-shrink-0">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
               </div>
            )}
            
            {/* Detalhes */}
            <div className="flex-1">
               <p className="font-bold text-gray-800 text-sm">{item.title}</p>
               {item.description && <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>}
            </div>
          </div>
        ))}
      </div>
      
      {/* CORREÇÃO AQUI: Aspas escapadas */}
      <p className="text-sm text-gray-600 mt-3 px-2 italic">&quot;{post.content}&quot;</p>
    </div>
  );
}