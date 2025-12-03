"use server";

import createClient from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { StoryPost, StoryCategory, VerificationType } from './types';

const FEED_PATH = '/dashboard/applications/global/stories';

// --- HELPER ---
const safeMetadataParse = (data: any) => {
  if (!data) return {};
  if (typeof data === 'object') return data;
  try { return JSON.parse(data); } catch { return {}; }
};

// --- MAPPER ---
const mapToStoryPost = (row: any, currentUserId?: string): StoryPost => {
  const isLikedByMe = row.my_like && Array.isArray(row.my_like) 
    ? row.my_like.some((l: any) => l.user_id === currentUserId) 
    : false;

  // Fallback seguro para o usuário
  const user = row.user || { 
    id: 'unknown', full_name: 'Usuário', avatar_url: null, username: 'user' 
  };

  // Tenta pegar os dados novos, se não existirem, usa padrão
  const role = user.role || 'student';
  const isVerified = !!user.is_verified;
  
  let badgeValue: VerificationType = null;
  if (user.badge) badgeValue = user.badge as VerificationType;
  else if (role === 'teacher') badgeValue = 'green';
  else if (isVerified) badgeValue = 'blue';

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
      badge: badgeValue,
      role
    },
    createdAt: new Date(row.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    content: row.content || '',
    title: row.title,           
    subtitle: row.subtitle,     
    coverImage: row.cover_image, 
    metadata: safeMetadataParse(row.metadata), 
    likes: row.likes?.[0]?.count || 0,
    commentsCount: row.comments?.[0]?.count || 0,
    isLiked: isLikedByMe,
    isSaved: false,
  };
};

// --- BUSCAR FEED (Com Fallback Automático) ---
export async function getStoriesFeed(
  category: StoryCategory = 'all', 
  limit: number = 20, 
  targetUserId?: string
): Promise<StoryPost[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // TENTATIVA 1: Query Completa (com role/badge)
  // Se o seu banco tiver as colunas, isso roda.
  let query = supabase
    .from('stories_posts')
    .select(`
      *,
      user:profiles!stories_posts_user_id_fkey (id, full_name, avatar_url, nickname, is_verified, role, badge),
      likes:stories_likes(count),
      comments:stories_comments(count),
      my_like:stories_likes(user_id)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (targetUserId) query = query.eq('user_id', targetUserId);
  else if (category !== 'all') query = query.eq('category', category);

  const { data, error } = await query;

  if (error) {
    // TENTATIVA 2: Query de Compatibilidade (Sem role/badge)
    // Isso resolve o erro 'column does not exist' automaticamente
    if (error.code === '42703' || error.message.includes('does not exist')) {
        console.warn("⚠️ Usando modo de compatibilidade (Banco desatualizado)");
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
            
        if (targetUserId) fallbackQuery.eq('user_id', targetUserId);
        else if (category !== 'all') fallbackQuery.eq('category', category);

        const { data: fallbackData } = await fallbackQuery;
        return (fallbackData || []).map(row => mapToStoryPost(row, user?.id));
    }
    return [];
  }
  
  return (data || []).map(row => mapToStoryPost(row, user?.id));
}

// --- RESTANTE DAS AÇÕES ---
export async function getPostById(postId: string): Promise<StoryPost | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Tenta completo
  const { data, error } = await supabase
    .from('stories_posts')
    .select(`*, user:profiles!stories_posts_user_id_fkey (id, full_name, avatar_url, nickname, is_verified, role, badge), likes:stories_likes(count), comments:stories_comments(count), my_like:stories_likes(user_id)`)
    .eq('id', postId)
    .single();

  if (error && error.code === '42703') {
     // Fallback simples
     const { data: fallback } = await supabase
        .from('stories_posts')
        .select(`*, user:profiles!stories_posts_user_id_fkey (id, full_name, avatar_url, nickname, is_verified), likes:stories_likes(count), comments:stories_comments(count), my_like:stories_likes(user_id)`)
        .eq('id', postId)
        .single();
     return fallback ? mapToStoryPost(fallback, user?.id) : null;
  }
  
  if (!data) return null;
  return mapToStoryPost(data, user?.id);
}

export async function deleteStoryPost(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('stories_posts').delete().match({ id: postId, user_id: user.id });
  revalidatePath(FEED_PATH);
}

export async function createStoryPost(postData: Partial<StoryPost>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  await supabase.from('stories_posts').insert({
    user_id: user.id,
    category: postData.category || 'all',
    type: postData.type || 'status',
    content: postData.content,
    title: postData.title,
    subtitle: postData.subtitle,
    cover_image: postData.coverImage,
    metadata: postData.metadata || {},
  });
  revalidatePath(FEED_PATH);
}

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