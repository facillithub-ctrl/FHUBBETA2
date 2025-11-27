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
  
  // 1. Verificação de Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 2. Busca de Perfil
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  const userProfile = profileData as UserProfile;
  const userRole = userProfile?.user_category;

  // 3. Renderização Condicional baseada no Cargo
  
  // --- PROFESSOR / DIRETOR ---
  if (['professor', 'diretor', 'administrator'].includes(userRole || '')) {
    const teacherData = await getTeacherDashboardData();
    return <TeacherTestDashboard dashboardData={teacherData} />;
  }

  // --- ALUNO (Carregamento Paralelo para Performance) ---
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
      classTests={[]} // Futuramente: carregar testes específicos da turma do aluno
      knowledgeTests={knowledgeTests}
      campaigns={campaigns}
      consentedCampaignIds={consentedCampaignIds}
    />
  );
}