import { client, urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import { components } from '@/components/blog/PortableTextComponents'
import { NewsletterBox } from '@/components/blog/NewsletterBox'
import { CommentsSection } from '@/components/blog/CommentsSection'
import { EcosystemWidget } from '@/components/blog/EcosystemWidget'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { 
    ArrowLeft, Calendar, Clock, Linkedin, Twitter, BadgeCheck, ShieldCheck 
} from 'lucide-react'

// --- CONFIGURAÇÕES ---
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// --- DADOS ---
async function getPost(slug: string) {
    if (!slug) return null
    
    // ADICIONADO: 'ecosystemIntegration' na query para o widget funcionar
    const query = `*[_type == "post" && slug.current == $slug][0]{
        title, excerpt, body, publishedAt, mainImage,
        categories[]->{title},
        ecosystemIntegration, 
        author->{
            name, 
            role, 
            image, 
            bio, 
            isOfficial,
            "socials": { "linkedin": linkedin, "twitter": twitter }
        },
        "estimatedReadingTime": coalesce(round(length(pt::text(body)) / 5 / 180 ), 5) + 1,
        "related": *[_type == "post" && slug.current != $slug][0...3]{title, slug, mainImage}
    }`
    
    try {
        return await client.fetch(query, { slug })
    } catch (error) {
        console.error("Erro slug:", error);
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPost(slug)
    if (!post) return { title: 'Post não encontrado' }
    return { title: post.title, description: post.excerpt }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug)

  if (!post) notFound()

  return (
    <div className="min-h-screen bg-white font-inter text-gray-900 selection:bg-brand-purple/20 selection:text-brand-purple">
      
      {/* Botão Voltar */}
      <div className="container mx-auto px-4 max-w-6xl py-8">
        <Link href="/recursos/blog" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-purple transition-colors bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-full">
            <ArrowLeft size={16} /> Voltar para o Blog
        </Link>
      </div>

      <main className="container mx-auto px-4 max-w-6xl pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* ESQUERDA: CONTEÚDO (8 cols) */}
            <div className="lg:col-span-8">
                
                {/* Header do Post */}
                <div className="mb-10">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        {post.categories?.[0] && (
                            <span className="px-3 py-1 rounded-lg bg-brand-purple/10 text-brand-purple text-xs font-bold uppercase tracking-wider">
                                {post.categories[0].title}
                            </span>
                        )}
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <Calendar size={12} /> {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <Clock size={12} /> {post.estimatedReadingTime} min
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                        {post.title}
                    </h1>
                    
                    <p className="text-xl text-gray-500 leading-relaxed font-medium">
                        {post.excerpt}
                    </p>
                </div>

                {/* Imagem Principal */}
                {post.mainImage && (
                    <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden mb-12 bg-gray-100 shadow-sm">
                        <Image src={urlFor(post.mainImage).width(1200).url()} alt={post.title} fill className="object-cover" priority />
                    </div>
                )}

                {/* Texto Rico */}
                <div className="prose prose-lg prose-slate max-w-none 
                    prose-headings:font-bold prose-headings:text-gray-900 
                    prose-p:text-gray-600 prose-p:leading-8 
                    prose-a:text-brand-purple prose-a:font-bold prose-a:no-underline hover:prose-a:bg-brand-purple/10 transition-colors
                    prose-img:rounded-2xl">
                    <PortableText value={post.body} components={components} />
                </div>

                {/* WIDGET DO ECOSSISTEMA (Adicionado de volta) */}
                {post.ecosystemIntegration && (
                    <div className="my-16">
                        <EcosystemWidget 
                            type={post.ecosystemIntegration.module} 
                            ctaText={post.ecosystemIntegration.callToAction} 
                        />
                    </div>
                )}

                {/* Comentários */}
                <div className="mt-16 pt-10 border-t border-gray-100">
                    <CommentsSection postSlug={slug} />
                </div>
            </div>

            {/* DIREITA: SIDEBAR DO AUTOR */}
            <aside className="lg:col-span-4 relative hidden lg:block">
                <div className="sticky top-10 space-y-8">
                    
                    {/* --- CARD DO AUTOR --- */}
                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] text-center relative overflow-hidden">
                        
                        {/* Background Decorativo */}
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-gray-50 to-white"></div>

                        <div className="relative z-10">
                            {/* Avatar */}
                            <div className="w-24 h-24 mx-auto rounded-full p-1 bg-white shadow-lg mb-4 relative">
                                <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 relative">
                                    {post.author?.image ? (
                                        <Image src={urlFor(post.author.image).width(200).url()} fill alt={post.author.name} className="object-cover" />
                                    ) : <div className="w-full h-full bg-brand-purple text-white flex items-center justify-center text-2xl font-bold">F</div>}
                                </div>
                            </div>

                            {/* Nome e Verificação (BadgeCheck Verde) */}
                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {post.author?.name}
                                </h3>
                                {post.author?.isOfficial && (
                                    <div title="Verificado Oficial">
                                        <BadgeCheck size={20} className="text-green-500 fill-green-50" />
                                    </div>
                                )}
                            </div>
                            
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                                {post.author?.role || 'Autor'}
                            </p>

                            {/* Badge de Texto Oficial */}
                            {post.author?.isOfficial && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wide mb-5 border border-green-100">
                                    <ShieldCheck size={12} /> Membro da Equipe Oficial
                                </div>
                            )}

                            <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                {post.author?.bio || "Criando conteúdo de valor para a comunidade Facillit."}
                            </p>

                            <div className="flex justify-center gap-3">
                                {post.author?.socials?.linkedin && <a href={post.author.socials.linkedin} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-[#0077b5] transition-all"><Linkedin size={18}/></a>}
                                {post.author?.socials?.twitter && <a href={post.author.socials.twitter} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-black transition-all"><Twitter size={18}/></a>}
                            </div>
                        </div>
                    </div>

                    {/* Posts Relacionados */}
                    {post.related?.length > 0 && (
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                            <h4 className="font-bold text-gray-900 mb-4 text-sm">Continue Lendo</h4>
                            <div className="space-y-4">
                                {post.related.map((rel: any) => (
                                    <Link href={`/recursos/blog/${rel.slug.current}`} key={rel.slug.current} className="flex gap-4 group">
                                        <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 relative">
                                            {rel.mainImage && <Image src={urlFor(rel.mainImage).width(150).url()} fill alt={rel.title} className="object-cover group-hover:scale-110 transition-transform duration-500" />}
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="text-xs font-bold text-gray-900 group-hover:text-brand-purple transition-colors line-clamp-2 leading-relaxed">{rel.title}</h5>
                                            <span className="text-[10px] text-gray-400 mt-1 block">Ler artigo</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-2">
                        <NewsletterBox simple={true} />
                    </div>
                </div>
            </aside>

        </div>
      </main>
    </div>
  )
}