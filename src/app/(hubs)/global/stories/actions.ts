"use server";

import createClient from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { StoryPost, StoryCategory, Comment, UserProfile } from './types';

const FEED_PATH = '/global/stories';

// --- HELPER: Mapeamento Seguro de Dados ---
const mapToStoryPost = (row: any, currentUserId?: string): StoryPost => {
  // Verifica se o usuário atual deu like
  const isLikedByMe = row.my_like && Array.isArray(row.my_like) 
    ? row.my_like.some((l: any) => l.user_id === currentUserId) 
    : false;

  // Fallback seguro para user (evita crash se a relação vier vazia)
  const userData = row.user || {};
  
  const userProfile: UserProfile = {
    id: userData.id || 'unknown',
    name: userData.full_name || 'Usuário Desconhecido',
    avatar_url: userData.avatar_url || null,
    username: userData.nickname || userData.username || 'user',
    isVerified: !!userData.is_verified,
    // Tenta pegar o badge de verificação de várias formas para compatibilidade
    verification_badge: userData.verification_badge || userData.badge || null,
    role: userData.role || 'student',
    bio: userData.bio || '',
    followers: 0, // Campos opcionais com padrão
    following: 0
  };

  return {
    id: row.id,
    type: row.type || 'status', 
    category: row.category || 'all',
    user: userProfile,
    // Formatação de data amigável
    createdAt: new Date(row.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
    content: row.content || '',
    title: row.title,           
    subtitle: row.subtitle,     
    coverImage: row.cover_image, 
    // Garante que metadata seja um objeto válido
    metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata || {}), 
    likes: row.likes?.[0]?.count || 0,
    commentsCount: row.comments?.[0]?.count || 0,
    isLiked: isLikedByMe,
    isSaved: false,
  };
};

// --- 1. BUSCAR FEED ---
export async function getStoriesFeed(category: StoryCategory = 'all', limit: number = 20): Promise<StoryPost[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('stories_posts')
    .select(`
      *,
      user:profiles!stories_posts_user_id_fkey (
        id, full_name, avatar_url, nickname, is_verified, role, verification_badge
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
    return [];
  }
  
  return (data || []).map(row => mapToStoryPost(row, user?.id));
}

// --- 2. CRIAR POST ---
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

  let coverImageUrl = null;

  if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
          .from('stories-media')
          .upload(fileName, file);

      if (!uploadError) {
          const { data } = supabase.storage
              .from('stories-media')
              .getPublicUrl(fileName);
          coverImageUrl = data.publicUrl;
      }
  }

  let metadata = {};
  try { metadata = JSON.parse(metadataStr || '{}'); } catch {}

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

  if (error) console.error("Erro ao criar post:", error);

  revalidatePath(FEED_PATH);
}

// --- 3. DELETAR POST (Esta era a função que faltava/dava erro) ---
export async function deleteStoryPost(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  // Deleta apenas se o post pertencer ao usuário logado
  await supabase.from('stories_posts').delete().match({ id: postId, user_id: user.id });
  revalidatePath(FEED_PATH);
}

// --- 4. LIKE / DESLIKE ---
export async function togglePostLike(postId: string, currentLikedState?: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Se o estado atual não for passado, verifica no banco
  let shouldDelete = currentLikedState;
  
  if (shouldDelete === undefined) {
      const { data } = await supabase
        .from('stories_likes')
        .select('id')
        .match({ post_id: postId, user_id: user.id })
        .single();
      shouldDelete = !!data;
  }

  if (shouldDelete) {
    await supabase.from('stories_likes').delete().match({ post_id: postId, user_id: user.id });
  } else {
    await supabase.from('stories_likes').upsert(
        { post_id: postId, user_id: user.id }, 
        { onConflict: 'post_id, user_id' }
    );
  }
  
  revalidatePath(FEED_PATH);
}

// --- 5. COMENTÁRIOS (GET) ---
export async function getPostComments(postId: string): Promise<Comment[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('stories_comments')
    .select(`
        id, text, created_at,
        user:profiles!stories_comments_user_id_fkey (
            id, full_name, avatar_url, nickname, is_verified, verification_badge
        )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
      console.error("Erro ao buscar comentários:", error);
      return [];
  }

  return (data || []).map((c: any) => ({
      id: c.id,
      text: c.text,
      createdAt: new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' }),
      user: {
          id: c.user?.id || 'unknown',
          name: c.user?.full_name || 'Anônimo',
          username: c.user?.nickname || 'user',
          avatar_url: c.user?.avatar_url || null,
          verification_badge: c.user?.verification_badge || null
      }
  }));
}

// --- 6. COMENTÁRIOS (ADD) ---
export async function addPostComment(postId: string, text: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('stories_comments')
    .insert({ post_id: postId, user_id: user.id, text })
    .select(`
        id, text, created_at,
        user:profiles!stories_comments_user_id_fkey (
            id, full_name, avatar_url, nickname, is_verified, verification_badge
        )
    `)
    .single();

  if (error) {
      console.error("Erro ao adicionar comentário:", error);
      return null;
  }

  return {
      id: data.id,
      text: data.text,
      createdAt: 'Agora',
      user: {
          id: data.user.id,
          name: data.user.full_name,
          username: data.user.nickname,
          avatar_url: data.user.avatar_url,
          verification_badge: data.user.verification_badge
      }
  };
}