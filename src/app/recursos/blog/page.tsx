import { client, urlFor } from '@/lib/sanity'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { ArrowRight, Calendar, Clock, Sparkles, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Facillit Hub | Blog',
  description: 'Central de conhecimento e inovação.',
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getBlogData() {
  const query = `{
    // Trazemos exatamente os 4 últimos posts para a seção "Últimas Publicações"
    // Sem filtros, garantindo que apareçam sempre os mais recentes
    "posts": *[_type == "post"] | order(publishedAt desc)[0...4] {
      _id, title, slug, excerpt, mainImage, publishedAt,
      "categories": categories[]->{title},
      "author": author->{name, image, isOfficial},
      "estimatedReadingTime": coalesce(round(length(pt::text(body)) / 5 / 180 ), 5) + 1
    },
    
    // Destaque Principal (O mais recente de todos para o Hero)
    "heroPost": *[_type == "post"] | order(publishedAt desc)[0] {
        _id, title, slug, excerpt, mainImage, publishedAt, "categories": categories[]->{title}, "author": author->{name, image, isOfficial}
    }
  }`

  try {
    return await client.fetch(query);
  } catch (error) {
    console.error("SANITY ERROR:", error);
    return null;
  }
}

export default async function BlogPage() {
  const data = await getBlogData();

  if (!data) return <div className="min-h-screen flex items-center justify-center text-gray-500">Carregando...</div>;

  const { posts, heroPost } = data;
  
  // Nesta versão, mostramos a lista "posts" diretamente (os 4 últimos),
  // mesmo que o "heroPost" esteja contido nela.
  const listPosts = posts || [];

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-inter text-gray-900 selection:bg-brand-purple/20 selection:text-brand-purple">
      
      <main className="container mx-auto px-6 py-12 max-w-7xl">
        
        {/* HEADER SIMPLES */}
        <div className="mb-12 flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-purple/10 rounded-xl flex items-center justify-center text-brand-purple">
                <Sparkles size={20} />
            </div>
            <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Blog Facillit</h1>
                <p className="text-sm text-gray-500">Insights, tutoriais e novidades.</p>
            </div>
        </div>

        {/* HERO SECTION */}
        {heroPost && (
            <section className="mb-20">
                <Link href={`/recursos/blog/${heroPost.slug.current}`} className="group relative block rounded-[2.5rem] overflow-hidden bg-gray-900 shadow-2xl hover:shadow-brand-purple/20 transition-all duration-500">
                    <div className="relative h-[500px] w-full">
                        {heroPost.mainImage && (
                            <Image 
                                src={urlFor(heroPost.mainImage).width(1200).url()} 
                                alt={heroPost.title} 
                                fill 
                                className="object-cover opacity-80 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
                                priority
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                        
                        <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full max-w-4xl">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-brand-purple text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                                    Destaque
                                </span>
                                {heroPost.categories?.[0] && (
                                    <span className="text-gray-300 text-xs font-bold uppercase tracking-wider border-l border-white/20 pl-3">
                                        {heroPost.categories[0].title}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.1]">
                                {heroPost.title}
                            </h2>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    {heroPost.author?.image ? (
                                        <Image src={urlFor(heroPost.author.image).width(40).url()} width={32} height={32} alt="" className="rounded-full border border-white/20" />
                                    ) : <div className="w-8 h-8 bg-brand-purple rounded-full"/>}
                                    <span className="text-white font-bold text-sm flex items-center gap-1.5">
                                        {heroPost.author?.name}
                                        {/* Verificado Verde no Hero */}
                                        {heroPost.author?.isOfficial && <CheckCircle size={14} className="text-green-500" fill="white" strokeWidth={3} />}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            </section>
        )}

        {/* LISTA DE ARTIGOS (GRID) */}
        <div className="mb-12">
            <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                Últimas Publicações
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {listPosts.map((post: any) => (
                    <Link href={`/recursos/blog/${post.slug.current}`} key={post._id} className="group flex flex-col h-full">
                        <article className="bg-white rounded-[2rem] p-3 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                            
                            {/* Imagem */}
                            <div className="relative h-48 w-full rounded-[1.5rem] overflow-hidden bg-gray-100 mb-4">
                                {post.mainImage && (
                                    <Image 
                                        src={urlFor(post.mainImage).width(600).height(400).url()} 
                                        alt={post.title} 
                                        fill 
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                )}
                                {post.categories?.[0] && (
                                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-gray-900 shadow-sm">
                                        {post.categories[0].title}
                                    </div>
                                )}
                            </div>

                            {/* Conteúdo */}
                            <div className="px-2 pb-2 flex-1 flex flex-col">
                                <div className="flex items-center gap-3 mb-3 text-xs font-bold text-gray-400">
                                    <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(post.publishedAt).toLocaleDateString('pt-BR')}</span>
                                    <span className="flex items-center gap-1"><Clock size={12}/> {post.estimatedReadingTime} min</span>
                                </div>

                                <h3 className="text-base font-bold text-gray-900 mb-3 leading-snug group-hover:text-brand-purple transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                    <div className="flex items-center gap-2">
                                        {post.author?.image ? (
                                            <Image src={urlFor(post.author.image).width(24).url()} width={24} height={24} alt="" className="rounded-full ring-1 ring-white" />
                                        ) : <div className="w-6 h-6 rounded-full bg-gray-100"/>}
                                        <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                                            {post.author?.name}
                                            {/* Verificado Verde no Grid */}
                                            {post.author?.isOfficial && <CheckCircle size={12} className="text-green-500" fill="transparent" strokeWidth={3} />}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>
        </div>

        {/* BOTÃO "VER TODOS" */}
        <div className="text-center pt-8 border-t border-gray-200">
            <Link href="/recursos/blog/explorar" className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-brand-purple hover:border-brand-purple/30 transition-all shadow-sm group">
                Ver todos os artigos
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
            </Link>
        </div>

      </main>
    </div>
  )
}