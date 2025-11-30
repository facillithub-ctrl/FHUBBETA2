"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PortableText } from '@portabletext/react';
import { urlFor } from '@/lib/sanity';
import Image from 'next/image';
import { BadgeCheck } from 'lucide-react'; // Ícone direto, sem componente extra
import type { ChangelogPost } from '../actions';

// -- Estilos de Categorias --
const categoryColors: Record<string, string> = {
    'Feature': 'bg-purple-100 text-purple-700 border-purple-200',
    'Melhoria': 'bg-blue-100 text-blue-700 border-blue-200',
    'Bugfix': 'bg-orange-100 text-orange-700 border-orange-200',
    'Anuncio': 'bg-gray-100 text-gray-700 border-gray-200',
};

// -- Configuração Rica do Portable Text --
const portableTextComponents = {
    types: {
        // 1. IMAGEM COM AUTONOMIA DE TAMANHO
        image: ({ value }: any) => {
            if (!value?.asset?._ref) return null;
            
            // Classes baseadas na escolha do editor
            let containerClass = "my-8 rounded-xl overflow-hidden relative shadow-md ";
            
            switch (value.displaySize) {
                case 'full':
                    containerClass += "w-full aspect-video";
                    break;
                case 'half-left':
                    containerClass += "w-full md:w-1/2 md:float-left md:mr-6 mb-6 h-64 md:h-80";
                    break;
                case 'half-right':
                    containerClass += "w-full md:w-1/2 md:float-right md:ml-6 mb-6 h-64 md:h-80";
                    break;
                default: // normal
                    containerClass += "w-full aspect-[21/9]";
            }

            return (
                <div className={containerClass}>
                    <Image
                        src={urlFor(value).url()}
                        alt={value.alt || 'Imagem da atualização'}
                        fill
                        className="object-cover"
                    />
                    {value.caption && (
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs p-2 text-center backdrop-blur-sm">
                            {value.caption}
                        </div>
                    )}
                </div>
            );
        },
        // 2. SUPORTE A VÍDEO/EMBED
        videoEmbed: ({ value }: any) => {
            if (!value?.url) return null;
            const isYoutube = value.url.includes('youtube.com') || value.url.includes('youtu.be');
            
            return (
                <div className="my-8 rounded-xl overflow-hidden shadow-lg bg-black relative">
                    {isYoutube ? (
                       <iframe 
                           src={value.url.replace('watch?v=', 'embed/').split('&')[0]} 
                           className="w-full aspect-video" 
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                           allowFullScreen
                       />
                    ) : (
                        <video controls src={value.url} className="w-full aspect-video" />
                    )}
                    {value.caption && <p className="bg-gray-50 text-center text-xs text-gray-500 py-2 border-t border-gray-100">{value.caption}</p>}
                </div>
            )
        }
    },
    block: {
        h3: ({ children }: any) => <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 clear-both">{children}</h3>,
        h4: ({ children }: any) => <h4 className="text-xl font-bold mt-6 mb-3 text-gray-800 clear-both">{children}</h4>,
        normal: ({ children }: any) => <p className="mb-4 leading-relaxed text-gray-600 text-lg">{children}</p>,
        blockquote: ({ children }: any) => <blockquote className="border-l-4 border-brand-purple pl-4 italic text-gray-700 my-6 bg-purple-50 py-4 pr-4 rounded-r-lg clear-both">{children}</blockquote>,
    }
};

export default function UpdatesFeedClient({ initialUpdates }: { initialUpdates: ChangelogPost[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
    const [selectedUpdate, setSelectedUpdate] = useState<ChangelogPost | null>(null);

    const categories = useMemo(() => {
        const unique = Array.from(new Set(initialUpdates.map(u => u.category).filter(Boolean)));
        return ['Todas', ...unique];
    }, [initialUpdates]);

    const filteredUpdates = useMemo(() => {
        if (selectedCategory === 'Todas') return initialUpdates;
        return initialUpdates.filter(u => u.category === selectedCategory);
    }, [initialUpdates, selectedCategory]);

    useEffect(() => {
        const noteSlug = searchParams.get('nota');
        if (noteSlug) {
            const found = initialUpdates.find(u => u.slug.current === noteSlug);
            if (found) {
                setSelectedUpdate(found);
                document.body.style.overflow = 'hidden';
            }
        } else {
            setSelectedUpdate(null);
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [searchParams, initialUpdates]);

    const openNote = (post: ChangelogPost) => {
        router.push(`/recursos/atualizacoes?nota=${post.slug.current}`, { scroll: false });
    };

    const closeNote = () => {
        router.push(`/recursos/atualizacoes`, { scroll: false });
    };

    return (
        <div className="container mx-auto px-4 max-w-5xl min-h-screen">
            
            {/* Filtros */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
                {categories.map((cat: any) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 border ${
                            selectedCategory === cat
                                ? 'bg-brand-purple text-white border-brand-purple shadow-lg shadow-brand-purple/20 transform scale-105'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-brand-purple hover:text-brand-purple'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                {filteredUpdates.map((post) => (
                    <div 
                        key={post._id} 
                        onClick={() => openNote(post)}
                        className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
                    >
                        {post.coverImage && (
                            <div className="w-full h-48 mb-6 rounded-xl overflow-hidden relative shadow-md">
                                <Image 
                                    src={urlFor(post.coverImage).url()} 
                                    alt={post.title} 
                                    fill 
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                {new Date(post.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <div className="flex gap-2">
                                {post.tags?.slice(0, 2).map(tag => (
                                     <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-bold uppercase">
                                        {tag}
                                     </span>
                                ))}
                                {post.category && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase ${categoryColors[post.category] || 'bg-gray-100 text-gray-600'}`}>
                                        {post.category}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <h2 className="text-xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-purple group-hover:to-brand-green transition-all mb-3">
                            {post.title}
                        </h2>
                        
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
                            {post.summary}
                        </p>

                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-50">
                            {post.author?.image && (
                                <div className="w-8 h-8 rounded-full overflow-hidden relative">
                                    <Image src={urlFor(post.author.image).url()} alt={post.author.name} fill className="object-cover" />
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium text-gray-500">
                                    {post.author?.name || 'Time Facillit'}
                                </span>
                                {/* BadgeCheck Ícone (Lucide) */}
                                {post.author?.isVerified && (
                                    <BadgeCheck className="w-4 h-4 text-brand-purple fill-purple-50" />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Fullscreen */}
            {selectedUpdate && (
                <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-fade-in">
                    
                    {/* Header Modal */}
                    <div className="border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
                         <button 
                            onClick={closeNote}
                            className="flex items-center gap-2 text-gray-500 hover:text-brand-purple transition-colors font-medium group"
                        >
                            <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> Voltar
                        </button>
                        
                        <div className="flex gap-2">
                             {selectedUpdate.tags?.map(tag => (
                                <span key={tag} className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-bold border border-gray-200 hidden md:inline-block">
                                    #{tag}
                                </span>
                             ))}
                             {selectedUpdate.category && (
                                <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase flex items-center ${categoryColors[selectedUpdate.category] || 'bg-gray-100'}`}>
                                    {selectedUpdate.category}
                                </span>
                             )}
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto bg-white">
                        <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 pb-40">
                            
                            <div className="text-center max-w-2xl mx-auto mb-16">
                                <p className="text-gray-500 font-medium mb-4 uppercase tracking-widest text-xs">
                                    {new Date(selectedUpdate.publishedAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-green">
                                    {selectedUpdate.title}
                                </h1>
                                <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-light">
                                    {selectedUpdate.summary}
                                </p>

                                {/* Autor no Topo do Modal */}
                                {selectedUpdate.author && (
                                    <div className="flex items-center justify-center gap-3 mt-8">
                                        {selectedUpdate.author.image && (
                                            <div className="w-12 h-12 rounded-full overflow-hidden relative shadow-sm border-2 border-white ring-2 ring-gray-100">
                                                <Image src={urlFor(selectedUpdate.author.image).url()} alt={selectedUpdate.author.name} fill className="object-cover" />
                                            </div>
                                        )}
                                        <div className="text-left">
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-sm font-bold text-gray-900">{selectedUpdate.author.name}</p>
                                                {selectedUpdate.author.isVerified && (
                                                    <BadgeCheck className="w-4 h-4 text-brand-purple fill-purple-50" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">Autor</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Imagem de Capa Grande */}
                            {selectedUpdate.coverImage && (
                                <div className="w-full aspect-video rounded-2xl overflow-hidden relative shadow-xl mb-16 ring-1 ring-gray-900/5">
                                    <Image 
                                        src={urlFor(selectedUpdate.coverImage).url()} 
                                        alt={selectedUpdate.title} 
                                        fill 
                                        className="object-cover"
                                    />
                                </div>
                            )}

                            {/* Conteúdo Rico */}
                            <div className="prose prose-lg prose-purple mx-auto">
                                <PortableText 
                                    value={selectedUpdate.content} 
                                    components={portableTextComponents} 
                                />
                            </div>
                        </div>
                    </div>

                    {selectedUpdate.actionUrl && (
                        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 p-6 md:p-8 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-30">
                            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="hidden md:block">
                                    <p className="font-bold text-gray-900 text-lg">Pronto para testar?</p>
                                    <p className="text-sm text-gray-500">Experimente essa novidade agora mesmo.</p>
                                </div>
                                <a 
                                    href={selectedUpdate.actionUrl}
                                    className="w-full md:w-auto text-center bg-brand-purple hover:bg-brand-purple-dark text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg hover:shadow-brand-purple/30 transform hover:-translate-y-1 text-lg flex items-center justify-center gap-2"
                                >
                                    {selectedUpdate.actionText || 'Acessar Recurso'} <i className="fas fa-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}