"use server";

import createClient from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { StoryPost, StoryCategory, VerificationType } from './types';

const FEED_PATH = '/dashboard/applications/global/stories';

// --- HELPER DE MAPEAMENTO ---
// Transforma o dado cru do banco no formato que o componente espera
const mapToStoryPost = (row: any, currentUserId?: string): StoryPost => {
  // Verifica like do usuário atual
  const isLikedByMe = row.my_like && Array.isArray(row.my_like) 
    ? row.my_like.some((l: any) => l.user_id === currentUserId) 
    : false;

  // Fallback seguro para usuário
  const user = row.user || { 
    id: 'unknown', full_name: 'Usuário Desconhecido', avatar_url: null, username: 'user' 
  };

  const role = user.role || 'student';
  const isVerified = !!user.is_verified;
  
  // LÓGICA DE BADGE ROBUSTA
  // Prioriza verification_badge (novo padrão), depois tenta badge (legado)
  const badgeValue: VerificationType = user.verification_badge || user.badge || null;

  return {
    id: row.id,
    type: row.type || 'status', 
    category: row.category || 'all',
    user: {
      id: user.id,
      name: user.full_name,
      avatar_url: user.avatar_url,
      username: user.nickname || user.username || 'user',
      isVerified,
      verification_badge: badgeValue, // Campo principal
      badge: badgeValue,              // Fallback para componentes antigos
      role
    },
    createdAt: new Date(row.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    content: row.content || '',
    title: row.title,           
    subtitle: row.subtitle,     
    coverImage: row.cover_image, 
    metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata || {}), 
    likes: row.likes?.[0]?.count || 0,
    commentsCount: row.comments?.[0]?.count || 0,
    isLiked: isLikedByMe,
    isSaved: false,
  };
};

// --- BUSCAR FEED ---
export async function getStoriesFeed(
  category: StoryCategory = 'all', 
  limit: number = 20
): Promise<StoryPost[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // QUERY PRINCIPAL CORRIGIDA
  // Adicionado 'verification_badge' explicitamente no select do user:profiles
  let query = supabase
    .from('stories_posts')
    .select(`
      *,
      user:profiles!stories_posts_user_id_fkey (
        id, 
        full_name, 
        avatar_url, 
        nickname, 
        is_verified, 
        role, 
        verification_badge,
        badge 
      ),
      likes:stories_likes(count),
      comments:stories_comments(count),
      my_like:stories_likes(user_id)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar feed:", error);
    // Tentativa de fallback simplificado se a query falhar (ex: coluna não existe)
    if (error.code === '42703' || error.message.includes('does not exist')) {
        console.warn("⚠️ Coluna de badge pode estar ausente. Tentando query simplificada.");
        const fallbackQuery = supabase
            .from('stories_posts')
            .select(`
              *,
              user:profiles!stories_posts_user_id_fkey (id, full_name, avatar_url, nickname, is_verified),
              likes:stories_likes(count),
              comments:stories_comments(count),
              my_like:stories_likes(user_id)
            `)
            .order('created_at', { ascending: false })
            .limit(limit);
            
        if (category !== 'all') fallbackQuery.eq('category', category);

        const { data: fallbackData } = await fallbackQuery;
        return (fallbackData || []).map(row => mapToStoryPost(row, user?.id));
    }
    return [];
  }
  
  return (data || []).map(row => mapToStoryPost(row, user?.id));
}

// --- BUSCAR POST POR ID ---
export async function getPostById(postId: string): Promise<StoryPost | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Query corrigida com 'verification_badge'
  const { data, error } = await supabase
    .from('stories_posts')
    .select(`
        *, 
        user:profiles!stories_posts_user_id_fkey (
            id, full_name, avatar_url, nickname, is_verified, role, verification_badge, badge
        ), 
        likes:stories_likes(count), 
        comments:stories_comments(count), 
        my_like:stories_likes(user_id)
    `)
    .eq('id', postId)
    .single();

  if (error || !data) return null;
  return mapToStoryPost(data, user?.id);
}

// --- CRIAR POST (COM UPLOAD) ---
export async function createStoryPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const content = formData.get('content') as string;
  const category = (formData.get('category') as string) || 'all';
  const type = (formData.get('type') as string) || 'status';
  const file = formData.get('file') as File | null;
  const metadataStr = formData.get('metadata') as string;
  const title = formData.get('title') as string;
  const subtitle = formData.get('subtitle') as string;

  let metadata = {};
  if (metadataStr) {
      try { metadata = JSON.parse(metadataStr); } catch (e) { console.error("Metadata error", e); }
  }
  
  let coverImageUrl = null;

  if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
          .from('stories-media')
          .upload(fileName, file);

      if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
              .from('stories-media')
              .getPublicUrl(fileName);
          coverImageUrl = publicUrl;
      }
  }

  const { error } = await supabase.from('stories_posts').insert({
    user_id: user.id,
    category,
    type,
    content,
    title,      
    subtitle,   
    cover_image: coverImageUrl,
    metadata,
  });

  if (error) {
      console.error("Erro create:", error);
      throw error;
  }

  revalidatePath(FEED_PATH);
}

// --- DELETAR ---
export async function deleteStoryPost(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  await supabase.from('stories_posts').delete().match({ id: postId, user_id: user.id });
  revalidatePath(FEED_PATH);
}

// --- LIKE ---
export async function togglePostLike(postId: string, currentLikedState: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  if (currentLikedState) {
    await supabase.from('stories_likes').delete().match({ post_id: postId, user_id: user.id });
  } else {
    await supabase.from('stories_likes').upsert({ post_id: postId, user_id: user.id }, { onConflict: 'post_id, user_id' });
  }
  revalidatePath(FEED_PATH);
}