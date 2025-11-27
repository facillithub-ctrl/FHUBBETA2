import { client, urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import { components } from '@/components/blog/PortableTextComponents'
import { NewsletterBox } from '@/components/blog/NewsletterBox' // Certifique-se de ter movido para essa pasta
import { CommentsSection } from '@/components/blog/CommentsSection' // Certifique-se de ter movido
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { ChevronRight, Calendar, User, Clock, Share2 } from 'lucide-react'

// Busca dados para SEO e Conteúdo
async function getPost(slug: string) {
  return client.fetch(`
    *[_type == "post" && slug.current == $slug][0]{
      title,
      excerpt,
      body,
      publishedAt,
      mainImage,
      categories[]->{title},
      "authorName": author->name,
      "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180 ) + 1,
      "related": *[_type == "post" && slug.current != $slug][0...3]{
        title, 
        slug, 
        mainImage,
        publishedAt
      }
    }
  `, { slug })
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Post não encontrado' }

  const ogImage = post.mainImage ? urlFor(post.mainImage).width(1200).height(630).url() : '/default-og.png'

  return {
    title: `${post.title} | Blog Facillit`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: ['Equipe Facillit'],
      images: [ogImage],
    },
  }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) notFound()

  // SEO Estruturado (JSON-LD) - O "Segredo" do SEO Impecável
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: post.mainImage ? urlFor(post.mainImage).url() : '',
    datePublished: post.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'Facillit Hub',
    },
    description: post.excerpt,
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Script JSON-LD para Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Progress Bar (Opcional, pode ser adicionado depois) */}

      <div className="bg-slate-50 border-b border-gray-200">
        <div className="container mx-auto px-4 max-w-4xl pt-32 pb-12">
            
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
                <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                <ChevronRight size={14} />
                <Link href="/recursos/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
                <ChevronRight size={14} />
                <span className="text-slate-800 font-medium truncate">{post.title}</span>
            </nav>

            {/* Categorias */}
            <div className="flex flex-wrap gap-2 mb-6">
                {post.categories?.map((c:any) => (
                    <span key={c.title} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {c.title}
                    </span>
                ))}
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-8 leading-tight">
                {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-slate-500 text-sm border-t border-gray-200 pt-6">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                        FH
                    </div>
                    <div>
                        <p className="text-slate-900 font-bold">Equipe Facillit</p>
                        <p className="text-xs">Editor Chefe</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex items-center gap-1">
                    <Clock size={16} />
                    {post.estimatedReadingTime} min de leitura
                </div>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl py-12">
        {/* Imagem Principal */}
        {post.mainImage && (
            <div className="relative w-full h-[300px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl mb-12 transform -translate-y-6 md:-translate-y-12">
                <Image 
                    src={urlFor(post.mainImage).url()} 
                    alt={post.title} 
                    fill 
                    className="object-cover" 
                    priority
                />
            </div>
        )}

        {/* Corpo do Texto */}
        <div className="prose prose-lg prose-slate prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-700 max-w-none text-slate-700 leading-8">
            <PortableText value={post.body} components={components} />
        </div>
        {/* Author Box Premium */}
        <div className="mt-16 p-8 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-purple to-brand-green p-[3px] flex-shrink-0">
                <div className="w-full h-full bg-white rounded-full overflow-hidden relative">
                    {/* Placeholder de avatar */}
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">FH</div>
                </div>
            </div>
            <div>
                <p className="text-xs font-bold text-brand-green uppercase tracking-wider mb-1">Escrito por</p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{post.authorName || 'Equipe Facillit Hub'}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    Especialistas em tecnologia educacional e produtividade. Nossa missão é simplificar processos complexos para escolas e empresas.
                </p>
                <div className="flex justify-center md:justify-start gap-3">
                    <button className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-brand-purple hover:text-brand-purple transition-all"><i className="fab fa-linkedin-in"></i></button>
                    <button className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-brand-purple hover:text-brand-purple transition-all"><i className="fab fa-twitter"></i></button>
                </div>
            </div>
        </div>

        {/* Barra de Compartilhamento */}
        <div className="mt-8 flex items-center justify-between py-6 border-y border-gray-100">
            <span className="font-bold text-gray-900 flex items-center gap-2"><Share2 size={18} /> Compartilhar:</span>
            <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg bg-[#1877F2] text-white text-sm font-bold hover:opacity-90 transition-opacity"><i className="fab fa-facebook-f mr-2"></i> Facebook</button>
                <button className="px-4 py-2 rounded-lg bg-[#1DA1F2] text-white text-sm font-bold hover:opacity-90 transition-opacity"><i className="fab fa-twitter mr-2"></i> Twitter</button>
                <button className="px-4 py-2 rounded-lg bg-[#25D366] text-white text-sm font-bold hover:opacity-90 transition-opacity"><i className="fab fa-whatsapp mr-2"></i> WhatsApp</button>
            </div>
        </div>

        {/* CTA Newsletter (Engajamento) */}
        <div className="my-16">
            <NewsletterBox />
        </div>

        {/* Seção de Comentários */}
        <div className="mt-12">
             <CommentsSection postSlug={slug} />
        </div>
      </div>

      {/* Posts Relacionados */}
      {post.related && post.related.length > 0 && (
        <div className="bg-gray-50 py-16 border-t border-gray-200">
            <div className="container mx-auto px-4 max-w-6xl">
                <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                    <span className="w-1 h-8 bg-blue-600 rounded-full block"></span>
                    Continue lendo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {post.related.map((item: any) => (
                        <Link href={`/recursos/blog/${item.slug.current}`} key={item.slug.current} className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all">
                             <div className="relative h-48 w-full">
                                {item.mainImage && (
                                    <Image 
                                        src={urlFor(item.mainImage).width(400).url()} 
                                        fill 
                                        className="object-cover group-hover:scale-105 transition-transform duration-500" 
                                        alt={item.title} 
                                    />
                                )}
                             </div>
                             <div className="p-5">
                                <span className="text-xs text-slate-400 mb-2 block">{new Date(item.publishedAt).toLocaleDateString('pt-BR')}</span>
                                <h4 className="font-bold text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                    {item.title}
                                </h4>
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