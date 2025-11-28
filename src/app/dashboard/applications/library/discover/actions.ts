'use server'

import { createLibraryServerClient } from '@/lib/librarySupabase';

export interface OfficialContent {
  id: string;
  title: string;
  description: string;
  content_type: 'book' | 'article' | 'video' | 'slide';
  cover_image: string;
  author: string;
  subject: string;
  url: string;
  vertical?: string;
}

export async function getDiscoverContent() {
  try {
    const libDb = createLibraryServerClient();

    // Queries
    const [featured, math, literature, science] = await Promise.all([
      libDb.from('official_contents').select('*').order('created_at', { ascending: false }).limit(5),
      libDb.from('official_contents').select('*').eq('subject', 'Matemática').limit(4),
      libDb.from('official_contents').select('*').eq('subject', 'Literatura').limit(4),
      libDb.from('official_contents').select('*').in('subject', ['Biologia', 'Física', 'Química']).limit(4)
    ]);

    return {
      featured: (featured.data as OfficialContent[]) || [],
      math: (math.data as OfficialContent[]) || [],
      literature: (literature.data as OfficialContent[]) || [],
      science: (science.data as OfficialContent[]) || []
    };
  } catch (error) {
    console.error('Erro ao carregar Library:', error);
    // Retorna vazio para não quebrar a tela
    return {
      featured: [],
      math: [],
      literature: [],
      science: []
    };
  }
}
