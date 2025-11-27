import { client, urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import { components } from '@/components/blog/PortableTextComponents'
import { NewsletterBox } from '@/components/blog/NewsletterBox'
import { CommentsSection } from '@/components/blog/CommentsSection'
import { EcosystemWidget } from '@/components/blog/EcosystemWidget'
import { EngagementBar } from '@/components/blog/EngagementBar'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { ChevronRight, Calendar, Clock, ArrowLeft, ArrowRight, BadgeCheck } from 'lucide-react'

// --- Função para buscar dados do post ---
async function getPost(slug: string) {
    if (!slug) return null
    
    const now = new Date().toISOString()
    const queryParams = { slug, now }
    
    return client.fetch(`
      *[_type == "post" && slug.current == $slug && (!defined(expirationDate) || expirationDate > $now)][0]{
        title, excerpt, body, publishedAt, mainImage,
        categories[]->{title},
        author->{
            name, 
            role, 
            image, 
            isOfficial, 
            bio
        },
        ecosystemIntegration,
        "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180 ) + 1,
        "related": *[_type == "post" && slug.current != $slug && (!defined(expirationDate) || expirationDate > $now)][0...3]{
          title, slug, mainImage, publishedAt
        }
      }
    `, queryParams)
}

// --- Metadados SEO ---
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPost(slug)
    if (!post) return { title: 'Post não encontrado' }
    return { title: `${post.title} | Blog Facillit`, description: post.excerpt }
}

// --- Componente da Página ---
export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug)

  if (!post) notFound()

  // SEO Estruturado (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: post.mainImage ? urlFor(post.mainImage).url() : '',
    datePublished: post.publishedAt,
    author: { 
        '@type': 'Person', 
        name: post.author?.name || 'Equipe Facillit' 
    },
    description: post.excerpt,
  }

  return (
    <div className="min-h-screen bg-white font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Header / Hero */}
      <div className="bg-gray-50/50 border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-4xl pt-32 pb-12">
            
            {/* Navegação Superior */}
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Link href="/recursos/blog" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-purple transition-colors bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:shadow-md">
                    <ArrowLeft size={16} /> Voltar para o Blog
                </Link>
                
                {/* Barra de Likes e Salvar */}
                <EngagementBar postSlug={slug} />
            </div>

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6 uppercase tracking-wider font-bold overflow-hidden">
                <Link href="/" className="hover:text-brand-purple flex-shrink-0">Home</Link>
                <ChevronRight size={12} className="flex-shrink-0" />
                <Link href="/recursos/blog" className="hover:text-brand-purple flex-shrink-0">Blog</Link>
                <ChevronRight size={12} className="flex-shrink-0" />
                <span className="text-gray-600 truncate">{post.title}</span>
            </nav>

            {/* Categorias */}
            <div className="flex flex-wrap gap-2 mb-6">
                {post.categories?.map((c:any) => (
                    <span key={c.title} className="bg-brand-purple/10 text-brand-purple px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                        {c.title}
                    </span>
                ))}
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-8 leading-tight">
                {post.title}
            </h1>

            {/* Author Box Premium */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-white border border-gray-100 shadow-xl shadow-gray-200/50 rounded-2xl p-6 md:p-8 mt-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                <div className="relative w-20 h-20 flex-shrink-0">
                    {post.author?.image ? (
                        <Image src={urlFor(post.author.image).url()} alt={post.author.name} fill className="rounded-full object-cover ring-4 ring-gray-50" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-purple to-brand-dark rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-inner">
                            {post.author?.name?.charAt(0) || 'F'}
                        </div>
                    )}
                    {post.author?.isOfficial && (
                        <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full ring-2 ring-white" title="Verificado Oficial">
                            <BadgeCheck size={14} fill="currentColor" />
                        </div>
                    )}
                </div>

                <div className="text-center sm:text-left z-10">
                    <h4 className="text-lg font-bold text-gray-900 mb-1 flex items-center justify-center sm:justify-start gap-2">
                        {post.author?.name || 'Equipe Facillit'}
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider">{post.author?.role || 'Editor'}</span>
                    </h4>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 max-w-lg">
                        {post.author?.bio || 'Especialista em educação e tecnologia, compartilhando insights para transformar o aprendizado no Facillit Hub.'}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-medium text-brand-purple">
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(post.publishedAt).toLocaleDateString('pt-BR')}</span>
                        <span className="flex items-center gap-1.5"><Clock size={14} /> {post.estimatedReadingTime} min de leitura</span>
                    </div>
                </div>
            </div>

        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 max-w-4xl py-12">
        {post.mainImage && (
            <div className="relative w-full h-[300px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl mb-12 transform -translate-y-6 md:-translate-y-12 ring-8 ring-white">
                <Image src={urlFor(post.mainImage).url()} alt={post.title} fill className="object-cover" priority />
            </div>
        )}

        {/* Texto Rico */}
        <div className="prose prose-lg prose-slate prose-headings:font-bold prose-a:text-brand-purple hover:prose-a:text-brand-dark max-w-none text-gray-600 leading-8">
            <PortableText value={post.body} components={components} />
        </div>

        {/* Widget de Ecossistema (Interatividade) */}
        {post.ecosystemIntegration && (
            <div className="my-16">
                <EcosystemWidget 
                    type={post.ecosystemIntegration.module} 
                    ctaText={post.ecosystemIntegration.callToAction} 
                />
            </div>
        )}

        {/* Newsletter e Comentários */}
        <div className="my-16 border-t border-gray-100 pt-16">
            <NewsletterBox />
        </div>
        
        <div className="mt-12">
            <CommentsSection postSlug={slug} />
        </div>
      </div>

      {/* Posts Relacionados */}
      {post.related && post.related.length > 0 && (
        <div className="bg-gray-50 py-20 border-t border-gray-200">
            <div className="container mx-auto px-4 max-w-6xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                    <span className="w-1 h-8 bg-brand-purple rounded-full block"></span> Continue lendo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {post.related.map((item: any) => (
                        <Link href={`/recursos/blog/${item.slug.current}`} key={item.slug.current} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full">
                             <div className="relative h-48 w-full flex-shrink-0">
                                {item.mainImage && <Image src={urlFor(item.mainImage).width(400).url()} fill className="object-cover" alt={item.title} />}
                             </div>
                             <div className="p-6 flex-1 flex flex-col">
                                <h4 className="font-bold text-gray-900 line-clamp-2 group-hover:text-brand-purple transition-colors mb-2">{item.title}</h4>
                                <span className="text-xs text-gray-400 font-medium flex items-center mt-auto">
                                    Ler artigo <ArrowRight size={12} className="inline ml-1 group-hover:translate-x-1 transition-transform"/>
                                </span>
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