import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

// Configuração da conexão usando as variáveis de ambiente
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, // Certifique-se de adicionar isso no .env.local
  dataset: 'production',
  apiVersion: '2024-03-27',
  useCdn: false, // 'false' garante que novos posts apareçam na hora (bom para testes)
})

const builder = imageUrlBuilder(client)

// Função auxiliar para gerar URLs das imagens
export function urlFor(source: any) {
  return builder.image(source)
}