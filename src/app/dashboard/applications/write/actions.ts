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
    ai_feedback?: any;
    profiles?: { full_name: string | null, verification_badge: string | null };
    created_at?: string;
};

export type EssayPrompt = {
    id: string;
    title: string;
    description: string | null;
    source: string | null;
    motivational_text_1: string | null;
    motivational_text_2: string | null;
    motivational_text_3_image_url: string | null;
    motivational_text_3_description: string | null;
    motivational_text_3_image_source: string | null;
};

// --- FUNÇÕES ---

export async function saveOrUpdateEssay(essayData: Partial<Essay>) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Usuário não autenticado.' };

  const dataToUpsert: any = {
      ...essayData,
      student_id: user.id,
      updated_at: new Date().toISOString(),
  };
  
  if (essayData.status === 'submitted') {
      dataToUpsert.submitted_at = new Date().toISOString();
  }

  if (!dataToUpsert.id) delete dataToUpsert.id;

  const { data, error } = await supabase
    .from('essays')
    .upsert(dataToUpsert)
    .select()
    .single();

  if (error) {
      console.error("Erro ao salvar redação:", error);
      return { error: error.message };
  }

  revalidatePath('/dashboard/applications/write');
  return { data };
}

export async function getPrompts() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('essay_prompts')
        .select('*')
        .order('created_at', { ascending: false });
    return { data: data || [], error: error?.message };
}

export async function getEssayDetails(essayId: string) {
    const supabase = await createSupabaseServerClient();
    
    // 1. Busca a redação
    const { data: essay, error } = await supabase
        .from('essays')
        .select('*, profiles(full_name)')
        .eq('id', essayId)
        .single();

    if (error) return { error: error.message };
    if (!essay) return { error: "Redação não encontrada" };

    // 2. Busca o tema separadamente
    let promptTitle = null;
    if (essay.prompt_id) {
        const { data: prompt } = await supabase
            .from('essay_prompts')
            .select('title')
            .eq('id', essay.prompt_id)
            .single();
        if (prompt) promptTitle = prompt.title;
    }

    return { 
        data: { 
            ...essay, 
            prompts: { title: promptTitle } 
        } 
    };
}

// ESSA É A FUNÇÃO QUE ESTAVA EM FALTA NO BUILD
export async function getEssaysForStudent() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Usuário não autenticado.' };

  const { data, error } = await supabase
    .from('essays')
    .select('id, title, status, submitted_at, content, image_submission_url, prompt_id')
    .eq('student_id', user.id)
    .order('submitted_at', { ascending: false });

  if (error) return { error: error.message };
  return { data: data || [] };
}

// ESSA É A FUNÇÃO QUE DAVA ERRO {}
export async function getLatestEssayForDashboard() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Usuário não autenticado.' };

  // 1. Busca apenas a redação mais recente (SEM JOINS COMPLEXOS)
  const { data: essay, error } = await supabase
    .from('essays')
    .select('id, title, status, prompt_id, created_at')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

    if (error) {
        console.error("Erro no dashboard:", error);
        return { data: null, error: error.message };
    }
    if (!essay) return { data: null };

    // 2. Busca o Título do Prompt manualmente
    let promptTitle = null;
    if (essay.prompt_id) {
        const { data: p } = await supabase.from('essay_prompts').select('title').eq('id', essay.prompt_id).maybeSingle();
        if (p) promptTitle = p.title;
    }

    // 3. Busca a Nota manualmente se estiver corrigida
    let finalGrade = null;
    if (essay.status === 'corrected') {
        const { data: c } = await supabase.from('essay_corrections').select('final_grade').eq('essay_id', essay.id).maybeSingle();
        if (c) finalGrade = c.final_grade;
    }

    // Monta o objeto final
    return { 
        data: {
            ...essay,
            final_grade: finalGrade,
            prompts: { title: promptTitle }
        }
    };
}

// CORREÇÃO PARA O PROFESSOR E ALUNO (VIEW)
export async function getCorrectionForEssay(essayId: string) {
    const supabase = await createSupabaseServerClient();
    
    // 1. Busca a correção humana
    const { data: correction, error } = await supabase
        .from('essay_corrections')
        .select('*')
        .eq('essay_id', essayId)
        .maybeSingle();

    if (error) return { error: error.message };

    if (!correction) {
        return { data: null }; 
    }

    // 2. Busca o nome do professor separadamente
    let profileData = { full_name: "Professor", verification_badge: null };
    if (correction.corrector_id) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, verification_badge')
            .eq('id', correction.corrector_id)
            .maybeSingle();
        
        if (profile) profileData = profile;
    }

    // 3. Busca o feedback da IA
    const { data: aiFeedback } = await supabase
        .from('ai_feedback')
        .select('*')
        .eq('essay_id', essayId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    // Combina tudo
    const finalData = { 
        ...correction, 
        profiles: profileData,
        ai_feedback: aiFeedback 
    };
    
    return { data: finalData };
}

export async function submitCorrection(correctionData: any) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autorizado" };

    const { ai_feedback, ...mainData } = correctionData;

    // 1. Salva correção
    const { data: correction, error } = await supabase
        .from('essay_corrections')
        .insert({ 
            ...mainData, 
            corrector_id: user.id,
            created_at: new Date().toISOString() 
        })
        .select()
        .single();

    if (error) {
        console.error("Erro ao salvar correção DB:", error);
        return { error: error.message };
    }

    // 2. Salva AI Feedback se existir
    if (ai_feedback) {
        await supabase.from('ai_feedback').insert({
            essay_id: mainData.essay_id,
            correction_id: correction.id,
            detailed_feedback: ai_feedback.detailed_feedback || [],
            rewrite_suggestions: ai_feedback.rewrite_suggestions || [],
            actionable_items: ai_feedback.actionable_items || []
        });
    }

    // 3. Atualiza status da redação
    await supabase
        .from('essays')
        .update({ status: 'corrected' })
        .eq('id', mainData.essay_id);

    revalidatePath('/dashboard/applications/write');
    return { data: correction };
}

// Funções auxiliares simples para evitar erros
export async function getPendingEssaysForTeacher(teacherId: string, organizationId: string | null) {
    const supabase = await createSupabaseServerClient();
    let query = supabase.from('essays').select('*, profiles(full_name)').eq('status', 'submitted');
    if (organizationId) query = query.eq('organization_id', organizationId);
    else query = query.is('organization_id', null);
    
    const { data, error } = await query.order('submitted_at', { ascending: true });
    return { data: data || [], error: error?.message };
}

export async function getCorrectedEssaysForTeacher(teacherId: string, organizationId: string | null) {
  const supabase = await createSupabaseServerClient();
  // Simplificado: Busca correções e depois as redações
  const { data: corrections } = await supabase
    .from('essay_corrections')
    .select('essay_id, final_grade')
    .eq('corrector_id', teacherId);

  if (!corrections || corrections.length === 0) return { data: [] };

  const essayIds = corrections.map(c => c.essay_id);
  const { data: essays } = await supabase
    .from('essays')
    .select('*, profiles(full_name)')
    .in('id', essayIds)
    .order('submitted_at', { ascending: false });

  const result = essays?.map(essay => {
      const corr = corrections.find(c => c.essay_id === essay.id);
      return {
          ...essay,
          essay_corrections: [{ final_grade: corr?.final_grade }]
      };
  });

  return { data: result || [] };
}

// Stubs para funções não críticas (para não quebrar importações)
export async function checkForPlagiarism(text: string) { return { data: { similarity_percentage: 0, matches: [] } }; }
export async function getStudentStatistics() { return { data: null }; }
export async function calculateWritingStreak() { return { data: 0 }; }
export async function getUserStateRank() { return { data: null }; }
export async function getFrequentErrors() { return { data: [] }; }
export async function getCurrentEvents() { return { data: [] }; }
export async function getAIFeedbackForEssay(essayId: string) { return { data: null }; }
export async function createNotification() { return { error: null }; }