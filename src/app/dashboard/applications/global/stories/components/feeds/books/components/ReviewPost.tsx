import Image from 'next/image';
import { StoryPost } from '../../../../types';

// Componente Auxiliar de Estrelas
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-1 text-amber-400 text-sm my-2">
    {[1, 2, 3, 4, 5].map((star) => (
      <i key={star} className={`${star <= rating ? 'fas' : 'far'} fa-star`}></i>
    ))}
  </div>
);

export default function ReviewPost({ post }: { post: StoryPost }) {
  return (
    <div className="flex flex-col sm:flex-row gap-5 mt-2">
      {/* Capa do Livro (Estilo Físico) */}
      {post.coverImage && (
        <div className="w-32 flex-shrink-0 mx-auto sm:mx-0">
          <div className="aspect-[2/3] relative rounded-r-lg rounded-l-sm shadow-[4px_4px_12px_rgba(0,0,0,0.15)] border-l-4 border-gray-200 overflow-hidden transform hover:scale-105 transition-transform duration-300">
             <Image src={post.coverImage} alt={post.title || ''} fill className="object-cover" />
             {/* Efeito de brilho na capa */}
             <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent pointer-events-none"></div>
          </div>
        </div>
      )}

      <div className="flex-1">
        <div className="border-l-2 border-brand-purple/20 pl-4 mb-3">
            <h3 className="font-bold text-gray-900 text-xl leading-tight">{post.title}</h3>
            <p className="text-sm text-gray-500 font-medium">{post.metadata?.author}</p>
        </div>
        
        {post.metadata?.rating && <StarRating rating={post.metadata.rating} />}
        
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
            {post.content}
        </div>

        {/* Tags da Resenha */}
        <div className="flex flex-wrap gap-2 mt-4">
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md border border-gray-200">
                Resenha Completa
            </span>
            {post.metadata?.genre && (
                <span className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-md border border-purple-100">
                    {post.metadata.genre}
                </span>
            )}
        </div>
      </div>
    </div>
  );
}