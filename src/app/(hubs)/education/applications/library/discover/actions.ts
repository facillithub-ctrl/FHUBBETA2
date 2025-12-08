'use server'

import { createLibraryServerClient } from '@/lib/librarySupabase';

// Tipagem forte para garantir que o front não quebre
export interface OfficialContent {
  id: string;
  title: string;
  description: string;
  content_type: 'book' | 'article' | 'video' | 'slide';
  cover_image: string | null;
  author: string | null;
  subject: string | null;
  url: string;
  created_at: string;
}

export interface DiscoverData {
  featured: OfficialContent[];
  math: OfficialContent[];
  literature: OfficialContent[];
  science: OfficialContent[];
}

export async function getDiscoverContent(): Promise<DiscoverData> {
  try {
    const libDb = createLibraryServerClient();

    // Executa todas as queries em paralelo para ser rápido
    const [featured, math, literature, science] = await Promise.all([
      // Destaques: últimos 5 adicionados
      libDb.from('official_contents').select('*').order('created_at', { ascending: false }).limit(5),
      
      // Matemática
      libDb.from('official_contents').select('*').eq('subject', 'Matemática').limit(6),
      
      // Literatura
      libDb.from('official_contents').select('*').eq('subject', 'Literatura').limit(6),
      
      // Ciências (Biologia, Física, Química)
      libDb.from('official_contents').select('*').in('subject', ['Biologia', 'Física', 'Química', 'Ciências']).limit(6)
    ]);

    return {
      featured: (featured.data as OfficialContent[]) || [],
      math: (math.data as OfficialContent[]) || [],
      literature: (literature.data as OfficialContent[]) || [],
      science: (science.data as OfficialContent[]) || []
    };
  } catch (error) {
    console.error('Erro ao carregar Library Discover:', error);
    return { featured: [], math: [], literature: [], science: [] };
  }
}