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
// Ajuste conforme a necessidade real do seu componente TeacherDashboard
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

  // --- ROTA PARA ALUNO ---
  if (['aluno', 'vestibulando'].includes(profile.user_category || '')) {
    try {
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
              .maybeSingle(); // Usar maybeSingle é mais seguro que single se puder não existir
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
    } catch (error) {
      console.error("Erro ao carregar dashboard do aluno:", error);
      return (
        <div className="p-6">
          <h1 className="text-xl font-bold text-red-600">Erro ao carregar dados</h1>
          <p>Por favor, recarregue a página. Se o erro persistir, contate o suporte.</p>
        </div>
      );
    }
  }

  // --- ROTA PARA PROFESSOR (GLOBAL E INSTITUCIONAL), GESTOR E ADMIN ---
  if (['professor', 'gestor', 'administrator', 'diretor'].includes(profile.user_category || '')) {
     try {
       const [pendingEssaysResult, correctedEssaysResult] = await Promise.all([
          getPendingEssaysForTeacher(user.id, profile.organization_id),
          getCorrectedEssaysForTeacher(user.id, profile.organization_id)
       ]);
       
      // Função de transformação segura
      const transformData = (data: any[] | null | undefined): EssayListItem[] => {
        if (!data || !Array.isArray(data)) return [];
        return data.map(item => ({
          id: item.id,
          title: item.title,
          submitted_at: item.submitted_at,
          // Garante que 'profiles' seja um objeto ou nulo, lidando com array ou objeto vindo do Supabase
          profiles: Array.isArray(item.profiles) ? item.profiles[0] || null : (item.profiles || null),
          // Preserva as correções se existirem para mostrar a nota
          essay_corrections: item.essay_corrections, 
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
    } catch (error) {
      console.error("Erro ao carregar dashboard do professor:", error);
      return (
        <div className="p-6">
          <h1 className="text-xl font-bold text-red-600">Erro ao carregar dados</h1>
          <p>Por favor, recarregue a página.</p>
        </div>
      );
    }
  }

  // Fallback para qualquer outro perfil
  return (
    <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Acesso Restrito</h1>
          <p className="text-gray-500">O seu perfil não tem acesso a este módulo.</p>
        </div>
    </div>
  );
}