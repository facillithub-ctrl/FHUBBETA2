"use server";

import { revalidatePath } from 'next/cache';
import createSupabaseServerClient from '@/utils/supabase/server';
import { client } from '@/lib/sanity';

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
    badge?: string | null;
    additional_link?: string | null;
    recommended_test_id?: string | null; // Campo novo para o GPS
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

export type CurrentEvent = { 
  id: string; 
  title: string; 
  summary: string | null; 
  link: string; 
  type?: 'blog' | 'news';
  publishedAt?: string;
};

export type FrequentError = {
    error_type: string;
    count: number;
};

// =============================================================================
// 2. FUNÇÕES CRUD DE REDAÇÃO E CORREÇÃO
// =============================================================================

export async function getEssayDetails(essayId: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('essays').select(`*, profiles (full_name)`).eq('id', essayId).maybeSingle();
    if (error) return { error: error.message };
    return { data: data as (Essay & { profiles: { full_name: string | null } | null }) };
}

export async function getCorrectionForEssay(essayId: string) {
    const supabase = await createSupabaseServerClient();
    
    // Busca correção humana
    const { data: correctionBase } = await supabase
        .from('essay_corrections')
        .select(`*, profiles ( full_name, verification_badge )`)
        .eq('essay_id', essayId)
        .maybeSingle();
    
    // Busca feedback da IA
    const { data: aiFeedback } = await supabase
        .from('ai_feedback')
        .select('*')
        .eq('essay_id', essayId)
        .maybeSingle();

    // Combina os dados (IA pode existir sem correção humana)
    const finalData: EssayCorrection = {
        ...(correctionBase || {}),
        ai_feedback: aiFeedback || null
    } as EssayCorrection;

    if (!correctionBase && !aiFeedback) return { data: null };

    return { data: finalData };
}

export async function saveOrUpdateEssay(essayData: Partial<Essay>) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Usuário não autenticado.' };

  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();

  if (essayData.status === 'submitted') {
    if (!essayData.consent_to_ai_training) {
      return { error: 'É obrigatório consentir com os termos para enviar a redação.' };
    }
    // Verifica duplicação de envio para o mesmo tema
    if (essayData.prompt_id && !essayData.id) {
      const { data: existingEssay } = await supabase
        .from('essays')
        .select('id')
        .eq('student_id', user.id)
        .eq('prompt_id', essayData.prompt_id)
        .in('status', ['submitted', 'corrected'])
        .limit(3)
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

  // Versionamento simples para rascunhos
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

// =============================================================================
// 3. INTEGRAÇÃO IA E FEEDBACK
// =============================================================================

export async function generateAndSaveAIAnalysis(essayId: string, essayContent: string, essayTitle: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Sessão expirada. Faça login novamente.' };

    try {
        let aiBaseUrl = process.env.AI_BASE_URL || "https://api.groq.com/openai/v1";
        if (aiBaseUrl.endsWith('/')) aiBaseUrl = aiBaseUrl.slice(0, -1);
        
        const aiEndpoint = aiBaseUrl.endsWith('/chat/completions') ? aiBaseUrl : `${aiBaseUrl}/chat/completions`;
        const apiKey = process.env.AI_API_KEY;
        const aiModel = process.env.AI_MODEL || "llama-3.3-70b-versatile";

        if (!apiKey) return { error: "Serviço de IA indisponível." };

        const plainText = essayContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        if (plainText.length < 50) return { error: "Texto muito curto para análise." };

        const systemPrompt = `
          Atue como o "Facillit Corrector", um avaliador oficial do ENEM.
          SAÍDA OBRIGATÓRIA: JSON VÁLIDO.
          ESTRUTURA:
          {
            "detailed_feedback": [ { "competency": "Competência 1...", "feedback": "..." } ],
            "rewrite_suggestions": [ { "original": "...", "suggestion": "..." } ],
            "actionable_items": [ "Ação 1", "Ação 2" ]
          }
        `;

        const response = await fetch(aiEndpoint, {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: aiModel,
                messages: [ { role: "system", content: systemPrompt }, { role: "user", content: `TÍTULO: ${essayTitle}\n\nREDAÇÃO:\n${plainText}` } ],
                temperature: 0.3,
                max_tokens: 3000,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) throw new Error(`Falha na comunicação com a IA.`);

        const completion = await response.json();
        const content = completion.choices[0].message.content;
        let aiData;
        try {
            aiData = JSON.parse(content.replace(/```json/g, '').replace(/```/g, '').trim());
        } catch (e) { throw new Error("Erro no parse da IA."); }

        if (!aiData.detailed_feedback) throw new Error("Resposta incompleta.");

        const { data: savedData, error: saveError } = await supabase
            .from('ai_feedback')
            .upsert({
                essay_id: essayId,
                detailed_feedback: aiData.detailed_feedback,
                rewrite_suggestions: aiData.rewrite_suggestions,
                actionable_items: aiData.actionable_items,
            }, { onConflict: 'essay_id' })
            .select()
            .single();

        if (saveError) throw new Error("Erro ao salvar análise.");
        
        revalidatePath(`/dashboard/applications/write`);
        return { success: true, data: savedData };

    } catch (error: any) {
        return { error: error.message || "Não foi possível gerar a análise." };
    }
}

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
        }, { onConflict: 'essay_id' })
        .select()
        .single();

    if (error) return { error: error.message };
    revalidatePath(`/dashboard/applications/write`);
    return { data };
}

export async function submitCorrection(correctionData: Omit<EssayCorrection, 'id' | 'corrector_id' | 'created_at' | 'profiles'>) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado.' };

    const { ai_feedback, ...humanData } = correctionData;

    const { data: correction, error } = await supabase
        .from('essay_corrections')
        .insert({ 
            ...humanData, 
            corrector_id: user.id,
            badge: humanData.badge || null,
            additional_link: humanData.additional_link || null,
            recommended_test_id: humanData.recommended_test_id || null // Salva no banco para o GPS
        })
        .select()
        .single();

    if (error) return { error: error.message };

    if (ai_feedback) {
        await saveAIFeedback(correctionData.essay_id, ai_feedback);
    }

    await supabase.from('essays').update({ status: 'corrected' }).eq('id', correctionData.essay_id);

    revalidatePath('/dashboard/applications/write');
    return { data: correction };
}

// =============================================================================
// 4. ESTATÍSTICAS E DADOS DO ALUNO
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
                if (!seenItems.has(itemText)) {
                    seenItems.add(itemText);
                    plans.push({ 
                        id: crypto.randomUUID(), 
                        text: itemText, 
                        is_completed: false, 
                        source_essay: essayTitle 
                    });
                }
            });
        }
    });
    return { data: plans.slice(0, 5) };
}

// Cálculo de dias seguidos (Streak)
export async function calculateWritingStreak() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: 0 };

    // Busca apenas as datas de submissão
    const { data } = await supabase.from('essays')
        .select('submitted_at')
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false });

    if (!data || data.length === 0) return { data: 0 };

    let streak = 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Normaliza datas únicas (sem repetição no mesmo dia)
    const dates = Array.from(new Set(data.map(d => new Date(d.submitted_at).toDateString()))).map(d => new Date(d));

    // Verifica se escreveu hoje ou ontem para começar a contar
    const lastDate = dates[0];
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) return { data: 0 }; // Quebrou o streak

    streak = 1;
    for (let i = 0; i < dates.length - 1; i++) {
        const current = dates[i];
        const next = dates[i+1];
        const diff = Math.abs(current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24);
        
        if (Math.round(diff) === 1) {
            streak++;
        } else {
            break;
        }
    }

    return { data: streak };
}

// Mock de Ranking (Exemplo para UI)
export async function getUserStateRank() {
    // Em produção, isso seria uma query complexa de agregação
    return { data: { rank: 15, state: 'Nacional' } };
}

// Mock de Erros Frequentes
export async function getFrequentErrors() {
    // Em produção, viria de uma tabela de análise agregada
    const errors: FrequentError[] = [
        { error_type: 'Vírgula', count: 12 },
        { error_type: 'Crase', count: 8 },
        { error_type: 'Concordância', count: 5 },
        { error_type: 'Regência', count: 3 }
    ];
    return { data: errors };
}

// =============================================================================
// 5. FERRAMENTAS DO PROFESSOR
// =============================================================================

export async function getPrompts() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('essay_prompts').select('*').order('created_at', { ascending: false });
    if (error) return { error: error.message };
    return { data: data || [] };
}

export async function getPendingEssaysForTeacher(teacherId: string, organizationId: string | null) {
    const supabase = await createSupabaseServerClient();
    let query = supabase.from('essays').select('id, title, submitted_at, profiles(full_name)').eq('status', 'submitted');
    if (organizationId) query = query.eq('organization_id', organizationId);
    const { data, error } = await query.order('submitted_at', { ascending: true });
    if (error) return { data: [] };
    return { data };
}

export async function getCorrectedEssaysForTeacher(teacherId: string, organizationId: string | null) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from('essays')
    .select(`id, title, submitted_at, profiles ( full_name ), essay_corrections!inner ( final_grade, corrector_id )`)
    .eq('status', 'corrected')
    .eq('essay_corrections.corrector_id', teacherId);
  const { data, error } = await query.order('submitted_at', { ascending: false });
  if (error) return { data: [] };
  return { data };
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

// =============================================================================
// 6. FUNÇÃO DE NOTÍCIAS (SANITY)
// =============================================================================

export async function getCurrentEvents() {
    console.log("[WriteAction] Iniciando busca de notícias...");
    
    try {
        // Busca filtrada por categorias relevantes
        const filteredQuery = `*[_type == "post" && (
            count((categories[]->title)[@ in ["Write", "Redação", "Educação", "Dicas de Estudo", "write", "redacao"]]) > 0
        )] | order(publishedAt desc)[0...5] {
            _id,
            title,
            excerpt,
            slug,
            publishedAt,
            "categories": categories[]->title
        }`;

        let posts = await client.fetch(filteredQuery);

        // Fallback se não encontrar nada específico
        if (!posts || posts.length === 0) {
            console.log("[WriteAction] Filtro específico vazio. Buscando geral...");
            const fallbackQuery = `*[_type == "post"] | order(publishedAt desc)[0...5] {
                _id,
                title,
                excerpt,
                slug,
                publishedAt
            }`;
            posts = await client.fetch(fallbackQuery);
        }

        if (!posts || posts.length === 0) {
            return { data: [] };
        }

        const events: CurrentEvent[] = posts.map((post: any) => ({
            id: post._id,
            title: post.title,
            summary: post.excerpt || "Clique para ler o artigo completo.",
            link: `/recursos/blog/${post.slug?.current || '#'}`,
            type: 'blog',
            publishedAt: post.publishedAt
        }));

        return { data: events };

    } catch (error) {
        console.error("[WriteAction] ERRO SANITY:", error);
        return { data: [] };
    }
}

// =============================================================================
// 7. STUBS PARA COMPATIBILIDADE (PLACEHOLDERS)
// =============================================================================

export async function toggleActionPlanItem(itemId: string, itemText: string, newStatus: boolean) { return { success: true }; }
export async function checkForPlagiarism(_text: string) { return { data: { similarity_percentage: 0, matches: [] } }; }
export async function saveStudyPlan(plan: any) { return { success: true }; }
export async function getLatestEssayForDashboard() { return { data: null }; }
export async function getAIFeedbackForEssay(essayId: string) { return { data: null }; }
export async function createNotification() { return { error: null }; }
// Legado
export async function generateAIAnalysis(text: string) { return { error: "Use generateAndSaveAIAnalysis" }; }