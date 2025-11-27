import { PortableTextComponents } from '@portabletext/react'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'

export const components: PortableTextComponents = {
  types: {
    image: ({ value }: any) => {
      return (
        <figure className="my-10">
            <div className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-md">
            <Image
                src={urlFor(value).url()}
                alt={value.alt || 'Imagem ilustrativa'}
                fill
                className="object-cover"
            />
            </div>
            {value.caption && (
                <figcaption className="text-center text-sm text-gray-500 mt-2 italic">
                    {value.caption}
                </figcaption>
            )}
        </figure>
      )
    },
  },
  block: {
    h2: ({ children }) => <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-6 pb-2 border-b border-gray-100">{children}</h2>,
    h3: ({ children }) => <h3 className="text-2xl font-bold text-slate-800 mt-8 mb-4">{children}</h3>,
    normal: ({ children }) => <p className="mb-6 text-lg text-slate-700 leading-relaxed font-normal">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 pl-6 py-2 my-8 bg-blue-50/50 rounded-r-lg italic text-slate-700 text-xl font-serif">
        "{children}"
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc ml-6 mb-8 space-y-3 text-slate-700 marker:text-blue-500">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal ml-6 mb-8 space-y-3 text-slate-700 marker:font-bold">{children}</ol>,
  },
}