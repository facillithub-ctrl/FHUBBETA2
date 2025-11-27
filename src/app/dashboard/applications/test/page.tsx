import createClient from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import StudentTestDashboard from './components/StudentTestDashboard';
import TeacherTestDashboard from './components/TeacherTestDashboard';
import { 
    getTeacherDashboardData, 
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

  // 1. Busca o perfil para determinar o tipo de usuário e permissões
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  const userProfile = profileData as UserProfile;
  const userRole = userProfile?.user_category;

  // 2. Lógica para PROFESSORES / DIRETORES
  if (['professor', 'diretor', 'administrator'].includes(userRole || '')) {
    const teacherData = await getTeacherDashboardData();
    return <TeacherTestDashboard dashboardData={teacherData} />;
  }

  // 3. Lógica para ALUNOS
  // Usamos Promise.all para carregar todas as seções do dashboard em paralelo (Performance)
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
      classTests={[]} // Futuramente: implementar getTestsForClass(classId)
      knowledgeTests={knowledgeTests}
      campaigns={campaigns}
      consentedCampaignIds={consentedCampaignIds}
    />
  );
}