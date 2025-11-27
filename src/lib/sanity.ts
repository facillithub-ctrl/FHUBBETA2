import { createClient } from 'next-sanity'
import { createImageUrlBuilder } from '@sanity/image-url' // ADICIONADO { } AQUI

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-03-27',
  useCdn: false,
})

const builder = createImageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}