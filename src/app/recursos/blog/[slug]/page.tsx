import { client, urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import { components } from '@/components/blog/PortableTextComponents'
import { NewsletterBox } from '@/components/blog/NewsletterBox'
import { CommentsSection } from '@/components/blog/CommentsSection'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
// CORREÇÃO: ArrowRight adicionado aqui
import { ChevronRight, Calendar, Clock, Share2, ArrowLeft, ArrowRight } from 'lucide-react'

async function getPost(slug: string) {
    return client.fetch(`
      *[_type == "post" && slug.current == $slug][0]{
        title, excerpt, body, publishedAt, mainImage,
        categories[]->{title},
        "authorName": author->name,
        "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180 ) + 1,
        "related": *[_type == "post" && slug.current != $slug][0...3]{
          title, slug, mainImage, publishedAt
        }
      }
    `, { slug })
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPost(slug)
    if (!post) return { title: 'Post não encontrado' }
    return { title: `${post.title} | Blog Facillit`, description: post.excerpt }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug)

  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: post.mainImage ? urlFor(post.mainImage).url() : '',
    datePublished: post.publishedAt,
    author: { '@type': 'Organization', name: 'Facillit Hub' },
    description: post.excerpt,
  }

  return (
    <div className="min-h-screen bg-white font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-gray-50/50 border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-4xl pt-32 pb-12">
            
            {/* --- BOTÃO VOLTAR --- */}
            <div className="mb-8">
                <Link href="/recursos/blog" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-purple transition-colors bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:shadow-md">
                    <ArrowLeft size={16} /> Voltar para o Blog
                </Link>
            </div>

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6 uppercase tracking-wider font-bold">
                <Link href="/" className="hover:text-brand-purple">Home</Link>
                <ChevronRight size={12} />
                <Link href="/recursos/blog" className="hover:text-brand-purple">Blog</Link>
                <ChevronRight size={12} />
                <span className="text-gray-600 truncate max-w-[200px]">{post.title}</span>
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

            <div className="flex flex-wrap items-center gap-6 text-gray-500 text-sm border-t border-gray-200 pt-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-gradient rounded-full flex items-center justify-center text-white font-bold shadow-md">FH</div>
                    <div>
                        <p className="text-gray-900 font-bold">Equipe Facillit</p>
                        <p className="text-xs">Editor Chefe</p>
                    </div>
                </div>
                <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
                <div className="flex items-center gap-1.5"><Calendar size={16} /> {new Date(post.publishedAt).toLocaleDateString('pt-BR')}</div>
                <div className="flex items-center gap-1.5"><Clock size={16} /> {post.estimatedReadingTime} min de leitura</div>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl py-12">
        {/* Imagem Principal */}
        {post.mainImage && (
            <div className="relative w-full h-[300px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl mb-12 transform -translate-y-6 md:-translate-y-12 ring-8 ring-white">
                <Image src={urlFor(post.mainImage).url()} alt={post.title} fill className="object-cover" priority />
            </div>
        )}

        <div className="prose prose-lg prose-slate prose-headings:font-bold prose-a:text-brand-purple hover:prose-a:text-brand-dark max-w-none text-gray-600 leading-8">
            <PortableText value={post.body} components={components} />
        </div>

        {/* CTA Newsletter e Comentários */}
        <div className="my-16"><NewsletterBox /></div>
        <div className="mt-12"><CommentsSection postSlug={slug} /></div>
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
                        <Link href={`/recursos/blog/${item.slug.current}`} key={item.slug.current} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all">
                             <div className="relative h-48 w-full">
                                {item.mainImage && <Image src={urlFor(item.mainImage).width(400).url()} fill className="object-cover" alt={item.title} />}
                             </div>
                             <div className="p-6">
                                <h4 className="font-bold text-gray-900 line-clamp-2 group-hover:text-brand-purple transition-colors mb-2">{item.title}</h4>
                                <span className="text-xs text-gray-400 font-medium flex items-center">
                                    Ler artigo <ArrowRight size={12} className="inline ml-1"/>
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