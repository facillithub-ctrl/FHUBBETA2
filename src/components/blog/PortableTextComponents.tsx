import { PortableTextComponents } from '@portabletext/react'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'

export const components: PortableTextComponents = {
  types: {
    image: ({ value }: any) => {
      return (
        <div className="relative w-full h-96 my-8 rounded-xl overflow-hidden shadow-lg">
          <Image
            src={urlFor(value).url()}
            alt={value.alt || 'Imagem do blog'}
            fill
            className="object-cover"
          />
        </div>
      )
    },
  },
  block: {
    h1: ({ children }) => <h1 className="text-4xl font-bold text-gray-900 mt-10 mb-6">{children}</h1>,
    h2: ({ children }) => <h2 className="text-3xl font-bold text-blue-900 mt-12 mb-4">{children}</h2>,
    h3: ({ children }) => <h3 className="text-2xl font-semibold text-blue-800 mt-8 mb-3">{children}</h3>,
    normal: ({ children }) => <p className="mb-4 text-lg text-gray-700 leading-relaxed">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-6 bg-gray-50 py-2 pr-2 rounded-r">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc ml-6 mb-6 space-y-2 text-gray-700">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal ml-6 mb-6 space-y-2 text-gray-700">{children}</ol>,
  },
  marks: {
    link: ({ children, value }) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined
      return (
        <a href={value.href} rel={rel} className="text-blue-600 hover:underline font-medium decoration-2 underline-offset-2">
          {children}
        </a>
      )
    },
  },
}