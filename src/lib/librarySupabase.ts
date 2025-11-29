// ARQUIVO: src/lib/librarySupabase.ts
import { createClient } from '@supabase/supabase-js';

// 1. Usamos um valor fallback ("placeholder") para que o BUILD não quebre
// se a variável de ambiente estiver faltando ou com erro de digitação.
const libraryUrl = process.env.NEXT_PUBLIC_LIBRARY_SUPABASE_URL || 'https://placeholder.supabase.co';
const libraryKey = process.env.NEXT_PUBLIC_LIBRARY_SUPABASE_ANON_KEY || 'placeholder-key';
const libraryServiceKey = process.env.LIBRARY_SUPABASE_SERVICE_ROLE_KEY;

// Cliente Client-side
export const libraryClient = createClient(libraryUrl, libraryKey);

// Cliente Server-side (Ações do usuário)
export const createLibraryServerClient = () => {
  return createClient(libraryUrl, libraryKey, {
    auth: {
      persistSession: false,
    }
  });
};

// Cliente Admin (Uploads e Permissões Elevadas)
export const createLibraryAdminClient = () => {
  // Aviso no console se a chave de serviço estiver faltando (ajuda no debug)
  if (!libraryServiceKey && typeof window === 'undefined') {
    console.warn('⚠️ LIBRARY_SUPABASE_SERVICE_ROLE_KEY ausente. Uploads podem falhar.');
  }

  // Fallback seguro: usa a Anon Key se a Service Key não existir
  const keyToUse = libraryServiceKey || libraryKey;

  return createClient(libraryUrl, keyToUse, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    }
  });
};