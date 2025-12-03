"use server";

import createClient from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { StoryPost, StoryCategory, BookPostType, GamePostType } from './types';

// --- CONSTANTES ---
const FEED_PATH = '/dashboard/applications/global/stories';

// --- HELPER: Parse Seguro de Metadata ---
const safeMetadataParse = (data: any) => {
  if (!data) return {};
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
};

// --- MAPPER CENTRALIZADO ---
const mapToStoryPost = (row: any, currentUserId?: string): StoryPost => {
  const isLikedByMe = row.my_like && Array.isArray(row.my_like) 
    ? row.my_like.some((l: any) => l.user_id === currentUserId) 
    : false;

  const user = row.user || { 
    id: 'unknown', full_name: 'Usuário Desconhecido', avatar_url: null, nickname: 'user', is_verified: false, role: 'student' 
  };

  // --- LÓGICA DE DEFINIÇÃO DO BADGE ---
  // Prioridade: 1. Aluno Destaque (red) -> 2. Professor (green) -> 3. Verificado Padrão (blue)
  let badgeValue = null;
  
  // Se existir uma coluna 'badge' explícita no banco, use-a:
  if (user.badge) {
      badgeValue = user.badge;
  } 
  // Caso contrário, infere baseado no role/status
  else if (user.role === 'teacher') {
      badgeValue = 'green';
  } else if (user.is_verified) {
      badgeValue = 'blue';
  }
  // Você pode adicionar lógica para 'red' aqui se tiver um campo is_star ou similar

  return {
    id: row.id,
    // Casting seguro para os tipos definidos
    type: (row.type as any) || 'status', 
    category: (row.category as any) || 'all',
    
    user: {
      id: user.id,
      name: user.full_name,
      avatar_url: user.avatar_url,
      username: user.nickname ? `@${user.nickname}` : `@${user.username || 'user'}`,
      isVerified: user.is_verified,
      role: user.role,
      badge: badgeValue, // Campo essencial para o componente
    },
    
    createdAt: new Date(row.created_at).toLocaleDateString('pt-BR', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    }),

    content: row.content || '',
    title: row.title,           
    subtitle: row.subtitle,     
    coverImage: row.cover_image, 
    mediaUrl: row.media_url,
    isVideo: row.is_video,

    metadata: safeMetadataParse(row.metadata), 
    
    likes: row.likes?.[0]?.count || 0,
    commentsCount: row.comments?.[0]?.count || 0,
    isLiked: isLikedByMe,
    isSaved: false,
  };
};

// --- 1. BUSCAR FEED ---
export async function getStoriesFeed(
  category: StoryCategory = 'all', 
  limit: number = 20, 
  targetUserId?: string
): Promise<StoryPost[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('stories_posts')
    .select(`
      id, content, type, category, created_at, 
      title, subtitle, cover_image, media_url, is_video, metadata,
      user:profiles!stories_posts_user_id_fkey (id, full_name, avatar_url, nickname, is_verified, role), 
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
    console.error('Erro ao carregar feed:', error);
    return [];
  }
  
  return (data || []).map(row => mapToStoryPost(row, user?.id));
}

// --- 2. BUSCAR POST ÚNICO ---
export async function getPostById(postId: string): Promise<StoryPost | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('stories_posts')
    .select(`
      *,
      user:profiles!stories_posts_user_id_fkey (id, full_name, avatar_url, nickname, is_verified, role),
      likes:stories_likes(count),
      comments:stories_comments(count),
      my_like:stories_likes(user_id)
    `)
    .eq('id', postId)
    .single();

  if (error || !data) return null;
  return mapToStoryPost(data, user?.id);
}

// --- 3. DELETE POST ---
export async function deleteStoryPost(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autorizado');

  const { error } = await supabase
    .from('stories_posts')
    .delete()
    .match({ id: postId, user_id: user.id });

  if (error) {
      console.error('Erro ao deletar:', error);
      throw new Error('Erro ao excluir post');
  }
  revalidatePath(FEED_PATH);
}

// --- 4. CRIAR POST ---
export async function createStoryPost(postData: Partial<StoryPost>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Sessão expirada.');

  if (!postData.content && !postData.coverImage && !postData.title && !postData.metadata) {
     throw new Error('O post precisa ter conteúdo.');
  }

  const payload = {
    user_id: user.id,
    category: postData.category || 'all',
    type: postData.type || 'status', 
    
    content: postData.content,
    title: postData.title,
    subtitle: postData.subtitle,
    cover_image: postData.coverImage,
    media_url: postData.mediaUrl,
    is_video: postData.isVideo || false,
    
    metadata: postData.metadata || {},
  };

  const { error } = await supabase.from('stories_posts').insert(payload);

  if (error) { 
    console.error('Erro ao criar post:', error); 
    throw new Error('Não foi possível publicar agora.'); 
  }

  revalidatePath(FEED_PATH);
}

// --- 5. INTERAÇÕES (Like) ---
export async function togglePostLike(postId: string, currentLikedState: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    if (currentLikedState) {
      await supabase.from('stories_likes')
        .delete()
        .match({ post_id: postId, user_id: user.id });
    } else {
      await supabase.from('stories_likes')
        .upsert(
          { post_id: postId, user_id: user.id }, 
          { onConflict: 'post_id, user_id' }
        );
    }
    revalidatePath(FEED_PATH);
  } catch (e) {
    console.error('Erro no like:', e);
  }
}