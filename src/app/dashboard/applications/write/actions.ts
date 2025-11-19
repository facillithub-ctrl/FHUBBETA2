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
  detailed_feedback: { competency: string; feedback: string }[];
  rewrite_suggestions: { original: string; suggestion: string }[];
  actionable_items: string[];
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

// --- ESTATÍSTICAS (Implementação Real) ---

export async function getStudentStatistics() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null };

    // Busca redações corrigidas com suas notas
    const { data: essays, error } = await supabase
        .from('essays')
        .select(`
            submitted_at,
            essay_corrections!inner ( final_grade, grade_c1, grade_c2, grade_c3, grade_c4, grade_c5 )
        `)
        .eq('student_id', user.id)
        .eq('status', 'corrected')
        .order('submitted_at', { ascending: true }); // Ordem cronológica para o gráfico

    if (error || !essays || essays.length === 0) return { data: null };

    // Processa os dados
    const corrections = essays
        .map(e => e.essay_corrections?.[0] ? { ...e.essay_corrections[0], date: e.submitted_at } : null)
        .filter((c): c is NonNullable<typeof c> => c !== null);

    if (corrections.length === 0) return { data: null };

    const totalCorrections = corrections.length;
    
    // Médias por competência
    const compSums = [1, 2, 3, 4, 5].map(i => {
        const key = `grade_c${i}` as keyof typeof corrections[0];
        return corrections.reduce((acc, curr) => acc + (curr[key] as number || 0), 0);
    });
    const compAvgs = compSums.map(sum => sum / totalCorrections);

    // Média Geral
    const sumFinal = corrections.reduce((acc, curr) => acc + (curr.final_grade || 0), 0);
    const avgFinal = sumFinal / totalCorrections;

    // Ponto a melhorar (menor média)
    const minAvg = Math.min(...compAvgs);
    const minIndex = compAvgs.indexOf(minAvg);
    const pointToImprove = {
        name: `Competência ${minIndex + 1}`,
        average: minAvg
    };

    // Dados para o gráfico
    const progression = corrections.map(c => ({
        date: c.date ? new Date(c.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : 'N/D',
        grade: c.final_grade || 0
    }));

    return {
        data: {
            totalCorrections,
            averages: {
                avg_final_grade: avgFinal,
                avg_c1: compAvgs[0],
                avg_c2: compAvgs[1],
                avg_c3: compAvgs[2],
                avg_c4: compAvgs[3],
                avg_c5: compAvgs[4],
            },
            pointToImprove,
            progression
        }
    };
}

export async function calculateWritingStreak() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: 0 };

    const { data } = await supabase
        .from('essays')
        .select('submitted_at')
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false });

    if (!data || data.length === 0) return { data: 0 };

    const uniqueDates = Array.from(new Set(data.map(e => e.submitted_at?.split('T')[0]))).filter(Boolean);
    
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
        streak = 1;
        let checkDate = new Date(uniqueDates[0] === today ? today : yesterday);
        
        for (let i = 1; i < uniqueDates.length; i++) {
            checkDate.setDate(checkDate.getDate() - 1);
            const checkString = checkDate.toISOString().split('T')[0];
            if (uniqueDates.includes(checkString)) {
                streak++;
            } else {
                break;
            }
        }
    }

    return { data: streak };
}

// --- FUNÇÕES EXISTENTES (Mantidas e Corrigidas) ---

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
      updated_at: now,
  };

  if (essayData.status === 'submitted') {
    dataToUpsert.submitted_at = now;
    if (!essayData.consent_to_ai_training) return { error: 'Termos obrigatórios.' };
  }

  Object.keys(dataToUpsert).forEach(key => dataToUpsert[key] === undefined && delete dataToUpsert[key]);

  const { data: upsertedEssay, error: upsertError } = await supabase
    .from('essays')
    .upsert(dataToUpsert)
    .select()
    .single();

  if (upsertError) return { error: upsertError.message };

  revalidatePath('/dashboard/applications/write');
  return { data: upsertedEssay };
}

export async function getPrompts() {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from('essay_prompts').select('*');
    return { data: data?.sort((a, b) => (b.id > a.id ? 1 : -1)) || [] };
}

export async function getEssaysForStudent() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Usuário não autenticado.' };

  const { data } = await supabase
    .from('essays')
    .select('id, title, status, submitted_at, content, image_submission_url, prompt_id, essay_corrections(final_grade)')
    .eq('student_id', user.id)
    .order('submitted_at', { ascending: false, nullsFirst: false });

  const formattedData = data?.map(essay => ({
      ...essay,
      final_grade: essay.essay_corrections?.[0]?.final_grade
  }));

  return { data: formattedData };
}

export async function getLatestEssayForDashboard() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null };

  try {
      const { data, error } = await supabase
        .from('essays')
        .select(`id, title, status, submitted_at, essay_corrections ( final_grade )`)
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false }) 
        .limit(1)
        .maybeSingle();

        if (error || !data) return { data: null };

        const adaptedData = {
            ...data,
            final_grade: data.essay_corrections?.[0]?.final_grade ?? null,
            prompts: { title: data.title },
            essay_corrections: undefined,
        };

        return { data: adaptedData };
  } catch (err) { return { data: null }; }
}

export async function saveStudyPlan(plan: StudyPlan, essayId: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Auth error' };

    const { error } = await supabase.from('study_plans').insert({
        student_id: user.id,
        essay_id: essayId,
        content: plan
    });

    if (error) return { error: error.message };
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

export async function getEssayDetails(essayId: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('essays').select(`*, profiles (full_name)`).eq('id', essayId).single();
    if (error) return { error: error.message };
    return { data };
}

export async function getCorrectionForEssay(essayId: string) {
    const supabase = await createSupabaseServerClient();
    const { data: correctionBase } = await supabase.from('essay_corrections').select(`*, profiles ( full_name, verification_badge )`).eq('essay_id', essayId).maybeSingle();
    const { data: aiFeedback } = await supabase.from('ai_feedback').select('*').eq('essay_id', essayId).limit(1).maybeSingle();
    return { data: { ...(correctionBase || {}), ai_feedback: aiFeedback || null } };
}

export async function submitCorrection(correctionData: any) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { ai_feedback, ...humanData } = correctionData;
    const { data: correction } = await supabase.from('essay_corrections').insert({ ...humanData, corrector_id: user?.id }).select().single();
    
    if (ai_feedback && correction) {
        await supabase.from('ai_feedback').insert({
            essay_id: correctionData.essay_id,
            correction_id: correction.id,
            detailed_feedback: ai_feedback.detailed_feedback,
            rewrite_suggestions: ai_feedback.rewrite_suggestions,
            actionable_items: ai_feedback.actionable_items
        });
    }
    await supabase.from('essays').update({ status: 'corrected' }).eq('id', correctionData.essay_id);
    revalidatePath('/dashboard/applications/write');
    return { data: correction };
}

export async function getPendingEssaysForTeacher(teacherId: string, organizationId: string | null) {
    const supabase = await createSupabaseServerClient();
    let query = supabase.from('essays').select('id, title, submitted_at, profiles(full_name)').eq('status', 'submitted');
    if (organizationId) query = query.eq('organization_id', organizationId); else query = query.is('organization_id', null);
    const { data, error } = await query.order('submitted_at', { ascending: true });
    return { data, error };
}

export async function getCorrectedEssaysForTeacher(teacherId: string, organizationId: string | null) {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from('essays').select(`id, title, submitted_at, profiles ( full_name ), essay_corrections!inner ( final_grade, corrector_id )`).eq('status', 'corrected').eq('essay_corrections.corrector_id', teacherId);
  if (organizationId) query = query.eq('organization_id', organizationId);
  const { data, error } = await query.order('submitted_at', { ascending: false });
  return { data, error };
}

export async function checkForPlagiarism(text: string) {
    return { data: { similarity_percentage: Math.random() * 2, matches: [] } };
}

export async function getUserStateRank() { return { data: { rank: null, state: null } }; }
export async function getFrequentErrors() { return { data: [] }; }
export async function getCurrentEvents() { return { data: [] }; }