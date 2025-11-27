import { client, urlFor } from '@/lib/sanity'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { ArrowRight, Calendar, Clock } from 'lucide-react'
import { BlogControls } from '@/components/blog/BlogControls'

export const metadata: Metadata = {
  title: 'Blog Facillit | Recursos, Inovação e Tecnologia Educacional',
  description: 'Explore artigos profundos sobre gestão escolar, IA na educação e produtividade corporativa.',
  openGraph: {
    title: 'Blog Facillit',
    description: 'Central de conhecimento do Facillit Hub.',
    images: ['/assets/images/LOGO/png/isologo.png'], // Ajuste para uma imagem padrão do blog se tiver
  }
}

// Query GROQ Otimizada com filtros
async function getData(search: string = '', category: string = '') {
  // Filtro base: é um post
  let filter = `_type == "post"`
  
  // Se tiver busca, filtra título ou corpo
  if (search) {
    filter += ` && (title match "*${search}*" || body[].children[].text match "*${search}*")`
  }
  
  // Se tiver categoria, filtra pela referência
  if (category) {
    filter += ` && $category in categories[]->title`
  }

  const query = `{
    "posts": *[${filter}] | order(publishedAt desc) {
      title,
      slug,
      excerpt,
      mainImage,
      publishedAt,
      "categories": categories[]->{title, _id},
      "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180 ) + 1
    },
    "categories": *[_type == "category"] {title, _id}
  }`

  return client.fetch(query, { category })
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ q: string, cat: string }> }) {
  const { q, cat } = await searchParams
  const data = await getData(q, cat)

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header Elegante */}
        <div className="text-center mb-16 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="text-blue-600 font-bold tracking-wider text-sm uppercase mb-2 block">Central de Conhecimento</span>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            Blog <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Facillit</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Estratégias, tutoriais e insights para impulsionar a educação e a gestão corporativa.
          </p>
        </div>

        {/* Controles de Busca e Filtro */}
        <BlogControls categories={data.categories} />

        {/* Grid de Posts Melhorado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.posts.length > 0 ? (
            data.posts.map((post: any, index: number) => (
              <Link href={`/recursos/blog/${post.slug.current}`} key={post.slug.current} className="group h-full">
                <article className="flex flex-col h-full bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 overflow-hidden">
                  
                  {/* Imagem com Overlay */}
                  <div className="relative h-60 w-full overflow-hidden">
                    {post.mainImage ? (
                      <Image
                        src={urlFor(post.mainImage).width(600).height(400).url()} // Otimização de tamanho
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-w-768px) 100vw, (max-w-1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
                        <span className="text-slate-300 font-bold text-4xl opacity-20">FHUB</span>
                      </div>
                    )}
                    {/* Badge da Categoria Primária */}
                    {post.categories && post.categories[0] && (
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-blue-700 shadow-sm">
                            {post.categories[0].title}
                        </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                        <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {post.estimatedReadingTime} min leitura
                        </span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                      {post.title}
                    </h2>
                    
                    <p className="text-slate-600 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                        Ler artigo completo <ArrowRight size={16} className="ml-1" />
                    </div>
                  </div>
                </article>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
                <div className="bg-white p-8 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Search className="text-gray-300" size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum resultado encontrado</h3>
                <p className="text-gray-500">Tente buscar por outros termos ou limpar os filtros.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}