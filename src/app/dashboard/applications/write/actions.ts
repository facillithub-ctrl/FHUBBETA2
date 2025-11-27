"use server";

import { revalidatePath } from 'next/cache';
import createSupabaseServerClient from '@/utils/supabase/server';

// =============================================================================
// 1. TIPOS DE DADOS (TYPES)
// =============================================================================

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
    // Novos campos
    badge?: string | null;
    additional_link?: string | null;
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

// =============================================================================
// 2. FUNÇÕES DE ALUNO E GERAIS
// =============================================================================

/**
 * Salva ou atualiza uma redação (Rascunho ou Envio).
 */
export async function saveOrUpdateEssay(essayData: Partial<Essay>) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Usuário não autenticado.' };

  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();

  if (essayData.status === 'submitted') {
    if (!essayData.consent_to_ai_training) {
      return { error: 'É obrigatório consentir com os termos para enviar a redação.' };
    }
    // Verifica duplicidade
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

  // Versionamento de rascunhos
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
  return { data: upsertedEssay };
}

export async function getPrompts() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('essay_prompts').select('*').order('created_at', { ascending: false });
    if (error) return { error: error.message };
    return { data: data || [] };
}

export async function getEssaysForStudent() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Usuário não autenticado.' };

  const { data, error } = await supabase
    .from('essays')
    .select(`id, title, status, submitted_at, content, image_submission_url, prompt_id, essay_corrections ( final_grade )`)
    .eq('student_id', user.id)
    .order('submitted_at', { ascending: false, nullsFirst: true });

  if (error) return { error: error.message };

  const essaysWithGrades = data?.map(essay => ({
    ...essay,
    final_grade: essay.essay_corrections?.[0]?.final_grade ?? null,
    essay_corrections: undefined
  }));

  return { data: essaysWithGrades };
}

export async function getEssayDetails(essayId: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('essays').select(`*, profiles (full_name)`).eq('id', essayId).maybeSingle();
    if (error) return { error: error.message };
    return { data: data as (Essay & { profiles: { full_name: string | null } | null }) };
}

// =============================================================================
// 3. FUNÇÕES DE CORREÇÃO, FEEDBACK E IA
// =============================================================================

/**
 * Função REAL de IA: Chama a API Route local que processa o texto.
 */
export async function generateAIAnalysis(text: string) {
    try {
        // URL base absoluta necessária para fetch no servidor
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'; 
        
        const response = await fetch(`${baseUrl}/api/generate-feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
            cache: 'no-store' // Garante que não cacheia resultados antigos
        });

        if (!response.ok) {
            throw new Error(`Erro na API de IA: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return { data };
    } catch (error: any) {
        console.error("Erro ao gerar análise de IA:", error);
        return { error: error.message || "Falha ao comunicar com a IA." };
    }
}

export async function getCorrectionForEssay(essayId: string) {
    const supabase = await createSupabaseServerClient();
    
    // Busca correção humana e dados do corretor
    const { data: correctionBase } = await supabase
        .from('essay_corrections')
        .select(`*, profiles ( full_name, verification_badge )`)
        .eq('essay_id', essayId)
        .maybeSingle();
    
    // Busca feedback da IA (separado para garantir que venha mesmo se não houver correção humana)
    const { data: aiFeedback } = await supabase
        .from('ai_feedback')
        .select('*')
        .eq('essay_id', essayId)
        .maybeSingle();

    const finalData: EssayCorrection = {
        ...correctionBase,
        ai_feedback: aiFeedback || null
    } as EssayCorrection;

    return { data: finalData };
}

/**
 * Salva o feedback gerado pela IA no banco.
 */
export async function saveAIFeedback(essayId: string, aiFeedbackData: any) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { error: 'Não autorizado' };

    const { data, error } = await supabase
        .from('ai_feedback')
        .upsert({
            essay_id: essayId,
            detailed_feedback: aiFeedbackData.detailed_feedback,
            rewrite_suggestions: aiFeedbackData.rewrite_suggestions,
            actionable_items: aiFeedbackData.actionable_items,
            // updated_at: new Date().toISOString() // Descomente se sua tabela tiver updated_at
        }, { onConflict: 'essay_id' })
        .select()
        .single();

    if (error) {
        console.error("Erro ao salvar IA:", error);
        return { error: error.message };
    }
    
    revalidatePath(`/dashboard/applications/write`);
    return { data };
}

/**
 * Submete a correção do professor (com suporte a Link e Selo).
 */
export async function submitCorrection(correctionData: Omit<EssayCorrection, 'id' | 'corrector_id' | 'created_at' | 'profiles'>) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado.' };

    const { ai_feedback, ...humanData } = correctionData;

    // Insere a correção com os novos campos (badge, additional_link)
    const { data: correction, error } = await supabase
        .from('essay_corrections')
        .insert({ 
            ...humanData, 
            corrector_id: user.id,
            // Garante que campos opcionais undefined virem null para o banco
            badge: humanData.badge || null,
            additional_link: humanData.additional_link || null
        })
        .select()
        .single();

    if (error) return { error: error.message };

    // Se houver feedback de IA (gerado na interface ou recuperado), salva-o também
    if (ai_feedback) {
        await saveAIFeedback(correctionData.essay_id, ai_feedback);
    }

    // Atualiza o status da redação
    await supabase.from('essays').update({ status: 'corrected' }).eq('id', correctionData.essay_id);

    revalidatePath('/dashboard/applications/write');
    return { data: correction };
}

// =============================================================================
// 4. ESTATÍSTICAS E PLANOS DE AÇÃO
// =============================================================================

export async function getStudentStatistics() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null };

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
        avg_c1: sums.c1 / total, avg_c2: sums.c2 / total, avg_c3: sums.c3 / total, avg_c4: sums.c4 / total, avg_c5: sums.c5 / total
    };

    const comps = [{ name: 'C1', average: averages.avg_c1 }, { name: 'C2', average: averages.avg_c2 }, { name: 'C3', average: averages.avg_c3 }, { name: 'C4', average: averages.avg_c4 }, { name: 'C5', average: averages.avg_c5 }];
    const pointToImprove = comps.sort((a, b) => a.average - b.average)[0];
    
    const progression = corrections.sort((a, b) => new Date(a.submitted_at!).getTime() - new Date(b.submitted_at!).getTime()).map(c => ({ date: new Date(c.submitted_at!).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), grade: c.final_grade }));

    return { data: { totalCorrections: total, averages, pointToImprove, progression } };
}

export async function getUserActionPlans() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    const { data: essays } = await supabase.from('essays').select('id, title').eq('student_id', user.id).limit(5);
    if (!essays || essays.length === 0) return { data: [] };

    const { data: feedbacks } = await supabase.from('ai_feedback').select('actionable_items, essay_id').in('essay_id', essays.map(e => e.id)).limit(10);
    if (!feedbacks) return { data: [] };

    const plans: ActionPlan[] = [];
    const seenItems = new Set();

    feedbacks.forEach(fb => {
        const essayTitle = essays.find(e => e.id === fb.essay_id)?.title || 'Redação';
        const items = fb.actionable_items;
        
        if (Array.isArray(items)) {
            items.forEach((item: any) => {
                const itemText = typeof item === 'string' ? item : item.text;
                const isCompleted = typeof item === 'string' ? false : item.is_completed;
                
                if (!seenItems.has(itemText)) {
                    seenItems.add(itemText);
                    plans.push({ 
                        id: crypto.randomUUID(), 
                        text: itemText, 
                        is_completed: isCompleted, 
                        source_essay: essayTitle 
                    });
                }
            });
        }
    });
    return { data: plans.slice(0, 5) };
}

export async function getSavedFeedbacks() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    const { data } = await supabase
        .from('essays')
        .select(`
            id, title, submitted_at, status,
            ai_feedback ( id, created_at, detailed_feedback, actionable_items ),
            essay_corrections ( id, final_grade, created_at )
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

    const filtered = data?.filter(e => 
        (e.ai_feedback && (Array.isArray(e.ai_feedback) ? e.ai_feedback.length > 0 : true)) || 
        (e.essay_corrections && (Array.isArray(e.essay_corrections) ? e.essay_corrections.length > 0 : true))
    ) || [];

    return { data: filtered };
}

// --- FILAS DE CORREÇÃO (PROFESSOR/ADMIN) ---

export async function getPendingEssaysForTeacher(teacherId: string, organizationId: string | null) {
    const supabase = await createSupabaseServerClient();

    let query = supabase
        .from('essays')
        .select('id, title, submitted_at, profiles(full_name)')
        .eq('status', 'submitted');

    // Se for professor institucional, filtra por organização.
    // Se for global (organizationId null), vê todas (ou apenas as sem org, dependendo da regra).
    // A regra atual permite globais verem tudo.
    if (organizationId) {
        query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query.order('submitted_at', { ascending: true });

    if (error) return { data: [] };
    return { data };
}

export async function getCorrectedEssaysForTeacher(teacherId: string, organizationId: string | null) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from('essays')
    .select(`
        id,
        title,
        submitted_at,
        profiles ( full_name ),
        essay_corrections!inner ( final_grade, corrector_id )
    `)
    .eq('status', 'corrected');
    
  // Filtra para ver apenas as correções feitas por ESTE professor (para histórico pessoal)
  query = query.eq('essay_corrections.corrector_id', teacherId);

  const { data, error } = await query.order('submitted_at', { ascending: false });

  if (error) return { data: [] };
  return { data };
}

// --- UTILITÁRIOS ---

export async function toggleActionPlanItem(itemId: string, itemText: string, newStatus: boolean) {
    // Em produção, atualizaria o JSONB no banco
    return { success: true };
}

export async function checkForPlagiarism(_text: string) {
    // Simulação de plágio
    await new Promise(resolve => setTimeout(resolve, 1500));
    const hasPlagiarism = Math.random() > 0.8;
    if (hasPlagiarism) {
        return { 
            data: { 
                similarity_percentage: Math.random() * 20 + 5, 
                matches: [{ source: "Internet (Fonte Simulada)", text: "Este trecho parece ter sido retirado de..." }] 
            } 
        };
    }
    return { data: { similarity_percentage: Math.random() * 2, matches: [] } };
}

// Placeholders para evitar erros de importação em outros arquivos
export async function saveStudyPlan(plan: any) { return { success: true }; }
export async function getLatestEssayForDashboard() { return { data: null }; }
export async function getAIFeedbackForEssay(essayId: string) { return { data: null }; }
export async function calculateWritingStreak() { return { data: 0 }; }
export async function getUserStateRank() { return { data: null }; }
export async function getFrequentErrors() { return { data: [] }; }
export async function getCurrentEvents() { return { data: [] }; }
export async function createNotification() { return { error: null }; }