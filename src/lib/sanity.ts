import { createClient } from 'next-sanity'
import { createImageUrlBuilder } from '@sanity/image-url' // CORREÇÃO: Usando exportação nomeada sugerida pelo erro

// Configuração do Cliente com fallback de segurança
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'b5v5649y' // Fallback para evitar crash no build se a env estiver faltando

export const client = createClient({
  projectId,
  dataset: 'production',
  apiVersion: '2024-03-27',
  useCdn: false,
})

// Inicialização segura do builder de imagens
let builder: any
try {
  builder = createImageUrlBuilder(client)
} catch (e) {
  console.warn("Sanity Image Builder falhou ao iniciar (pode ser ignorado no build):", e)
}

// Função urlFor com verificação de segurança
export function urlFor(source: any) {
  if (!builder || !source) {
    // Retorna um objeto mock seguro se o builder falhar ou source for nulo
    return {
      url: () => '/assets/images/MASCOTE/nofound.png', // Caminho para uma imagem de fallback local
      width: () => ({ url: () => '' }),
      height: () => ({ url: () => '' })
    } as any
  }
  return builder.image(source)
}