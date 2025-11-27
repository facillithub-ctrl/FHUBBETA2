"use server";

import { revalidatePath } from 'next/cache';
import createSupabaseServerClient from '@/utils/supabase/server';
import { client } from '@/lib/sanity'; // Importação necessária para o Blog

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

// Tipo novo para as Notícias/Blog
export type CurrentEvent = { 
  id: string; 
  title: string; 
  summary: string | null; 
  link: string; 
  type?: 'blog' | 'news';
  publishedAt?: string;
};

// =============================================================================
// 2. FUNÇÕES CRUD (LEITURA E ESCRITA BÁSICA)
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

    // Combina os dados
    const finalData: EssayCorrection = {
        ...(correctionBase || {}),
        ai_feedback: aiFeedback || null
    } as EssayCorrection;

    // Se não houver dados de nenhum dos dois, retorna null
    if (!correctionBase && !aiFeedback) return { data: null };

    return { data: finalData };
}

// =============================================================================
// 3. INTEGRAÇÃO IA REAL (LÓGICA MOVIDA PARA O SERVER ACTION)
// =============================================================================

/**
 * GERA e SALVA a análise de IA.
 * Executa diretamente no servidor (Node.js) chamando a API externa (Groq/OpenAI).
 */
export async function generateAndSaveAIAnalysis(essayId: string, essayContent: string, essayTitle: string) {
    const supabase = await createSupabaseServerClient();
    
    // 1. Verificar Sessão
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Sessão expirada. Faça login novamente.' };

    try {
        console.log(`[Action] Iniciando análise IA para Redação ${essayId}...`);

        // 2. Configurações da API Externa (Groq / OpenAI)
        let aiBaseUrl = process.env.AI_BASE_URL || "https://api.groq.com/openai/v1";
        if (aiBaseUrl.endsWith('/')) aiBaseUrl = aiBaseUrl.slice(0, -1);
        
        const aiEndpoint = aiBaseUrl.endsWith('/chat/completions') 
            ? aiBaseUrl 
            : `${aiBaseUrl}/chat/completions`;

        const apiKey = process.env.AI_API_KEY;
        const aiModel = process.env.AI_MODEL || "llama-3.3-70b-versatile";

        if (!apiKey) {
            console.error("[Action] ERRO: AI_API_KEY não configurada no .env");
            return { error: "Serviço de IA indisponível (Chave de API ausente)." };
        }

        // 3. Limpeza do Texto
        const plainText = essayContent
            .replace(/<[^>]*>/g, ' ') 
            .replace(/\s+/g, ' ')     
            .trim();

        if (plainText.length < 50) {
            return { error: "Texto muito curto para análise." };
        }

        // 4. Prompt do Sistema
        const systemPrompt = `
          Atue como o "Facillit Corrector", um avaliador oficial do ENEM com vasta experiência.
          Analise a redação fornecida pelo usuário com rigor, baseando-se nas 5 competências oficiais do ENEM.
          
          SAÍDA OBRIGATÓRIA:
          Você deve retornar APENAS um objeto JSON válido. Não inclua blocos de código markdown.
          
          ESTRUTURA DO JSON:
          {
            "detailed_feedback": [
              { "competency": "Competência 1: Norma Culta", "feedback": "Análise detalhada..." },
              { "competency": "Competência 2: Tema e Estrutura", "feedback": "Análise detalhada..." },
              { "competency": "Competência 3: Argumentação", "feedback": "Análise detalhada..." },
              { "competency": "Competência 4: Coesão", "feedback": "Análise detalhada..." },
              { "competency": "Competência 5: Proposta de Intervenção", "feedback": "Análise detalhada..." }
            ],
            "rewrite_suggestions": [
              { "original": "Trecho...", "suggestion": "Sugestão..." }
            ],
            "actionable_items": [
              "Ação prática 1", "Ação prática 2"
            ]
          }
        `;

        // 5. Chamada Externa
        const response = await fetch(aiEndpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: aiModel,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `TÍTULO: ${essayTitle || 'Sem título'}\n\nREDAÇÃO:\n${plainText}` }
                ],
                temperature: 0.3,
                max_tokens: 3000,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            throw new Error(`Falha na comunicação com a IA (${response.status}).`);
        }

        const completion = await response.json();
        const content = completion.choices[0].message.content;

        // 6. Parse Seguro do JSON
        let aiData;
        try {
            const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
            aiData = JSON.parse(cleanJson);
        } catch (parseError) {
            throw new Error("A IA gerou uma resposta mal formatada. Tente novamente.");
        }

        if (!aiData.detailed_feedback || !aiData.actionable_items) {
            throw new Error("Resposta da IA incompleta.");
        }

        // 7. Salvar no Banco de Dados
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

        if (saveError) {
            throw new Error("Erro ao salvar a análise no banco de dados.");
        }
        
        revalidatePath(`/dashboard/applications/write`);
        return { success: true, data: savedData };

    } catch (error: any) {
        console.error("[Action] Erro Crítico:", error);
        return { error: error.message || "Não foi possível gerar a análise." };
    }
}

// =============================================================================
// 4. OUTRAS FUNÇÕES DO SISTEMA
// =============================================================================

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
            additional_link: humanData.additional_link || null
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

// =============================================================================
// 5. FUNÇÃO ROBUSTA DE NOTÍCIAS (SANITY + FALLBACK)
// =============================================================================

export async function getCurrentEvents() {
    console.log("[WriteAction] Iniciando busca de notícias...");
    
    try {
        // TENTATIVA 1: Busca Filtrada (Categorias específicas)
        // Busca por slug da categoria ou título (case-insensitive via lista)
        // Isso garante que se a categoria for "Write", "Redacao", "Educação", ele ache.
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

        // TENTATIVA 2: Fallback (Se não achar nada filtrado, pega QUALQUER post recente)
        // Isso evita que o componente fique vazio se as categorias não estiverem configuradas exatamente igual
        if (!posts || posts.length === 0) {
            console.log("[WriteAction] Filtro específico retornou vazio. Buscando posts gerais...");
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
            console.warn("[WriteAction] Nenhum post encontrado no Sanity (nem filtrado, nem geral). Verifique o Project ID.");
            return { data: [] };
        }

        console.log(`[WriteAction] Sucesso! ${posts.length} posts encontrados.`);

        const events: CurrentEvent[] = posts.map((post: any) => ({
            id: post._id,
            title: post.title,
            summary: post.excerpt || "Clique para ler o artigo completo.",
            // Garante que o link aponte para a rota correta do blog
            link: `/recursos/blog/${post.slug?.current || '#'}`,
            type: 'blog',
            publishedAt: post.publishedAt
        }));

        return { data: events };

    } catch (error) {
        console.error("[WriteAction] ERRO DE CONEXÃO COM SANITY:", error);
        // Em caso de erro grave (ex: Project ID errado), retorna vazio para não quebrar a tela
        return { data: [] };
    }
}

// Stubs para funções que não estão implementadas ou são placeholders
export async function toggleActionPlanItem(itemId: string, itemText: string, newStatus: boolean) { return { success: true }; }
export async function checkForPlagiarism(_text: string) { return { data: { similarity_percentage: 0, matches: [] } }; }
export async function saveStudyPlan(plan: any) { return { success: true }; }
export async function getLatestEssayForDashboard() { return { data: null }; }
export async function getAIFeedbackForEssay(essayId: string) { return { data: null }; }
export async function calculateWritingStreak() { return { data: 0 }; }
export async function getUserStateRank() { return { data: null }; }
export async function getFrequentErrors() { return { data: [] }; }
export async function createNotification() { return { error: null }; }
// Função legada:
export async function generateAIAnalysis(text: string) { return { error: "Use generateAndSaveAIAnalysis" }; }