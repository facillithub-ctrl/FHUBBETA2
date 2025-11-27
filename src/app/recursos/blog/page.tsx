import { client, urlFor } from '@/lib/sanity'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { ArrowRight, Calendar, Clock, Search, Filter, Sparkles, AlertCircle, Bookmark, Share2 } from 'lucide-react'
import { BlogControls } from '@/components/blog/BlogControls'
import { NewsletterBox } from '@/components/blog/NewsletterBox'

// --- CONFIGURAÇÕES DA PÁGINA ---
export const metadata: Metadata = {
  title: 'Facillit Magazine | Inovação e Educação',
  description: 'Artigos, estratégias e tendências do futuro da educação.',
}

// Força atualização constante para garantir que os filtros funcionem na hora
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// --- BUSCA DE DADOS (GROQ SIMPLIFICADO & ROBUSTO) ---
async function getBlogData(search: string = '', category: string = '') {
  // Tratamento de segurança para os parâmetros
  const searchQuery = search ? `*${search}*` : "";
  
  // 1. Query Principal: Traz TODOS os posts que batem com os filtros.
  // Sem exclusões complexas. Se bateu com a busca/categoria, aparece.
  const query = `{
    "posts": *[_type == "post" 
      && ($search == "" || title match $search || body[].children[].text match $search)
      && ($category == "" || $category in categories[]->title)
    ] | order(publishedAt desc) {
      _id,
      title, 
      slug, 
      excerpt, 
      mainImage, 
      publishedAt,
      "categories": categories[]->{title},
      "author": author->{name, image, role},
      "estimatedReadingTime": coalesce(round(length(pt::text(body)) / 5 / 180 ), 5) + 1
    },
    
    "categories": *[_type == "category"] | order(title asc) {title, _id},

    // 2. Query Hero: Sempre pega o último post global, independente de filtros.
    "heroPost": *[_type == "post"] | order(publishedAt desc)[0] {
        title, slug, excerpt, mainImage, publishedAt, "categories": categories[]->{title}, "author": author->{name, image}
    }
  }`

  const params = {
    search: searchQuery,
    category: category || ""
  };

  try {
    return await client.fetch(query, params);
  } catch (error) {
    console.error("ERRO CRÍTICO NO SANITY:", error);
    return null;
  }
}

// --- COMPONENTE DA PÁGINA ---
export default async function BlogPage({ searchParams }: { searchParams: Promise<{ q: string, cat: string }> }) {
  const { q, cat } = await searchParams;
  const data = await getBlogData(q, cat);

  // Fallback de Segurança (Tela de Erro)
  if (!data) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-red-100">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Conexão Interrompida</h1>
                <p className="text-gray-500 mb-6">Não conseguimos carregar os artigos no momento. Verifique sua conexão.</p>
                <Link href="/" className="btn-primary w-full block py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-colors">
                    Voltar para Home
                </Link>
            </div>
        </div>
    )
  }

  const { posts, categories, heroPost } = data;
  const isFiltering = !!q || !!cat;

  // Lógica de Exibição: O Hero só aparece na "Home do Blog" (sem filtros)
  const showHero = !isFiltering && heroPost;

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-inter text-gray-900 selection:bg-brand-purple selection:text-white">
      
      {/* --- HERO SECTION (Apenas sem filtros) --- */}
      {showHero && (
        <section className="relative pt-32 pb-12 lg:pt-40 lg:pb-20 overflow-hidden bg-white border-b border-gray-100">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-purple-50 to-transparent rounded-full blur-[100px] opacity-60 -mr-40 -mt-40 pointer-events-none" />
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    
                    {/* Conteúdo Texto */}
                    <div className="flex-1 space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-xs font-bold uppercase tracking-widest text-gray-500">
                            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
                            Facillit Magazine
                        </div>
                        
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[1.05] text-gray-900">
                            Explore o <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-green">Futuro do Ensino</span>
                        </h1>
                        
                        <p className="text-xl text-gray-500 max-w-lg leading-relaxed">
                            Artigos profundos, tutoriais práticos e insights exclusivos para transformar sua jornada educacional.
                        </p>

                        <div className="bg-white p-2 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 max-w-md">
                            <BlogControls categories={categories} simpleMode={true} />
                        </div>
                    </div>

                    {/* Card Hero 3D */}
                    <div className="flex-1 w-full max-w-xl perspective-1000 group">
                         <Link href={`/recursos/blog/${heroPost.slug.current}`}>
                            <div className="relative h-[460px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 transform group-hover:rotate-1 group-hover:scale-[1.02] border-4 border-white ring-1 ring-gray-100">
                                {heroPost.mainImage && (
                                    <Image 
                                        src={urlFor(heroPost.mainImage).width(1000).url()} 
                                        alt={heroPost.title} 
                                        fill 
                                        className="object-cover"
                                        priority
                                    />
                                )}
                                {/* Overlay Gradiente */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90" />
                                
                                <div className="absolute bottom-0 left-0 p-8 w-full">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="bg-white text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">
                                            Destaque Principal
                                        </span>
                                        {heroPost.categories?.[0] && (
                                            <span className="text-gray-300 text-xs font-bold border-l border-white/30 pl-3 uppercase tracking-wider">
                                                {heroPost.categories[0].title}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-white text-3xl font-bold leading-tight mb-3 group-hover:text-brand-green transition-colors">
                                        {heroPost.title}
                                    </h2>
                                    <div className="flex items-center gap-3 mt-4">
                                        <div className="flex -space-x-2">
                                            {heroPost.author?.image ? (
                                                <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden relative">
                                                     <Image src={urlFor(heroPost.author.image).width(50).url()} fill alt="Author" className="object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full border-2 border-white bg-brand-purple flex items-center justify-center text-white text-xs font-bold">F</div>
                                            )}
                                        </div>
                                        <span className="text-gray-300 text-sm font-medium">Ler artigo completo</span>
                                        <ArrowRight className="text-white w-4 h-4 ml-auto group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </div>
                            </div>
                         </Link>
                    </div>
                </div>
            </div>
        </section>
      )}

      {/* --- HEADER DE FILTROS (Só aparece filtrando) --- */}
      {isFiltering && (
        <div className="bg-white pt-32 pb-8 border-b border-gray-200 shadow-sm sticky top-0 z-20">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Filter size={12}/> Filtrando resultados
                    </span>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 mt-1">
                        {cat ? <span className="text-brand-purple">#{cat}</span> : <span>Busca: "{q}"</span>}
                    </h1>
                </div>
                <Link href="/recursos/blog" className="px-6 py-2.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded-xl text-sm font-bold text-gray-600 transition-colors flex items-center gap-2">
                    Limpar Filtros
                </Link>
            </div>
        </div>
      )}

      {/* --- FEED DE CONTEÚDO --- */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
            
            {/* COLUNA PRINCIPAL (Feed) */}
            <div className="flex-1">
                
                {/* Categorias Mobile (Sticky) */}
                <div className="lg:hidden sticky top-20 z-10 bg-[#FAFAFA]/95 backdrop-blur-md py-4 mb-6 -mx-4 px-4 border-b border-gray-200">
                     <BlogControls categories={categories} onlyCategories={true} />
                </div>

                {/* Grid de Posts */}
                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {posts.map((post: any) => (
                            <Link href={`/recursos/blog/${post.slug.current}`} key={post._id} className="group flex flex-col h-full">
                                <article className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 h-full flex flex-col relative">
                                    
                                    {/* Imagem */}
                                    <div className="relative h-64 w-full overflow-hidden bg-gray-100">
                                        {post.mainImage ? (
                                            <Image 
                                                src={urlFor(post.mainImage).width(800).height(500).url()} 
                                                alt={post.title} 
                                                fill 
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <Sparkles size={32} />
                                            </div>
                                        )}
                                        {/* Overlay Hover */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                                        
                                        {/* Badge Categoria */}
                                        {post.categories?.[0] && (
                                            <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-gray-900 shadow-sm">
                                                {post.categories[0].title}
                                            </div>
                                        )}
                                    </div>

                                    {/* Conteúdo */}
                                    <div className="p-8 flex-1 flex flex-col">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
                                                <Calendar size={14} className="text-brand-purple"/>
                                                {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
                                            </div>
                                            <div className="text-xs font-bold text-gray-300 flex items-center gap-1">
                                                <Clock size={14}/> {post.estimatedReadingTime} min
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-brand-purple transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        
                                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                                            {post.excerpt}
                                        </p>

                                        {/* Footer do Card */}
                                        <div className="pt-5 border-t border-gray-50 flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-2">
                                                {post.author?.image ? (
                                                    <Image src={urlFor(post.author.image).width(32).url()} width={24} height={24} alt="Author" className="rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-gray-100"></div>
                                                )}
                                                <span className="text-xs font-bold text-gray-600">{post.author?.name || 'Equipe Facillit'}</span>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand-purple group-hover:text-white transition-all">
                                                <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                ) : (
                    // Estado Vazio (Empty State)
                    <div className="bg-white border border-gray-100 rounded-[2rem] p-16 text-center shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="text-gray-300" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhum resultado</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-8">
                            Não encontramos posts com o termo <strong>"{q}"</strong> ou na categoria selecionada.
                        </p>
                        <Link href="/recursos/blog" className="inline-flex items-center gap-2 px-8 py-3 bg-brand-purple text-white rounded-full font-bold hover:bg-brand-dark transition-all">
                            Ver todos os artigos
                        </Link>
                    </div>
                )}
            </div>

            {/* SIDEBAR (Desktop) */}
            <aside className="hidden lg:block w-80 shrink-0">
                <div className="sticky top-32 space-y-8">
                    
                    {/* Menu de Categorias */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-4 pb-3 border-b border-gray-50 flex items-center gap-2">
                            <Filter size={16} className="text-brand-purple"/> Filtrar por Tópico
                        </h4>
                        <nav className="flex flex-col gap-1">
                            <Link 
                                href="/recursos/blog"
                                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${!cat && !q ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <span className="font-bold">Todos os Artigos</span>
                                {!cat && !q && <div className="w-2 h-2 rounded-full bg-brand-green"></div>}
                            </Link>
                            {categories.map((c:any) => (
                                <Link 
                                    key={c._id}
                                    href={`/recursos/blog?cat=${c.title}`}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${cat === c.title ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20' : 'text-gray-600 hover:bg-purple-50 hover:text-brand-purple'}`}
                                >
                                    {c.title}
                                    {cat === c.title && <ArrowRight size={14}/>}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Widget Newsletter */}
                    <div className="bg-[#0A0A0A] p-8 rounded-[2rem] text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-brand-purple/40 rounded-full blur-[60px] -mt-10 -mr-10 pointer-events-none group-hover:bg-brand-purple/60 transition-colors"></div>
                        <Sparkles className="text-brand-green mb-4" size={24} />
                        <h4 className="font-bold text-xl mb-2 relative z-10">Facillit Weekly</h4>
                        <p className="text-gray-400 text-sm mb-6 relative z-10 leading-relaxed">
                            Receba as melhores dicas de estudo e produtividade diretamente no seu e-mail.
                        </p>
                        <div className="relative z-10">
                            <NewsletterBox simple={true} darkTheme={true} />
                        </div>
                    </div>

                </div>
            </aside>

        </div>
      </div>
    </div>
  )
}