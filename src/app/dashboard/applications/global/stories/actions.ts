// CAMINHO: src/app/dashboard/applications/global/stories/actions.ts
"use server";

import createClient from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { StoryPost, PostType, StoryCategory } from './types';

// --- HELPER: Parse Seguro de Metadata ---
// Garante que o metadata seja sempre um objeto, mesmo que o banco retorne string ou null
const parseMetadata = (meta: any) => {
  if (!meta) return {};
  
  // Se o Supabase retornar como string JSON (acontece em algumas versões/configurações)
  if (typeof meta === 'string') {
    try {
      return JSON.parse(meta);
    } catch (e) {
      console.error("Erro ao fazer parse do metadata:", e);
      return {};
    }
  }
  
  // Se já for objeto
  return meta;
};

// --- MAPPER: Converte dados do Banco (snake_case) para Frontend (camelCase) ---
const mapPost = (post: any, currentUserId?: string): StoryPost => {
  const amILiked = post.my_like && Array.isArray(post.my_like) 
      ? post.my_like.some((l: any) => l.user_id === currentUserId) 
      : false;
  
  // Proteção para usuário deletado ou nulo
  const postUser = post.user || { 
    id: 'deleted', 
    full_name: 'Usuário Desconhecido', 
    avatar_url: null, 
    username: 'unknown', 
    is_verified: false 
  };

  // Garante que metadata seja um objeto válido
  const safeMetadata = parseMetadata(post.metadata);

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
    
    // Conteúdo Principal (Fallback para string vazia se null)
    content: post.content || '', 
    mediaUrl: post.media_url,
    isVideo: post.is_video,
    title: post.title,
    subtitle: post.subtitle,
    coverImage: post.cover_image,
    rating: post.rating,
    
    // Estruturas Complexas (JSONB)
    progress: post.progress,
    metadata: safeMetadata, // Usa o metadata tratado
    characters: post.characters || [],
    externalLink: post.external_link,
    
    // Arrays
    tags: post.tags || [],
    
    // Métricas
    likes: post.likes?.[0]?.count || 0,
    commentsCount: post.comments?.[0]?.count || 0,
    shares: 0, 
    
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

  // Se não estiver logado, retorna array vazio (ou trate conforme sua regra de negócio)
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

// --- 2. BUSCAR POST ÚNICO ---
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
    console.error('Post não encontrado ou erro:', error);
    return null;
  }
  
  return mapPost(data, user?.id);
}

// --- 3. CRIAR POST ---
export async function createStoryPost(postData: Partial<StoryPost>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autorizado');

  // Preparar payload para o banco
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
    subtitle: postData.subtitle,
    rating: postData.rating,
    
    // JSONBs e Arrays
    progress: postData.progress,
    metadata: postData.metadata, // O Supabase lida com a conversão de Obj JS para JSONB
    characters: postData.characters,
    external_link: postData.externalLink,
    tags: postData.tags || []
  };

  const { error } = await supabase
    .from('stories_posts')
    .insert(dbPayload);

  if (error) {
    console.error('Erro ao criar post no Supabase:', error);
    throw new Error('Falha ao publicar postagem');
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
      // Adicionar Like (upsert para evitar duplicatas)
      await supabase
        .from('stories_likes')
        .upsert(
          { post_id: postId, user_id: user.id }, 
          { onConflict: 'post_id, user_id' }
        );
    }
  } catch (error) {
    console.error('Erro ao curtir post:', error);
  }
  
  revalidatePath('/dashboard/applications/global/stories');
}

// --- 5. DELETAR POST ---
export async function deleteStoryPost(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('stories_posts')
    .delete()
    .match({ id: postId, user_id: user.id });

  if (error) {
    console.error('Erro ao deletar post:', error);
    throw error;
  }
  
  revalidatePath('/dashboard/applications/global/stories');
}