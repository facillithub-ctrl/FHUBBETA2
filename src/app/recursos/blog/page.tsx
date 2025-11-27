import { client, urlFor } from '@/lib/sanity'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { BlogControls } from '@/components/blog/BlogControls'

// --- CONFIGURAÇÕES ---
export const metadata: Metadata = {
  title: 'Facillit Journal | Conhecimento',
  description: 'Aprofunde-se no universo da educação e tecnologia.',
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// --- BUSCA DE DADOS (Blindada) ---
async function getBlogData(search: string = '', category: string = '') {
  const searchQuery = search ? `*${search}*` : "";
  
  const query = `{
    "posts": *[_type == "post" 
      && ($search == "" || title match $search || body[].children[].text match $search)
      && ($category == "" || $category in categories[]->title)
    ] | order(publishedAt desc) {
      _id, title, slug, excerpt, mainImage, publishedAt,
      "categories": categories[]->{title},
      "author": author->{name, image, role},
      "estimatedReadingTime": coalesce(round(length(pt::text(body)) / 5 / 180 ), 5) + 1
    },
    
    "categories": *[_type == "category"] | order(title asc) {title, _id},

    "heroPost": *[_type == "post"] | order(publishedAt desc)[0] {
        title, slug, excerpt, mainImage, publishedAt, "categories": categories[]->{title}, "author": author->{name, image}
    }
  }`

  try {
    return await client.fetch(query, { search: searchQuery, category: category || "" });
  } catch (error) {
    console.error("SANITY ERROR:", error);
    return null;
  }
}

// --- PÁGINA ---
export default async function BlogPage({ searchParams }: { searchParams: Promise<{ q: string, cat: string }> }) {
  const { q, cat } = await searchParams;
  const data = await getBlogData(q, cat);

  if (!data) return <div className="p-20 text-center text-gray-500">Serviço indisponível no momento.</div>;

  const { posts, categories, heroPost } = data;
  const isFiltering = !!q || !!cat;
  
  // Se estiver filtrando, escondemos o Hero para focar na busca
  const showHero = !isFiltering && heroPost;
  // Na lista, removemos o hero para não duplicar (apenas visualmente) se não houver filtro
  const listPosts = isFiltering ? posts : posts.filter((p:any) => p._id !== heroPost?._id);

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-inter text-gray-900 selection:bg-black selection:text-white">
      
      {/* HEADER MINIMALISTA */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-30">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="text-xl font-black tracking-tighter">
                FACILLIT<span className="text-gray-300">.</span>
            </Link>
            <div className="w-64 hidden md:block">
                <BlogControls categories={categories} simpleMode={true} />
            </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-6xl">
        
        {/* HERO SECTION (EDITORIAL STYLE) */}
        {showHero && (
            <section className="mb-24 group">
                <Link href={`/recursos/blog/${heroPost.slug.current}`} className="block">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="order-2 lg:order-1 space-y-6">
                            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                                <span className="text-brand-purple">Destaque</span>
                                <span>•</span>
                                <span>{new Date(heroPost.publishedAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <h2 className="text-4xl lg:text-6xl font-black leading-[1.05] group-hover:text-gray-600 transition-colors">
                                {heroPost.title}
                            </h2>
                            <p className="text-lg text-gray-500 leading-relaxed max-w-md">
                                {heroPost.excerpt}
                            </p>
                            <div className="pt-4 flex items-center gap-3">
                                {heroPost.author?.image && (
                                    <Image src={urlFor(heroPost.author.image).width(40).url()} width={40} height={40} alt="" className="rounded-full grayscale group-hover:grayscale-0 transition-all" />
                                )}
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{heroPost.author?.name}</p>
                                    <p className="text-xs text-gray-400">Ler artigo <ArrowRight size={10} className="inline"/></p>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 relative aspect-[4/3] lg:aspect-square rounded-none overflow-hidden bg-gray-100">
                            {heroPost.mainImage && (
                                <Image 
                                    src={urlFor(heroPost.mainImage).width(800).url()} 
                                    alt={heroPost.title} 
                                    fill 
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    priority
                                />
                            )}
                        </div>
                    </div>
                </Link>
            </section>
        )}

        {/* FEED & SIDEBAR */}
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 border-t border-gray-100 pt-16">
            
            {/* FEED DE LISTA (Esquerda) */}
            <div className="flex-1">
                <div className="flex items-center justify-between mb-12">
                    <h3 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        {isFiltering ? (
                            // CORREÇÃO AQUI: Trocado " por &quot; para evitar erro de build
                            <>Resultados: <span className="text-gray-400">&quot;{q || cat}&quot;</span></>
                        ) : 'Últimas Publicações'}
                    </h3>
                    <Link href="/recursos/blog" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-brand-purple transition-colors">
                        Ver tudo
                    </Link>
                </div>

                <div className="space-y-16">
                    {listPosts.length > 0 ? listPosts.map((post: any) => (
                        <Link href={`/recursos/blog/${post.slug.current}`} key={post._id} className="group block">
                            <article className="flex flex-col md:flex-row gap-8">
                                <div className="w-full md:w-1/3 aspect-[3/2] bg-gray-100 overflow-hidden relative">
                                    {post.mainImage && (
                                        <Image 
                                            src={urlFor(post.mainImage).width(400).url()} 
                                            alt={post.title} 
                                            fill 
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-center py-2">
                                    <div className="flex items-center gap-3 mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                                        {post.categories?.[0] && <span className="text-brand-purple">{post.categories[0].title}</span>}
                                        <span>{new Date(post.publishedAt).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <h4 className="text-2xl font-bold text-gray-900 mb-3 leading-tight group-hover:underline decoration-2 underline-offset-4 decoration-brand-purple">
                                        {post.title}
                                    </h4>
                                    <p className="text-gray-500 leading-relaxed mb-4 line-clamp-2">
                                        {post.excerpt}
                                    </p>
                                    <span className="text-sm font-bold flex items-center gap-2 text-gray-900 mt-auto">
                                        Ler agora <ChevronRight size={14} className="text-brand-purple"/>
                                    </span>
                                </div>
                            </article>
                        </Link>
                    )) : (
                        <div className="py-20 text-center border-y border-gray-100">
                            <p className="text-gray-400">Nenhum artigo encontrado para sua busca.</p>
                            <Link href="/recursos/blog" className="text-brand-purple font-bold mt-2 inline-block">Limpar filtros</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* SIDEBAR (Direita) */}
            <aside className="w-full lg:w-64 space-y-12">
                
                {/* Categorias */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">Tópicos</h4>
                    <ul className="space-y-3">
                        <li>
                            <Link href="/recursos/blog" className={`text-sm font-medium transition-colors ${!cat ? 'text-brand-purple font-bold' : 'text-gray-500 hover:text-gray-900'}`}>
                                Todos
                            </Link>
                        </li>
                        {categories.map((c:any) => (
                            <li key={c._id}>
                                <Link href={`/recursos/blog?cat=${c.title}`} className={`text-sm font-medium transition-colors flex items-center justify-between ${cat === c.title ? 'text-brand-purple font-bold' : 'text-gray-500 hover:text-gray-900'}`}>
                                    {c.title}
                                    {cat === c.title && <div className="w-1.5 h-1.5 bg-brand-purple rounded-full"/>}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Newsletter Box Custom */}
                <div className="bg-gray-900 text-white p-6 text-center">
                    <h4 className="font-bold text-lg mb-2">Newsletter</h4>
                    <p className="text-gray-400 text-xs mb-4">Receba novidades semanais.</p>
                    <div className="opacity-90">
                        {/* Reutilizando o componente mas com tema dark forçado via container */}
                        <div className="[&_input]:bg-gray-800 [&_input]:border-gray-700 [&_input]:text-white [&_button]:bg-white [&_button]:text-black">
                             <BlogControls categories={[]} simpleMode={true} /> 
                        </div>
                    </div>
                </div>

            </aside>

        </div>
      </main>
    </div>
  )
}