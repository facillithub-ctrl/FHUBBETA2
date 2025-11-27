import { client, urlFor } from '@/lib/sanity'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { ArrowRight, Calendar } from 'lucide-react'

// Metadados para SEO da página principal
export const metadata: Metadata = {
  title: 'Blog Facillit | Recursos e Inovação',
  description: 'Explore artigos sobre educação, tecnologia e as novidades do Facillit Hub.',
}

// Busca os posts no Sanity (ordenados por data mais recente)
async function getPosts() {
  const query = `*[_type == "post"] | order(publishedAt desc) {
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    categories[]->{title}
  }`
  return client.fetch(query)
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Cabeçalho */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Recursos e <span className="text-blue-600">Insights</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Dicas, tutoriais e novidades para transformar a gestão educacional e corporativa.
          </p>
        </div>

        {/* Grid de Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {posts.length > 0 ? (
            posts.map((post: any) => (
              <Link href={`/recursos/blog/${post.slug.current}`} key={post.slug.current} className="group">
                <article className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 overflow-hidden">
                  
                  {/* Imagem do Post */}
                  <div className="relative h-56 w-full overflow-hidden">
                    {post.mainImage ? (
                      <Image
                        src={urlFor(post.mainImage).url()}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-200">
                        <span className="text-4xl font-bold">Blog</span>
                      </div>
                    )}
                  </div>

                  {/* Conteúdo do Card */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        {post.categories?.map((c:any) => (
                            <span key={c.title} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                                {c.title}
                            </span>
                        ))}
                        <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                            <Calendar size={12} />
                            {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
                        </span>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    
                    <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                        Ler artigo completo <ArrowRight size={16} className="ml-2" />
                    </div>
                  </div>
                </article>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 text-lg">Ainda não há posts publicados.</p>
                <p className="text-sm text-gray-400 mt-2">Acesse o Sanity Studio para criar o primeiro.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}