// CAMINHO: src/app/dashboard/applications/global/stories/actions.ts
"use server";

import createClient from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { StoryPost, PostType, StoryCategory } from './types';

// --- MAPPER: Converte dados do Supabase (snake_case) para o Frontend (camelCase) ---
const mapPost = (post: any, currentUserId?: string): StoryPost => {
  const amILiked = post.my_like && Array.isArray(post.my_like) 
      ? post.my_like.some((l: any) => l.user_id === currentUserId) 
      : false;
  
  // Tratamento de usuário deletado ou nulo
  const postUser = post.user || { 
    id: 'deleted', 
    full_name: 'Usuário Desconhecido', 
    avatar_url: null, 
    username: 'unknown', 
    is_verified: false 
  };

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
    // Formatação de data
    createdAt: new Date(post.created_at).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short',
      year: new Date(post.created_at).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    }),
    
    // Campos Principais
    content: post.content,
    mediaUrl: post.media_url,
    isVideo: post.is_video,
    title: post.title,
    subtitle: post.subtitle,
    coverImage: post.cover_image,
    rating: post.rating,
    
    // Estruturas Complexas (JSONB)
    progress: post.progress, // ReadingProgress
    metadata: post.metadata || {}, // Garante objeto vazio se null para evitar erros
    characters: post.characters || [],
    externalLink: post.external_link,
    
    tags: post.tags || [],
    
    // Métricas
    likes: post.likes?.[0]?.count || 0,
    commentsCount: post.comments?.[0]?.count || 0,
    shares: 0, // Placeholder se não houver coluna
    
    // Estado do Usuário
    isLiked: amILiked,
    isSaved: false
  };
};

// --- 1. BUSCAR FEED ---
export async function getStoriesFeed(
  category: string = 'all', 
  limit: number = 20, 
  targetUserId?: string
): Promise<StoryPost[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Se não estiver logado, retorna array vazio ou trata conforme regra de negócio
  if (!user) return [];

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

  // Filtros
  if (targetUserId) {
    query = query.eq('user_id', targetUserId);
  } else if (category !== 'all') {
    // Agrupamento de categorias de vídeo/entretenimento visual
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

// --- 2. BUSCAR POST ÚNICO (Deep Link / Modal) ---
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

  if (error || !data) {
    console.error('Post não encontrado:', error);
    return null;
  }
  
  return mapPost(data, user?.id);
}

// --- 3. CRIAR POST (Suporte a Metadata Estendido) ---
export async function createStoryPost(postData: Partial<StoryPost>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autorizado');

  // Preparar objeto para inserção no banco
  // Mapeamos camelCase (Frontend) -> snake_case (Banco)
  const dbPayload = {
    user_id: user.id,
    content: postData.content,
    category: postData.category || 'all',
    type: postData.type || 'status',
    
    // Mídia e Capa
    media_url: postData.mediaUrl,
    cover_image: postData.coverImage,
    is_video: postData.isVideo || false,
    
    // Metadados principais
    title: postData.title,
    subtitle: postData.subtitle, // Usado como "Autor" em livros simples
    rating: postData.rating,
    
    // JSONBs
    progress: postData.progress,
    metadata: postData.metadata, // Aqui vai o JSON completo (ranking, price, etc)
    characters: postData.characters,
    external_link: postData.externalLink,
    
    // Arrays
    tags: postData.tags || []
  };

  const { error } = await supabase
    .from('stories_posts')
    .insert(dbPayload);

  if (error) {
    console.error('Erro ao criar post:', error);
    throw new Error('Falha ao publicar');
  }

  revalidatePath('/dashboard/applications/global/stories');
}

// --- 4. LIKE / DESLIKE ---
export async function togglePostLike(postId: string, currentState: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return;

  try {
    if (currentState) {
      // Remover Like
      await supabase
        .from('stories_likes')
        .delete()
        .match({ post_id: postId, user_id: user.id });
    } else {
      // Adicionar Like (ignore se já existir)
      await supabase
        .from('stories_likes')
        .upsert(
          { post_id: postId, user_id: user.id }, 
          { onConflict: 'post_id, user_id' }
        );
    }
  } catch (error) {
    console.error('Erro ao curtir:', error);
  }
  
  // Revalida para manter contadores sincronizados em outras sessões
  revalidatePath('/dashboard/applications/global/stories');
}

// --- 5. DELETAR POST (Opcional, mas útil) ---
export async function deleteStoryPost(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('stories_posts')
    .delete()
    .match({ id: postId, user_id: user.id }); // Garante que só o dono deleta

  if (error) throw error;
  
  revalidatePath('/dashboard/applications/global/stories');
}