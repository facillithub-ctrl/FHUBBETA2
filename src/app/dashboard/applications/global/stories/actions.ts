"use server";

import createClient from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { StoryPost, StoryCategory, BookPostType } from './types';

// --- CONSTANTES ---
const FEED_PATH = '/dashboard/applications/global/stories';

// --- HELPER: Parse Seguro de Metadata ---
// Evita que a aplicação quebre se o JSON no banco estiver inválido
const safeMetadataParse = (data: any) => {
  if (!data) return {};
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch (error) {
    console.warn("Aviso: Falha ao processar metadata do post.", error);
    return {};
  }
};

// --- MAPPER CENTRALIZADO ---
// Transforma os dados "brutos" do Supabase no nosso tipo StoryPost
const mapToStoryPost = (row: any, currentUserId?: string): StoryPost => {
  const isLikedByMe = row.my_like && Array.isArray(row.my_like) 
    ? row.my_like.some((l: any) => l.user_id === currentUserId) 
    : false;

  const user = row.user || { 
    id: 'unknown', full_name: 'Usuário Desconhecido', avatar_url: null, nickname: 'user', is_verified: false 
  };

  return {
    id: row.id,
    type: (row.type as BookPostType) || 'status', 
    category: (row.category as StoryCategory) || 'all',
    
    user: {
      id: user.id,
      name: user.full_name,
      avatar_url: user.avatar_url,
      username: user.nickname ? `@${user.nickname}` : `@${user.username || 'user'}`,
      isVerified: user.is_verified,
      // Se tiver contadores no profile, adicione aqui
    },
    
    createdAt: new Date(row.created_at).toLocaleDateString('pt-BR', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    }),

    // Conteúdo Principal
    content: row.content || '',
    title: row.title,           
    subtitle: row.subtitle,     
    coverImage: row.cover_image, 
    mediaUrl: row.media_url,
    isVideo: row.is_video,

    // Metadata (Onde vivem os dados específicos dos formatos)
    metadata: safeMetadataParse(row.metadata), 
    
    // Engajamento
    likes: row.likes?.[0]?.count || 0,
    commentsCount: row.comments?.[0]?.count || 0,
    isLiked: isLikedByMe,
    isSaved: false, // Implementar lógica de salvos se houver tabela
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
      user:profiles!stories_posts_user_id_fkey (id, full_name, avatar_url, nickname, is_verified, username:nickname),
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
    console.error('Erro ao carregar feed:', error);
    return [];
  }
  
  return (data || []).map(row => mapToStoryPost(row, user?.id));
}

// --- 2. BUSCAR POST ÚNICO (Para Modais/Links) ---
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
    .eq('id', postId)
    .single();

  if (error || !data) return null;
  return mapToStoryPost(data, user?.id);
}

// --- 3. CRIAR POST (Publicação) ---
export async function createStoryPost(postData: Partial<StoryPost>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Sessão expirada. Faça login novamente.');

  // Validação básica
  if (!postData.content && !postData.coverImage && !postData.title && !postData.metadata) {
     throw new Error('O post precisa ter conteúdo.');
  }

  // Preparar Payload para o Supabase
  // Convertendo camelCase do TS para snake_case do SQL
  const payload = {
    user_id: user.id,
    category: postData.category || 'all',
    type: postData.type || 'status', // Essencial para o Dispatcher saber qual layout usar
    
    content: postData.content,
    title: postData.title,
    subtitle: postData.subtitle,
    cover_image: postData.coverImage,
    media_url: postData.mediaUrl,
    is_video: postData.isVideo || false,
    
    // O campo metadata armazena todo o resto (estrelas, mood, ranking items, etc)
    // O Supabase converte automaticamente objetos JS para JSONB
    metadata: postData.metadata || {},
    
    // Mantendo compatibilidade com colunas legadas se existirem e você quiser preenchê-las
    rating: postData.metadata?.rating, 
  };

  const { error } = await supabase.from('stories_posts').insert(payload);

  if (error) { 
    console.error('Erro ao criar post:', error); 
    throw new Error('Não foi possível publicar agora.'); 
  }

  revalidatePath(FEED_PATH);
}

// --- 4. INTERAÇÕES (Like) ---
export async function togglePostLike(postId: string, currentLikedState: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    if (currentLikedState) {
      // Remove like
      await supabase.from('stories_likes')
        .delete()
        .match({ post_id: postId, user_id: user.id });
    } else {
      // Adiciona like
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