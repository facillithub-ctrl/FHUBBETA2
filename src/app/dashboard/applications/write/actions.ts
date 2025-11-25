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

export type AIFeedback = {
  id?: string;
  essay_id?: string;
  correction_id?: string;
  detailed_feedback: { competency: string; feedback: string }[];
  rewrite_suggestions: { original: string; suggestion: string }[];
  actionable_items: any[]; 
  created_at?: string;
};

export type StudyPlan = {
    essay_id: string;
    essay_title: string;
    tasks: { id: string; text: string; completed: boolean }[];
    created_at: string;
};

// --- FUNÇÕES DE DADOS ---

export async function saveOrUpdateEssay(essayData: Partial<Essay>) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Usuário não autenticado.' };

  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();

  if (essayData.status === 'submitted' && !essayData.consent_to_ai_training) {
      return { error: 'É obrigatório consentir com os termos para enviar a redação.' };
  }

  const dataToUpsert: any = {
      ...essayData,
      student_id: user.id,
      organization_id: profile?.organization_id,
      submitted_at: essayData.status === 'submitted' ? new Date().toISOString() : essayData.submitted_at,
  };
  if (!dataToUpsert.id) delete dataToUpsert.id;

  const { data: upsertedEssay, error: upsertError } = await supabase.from('essays').upsert(dataToUpsert).select().single();

  if (upsertError) return { error: `Erro ao salvar: ${upsertError.message}` };

  if (upsertedEssay && essayData.status === 'draft' && essayData.content) {
    const { count } = await supabase.from('essay_versions').select('*', { count: 'exact', head: true }).eq('essay_id', upsertedEssay.id);
    await supabase.from('essay_versions').insert({
        essay_id: upsertedEssay.id,
        content: essayData.content,
        version_number: (count ?? 0) + 1,
      });
  }

  revalidatePath('/dashboard/applications/write');
  return { data: upsertedEssay };
}

export async function getPrompts() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('essay_prompts').select('*').order('created_at', { ascending: false });
    return { data: data || [], error: error?.message };
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

  const formattedData = data?.map(essay => ({
      ...essay,
      // @ts-ignore
      final_grade: essay.essay_corrections?.[0]?.final_grade ?? null
  })) || [];

  return { data: formattedData, error: error?.message };
}

export async function getLatestEssayForDashboard() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null };

  const { data, error } = await supabase
    .from('essays')
    .select(`
        id, title, status, 
        essay_corrections ( final_grade ),
        essay_prompts ( title )
    `)
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

    if (error) {
        console.error("Erro ao buscar última redação:", error);
        return { data: null, error: error.message };
    }

    let promptTitle = null;
    if (data?.essay_prompts) {
        promptTitle = Array.isArray(data.essay_prompts) 
            ? data.essay_prompts[0]?.title 
            : (data.essay_prompts as any).title;
    }

    const adaptedData = data ? {
        ...data,
        // @ts-ignore
        final_grade: data.essay_corrections?.[0]?.final_grade ?? null,
        prompts: promptTitle ? { title: promptTitle } : null,
        essay_corrections: undefined,
    } : null;

    return { data: adaptedData };
}

export async function getUserActionPlans() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    const { data, error } = await supabase
        .from('ai_feedback')
        .select(`id, actionable_items, created_at, essays!inner ( id, title )`)
        .eq('essays.student_id', user.id)
        .not('actionable_items', 'is', null)
        .order('created_at', { ascending: false });

    if (error) return { data: [] };

    const plans = data.map(item => ({
        id: item.id,
        essay_id: item.essays.id,
        essay_title: item.essays.title || "Redação sem título",
        tasks: Array.isArray(item.actionable_items) 
            ? item.actionable_items.map((task: any, idx: number) => 
                typeof task === 'string' ? { id: `${item.id}-${idx}`, text: task, completed: false } : task
              )
            : [],
        created_at: item.created_at
    }));

    return { data: plans };
}

export async function saveStudyPlan(essayId: string, tasks: any[]) {
    const supabase = await createSupabaseServerClient();
    // Upsert na tabela ai_feedback
    const { error } = await supabase
        .from('ai_feedback')
        .upsert({ essay_id: essayId, actionable_items: tasks }, { onConflict: 'essay_id' });

    if (error) return { error: error.message };
    revalidatePath('/dashboard/applications/write');
    return { success: true };
}

export async function getEssayDetails(essayId: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('essays')
        .select(`*, profiles (full_name), essay_prompts (title, description)`)
        .eq('id', essayId)
        .maybeSingle();
    return { data: data as any, error: error?.message };
}

export async function getCorrectionForEssay(essayId: string) {
    const supabase = await createSupabaseServerClient();
    
    const { data: correctionBase } = await supabase
        .from('essay_corrections')
        .select(`*, profiles(full_name, verification_badge), essay_correction_errors(common_errors(error_type))`)
        .eq('essay_id', essayId)
        .maybeSingle();

    if (!correctionBase) return { data: undefined };

    const { data: aiFeedbackData } = await supabase
        .from('ai_feedback')
        .select('*')
        .eq('essay_id', essayId)
        .maybeSingle();

    return { data: { ...correctionBase, ai_feedback: aiFeedbackData || null } };
}

export async function getStudentStatistics() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null };

    // Objeto padrão para gráficos vazios
    const emptyStats = {
        totalCorrections: 0,
        averages: { avg_final_grade: 0, avg_c1: 0, avg_c2: 0, avg_c3: 0, avg_c4: 0, avg_c5: 0 },
        pointToImprove: { name: 'Nenhuma correção', average: 0 },
        progression: [],
        errorDistribution: [],
        writingHabits: []
    };

    // Busca todas as correções para gerar estatísticas
    const { data: corrections } = await supabase
        .from('essay_corrections')
        .select(`
            final_grade, grade_c1, grade_c2, grade_c3, grade_c4, grade_c5, created_at,
            essays!inner(submitted_at),
            essay_correction_errors ( common_errors ( error_type ) )
        `)
        .eq('essays.student_id', user.id)
        .order('created_at', { ascending: true });

    if (!corrections || corrections.length === 0) return { data: emptyStats };

    const total = corrections.length;
    const sum = (key: string) => corrections.reduce((a, b) => a + (b[key as keyof typeof b] as number || 0), 0);
    const averages = {
        avg_final_grade: sum('final_grade') / total,
        avg_c1: sum('grade_c1') / total, avg_c2: sum('grade_c2') / total,
        avg_c3: sum('grade_c3') / total, avg_c4: sum('grade_c4') / total,
        avg_c5: sum('grade_c5') / total,
    };
    
    const pointToImprove = [{name:'C1', v: averages.avg_c1}, {name:'C2', v: averages.avg_c2}, {name:'C3', v: averages.avg_c3}, {name:'C4', v: averages.avg_c4}, {name:'C5', v: averages.avg_c5}].sort((a,b)=>a.v-b.v)[0];

    // Dados para gráfico de progressão
    const progression = corrections.map(c => ({
        // @ts-ignore
        date: new Date(c.essays.submitted_at || c.created_at).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'}),
        grade: c.final_grade,
        c1: c.grade_c1, c2: c.grade_c2, c3: c.grade_c3, c4: c.grade_c4, c5: c.grade_c5
    })).slice(-10);

    // Dados para gráfico de erros (Donut)
    const errorCounts: Record<string, number> = {};
    corrections.forEach(c => {
        c.essay_correction_errors?.forEach((e: any) => {
            const type = e.common_errors?.error_type || 'Outros';
            errorCounts[type] = (errorCounts[type] || 0) + 1;
        });
    });
    const errorDistribution = Object.entries(errorCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    // Dados para hábitos
    const habits = [0,0,0,0,0,0,0]; 
    corrections.forEach(c => {
        // @ts-ignore
        const d = new Date(c.essays.submitted_at || c.created_at);
        habits[d.getDay()]++;
    });
    const writingHabits = [
        { day: 'Dom', essays: habits[0] }, { day: 'Seg', essays: habits[1] }, { day: 'Ter', essays: habits[2] },
        { day: 'Qua', essays: habits[3] }, { day: 'Qui', essays: habits[4] }, { day: 'Sex', essays: habits[5] },
        { day: 'Sáb', essays: habits[6] }
    ];

    return { data: { totalCorrections: total, averages, pointToImprove: {name: pointToImprove.name, average: pointToImprove.v}, progression, errorDistribution, writingHabits } };
}

// Stubs
export async function getStudentMiniHistory(id: string) { return []; }
export async function calculateWritingStreak() { return { data: 3 }; } // Mock para demo
export async function getUserStateRank() { return { data: { rank: 12, state: 'SP' } }; } // Mock para demo
export async function getFrequentErrors() { return { data: [] }; }
export async function getCurrentEvents() { return { data: [] }; }
export async function createNotification() { return { error: null }; }
export async function getPendingEssaysForTeacher() { return { data: [] }; }
export async function getCorrectedEssaysForTeacher() { return { data: [] }; }
export async function submitCorrection(data: any) { return { data: null }; }
export async function checkForPlagiarism() { return { data: { similarity_percentage: 0, matches: [] } }; }
export async function getAIFeedbackForEssay() { return { data: null }; }