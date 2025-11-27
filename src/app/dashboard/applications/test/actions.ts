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

// --- TIPOS AUXILIARES PARA CAMPANHAS E PROFESSOR ---
export type Campaign = {
    id: string;
    title: string;
    description: string | null;
    start_date: string;
    end_date: string;
    created_by: string;
    organization_id: string | null;
    campaign_tests: { test_id: string }[];
};

export type Test = {
    id: string;
    title: string;
    subject: string | null;
    question_count: number;
};

export type StudentAnswerPayload = {
  question_id: string;
  answer: string | number | boolean;
  time_spent_seconds?: number;
};

// --- UTILITÁRIO: SANITIZAÇÃO ---
const sanitize = (value: any) => {
  if (value === "" || value === undefined || value === "undefined") return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return value;
};

// =================================================================
// 1. DASHBOARD DO PROFESSOR & GESTÃO
// =================================================================

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
    .select('organization_id')
    .eq('id', user.id)
    .single();

  let classes: any[] = [];
  if (profile?.organization_id) {
      const { data: classesData } = await supabase
          .from('school_classes')
          .select('id, name')
          .eq('organization_id', profile.organization_id);
      classes = classesData || [];
  }

  return { activeTests: tests || [], classes, isInstitutional: !!profile?.organization_id };
}

// Alias usado pelo CampaignManager
export const getTestsForTeacher = async () => {
    const data = await getTeacherDashboardData();
    return { data: data.activeTests as Test[], error: null };
};

export async function createFullTest(testData: any, questions: Question[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Usuário não autenticado." };

  try {
      // Upsert do Teste
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

      if (testError) throw new Error(testError.message);

      // Gerenciar Questões (Delete old -> Insert new)
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

      const { error: questionsError } = await supabase.from('questions').insert(questionsToInsert);

      if (questionsError) {
        if (!testData.id) await supabase.from('tests').delete().eq('id', test.id);
        throw new Error(questionsError.message);
      }

      revalidatePath('/dashboard/applications/test');
      return { success: true, testId: test.id };

  } catch (err: any) {
      console.error(err);
      return { error: err.message };
  }
}
export const createOrUpdateTest = createFullTest;

// =================================================================
// 2. GESTÃO DE CAMPANHAS
// =================================================================

export async function getCampaignsForTeacher() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Usuário não autenticado.' };

    const { data, error } = await supabase
        .from('campaigns')
        .select('*, campaign_tests(test_id)')
        .eq('created_by', user.id)
        .order('start_date', { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: data as Campaign[], error: null };
}

export async function createOrUpdateCampaign(campaignData: {
    id?: string;
    title: string;
    description: string | null;
    start_date: string;
    end_date: string;
    test_ids: string[];
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado.' };

    const { test_ids, ...campaignDetails } = campaignData;

    const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .upsert({
            ...campaignDetails,
            created_by: user.id
        })
        .select()
        .single();

    if (campaignError) return { error: campaignError.message };

    await supabase.from('campaign_tests').delete().eq('campaign_id', campaign.id);

    if (test_ids?.length > 0) {
        const testsToLink = test_ids.map(test_id => ({
            campaign_id: campaign.id,
            test_id: test_id
        }));
        const { error: linkError } = await supabase.from('campaign_tests').insert(testsToLink);
        if (linkError) return { error: linkError.message };
    }

    revalidatePath('/dashboard/applications/test');
    return { data: campaign, error: null };
}

export async function deleteCampaign(campaignId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('campaigns').delete().eq('id', campaignId);
    
    if (error) return { error: error.message };
    
    revalidatePath('/dashboard/applications/test');
    return { data: { success: true } };
}

// =================================================================
// 3. DASHBOARD DO ALUNO
// =================================================================

export async function getStudentTestDashboardData(): Promise<StudentDashboardData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('level, current_xp, next_level_xp, streak_days, badges').eq('id', user.id).single();
  const { data: attempts } = await supabase.from('test_attempts').select(`id, score, time_spent_seconds, completed_at, tests (id, title, subject, difficulty)`).eq('student_id', user.id).order('completed_at', { ascending: false });
  const { data: insights } = await supabase.from('student_insights').select('*').eq('student_id', user.id).eq('is_active', true);

  const subjectMap = new Map();
  attempts?.forEach((att: any) => {
    const subject = att.tests?.subject || 'Geral';
    const current = subjectMap.get(subject) || { total: 0, count: 0 };
    subjectMap.set(subject, { total: current.total + (att.score || 0), count: current.count + 1 });
  });

  const performanceBySubject = Array.from(subjectMap.entries()).map(([materia, data]: any) => ({ materia, nota: Math.round(data.total / data.count), simulados: data.count }));
  const totalTests = attempts?.length || 0;
  const avgScore = totalTests > 0 ? attempts!.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalTests : 0;

  return {
    stats: { simuladosFeitos: totalTests, mediaGeral: Math.round(avgScore), taxaAcerto: Math.round(avgScore), tempoMedio: 0 },
    gamification: { level: profile?.level || 1, current_xp: profile?.current_xp || 0, next_level_xp: profile?.next_level_xp || 1000, streak_days: profile?.streak_days || 0, badges: profile?.badges || [] },
    insights: insights || [],
    performanceBySubject,
    history: [],
    competencyMap: [],
    recentAttempts: attempts?.slice(0, 5) || []
  };
}
export const getStudentDashboardData = getStudentTestDashboardData;

// =================================================================
// 4. EXECUÇÃO DE PROVA
// =================================================================

export async function submitTestAttempt(testId: string, answers: StudentAnswerPayload[], timeSpent: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autenticado" };

    const { data: test } = await supabase.from('tests').select('id, test_type, questions(id, content, points, question_type)').eq('id', testId).single();
    if (!test) return { error: "Teste não encontrado" };

    let score = 0;
    let maxScore = 0;
    const answersMap = new Map(answers.map(a => [a.question_id, a.answer]));

    const processed = test.questions.map((q: any) => {
        const studentAns = answersMap.get(q.id);
        let correct = false;
        if (test.test_type === 'avaliativo') {
            if (String(studentAns) === String(q.content.correct_option)) {
                correct = true;
                score += (q.points || 1);
            }
        }
        maxScore += (q.points || 1);
        return { question_id: q.id, answer: studentAns, is_correct: correct };
    });

    const finalScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    // Salvar Tentativa (UPSERT)
    const { data: attempt, error } = await supabase
        .from('test_attempts')
        .upsert({
            test_id: testId,
            student_id: user.id,
            score: finalScore,
            time_spent_seconds: timeSpent,
            status: 'completed',
            completed_at: new Date().toISOString()
        }, { onConflict: 'student_id, test_id' })
        .select()
        .single();

    if (error) return { error: error.message };

    // Salvar Respostas
    await supabase.from('student_answers').delete().eq('attempt_id', attempt.id);
    
    const answersToInsert = processed.map(p => ({
        attempt_id: attempt.id,
        question_id: p.question_id,
        student_id: user.id,
        answer: { value: p.answer }, // JSONB wrapper
        is_correct: p.is_correct
    }));

    await supabase.from('student_answers').insert(answersToInsert);

    revalidatePath('/dashboard/applications/test');
    return { success: true, attemptId: attempt.id, score: finalScore };
}

// =================================================================
// 5. RELATÓRIOS & LISTAGENS
// =================================================================

// --- A FUNÇÃO QUE FALTAVA ---
export async function getSurveyResults(testId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autenticado" };

    const { data, error } = await supabase
        .from('test_attempts')
        .select(`
            completed_at,
            student: profiles ( full_name ),
            student_answers (
                answer,
                questions ( content )
            )
        `)
        .eq('test_id', testId);

    if (error) return { error: error.message };

    // Achatar dados para o frontend
    const results = data.flatMap((attempt: any) => {
        return (attempt.student_answers || []).map((ans: any) => ({
            student_name: attempt.student?.full_name || 'Anônimo',
            submitted_at: attempt.completed_at,
            question_statement: ans.questions?.content?.statement || 'Pergunta não encontrada',
            student_answer: ans.answer?.value !== undefined ? ans.answer.value : ans.answer
        }));
    });

    return { data: results };
}

export async function getAvailableTestsForStudent() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tests')
    .select('id, title, subject, question_count, duration_minutes, difficulty, test_type, created_at, cover_image_url, class_id, collection, points')
    .eq('is_public', true)
    .eq('is_knowledge_test', false)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data.map(t => ({ ...t, avg_score: 0, total_attempts: 0, hasAttempted: false }));
}

export async function getKnowledgeTestsForDashboard() {
  const supabase = await createClient();
  const { data } = await supabase.from('tests').select('id, title, subject, questions(count)').eq('is_knowledge_test', true).limit(3);
  return data || [];
}

export async function getCampaignsForStudent(): Promise<StudentCampaign[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data } = await supabase.from('campaigns').select('id, title, description, end_date, campaign_tests(tests(id, title, subject, question_count))').gte('end_date', now);
  
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
    const { data } = await supabase.from('campaign_consent').select('campaign_id').eq('student_id', user.id);
    return data?.map(c => c.campaign_id) || [];
}

export async function submitCampaignConsent(campaignId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Erro auth" };
    const { error } = await supabase.from('campaign_consent').insert({ student_id: user.id, campaign_id: campaignId });
    if (error) return { error: error.message };
    return { success: true };
}

export async function getTestWithQuestions(testId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Usuário não autenticado' };

  const { data: test, error } = await supabase.from('tests').select('*, questions(*)').eq('id', testId).single();
  if (error) return { data: null, error: error.message };

  const { data: attempt } = await supabase.from('test_attempts').select('id, score, completed_at').eq('test_id', testId).eq('student_id', user.id).maybeSingle();

  return { data: { ...test, hasAttempted: !!attempt, lastAttempt: attempt } as TestWithQuestions & { hasAttempted: boolean, lastAttempt: any } };
}

export async function getQuickTest() { return { data: null }; }
export async function getStudentResultsHistory() { return { data: [] }; }