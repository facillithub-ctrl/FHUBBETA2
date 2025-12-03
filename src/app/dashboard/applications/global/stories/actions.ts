// CAMINHO: src/app/dashboard/applications/global/stories/actions.ts
'use server';

import createClient from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { StoryPost } from './types';

export async function getStoriesFeed(): Promise<StoryPost[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('stories_posts')
    .select(`
      *,
      profiles:user_id (full_name, avatar_url),
      likes:stories_likes(user_id)
    `)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Erro ao buscar feed:', error);
    return [];
  }

  // Mapear para adicionar flag se o usuário atual curtiu
  return data.map((post: any) => ({
    ...post,
    user_has_liked: post.likes.some((like: any) => like.user_id === user.id),
    likes_count: post.likes.length // Simplificação (ideal usar count no banco para escala)
  }));
}

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const content = formData.get('content') as string;
  const bookTitle = formData.get('book_title') as string;

  if (!content && !bookTitle) return;

  await supabase.from('stories_posts').insert({
    user_id: user.id,
    content,
    book_title: bookTitle || null,
    // Adicione outros campos conforme necessário
  });

  revalidatePath('/dashboard/applications/global/stories');
}

export async function toggleLike(postId: string, currentLikeStatus: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  if (currentLikeStatus) {
    await supabase.from('stories_likes').delete().match({ post_id: postId, user_id: user.id });
  } else {
    await supabase.from('stories_likes').insert({ post_id: postId, user_id: user.id });
  }
  
  revalidatePath('/dashboard/applications/global/stories');
}