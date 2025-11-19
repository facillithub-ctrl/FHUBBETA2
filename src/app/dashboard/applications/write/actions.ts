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

// --- FUNÇÕES DE ALUNO E GERAIS ---

export async function saveOrUpdateEssay(essayData: Partial<Essay>) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Usuário não autenticado.' };

  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();

  const dataToUpsert: any = {
      ...essayData,
      student_id: user.id,
      organization_id: profile?.organization_id,
      updated_at: new Date().toISOString(),
  };

  if (essayData.status === 'submitted') {
    dataToUpsert.submitted_at = new Date().toISOString();
    if (!essayData.consent_to_ai_training) {
      return { error: 'É obrigatório consentir com os termos para enviar a redação.' };
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

  // Versionamento
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
    const { data, error } = await supabase
        .from('essay_prompts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return { error: error.message };
    return { data: data || [] };
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

  if (error) return { error: error.message };
  return { data };
}

export async function getLatestEssayForDashboard() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Usuário não autenticado.' };

  try {
      // Busca a redação mais recente
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
            console.error("Erro ao buscar última redação para dashboard:", error);
            return { data: null, error: error.message };
        }

        if (!data) return { data: null };

        // Adaptação para o frontend
        const adaptedData = {
            ...data,
            final_grade: data.essay_corrections?.[0]?.final_grade ?? null,
            prompts: data.prompts ? { title: data.prompts.title } : null,
            essay_corrections: undefined, 
        };

        return { data: adaptedData };
  } catch (err: any) {
      console.error("Erro inesperado no getLatestEssayForDashboard:", err);
      return { data: null, error: "Erro interno ao buscar dados." };
  }
}

export async function getEssayDetails(essayId: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('essays')
        .select(`*, profiles (full_name)`)
        .eq('id', essayId)
        .single();

    if (error) return { error: error.message };
    return { data };
}

// --- FUNÇÕES DE CORREÇÃO E IA ---

export async function getCorrectionForEssay(essayId: string) {
    const supabase = await createSupabaseServerClient();

    // 1. Busca Correção Humana Base
    const { data: correctionBase, error: correctionError } = await supabase
        .from('essay_corrections')
        .select(`*, profiles ( full_name, verification_badge )`)
        .eq('essay_id', essayId)
        .maybeSingle();

    if (correctionError) return { error: correctionError.message };
    if (!correctionBase) return { data: null };

    // 2. Busca Feedback IA Separado
    const { data: aiFeedback } = await supabase
        .from('ai_feedback')
        .select('*')
        .eq('essay_id', essayId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    return { 
        data: { 
            ...correctionBase, 
            ai_feedback: aiFeedback || null 
        } 
    };
}

export async function submitCorrection(correctionData: any) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado.' };

    const { ai_feedback, ...humanData } = correctionData;

    // 1. Salvar Correção Humana
    const { data: correction, error: correctionError } = await supabase
        .from('essay_corrections')
        .insert({ ...humanData, corrector_id: user.id })
        .select()
        .single();

    if (correctionError) return { error: correctionError.message };

    // 2. Salvar Feedback IA
    if (ai_feedback) {
        await supabase.from('ai_feedback').insert({
            essay_id: correctionData.essay_id,
            correction_id: correction.id,
            detailed_feedback: ai_feedback.detailed_feedback,
            rewrite_suggestions: ai_feedback.rewrite_suggestions,
            actionable_items: ai_feedback.actionable_items
        });
    }

    // 3. Atualizar status da redação
    await supabase.from('essays').update({ status: 'corrected' }).eq('id', correctionData.essay_id);

    revalidatePath('/dashboard/applications/write');
    return { data: correction };
}

export async function getPendingEssaysForTeacher(teacherId: string, organizationId: string | null) {
    const supabase = await createSupabaseServerClient();
    let query = supabase
        .from('essays')
        .select('id, title, submitted_at, profiles(full_name)')
        .eq('status', 'submitted');

    if (organizationId) {
        query = query.eq('organization_id', organizationId);
    } else {
        query = query.is('organization_id', null);
    }

    const { data, error } = await query.order('submitted_at', { ascending: true });
    return { data, error };
}

export async function getCorrectedEssaysForTeacher(teacherId: string, organizationId: string | null) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from('essays')
    .select(`
        id, title, submitted_at,
        profiles ( full_name ),
        essay_corrections!inner ( final_grade, corrector_id )
    `)
    .eq('status', 'corrected')
    .eq('essay_corrections.corrector_id', teacherId);

  if (organizationId) {
      query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query.order('submitted_at', { ascending: false });
  return { data, error };
}

// --- FUNÇÕES AUXILIARES E PLÁGIO ---

export async function checkForPlagiarism(text: string): Promise<{ data?: { similarity_percentage: number; matches: { source: string; text: string }[] }; error?: string }> {
    // Simulação
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simula erro aleatório para teste de tratamento (remover em prod)
    // if (Math.random() > 0.9) return { error: "Serviço de verificação indisponível." };

    const hasPlagiarism = Math.random() > 0.7;
    if (hasPlagiarism) {
        return {
            data: {
                similarity_percentage: Math.random() * 20 + 5,
                matches: [{ source: "Fonte Exemplo Web", text: "Trecho similar encontrado..." }]
            }
        };
    }
    return {
        data: {
            similarity_percentage: Math.random() * 3,
            matches: []
        }
    };
}

// Stubs para funções estatísticas (implementar lógica real conforme necessário)
export async function getStudentStatistics() { return { data: null }; }
export async function calculateWritingStreak() { return { data: 0 }; }
export async function getUserStateRank() { return { data: { rank: null, state: null } }; }
export async function getFrequentErrors() { return { data: [] }; }
export async function getCurrentEvents() { return { data: [] }; }