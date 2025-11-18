import { redirect } from 'next/navigation';
import createSupabaseServerClient from '@/utils/supabase/server';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import {
  getPrompts,
  getStudentStatistics,
  calculateWritingStreak,
  getUserStateRank,
  getFrequentErrors,
  getCurrentEvents,
  getCorrectedEssaysForTeacher,
  getPendingEssaysForTeacher
} from './actions';
import type { UserProfile } from '../../types';

// O tipo esperado pelo componente TeacherDashboard
type EssayListItem = {
  id: string;
  title: string | null;
  submitted_at: string | null;
  profiles: { full_name: string | null; } | null;
  essay_corrections?: { final_grade: number }[] | null;
};

export default async function WritePage() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  // ROTA PARA ALUNO
  if (['aluno', 'vestibulando', 'individual'].includes(profile.user_category || '')) {
    const [
        essaysResult,
        promptsResult,
        statsResult,
        streakResult,
        rankResult,
        frequentErrorsResult,
        currentEventsResult,
    ] = await Promise.all([
      supabase
        .from('essays')
        .select('id, title, status, submitted_at')
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false, nullsFirst: true }),
      getPrompts(),
      getStudentStatistics(),
      calculateWritingStreak(),
      getUserStateRank(),
      getFrequentErrors(),
      getCurrentEvents(),
    ]);
    
    let examDate: { name: string, exam_date: string } | null = null;
    if (profile?.target_exam) {
        const { data } = await supabase
            .from('exam_dates')
            .select('name, exam_date')
            .eq('name', profile.target_exam)
            .single();
        examDate = data;
    }

    return (
      <StudentDashboard
        initialEssays={essaysResult.data || []}
        prompts={promptsResult.data || []}
        statistics={statsResult.data ?? null}
        streak={streakResult.data || 0}
        rankInfo={rankResult.data}
        frequentErrors={frequentErrorsResult.data || []}
        currentEvents={currentEventsResult.data || []}
        targetExam={examDate?.name}
        examDate={examDate?.exam_date}
      />
    );
  }

  // ROTA PARA PROFESSOR (GLOBAL E INSTITUCIONAL), GESTOR E ADMIN
  if (['professor', 'gestor', 'administrator', 'diretor'].includes(profile.user_category || '')) {
     const [pendingEssaysResult, correctedEssaysResult] = await Promise.all([
        getPendingEssaysForTeacher(user.id, profile.organization_id),
        getCorrectedEssaysForTeacher(user.id, profile.organization_id)
     ]);
     
    // ✅ CORREÇÃO APLICADA: Transformando os dados para o formato correto.
    const transformData = (data: any[] | null): EssayListItem[] => {
      if (!data) return [];
      return data.map(item => ({
        ...item,
        // Garante que 'profiles' seja um objeto ou nulo, não um array.
        profiles: Array.isArray(item.profiles) ? item.profiles[0] || null : item.profiles,
      }));
    };

    const pendingEssays = transformData(pendingEssaysResult.data);
    const correctedEssays = transformData(correctedEssaysResult.data);

    return (
        <TeacherDashboard
            userProfile={profile as UserProfile}
            pendingEssays={pendingEssays}
            correctedEssays={correctedEssays}
        />
    );
  }

  // Fallback para qualquer outro perfil
  return (
    <div>
        <h1 className="text-2xl font-bold">Módulo de Redação</h1>
        <p>O seu perfil não tem acesso a este módulo.</p>
    </div>
  );
}