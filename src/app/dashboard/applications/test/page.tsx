import createClient from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import StudentTestDashboard from './components/StudentTestDashboard';
import TeacherTestDashboard from './components/TeacherTestDashboard';
import { 
    getTestsForTeacher, 
    getStudentTestDashboardData, 
    getAvailableTestsForStudent,
    getKnowledgeTestsForDashboard,
    getCampaignsForStudent,
    getConsentedCampaignsForStudent
} from './actions';
import type { UserProfile } from '../../types';

export default async function TestPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Buscar perfil para determinar tipo de usuário
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  const userProfile = profileData as UserProfile;

  // Renderização para PROFESSORES
  if (userProfile?.user_category === 'professor') {
    const teacherData = await getTestsForTeacher();
    return <TeacherTestDashboard dashboardData={teacherData} />;
  }

  // Renderização para ALUNOS (Carregamento paralelo para performance)
  const [
    dashboardData, 
    availableTests, 
    knowledgeTests, 
    campaigns, 
    consentedCampaignIds
  ] = await Promise.all([
    getStudentTestDashboardData(),
    getAvailableTestsForStudent(),
    getKnowledgeTestsForDashboard(),
    getCampaignsForStudent(),
    getConsentedCampaignsForStudent()
  ]);

  return (
    <StudentTestDashboard
      dashboardData={dashboardData}
      globalTests={availableTests}
      classTests={[]} // Futuramente: testes da turma
      knowledgeTests={knowledgeTests} // Passando os knowledge tests corretamente
      campaigns={campaigns}
      consentedCampaignIds={consentedCampaignIds}
    />
  );
}