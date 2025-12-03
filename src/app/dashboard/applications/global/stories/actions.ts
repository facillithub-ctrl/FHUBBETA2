"use server";

import createClient from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { StoryPost } from './types';

// Buscar o Feed de Histórias
export async function getStoriesFeed(limit = 20): Promise<StoryPost[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('stories_posts')
    .select(`
      id,
      content,
      created_at,
      type,
      category,
      media_url,
      is_video,
      title,
      subtitle,
      cover_image,
      rating,
      progress,
      metadata,
      characters,
      tags,
      external_link,
      user:user_id (
        id,
        full_name,
        avatar_url,
        username,
        is_verified
      ),
      likes:stories_likes(count),
      comments:stories_comments(count),
      my_like:stories_likes!inner(user_id)
    `)
    .eq('my_like.user_id', user.id) 
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Erro ao buscar feed:', error);
    return [];
  }

  // Mapeamento dos dados
  return data.map((post: any) => ({
    id: post.id,
    type: post.type || 'status',
    category: post.category || 'all',
    user: {
      id: post.user.id,
      name: post.user.full_name,
      avatar_url: post.user.avatar_url,
      username: post.user.username || '@usuario',
      isVerified: post.user.is_verified
    },
    createdAt: new Date(post.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    content: post.content,
    mediaUrl: post.media_url,
    isVideo: post.is_video,
    title: post.title,
    subtitle: post.subtitle,
    coverImage: post.cover_image,
    rating: post.rating,
    progress: post.progress, // JSONB
    metadata: post.metadata, // JSONB
    characters: post.characters,
    externalLink: post.external_link,
    tags: post.tags,
    likes: post.likes[0]?.count || 0,
    commentsCount: post.comments[0]?.count || 0,
    shares: 0, 
    isLiked: post.my_like?.length > 0,
    isSaved: false
  }));
}

// Criar um novo Post/Review
export async function createStoryPost(postData: Partial<StoryPost>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autorizado');

  const { error } = await supabase.from('stories_posts').insert({
    user_id: user.id,
    content: postData.content,
    type: postData.type || 'status',
    category: postData.category || 'all',
    media_url: postData.mediaUrl,
    is_video: postData.isVideo || false,
    title: postData.title,
    subtitle: postData.subtitle,
    cover_image: postData.coverImage,
    rating: postData.rating,
    progress: postData.progress, // JSONB
    metadata: postData.metadata, // JSONB
    characters: postData.characters, // JSONB
    tags: postData.tags, 
    external_link: postData.externalLink // JSONB
  });

  if (error) {
    console.error('Erro ao criar post:', error);
    throw new Error('Falha ao publicar');
  }

  revalidatePath('/dashboard/applications/global/stories');
}

// Alternar Like
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