// src/app/dashboard/applications/library/portfolio/actions.ts
'use server'

import { createLibraryServerClient } from '@/lib/librarySupabase';
import { createClient } from '@/utils/supabase/server'; // Auth

export async function getPortfolioItems() {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (!user) return [];

  const libDb = createLibraryServerClient();
  
  const { data } = await libDb
    .from('portfolio_items')
    .select(`
      *,
      repository_item:repository_item_id (
        type,
        content_url,
        origin_module
      )
    `)
    .eq('user_id', user.id)
    .order('published_at', { ascending: false });

  return data || [];
}

export async function toggleVisibility(itemId: string, currentVisibility: string) {
  const libDb = createLibraryServerClient();
  const newVisibility = currentVisibility === 'public' ? 'private' : 'public';
  
  await libDb
    .from('portfolio_items')
    .update({ visibility: newVisibility })
    .eq('id', itemId);
}