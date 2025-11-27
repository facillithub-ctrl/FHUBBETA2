"use server";

import createClient from "@/utils/supabase/server";
import { revalidatePath } from 'next/cache';
import { 
  Question, 
  StudentDashboardData, 
  TestWithQuestions, 
  StudentCampaign,
  QuestionContent
} from "./types";

// --- UTILITÁRIOS ---

/**
 * Converte strings vazias, undefined ou "undefined" em NULL.
 * Isso é CRUCIAL para evitar erros de constraint no PostgreSQL
 * quando um campo opcional não é preenchido.
 */
const sanitize = (value: any) => {
  if (value === "" || value === undefined || value === "undefined") return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return value;
};

// --- FUNÇÕES DO PROFESSOR ---

export async function getTeacherDashboardData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { activeTests: [], classes: [], isInstitutional: false };

  // 1. Busca testes criados pelo professor
  const { data: tests } = await supabase
    .from('tests')
    .select('*, test_attempts(count)')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  // 2. Busca perfil para verificar vínculo institucional
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, user_category')
    .eq('id', user.id)
    .single();

  const isInstitutional = !!profile?.organization_id;
  let classes: any[] = [];

  // 3. Se for institucional, busca as turmas
  if (isInstitutional && profile.organization_id) {
      const { data: classesData } = await supabase
          .from('school_classes')
          .select('id, name')
          .eq('organization_id', profile.organization_id);
      classes = classesData || [];
  }

  return { 
      activeTests: tests || [], 
      classes, 
      isInstitutional 
  };
}

// Alias para manter compatibilidade com componentes que usam o nome antigo
export const getTestsForTeacher = getTeacherDashboardData;

export async function createFullTest(testData: any, questions: Question[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Usuário não autenticado." };

  try {
      // A. Inserir/Atualizar o Cabeçalho do Teste
      // Usamos upsert para permitir edição se o ID for passado
      const { data: test, error: testError } = await supabase
        .from('tests')
        .upsert({
          id: testData.id, // Se vier ID, é edição
          title: testData.title,
          description: sanitize(testData.description),
          subject: testData.subject,
          duration_minutes: testData.duration_minutes || 60,
          difficulty: sanitize(testData.difficulty) || 'medio',
          test_type: testData.test_type,
          cover_image_url: sanitize(testData.cover_image_url),
          created_by: user.id,
          class_id: sanitize(testData.class_id), // NULL se for público global
          collection: sanitize(testData.collection),
          serie: sanitize(testData.serie),
          question_count: questions.length,
          points: testData.test_type === 'avaliativo' ? questions.reduce((acc, q) => acc + (q.points || 0), 0) : 0,
          is_public: !testData.class_id, // Público se não tiver turma vinculada
          is_knowledge_test: !!testData.is_knowledge_test,
          related_prompt_id: sanitize(testData.related_prompt_id)
        })
        .select()
        .single();

      if (testError) throw new Error(`Erro ao salvar teste: ${testError.message}`);

      // B. Gerenciar Questões
      // Se for edição, removemos as antigas para reinserir (estratégia simples e segura para integridade)
      if (testData.id || test.id) {
          await supabase.from('questions').delete().eq('test_id', test.id);
      }

      // Preparar payload das questões com SANITIZAÇÃO
      const questionsToInsert = questions.map(q => ({
        test_id: test.id,
        question_type: q.question_type,
        content: q.content,
        points: testData.test_type === 'avaliativo' ? (q.points || 1) : 0,
        thematic_axis: sanitize(q.thematic_axis),
        
        // CAMPOS CRÍTICOS: sanitize() garante NULL se vazio, evitando erro de constraint
        bloom_taxonomy: sanitize(q.metadata?.bloom_taxonomy),
        cognitive_skill: sanitize(q.metadata?.cognitive_skill),
        difficulty_level: sanitize(q.metadata?.difficulty_level),
        ai_explanation: sanitize(q.metadata?.ai_explanation),
        estimated_time_seconds: q.metadata?.estimated_time_seconds || 0
      }));

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (questionsError) {
        // Rollback manual: se falhar ao criar as questões de um teste novo, apaga o teste
        if (!testData.id) await supabase.from('tests').delete().eq('id', test.id);
        throw new Error(`Erro ao salvar questões: ${questionsError.message}`);
      }

      revalidatePath('/dashboard/applications/test');
      return { success: true, testId: test.id };

  } catch (err: any) {
      console.error("CreateFullTest Error:", err);
      return { error: err.message };
  }
}

// Alias para o componente CreateTestModal antigo
export const createOrUpdateTest = createFullTest;


// --- FUNÇÕES DO ALUNO (ESTATÍSTICAS & GAMIFICAÇÃO) ---

export async function getStudentTestDashboardData(): Promise<StudentDashboardData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Perfil e Gamificação
  const { data: profile } = await supabase
    .from('profiles')
    .select('level, current_xp, next_level_xp, streak_days, badges')
    .eq('id', user.id)
    .single();

  // 2. Histórico de Tentativas
  const { data: attempts } = await supabase
    .from('test_attempts')
    .select(`
      id, score, time_spent_seconds, completed_at, 
      tests (id, title, subject, difficulty)
    `)
    .eq('student_id', user.id)
    .order('completed_at', { ascending: false });

  // 3. Insights
  const { data: insights } = await supabase
    .from('student_insights')
    .select('*')
    .eq('student_id', user.id)
    .eq('is_active', true);

  // --- Processamento de Dados ---
  
  // Performance por Matéria
  const subjectMap = new Map<string, { total: number; count: number }>();
  attempts?.forEach((att: any) => {
    const subject = att.tests?.subject || 'Geral';
    const current = subjectMap.get(subject) || { total: 0, count: 0 };
    subjectMap.set(subject, { 
      total: current.total + (att.score || 0), 
      count: current.count + 1 
    });
  });

  const performanceBySubject = Array.from(subjectMap.entries()).map(([materia, data]) => ({
    materia,
    nota: Math.round(data.total / data.count),
    simulados: data.count
  }));

  // Histórico Temporal
  const history = attempts?.slice(0, 10).map((att: any) => ({
    date: new Date(att.completed_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    avgScore: att.score || 0
  })).reverse() || [];

  // Mapa de Competências (Mock inteligente baseado nas matérias)
  const competencyMap = [
    { axis: 'Interpretação', score: performanceBySubject.find(p => p.materia === 'Português')?.nota || 70, fullMark: 100 },
    { axis: 'Raciocínio', score: performanceBySubject.find(p => p.materia === 'Matemática')?.nota || 65, fullMark: 100 },
    { axis: 'Ciências', score: performanceBySubject.find(p => ['Física', 'Química', 'Biologia'].includes(p.materia))?.nota || 60, fullMark: 100 },
    { axis: 'Humanas', score: performanceBySubject.find(p => ['História', 'Geografia'].includes(p.materia))?.nota || 75, fullMark: 100 },
    { axis: 'Memorização', score: 80, fullMark: 100 }
  ];

  // Médias Gerais
  const totalTests = attempts?.length || 0;
  const globalAverage = totalTests > 0 
    ? attempts!.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalTests 
    : 0;
  const averageTime = totalTests > 0
    ? attempts!.reduce((acc, curr) => acc + (curr.time_spent_seconds || 0), 0) / totalTests
    : 0;

  return {
    stats: {
        simuladosFeitos: totalTests,
        mediaGeral: Math.round(globalAverage),
        taxaAcerto: Math.round(globalAverage),
        tempoMedio: averageTime
    },
    gamification: {
      level: profile?.level || 1,
      current_xp: profile?.current_xp || 0,
      next_level_xp: profile?.next_level_xp || 1000,
      streak_days: profile?.streak_days || 0,
      badges: profile?.badges || []
    },
    insights: insights || [],
    performanceBySubject,
    history,
    competencyMap,
    recentAttempts: attempts?.slice(0, 5) || []
  };
}

// Alias
export const getStudentDashboardData = getStudentTestDashboardData;


// --- 4. LISTAGEM DE TESTES E CAMPANHAS ---

export async function getAvailableTestsForStudent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Busca testes públicos e testes da turma do aluno (lógica simplificada: is_public = true)
  const { data, error } = await supabase
    .from('tests')
    .select(`
      id, title, subject, question_count, duration_minutes, 
      difficulty, test_type, created_at, cover_image_url, 
      class_id, collection
    `)
    .eq('is_public', true)
    .eq('is_knowledge_test', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Erro ao buscar testes disponíveis:", error);
    return [];
  }

  return data.map(t => ({
      ...t,
      avg_score: 0,
      total_attempts: 0,
      hasAttempted: false
  }));
}

export async function getKnowledgeTestsForDashboard() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('tests')
    .select('id, title, subject, questions(count)')
    .eq('is_knowledge_test', true)
    .limit(3);
    
  return data || [];
}

export async function getCampaignsForStudent(): Promise<StudentCampaign[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      id, title, description, end_date, 
      campaign_tests (
        tests (id, title, subject, question_count)
      )
    `)
    .gte('end_date', now)
    .order('end_date', { ascending: true });

  if (error) return [];

  return (data || []).map((c: any) => ({
      campaign_id: c.id,
      title: c.title,
      description: c.description,
      end_date: c.end_date,
      tests: c.campaign_tests.map((ct: any) => ct.tests).filter(Boolean)
  }));
}

export async function getConsentedCampaignsForStudent(): Promise<string[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data } = await supabase
      .from('campaign_consent')
      .select('campaign_id')
      .eq('student_id', user.id);
      
    return data?.map(c => c.campaign_id) || [];
}

export async function submitCampaignConsent(campaignId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autenticado" };
    
    const { error } = await supabase
      .from('campaign_consent')
      .insert({ student_id: user.id, campaign_id: campaignId });
      
    if (error) return { error: error.message };
    return { success: true };
}


// --- 5. EXECUÇÃO DE TESTE ---

export async function getTestWithQuestions(testId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Usuário não autenticado' };

  const { data: test, error } = await supabase
    .from('tests')
    .select('*, questions(*)')
    .eq('id', testId)
    .single();

  if (error) return { data: null, error: error.message };

  // Verifica tentativa anterior
  const { data: attempt } = await supabase
    .from('test_attempts')
    .select('id, score, completed_at')
    .eq('test_id', testId)
    .eq('student_id', user.id)
    .maybeSingle();

  return { 
    data: { 
      ...test, 
      hasAttempted: !!attempt, 
      lastAttempt: attempt 
    } as TestWithQuestions & { hasAttempted: boolean, lastAttempt: any } 
  };
}

export async function getQuickTest() {
  const supabase = await createClient();
  
  // Tenta pegar um teste curto aleatório ou marcado como quick
  const { data, error } = await supabase
    .from('tests')
    .select('*, questions(*)')
    .eq('is_public', true)
    .lte('duration_minutes', 15)
    .limit(1)
    .maybeSingle();

  if (error || !data) return { data: null, error: "Nenhum teste rápido disponível." };
  return { data: data as TestWithQuestions };
}

export async function getStudentResultsHistory() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Não autenticado" };

  const { data, error } = await supabase
    .from('test_attempts')
    .select(`
      id, completed_at, score, 
      tests (title, subject, question_count)
    `)
    .eq('student_id', user.id)
    .order('completed_at', { ascending: false });

  if (error) return { data: null, error: error.message };

  // Normalização para o frontend
  const mappedData = data.map(item => ({
      ...item,
      tests: Array.isArray(item.tests) ? item.tests[0] : item.tests
  }));

  return { data: mappedData };
}