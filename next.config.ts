// CAMINHO: next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Adiciona a variável de ambiente GOOGLE_API_KEY ao ambiente do servidor
  env: {
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      // Configuração do Supabase Principal (Auth/App)
      {
        protocol: 'https',
        hostname: 'dcwmqivwwfzlixquspah.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // Configuração do Supabase Library
      {
        protocol: 'https',
        hostname: 'xtwlxqdnrsnsrzhgyxvo.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // Configuração para o Sanity
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/**',
      },
      // Permite imagens da Amazon (Capas de Livros)
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        port: '',
        pathname: '/**',
      },
      // NOVA CORREÇÃO: Permite imagens do Unsplash (Links e Placeholders)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;