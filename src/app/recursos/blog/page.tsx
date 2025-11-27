import { client, urlFor } from '@/lib/sanity'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { ArrowRight, Calendar, Clock, Search, TrendingUp, Sparkles, Zap, Star } from 'lucide-react'
import { BlogControls } from '@/components/blog/BlogControls'
import { NewsletterBox } from '@/components/blog/NewsletterBox'

export const metadata: Metadata = {
  title: 'Blog Facillit | Conhecimento e Inovação',
  description: 'Explore artigos, tutoriais e insights do universo Facillit.',
}

async function getData(search: string = '', category: string = '') {
  let filter = `_type == "post"`
  if (search) filter += ` && (title match "*${search}*" || body[].children[].text match "*${search}*")`
  if (category) filter += ` && $category in categories[]->title`

  // Query para buscar Posts + Destaque + Trending + Sugestões
  const query = `{
    "posts": *[${filter}] | order(publishedAt desc) {
      title, slug, excerpt, mainImage, publishedAt,
      "categories": categories[]->{title},
      "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180 ) + 1
    },
    "featured": *[_type == "post"][0] {
      title, slug, excerpt, mainImage, publishedAt, "categories": categories[]->{title}
    },
    "trending": *[_type == "post"] | order(publishedAt asc)[0...2] {
       title, slug, mainImage, "categories": categories[]->{title}
    },
    "forYou": *[_type == "post"] | order(_createdAt desc)[1...3] {
       title, slug, mainImage, excerpt
    },
    "categories": *[_type == "category"] {title, _id}
  }`

  return client.fetch(query, { category })
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ q: string, cat: string }> }) {
  const { q, cat } = await searchParams
  const data = await getData(q, cat)
  const { posts, featured, categories, trending, forYou } = data

  // Filtrar o destaque da lista principal para não repetir
  const listPosts = posts.filter((p: any) => p.slug.current !== featured?.slug.current)

  return (
    <div className="min-h-screen bg-white font-inter selection:bg-brand-purple selection:text-white">
      
      {/* --- HERO SECTION CLEAN & ANIMATED --- */}
      <div className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
        {/* Background Animado */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-brand-purple/5 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-brand-green/5 rounded-full blur-[80px]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12">
                {/* Texto Hero */}
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
                    
                    {/* Barra de Busca Integrada na Hero */}
                    <div className="max-w-md mx-auto lg:mx-0 shadow-xl shadow-brand-purple/5 rounded-2xl">
                        <BlogControls categories={categories} simpleMode={true} />
                    </div>
                </div>

                {/* Visual Hero */}
                <div className="flex-1 relative w-full max-w-lg hidden lg:block">
                    <div className="relative z-10 bg-white rounded-3xl p-4 shadow-2xl shadow-gray-200/50 border border-gray-100 transform rotate-2 hover:rotate-0 transition-all duration-500">
                        {featured?.mainImage && (
                            <div className="relative h-80 w-full rounded-2xl overflow-hidden">
                                <Image src={urlFor(featured.mainImage).url()} alt="Destaque" fill className="object-cover hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                    <div>
                                        <span className="bg-brand-green text-brand-dark text-xs font-bold px-2 py-1 rounded mb-2 inline-block">Destaque</span>
                                        <h3 className="text-white font-bold text-xl">{featured.title}</h3>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* --- SEÇÃO DE RECOMENDAÇÕES --- */}
      {!q && !cat && (
        <div className="bg-gray-50 border-y border-gray-100 py-12">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Card "Em Alta" */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                                <TrendingUp size={20} />
                            </div>
                            <h3 className="font-bold text-gray-900">Em Alta</h3>
                        </div>
                        <div className="space-y-4">
                            {trending?.map((post: any) => (
                                <Link href={`/recursos/blog/${post.slug.current}`} key={post.slug.current} className="flex gap-3 items-center group/item">
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                        {post.mainImage && <Image src={urlFor(post.mainImage).url()} fill className="object-cover" alt={post.title} />}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 leading-tight group-hover/item:text-brand-purple transition-colors line-clamp-2">{post.title}</h4>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Card "Para Você" */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                                <Star size={20} />
                            </div>
                            <h3 className="font-bold text-gray-900">Para Você</h3>
                        </div>
                        <div className="space-y-4">
                             {forYou?.map((post: any) => (
                                <Link href={`/recursos/blog/${post.slug.current}`} key={post.slug.current} className="block group/item">
                                    <h4 className="text-sm font-semibold text-gray-700 group-hover/item:text-brand-purple transition-colors mb-1">{post.title}</h4>
                                    <p className="text-xs text-gray-400 line-clamp-2">{post.excerpt}</p>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Card "Newsletter" */}
                    <div className="bg-brand-dark p-6 rounded-2xl shadow-sm text-white relative overflow-hidden flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple rounded-full blur-3xl opacity-30 -mr-10 -mt-10"></div>
                        <h3 className="font-bold text-lg mb-2 relative z-10 flex items-center gap-2"><Zap size={18} className="text-brand-green" /> Weekly Insights</h3>
                        <p className="text-sm text-gray-300 mb-4 relative z-10">As melhores dicas de produtividade toda semana.</p>
                        <div className="relative z-10">
                            <NewsletterBox simple={true} darkTheme={true} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
      )}

      {/* --- FEED PRINCIPAL --- */}
      <div className="container mx-auto px-4 max-w-7xl py-16">
        <div className="flex flex-col lg:flex-row gap-12">
            
            <div className="flex-1">
                {/* Categorias (Sticky) */}
                <div className="sticky top-24 z-20 bg-white/90 backdrop-blur-md py-4 mb-8 border-b border-gray-100 -mx-4 px-4 lg:mx-0 lg:px-0 lg:rounded-xl">
                    <BlogControls categories={categories} onlyCategories={true} />
                </div>

                {/* Grid de Artigos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {listPosts.length > 0 ? listPosts.map((post: any) => (
                        <Link href={`/recursos/blog/${post.slug.current}`} key={post.slug.current} className="group flex flex-col h-full">
                            <article className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                                <div className="relative h-60 w-full overflow-hidden">
                                    {post.mainImage && (
                                        <Image
                                            src={urlFor(post.mainImage).width(600).height(400).url()}
                                            alt={post.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
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
                                        <span className="flex items-center gap-1"><Clock size={12} /> {post.estimatedReadingTime} min</span>
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
                        <div className="col-span-full py-24 text-center">
                            <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Nada encontrado por aqui</h3>
                            <p className="text-gray-500 mt-2">Tente ajustar seus termos de busca.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Sticky */}
            <aside className="w-full lg:w-80 space-y-8 hidden lg:block">
                <div className="sticky top-40 space-y-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h4 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Categorias</h4>
                        <ul className="space-y-2">
                            {categories.map((cat: any) => (
                                <li key={cat._id}>
                                    <Link href={`/recursos/blog?cat=${cat.title}`} className="flex items-center justify-between text-sm text-gray-600 hover:text-brand-purple hover:bg-gray-50 p-2 rounded-lg transition-colors group">
                                        {cat.title}
                                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </aside>

        </div>
      </div>
    </div>
  )
}