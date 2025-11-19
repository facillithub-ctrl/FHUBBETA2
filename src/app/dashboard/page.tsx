import createSupabaseServerClient from '@/utils/supabase/server';
import Link from 'next/link';
import { getLatestEssayForDashboard } from '@/app/dashboard/applications/write/actions';
import { getStudentTestDashboardData, getCampaignsForStudent } from '@/app/dashboard/applications/test/actions';
import CountdownWidget from '@/components/dashboard/CountdownWidget';

// --- Componentes Auxiliares Locais (para manter o código organizado) ---

// 1. Cabeçalho de Boas-vindas com Gradiente da Marca
const WelcomeBanner = ({ name, message, activeCampaign }: { name: string; message: string; activeCampaign?: any }) => (
  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-purple to-brand-green shadow-lg p-8 text-white mb-8">
    <div className="relative z-10">
      <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
        Olá, {name}! 👋
      </h1>
      <p className="text-white/90 text-lg font-medium max-w-2xl">
        {message}
      </p>
      
      {activeCampaign && (
        <div className="mt-6 inline-flex items-center bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/10 animate-fade-in-right">
          <div className="bg-white p-2 rounded-full mr-3 shadow-sm">
            <i className="fas fa-trophy text-yellow-500 text-xl"></i>
          </div>
          <div>
             <p className="font-bold text-sm md:text-base">Campanha Ativa: {activeCampaign.title}</p>
             <p className="text-xs text-white/80">Termina em {new Date(activeCampaign.end_date).toLocaleDateString('pt-BR')}</p>
          </div>
          <Link 
            href="/dashboard/applications/test" 
            className="ml-4 bg-white text-brand-purple px-4 py-2 rounded-full text-xs font-bold hover:bg-opacity-90 transition-all shadow-sm hover:shadow-md whitespace-nowrap"
          >
            Participar
          </Link>
        </div>
      )}
    </div>
    
    {/* Elementos decorativos de fundo */}
    <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
    <div className="absolute bottom-0 left-20 w-32 h-32 bg-brand-green/20 rounded-full blur-2xl pointer-events-none"></div>
  </div>
);

// 2. Cartão de Módulo Moderno (Glassmorphism)
const ModuleCard = ({ 
  title, 
  subtitle, 
  icon, 
  href, 
  colorClass, 
  stat 
}: { 
  title: string; 
  subtitle: string; 
  icon: string; 
  href: string; 
  colorClass: string; 
  stat?: { label: string; value: string } 
}) => (
  <Link href={href} className="group relative flex flex-col h-full p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${colorClass} opacity-5 rounded-bl-full transition-transform group-hover:scale-110`}></div>
    
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-2xl bg-${colorClass}/10 text-${colorClass}`}>
        <i className={`fas ${icon} text-xl`}></i>
      </div>
      {stat && (
         <div className="text-right">
           <p className="text-xs text-text-secondary font-medium">{stat.label}</p>
           <p className={`text-lg font-black text-${colorClass}`}>{stat.value}</p>
         </div>
      )}
    </div>
    
    <div className="mt-auto">
      <h3 className="text-xl font-bold text-text-primary dark:text-white mb-1 group-hover:text-brand-purple transition-colors">{title}</h3>
      <p className="text-sm text-text-secondary mb-4 line-clamp-2">{subtitle}</p>
      
      <div className="flex items-center text-sm font-bold text-brand-purple group-hover:translate-x-2 transition-transform">
        Aceder agora <i className="fas fa-arrow-right ml-2"></i>
      </div>
    </div>
  </Link>
);

// 3. Widget de Estatística Rápida
const QuickStatWidget = ({ icon, label, value, trend }: { icon: string, label: string, value: string, trend?: string }) => (
  <div className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center space-x-4">
    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-brand-purple">
      <i className={`fas ${icon}`}></i>
    </div>
    <div>
      <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">{label}</p>
      <p className="text-xl font-black text-text-primary dark:text-white">{value}</p>
    </div>
  </div>
);

// --- Página Principal ---

export default async function DashboardPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) { return null; }

    // Buscar dados em paralelo para performance
    const [profileResult, essayRes, testRes, campaignsRes] = await Promise.all([
        supabase.from('profiles').select('full_name, pronoun, target_exam').eq('id', user.id).single(),
        getLatestEssayForDashboard(),
        getStudentTestDashboardData(),
        getCampaignsForStudent()
    ]);

    const profile = profileResult.data;
    
    // Lógica de Saudação
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
    const welcomeMessage = `${greeting}! Pronto para evoluir hoje?`;

    const campaigns = campaignsRes.data;
    
    // Processar dados
    const latestEssayScore = essayRes.data ? 
      // @ts-ignore 
      (essayRes.data.final_grade !== null ? essayRes.data.final_grade.toFixed(0) : '-') 
      : '-';

    const latestTestScore = testRes.data?.recentAttempts?.[0] ? 
      `${testRes.data.recentAttempts[0].score.toFixed(0)}%` 
      : '-';

    let examDate: { name: string, exam_date: string } | null = null;
    if (profile?.target_exam) {
        const { data } = await supabase.from('exam_dates').select('name, exam_date').eq('name', profile.target_exam).single();
        examDate = data;
    }

    const firstName = profile?.full_name?.split(' ')[0] || 'Estudante';

    return (
        <div className="pb-10 max-w-7xl mx-auto">
            
            {/* 1. Hero Section */}
            <WelcomeBanner 
              name={firstName} 
              message={welcomeMessage} 
              activeCampaign={campaigns && campaigns.length > 0 ? campaigns[0] : null} 
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 2. Coluna Principal (Esquerda) - Módulos e Conteúdo */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Stats Rápidos (Mobile/Tablet) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                       <QuickStatWidget 
                         icon="fa-pen-nib" 
                         label="Média Redação" 
                         value={latestEssayScore !== '-' ? latestEssayScore : 'N/A'} 
                       />
                       <QuickStatWidget 
                         icon="fa-check-circle" 
                         label="Média Testes" 
                         value={latestTestScore} 
                       />
                       <div className="hidden md:block">
                         <QuickStatWidget 
                           icon="fa-fire" 
                           label="Ofensiva" 
                           value="3 dias" // Exemplo estático, ideal conectar ao backend
                         /> 
                       </div>
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-text-primary dark:text-white mb-4 flex items-center">
                        <i className="fas fa-cubes mr-2 text-brand-purple"></i> Os Teus Módulos
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <ModuleCard 
                            title="Facillit Write"
                            subtitle="Pratica a tua escrita com correção IA instantânea e temas atualizados."
                            icon="fa-pen-fancy"
                            href="/dashboard/applications/write"
                            colorClass="brand-purple" // Requer configuração no tailwind safelist ou uso de style inline se falhar
                            stat={{ label: "Última Nota", value: latestEssayScore }}
                          />
                          <ModuleCard 
                            title="Facillit Test"
                            subtitle="Simulados e questões para testares o teu conhecimento."
                            icon="fa-clipboard-check"
                            href="/dashboard/applications/test"
                            colorClass="brand-green"
                            stat={{ label: "Último Teste", value: latestTestScore }}
                          />
                      </div>
                    </div>

                    {/* Aviso de Desenvolvimento (Estilizado) */}
                    <div className="rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 p-4 flex items-start gap-3">
                        <i className="fas fa-hard-hat text-yellow-600 dark:text-yellow-500 mt-1"></i>
                        <div>
                            <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-400">Versão Beta</h4>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300/80 mt-1">
                                Estamos em constante evolução. Se encontrares algum bug, por favor reporta.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. Coluna Lateral (Direita) - Widgets e Info Secundária */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Widget de Contagem Regressiva */}
                    <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 h-auto">
                        <div className="flex items-center justify-between mb-6">
                           <h3 className="font-bold text-text-primary dark:text-white">Próximo Exame</h3>
                           <Link href="/dashboard/profile" className="text-xs text-brand-purple font-bold hover:underline">Editar</Link>
                        </div>
                        <div className="bg-bg-secondary dark:bg-bg-primary rounded-2xl p-4">
                           <CountdownWidget targetExam={examDate?.name} examDate={examDate?.exam_date} />
                        </div>
                    </div>

                    {/* Banner Secundário / Novidades */}
                    <div className="rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white relative overflow-hidden">
                        <div className="relative z-10">
                           <h3 className="font-bold text-lg mb-2">Facillit Premium</h3>
                           <p className="text-sm text-gray-300 mb-4">Desbloqueia todo o potencial do teu estudo com recursos exclusivos.</p>
                           <button className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-bold transition-colors">
                             Em breve
                           </button>
                        </div>
                        {/* Círculo decorativo */}
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-purple rounded-full blur-2xl opacity-50"></div>
                    </div>

                </div>
            </div>
        </div>
    );
}