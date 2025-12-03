"use server";

import createClient from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { StoryPost } from './types';

// Função auxiliar para mapear dados do banco para o tipo do Front
const mapPost = (post: any, currentUserId?: string) => {
  const amILiked = post.my_like && Array.isArray(post.my_like) 
      ? post.my_like.some((l: any) => l.user_id === currentUserId) 
      : false;
  
  // Proteção contra usuário deletado
  const postUser = post.user || { 
    id: 'deleted', 
    full_name: 'Usuário', 
    avatar_url: null, 
    username: 'user', // sem @ para evitar erros
    is_verified: false 
  };

  return {
    id: post.id,
    type: post.type || 'status',
    category: post.category || 'all',
    user: {
      id: postUser.id,
      name: postUser.full_name,
      avatar_url: postUser.avatar_url,
      username: postUser.nickname ? `@${postUser.nickname}` : `@${postUser.username}`, 
      isVerified: postUser.is_verified // Mapeando snake_case para camelCase
    },
    createdAt: new Date(post.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    content: post.content,
    mediaUrl: post.media_url,
    isVideo: post.is_video,
    title: post.title,
    subtitle: post.subtitle,
    coverImage: post.cover_image,
    rating: post.rating,
    progress: post.progress,
    metadata: post.metadata,
    characters: post.characters,
    tags: post.tags,
    externalLink: post.external_link,
    likes: post.likes[0]?.count || 0,
    commentsCount: post.comments[0]?.count || 0,
    shares: 0,
    isLiked: amILiked,
    isSaved: false
  };
};

// 1. Buscar Feed (Com correção da relação profiles)
export async function getStoriesFeed(
  category: string = 'all', 
  limit: number = 20, 
  targetUserId?: string
): Promise<StoryPost[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // OBS: Usando a relação correta 'profiles' em vez de 'user_id'
  let query = supabase
    .from('stories_posts')
    .select(`
      *,
      user:profiles!stories_posts_user_id_fkey (
        id, full_name, avatar_url, nickname, is_verified, username:nickname
      ),
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

  if (error) {
    console.error('Erro ao buscar feed:', error);
    return [];
  }

  return (data || []).map(p => mapPost(p, user.id));
}

// 2. Buscar Post Único (NECESSÁRIO para abrir o Modal de Comentários)
export async function getPostById(postId: string): Promise<StoryPost | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('stories_posts')
    .select(`
      *,
      user:profiles!stories_posts_user_id_fkey (
        id, full_name, avatar_url, nickname, is_verified, username:nickname
      ),
      likes:stories_likes(count),
      comments:stories_comments(count),
      my_like:stories_likes(user_id)
    `)
    .eq('id', postId)
    .single();

  if (error || !data) return null;
  return mapPost(data, user?.id);
}

// 3. Criar Post
export async function createStoryPost(postData: Partial<StoryPost>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autorizado');

  const { error } = await supabase.from('stories_posts').insert({
    user_id: user.id,
    content: postData.content,
    category: postData.category || 'all',
    type: postData.type || 'status',
    media_url: postData.mediaUrl,
    is_video: postData.isVideo || false,
    title: postData.title,
    subtitle: postData.subtitle,
    cover_image: postData.coverImage,
    rating: postData.rating,
    progress: postData.progress,
    metadata: postData.metadata,
    characters: postData.characters,
    tags: postData.tags, 
    external_link: postData.externalLink
  });

  if (error) throw new Error('Falha ao publicar');
  revalidatePath('/dashboard/applications/global/stories');
}

// 4. Likes
export async function togglePostLike(postId: string, currentState: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  if (currentState) {
    await supabase.from('stories_likes').delete().match({ post_id: postId, user_id: user.id });
  } else {
    await supabase.from('stories_likes').insert({ post_id: postId, user_id: user.id });
  }
  revalidatePath('/dashboard/applications/global/stories');
}