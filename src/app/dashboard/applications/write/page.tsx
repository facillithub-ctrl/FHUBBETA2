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

// Tipo auxiliar para transformação de dados
type EssayListItem = {
  id: string;
  title: string | null;
  submitted_at: string | null;
  profiles: { full_name: string | null } | null;
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

  const userRole = profile.user_category || '';

  // --- 1. ROTA PARA ALUNO ---
  if (['aluno', 'vestibulando'].includes(userRole)) {
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

  // --- 2. ROTA PARA PROFESSOR, DIRETOR E ADMINISTRADOR ---
  // Todos estes perfis devem ver o PAINEL DE CORREÇÃO nesta rota.
  // O Admin tem funcionalidades extras na rota /admin, mas aqui ele age como corretor "super".
  if (['professor', 'gestor', 'administrator', 'diretor'].includes(userRole)) {
     
     // Busca redações baseadas no ID do usuário e sua organização (ou null se global)
     const [pendingEssaysResult, correctedEssaysResult] = await Promise.all([
        getPendingEssaysForTeacher(user.id, profile.organization_id),
        getCorrectedEssaysForTeacher(user.id, profile.organization_id)
     ]);
     
    // Função auxiliar para garantir a tipagem correta para o componente
    const transformData = (data: any[] | null): EssayListItem[] => {
      if (!data) return [];
      return data.map(item => ({
        ...item,
        // Garante que profiles é um objeto único e não array, tratando inconsistências do Supabase
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

  // Fallback para perfis não reconhecidos
  return (
    <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Módulo de Redação</h1>
        <p className="text-gray-500">O seu perfil ({userRole}) não tem acesso configurado para este módulo.</p>
    </div>
  );
}