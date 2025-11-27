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
    profiles?: { full_name: string | null, verification_badge: string | null } | null;
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
};

export type ActionPlan = {
    id: string;
    text: string;
    is_completed: boolean;
    source_essay?: string;
};

// --- FUNÇÕES PRINCIPAIS ---

// Salva ou Atualiza Redação (Aluno)
export async function saveOrUpdateEssay(essayData: Partial<Essay>) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Usuário não autenticado.' };

  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();

  if (essayData.status === 'submitted') {
    if (!essayData.consent_to_ai_training) {
      return { error: 'É obrigatório consentir com os termos para enviar a redação.' };
    }
    // Verifica duplicidade apenas se for um novo envio (sem ID)
    if (essayData.prompt_id && !essayData.id) {
      const { data: existingEssay } = await supabase
        .from('essays')
        .select('id')
        .eq('student_id', user.id)
        .eq('prompt_id', essayData.prompt_id)
        .in('status', ['submitted', 'corrected'])
        .limit(1)
        .maybeSingle();

      if (existingEssay) {
        return { error: 'Você já enviou uma redação para este tema.' };
      }
    }
  }

  const dataToUpsert: Partial<Essay> & { student_id: string } = {
      ...essayData,
      student_id: user.id,
      organization_id: profile?.organization_id,
      submitted_at: essayData.status === 'submitted' ? new Date().toISOString() : essayData.submitted_at,
  };

  if (!dataToUpsert.id) delete dataToUpsert.id;

  const { data: upsertedEssay, error: upsertError } = await supabase
    .from('essays')
    .upsert(dataToUpsert)
    .select()
    .single();

  if (upsertError) return { error: `Erro ao salvar: ${upsertError.message}` };

  // Salva versão no histórico se for rascunho
  if (upsertedEssay && essayData.status === 'draft' && essayData.content) {
    const { count } = await supabase
      .from('essay_versions')
      .select('*', { count: 'exact', head: true })
      .eq('essay_id', upsertedEssay.id);

    await supabase.from('essay_versions').insert({
        essay_id: upsertedEssay.id,
        content: essayData.content,
        version_number: (count ?? 0) + 1,
    });
  }

  revalidatePath('/dashboard/applications/write');
  revalidatePath('/dashboard');
  return { data: upsertedEssay };
}

// Busca Temas
export async function getPrompts() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('essay_prompts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return { error: error.message };
    return { data: data || [] };
}

// Busca Redações do Aluno (Otimizado para trazer notas)
export async function getEssaysForStudent() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Usuário não autenticado.' };

  // Adicionamos essay_corrections(final_grade) para exibir a nota na lista
  const { data, error } = await supabase
    .from('essays')
    .select(`
      id, 
      title, 
      status, 
      submitted_at, 
      content, 
      image_submission_url, 
      prompt_id,
      essay_corrections ( final_grade )
    `)
    .eq('student_id', user.id)
    .order('submitted_at', { ascending: false, nullsFirst: true });

  if (error) return { error: error.message };

  // Mapeia para trazer final_grade para o nível superior do objeto
  const essaysWithGrades = data?.map(essay => ({
    ...essay,
    final_grade: essay.essay_corrections?.[0]?.final_grade ?? null,
    // Removemos a propriedade aninhada para limpar o objeto
    essay_corrections: undefined
  }));

  return { data: essaysWithGrades };
}

// Busca Detalhes de uma Redação
export async function getEssayDetails(essayId: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('essays')
        .select(`*, profiles (full_name)`)
        .eq('id', essayId)
        .maybeSingle();

    if (error) return { error: error.message };
    return { data: data as (Essay & { profiles: { full_name: string | null } | null }) };
}

// Busca a Correção Completa (Humana + IA)
export async function getCorrectionForEssay(essayId: string) {
    const supabase = await createSupabaseServerClient();

    // 1. Busca Correção Humana
    const { data: correctionBase, error: correctionError } = await supabase
        .from('essay_corrections')
        .select(`*, profiles ( full_name, verification_badge )`)
        .eq('essay_id', essayId)
        .maybeSingle();

    if (correctionError) return { error: correctionError.message };
    if (!correctionBase) return { data: undefined };

    // 2. Busca Feedback IA Separado (mais seguro contra nulos)
    const { data: aiFeedback } = await supabase
        .from('ai_feedback')
        .select('*')
        .eq('essay_id', essayId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    const finalData: EssayCorrection = {
        ...correctionBase,
        ai_feedback: aiFeedback || null
    };

    return { data: finalData };
}

// Envia Correção (Professor)
export async function submitCorrection(correctionData: Omit<EssayCorrection, 'id' | 'corrector_id' | 'created_at' | 'profiles'>) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado.' };

    const { ai_feedback, ...humanData } = correctionData;

    // Insere Correção Humana
    const { data: correction, error } = await supabase
        .from('essay_corrections')
        .insert({ ...humanData, corrector_id: user.id })
        .select()
        .single();

    if (error) return { error: error.message };

    // Insere Feedback IA (se houver)
    if (ai_feedback) {
        await supabase.from('ai_feedback').insert({
            essay_id: correctionData.essay_id,
            correction_id: correction.id,
            detailed_feedback: ai_feedback.detailed_feedback,
            rewrite_suggestions: ai_feedback.rewrite_suggestions,
            actionable_items: ai_feedback.actionable_items
        });
    }

    // Atualiza Status da Redação
    await supabase.from('essays').update({ status: 'corrected' }).eq('id', correctionData.essay_id);

    revalidatePath('/dashboard/applications/write');
    return { data: correction };
}

// Estatísticas do Aluno
export async function getStudentStatistics() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null };

    // Usa !inner para pegar apenas redações que TÊM correções
    const { data: essays } = await supabase
        .from('essays')
        .select(`submitted_at, essay_corrections!inner ( final_grade, grade_c1, grade_c2, grade_c3, grade_c4, grade_c5 )`)
        .eq('student_id', user.id)
        .eq('status', 'corrected');

    if (!essays || essays.length === 0) return { data: null };

    const corrections = essays.map(e => ({ ...e.essay_corrections[0], submitted_at: e.submitted_at }));
    const total = corrections.length;

    const sums = corrections.reduce((acc, c) => ({
        final: acc.final + c.final_grade,
        c1: acc.c1 + c.grade_c1, c2: acc.c2 + c.grade_c2, c3: acc.c3 + c.grade_c3, c4: acc.c4 + c.grade_c4, c5: acc.c5 + c.grade_c5
    }), { final: 0, c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 });

    const averages = {
        avg_final_grade: sums.final / total,
        avg_c1: sums.c1 / total, avg_c2: sums.c2 / total, avg_c3: sums.c3 / total,
        avg_c4: sums.c4 / total, avg_c5: sums.c5 / total
    };

    const comps = [
        { name: 'C1', average: averages.avg_c1 }, { name: 'C2', average: averages.avg_c2 },
        { name: 'C3', average: averages.avg_c3 }, { name: 'C4', average: averages.avg_c4 }, { name: 'C5', average: averages.avg_c5 }
    ];
    const pointToImprove = comps.sort((a, b) => a.average - b.average)[0];

    const progression = corrections
        .sort((a, b) => new Date(a.submitted_at!).getTime() - new Date(b.submitted_at!).getTime())
        .map(c => ({
            date: new Date(c.submitted_at!).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            grade: c.final_grade
        }));

    return { data: { totalCorrections: total, averages, pointToImprove, progression } };
}

export async function calculateWritingStreak() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: 0 };

    // Otimização: Busca apenas a coluna necessária
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
    const today = new Date();
    today.setHours(0,0,0,0);

    if (uniqueDates[0].getTime() === today.getTime() || uniqueDates[0].getTime() === new Date(today.setDate(today.getDate()-1)).getTime()) {
        streak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
            const diff = (uniqueDates[i-1].getTime() - uniqueDates[i].getTime()) / (1000 * 3600 * 24);
            if (diff === 1) streak++;
            else break;
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

    const { data: rank } = await supabase.rpc('get_user_rank_in_state', { p_user_id: user.id, p_state: profile.address_state });
    return { data: { rank, state: profile.address_state } };
}

export async function getFrequentErrors() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    const { data } = await supabase.rpc('get_frequent_errors_for_student', { p_student_id: user.id });
    return { data: data || [] };
}

export async function getCurrentEvents() {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from('current_events').select('*').limit(5).order('created_at', { ascending: false });
    return { data: data || [] };
}

// Obtém planos de ação a partir dos feedbacks de IA recentes
export async function getUserActionPlans() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    // 1. Pega essays do aluno
    const { data: essays } = await supabase
        .from('essays')
        .select('id, title')
        .eq('student_id', user.id)
        .limit(5);

    if (!essays || essays.length === 0) return { data: [] };

    // 2. Pega feedbacks dessas essays
    const { data: feedbacks } = await supabase
        .from('ai_feedback')
        .select('actionable_items, essay_id')
        .in('essay_id', essays.map(e => e.id))
        .limit(10);

    if (!feedbacks) return { data: [] };

    // Processa e remove duplicatas
    const plans: ActionPlan[] = [];
    const seenItems = new Set();

    feedbacks.forEach(fb => {
        const essayTitle = essays.find(e => e.id === fb.essay_id)?.title || 'Redação';
        fb.actionable_items?.forEach((item: string) => {
            if (!seenItems.has(item)) {
                seenItems.add(item);
                plans.push({
                    id: crypto.randomUUID(),
                    text: item,
                    is_completed: false,
                    source_essay: essayTitle
                });
            }
        });
    });

    return { data: plans.slice(0, 5) };
}

// Salva um plano de estudo
export async function saveStudyPlan(plan: any) {
    return { success: true };
}

// --- FUNÇÕES DE PROFESSOR ---

export async function getPendingEssaysForTeacher(teacherId: string, organizationId: string | null) {
    const supabase = await createSupabaseServerClient();
    let query = supabase.from('essays').select('id, title, submitted_at, profiles(full_name)').eq('status', 'submitted');

    if (organizationId) query = query.eq('organization_id', organizationId);
    else query = query.is('organization_id', null);

    const { data } = await query.order('submitted_at', { ascending: true });
    return { data };
}

export async function getCorrectedEssaysForTeacher(teacherId: string, organizationId: string | null) {
    const supabase = await createSupabaseServerClient();
    let query = supabase.from('essays')
        .select(`id, title, submitted_at, profiles(full_name), essay_corrections!inner(final_grade, corrector_id)`)
        .eq('status', 'corrected')
        .eq('essay_corrections.corrector_id', teacherId);

    if (organizationId) query = query.eq('organization_id', organizationId);
    else query = query.is('organization_id', null);

    const { data } = await query.order('submitted_at', { ascending: false });
    return { data };
}

export async function getLatestEssayForDashboard() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null };

    const { data } = await supabase.from('essays')
        .select(`id, title, status, essay_corrections ( final_grade ), prompts ( title )`)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (!data) return { data: null };

    // CORREÇÃO DO ERRO DE BUILD: Tratamos prompts como array se necessário, ou objeto.
    // O Supabase pode retornar prompts como array [] se for um relacionamento one-to-many inferido,
    // ou objeto {} se for one-to-one. Aqui garantimos segurança.
    const promptsData = data.prompts;
    const promptTitle = Array.isArray(promptsData)
        ? promptsData[0]?.title
        : (promptsData as any)?.title;

    return {
        data: {
            ...data,
            final_grade: data.essay_corrections?.[0]?.final_grade ?? null,
            prompts: promptTitle ? { title: promptTitle } : null
        }
    };
}

// Simulação de Plágio
export async function checkForPlagiarism(_text: string) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const hasPlagiarism = Math.random() > 0.7;

    if (hasPlagiarism) {
        return { data: { similarity_percentage: Math.random() * 20 + 5, matches: [{ source: "Fonte Simulada", text: "Trecho simulado..." }] } };
    }
    return { data: { similarity_percentage: Math.random() * 3, matches: [] } };
}

export async function getAIFeedbackForEssay(essayId: string) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
        .from('ai_feedback')
        .select('*')
        .eq('essay_id', essayId)
        .maybeSingle();
    return { data };
}

export async function createNotification(userId: string, title: string, message: string, link: string | null) {
    const supabase = await createSupabaseServerClient();
    await supabase.from('notifications').insert({ user_id: userId, title, message, link });
}
export async function saveAIFeedback(essayId: string, aiFeedbackData: AIFeedback) {
    const supabase = await createSupabaseServerClient();
    
    // 1. Busca a correção humana associada a essa redação para vincular o ID
    const { data: correction } = await supabase
        .from('essay_corrections')
        .select('id')
        .eq('essay_id', essayId)
        .single();

    if (!correction) {
        return { error: 'Correção base não encontrada. É necessário ter uma correção humana antes de salvar a IA.' };
    }

    // 2. Insere ou Atualiza o Feedback da IA
    const { data, error } = await supabase
        .from('ai_feedback')
        .upsert({
            essay_id: essayId,
            correction_id: correction.id,
            detailed_feedback: aiFeedbackData.detailed_feedback,
            rewrite_suggestions: aiFeedbackData.rewrite_suggestions,
            actionable_items: aiFeedbackData.actionable_items
        })
        .select()
        .single();

    if (error) return { error: error.message };
    
    revalidatePath('/dashboard/applications/write');
    return { data };
}