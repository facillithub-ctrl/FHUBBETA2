"use server";

import { revalidatePath } from 'next/cache';
import createSupabaseServerClient from '@/utils/supabase/server';

// --- TIPOS DE DADOS ---

export type Essay = {
  id: string;
  title: string | null;
  content: string | null;
  status: 'draft' | 'submitted' | 'corrected';
  submitted_at: string | null;
  prompt_id: string | null;
  student_id: string;
  consent_to_ai_training?: boolean;
  image_submission_url?: string | null;
  organization_id?: string | null;
  final_grade?: number | null;
  prompts?: { title: string | null } | null;
};

export type Annotation = {
    id: string;
    type: 'text' | 'image';
    comment: string;
    marker: 'erro' | 'acerto' | 'sugestao';
    selection?: string;
    position?: { x: number; y: number; width?: number; height?: number };
};

export type AIFeedback = {
  id?: string;
  essay_id?: string;
  correction_id?: string;
  detailed_feedback: { competency: string; feedback: string }[];
  rewrite_suggestions: { original: string; suggestion: string }[];
  actionable_items: string[];
  created_at?: string;
};

export type StudyPlan = {
    strengths: string[];
    weaknesses: string[];
    weekly_schedule: { day: string; activity: string; focus: string; done?: boolean }[];
    recommended_resources: string[];
};

export type SavedStudyPlan = {
    id: string;
    essay_id: string;
    content: StudyPlan;
    created_at: string;
    essay_title?: string;
};

export type EssayCorrection = {
    id: string;
    essay_id: string;
    corrector_id: string;
    feedback: string;
    grade_c1: number;
    grade_c2: number;
    grade_c3: number;
    grade_c4: number;
    grade_c5: number;
    final_grade: number;
    audio_feedback_url?: string | null;
    annotations?: Annotation[] | null;
    ai_feedback?: AIFeedback | null;
    created_at?: string;
};

export type EssayPrompt = {
    id: string;
    title: string;
    description: string | null;
    source: string | null;
    image_url: string | null;
    category: string | null;
    publication_date: string | null;
    deadline: string | null;
    cover_image_source: string | null;
    motivational_text_1: string | null;
    motivational_text_2: string | null;
    motivational_text_3_description: string | null;
    motivational_text_3_image_url: string | null;
    motivational_text_3_image_source: string | null;
    difficulty: number | null;
    tags: string[] | null;
    created_at?: string;
};

// --- FUNÇÕES GERAIS E DE ALUNO ---

export async function saveOrUpdateEssay(essayData: Partial<Essay>) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Usuário não autenticado.' };

  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
  const now = new Date().toISOString();

  const dataToUpsert: any = {
      ...essayData,
      student_id: user.id,
      organization_id: profile?.organization_id,
      submitted_at: essayData.submitted_at || now,
  };

  if (essayData.status === 'submitted') {
    dataToUpsert.submitted_at = now;
    if (!essayData.consent_to_ai_training) {
      return { error: 'É obrigatório consentir com os termos para enviar a redação.' };
    }
    
    // Verificação de duplicidade para o mesmo tema
    if (essayData.prompt_id && !essayData.id) {
        const { data: existing } = await supabase.from('essays')
            .select('id')
            .eq('student_id', user.id)
            .eq('prompt_id', essayData.prompt_id)
            .neq('status', 'draft')
            .maybeSingle();
        if (existing) return { error: 'Você já enviou uma redação para este tema.' };
    }
  }

  // Limpeza de campos undefined
  Object.keys(dataToUpsert).forEach(key => dataToUpsert[key] === undefined && delete dataToUpsert[key]);

  const { data: upsertedEssay, error: upsertError } = await supabase
    .from('essays')
    .upsert(dataToUpsert)
    .select()
    .single();

  if (upsertError) {
      console.error("Erro no upsert da redação:", upsertError);
      return { error: `Erro ao salvar: ${upsertError.message}` };
  }

  // Salva versão (histórico)
  if (upsertedEssay && essayData.status === 'draft' && essayData.content) {
    try {
        const { count } = await supabase.from('essay_versions').select('*', { count: 'exact', head: true }).eq('essay_id', upsertedEssay.id);
        await supabase.from('essay_versions').insert({
            essay_id: upsertedEssay.id,
            content: essayData.content,
            version_number: (count ?? 0) + 1,
        });
    } catch (e) { /* Ignora erro de versão */ }
  }

  revalidatePath('/dashboard/applications/write');
  revalidatePath('/dashboard');
  return { data: upsertedEssay };
}

export async function getPrompts(): Promise<{ data?: EssayPrompt[]; error?: string }> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('essay_prompts').select('*').order('created_at', { ascending: false });
    if (error) return { error: error.message };
    return { data: data || [] };
}

export async function getEssayDetails(essayId: string): Promise<{ data?: Essay & { profiles: { full_name: string | null } | null }; error?: string }> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('essays')
        .select(`*, profiles (full_name)`)
        .eq('id', essayId)
        .maybeSingle();

    if (error) return { error: `Erro ao buscar detalhes: ${error.message}` };
    return { data: data as any };
}

export async function getEssaysForStudent() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Usuário não autenticado.' };

  const { data, error } = await supabase
    .from('essays')
    .select('id, title, status, submitted_at, content, image_submission_url, prompt_id, essay_corrections(final_grade)')
    .eq('student_id', user.id)
    .order('submitted_at', { ascending: false, nullsFirst: false });

  if (error) return { error: error.message };
  return { data };
}

export async function getLatestEssayForDashboard() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Usuário não autenticado.' };

  const { data, error } = await supabase
    .from('essays')
    .select(`id, title, status, submitted_at, essay_corrections ( final_grade ), prompts ( title )`)
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

    if (error) return { data: null, error: error.message };

    const adaptedData = data ? {
        ...data,
        final_grade: data.essay_corrections?.[0]?.final_grade ?? null,
        prompts: data.prompts ? { title: data.prompts.title } : null,
        essay_corrections: undefined,
    } : null;

    return { data: adaptedData };
}

// --- PLANOS DE ESTUDO (Esta é a parte que estava faltando) ---

export async function saveStudyPlan(plan: StudyPlan, essayId: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado.' };

    const { error } = await supabase
        .from('study_plans')
        .insert({ student_id: user.id, essay_id: essayId, content: plan });

    if (error) {
        console.error("Erro ao salvar plano:", error);
        return { error: "Não foi possível salvar o plano." };
    }

    revalidatePath('/dashboard/applications/write');
    return { success: true };
}

export async function getStudentStudyPlans() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    const { data, error } = await supabase
        .from('study_plans')
        .select('id, essay_id, content, created_at, essays(title)')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

    if (error) return { data: [] };

    return { 
        data: data.map(item => ({
            id: item.id,
            essay_id: item.essay_id,
            content: item.content,
            created_at: item.created_at,
            // @ts-ignore
            essay_title: item.essays?.title || "Plano de Estudo"
        })) as SavedStudyPlan[]
    };
}

// --- CORREÇÃO (PROFESSOR/ALUNO) ---

type FinalCorrectionData = Omit<EssayCorrection, 'ai_feedback'> & {
    profiles: { full_name: string | null, verification_badge: string | null } | null;
    essay_correction_errors?: { common_errors: { error_type: string } | null }[];
    ai_feedback: AIFeedback | null;
}

export async function getCorrectionForEssay(essayId: string): Promise<{ data?: FinalCorrectionData; error?: string }> {
    const supabase = await createSupabaseServerClient();

    const { data: correctionBase, error: correctionBaseError } = await supabase
        .from('essay_corrections')
        .select(`*, profiles ( full_name, verification_badge ), essay_correction_errors ( common_errors ( error_type ) )`)
        .eq('essay_id', essayId)
        .maybeSingle();

    if (correctionBaseError) return { error: `Erro: ${correctionBaseError.message}` };
    if (!correctionBase) return { data: undefined };

    const { data: aiFeedbackData } = await supabase
        .from('ai_feedback')
        .select('*')
        .eq('essay_id', essayId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    return { data: { ...correctionBase, ai_feedback: aiFeedbackData || null } };
}

export async function submitCorrection(correctionData: Omit<EssayCorrection, 'id' | 'corrector_id' | 'created_at'>) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Usuário não autenticado.' };

    const { ai_feedback, ...humanCorrectionData } = correctionData;

    const { data: correction, error: correctionError } = await supabase
        .from('essay_corrections')
        .insert({ ...humanCorrectionData, corrector_id: user.id })
        .select()
        .single();

    if (correctionError) return { error: `Erro ao salvar correção: ${correctionError.message}` };

    if (ai_feedback) {
        const { error: aiError } = await supabase.from('ai_feedback').insert({
            essay_id: correctionData.essay_id,
            correction_id: correction.id,
            detailed_feedback: ai_feedback.detailed_feedback,
            rewrite_suggestions: ai_feedback.rewrite_suggestions,
            actionable_items: ai_feedback.actionable_items
        });
        if (aiError) console.error("Erro feedback IA:", aiError);
    }

    await supabase.from('essays').update({ status: 'corrected' }).eq('id', correctionData.essay_id);
    
    // Notificação simples
    await supabase.from('notifications').insert({
        user_id: (await supabase.from('essays').select('student_id').eq('id', correctionData.essay_id).single()).data?.student_id,
        title: 'Redação Corrigida',
        message: 'Sua redação recebeu um feedback.',
        link: `/dashboard/applications/write?essayId=${correctionData.essay_id}`
    });

    revalidatePath('/dashboard/applications/write');
    return { data: correction };
}

// --- FUNÇÕES DE PROFESSOR (DASHBOARD AVANÇADA) ---

export async function getPendingEssaysForTeacher(teacherId: string, organizationId: string | null) {
    const supabase = await createSupabaseServerClient();
    let query = supabase
        .from('essays')
        .select(`id, title, submitted_at, status, profiles ( id, full_name, avatar_url, address_state, user_category, school_name )`)
        .eq('status', 'submitted');

    if (organizationId) query = query.eq('organization_id', organizationId); else query = query.is('organization_id', null);
    
    const { data, error } = await query.order('submitted_at', { ascending: true });
    if (error) return { data: null, error: error.message };
    return { data, error: null };
}

export async function getCorrectedEssaysForTeacher(teacherId: string, organizationId: string | null) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from('essays')
    .select(`id, title, submitted_at, status, profiles ( id, full_name, avatar_url, address_state, user_category, school_name ), essay_corrections!inner ( final_grade, corrector_id )`)
    .eq('status', 'corrected')
    .eq('essay_corrections.corrector_id', teacherId);

  if (organizationId) query = query.eq('organization_id', organizationId); else query = query.is('organization_id', null);

  const { data, error } = await query.order('submitted_at', { ascending: false });
  if (error) return { data: null, error: error.message };
  return { data };
}

export async function getCorrectorStats(correctorId: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc('get_corrector_stats', { p_corrector_id: correctorId });
    if (error) return { data: null, error: error.message };
    return { data: data[0] || { total_corrected: 0, total_points: 0, avg_grade_given: 0 } };
}

export async function getStudentMiniHistory(studentId: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('essays')
        .select('id, title, submitted_at, essay_corrections(final_grade)')
        .eq('student_id', studentId)
        .eq('status', 'corrected')
        .order('submitted_at', { ascending: false })
        .limit(5);

    if (error) return { data: [], error: error.message };
    
    const history = data.map(essay => ({
        title: essay.title,
        date: essay.submitted_at,
        grade: essay.essay_corrections?.[0]?.final_grade || 0
    }));
    return { data: history };
}

// --- ESTATÍSTICAS E RANKING (ALUNO) ---

export async function getStudentStatistics() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado.' };

    const { data: correctedEssays, error } = await supabase
        .from('essays')
        .select(`submitted_at, essay_corrections!inner ( final_grade, grade_c1, grade_c2, grade_c3, grade_c4, grade_c5 )`)
        .eq('student_id', user.id)
        .eq('status', 'corrected');

    if (error || !correctedEssays || correctedEssays.length === 0) return { data: null };

    const validCorrections = correctedEssays.map(e => ({ ...e.essay_corrections[0], submitted_at: e.submitted_at }));
    const totalCorrections = validCorrections.length;
    
    const sums = validCorrections.reduce((acc, curr) => ({
        sum_final: acc.sum_final + curr.final_grade,
        sum_c1: acc.sum_c1 + curr.grade_c1, sum_c2: acc.sum_c2 + curr.grade_c2,
        sum_c3: acc.sum_c3 + curr.grade_c3, sum_c4: acc.sum_c4 + curr.grade_c4, sum_c5: acc.sum_c5 + curr.grade_c5
    }), { sum_final: 0, sum_c1: 0, sum_c2: 0, sum_c3: 0, sum_c4: 0, sum_c5: 0 });

    const averages = {
        avg_final_grade: sums.sum_final / totalCorrections,
        avg_c1: sums.sum_c1 / totalCorrections, avg_c2: sums.sum_c2 / totalCorrections,
        avg_c3: sums.sum_c3 / totalCorrections, avg_c4: sums.sum_c4 / totalCorrections, avg_c5: sums.sum_c5 / totalCorrections,
    };

    const competencyAverages = [
        { name: 'Competência 1', average: averages.avg_c1 }, { name: 'Competência 2', average: averages.avg_c2 },
        { name: 'Competência 3', average: averages.avg_c3 }, { name: 'Competência 4', average: averages.avg_c4 }, { name: 'Competência 5', average: averages.avg_c5 },
    ];
    const pointToImprove = competencyAverages.sort((a, b) => a.average - b.average)[0];

    const progression = validCorrections
        .sort((a, b) => new Date(a.submitted_at!).getTime() - new Date(b.submitted_at!).getTime())
        .map(c => ({ date: new Date(c.submitted_at!).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), grade: c.final_grade }));

    return { data: { totalCorrections, averages, pointToImprove, progression } };
}

export async function calculateWritingStreak() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: 0 };

    const { data } = await supabase.from('essays').select('submitted_at').eq('student_id', user.id).order('submitted_at', { ascending: false });
    if (!data || data.length === 0) return { data: 0 };

    const uniqueDates = [...new Set(data.map(e => new Date(e.submitted_at!).toDateString()))].map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
    
    let streak = 0;
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

    if (uniqueDates.length > 0 && (uniqueDates[0].getTime() === today.getTime() || uniqueDates[0].getTime() === yesterday.getTime())) {
        streak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
            if ((uniqueDates[i-1].getTime() - uniqueDates[i].getTime()) === 86400000) streak++; else break;
        }
    }
    return { data: streak };
}

export async function getUserStateRank() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null };

    const { data: userProfile } = await supabase.from('profiles').select('address_state').eq('id', user.id).single();
    if (!userProfile?.address_state) return { data: { rank: null, state: null } };

    // USA A FUNÇÃO RPC CRIADA (RANK REAL)
    const { data, error } = await supabase.rpc('get_user_rank_in_state', { p_user_id: user.id, p_state: userProfile.address_state });

    if (error) {
        console.error('Erro RPC get_user_rank_in_state:', error);
        // Fallback simples se RPC falhar
        return { data: { rank: null, state: userProfile.address_state } };
    }

    return { data: { rank: data && data.length > 0 ? data[0].rank : null, state: userProfile.address_state } };
}

// --- AUXILIARES ---

export async function checkForPlagiarism(text: string): Promise<{ data?: { similarity_percentage: number; matches: { source: string; text: string }[] }; error?: string }> {
    // Simulação
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { data: { similarity_percentage: Math.random() * 2, matches: [] } };
}

export async function getFrequentErrors() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };
    // Se houver RPC, use: await supabase.rpc('get_frequent_errors', { p_student_id: user.id });
    return { data: [] };
}

export async function getCurrentEvents() {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from('current_events').select('id, title, summary, link').order('created_at', { ascending: false }).limit(5);
    return { data: data || [] };
}