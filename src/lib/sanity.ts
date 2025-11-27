import { createClient } from 'next-sanity'
import { createImageUrlBuilder } from '@sanity/image-url'

// Fallback para evitar crash se a env estiver faltando
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'b5v5649y'

export const client = createClient({
  projectId,
  dataset: 'production',
  apiVersion: '2024-03-27',
  useCdn: false, 
  // ADICIONADO: O cliente agora usa o token se ele existir nas variáveis de ambiente
  token: process.env.SANITY_API_TOKEN,
  // Suprime avisos caso o token acabe vazando para o navegador (embora deva ficar no servidor)
  ignoreBrowserTokenWarning: true, 
})

// Inicialização segura do builder de imagens
let builder: any
try {
  builder = createImageUrlBuilder(client)
} catch (e) {
  console.warn("Sanity Image Builder falhou ao iniciar:", e)
}

export function urlFor(source: any) {
  if (!builder || !source) {
    return {
      url: () => '/assets/images/MASCOTE/nofound.png',
      width: () => ({ url: () => '' }),
      height: () => ({ url: () => '' })
    } as any
  }
  return builder.image(source)
}