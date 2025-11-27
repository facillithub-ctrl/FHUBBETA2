import { PortableTextComponents } from '@portabletext/react'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import { Quote } from 'lucide-react'

export const components: PortableTextComponents = {
  types: {
    image: ({ value }: any) => {
      return (
        <figure className="my-12 group">
            <div className="relative w-full h-[450px] rounded-2xl overflow-hidden shadow-lg border border-gray-100">
            <Image
                src={urlFor(value).url()}
                alt={value.alt || 'Imagem ilustrativa'}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            </div>
            {value.caption && (
                <figcaption className="text-center text-sm text-gray-500 mt-3 italic border-l-2 border-brand-green pl-2 inline-block mx-auto">
                    {value.caption}
                </figcaption>
            )}
        </figure>
      )
    },
  },
  block: {
    h2: ({ children }) => (
        <h2 className="text-3xl font-black text-gray-900 mt-16 mb-6 relative pl-6">
            <span className="absolute left-0 top-1 bottom-1 w-1.5 bg-brand-gradient rounded-full"></span>
            {children}
        </h2>
    ),
    h3: ({ children }) => <h3 className="text-2xl font-bold text-brand-purple mt-10 mb-4">{children}</h3>,
    normal: ({ children }) => <p className="mb-6 text-lg text-gray-700 leading-8 font-light">{children}</p>,
    blockquote: ({ children }) => (
      <div className="my-10 relative pl-10 pr-6 py-4">
        <Quote className="absolute left-0 top-0 text-brand-green/20 w-16 h-16 -z-10 transform -translate-y-4" />
        <blockquote className="text-2xl font-serif italic text-gray-800 leading-relaxed">
          &quot;{children}&quot;
        </blockquote>
      </div>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc ml-6 mb-8 space-y-3 text-gray-700 marker:text-brand-green">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal ml-6 mb-8 space-y-3 text-gray-700 marker:font-bold marker:text-brand-purple">{children}</ol>,
  },
}