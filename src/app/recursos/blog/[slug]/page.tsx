import { client, urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import { components } from '@/components/blog/PortableTextComponents'
import { NewsletterBox } from '@/components/blog/NewsletterBox'
import { CommentsSection } from '@/components/blog/CommentsSection'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { 
    ArrowLeft, Calendar, Clock, Linkedin, Twitter, Share2, 
    Bookmark, ChevronRight, PlayCircle, MessageCircle,
    ArrowRight
} from 'lucide-react'

// --- CONFIGURAÇÕES ---
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// --- DADOS ---
async function getPost(slug: string) {
    if (!slug) return null
    
    const query = `*[_type == "post" && slug.current == $slug][0]{
        title, excerpt, body, publishedAt, mainImage,
        categories[]->{title},
        author->{
            name, role, image, bio, 
            "socials": { "linkedin": linkedin, "twitter": twitter }
        },
        "estimatedReadingTime": coalesce(round(length(pt::text(body)) / 5 / 180 ), 5) + 1,
        "related": *[_type == "post" && slug.current != $slug][0...2]{title, slug, mainImage, excerpt}
    }`
    
    try {
        return await client.fetch(query, { slug })
    } catch (error) {
        console.error("Erro slug:", error);
        return null;
    }
}

// --- METADATA ---
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPost(slug)
    if (!post) return { title: 'Artigo não encontrado' }
    return { title: post.title, description: post.excerpt }
}

// --- PÁGINA ---
export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug)

  if (!post) notFound()

  return (
    <div className="min-h-screen bg-white font-inter text-gray-900 selection:bg-brand-purple selection:text-white">
      
      {/* HEADER DE NAVEGAÇÃO (Clean & Sticky) */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-5xl">
            <Link href="/recursos/blog" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform text-brand-purple"/>
                <span className="hidden sm:inline">Blog</span>
            </Link>
            
            <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:block">
                    {post.estimatedReadingTime} min de leitura
                </span>
                <div className="h-4 w-px bg-gray-200 hidden md:block"></div>
                <button className="p-2 text-gray-400 hover:text-brand-purple transition-colors" aria-label="Compartilhar">
                    <Share2 size={18}/>
                </button>
                <Link href="#comentarios" className="p-2 text-gray-400 hover:text-brand-purple transition-colors flex items-center gap-1" aria-label="Comentários">
                    <MessageCircle size={18}/>
                </Link>
            </div>
        </div>
        {/* Barra de Progresso Visual (Opcional - CSS puro para efeito) */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-brand-purple to-brand-green w-full opacity-0 md:opacity-100 animate-progress"></div>
      </header>

      <article className="container mx-auto px-4 max-w-5xl py-12 md:py-20">
        
        {/* --- HERO DO ARTIGO --- */}
        <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                {post.categories?.map((cat: any) => (
                    <span key={cat.title} className="px-4 py-1.5 rounded-full border border-gray-200 text-xs font-bold uppercase tracking-widest text-gray-500 bg-gray-50">
                        {cat.title}
                    </span>
                ))}
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-8 leading-[1.05] tracking-tight">
                {post.title}
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-500 leading-relaxed font-medium max-w-2xl mx-auto mb-10">
                {post.excerpt}
            </p>

            {/* Autor Hero */}
            <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-brand-purple to-brand-green">
                        <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white relative">
                            {post.author?.image ? (
                                <Image src={urlFor(post.author.image).width(100).url()} fill alt={post.author.name} className="object-cover" />
                            ) : <div className="w-full h-full bg-gray-200" />}
                        </div>
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-gray-900">{post.author?.name}</p>
                        <p className="text-xs text-gray-500">{new Date(post.publishedAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* --- IMAGEM PRINCIPAL (Full Width Rounded) --- */}
        {post.mainImage && (
            <div className="relative w-full aspect-[21/9] rounded-[2rem] overflow-hidden shadow-2xl mb-20 bg-gray-100 ring-1 ring-black/5">
                <Image 
                    src={urlFor(post.mainImage).width(1400).url()} 
                    alt={post.title} 
                    fill 
                    className="object-cover"
                    priority 
                />
            </div>
        )}

        {/* --- LAYOUT DE CONTEÚDO (Com Sidebar Lateral Flutuante) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative">
            
            {/* Esquerda: Actions (Desktop Only) */}
            <div className="hidden lg:block lg:col-span-1 relative">
                <div className="sticky top-32 flex flex-col gap-6 items-center">
                    <button className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-brand-purple hover:scale-110 transition-all tooltip" data-tip="Salvar">
                        <Bookmark size={18} />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-[#0077b5] hover:scale-110 transition-all tooltip" data-tip="Linkedin">
                        <Linkedin size={18} />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-black hover:scale-110 transition-all tooltip" data-tip="Twitter">
                        <Twitter size={18} />
                    </button>
                    <div className="w-px h-20 bg-gray-200 mt-4"></div>
                </div>
            </div>

            {/* Centro: Texto Rico */}
            <div className="lg:col-span-8">
                <div className="prose prose-lg md:prose-xl prose-slate max-w-none 
                    prose-headings:font-black prose-headings:tracking-tight prose-headings:text-gray-900 
                    prose-p:text-gray-600 prose-p:leading-8 prose-p:font-normal
                    prose-a:text-brand-purple prose-a:font-bold prose-a:no-underline hover:prose-a:bg-brand-purple/10 hover:prose-a:rounded-sm transition-colors
                    prose-img:rounded-3xl prose-img:shadow-lg prose-img:my-10
                    prose-blockquote:border-l-4 prose-blockquote:border-brand-purple prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-2xl prose-blockquote:font-medium prose-blockquote:text-gray-800
                    first-letter:text-5xl first-letter:font-black first-letter:text-brand-purple first-letter:mr-3 first-letter:float-left">
                    <PortableText value={post.body} components={components} />
                </div>

                {/* Tags ao final do post */}
                <div className="mt-16 pt-8 border-t border-gray-100 flex flex-wrap gap-2">
                    <span className="text-sm font-bold text-gray-400 mr-2">Tags:</span>
                    {post.categories?.map((cat: any) => (
                        <Link href={`/recursos/blog?cat=${cat.title}`} key={cat.title} className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm rounded-md transition-colors">
                            #{cat.title}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Direita: Autor Card (Sticky) */}
            <div className="lg:col-span-3 hidden lg:block">
                <div className="sticky top-32">
                    <div className="bg-[#FAFAFA] rounded-2xl p-6 border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Sobre o Autor</p>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-white border border-gray-200">
                                {post.author?.image ? (
                                    <Image src={urlFor(post.author.image).width(100).url()} width={48} height={48} alt="" className="object-cover h-full w-full" />
                                ) : <div className="w-full h-full bg-brand-purple" />}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">{post.author?.name}</h4>
                                <p className="text-xs text-brand-purple font-medium">{post.author?.role}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed mb-4">
                            {post.author?.bio || "Criando conteúdo para transformar a educação."}
                        </p>
                        <button className="w-full py-2 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                            Ver Perfil Completo
                        </button>
                    </div>
                </div>
            </div>

        </div>
      </article>

      {/* --- SEÇÃO DE COMENTÁRIOS E NEWSLETTER --- */}
      <div className="bg-gray-50 border-t border-gray-200 py-16" id="comentarios">
        <div className="container mx-auto px-4 max-w-4xl space-y-16">
            <NewsletterBox />
            <CommentsSection postSlug={slug} />
        </div>
      </div>

      {/* --- LEIA MAIS (Footer Navigation) --- */}
      {post.related?.length > 0 && (
        <div className="bg-white border-t border-gray-200 py-20">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl font-black text-gray-900">Continue Lendo</h3>
                    <Link href="/recursos/blog" className="text-sm font-bold text-brand-purple flex items-center gap-1 hover:gap-2 transition-all">
                        Ver tudo <ArrowRight size={16}/>
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {post.related.map((item: any) => (
                        <Link href={`/recursos/blog/${item.slug.current}`} key={item.slug.current} className="group flex gap-6 items-start hover:bg-gray-50 p-4 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
                            <div className="w-32 h-24 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 relative">
                                {item.mainImage && <Image src={urlFor(item.mainImage).width(300).url()} fill alt={item.title} className="object-cover" />}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-gray-900 group-hover:text-brand-purple transition-colors mb-2 leading-snug">
                                    {item.title}
                                </h4>
                                <p className="text-sm text-gray-500 line-clamp-2">{item.excerpt}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  )
}