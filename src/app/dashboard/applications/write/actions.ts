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


// --- FUNÇÕES DE ALUNO E GERAIS ---

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
        console.error("Erro ao verificar redações existentes:", existingError);
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
      console.error("Erro no upsert da redação:", upsertError);
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
        console.error("Erro ao buscar temas:", error);
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
    .select('id, title, status, submitted_at, content, image_submission_url, prompt_id') 
    .eq('student_id', user.id)
    .order('submitted_at', { ascending: false, nullsFirst: true });

  if (error) {
      console.error("Erro ao buscar redações do aluno:", error);
      return { error: error.message };
  }
  return { data };
}

// ✅ FUNÇÃO CORRIGIDA: Usa submitted_at em vez de created_at
export async function getLatestEssayForDashboard() {
  const supabase = await createSupabaseServerClient();
  
  try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) return { data: null };

      // CORREÇÃO: Ordenando por 'submitted_at' pois 'created_at' não existe no schema
      const { data, error } = await supabase
        .from('essays')
        .select(`
            id,
            title,
            status,
            essay_corrections ( final_grade ),
            essay_prompts ( title )
        `)
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false, nullsFirst: true }) // Ordena pelo envio mais recente (ou rascunho recente se nullsFirst)
        .limit(1)
        .maybeSingle();

        if (error) {
            // Log apenas, não retorna erro para não quebrar o dashboard
            console.error("Erro silencioso ao buscar última redação:", JSON.stringify(error, null, 2));
            return { data: null };
        }

        if (!data) return { data: null };

        // Mapeamento seguro
        let promptTitle: string | null = null;
        if (data.essay_prompts) {
            if (Array.isArray(data.essay_prompts)) {
                promptTitle = data.essay_prompts[0]?.title || null;
            } else {
                // @ts-ignore
                promptTitle = data.essay_prompts.title || null;
            }
        }

        const adaptedData = {
            ...data,
            final_grade: data.essay_corrections?.[0]?.final_grade ?? null,
            prompts: promptTitle ? { title: promptTitle } : null,
            essay_corrections: undefined,
            essay_prompts: undefined 
        };

        return { data: adaptedData };

  } catch (e) {
      console.error("Exceção em getLatestEssayForDashboard:", e);
      return { data: null };
  }
}

// ✅ FUNÇÕES PARA PLANOS DE AÇÃO (ADICIONADAS)

export async function getUserActionPlans() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [] };

  // Busca segura (caso a tabela não exista, retorna vazio)
  try {
      const { data, error } = await supabase
        .from('study_plans')
        .select('*, essays(title)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) return { data: [] };

      const formatted = data?.map((plan: any) => ({
        id: plan.id,
        essay_id: plan.essay_id,
        essay_title: plan.essays?.title || 'Redação sem título',
        tasks: plan.tasks || [],
        created_at: plan.created_at
      })) || [];

      return { data: formatted };
  } catch (e) {
      return { data: [] };
  }
}

export async function saveStudyPlan(essayId: string, tasks: any[]) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('study_plans')
    .upsert({
        essay_id: essayId,
        user_id: user.id,
        tasks: tasks,
        updated_at: new Date().toISOString()
    }, { onConflict: 'essay_id' });

  if (error) {
      console.error("Erro ao salvar plano de estudo:", error);
      return { error: error.message };
  }
  
  revalidatePath('/dashboard/applications/write');
  return { success: true };
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
        console.error(`Erro ao buscar correção base:`, correctionBaseError);
        return { error: `Erro ao buscar correção base: ${correctionBaseError.message}` };
    }

    if (!correctionBase) {
        return { data: undefined, error: undefined };
    }

    const { data: aiFeedbackData, error: aiFeedbackError } = await supabase
        .from('ai_feedback')
        .select('*')
        .eq('essay_id', essayId) 
        .order('created_at', { ascending: false }) 
        .limit(1)
        .maybeSingle(); 

    if (aiFeedbackError) {
        console.error(`Erro ai_feedback:`, aiFeedbackError);
    }

    const finalData: FinalCorrectionData = {
        ...correctionBase,
        ai_feedback: aiFeedbackData || null 
    };

    return { data: finalData, error: undefined };
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

    if (correctionError) {
        console.error("Erro ao salvar correção humana:", correctionError);
        return { error: `Erro ao salvar correção: ${correctionError.message}` };
    }

    if (ai_feedback && !Array.isArray(ai_feedback)) { 
        const { error: aiError } = await supabase
            .from('ai_feedback')
            .insert({
                essay_id: correctionData.essay_id,
                correction_id: correction.id, 
                detailed_feedback: ai_feedback.detailed_feedback,
                rewrite_suggestions: ai_feedback.rewrite_suggestions,
                actionable_items: ai_feedback.actionable_items
            });

        if (aiError) {
            console.error("Erro ao salvar feedback da IA:", aiError);
        }
    }

    const { data: essayData, error: essayError } = await supabase
        .from('essays')
        .update({ status: 'corrected' })
        .eq('id', correctionData.essay_id)
        .select('student_id, title') 
        .single();

    if (essayError) {
        console.error("Erro ao atualizar status da redação:", essayError);
        return { error: `Erro ao atualizar status da redação: ${essayError.message}` };
    }

    if (essayData && essayData.student_id) {
        await createNotification(
            essayData.student_id,
            'Sua redação foi corrigida!',
            `A redação "${essayData.title || 'sem título'}" já tem um feedback.`,
            `/dashboard/applications/write?essayId=${correctionData.essay_id}` 
        );
    }

    revalidatePath('/dashboard/applications/write');
    return { data: correction }; 
}

// --- FUNÇÕES DE ESTATÍSTICAS E RANKING ---
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

    if (error) {
        console.error("Erro ao buscar estatísticas do aluno:", error);
        return { data: null, error: error?.message };
    }
    if (!correctedEssays || correctedEssays.length === 0) {
        return { data: null }; 
    }

    const validCorrections = correctedEssays
        .map(essay => essay.essay_corrections.length > 0 ? { ...essay.essay_corrections[0], submitted_at: essay.submitted_at } : null)
        .filter((correction): correction is NonNullable<typeof correction> => correction !== null && typeof correction.final_grade === 'number');

    if (validCorrections.length === 0) return { data: null };

    const totalCorrections = validCorrections.length;
    const initialStats = { sum_final_grade: 0, sum_c1: 0, sum_c2: 0, sum_c3: 0, sum_c4: 0, sum_c5: 0 };

    const sums = validCorrections.reduce((acc, current) => {
        acc.sum_final_grade += current.final_grade;
        acc.sum_c1 += current.grade_c1;
        acc.sum_c2 += current.grade_c2;
        acc.sum_c3 += current.grade_c3;
        acc.sum_c4 += current.grade_c4;
        acc.sum_c5 += current.grade_c5;
        return acc;
    }, initialStats);

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

    const { data, error } = await supabase
        .from('essays')
        .select('submitted_at')
        .eq('student_id', user.id)
        .not('submitted_at', 'is', null)
        .order('submitted_at', { ascending: false });

    if (error) {
        console.error("Erro ao calcular streak:", error);
        return { data: 0 };
    }
    if (!data || data.length === 0) return { data: 0 };

    const uniqueDates = [...new Set(data.map(e => new Date(e.submitted_at!).toDateString()))]
        .map(d => new Date(d))
        .sort((a, b) => b.getTime() - a.getTime()); 

    if (uniqueDates.length === 0) return { data: 0 };

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (uniqueDates[0].getTime() === today.getTime() || uniqueDates[0].getTime() === yesterday.getTime()) {
        streak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
            const currentDay = new Date(uniqueDates[i-1]);
            const previousDay = new Date(uniqueDates[i]);
            const expectedPreviousDay = new Date(currentDay);
            expectedPreviousDay.setDate(currentDay.getDate() - 1);

            if (previousDay.getTime() === expectedPreviousDay.getTime()) {
                streak++;
            } else {
                break; 
            }
        }
    }

    return { data: streak };
}

export async function getUserStateRank() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null };

    const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('address_state')
        .eq('id', user.id)
        .single();

    if (profileError || !userProfile || !userProfile.address_state) {
        console.warn("Perfil ou estado não encontrado para rank:", profileError?.message);
        return { data: { rank: null, state: null } };
    }

    const userState = userProfile.address_state;

    const { data, error } = await supabase.rpc('get_user_rank_in_state', {
        p_user_id: user.id,
        p_state: userState
    });

    if (error) {
        console.error('Erro ao chamar RPC get_user_rank_in_state:', error);
        return { data: { rank: null, state: userState } }; 
    }

    return { data: { rank: data, state: userState } };
}

// --- FUNÇÕES DE NOTIFICAÇÃO E NOVAS FUNÇÕES ---

export async function createNotification(userId: string, title: string, message: string, link: string | null) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            title,
            message,
            link,
        });

    if (error) {
        console.error('Erro ao criar notificação:', error);
    }
    return { error };
}

export async function getFrequentErrors() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado.' };

    const { data, error } = await supabase.rpc('get_frequent_errors_for_student', { p_student_id: user.id });

    if (error) {
        console.error("Erro ao buscar erros frequentes via RPC:", error);
        return { error: error.message };
    }

    return { data };
}

export async function getCurrentEvents() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('current_events')
        .select('id, title, summary, link')
        .order('created_at', { ascending: false })
        .limit(5); 

    if (error) {
        console.error("Erro ao buscar eventos atuais:", error);
        return { error: error.message };
    }
    return { data };
}


// =============================================================================
// == FUNÇÕES PARA CORRETORES ==================================================
// =============================================================================

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

    if (error) {
        console.error("Erro ao buscar redações pendentes:", error);
        return { data: null, error: error.message };
    }
    return { data, error: null };
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
    .eq('status', 'corrected')
    .eq('essay_corrections.corrector_id', teacherId); 

  if (organizationId) {
      query = query.eq('organization_id', organizationId);
  } else {
      query = query.is('organization_id', null);
  }

  const { data, error } = await query.order('submitted_at', { ascending: false }); 

  if (error) {
      console.error("Erro ao buscar redações corrigidas pelo professor:", error);
      return { data: null, error: error.message };
  }
  return { data };
}

export async function getAIFeedbackForEssay(essayId: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('ai_feedback')
        .select('*')
        .eq('essay_id', essayId)
        .maybeSingle(); 

    if (error) {
        console.error("Erro ao buscar feedback da IA:", error);
        return { data: null, error: error.message };
    }

    return { data };
}

export async function checkForPlagiarism(_text: string): Promise<{ data?: { similarity_percentage: number; matches: { source: string; text: string }[] }; error?: string }> {
    console.log("[actions.ts] Simulando verificação de plágio...");
    try {
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

        const hasPlagiarism = Math.random() > 0.6; 
        if (hasPlagiarism) {
            const similarity = Math.random() * (25 - 5) + 5; 
            return {
                data: {
                    similarity_percentage: similarity,
                    matches: [ 
                        { source: "Fonte Simulada 1 (ex: Wikipedia)", text: "um trecho simulado que se parece com o texto original..." },
                        ...(similarity > 15 ? [{ source: "Fonte Simulada 2 (ex: Blog)", text: "outro trecho similar encontrado em outro lugar..." }] : [])
                    ]
                }
            };
        } else {
            return {
                data: {
                    similarity_percentage: Math.random() * 4, 
                    matches: [] 
                }
            };
        }
    } catch (err) {
        console.error("[actions.ts] Erro na simulação de plágio:", err);
        return { error: "Não foi possível conectar ao serviço simulado de verificação de plágio." };
    }
}