import createSupabaseServerClient from '@/utils/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getLatestEssayForDashboard } from '@/app/dashboard/applications/write/actions';
import { getStudentTestDashboardData, getCampaignsForStudent } from '@/app/dashboard/applications/test/actions';
import CountdownWidget from '@/components/dashboard/CountdownWidget';
import type { UserProfile } from './types';

// --- DASHBOARD DO ALUNO ---
const StudentDashboard = ({ profile, latestEssay, latestTest, campaigns, examDate, welcomeMessage }: any) => (
  <>
    <h1 className="text-3xl font-bold text-dark-text dark:text-white mb-1">Olá, {profile?.full_name?.split(' ')[0]}!</h1>
    <p className="text-text-muted dark:text-gray-400">{welcomeMessage}</p>

    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
            <CountdownWidget targetExam={examDate?.name} examDate={examDate?.exam_date} />
        </div>

        {campaigns && campaigns.length > 0 && (
          <div className="lg:col-span-3 bg-royal-blue text-white rounded-lg shadow-md p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <i className="fas fa-trophy text-yellow-300 text-3xl"></i>
              <div>
                <h2 className="text-lg font-bold">Campanha Ativa: {campaigns[0].title}</h2>
                <p className="text-sm opacity-90">Prepare-se para o SAEB 2025 e concorra a prêmios!</p>
              </div>
            </div>
            <Link href="/dashboard/applications/test" className="mt-4 md:mt-0 bg-white text-royal-blue text-center font-bold py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors">
              Participar Agora
            </Link>
          </div>
        )}

        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6 flex flex-col h-full">
          <div className="flex items-center mb-4"><i className="fas fa-pen-alt text-xl text-royal-blue mr-3"></i><h2 className="text-lg font-bold dark:text-white">Facillit Write</h2></div>
          <div className="flex-grow">
             {latestEssay ? (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md"><p className="text-sm text-gray-500">Última nota: <span className="font-bold text-royal-blue">{latestEssay.score ?? 'N/A'}</span></p></div>
             ) : <p className="text-sm text-gray-500">Nenhuma redação recente.</p>}
          </div>
          <Link href="/dashboard/applications/write" className="mt-6 w-full bg-royal-blue text-white text-center font-bold py-2 px-4 rounded-lg">Acessar Redação</Link>
        </div>
        
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6 flex flex-col h-full">
          <div className="flex items-center mb-4"><i className="fas fa-check-square text-xl text-royal-blue mr-3"></i><h2 className="text-lg font-bold dark:text-white">Facillit Test</h2></div>
           <div className="flex-grow">
             {latestTest ? (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">{latestTest.name}</p>
                    <p className="text-sm text-gray-500">Nota: <span className="font-bold text-royal-blue">{latestTest.score ?? 0}%</span></p>
                </div>
             ) : <p className="text-sm text-gray-500">Nenhum teste recente.</p>}
          </div>
          <Link href="/dashboard/applications/test" className="mt-6 w-full bg-royal-blue text-white text-center font-bold py-2 px-4 rounded-lg">Acessar Testes</Link>
        </div>
    </div>
  </>
);

// --- DASHBOARD DE GESTÃO (PROFESSOR/DIRETOR) ---
const ManagementDashboard = ({ profile, welcomeMessage }: { profile: UserProfile, welcomeMessage: string }) => {
  const isDirector = profile.user_category === 'diretor';

  return (
    <>
      <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold text-dark-text dark:text-white mb-1">Painel de Gestão</h1>
            <p className="text-text-muted dark:text-gray-400">{welcomeMessage}</p>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border-l-4 border-royal-blue hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-100 p-3 rounded-lg text-royal-blue"><i className="fas fa-pen-fancy text-xl"></i></div>
                <span className="text-xs font-bold text-gray-400 uppercase">Correção</span>
            </div>
            <h3 className="text-lg font-bold text-dark-text dark:text-white mb-2">Facillit Write</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Corrija redações, gerencie temas e acompanhe o desempenho.</p>
            <Link href="/dashboard/applications/write" className="block w-full py-2 text-center border-2 border-royal-blue text-royal-blue rounded-lg font-bold hover:bg-royal-blue hover:text-white transition-colors">
                Gerenciar Redações
            </Link>
        </div>

        <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-green-100 p-3 rounded-lg text-green-600"><i className="fas fa-clipboard-list text-xl"></i></div>
                <span className="text-xs font-bold text-gray-400 uppercase">Avaliação</span>
            </div>
            <h3 className="text-lg font-bold text-dark-text dark:text-white mb-2">Facillit Test</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Crie simulados, campanhas e visualize resultados.</p>
            <Link href="/dashboard/applications/test" className="block w-full py-2 text-center border-2 border-green-500 text-green-600 rounded-lg font-bold hover:bg-green-500 hover:text-white transition-colors">
                Gerenciar Testes
            </Link>
        </div>

        <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-purple-100 p-3 rounded-lg text-purple-600"><i className="fas fa-school text-xl"></i></div>
                <span className="text-xs font-bold text-gray-400 uppercase">Institucional</span>
            </div>
            <h3 className="text-lg font-bold text-dark-text dark:text-white mb-2">Facillit Edu</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {isDirector ? "Gerencie turmas, professores e alunos." : "Acesse suas turmas e diários de classe."}
            </p>
            <Link href="/dashboard/applications/edu" className="block w-full py-2 text-center border-2 border-purple-500 text-purple-600 rounded-lg font-bold hover:bg-purple-500 hover:text-white transition-colors">
                Acessar Edu
            </Link>
        </div>
      </div>
    </>
  );
};

export default async function DashboardPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) { return null; }

    const [profileResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
    ]);

    const profile = profileResult.data as UserProfile;

    // --- REDIRECT DE SEGURANÇA PARA ADMIN ---
    if (profile?.user_category === 'administrator') {
        redirect('/admin');
    }

    const getWelcomeMessage = (pronoun: string | null): string => {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
        return `${greeting}!`;
    };
    const welcomeMessage = getWelcomeMessage(profile?.pronoun);
    const role = profile?.user_category;

    if (role === 'aluno' || role === 'vestibulando') {
        const [essayRes, testRes, campaignsRes] = await Promise.all([
            getLatestEssayForDashboard(),
            getStudentTestDashboardData(),
            getCampaignsForStudent()
        ]);

        let examDate: { name: string, exam_date: string } | null = null;
        if (profile?.target_exam) {
            const { data } = await supabase.from('exam_dates').select('name, exam_date').eq('name', profile.target_exam).single();
            examDate = data;
        }

        const latestEssay = essayRes.data ? {
             // @ts-ignore
            name: essayRes.data.prompts.title,
             // @ts-ignore
            score: essayRes.data.final_grade,
        } : null;

        // CORREÇÃO: testRes é o objeto de dados direto, não tem .data wrapper
        const latestTest = testRes?.recentAttempts && testRes.recentAttempts.length > 0 ? {
            name: testRes.recentAttempts[0].tests.title,
            score: testRes.recentAttempts[0].score,
        } : null;

        // CORREÇÃO: campaignsRes é o array direto
        const campaigns = campaignsRes || [];

        return (
            <StudentDashboard 
                profile={profile} 
                latestEssay={latestEssay} 
                latestTest={latestTest} 
                campaigns={campaigns} 
                examDate={examDate} 
                welcomeMessage={welcomeMessage} 
            />
        );
    } else {
        return <ManagementDashboard profile={profile} welcomeMessage={welcomeMessage} />;
    }
}