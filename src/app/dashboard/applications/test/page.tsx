import createSupabaseServerClient from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import StudentTestDashboard from './components/StudentTestDashboard';
import TeacherTestDashboard from './components/TeacherTestDashboard';
import { 
    getTestsForTeacher, 
    getStudentTestDashboardData, 
    getAvailableTestsForStudent, 
    getKnowledgeTestsForDashboard,
    getCampaignsForStudent,
    getConsentedCampaignsForStudent // Importa a nova action
} from './actions';
import type { UserProfile } from '../../types';

export default async function TestPage() {
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
    const [dashboardDataRes, availableTestsRes, knowledgeTestsRes, campaignsRes, consentedCampaignsRes] = await Promise.all([
      getStudentTestDashboardData(),
      getAvailableTestsForStudent(),
      getKnowledgeTestsForDashboard(),
      getCampaignsForStudent(),
      getConsentedCampaignsForStudent() // Busca os consentimentos
    ]);
    
    return (
      <StudentTestDashboard 
        dashboardData={dashboardDataRes.data} 
        globalTests={availableTestsRes.data?.globalTests || []}
        classTests={availableTestsRes.data?.classTests || []}
        knowledgeTests={knowledgeTestsRes.data || []}
        campaigns={campaignsRes.data || []}
        consentedCampaignIds={consentedCampaignsRes.data || []} // Passa os IDs para o componente
      />
    );
  }

  // ROTA PARA PROFESSOR E GESTORES
  if (['professor', 'gestor', 'administrator', 'diretor'].includes(profile.user_category || '')) {
    const { data: teacherTests } = await getTestsForTeacher();
    
    return <TeacherTestDashboard initialTests={teacherTests || []} userProfile={profile as UserProfile} />;
  }

  return (
    <div>
        <h1 className="text-2xl font-bold">Módulo de Testes</h1>
        <p>Seu perfil não tem acesso a este módulo no momento.</p>
    </div>
  );
}