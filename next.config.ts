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
      // Amazon / IMDb (Capas de Filmes/Livros)
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        port: '',
        pathname: '/**',
      },
      // PlayStation (Games)
      {
        protocol: 'https',
        hostname: 'image.api.playstation.com',
        port: '',
        pathname: '/**',
      },
      // Unsplash (Fotos genéricas)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      // Placeholders (CORREÇÃO DO ERRO)
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      // Google User Content (Avatares de login social do Google)
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;