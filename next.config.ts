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
      // Configuração correta para o Supabase Storage
      {
        protocol: 'https',
        hostname: 'dcwmqivwwfzlixquspah.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // --- ADICIONADO: Configuração para o Sanity ---
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;