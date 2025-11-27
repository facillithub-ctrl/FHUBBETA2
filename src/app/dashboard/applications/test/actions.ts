"use server";

import createClient from "@/utils/supabase/server";
import { 
  Question, 
  StudentDashboardData, 
  TestWithQuestions,
  StudentCampaign
} from "./types";

// Função auxiliar para limpar strings vazias e evitar erros de constraint
const sanitizeText = (text?: string | null) => {
  if (!text || text.trim() === "") return null;
  return text;
};

// --- 1. DASHBOARD DO ALUNO ---

export async function getStudentTestDashboardData(): Promise<StudentDashboardData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('level, current_xp, next_level_xp, streak_days, badges').eq('id', user.id).single();
  const { data: attempts } = await supabase.from('test_attempts').select(`id, score, time_spent_seconds, completed_at, tests (id, title, subject, difficulty)`).eq('student_id', user.id).order('completed_at', { ascending: false });
  const { data: insights } = await supabase.from('student_insights').select('*').eq('student_id', user.id).eq('is_active', true);

  // Processamento de dados
  const subjectMap = new Map<string, { total: number; count: number }>();
  attempts?.forEach((att: any) => {
    const subject = att.tests?.subject || 'Geral';
    const current = subjectMap.get(subject) || { total: 0, count: 0 };
    subjectMap.set(subject, { total: current.total + (att.score || 0), count: current.count + 1 });
  });

  const performanceBySubject = Array.from(subjectMap.entries()).map(([materia, data]) => ({ materia, nota: Math.round(data.total / data.count), simulados: data.count }));
  const history = attempts?.slice(0, 10).map((att: any) => ({ date: new Date(att.completed_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }), avgScore: att.score || 0 })).reverse() || [];
  
  // Mock de competências (baseado em performance real)
  const competencyMap = [
    { axis: 'Interpretação', score: performanceBySubject.find(p => p.materia === 'Português')?.nota || 60, fullMark: 100 },
    { axis: 'Raciocínio', score: performanceBySubject.find(p => p.materia === 'Matemática')?.nota || 50, fullMark: 100 },
    { axis: 'Ciências', score: performanceBySubject.find(p => ['Física', 'Química', 'Biologia'].includes(p.materia))?.nota || 55, fullMark: 100 },
    { axis: 'Humanas', score: performanceBySubject.find(p => ['História', 'Geografia'].includes(p.materia))?.nota || 65, fullMark: 100 },
    { axis: 'Memorização', score: 70, fullMark: 100 }
  ];

  const totalTests = attempts?.length || 0;
  const globalAverage = totalTests > 0 ? attempts!.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalTests : 0;
  const averageTime = totalTests > 0 ? attempts!.reduce((acc, curr) => acc + (curr.time_spent_seconds || 0), 0) / totalTests : 0;

  return {
    stats: { simuladosFeitos: totalTests, mediaGeral: Math.round(globalAverage), taxaAcerto: Math.round(globalAverage), tempoMedio: averageTime } as any,
    gamification: { level: profile?.level || 1, current_xp: profile?.current_xp || 0, next_level_xp: profile?.next_level_xp || 1000, streak_days: profile?.streak_days || 0, badges: profile?.badges || [] },
    insights: insights || [],
    performanceBySubject, history, competencyMap, recentAttempts: attempts?.slice(0, 5) || []
  };
}
export const getStudentDashboardData = getStudentTestDashboardData;

// --- 2. LISTAGEM DE TESTES ---

export async function getAvailableTestsForStudent() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('tests').select(`id, title, subject, question_count, duration_minutes, difficulty, test_type, created_at, cover_image_url`).eq('is_public', true).eq('is_knowledge_test', false).order('created_at', { ascending: false });
  if (error) { console.error("Erro testes:", JSON.stringify(error, null, 2)); return []; }
  return data.map(t => ({ ...t, avg_score: 0, total_attempts: 0, hasAttempted: false }));
}

export async function getKnowledgeTestsForDashboard() {
  const supabase = await createClient();
  const { data } = await supabase.from('tests').select(`id, title, subject, questions (count)`).eq('is_knowledge_test', true).limit(3);
  return data || [];
}

// --- 3. CAMPANHAS ---

export async function getCampaignsForStudent(): Promise<StudentCampaign[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const now = new Date().toISOString();
  const { data, error } = await supabase.from('campaigns').select(`id, title, description, end_date, campaign_tests (tests (id, title, question_count))`).gte('end_date', now).order('end_date', { ascending: true });
  if (error) return [];
  return (data || []).map((c: any) => ({ campaign_id: c.id, title: c.title, description: c.description, end_date: c.end_date, tests: c.campaign_tests.map((ct: any) => ct.tests).filter(Boolean) }));
}

export async function getConsentedCampaignsForStudent(): Promise<string[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase.from('campaign_consent').select('campaign_id').eq('student_id', user.id);
    return data?.map(c => c.campaign_id) || [];
}

export async function submitCampaignConsent(campaignId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };
  const { error } = await supabase.from('campaign_consent').insert({ student_id: user.id, campaign_id: campaignId });
  if (error) return { error: error.message };
  return { success: true };
}

// --- 4. GESTÃO DE TESTES ---

export async function getTestWithQuestions(testId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Usuário não autenticado" };
  const { data: test, error } = await supabase.from('tests').select(`*, questions (*)`).eq('id', testId).single();
  if (error) return { error: error.message };
  const { data: attempt } = await supabase.from('test_attempts').select('id, score, completed_at').eq('test_id', testId).eq('student_id', user.id).maybeSingle();
  return { data: { ...test, hasAttempted: !!attempt, lastAttempt: attempt } as TestWithQuestions & { hasAttempted: boolean, lastAttempt: any } };
}

export async function getQuickTest() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('tests').select(`*, questions (*)`).eq('is_public', true).lte('duration_minutes', 15).limit(1).maybeSingle();
  if (error) return { error: error.message };
  if (!data) return { error: "Nenhum teste rápido." };
  return { data: data as TestWithQuestions };
}

export async function getStudentResultsHistory() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };
  const { data, error } = await supabase.from('test_attempts').select(`id, completed_at, score, tests (title, subject, question_count)`).eq('student_id', user.id).order('completed_at', { ascending: false });
  if (error) return { error: error.message };
  const mappedData = data.map(item => ({ ...item, tests: Array.isArray(item.tests) ? item.tests[0] : item.tests }));
  return { data: mappedData };
}

// --- 5. PROFESSOR ---

export async function getTestsForTeacher() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { activeTests: [] };
  const { data: tests } = await supabase.from('tests').select(`*, test_attempts (count)`).eq('created_by', user.id).order('created_at', { ascending: false });
  return { activeTests: tests || [] };
}
export const getTeacherDashboardData = getTestsForTeacher;

// --- 6. CRIAÇÃO DE TESTES (CORRIGIDO E SANITIZADO) ---

export async function createFullTest(testData: any, questions: Question[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Usuário não autenticado." };

  // A. Inserir Teste
  const { data: test, error: testError } = await supabase
    .from('tests')
    .insert({
      title: testData.title,
      description: testData.description,
      subject: testData.subject,
      duration_minutes: testData.duration_minutes,
      difficulty: testData.difficulty,
      test_type: testData.test_type,
      cover_image_url: testData.cover_image_url,
      created_by: user.id,
      question_count: questions.length,
      points: questions.reduce((acc, q) => acc + q.points, 0),
      is_public: true
    })
    .select()
    .single();

  if (testError) return { error: testError.message };

  // B. Inserir Questões (Sanitizando campos enum)
  const questionsToInsert = questions.map(q => ({
    test_id: test.id,
    question_type: q.question_type,
    content: q.content,
    points: q.points,
    // AQUI ESTÁ A CORREÇÃO: sanitizeText converte "" para null
    bloom_taxonomy: sanitizeText(q.metadata?.bloom_taxonomy),
    cognitive_skill: sanitizeText(q.metadata?.cognitive_skill),
    difficulty_level: sanitizeText(q.metadata?.difficulty_level),
    estimated_time_seconds: q.metadata?.estimated_time_seconds || 0,
    ai_explanation: sanitizeText(q.metadata?.ai_explanation)
  }));

  const { error: questionsError } = await supabase
    .from('questions')
    .insert(questionsToInsert);

  if (questionsError) {
    // Rollback manual se falhar
    await supabase.from('tests').delete().eq('id', test.id);
    return { error: "Erro ao salvar questões: " + questionsError.message };
  }

  return { success: true, testId: test.id };
}