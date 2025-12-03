"use server";

import createClient from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { StoryPost, PostType, StoryCategory } from './types';

// --- HELPER: Parse Seguro de Metadata ---
const safeJsonParse = (data: any) => {
  if (!data) return {};
  if (typeof data === 'object') return data; 
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Erro ao parsear metadata:", e);
    return {};
  }
};

// --- MAPPER ---
const mapPost = (post: any, currentUserId?: string): StoryPost => {
  const amILiked = post.my_like && Array.isArray(post.my_like) 
      ? post.my_like.some((l: any) => l.user_id === currentUserId) 
      : false;
  
  const postUser = post.user || { 
    id: 'deleted', full_name: 'Usuário', avatar_url: null, username: 'user', is_verified: false 
  };

  // Garante o objeto de metadata
  const metadata = safeJsonParse(post.metadata);

  return {
    id: post.id,
    type: (post.type as PostType) || 'status',
    category: (post.category as StoryCategory) || 'all',
    user: {
      id: postUser.id,
      name: postUser.full_name,
      avatar_url: postUser.avatar_url,
      username: postUser.nickname ? `@${postUser.nickname}` : `@${postUser.username}`, 
      isVerified: postUser.is_verified
    },
    createdAt: new Date(post.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    
    // Conteúdo
    content: post.content || '',
    mediaUrl: post.media_url,
    isVideo: post.is_video,
    title: post.title,
    subtitle: post.subtitle,
    coverImage: post.cover_image,
    rating: post.rating,
    
    // Metadados
    progress: post.progress,
    metadata: metadata, // JSON seguro
    characters: post.characters || [],
    externalLink: post.external_link,
    
    // Métricas
    likes: post.likes?.[0]?.count || 0,
    commentsCount: post.comments?.[0]?.count || 0,
    shares: 0,
    isLiked: amILiked,
    isSaved: false,
    tags: post.tags || []
  };
};

// --- 1. BUSCAR FEED ---
export async function getStoriesFeed(category: string = 'all', limit: number = 20, targetUserId?: string): Promise<StoryPost[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('stories_posts')
    .select(`
      *,
      user:profiles!stories_posts_user_id_fkey (id, full_name, avatar_url, nickname, is_verified, username:nickname),
      likes:stories_likes(count),
      comments:stories_comments(count),
      my_like:stories_likes(user_id)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (targetUserId) {
    query = query.eq('user_id', targetUserId);
  } else if (category !== 'all') {
    if (['movies', 'series', 'anime'].includes(category)) {
        query = query.in('category', ['movies', 'series', 'anime']);
    } else {
        query = query.eq('category', category);
    }
  }

  const { data, error } = await query;
  if (error) { console.error('Erro feed:', error); return []; }
  
  return (data || []).map(p => mapPost(p, user.id));
}

// --- 2. BUSCAR POST ÚNICO ---
export async function getPostById(postId: string): Promise<StoryPost | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('stories_posts')
    .select(`
      *,
      user:profiles!stories_posts_user_id_fkey (id, full_name, avatar_url, nickname, is_verified, username:nickname),
      likes:stories_likes(count),
      comments:stories_comments(count),
      my_like:stories_likes(user_id)
    `)
    .eq('id', postId).single();

  if (error || !data) return null;
  return mapPost(data, user?.id);
}

// --- 3. CRIAR POST ---
export async function createStoryPost(postData: Partial<StoryPost>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autorizado');

  const { error } = await supabase.from('stories_posts').insert({
    user_id: user.id,
    content: postData.content,
    category: postData.category || 'all',
    type: postData.type || 'status', // Essencial para o layout
    media_url: postData.mediaUrl,
    cover_image: postData.coverImage,
    is_video: postData.isVideo || false,
    title: postData.title,
    subtitle: postData.subtitle,
    rating: postData.rating,
    progress: postData.progress,
    metadata: postData.metadata, // Supabase lida com o JSONB
    characters: postData.characters,
    external_link: postData.externalLink,
    tags: postData.tags || []
  });

  if (error) { 
      console.error('Erro create:', error); 
      throw new Error('Falha ao publicar'); 
  }
  revalidatePath('/dashboard/applications/global/stories');
}

// --- 4. LIKE ---
export async function togglePostLike(postId: string, currentState: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  if (currentState) {
    await supabase.from('stories_likes').delete().match({ post_id: postId, user_id: user.id });
  } else {
    await supabase.from('stories_likes').upsert({ post_id: postId, user_id: user.id }, { onConflict: 'post_id, user_id' });
  }
  revalidatePath('/dashboard/applications/global/stories');
}