"use server";

import createClient from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { StoryPost, StoryCategory, VerificationType, CommentData } from './types';

const FEED_PATH = '/dashboard/applications/global/stories';

// --- HELPER DE MAPEAMENTO ---
const mapToStoryPost = (row: any, currentUserId?: string): StoryPost => {
  const isLikedByMe = row.my_like && Array.isArray(row.my_like) 
    ? row.my_like.some((l: any) => l.user_id === currentUserId) 
    : false;

  const user = row.user || { 
    id: 'unknown', full_name: 'Usuário Desconhecido', avatar_url: null, username: 'user' 
  };

  const role = user.role || 'student';
  const isVerified = !!user.is_verified;
  const badgeValue: VerificationType = user.verification_badge || user.badge || null;

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
      verification_badge: badgeValue,
      badge: badgeValue,
      role
    },
    createdAt: new Date(row.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    content: row.content || '',
    title: row.title,           
    subtitle: row.subtitle,     
    coverImage: row.cover_image, 
    metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata || {}), 
    likes: row.likes?.[0]?.count || 0,
    commentsCount: row.comments?.[0]?.count || 0,
    isLiked: isLikedByMe,
    isSaved: false,
  };
};

// --- BUSCAR FEED ---
export async function getStoriesFeed(
  category: StoryCategory = 'all', 
  limit: number = 20
): Promise<StoryPost[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('stories_posts')
    .select(`
      *,
      user:profiles!stories_posts_user_id_fkey (
        id, full_name, avatar_url, nickname, is_verified, role, verification_badge, badge 
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
    // Fallback simples se der erro
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
    .select(`
        *, 
        user:profiles!stories_posts_user_id_fkey (
            id, full_name, avatar_url, nickname, is_verified, role, verification_badge, badge
        ), 
        likes:stories_likes(count), 
        comments:stories_comments(count), 
        my_like:stories_likes(user_id)
    `)
    .eq('id', postId)
    .single();

  if (error || !data) return null;
  return mapToStoryPost(data, user?.id);
}

// --- CRIAR POST (COM UPLOAD) ---
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

  let metadata = {};
  if (metadataStr) {
      try { metadata = JSON.parse(metadataStr); } catch (e) { console.error("Metadata error", e); }
  }
  
  let coverImageUrl = null;
  if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('stories-media').upload(fileName, file);
      if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('stories-media').getPublicUrl(fileName);
          coverImageUrl = publicUrl;
      }
  }

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

  if (error) {
      console.error("Erro create:", error);
      throw error;
  }
  revalidatePath(FEED_PATH);
}

// --- DELETAR ---
export async function deleteStoryPost(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  await supabase.from('stories_posts').delete().match({ id: postId, user_id: user.id });
  revalidatePath(FEED_PATH);
}

// --- LIKE ---
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

// ============================================================================
// NOVAS FUNÇÕES: COMENTÁRIOS REAIS
// ============================================================================

export async function getPostComments(postId: string): Promise<CommentData[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('stories_comments')
    .select(`
      id,
      content,
      created_at,
      likes_count,
      parent_id,
      user:profiles!stories_comments_user_id_fkey (
        id, full_name, avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Erro ao buscar comentários:", error);
    return [];
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const commentsMap = data.map((row: any) => ({
    id: row.id,
    user: {
      name: row.user?.full_name || 'Usuário',
      avatar: row.user?.avatar_url || '/assets/images/accont.svg'
    },
    text: row.content,
    likes: row.likes_count || 0,
    timeAgo: timeAgo(row.created_at),
    replies: [],
    parentId: row.parent_id
  }));

  const rootComments: CommentData[] = [];
  const map: Record<string, CommentData> = {};

  commentsMap.forEach((c: any) => map[c.id] = c);
  commentsMap.forEach((c: any) => {
    if (c.parentId && map[c.parentId]) {
      map[c.parentId].replies = map[c.parentId].replies || [];
      map[c.parentId].replies!.push(c);
    } else {
      rootComments.push(c);
    }
  });

  return rootComments;
}

export async function addComment(postId: string, text: string, parentId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase.from('stories_comments').insert({
    post_id: postId,
    user_id: user.id,
    content: text,
    parent_id: parentId || null
  });

  if (error) {
    console.error("Erro ao comentar:", error);
    throw error;
  }
  revalidatePath(FEED_PATH);
}
// ============================================================================
// AÇÕES DA COMUNIDADE (CLUBE, EVENTOS, RANKING)
// ============================================================================

// 1. Buscar o Clube do Livro Ativo
export async function getActiveBookClub() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Busca o clube ativo
  const { data: club, error } = await supabase
    .from('book_clubs')
    .select('*')
    .eq('status', 'active')
    .single();

  if (error || !club) return null;

  // Busca progresso do usuário neste clube
  let progress = 0;
  if (user) {
    const { data: session } = await supabase
      .from('reading_sessions')
      .select('current_chapter')
      .eq('book_club_id', club.id)
      .eq('user_id', user.id)
      .single();
    
    if (session) {
       progress = Math.round((session.current_chapter / club.total_chapters) * 100);
    }
  }

  return { ...club, userProgress: progress };
}

// 2. Buscar Próximos Eventos
export async function getUpcomingEvents() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('community_events')
    .select(`
      *,
      host:profiles!community_events_host_id_fkey(full_name, avatar_url)
    `)
    .gte('start_time', new Date().toISOString()) // Apenas futuros
    .order('start_time', { ascending: true })
    .limit(5);

  if (error) {
    console.error("Erro events:", error);
    return [];
  }
  return data;
}

// 3. Buscar Ranking de Leitores (Top 5)
export async function getTopReaders() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_reading_profiles')
    .select(`
      total_books_read,
      reading_streak,
      user:profiles!user_reading_profiles_user_id_fkey(full_name, avatar_url, nickname)
    `)
    .order('total_books_read', { ascending: false })
    .limit(5);

  if (error) return [];
  return data;
}

// 4. Entrar no Clube / Atualizar Progresso
export async function joinOrUpdateBookClub(clubId: string, chapter: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if(!user) return;

    await supabase.from('reading_sessions').upsert({
        user_id: user.id,
        book_club_id: clubId,
        current_chapter: chapter,
        last_read_at: new Date().toISOString()
    }, { onConflict: 'user_id, book_club_id' });
    
    revalidatePath(FEED_PATH);
}