// ARQUIVO: src/lib/librarySupabase.ts
import { createClient } from '@supabase/supabase-js';

const libraryUrl = process.env.NEXT_PUBLIC_LIBRARY_SUPABASE_URL!;
const libraryKey = process.env.NEXT_PUBLIC_LIBRARY_SUPABASE_ANON_KEY!;
const libraryServiceKey = process.env.LIBRARY_SUPABASE_SERVICE_ROLE_KEY!;

// Cliente público (Leitura)
export const libraryClient = createClient(libraryUrl, libraryKey);

// Cliente Servidor (Leitura autenticada via RLS - se necessário)
export const createLibraryServerClient = () => {
  return createClient(libraryUrl, libraryKey, {
    auth: { persistSession: false }
  });
};

// NOVO: Cliente Admin (Escrita privilegiada - Uploads/Creates)
export const createLibraryAdminClient = () => {
  if (!libraryServiceKey) {
    console.warn('⚠️ LIBRARY_SUPABASE_SERVICE_ROLE_KEY não encontrada. Uploads podem falhar.');
  }
  // Usa a Service Role Key para ignorar RLS
  return createClient(libraryUrl, libraryServiceKey || libraryKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    }
  });
};