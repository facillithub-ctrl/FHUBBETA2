import { client, urlFor } from '@/lib/sanity'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { ArrowLeft, Calendar, Clock, Filter, Search, CheckCircle } from 'lucide-react'
import { BlogControls } from '@/components/blog/BlogControls'

export const metadata: Metadata = {
  title: 'Explorar Artigos | Facillit Hub',
  description: 'Navegue por todo o nosso conteúdo educacional.',
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getAllPosts(search: string = '', category: string = '') {
  const searchQuery = search ? `*${search}*` : "";
  
  // Query busca TUDO (sem limite de quantidade)
  const query = `{
    "posts": *[_type == "post" 
      && ($search == "" || title match $search || body[].children[].text match $search)
      && ($category == "" || $category in categories[]->title)
    ] | order(publishedAt desc) {
      _id, title, slug, excerpt, mainImage, publishedAt,
      "categories": categories[]->{title},
      "author": author->{name, image, isOfficial},
      "estimatedReadingTime": coalesce(round(length(pt::text(body)) / 5 / 180 ), 5) + 1
    },
    
    "categories": *[_type == "category"] | order(title asc) {title, _id}
  }`

  try {
    return await client.fetch(query, { search: searchQuery, category: category || "" });
  } catch (error) {
    console.error("SANITY ERROR:", error);
    return null;
  }
}

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q: string, cat: string }> }) {
  const { q, cat } = await searchParams;
  const data = await getAllPosts(q, cat);

  if (!data) return <div className="min-h-screen flex items-center justify-center text-gray-500">Carregando...</div>;

  const { posts, categories } = data;

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-inter text-gray-900 selection:bg-brand-purple/20 selection:text-brand-purple">
      
      {/* HEADER DA PÁGINA */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/recursos/blog" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-purple transition-colors">
                <ArrowLeft size={18} /> Voltar para o Início
            </Link>
            <h1 className="text-lg font-black text-gray-900 hidden md:block">Explorar Conteúdo</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-7xl">
        
        {/* TÍTULO E CONTROLES DE FILTRO */}
        <div className="mb-12 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
                Todos os Artigos
            </h2>
            
            {/* Barra de Busca e Categorias */}
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex flex-col gap-6">
                    {/* Componente de Busca/Filtro Existente */}
                    <BlogControls categories={categories} simpleMode={false} />
                    
                    {/* Lista Rápida de Categorias */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-50">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider py-2 mr-2">Filtrar por:</span>
                        <Link href="/recursos/blog/explorar" className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${!cat ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                            Tudo
                        </Link>
                        {categories.map((c: any) => (
                            <Link key={c._id} href={`/recursos/blog/explorar?cat=${c.title}`} className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${cat === c.title ? 'bg-brand-purple text-white border-brand-purple' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-brand-purple/30 hover:text-brand-purple'}`}>
                                {c.title}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* RESULTADOS */}
        {posts.length > 0 ? (
            <>
                <div className="mb-6 text-sm font-bold text-gray-400">
                    Mostrando {posts.length} {posts.length === 1 ? 'resultado' : 'resultados'}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post: any) => (
                        <Link href={`/recursos/blog/${post.slug.current}`} key={post._id} className="group flex flex-col h-full">
                            <article className="bg-white rounded-[2rem] p-3 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                                
                                {/* Imagem */}
                                <div className="relative h-48 w-full rounded-[1.5rem] overflow-hidden bg-gray-100 mb-4">
                                    {post.mainImage ? (
                                        <Image 
                                            src={urlFor(post.mainImage).width(500).height(350).url()} 
                                            alt={post.title} 
                                            fill 
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                            <Search size={24} />
                                        </div>
                                    )}
                                    {post.categories?.[0] && (
                                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-gray-900 shadow-sm">
                                            {post.categories[0].title}
                                        </div>
                                    )}
                                </div>

                                {/* Conteúdo */}
                                <div className="px-2 pb-2 flex-1 flex flex-col">
                                    <div className="flex items-center gap-3 mb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                        <span className="flex items-center gap-1"><Calendar size={10}/> {new Date(post.publishedAt).toLocaleDateString('pt-BR')}</span>
                                        <span className="flex items-center gap-1"><Clock size={10}/> {post.estimatedReadingTime} min</span>
                                    </div>

                                    <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug group-hover:text-brand-purple transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    
                                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-3 mb-4 flex-1">
                                        {post.excerpt}
                                    </p>

                                    <div className="flex items-center gap-2 pt-4 border-t border-gray-50 mt-auto">
                                        {post.author?.image ? (
                                            <Image src={urlFor(post.author.image).width(24).url()} width={20} height={20} alt="" className="rounded-full" />
                                        ) : <div className="w-5 h-5 rounded-full bg-gray-100"/>}
                                        <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                                            {post.author?.name}
                                            {/* VERIFICADO VERDE */}
                                            {post.author?.isOfficial && <CheckCircle size={12} className="text-green-500" fill="transparent" />}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            </>
        ) : (
            <div className="py-32 text-center bg-white rounded-[2rem] border border-gray-100">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Filter className="text-gray-300" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum resultado</h3>
                <p className="text-gray-500 max-w-xs mx-auto mb-6">
                    Não encontramos artigos para "{q || cat}". Tente limpar os filtros.
                </p>
                <Link href="/recursos/blog/explorar" className="text-brand-purple font-bold hover:underline">
                    Limpar Filtros
                </Link>
            </div>
        )}

      </main>
    </div>
  )
}