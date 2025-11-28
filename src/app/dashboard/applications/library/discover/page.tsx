// src/app/dashboard/applications/library/discover/page.tsx
import { getDiscoverContent } from './actions';
import Image from 'next/image';
import Link from 'next/link';

export default async function DiscoverPage() {
  const { featured, math, literature } = await getDiscoverContent();

  const ContentSection = ({ title, items }: { title: string, items: any[] }) => (
    <div className="mb-10">
      <div className="flex justify-between items-end mb-4 px-6">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <Link href="#" className="text-sm text-royal-blue hover:underline">Ver tudo</Link>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 px-6 scrollbar-hide">
        {items.map((item) => (
          <div key={item.id} className="min-w-[200px] w-[200px] flex-shrink-0 group cursor-pointer">
            <div className="relative aspect-[2/3] mb-3 rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
              <Image 
                src={item.cover_image || '/assets/images/placeholder-book.png'} 
                alt={item.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <button className="absolute bottom-3 right-3 bg-white text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                <i className="fas fa-play text-xs"></i>
              </button>
            </div>
            <h4 className="font-semibold text-gray-900 truncate">{item.title}</h4>
            <p className="text-xs text-gray-500">{item.author}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full uppercase tracking-wide">
              {item.content_type === 'book' ? 'Livro' : 'Artigo'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <div className="relative h-80 bg-royal-blue mx-6 rounded-2xl mb-12 overflow-hidden flex items-center shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10" />
        {featured[0]?.cover_image && (
          <Image 
            src={featured[0].cover_image} 
            alt="Destaque" 
            fill 
            className="object-cover opacity-50"
          />
        )}
        <div className="relative z-20 p-10 max-w-2xl text-white">
          <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded mb-4 inline-block">EM DESTAQUE</span>
          <h1 className="text-4xl font-bold mb-4">{featured[0]?.title || 'Biblioteca Digital'}</h1>
          <p className="text-lg opacity-90 mb-6 line-clamp-2">{featured[0]?.description || 'Explore milhares de conteúdos educacionais selecionados para você.'}</p>
          <button className="bg-white text-royal-blue px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center gap-2">
            <i className="fas fa-book-open"></i>
            Ler Agora
          </button>
        </div>
      </div>

      <ContentSection title="Matemática e Lógica" items={math} />
      <ContentSection title="Clássicos da Literatura" items={literature} />
      
      {/* AI Recommendation Banner */}
      <div className="mx-6 p-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white flex justify-between items-center shadow-lg">
        <div>
          <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
            <i className="fas fa-robot"></i> Recomendado pela IA
          </h3>
          <p className="text-white/80 text-sm">Com base no seu último teste de Biologia.</p>
        </div>
        <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm">
          Ver Sugestões
        </button>
      </div>
    </div>
  );
}