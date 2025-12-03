"use server";

import createClient from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { StoryPost, StoryCategory, VerificationType } from './types';

const FEED_PATH = '/dashboard/applications/global/stories';

// --- HELPER DE MAPEAMENTO (Banco -> Tipagem App) ---
const mapToStoryPost = (row: any, currentUserId?: string): StoryPost => {
  // Verifica se o usuário atual curtiu o post
  const isLikedByMe = row.my_like && Array.isArray(row.my_like) 
    ? row.my_like.some((l: any) => l.user_id === currentUserId) 
    : false;

  // Objeto de usuário seguro (fallback)
  const user = row.user || { 
    id: 'unknown', full_name: 'Usuário', avatar_url: null, username: 'user' 
  };

  const role = user.role || 'student';
  const isVerified = !!user.is_verified;
  
  // Lógica do Badge de Verificação
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
    metadata: row.metadata || {}, 
    likes: row.likes?.[0]?.count || 0,
    commentsCount: row.comments?.[0]?.count || 0,
    isLiked: isLikedByMe,
    isSaved: false,
  };
};

// --- BUSCAR FEED (Suporta filtro e 'all') ---
export async function getStoriesFeed(
  category: StoryCategory = 'all', 
  limit: number = 20
): Promise<StoryPost[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Query Principal
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

  // Se a categoria NÃO for 'all', filtra. Se for 'all', traz tudo (Books + Status + Reviews).
  if (category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    // Fallback: Tenta query simplificada se o banco estiver desatualizado
    if (error.code === '42703' || error.message.includes('does not exist')) {
        console.warn("⚠️ Usando query de fallback (banco desatualizado)");
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
    console.error("Erro ao buscar feed:", error);
    return [];
  }
  
  return (data || []).map(row => mapToStoryPost(row, user?.id));
}

// --- BUSCAR POST POR ID ---
export async function getPostById(postId: string): Promise<StoryPost | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('stories_posts')
    .select(`*, user:profiles!stories_posts_user_id_fkey (id, full_name, avatar_url, nickname, is_verified, role, badge), likes:stories_likes(count), comments:stories_comments(count), my_like:stories_likes(user_id)`)
    .eq('id', postId)
    .single();

  if (error || !data) return null;
  return mapToStoryPost(data, user?.id);
}

// --- CRIAR POST (COM UPLOAD DE ARQUIVO) ---
export async function createStoryPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Extrair dados do FormData
  const content = formData.get('content') as string;
  const category = (formData.get('category') as string) || 'all';
  const type = (formData.get('type') as string) || 'status';
  const file = formData.get('file') as File | null;
  const metadataStr = formData.get('metadata') as string;

  // Parse de metadados opcionais
  let metadata = {};
  if (metadataStr) {
      try { metadata = JSON.parse(metadataStr); } catch (e) { console.error("Metadata parse error", e); }
  }
  
  let coverImageUrl = null;

  // 1. Processar Upload se houver arquivo
  if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
          .from('stories-media') // Certifique-se de criar este bucket no Supabase
          .upload(fileName, file);

      if (uploadError) {
          console.error('Erro no upload da imagem:', uploadError);
          // Decide se aborta ou continua sem imagem. Aqui continuamos.
      } else {
          // Obter URL pública
          const { data: { publicUrl } } = supabase.storage
              .from('stories-media')
              .getPublicUrl(fileName);
          coverImageUrl = publicUrl;
      }
  }

  // 2. Salvar no Banco de Dados
  const { error } = await supabase.from('stories_posts').insert({
    user_id: user.id,
    category,
    type,
    content,
    cover_image: coverImageUrl,
    metadata,
  });

  if (error) {
      console.error("Erro ao criar post:", error);
      throw error;
  }

  // Revalida o cache para atualizar o feed
  revalidatePath(FEED_PATH);
}

// --- DELETAR POST ---
export async function deleteStoryPost(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  // match garante que só deleta se o ID e o user_id baterem
  await supabase.from('stories_posts').delete().match({ id: postId, user_id: user.id });
  revalidatePath(FEED_PATH);
}

// --- LIKE / UNLIKE ---
export async function togglePostLike(postId: string, currentLikedState: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  if (currentLikedState) {
    await supabase.from('stories_likes').delete().match({ post_id: postId, user_id: user.id });
  } else {
    // upsert evita erro de duplicidade
    await supabase.from('stories_likes').upsert({ post_id: postId, user_id: user.id }, { onConflict: 'post_id, user_id' });
  }
  revalidatePath(FEED_PATH);
}