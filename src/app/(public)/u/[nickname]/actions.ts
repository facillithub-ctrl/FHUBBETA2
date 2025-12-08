"use server";

import createClient from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { StoryPost } from '@/app/(hubs)/global/stories/types'; // Importando tipos corretos

// --- BUSCAR DADOS COMPLETOS DO PERFIL ---
export async function getPublicProfile(nickname: string) {
  const supabase = await createClient();

  // 1. Buscar dados base do perfil
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('nickname', nickname) 
    .maybeSingle();

  if (error || !profile) return null;

  // 2. Executar consultas em paralelo
  const [
    essaysResult, 
    testsResult, 
    gradesResult,
    storiesResult // Nova consulta para Stories
  ] = await Promise.all([
    // A: Últimas Redações
    supabase
      .from('essays')
      .select(`
        title,
        submitted_at,
        essay_corrections (final_grade)
      `)
      .eq('student_id', profile.id)
      .not('submitted_at', 'is', null) 
      .order('submitted_at', { ascending: false })
      .limit(5), // Aumentei um pouco o limite

    // B: Contagem de Simulados
    supabase
      .from('test_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', profile.id)
      .eq('status', 'completed'),

    // C: Média Geral
    supabase
      .from('essay_corrections')
      .select('final_grade, essays!inner(student_id)')
      .eq('essays.student_id', profile.id),

    // D: Posts do Stories (NOVO)
    // Reutilizamos a lógica de mapeamento do Stories Action, mas simplificada aqui
    supabase
      .from('stories_posts')
      .select(`
        *,
        user:profiles!stories_posts_user_id_fkey (
          id, full_name, avatar_url, nickname, is_verified, verification_badge, badge
        ),
        likes:stories_likes(count),
        comments:stories_comments(count)
      `)
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10)
  ]);

  // 3. Processar Média
  const grades = gradesResult.data?.map(g => g.final_grade).filter(g => g !== null && g !== undefined) || [];
  const averageGrade = grades.length > 0 
    ? Math.round(grades.reduce((a, b) => (a || 0) + (b || 0), 0) / grades.length) 
    : 0;

  // 4. Formatar Redações
  const recentEssays = essaysResult.data?.map(essay => ({
    title: essay.title,
    created_at: essay.submitted_at,
    final_grade: essay.essay_corrections?.[0]?.final_grade || null
  })) || [];

  // 5. Formatar Stories (Mapeamento para StoryPost)
  const userStories: StoryPost[] = (storiesResult.data || []).map((row: any) => ({
    id: row.id,
    type: row.type || 'status',
    category: row.category || 'all',
    content: row.content || '',
    title: row.title,
    coverImage: row.cover_image,
    createdAt: new Date(row.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    likes: row.likes?.[0]?.count || 0,
    commentsCount: row.comments?.[0]?.count || 0,
    isLiked: false, // Em perfil público, não checamos like individual por enquanto
    metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata || {}),
    user: {
      id: profile.id, // O próprio dono do perfil
      name: profile.full_name,
      username: profile.nickname,
      avatar_url: profile.avatar_url,
      verification_badge: profile.verification_badge || profile.badge // Garante o badge
    }
  }));

  // 6. Retornar Perfil Enriquecido
  return {
    ...profile,
    stats_simulados: testsResult.count || 0,
    stats_media: averageGrade > 0 ? averageGrade : null,
    recent_essays: recentEssays,
    stories: userStories // Campo novo
  };
}

// --- AÇÃO DE SEGUIR (Mantida) ---
export async function toggleFollow(targetUserId: string, currentPath: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Você precisa estar logado.' };
  if (user.id === targetUserId) return { error: 'Você não pode seguir a si mesmo.' };

  const { data: existingFollow } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .single();

  if (existingFollow) {
    const { error } = await supabase.from('follows').delete().eq('id', existingFollow.id);
    if (error) return { error: 'Erro ao deixar de seguir.' };
  } else {
    const { error } = await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId });
    if (error) return { error: 'Erro ao seguir usuário.' };
  }

  revalidatePath(currentPath);
  return { success: true };
}