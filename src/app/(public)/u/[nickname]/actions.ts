"use server";

import createClient from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// --- BUSCAR DADOS COMPLETOS DO PERFIL ---
export async function getPublicProfile(nickname: string) {
  const supabase = await createClient();

  // 1. Buscar dados base do perfil
  // USAMOS .ilike() EM VEZ DE .eq() PARA IGNORAR MAIÚSCULAS/MINÚSCULAS
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('nickname', nickname) 
    .maybeSingle(); // maybeSingle evita erro se não encontrar, retornando null

  // Se der erro no banco ou não achar o perfil, retorna null (gera 404 na page)
  if (error || !profile) return null;

  // 2. Executar consultas estatísticas em paralelo (Performance)
  // O uso de Promise.allSettled ou verificações de erro individuais impedem que o perfil quebre
  // caso o usuário não tenha permissão para ver as redações (RLS), retornando stats zerados.
  const [
    essaysResult, 
    testsResult, 
    gradesResult
  ] = await Promise.all([
    // A: Últimas 3 Redações com nota
    supabase
      .from('essays')
      .select(`
        title,
        submitted_at,
        essay_corrections (
          final_grade
        )
      `)
      .eq('student_id', profile.id)
      .not('submitted_at', 'is', null) 
      .order('submitted_at', { ascending: false })
      .limit(3),

    // B: Contagem de Simulados Feitos
    supabase
      .from('test_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', profile.id)
      .eq('status', 'completed'),

    // C: Todas as notas para calcular Média Geral
    supabase
      .from('essay_corrections')
      .select('final_grade, essays!inner(student_id)')
      .eq('essays.student_id', profile.id)
  ]);

  // 3. Processar Média Geral (Redações)
  const grades = gradesResult.data?.map(g => g.final_grade).filter(g => g !== null && g !== undefined) || [];
  const averageGrade = grades.length > 0 
    ? Math.round(grades.reduce((a, b) => (a || 0) + (b || 0), 0) / grades.length) 
    : 0;

  // 4. Formatar Redações Recentes
  const recentEssays = essaysResult.data?.map(essay => ({
    title: essay.title,
    created_at: essay.submitted_at,
    final_grade: essay.essay_corrections?.[0]?.final_grade || null
  })) || [];

  // 5. Retornar Perfil Enriquecido
  return {
    ...profile,
    stats_simulados: testsResult.count || 0,
    stats_media: averageGrade > 0 ? averageGrade : null,
    stats_games: 0, 
    stats_classes: 0, 
    recent_essays: recentEssays
  };
}

// --- AÇÃO DE SEGUIR (Mantida igual) ---
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