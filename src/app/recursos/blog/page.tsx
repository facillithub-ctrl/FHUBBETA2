import { client, urlFor } from '@/lib/sanity'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { ArrowRight, Calendar, Clock, Search, TrendingUp, Sparkles, ChevronRight } from 'lucide-react'
import { BlogControls } from '@/components/blog/BlogControls'
import { NewsletterBox } from '@/components/blog/NewsletterBox'

export const metadata: Metadata = {
  title: 'Blog Facillit | Inovação e Educação',
  description: 'Artigos, tutoriais e novidades sobre o ecossistema Facillit.',
}

async function getData(search: string = '', category: string = '') {
  let filter = `_type == "post"`
  if (search) filter += ` && (title match "*${search}*" || body[].children[].text match "*${search}*")`
  if (category) filter += ` && $category in categories[]->title`

  const query = `{
    "posts": *[${filter}] | order(publishedAt desc) {
      title,
      slug,
      excerpt,
      mainImage,
      publishedAt,
      "categories": categories[]->{title},
      "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180 ) + 1
    },
    "featured": *[_type == "post"][0] {
      title, slug, excerpt, mainImage, publishedAt, "categories": categories[]->{title}
    },
    "categories": *[_type == "category"] {title, _id}
  }`

  return client.fetch(query, { category })
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ q: string, cat: string }> }) {
  const { q, cat } = await searchParams
  const data = await getData(q, cat)
  const { posts, featured, categories } = data

  const listPosts = posts.filter((p: any) => p.slug.current !== featured?.slug.current)

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      
      {/* --- HERO SECTION PREMIUM --- */}
      <div className="relative bg-[#0a0a0a] overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-purple/30 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-green/20 rounded-full blur-[100px]"></div>
            <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-[0.03]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                {/* Coluna Texto */}
                <div className="flex-1 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/5 border border-white/10 text-brand-green text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-sm">
                        <Sparkles size={14} /> Central de Conhecimento
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
                        Explore o futuro da <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-green">Educação</span>
                    </h1>
                    <p className="text-lg text-gray-400 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                        Descubra estratégias inovadoras, tutoriais práticos e insights sobre tecnologia para transformar a gestão escolar e corporativa.
                    </p>
                    
                    {/* Botão CTA Hero */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <Link href="#latest" className="px-8 py-4 bg-brand-gradient text-white rounded-xl font-bold shadow-lg shadow-brand-purple/25 hover:scale-105 transition-transform flex items-center justify-center gap-2">
                            Começar a Ler <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>

                {/* Coluna Visual (Card Flutuante 3D effect) */}
                <div className="flex-1 w-full max-w-lg lg:max-w-none relative hidden md:block">
                    <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                        {featured?.mainImage ? (
                             <div className="relative h-64 lg:h-80 w-full rounded-2xl overflow-hidden mb-4">
                                <Image src={urlFor(featured.mainImage).url()} alt="Destaque" fill className="object-cover" />
                             </div>
                        ) : (
                            <div className="h-64 lg:h-80 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl mb-4"></div>
                        )}
                        <div className="space-y-3">
                            <div className="h-4 w-1/3 bg-white/10 rounded-full"></div>
                            <div className="h-8 w-3/4 bg-white/20 rounded-full"></div>
                            <div className="h-4 w-full bg-white/5 rounded-full"></div>
                        </div>
                    </div>
                    {/* Elemento Decorativo Atrás */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-brand-purple to-brand-green rounded-[2rem] blur-xl opacity-30 -z-10"></div>
                </div>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl -mt-8 relative z-20">
        {/* --- NAVEGAÇÃO STICKY --- */}
        <BlogControls categories={categories} />

        <div className="flex flex-col lg:flex-row gap-12 mt-12" id="latest">
            
            {/* Lista de Posts */}
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-brand-green/10 text-brand-green rounded-lg">
                        <TrendingUp size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Últimas Publicações</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {listPosts.length > 0 ? listPosts.map((post: any) => (
                        <Link href={`/recursos/blog/${post.slug.current}`} key={post.slug.current} className="group flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-brand-purple/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full">
                            <div className="relative h-56 w-full overflow-hidden">
                                {post.mainImage && (
                                    <Image
                                        src={urlFor(post.mainImage).width(600).height(400).url()}
                                        alt={post.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                                {post.categories?.[0] && (
                                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-brand-purple shadow-sm">
                                        {post.categories[0].title}
                                    </div>
                                )}
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3 font-medium">
                                    <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(post.publishedAt).toLocaleDateString('pt-BR')}</span>
                                    <span className="flex items-center gap-1.5"><Clock size={12} /> {post.estimatedReadingTime} min leitura</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-purple transition-colors line-clamp-2 leading-tight">
                                    {post.title}
                                </h2>
                                <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">
                                    {post.excerpt}
                                </p>
                                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <span className="text-brand-purple font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                                        Ler artigo <ArrowRight size={14} />
                                    </span>
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-purple group-hover:text-white transition-all">
                                        <ChevronRight size={14} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )) : (
                        <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900">Nenhum resultado encontrado</h3>
                            <p className="text-gray-500 text-sm mt-1">Tente buscar por outros termos ou limpar os filtros.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-80 space-y-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-28">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 bg-brand-purple rounded-full"></span> Newsletter
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">Receba conteúdos exclusivos diretamente no seu e-mail.</p>
                    <NewsletterBox simple={true} />
                </div>
            </aside>

        </div>
      </div>
    </div>
  )
}