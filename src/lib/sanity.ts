import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url' // CORREÇÃO: Importação padrão (sem chaves)

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-03-27',
  useCdn: false,
})

// Inicializa o builder corretamente com a importação padrão
const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}