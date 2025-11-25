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
    ai_feedback?: AIFeedback | AIFeedback[] | null;
    created_at?: string;
};

export type StudyPlan = {
    id: string;
    essay_id: string;
    essay_title: string;
    tasks: { id: string; content: string; completed: boolean }[];
    status: string;
    created_at: string;
};


// --- FUNÇÕES DE REDAÇÃO (ALUNO) ---

export async function saveOrUpdateEssay(essayData: Partial<Essay>) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Usuário não autenticado.' };

  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();

  if (essayData.status === 'submitted') {
    if (!essayData.consent_to_ai_training) {
      return { error: 'É obrigatório consentir com os termos para enviar a redação.' };
    }

    if (essayData.prompt_id && !essayData.id) {
      const { data: existingEssay, error: existingError } = await supabase
        .from('essays')
        .select('id')
        .eq('student_id', user.id)
        .eq('prompt_id', essayData.prompt_id)
        .in('status', ['submitted', 'corrected'])
        .limit(1)
        .single();

      if (existingEssay) {
        return { error: 'Você já enviou uma redação para este tema.' };
      }
      if (existingError && existingError.code !== 'PGRST116') {
        console.error("Erro ao verificar redações existentes:", JSON.stringify(existingError, null, 2));
        return { error: 'Erro ao verificar redações existentes.' };
      }
    }
  }

  const dataToUpsert: Partial<Essay> & { student_id: string } = {
      ...essayData,
      student_id: user.id,
      organization_id: profile?.organization_id,
      submitted_at: essayData.status === 'submitted' ? new Date().toISOString() : essayData.submitted_at,
  };

  if (!dataToUpsert.id) {
      delete dataToUpsert.id;
  }

  const { data: upsertedEssay, error: upsertError } = await supabase
    .from('essays')
    .upsert(dataToUpsert)
    .select()
    .single();

  if (upsertError) {
      console.error("Erro no upsert da redação:", JSON.stringify(upsertError, null, 2));
      return { error: `Erro ao salvar: ${upsertError.message}` };
  }

  if (upsertedEssay && essayData.status === 'draft' && essayData.content) {
    const { count, error: countError } = await supabase
      .from('essay_versions')
      .select('*', { count: 'exact', head: true })
      .eq('essay_id', upsertedEssay.id);

    if (countError) console.error("Erro ao contar versões:", countError.message);

    const { error: versionError } = await supabase
      .from('essay_versions')
      .insert({
        essay_id: upsertedEssay.id,
        content: essayData.content,
        version_number: (count ?? 0) + 1,
      });

    if (versionError) {
      console.error("Erro ao salvar versão da redação:", versionError.message);
    }
  }

  revalidatePath('/dashboard/applications/write');
  revalidatePath('/dashboard');
  return { data: upsertedEssay };
}

export async function getPrompts(): Promise<{ data?: EssayPrompt[]; error?: string }> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('essay_prompts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Erro ao buscar temas:", JSON.stringify(error, null, 2));
        return { error: error.message };
    }
    return { data: data || [] };
}

export async function getEssayDetails(essayId: string): Promise<{ data?: Essay & { profiles: { full_name: string | null } | null }; error?: string }> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('essays')
        .select(`
            *,
            profiles (full_name)
        `)
        .eq('id', essayId)
        .maybeSingle();

    if (error) {
        console.error(`Erro ao buscar detalhes da redação ${essayId}:`, JSON.stringify(error, null, 2));
        return { error: `Erro ao buscar detalhes da redação: ${error.message}` };
    }

    const rawData = data as any;
    const profileData = Array.isArray(rawData?.profiles) ? rawData.profiles[0] : rawData?.profiles;

    const formattedData = rawData ? {
        ...rawData,
        profiles: profileData
    } : undefined;

    return { data: formattedData };
}

export async function getEssaysForStudent() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Usuário não autenticado.' };

  const { data, error } = await supabase
    .from('essays')
    .select('id, title, status, submitted_at, content, image_submission_url, prompt_id')
    .eq('student_id', user.id)
    .order('submitted_at', { ascending: false, nullsFirst: true });

  if (error) {
      console.error("Erro ao buscar redações do aluno:", JSON.stringify(error, null, 2));
      return { error: error.message };
  }
  return { data };
}

export async function getLatestEssayForDashboard() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Usuário não autenticado.' };

  const { data, error } = await supabase
    .from('essays')
    .select(`
        id,
        title,
        status,
        essay_corrections ( final_grade ),
        prompts ( title )
    `)
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

    if (error) {
        if (error.code !== 'PGRST116') {
             console.error("Erro ao buscar última redação para dashboard:", JSON.stringify(error, null, 2));
        }
        return { data: null, error: error.message };
    }

    if (!data) return { data: null };

    const rawData = data as any;
    const correctionData = Array.isArray(rawData.essay_corrections)
        ? rawData.essay_corrections[0]
        : rawData.essay_corrections;

    const promptData = Array.isArray(rawData.prompts)
        ? rawData.prompts[0]
        : rawData.prompts;

    const adaptedData = {
        ...rawData,
        final_grade: correctionData?.final_grade ?? null,
        prompts: promptData ? { title: promptData.title } : null,
        essay_corrections: undefined,
    };

    return { data: adaptedData };
}


// --- FUNÇÕES DE PLANOS DE ESTUDO (ADICIONADAS PARA CORRIGIR O ERRO DE EXPORT) ---

export async function getUserActionPlans() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: 'Usuário não autenticado' };

  // Busca planos e faz join com redações
  const { data, error } = await supabase
      .from('study_plans')
      .select(`
        id,
        actionable_items,
        created_at,
        status,
        essays (id, title)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

  if (error) {
      console.error("Erro ao buscar planos de estudo:", JSON.stringify(error, null, 2));
      return { data: [], error: error.message };
  }

  // Tratamento de array/objeto no join com essays
  const plans = (data || []).map((item: any) => {
      // Supabase pode retornar array em joins 1:1, aqui garantimos que pegamos o objeto
      const essayData = Array.isArray(item.essays) ? item.essays[0] : item.essays;

      // Normalização de actionable_items (pode ser string ou objeto)
      const tasks = Array.isArray(item.actionable_items)
        ? item.actionable_items.map((task: any, idx: number) => ({
            id: task.id || `task-${idx}`,
            content: typeof task === 'string' ? task : (task.task || task.content || "Tarefa"),
            completed: task.status === 'completed' || false
          }))
        : [];

      return {
          id: item.id,
          essay_id: essayData?.id,
          essay_title: essayData?.title || "Redação",
          tasks,
          status: item.status,
          created_at: item.created_at
      };
  });

  return { data: plans };
}

export async function saveStudyPlan(essayId: string, items: any[]) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado' };

    const { data, error } = await supabase
        .from('study_plans')
        .insert({
            user_id: user.id,
            essay_id: essayId,
            actionable_items: items,
            status: 'active'
        })
        .select()
        .single();

    if (error) {
        console.error("Erro ao salvar plano de estudo:", JSON.stringify(error, null, 2));
        return { error: error.message };
    }
    return { data };
}

export async function toggleStudyTask(planId: string, taskContent: string, currentStatus: boolean) {
    const supabase = await createSupabaseServerClient();
    try {
        const { data: plan, error: fetchError } = await supabase
            .from('study_plans')
            .select('actionable_items')
            .eq('id', planId)
            .single();

        if (fetchError || !plan) throw new Error("Plano não encontrado");

        const items = plan.actionable_items as any[];
        const updatedItems = items.map((item: any) => {
            const content = typeof item === 'string' ? item : (item.task || item.content);
            if (content === taskContent) {
                if (typeof item === 'string') return { task: item, status: !currentStatus ? 'completed' : 'pending' };
                return { ...item, status: !currentStatus ? 'completed' : 'pending' };
            }
            return item;
        });

        const { error: updateError } = await supabase
            .from('study_plans')
            .update({ actionable_items: updatedItems })
            .eq('id', planId);

        if (updateError) throw updateError;
        revalidatePath('/dashboard/applications/write');
        return { success: true };
    } catch (error) {
        console.error("Erro ao atualizar tarefa:", error);
        return { success: false };
    }
}


// --- FUNÇÕES DE CORREÇÃO ---

type CorrectionQueryBaseResult = Omit<EssayCorrection, 'ai_feedback'> & {
    profiles: { full_name: string | null, verification_badge: string | null } | null;
    essay_correction_errors: { common_errors: { error_type: string } | null }[];
};

type FinalCorrectionData = CorrectionQueryBaseResult & {
    ai_feedback: AIFeedback | null;
}

export async function getCorrectionForEssay(essayId: string): Promise<{ data?: FinalCorrectionData; error?: string }> {
    const supabase = await createSupabaseServerClient();

    const { data: correctionBase, error: correctionBaseError } = await supabase
        .from('essay_corrections')
        .select(`
            id,
            essay_id,
            corrector_id,
            feedback,
            grade_c1,
            grade_c2,
            grade_c3,
            grade_c4,
            grade_c5,
            final_grade,
            audio_feedback_url,
            annotations,
            created_at,
            profiles ( full_name, verification_badge ),
            essay_correction_errors (
                common_errors ( error_type )
            )
        `)
        .eq('essay_id', essayId)
        .maybeSingle();

    if (correctionBaseError) {
        console.error(`[actions.ts] Erro Supabase:`, JSON.stringify(correctionBaseError, null, 2));
        return { error: `Erro ao buscar correção base: ${correctionBaseError.message}` };
    }

    if (!correctionBase) return { data: undefined };

    const rawCorrection = correctionBase as any;
    const profileData = Array.isArray(rawCorrection.profiles)
        ? rawCorrection.profiles[0]
        : rawCorrection.profiles;

    const { data: aiFeedbackData } = await supabase
        .from('ai_feedback')
        .select('*')
        .eq('essay_id', essayId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    const finalData: FinalCorrectionData = {
        ...rawCorrection,
        profiles: profileData,
        ai_feedback: aiFeedbackData || null
    };

    return { data: finalData };
}

export async function submitCorrection(correctionData: Omit<EssayCorrection, 'id' | 'corrector_id' | 'created_at'>) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Usuário não autenticado.' };

    const { ai_feedback, ...humanCorrectionData } = correctionData;

    const { data: correction, error: correctionError } = await supabase
        .from('essay_corrections')
        .insert({
            ...humanCorrectionData,
            corrector_id: user.id
        })
        .select()
        .single();

    if (correctionError) return { error: correctionError.message };

    if (ai_feedback && !Array.isArray(ai_feedback)) {
        await supabase.from('ai_feedback').insert({
            essay_id: correctionData.essay_id,
            correction_id: correction.id,
            detailed_feedback: ai_feedback.detailed_feedback,
            rewrite_suggestions: ai_feedback.rewrite_suggestions,
            actionable_items: ai_feedback.actionable_items
        });
    }

    await supabase
        .from('essays')
        .update({ status: 'corrected' })
        .eq('id', correctionData.essay_id);

    // Notificação
    const { data: essay } = await supabase.from('essays').select('student_id, title').eq('id', correctionData.essay_id).single();
    if (essay) {
        await createNotification(
            essay.student_id,
            'Sua redação foi corrigida!',
            `A redação "${essay.title}" tem um feedback disponível.`,
            `/dashboard/applications/write?essayId=${correctionData.essay_id}`
        );
    }

    revalidatePath('/dashboard/applications/write');
    return { data: correction };
}

// --- ESTATÍSTICAS E UTILITÁRIOS ---

export async function getStudentStatistics() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado.' };

    const { data: correctedEssays, error } = await supabase
        .from('essays')
        .select(`
            submitted_at,
            essay_corrections!inner ( final_grade, grade_c1, grade_c2, grade_c3, grade_c4, grade_c5 )
        `)
        .eq('student_id', user.id)
        .eq('status', 'corrected');

    if (error || !correctedEssays) return { data: null };

    // Correção de array vs objeto aqui também
    const validCorrections = correctedEssays
        .map(essay => {
            const raw = essay.essay_corrections as any;
            const correction = Array.isArray(raw) ? raw[0] : raw;
            if (!correction) return null;
            return { ...correction, submitted_at: essay.submitted_at };
        })
        .filter((c): c is any => c !== null);

    if (validCorrections.length === 0) return { data: null };

    const total = validCorrections.length;
    const sum = (key: string) => validCorrections.reduce((acc, c) => acc + (c[key] || 0), 0);

    const averages = {
        avg_final_grade: sum('final_grade') / total,
        avg_c1: sum('grade_c1') / total, avg_c2: sum('grade_c2') / total,
        avg_c3: sum('grade_c3') / total, avg_c4: sum('grade_c4') / total,
        avg_c5: sum('grade_c5') / total,
    };

    const compArr = [
        { name: 'Competência 1', average: averages.avg_c1 }, { name: 'Competência 2', average: averages.avg_c2 },
        { name: 'Competência 3', average: averages.avg_c3 }, { name: 'Competência 4', average: averages.avg_c4 },
        { name: 'Competência 5', average: averages.avg_c5 },
    ];
    const pointToImprove = compArr.sort((a, b) => a.average - b.average)[0];

    const progression = validCorrections
        .sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime())
        .map(c => ({
            date: new Date(c.submitted_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            grade: c.final_grade,
        }));

    return { data: { totalCorrections: total, averages, pointToImprove, progression } };
}

export async function calculateWritingStreak() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: 0 };

    const { data } = await supabase
        .from('essays')
        .select('submitted_at')
        .eq('student_id', user.id)
        .not('submitted_at', 'is', null)
        .order('submitted_at', { ascending: false });

    if (!data || data.length === 0) return { data: 0 };

    const uniqueDates = [...new Set(data.map(e => new Date(e.submitted_at!).toDateString()))]
        .map(d => new Date(d));

    let streak = 0;
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

    if (uniqueDates[0].getTime() === today.getTime() || uniqueDates[0].getTime() === yesterday.getTime()) {
        streak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
            const diff = (uniqueDates[i-1].getTime() - uniqueDates[i].getTime()) / (1000 * 3600 * 24);
            if (diff === 1) streak++; else break;
        }
    }
    return { data: streak };
}

export async function getUserStateRank() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null };

    const { data: profile } = await supabase.from('profiles').select('address_state').eq('id', user.id).single();
    if (!profile?.address_state) return { data: { rank: null, state: null } };

    const { data } = await supabase.rpc('get_user_rank_in_state', { p_user_id: user.id, p_state: profile.address_state });
    return { data: { rank: data, state: profile.address_state } };
}

export async function createNotification(userId: string, title: string, message: string, link: string | null) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from('notifications').insert({ user_id: userId, title, message, link });
    return { error };
}

export async function getFrequentErrors() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado.' };
    const { data } = await supabase.rpc('get_frequent_errors_for_student', { p_student_id: user.id });
    return { data };
}

export async function getCurrentEvents() {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from('current_events').select('*').order('created_at', { ascending: false }).limit(5);
    return { data: data || [] };
}

export async function getPendingEssaysForTeacher(teacherId: string, organizationId: string | null) {
    const supabase = await createSupabaseServerClient();
    let query = supabase.from('essays').select('id, title, submitted_at, profiles(full_name)').eq('status', 'submitted');
    if (organizationId) query = query.eq('organization_id', organizationId);
    else query = query.is('organization_id', null);

    const { data, error } = await query.order('submitted_at', { ascending: true });
    if (error) return { data: null, error: error.message };

    const formatted = data.map((item: any) => ({
        ...item,
        profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
    }));
    return { data: formatted };
}

export async function getCorrectedEssaysForTeacher(teacherId: string, organizationId: string | null) {
    const supabase = await createSupabaseServerClient();
    let query = supabase.from('essays').select('id, title, submitted_at, profiles(full_name), essay_corrections!inner(final_grade, corrector_id)').eq('status', 'corrected').eq('essay_corrections.corrector_id', teacherId);
    if (organizationId) query = query.eq('organization_id', organizationId);
    else query = query.is('organization_id', null);

    const { data, error } = await query.order('submitted_at', { ascending: false });
    if (error) return { data: null, error: error.message };

    const formatted = data.map((item: any) => ({
        ...item,
        profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
        essay_corrections: Array.isArray(item.essay_corrections) ? item.essay_corrections[0] : item.essay_corrections
    }));
    return { data: formatted };
}

export async function getAIFeedbackForEssay(essayId: string) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from('ai_feedback').select('*').eq('essay_id', essayId).maybeSingle();
    return { data };
}

export async function checkForPlagiarism(_text: string) {
    // Simulação mantida
    await new Promise(r => setTimeout(r, 1000));
    return { data: { similarity_percentage: 2, matches: [] } };
}