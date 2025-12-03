import Image from 'next/image';
import { StoryPost } from '../../../../types';

export default function QuotePost({ post }: { post: StoryPost }) {
  return (
    <div className="relative rounded-xl overflow-hidden mt-2 bg-gray-900 text-white min-h-[300px] flex items-center justify-center text-center p-8 group">
      {/* Background com Blur */}
      {post.coverImage && (
        <div className="absolute inset-0 opacity-40 group-hover:opacity-30 transition-opacity duration-700">
           <Image src={post.coverImage} alt="Background" fill className="object-cover blur-[2px] scale-110" />
           <div className="absolute inset-0 bg-black/40"></div>
        </div>
      )}
      
      {/* Conteúdo */}
      <div className="relative z-10 max-w-md">
        <i className="fas fa-quote-left text-4xl text-brand-green/80 mb-6 block"></i>
        
        {/* CORREÇÃO: Aspas escapadas (&quot;) */}
        <p className="font-serif text-2xl md:text-3xl leading-relaxed tracking-wide text-gray-100 italic">
           &quot;{post.metadata?.quoteText || post.content}&quot;
        </p>
        
        <div className="mt-8 flex items-center justify-center gap-3">
           <div className="h-[1px] w-8 bg-brand-green"></div>
           <div className="text-sm font-medium text-brand-green uppercase tracking-widest">
              {post.title}
           </div>
           <div className="h-[1px] w-8 bg-brand-green"></div>
        </div>
        {post.metadata?.quotePage && (
           <p className="text-xs text-gray-400 mt-2">Página {post.metadata.quotePage}</p>
        )}
      </div>
    </div>
  );
}