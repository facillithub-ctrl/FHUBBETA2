"use server";

import createClient from "@/utils/supabase/server";
import { revalidatePath } from 'next/cache';
import { 
  Question, 
  StudentDashboardData, 
  TestWithQuestions, 
  StudentCampaign,
} from "./types";

// --- TIPOS EXPORTADOS PARA O CLIENTE ---
export type StudentAnswerPayload = {
  question_id: string;
  answer: string | number | boolean; // O valor da resposta
  time_spent_seconds?: number;
};

// --- UTILITÁRIOS ---
const sanitize = (value: any) => {
  if (value === "" || value === undefined || value === "undefined") return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return value;
};

// --- 1. DASHBOARD DO PROFESSOR ---

export async function getTeacherDashboardData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { activeTests: [], classes: [], isInstitutional: false };

  const { data: tests } = await supabase
    .from('tests')
    .select('*, test_attempts(count)')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, user_category')
    .eq('id', user.id)
    .single();

  const isInstitutional = !!profile?.organization_id;
  let classes: any[] = [];

  if (isInstitutional && profile.organization_id) {
      const { data: classesData } = await supabase
          .from('school_classes')
          .select('id, name')
          .eq('organization_id', profile.organization_id);
      classes = classesData || [];
  }

  return { activeTests: tests || [], classes, isInstitutional };
}

export const getTestsForTeacher = getTeacherDashboardData;

export async function createFullTest(testData: any, questions: Question[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Usuário não autenticado." };

  try {
      const { data: test, error: testError } = await supabase
        .from('tests')
        .upsert({
          id: testData.id,
          title: testData.title,
          description: sanitize(testData.description),
          subject: testData.subject,
          duration_minutes: testData.duration_minutes || 60,
          difficulty: sanitize(testData.difficulty) || 'medio',
          test_type: testData.test_type,
          cover_image_url: sanitize(testData.cover_image_url),
          created_by: user.id,
          class_id: sanitize(testData.class_id),
          collection: sanitize(testData.collection),
          serie: sanitize(testData.serie),
          question_count: questions.length,
          points: testData.test_type === 'avaliativo' ? questions.reduce((acc, q) => acc + (q.points || 0), 0) : 0,
          is_public: !testData.class_id,
          is_knowledge_test: !!testData.is_knowledge_test,
          related_prompt_id: sanitize(testData.related_prompt_id)
        })
        .select()
        .single();

      if (testError) throw new Error(`Erro ao salvar teste: ${testError.message}`);

      if (testData.id || test.id) {
          await supabase.from('questions').delete().eq('test_id', test.id);
      }

      const questionsToInsert = questions.map(q => ({
        test_id: test.id,
        question_type: q.question_type,
        content: q.content,
        points: testData.test_type === 'avaliativo' ? (q.points || 1) : 0,
        thematic_axis: sanitize(q.thematic_axis),
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
export const createOrUpdateTest = createFullTest;

// --- 2. FUNÇÕES DO ALUNO (ESTATÍSTICAS & GAMIFICAÇÃO) ---

export async function getStudentTestDashboardData(): Promise<StudentDashboardData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('level, current_xp, next_level_xp, streak_days, badges')
    .eq('id', user.id)
    .single();

  const { data: attempts } = await supabase
    .from('test_attempts')
    .select(`
      id, score, time_spent_seconds, completed_at, 
      tests (id, title, subject, difficulty)
    `)
    .eq('student_id', user.id)
    .order('completed_at', { ascending: false });

  const { data: insights } = await supabase
    .from('student_insights')
    .select('*')
    .eq('student_id', user.id)
    .eq('is_active', true);

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

  const history = attempts?.slice(0, 10).map((att: any) => ({
    date: new Date(att.completed_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    avgScore: att.score || 0
  })).reverse() || [];

  const competencyMap = [
    { axis: 'Interpretação', score: performanceBySubject.find(p => p.materia === 'Português')?.nota || 70, fullMark: 100 },
    { axis: 'Raciocínio', score: performanceBySubject.find(p => p.materia === 'Matemática')?.nota || 65, fullMark: 100 },
    { axis: 'Ciências', score: performanceBySubject.find(p => ['Física', 'Química', 'Biologia'].includes(p.materia))?.nota || 60, fullMark: 100 },
    { axis: 'Humanas', score: performanceBySubject.find(p => ['História', 'Geografia'].includes(p.materia))?.nota || 75, fullMark: 100 },
    { axis: 'Memorização', score: 80, fullMark: 100 }
  ];

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
export const getStudentDashboardData = getStudentTestDashboardData;

// --- 3. EXECUÇÃO E CORREÇÃO DE TESTE (A FUNÇÃO QUE FALTAVA) ---
export async function submitTestAttempt(
  testId: string, 
  answers: StudentAnswerPayload[], 
  totalTimeSeconds: number
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Usuário não autenticado." };

  // 1. Buscar Gabarito
  const { data: testData, error: testError } = await supabase
    .from('tests')
    .select('id, test_type, questions (id, points, question_type, content)')
    .eq('id', testId)
    .single();

  if (testError || !testData) return { error: "Teste não encontrado." };

  // 2. Calcular Nota
  let totalScore = 0;
  let maxScore = 0;
  const answersMap = new Map(answers.map(a => [a.question_id, a.answer]));

  const processedAnswers = testData.questions.map((q: any) => {
      const studentAnswer = answersMap.get(q.id);
      let isCorrect = false;
      let points = 0;

      if (testData.test_type === 'avaliativo' && (q.question_type === 'multiple_choice' || q.question_type === 'true_false')) {
          if (String(studentAnswer) === String(q.content.correct_option)) {
              isCorrect = true;
              points = q.points || 1;
          }
      } 
      totalScore += points;
      maxScore += (q.points || 1);

      return {
          question_id: q.id,
          student_id: user.id,
          answer: { value: studentAnswer },
          is_correct: isCorrect,
          points_earned: points
      };
  });

  const finalScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  // 3. Salvar Tentativa (UPSERT para corrigir erro de chave duplicada)
  // IMPORTANTE: Isso atualiza a nota se o aluno refizer a prova.
  // Se quiser manter histórico, o banco precisaria remover a constraint unique.
  const { data: attempt, error: attemptError } = await supabase
      .from('test_attempts')
      .upsert({
          test_id: testId,
          student_id: user.id,
          score: finalScore,
          time_spent_seconds: totalTimeSeconds,
          status: 'completed',
          completed_at: new Date().toISOString()
      }, { onConflict: 'student_id, test_id' }) // Especifica a constraint de conflito
      .select()
      .single();

  if (attemptError) return { error: "Erro ao salvar: " + attemptError.message };

  // 4. Salvar Respostas (Limpar antigas antes se for upsert)
  await supabase.from('student_answers').delete().eq('attempt_id', attempt.id);

  const answersToInsert = processedAnswers.map(pa => ({
      attempt_id: attempt.id,
      question_id: pa.question_id,
      student_id: pa.student_id,
      answer: pa.answer,
      is_correct: pa.is_correct,
      time_spent_seconds: 0
  }));

  const { error: answersError } = await supabase.from('student_answers').insert(answersToInsert);

  revalidatePath('/dashboard/applications/test');
  return { success: true, attemptId: attempt.id, score: finalScore };
}

// --- 4. LISTAGEM DE TESTES E CAMPANHAS ---

export async function getAvailableTestsForStudent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('tests')
    .select(`
      id, title, subject, question_count, duration_minutes, 
      difficulty, test_type, created_at, cover_image_url, 
      class_id, collection, points
    `)
    .eq('is_public', true)
    .eq('is_knowledge_test', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Erro ao buscar testes disponíveis:", error);
    return [];
  }

  // Verifica tentativas
  const { data: attempts } = await supabase
    .from('test_attempts')
    .select('test_id')
    .eq('student_id', user.id);
    
  const attemptedIds = new Set(attempts?.map(a => a.test_id));

  return data.map(t => ({
      ...t,
      avg_score: 0,
      total_attempts: 0,
      hasAttempted: attemptedIds.has(t.id)
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

// --- 5. DETALHES DE TESTE PARA EXECUÇÃO ---

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

  const mappedData = data.map(item => ({
      ...item,
      tests: Array.isArray(item.tests) ? item.tests[0] : item.tests
  }));

  return { data: mappedData };
}