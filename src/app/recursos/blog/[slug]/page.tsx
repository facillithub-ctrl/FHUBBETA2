import { client, urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import { components } from '@/components/blog/PortableTextComponents'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { ChevronRight, Calendar, User } from 'lucide-react'

// Gera o SEO dinâmico para cada post
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await client.fetch(`*[_type == "post" && slug.current == $slug][0]{title, excerpt}`, { slug })
  
  if (!post) return { title: 'Post não encontrado' }

  return {
    title: `${post.title} | Blog Facillit`,
    description: post.excerpt,
  }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Busca o post completo
  const post = await client.fetch(`
    *[_type == "post" && slug.current == $slug][0]{
      title,
      body,
      publishedAt,
      mainImage,
      categories[]->{title},
      "author": author->name
    }
  `, { slug })

  if (!post) notFound()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section do Post */}
      <div className="bg-slate-50 border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-4xl pt-32 pb-16">
            
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <ChevronRight size={14} />
                <Link href="/recursos/blog" className="hover:text-blue-600">Recursos</Link>
                <ChevronRight size={14} />
                <span className="text-gray-900 font-medium truncate max-w-[200px]">{post.title}</span>
            </nav>

            {/* Categorias */}
            <div className="flex gap-2 mb-6">
                {post.categories?.map((c:any) => (
                    <span key={c.title} className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {c.title}
                    </span>
                ))}
            </div>

            {/* Título H1 Chamativo */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-8 leading-tight">
                {post.title}
            </h1>

            {/* Metadados (Autor e Data) */}
            <div className="flex items-center gap-6 text-gray-500 text-sm border-t border-gray-200 pt-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <User size={16} />
                    </div>
                    <span className="font-medium text-gray-900">Equipe Facillit</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    {new Date(post.publishedAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
            </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 max-w-4xl py-12">
        {post.mainImage && (
            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-lg mb-12">
                <Image 
                    src={urlFor(post.mainImage).url()} 
                    alt={post.title} 
                    fill 
                    className="object-cover" 
                    priority
                />
            </div>
        )}

        <div className="prose prose-lg prose-blue max-w-none text-gray-800 leading-8">
            <PortableText value={post.body} components={components} />
        </div>

        {/* Separador Final */}
        <hr className="my-16 border-gray-100" />
        
        <div className="bg-blue-50 p-8 rounded-2xl text-center">
            <h3 className="text-2xl font-bold text-blue-900 mb-2">Gostou deste artigo?</h3>
            <p className="text-gray-600 mb-6">Confira outros conteúdos em nossa página de recursos.</p>
            <Link href="/recursos/blog" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                Voltar para o Blog
            </Link>
        </div>
      </div>
    </div>
  )
}