import { createClient } from '@supabase/supabase-js';

const libraryUrl = process.env.NEXT_PUBLIC_LIBRARY_SUPABASE_URL!;
const libraryKey = process.env.NEXT_PUBLIC_LIBRARY_SUPABASE_ANON_KEY!;

// Cliente para operações no Client-side (se necessário, mas prefira Server Actions)
export const libraryClient = createClient(libraryUrl, libraryKey);

// Função para Server Actions (Backend)
export const createLibraryServerClient = () => {
  return createClient(libraryUrl, libraryKey, {
    auth: {
      persistSession: false, // Gerenciamos a sessão manualmente ou via ID
    }
  });
};