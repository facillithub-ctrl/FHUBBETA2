"use server";

import { revalidatePath } from 'next/cache';
import createSupabaseServerClient from '@/utils/supabase/server'; // Ajuste o caminho se necessário

// --- TIPOS DE DADOS ---

export type Essay = {
  id: string;
  title: string | null; // Título pode ser nulo
  content: string | null; // Conteúdo pode ser nulo se for imagem
  status: 'draft' | 'submitted' | 'corrected';
  submitted_at: string | null;
  prompt_id: string | null;
  student_id: string;
  consent_to_ai_training?: boolean;
  image_submission_url?: string | null;
  organization_id?: string | null;
  // Adicionado para o dashboard, pode vir da junção com essay_corrections
  final_grade?: number | null;
  // Adicionado para o dashboard, pode vir da junção com prompts
  prompts?: { title: string | null } | null;
};

export type Annotation = {
    id: string;
    type: 'text' | 'image';
    comment: string;
    marker: 'erro' | 'acerto' | 'sugestao';
    selection?: string; // Presente apenas se type='text'
    position?: { x: number; y: number; width?: number; height?: number }; // Presente apenas se type='image'
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
    ai_feedback?: AIFeedback | AIFeedback[] | null; // Pode ser objeto, array ou nulo vindo do DB
    created_at?: string; // Geralmente adicionado pelo DB
};

export type EssayPrompt = {
    id: string;
    title: string;
    description: string | null;
    source: string | null;
    image_url: string | null; // Capa do tema
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
    created_at?: string; // Geralmente adicionado pelo DB
};

export type AIFeedback = {
  id?: string; // Pode ter um ID se for uma tabela separada
  essay_id?: string;
  correction_id?: string;
  detailed_feedback: { competency: string; feedback: string }[];
  rewrite_suggestions: { original: string; suggestion: string }[];
  actionable_items: string[];
  created_at?: string; // Geralmente adicionado pelo DB
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
      if (existingError && existingError.code !== 'PGRST116') { // Ignora erro "nenhuma linha encontrada"
        console.error("Erro ao verificar redações existentes:", existingError);
        return { error: 'Erro ao verificar redações existentes.' };
      }
    }
  }

  // Prepara dados para upsert, garantindo student_id e organization_id
  const dataToUpsert: Partial<Essay> & { student_id: string } = {
      ...essayData,
      student_id: user.id, // Garante que student_id está presente
      organization_id: profile?.organization_id, // Adiciona organization_id do perfil
      submitted_at: essayData.status === 'submitted' ? new Date().toISOString() : essayData.submitted_at,
  };
  // Remove id se for undefined para permitir inserção
  if (!dataToUpsert.id) {
      delete dataToUpsert.id;
  }


  const { data: upsertedEssay, error: upsertError } = await supabase
    .from('essays')
    .upsert(dataToUpsert) // Usa o objeto preparado
    .select()
    .single();

  if (upsertError) {
      console.error("Erro no upsert da redação:", upsertError);
      return { error: `Erro ao salvar: ${upsertError.message}` };
  }

  // Salvar versão apenas se for rascunho e tiver conteúdo
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
      // Não retorna erro aqui para não impedir o salvamento principal
    }
  }

  revalidatePath('/dashboard/applications/write');
  revalidatePath('/dashboard'); // Revalida dashboard se a última redação mudar
  return { data: upsertedEssay };
}

export async function getPrompts(): Promise<{ data?: EssayPrompt[]; error?: string }> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('essay_prompts')
        .select('*')
        .order('created_at', { ascending: false }); // Ordena pelos mais recentes

    if (error) {
        console.error("Erro ao buscar temas:", error);
        return { error: error.message };
    }
    return { data: data || [] };
}

// Busca detalhes de UMA redação específica (inclui nome do aluno se necessário)
export async function getEssayDetails(essayId: string): Promise<{ data?: Essay & { profiles: { full_name: string | null } | null }; error?: string }> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('essays')
        .select(`
            *,
            profiles (full_name)
        `)
        .eq('id', essayId)
        .maybeSingle(); // Use maybeSingle para retornar null se não encontrar, em vez de erro

    if (error) {
        console.error(`Erro ao buscar detalhes da redação ${essayId}:`, error);
        return { error: `Erro ao buscar detalhes da redação: ${error.message}` };
    }
    // Ajusta o tipo de retorno para corresponder ao esperado
    return { data: data as (Essay & { profiles: { full_name: string | null } | null }) | undefined };
}


// Busca TODAS as redações de um aluno
export async function getEssaysForStudent() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Usuário não autenticado.' };

  const { data, error } = await supabase
    .from('essays')
    .select('id, title, status, submitted_at, content, image_submission_url, prompt_id') // Campos essenciais para a lista
    .eq('student_id', user.id)
    .order('submitted_at', { ascending: false, nullsFirst: true });

  if (error) {
      console.error("Erro ao buscar redações do aluno:", error);
      return { error: error.message };
  }
  return { data };
}

// Busca a ÚLTIMA redação (corrigida ou não) para o dashboard
export async function getLatestEssayForDashboard() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Usuário não autenticado.' };

  // Busca a redação mais recente, trazendo a nota se existir e o título do prompt
  // CORREÇÃO: Usamos 'essay_prompts' que é o nome provável da tabela/relação
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
    .order('created_at', { ascending: false }) // Ordena pela criação para pegar a mais recente
    .limit(1)
    .maybeSingle(); // Usa maybeSingle para retornar null se não houver nenhuma

    if (error) {
        console.error("Erro ao buscar última redação para dashboard:", error);
        return { data: null, error: error.message };
    }

    // Função auxiliar para pegar o título com segurança
    // O Supabase pode retornar um array ou objeto dependendo da inferência de tipos
    const getPromptTitle = (promptsData: any) => {
        if (!promptsData) return null;
        if (Array.isArray(promptsData)) {
            return promptsData[0]?.title || null;
        }
        return promptsData.title || null;
    };

    // Adapta o resultado para ter final_grade no nível superior e prompts.title
    const adaptedData = data ? {
        ...data,
        final_grade: data.essay_corrections?.[0]?.final_grade ?? null,
        // CORREÇÃO: Usa a função auxiliar e mapeia 'essay_prompts' para 'prompts'
        prompts: data.essay_prompts ? { title: getPromptTitle(data.essay_prompts) } : null,
        essay_corrections: undefined, // Remove a estrutura aninhada original
        essay_prompts: undefined, // Remove a estrutura bruta
    } : null;

    return { data: adaptedData };
}


// --- FUNÇÕES DE CORREÇÃO ---

// Define o tipo esperado pela query DE CORREÇÃO, sem ai_feedback aninhado
type CorrectionQueryBaseResult = Omit<EssayCorrection, 'ai_feedback'> & {
    profiles: { full_name: string | null, verification_badge: string | null } | null;
    essay_correction_errors: { common_errors: { error_type: string } | null }[];
    // ai_feedback NÃO é selecionado diretamente aqui
};

// Define o tipo de retorno final da função, combinando correção e ai_feedback
type FinalCorrectionData = CorrectionQueryBaseResult & {
    ai_feedback: AIFeedback | null;
}

// ✅ FUNÇÃO CORRIGIDA PARA BUSCAR AI_FEEDBACK SEPARADAMENTE E GARANTIR created_at
export async function getCorrectionForEssay(essayId: string): Promise<{ data?: FinalCorrectionData; error?: string }> {
    const supabase = await createSupabaseServerClient();

    console.log(`[actions.ts getCorrectionForEssay] Buscando correção base para essayId: ${essayId}`);

    // Query 1: Busca a correção e relações diretas (profiles, errors)
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
            created_at,  /* <<< GARANTA QUE ESTA LINHA ESTÁ CORRETA (created_at) */
            profiles ( full_name, verification_badge ),
            essay_correction_errors (
                common_errors ( error_type )
            )
        `)
        .eq('essay_id', essayId)
        .maybeSingle(); // Permite retornar null se não houver correção

    if (correctionBaseError) {
        // Log detalhado do erro do Supabase
        console.error(`[actions.ts getCorrectionForEssay] Erro do Supabase ao buscar correção base para essayId ${essayId}:`, correctionBaseError);
        // Retorna a mensagem de erro específica do Supabase para o cliente
        return { error: `Erro ao buscar correção base: ${correctionBaseError.message}` };
    }

    console.log(`[actions.ts getCorrectionForEssay] Dados base da correção retornados para essayId ${essayId}:`, correctionBase);

    // Se não encontrou a correção base, retorna sem dados (não é um erro, apenas não existe)
    if (!correctionBase) {
        console.warn(`[actions.ts getCorrectionForEssay] Correção base não encontrada para essayId ${essayId}.`);
        // Retorna undefined para indicar que não encontrou, diferente de um erro
        return { data: undefined, error: undefined };
    }

    // Query 2: Busca o AI Feedback separadamente, usando o essay_id da correção encontrada
    console.log(`[actions.ts getCorrectionForEssay] Buscando ai_feedback para essayId: ${essayId}`);
    const { data: aiFeedbackData, error: aiFeedbackError } = await supabase
        .from('ai_feedback')
        .select('*')
        .eq('essay_id', essayId) // Busca pelo essay_id
        .order('created_at', { ascending: false }) // Pega o mais recente, caso haja múltiplos
        .limit(1)
        .maybeSingle(); // Permite retornar null se não houver ai_feedback

    if (aiFeedbackError) {
        // Loga o erro, mas continua, pois a correção base existe e é mais importante
        console.error(`[actions.ts getCorrectionForEssay] Erro ao buscar ai_feedback para essayId ${essayId}:`, aiFeedbackError);
        // Não retorna erro aqui, permite que a correção base seja exibida mesmo sem o feedback da IA
    }

    console.log(`[actions.ts getCorrectionForEssay] Dados do ai_feedback retornados para essayId ${essayId}:`, aiFeedbackData);

    // Combina os resultados das duas queries
    // CORREÇÃO CRÍTICA: Casting 'as any' para garantir que o TypeScript aceita o spread
    // Sabemos que correctionBase é um objeto pois passamos pelo check if(!correctionBase) acima.
    const finalData: FinalCorrectionData = {
        ...(correctionBase as any), 
        ai_feedback: aiFeedbackData || null // Garante que é null se não for encontrado
    };

    console.log(`[actions.ts getCorrectionForEssay] Dados finais combinados para essayId ${essayId}:`, finalData);

    // Retorna os dados combinados e sem erro (mesmo que ai_feedback tenha falhado)
    return { data: finalData, error: undefined };
}


export async function submitCorrection(correctionData: Omit<EssayCorrection, 'id' | 'corrector_id' | 'created_at'>) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Usuário não autenticado.' };

    // Separa o feedback da IA dos dados da correção humana
    const { ai_feedback, ...humanCorrectionData } = correctionData;

    // Insere a correção humana
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

    // Se houver feedback da IA, insere-o associado à correção e redação
    if (ai_feedback && !Array.isArray(ai_feedback)) { // Garante que é um objeto
        const { error: aiError } = await supabase
            .from('ai_feedback')
            .insert({
                essay_id: correctionData.essay_id,
                correction_id: correction.id, // Associa à correção recém-criada
                detailed_feedback: ai_feedback.detailed_feedback,
                rewrite_suggestions: ai_feedback.rewrite_suggestions,
                actionable_items: ai_feedback.actionable_items
            });

        if (aiError) {
            // Loga o erro, mas não impede o sucesso da operação principal
            console.error("Erro ao salvar feedback da IA:", aiError);
        }
    }

    // Atualiza o status da redação para 'corrected'
    const { data: essayData, error: essayError } = await supabase
        .from('essays')
        .update({ status: 'corrected' })
        .eq('id', correctionData.essay_id)
        .select('student_id, title') // Seleciona dados para notificação
        .single();

    if (essayError) {
        console.error("Erro ao atualizar status da redação:", essayError);
        // Considerar reverter a inserção da correção ou logar inconsistência
        return { error: `Erro ao atualizar status da redação: ${essayError.message}` };
    }

    // Cria notificação para o aluno
    if (essayData && essayData.student_id) {
        await createNotification(
            essayData.student_id,
            'Sua redação foi corrigida!',
            `A redação "${essayData.title || 'sem título'}" já tem um feedback.`,
            `/dashboard/applications/write?essayId=${correctionData.essay_id}` // Link direto para a correção
        );
    }

    revalidatePath('/dashboard/applications/write');
    return { data: correction }; // Retorna a correção salva
}

// --- FUNÇÕES DE ESTATÍSTICAS E RANKING ---
export async function getStudentStatistics() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado.' };

    // Busca redações corrigidas com suas notas
    const { data: correctedEssays, error } = await supabase
        .from('essays')
        .select(`
            submitted_at,
            essay_corrections!inner ( final_grade, grade_c1, grade_c2, grade_c3, grade_c4, grade_c5 )
        `) // !inner garante que só vêm redações com correção
        .eq('student_id', user.id)
        .eq('status', 'corrected');
        // .not('essay_corrections', 'is', null) // Não é mais necessário com !inner

    if (error) {
        console.error("Erro ao buscar estatísticas do aluno:", error);
        return { data: null, error: error?.message };
    }
    if (!correctedEssays || correctedEssays.length === 0) {
        return { data: null }; // Retorna nulo se não houver correções
    }

    // Extrai e valida os dados de correção
    const validCorrections = correctedEssays
        .map(essay => essay.essay_corrections.length > 0 ? { ...essay.essay_corrections[0], submitted_at: essay.submitted_at } : null)
        .filter((correction): correction is NonNullable<typeof correction> => correction !== null && typeof correction.final_grade === 'number');

    if (validCorrections.length === 0) return { data: null };

    const totalCorrections = validCorrections.length;
    const initialStats = { sum_final_grade: 0, sum_c1: 0, sum_c2: 0, sum_c3: 0, sum_c4: 0, sum_c5: 0 };

    // Calcula as somas das notas
    const sums = validCorrections.reduce((acc, current) => {
        acc.sum_final_grade += current.final_grade;
        acc.sum_c1 += current.grade_c1;
        acc.sum_c2 += current.grade_c2;
        acc.sum_c3 += current.grade_c3;
        acc.sum_c4 += current.grade_c4;
        acc.sum_c5 += current.grade_c5;
        return acc;
    }, initialStats);

    // Calcula as médias
    const averages = {
        avg_final_grade: sums.sum_final_grade / totalCorrections,
        avg_c1: sums.sum_c1 / totalCorrections, avg_c2: sums.sum_c2 / totalCorrections,
        avg_c3: sums.sum_c3 / totalCorrections, avg_c4: sums.sum_c4 / totalCorrections,
        avg_c5: sums.sum_c5 / totalCorrections,
    };

    // Encontra o ponto a melhorar (menor média de competência)
    const competencyAverages = [
        { name: 'Competência 1', average: averages.avg_c1 }, { name: 'Competência 2', average: averages.avg_c2 },
        { name: 'Competência 3', average: averages.avg_c3 }, { name: 'Competência 4', average: averages.avg_c4 },
        { name: 'Competência 5', average: averages.avg_c5 },
    ];
    const pointToImprove = competencyAverages.sort((a, b) => a.average - b.average)[0];

    // Prepara dados de progressão para o gráfico
    const progression = validCorrections
        .filter(c => c.submitted_at) // Garante que há data de envio
        .sort((a, b) => new Date(a.submitted_at!).getTime() - new Date(b.submitted_at!).getTime()) // Ordena por data
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

    // Busca as datas de envio de redações não nulas
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

    // Remove duplicados e ordena as datas
    const uniqueDates = [...new Set(data.map(e => new Date(e.submitted_at!).toDateString()))]
        .map(d => new Date(d))
        .sort((a, b) => b.getTime() - a.getTime()); // Mais recente primeiro

    if (uniqueDates.length === 0) return { data: 0 };

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera hora para comparar apenas a data
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Verifica se a data mais recente é hoje ou ontem
    if (uniqueDates[0].getTime() === today.getTime() || uniqueDates[0].getTime() === yesterday.getTime()) {
        streak = 1;
        // Continua a contar para trás
        for (let i = 1; i < uniqueDates.length; i++) {
            const currentDay = new Date(uniqueDates[i-1]);
            const previousDay = new Date(uniqueDates[i]);
            const expectedPreviousDay = new Date(currentDay);
            expectedPreviousDay.setDate(currentDay.getDate() - 1);

            if (previousDay.getTime() === expectedPreviousDay.getTime()) {
                streak++;
            } else {
                break; // Interrompe se houver um dia faltando
            }
        }
    }

    return { data: streak };
}

export async function getUserStateRank() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null };

    // Busca o estado do perfil do usuário
    const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('address_state')
        .eq('id', user.id)
        .single();

    // Se não encontrar perfil ou estado, retorna null
    if (profileError || !userProfile || !userProfile.address_state) {
        console.warn("Perfil ou estado não encontrado para rank:", profileError?.message);
        return { data: { rank: null, state: null } };
    }

    const userState = userProfile.address_state;

    // Chama a função RPC para obter o rank
    const { data, error } = await supabase.rpc('get_user_rank_in_state', {
        p_user_id: user.id,
        p_state: userState
    });

    if (error) {
        console.error('Erro ao chamar RPC get_user_rank_in_state:', error);
        return { data: { rank: null, state: userState } }; // Retorna o estado mesmo com erro no rank
    }

    // Retorna o rank e o estado
    return { data: { rank: data, state: userState } };
}

// --- FUNÇÕES DE NOTIFICAÇÃO E NOVAS FUNÇÕES ---

// Cria uma nova notificação para um usuário específico
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
    // Não retorna erro crítico, apenas loga
    return { error };
}

// Busca os erros mais frequentes cometidos por um aluno
export async function getFrequentErrors() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado.' };

    // Chama a função RPC que calcula os erros frequentes
    const { data, error } = await supabase.rpc('get_frequent_errors_for_student', { p_student_id: user.id });

    if (error) {
        console.error("Erro ao buscar erros frequentes via RPC:", error);
        return { error: error.message };
    }

    return { data };
}

// Busca os eventos/notícias atuais mais recentes
export async function getCurrentEvents() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('current_events')
        .select('id, title, summary, link')
        .order('created_at', { ascending: false })
        .limit(5); // Limita a 5 notícias

    if (error) {
        console.error("Erro ao buscar eventos atuais:", error);
        return { error: error.message };
    }
    return { data };
}


// =============================================================================
// == FUNÇÕES PARA CORRETORES ==================================================
// =============================================================================

// Busca redações pendentes para um corretor (global ou institucional)
export async function getPendingEssaysForTeacher(teacherId: string, organizationId: string | null) {
    const supabase = await createSupabaseServerClient();

    let query = supabase
        .from('essays')
        .select('id, title, submitted_at, profiles(full_name)') // Inclui nome do aluno
        .eq('status', 'submitted');

    // Se for professor institucional, filtra pela organização
    if (organizationId) {
        query = query.eq('organization_id', organizationId);
    } else {
        // Se for professor global, busca apenas redações sem organização
        query = query.is('organization_id', null);
    }

    const { data, error } = await query.order('submitted_at', { ascending: true }); // Mais antigas primeiro

    if (error) {
        console.error("Erro ao buscar redações pendentes:", error);
        return { data: null, error: error.message };
    }
    return { data, error: null };
}

// Busca redações já corrigidas POR ESTE corretor (global ou institucional)
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
    `) // !inner garante que só vêm redações com correção DESTE corretor
    .eq('status', 'corrected')
    .eq('essay_corrections.corrector_id', teacherId); // Filtra pelo ID do corretor

  // Se for professor institucional, filtra pela organização da redação
  if (organizationId) {
      query = query.eq('organization_id', organizationId);
  } else {
      // Se for professor global, busca apenas redações sem organização
      query = query.is('organization_id', null);
  }

  const { data, error } = await query.order('submitted_at', { ascending: false }); // Mais recentes primeiro

  if (error) {
      console.error("Erro ao buscar redações corrigidas pelo professor:", error);
      return { data: null, error: error.message };
  }
  return { data };
}

// Busca o feedback da IA para uma redação específica (usado na view de correção)
export async function getAIFeedbackForEssay(essayId: string) {
    const supabase = await createSupabaseServerClient();
    // Busca na tabela ai_feedback pelo essay_id
    const { data, error } = await supabase
        .from('ai_feedback')
        .select('*')
        .eq('essay_id', essayId)
        .maybeSingle(); // Pode não haver feedback da IA

    if (error) {
        console.error("Erro ao buscar feedback da IA:", error);
        return { data: null, error: error.message };
    }

    return { data };
}

// SIMULAÇÃO da verificação de plágio (substituir pela integração real)
export async function checkForPlagiarism(_text: string): Promise<{ data?: { similarity_percentage: number; matches: { source: string; text: string }[] }; error?: string }> {
    console.log("[actions.ts] Simulando verificação de plágio...");
    try {
        // Simula um tempo de espera da API externa
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

        // Simula aleatoriamente se encontrou plágio ou não
        const hasPlagiarism = Math.random() > 0.6; // 40% de chance de ter plágio na simulação
        if (hasPlagiarism) {
            const similarity = Math.random() * (25 - 5) + 5; // Simula similaridade entre 5% e 25%
            return {
                data: {
                    similarity_percentage: similarity,
                    matches: [ // Simula algumas correspondências encontradas
                        { source: "Fonte Simulada 1 (ex: Wikipedia)", text: "um trecho simulado que se parece com o texto original..." },
                        ...(similarity > 15 ? [{ source: "Fonte Simulada 2 (ex: Blog)", text: "outro trecho similar encontrado em outro lugar..." }] : [])
                    ]
                }
            };
        } else {
            // Simula baixo índice de similaridade
            return {
                data: {
                    similarity_percentage: Math.random() * 4, // Similaridade abaixo de 4%
                    matches: [] // Nenhuma correspondência significativa
                }
            };
        }
    } catch (err) {
        console.error("[actions.ts] Erro na simulação de plágio:", err);
        return { error: "Não foi possível conectar ao serviço simulado de verificação de plágio." };
    }
}