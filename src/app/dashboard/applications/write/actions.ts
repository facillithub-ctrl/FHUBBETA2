"use server";

import { revalidatePath } from 'next/cache';
import createSupabaseServerClient from '@/utils/supabase/server';

// --- TIPOS ---
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
  // CORREÇÃO: A propriedade reflete o nome da tabela relacionada
  essay_prompts?: { title: string | null } | null;
};

export type Annotation = {
    id: string;
    type: 'text' | 'image';
    comment: string;
    marker: 'erro' | 'acerto' | 'sugestao';
    selection?: string;
    position?: { x: number; y: number; width?: number; height?: number };
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
    essay_id: string;
    essay_title: string;
    tasks: { id: string; text: string; completed: boolean }[];
    created_at: string;
};

// --- FUNÇÕES ---

export async function saveOrUpdateEssay(essayData: Partial<Essay>) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Usuário não autenticado.' };

  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();

  if (essayData.status === 'submitted') {
    if (!essayData.consent_to_ai_training) {
      return { error: 'É obrigatório consentir com os termos para enviar a redação.' };
    }
  }

  const dataToUpsert: any = {
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
      console.error("Erro no upsert da redação:", upsertError);
      return { error: `Erro ao salvar: ${upsertError.message}` };
  }

  if (upsertedEssay && essayData.status === 'draft' && essayData.content) {
    const { count } = await supabase
      .from('essay_versions')
      .select('*', { count: 'exact', head: true })
      .eq('essay_id', upsertedEssay.id);

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
        console.error("Erro ao buscar temas:", error);
        return { error: error.message };
    }
    return { data: data || [] };
}

export async function getEssayDetails(essayId: string): Promise<{ data?: Essay & { profiles: { full_name: string | null } | null }; error?: string }> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('essays')
        .select(`*, profiles (full_name)`)
        .eq('id', essayId)
        .maybeSingle();

    if (error) {
        console.error(`Erro ao buscar detalhes da redação ${essayId}:`, error);
        return { error: `Erro ao buscar detalhes da redação: ${error.message}` };
    }
    return { data: data as (Essay & { profiles: { full_name: string | null } | null }) | undefined };
}

export async function getEssaysForStudent() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Usuário não autenticado.' };

  const { data, error } = await supabase
    .from('essays')
    .select('id, title, status, submitted_at, content, image_submission_url, prompt_id, essay_corrections(final_grade)')
    .eq('student_id', user.id)
    .order('submitted_at', { ascending: false, nullsFirst: true });

  if (error) {
      console.error("Erro ao buscar redações do aluno:", error);
      return { error: error.message };
    }
  return { data };
}

// --- CORREÇÃO DO ERRO DE RELAÇÃO ---
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
        essay_prompts ( title ) 
    `) // AQUI: Mudamos 'prompts' para 'essay_prompts'
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

    if (error) {
        console.error("Erro ao buscar última redação para dashboard:", error);
        // Retornamos null sem explodir a aplicação
        return { data: null, error: error.message };
    }

    // Tratamento seguro do array/objeto retornado pela relação
    let promptTitle: string | null = null;
    if (data?.essay_prompts) {
        if (Array.isArray(data.essay_prompts)) {
            promptTitle = data.essay_prompts[0]?.title || null;
        } else {
            // @ts-ignore
            promptTitle = data.essay_prompts.title || null;
        }
    }

    const adaptedData = data ? {
        ...data,
        final_grade: data.essay_corrections?.[0]?.final_grade ?? null,
        prompts: promptTitle ? { title: promptTitle } : null, // Mantemos a chave 'prompts' para compatibilidade com frontend
        essay_corrections: undefined,
    } : null;

    return { data: adaptedData };
}

// --- NOVA FUNÇÃO: BUSCAR PLANOS DE AÇÃO DO USUÁRIO ---
export async function getUserActionPlans() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    // Busca os feedbacks da IA que possuem itens acionáveis
    // e faz join com a tabela essays para pegar o título
    const { data, error } = await supabase
        .from('ai_feedback')
        .select(`
            id,
            actionable_items,
            created_at,
            essays!inner ( id, title, student_id )
        `)
        .eq('essays.student_id', user.id)
        .not('actionable_items', 'is', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Erro ao buscar planos de ação:", error);
        return { data: [] };
    }

    // Formata os dados para o frontend
    const plans = data.map(item => ({
        essay_id: item.essays.id,
        essay_title: item.essays.title || "Redação sem título",
        // Se os itens forem strings simples, convertemos para objetos {text, completed}
        tasks: Array.isArray(item.actionable_items) 
            ? item.actionable_items.map((task: any, idx: number) => 
                typeof task === 'string' 
                    ? { id: `${item.id}-${idx}`, text: task, completed: false } 
                    : task
              )
            : [],
        created_at: item.created_at
    }));

    return { data: plans };
}

export async function getStudentMiniHistory(studentId: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('essays')
        .select('id, title, submitted_at, status, essay_corrections(final_grade)')
        .eq('student_id', studentId)
        .order('submitted_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Erro ao buscar mini histórico:", error);
        return [];
    }

    return data.map(e => ({
        id: e.id,
        title: e.title,
        submitted_at: e.submitted_at,
        status: e.status,
        // @ts-ignore
        grade: e.essay_corrections?.[0]?.final_grade ?? null
    }));
}

export async function getCorrectionForEssay(essayId: string) {
    const supabase = await createSupabaseServerClient();
    const { data: correctionBase, error: correctionBaseError } = await supabase
        .from('essay_corrections')
        .select(`
            id, essay_id, corrector_id, feedback,
            grade_c1, grade_c2, grade_c3, grade_c4, grade_c5, final_grade,
            audio_feedback_url, annotations, created_at,
            profiles ( full_name, verification_badge ),
            essay_correction_errors ( common_errors ( error_type ) )
        `)
        .eq('essay_id', essayId)
        .maybeSingle();

    if (correctionBaseError) return { error: `Erro ao buscar correção base: ${correctionBaseError.message}` };
    if (!correctionBase) return { data: undefined, error: undefined };

    const { data: aiFeedbackData } = await supabase
        .from('ai_feedback')
        .select('*')
        .eq('essay_id', essayId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    return { data: { ...correctionBase, ai_feedback: aiFeedbackData || null }, error: undefined };
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

    if (ai_feedback && !Array.isArray(ai_feedback)) {
        await supabase.from('ai_feedback').insert({
                essay_id: correctionData.essay_id,
                correction_id: correction.id,
                detailed_feedback: ai_feedback.detailed_feedback,
                rewrite_suggestions: ai_feedback.rewrite_suggestions,
                actionable_items: ai_feedback.actionable_items
            });
    }

    await supabase.from('essays').update({ status: 'corrected' }).eq('id', correctionData.essay_id);
    
    const { data: essay } = await supabase.from('essays').select('student_id').eq('id', correctionData.essay_id).single();
    if (essay?.student_id) {
         createNotification(essay.student_id, 'Redação Corrigida', 'Sua redação recebeu um feedback.', `/dashboard/applications/write?essayId=${correctionData.essay_id}`);
    }

    revalidatePath('/dashboard/applications/write');
    return { data: correction };
}

// --- NOVA VERSÃO DA FUNÇÃO saveStudyPlan ---
// Agora ela salva o estado 'completed' das tarefas
export async function saveStudyPlan(essayId: string, tasks: any[]) {
    const supabase = await createSupabaseServerClient();
    
    // Atualiza o campo 'actionable_items' na tabela 'ai_feedback'
    // Estamos salvando o array completo de objetos {id, text, completed}
    const { error } = await supabase
        .from('ai_feedback')
        .update({ actionable_items: tasks })
        .eq('essay_id', essayId);

    if (error) {
        console.error("Erro ao salvar plano de estudo:", error);
        return { error: error.message };
    }

    revalidatePath('/dashboard/applications/write');
    return { success: true };
}

export async function getStudentStatistics() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado.' };

    const { data: correctedEssays, error } = await supabase
        .from('essays')
        .select(`submitted_at, essay_corrections!inner ( final_grade, grade_c1, grade_c2, grade_c3, grade_c4, grade_c5 )`)
        .eq('student_id', user.id)
        .eq('status', 'corrected');

    if (error) return { data: null, error: error.message };
    if (!correctedEssays || correctedEssays.length === 0) return { data: null };

    const validCorrections = correctedEssays
        .map(essay => essay.essay_corrections.length > 0 ? { ...essay.essay_corrections[0], submitted_at: essay.submitted_at } : null)
        .filter((c): c is NonNullable<typeof c> => c !== null && typeof c.final_grade === 'number');

    if (validCorrections.length === 0) return { data: null };

    const totalCorrections = validCorrections.length;
    const sums = validCorrections.reduce((acc, curr) => ({
        sum_final_grade: acc.sum_final_grade + curr.final_grade,
        sum_c1: acc.sum_c1 + curr.grade_c1,
        sum_c2: acc.sum_c2 + curr.grade_c2,
        sum_c3: acc.sum_c3 + curr.grade_c3,
        sum_c4: acc.sum_c4 + curr.grade_c4,
        sum_c5: acc.sum_c5 + curr.grade_c5,
    }), { sum_final_grade: 0, sum_c1: 0, sum_c2: 0, sum_c3: 0, sum_c4: 0, sum_c5: 0 });

    const averages = {
        avg_final_grade: sums.sum_final_grade / totalCorrections,
        avg_c1: sums.sum_c1 / totalCorrections, avg_c2: sums.sum_c2 / totalCorrections,
        avg_c3: sums.sum_c3 / totalCorrections, avg_c4: sums.sum_c4 / totalCorrections,
        avg_c5: sums.sum_c5 / totalCorrections,
    };

    const competencyAverages = [
        { name: 'Competência 1', average: averages.avg_c1 }, { name: 'Competência 2', average: averages.avg_c2 },
        { name: 'Competência 3', average: averages.avg_c3 }, { name: 'Competência 4', average: averages.avg_c4 },
        { name: 'Competência 5', average: averages.avg_c5 },
    ];
    const pointToImprove = competencyAverages.sort((a, b) => a.average - b.average)[0];

    const progression = validCorrections
        .filter(c => c.submitted_at)
        .sort((a, b) => new Date(a.submitted_at!).getTime() - new Date(b.submitted_at!).getTime())
        .map(c => ({
            date: new Date(c.submitted_at!).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            grade: c.final_grade,
        }));

    return { data: { totalCorrections, averages, pointToImprove, progression } };
}

export async function calculateWritingStreak() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: 0 };

    const { data } = await supabase.from('essays').select('submitted_at').eq('student_id', user.id).not('submitted_at', 'is', null).order('submitted_at', { ascending: false });
    if (!data || data.length === 0) return { data: 0 };

    const uniqueDates = [...new Set(data.map(e => new Date(e.submitted_at!).toDateString()))].map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
    let streak = 0;
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

    if (uniqueDates.length > 0 && (uniqueDates[0].getTime() === today.getTime() || uniqueDates[0].getTime() === yesterday.getTime())) {
        streak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
            const prevDay = new Date(uniqueDates[i-1]); prevDay.setDate(prevDay.getDate() - 1);
            if (uniqueDates[i].getTime() === prevDay.getTime()) streak++; else break;
        }
    }
    return { data: streak };
}

export async function getUserStateRank() { return { data: { rank: null, state: null } }; }
export async function createNotification(userId: string, title: string, message: string, link: string | null) {
    const supabase = await createSupabaseServerClient();
    await supabase.from('notifications').insert({ user_id: userId, title, message, link });
    return { error: null };
}
export async function getFrequentErrors() { return { data: [] }; }
export async function getCurrentEvents() { return { data: [] }; }
export async function getPendingEssaysForTeacher(teacherId: string, organizationId: string | null) {
    const supabase = await createSupabaseServerClient();
    let query = supabase.from('essays').select('id, title, submitted_at, profiles(full_name)').eq('status', 'submitted');
    if (organizationId) query = query.eq('organization_id', organizationId); else query = query.is('organization_id', null);
    const { data, error } = await query.order('submitted_at', { ascending: true });
    return { data, error: error?.message };
}
export async function getCorrectedEssaysForTeacher(teacherId: string, organizationId: string | null) {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from('essays').select(`id, title, submitted_at, profiles ( full_name ), essay_corrections!inner ( final_grade, corrector_id )`)
    .eq('status', 'corrected').eq('essay_corrections.corrector_id', teacherId);
  if (organizationId) query = query.eq('organization_id', organizationId); else query = query.is('organization_id', null);
  const { data, error } = await query.order('submitted_at', { ascending: false });
  return { data, error: error?.message };
}
export async function getAIFeedbackForEssay(essayId: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('ai_feedback').select('*').eq('essay_id', essayId).maybeSingle();
    return { data, error: error?.message };
}
export async function checkForPlagiarism(_text: string) {
    return { data: { similarity_percentage: 0, matches: [] } };
}