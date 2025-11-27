import { client, urlFor } from '@/lib/sanity'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { ArrowRight, Calendar, Clock, Search, TrendingUp, Sparkles, Zap, Star, X } from 'lucide-react'
import { BlogControls } from '@/components/blog/BlogControls'
import { NewsletterBox } from '@/components/blog/NewsletterBox'

export const metadata: Metadata = {
  title: 'Blog Facillit | Conhecimento e Inovação',
  description: 'Explore artigos, tutoriais e insights do universo Facillit.',
}

// Revalidação a cada 60 segundos
export const revalidate = 60; 

async function getData(search: string = '', category: string = '') {
  let filter = `_type == "post"`
  
  // Filtro de Busca Textual
  if (search) {
    filter += ` && (title match "*${search}*" || body[].children[].text match "*${search}*")`
  }
  
  // Filtro de Categoria
  if (category) {
    filter += ` && count((categories[]->title)[@ == "${category}"]) > 0`
  }

  // Query otimizada
  const query = `{
    "posts": *[${filter}] | order(publishedAt desc) {
      title, slug, excerpt, mainImage, publishedAt,
      "categories": categories[]->{title},
      "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180 ) + 1
    },
    "featured": *[_type == "post"] | order(publishedAt desc)[0] {
      title, slug, excerpt, mainImage, publishedAt, "categories": categories[]->{title}
    },
    "trending": *[_type == "post"] | order(publishedAt asc)[0...2] {
       title, slug, mainImage, "categories": categories[]->{title}
    },
    "forYou": *[_type == "post"] | order(_createdAt desc)[1...3] {
       title, slug, mainImage, excerpt
    },
    "categories": *[_type == "category"] | order(title asc) {title, _id}
  }`

  try {
    return await client.fetch(query)
  } catch (error) {
    console.error("Erro Sanity:", error);
    return { posts: [], featured: null, categories: [], trending: [], forYou: [] };
  }
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ q: string, cat: string }> }) {
  const { q, cat } = await searchParams
  const data = await getData(q, cat)
  
  const posts = data?.posts || []
  const featured = data?.featured || null
  const categories = data?.categories || []
  
  // LÓGICA CORRIGIDA:
  // Se houver busca (q) ou categoria (cat), NÃO removemos o destaque da lista.
  // Mostramos exatamente o que a busca retornou.
  const isFiltering = !!q || !!cat;
  
  const listPosts = isFiltering 
    ? posts 
    : posts.filter((p: any) => p?.slug?.current !== featured?.slug?.current);

  return (
    <div className="min-h-screen bg-white font-inter selection:bg-brand-purple selection:text-white">
      
      {/* --- HERO SECTION --- */}
      {/* Oculta o Hero Gigante se estiver filtrando para focar nos resultados */}
      {!isFiltering && (
      <div className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-brand-purple/5 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-brand-green/5 rounded-full blur-[80px]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="flex-1 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-gray-50 border border-gray-200 text-brand-purple text-xs font-bold uppercase tracking-wider mb-6 hover:bg-brand-purple/5 transition-colors cursor-default">
                        <Sparkles size={14} className="text-brand-green" /> Blog Oficial Facillit
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black text-gray-900 mb-6 leading-[1.1] tracking-tight">
                        Transforme sua <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-green">Jornada Educacional</span>
                    </h1>
                    <p className="text-lg text-gray-500 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                        Um espaço dedicado a inovação, produtividade e tecnologia. Descubra como potencializar seus resultados.
                    </p>
                    
                    <div className="max-w-md mx-auto lg:mx-0 shadow-xl shadow-brand-purple/5 rounded-2xl">
                        <BlogControls categories={categories} simpleMode={true} />
                    </div>
                </div>

                <div className="flex-1 relative w-full max-w-lg hidden lg:block">
                    <div className="relative z-10 bg-white rounded-3xl p-4 shadow-2xl shadow-gray-200/50 border border-gray-100 transform rotate-2 hover:rotate-0 transition-all duration-500">
                        {featured?.mainImage && (
                            <Link href={`/recursos/blog/${featured.slug.current}`}>
                                <div className="relative h-80 w-full rounded-2xl overflow-hidden group cursor-pointer">
                                    <Image src={urlFor(featured.mainImage).url()} alt="Destaque" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                        <div>
                                            <span className="bg-brand-green text-brand-dark text-xs font-bold px-2 py-1 rounded mb-2 inline-block">Destaque</span>
                                            <h3 className="text-white font-bold text-xl group-hover:text-brand-green transition-colors">{featured.title}</h3>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
      )}

      {/* --- HEADER DE FILTRO (Só aparece se tiver filtro) --- */}
      {isFiltering && (
         <div className="pt-32 pb-8 bg-gray-50 border-b border-gray-100">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Resultados para:</p>
                        <h1 className="text-3xl font-black text-gray-900">
                            {cat ? <span className="flex items-center gap-2"><span className="text-brand-purple">#</span>{cat}</span> : `Busca: "${q}"`}
                        </h1>
                    </div>
                    <Link href="/recursos/blog" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:text-red-500 hover:border-red-200 transition-all shadow-sm">
                        <X size={16} /> Limpar Filtros
                    </Link>
                </div>
            </div>
         </div>
      )}

      {/* --- FEED PRINCIPAL --- */}
      <div className="container mx-auto px-4 max-w-7xl py-16">
        <div className="flex flex-col lg:flex-row gap-12">
            
            <div className="flex-1">
                {/* Controles Mobile/Sticky */}
                {!isFiltering && (
                    <div className="sticky top-24 z-20 bg-white/90 backdrop-blur-md py-4 mb-8 border-b border-gray-100 -mx-4 px-4 lg:mx-0 lg:px-0 lg:rounded-xl">
                        <BlogControls categories={categories} onlyCategories={true} />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {listPosts.length > 0 ? listPosts.map((post: any) => (
                        <Link href={`/recursos/blog/${post.slug.current}`} key={post.slug.current} className="group flex flex-col h-full">
                            <article className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                                <div className="relative h-60 w-full overflow-hidden">
                                    {post.mainImage ? (
                                        <Image
                                            src={urlFor(post.mainImage).width(600).height(400).url()}
                                            alt={post.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                                            <Sparkles size={40} />
                                        </div>
                                    )}
                                    {post.categories?.[0] && (
                                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-brand-purple shadow-sm">
                                            {post.categories[0].title}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-3 font-medium">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.publishedAt).toLocaleDateString('pt-BR')}</span>
                                        <span className="flex items-center gap-1"><Clock size={12} /> {post.estimatedReadingTime || 5} min</span>
                                    </div>
                                    
                                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-purple transition-colors line-clamp-2">
                                        {post.title}
                                    </h2>
                                    
                                    <p className="text-gray-500 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                    
                                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <span className="text-brand-purple font-bold text-sm flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                                            Ler agora <ArrowRight size={16} />
                                        </span>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    )) : (
                        <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
                            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <Search className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Nenhum artigo encontrado</h3>
                            <p className="text-gray-500 mt-2 text-sm max-w-xs mx-auto">
                                Não encontramos posts para <strong>{cat || q}</strong>. Tente outra categoria ou termo.
                            </p>
                            <Link href="/recursos/blog" className="inline-block mt-6 px-6 py-2 bg-brand-purple text-white rounded-full text-sm font-bold hover:bg-brand-dark transition-colors">
                                Ver todos os artigos
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <aside className="w-full lg:w-80 space-y-8 hidden lg:block">
                <div className="sticky top-40 space-y-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h4 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Categorias</h4>
                        <ul className="space-y-2">
                            {categories.map((c: any) => {
                                const isActive = cat === c.title;
                                return (
                                    <li key={c._id}>
                                        <Link 
                                            href={`/recursos/blog?cat=${c.title}`} 
                                            className={`flex items-center justify-between text-sm p-2 rounded-lg transition-colors group ${isActive ? 'bg-brand-purple/10 text-brand-purple font-bold' : 'text-gray-600 hover:text-brand-purple hover:bg-gray-50'}`}
                                        >
                                            {c.title}
                                            {isActive && <div className="w-2 h-2 rounded-full bg-brand-purple"></div>}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>
            </aside>

        </div>
      </div>
    </div>
  )
}