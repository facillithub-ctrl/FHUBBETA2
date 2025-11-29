import createSupabaseServerClient from '@/utils/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
// Actions de Alunos
import { getEssaysForStudent, getStudentStatistics, getPendingEssaysForTeacher } from '@/app/dashboard/applications/write/actions';
import { getStudentTestDashboardData, getCampaignsForStudent, getTeacherDashboardData } from '@/app/dashboard/applications/test/actions';
import { getLearningGPSData } from '@/components/learning-gps/actions'; 
import { client, urlFor } from '@/lib/sanity';
import CountdownWidget from '@/components/dashboard/CountdownWidget';
import type { UserProfile } from './types';

// --- SANITY FETCH (BLOG REAL) ---
async function getLatestBlogPosts() {
  const query = `*[_type == "post"] | order(publishedAt desc)[0...3] {
      _id, title, slug, mainImage, publishedAt,
      "category": categories[0]->title,
      "author": author->{name}
  }`;
  try {
    return await client.fetch(query);
  } catch (error) {
    console.error("Sanity fetch error:", error);
    return [];
  }
}

// --- COMPONENTES UI VISUAIS ---

const StatCard = ({ title, value, subtitle, icon, color, href }: any) => {
  const Content = (
    <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm flex items-center justify-between group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
       <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
          <h4 className={`text-3xl font-black ${color}`}>{value}</h4>
          {subtitle && <p className="text-xs text-gray-500 font-medium mt-1">{subtitle}</p>}
       </div>
       <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${color.replace('text-', 'bg-').replace('600', '50').replace('500', '50').replace('purple', 'purple/10').replace('green', 'green/10')} ${color}`}>
          <i className={`fas ${icon}`}></i>
       </div>
    </div>
  );

  if (href) return <Link href={href} className="block h-full">{Content}</Link>;
  return Content;
};

const ShortcutCard = ({ title, icon, color, href, description, badge }: any) => (
  <Link 
    href={href}
    className="group relative overflow-hidden bg-white dark:bg-dark-card p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border hover:shadow-2xl hover:shadow-brand-purple/5 hover:-translate-y-1 transition-all duration-300"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 transition-transform group-hover:scale-150 group-hover:opacity-10 ${color.bg}`} />
    
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="flex justify-between items-start mb-3">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${color.bg} ${color.text} group-hover:rotate-6 transition-transform duration-300`}>
          <i className={`fas ${icon}`}></i>
        </div>
        {badge && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
            {badge}
          </span>
        )}
      </div>
      <div>
        <h3 className="font-bold text-dark-text dark:text-white text-lg leading-tight mb-1 group-hover:text-brand-purple transition-colors">{title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium line-clamp-2">{description}</p>
      </div>
    </div>
  </Link>
);

const MotivationalWidget = () => {
  const quotes = [
    { text: "A persistência é o caminho do êxito.", author: "Charles Chaplin" },
    { text: "O sucesso é a soma de pequenos esforços repetidos dia após dia.", author: "Robert Collier" },
    { text: "Não pare até se orgulhar.", author: "Anônimo" },
    { text: "A educação é a arma mais poderosa que você pode usar para mudar o mundo.", author: "Nelson Mandela" },
  ];
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const quote = quotes[dayOfYear % quotes.length];

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-blue-600 to-brand-purple text-white shadow-lg h-full flex flex-col justify-center">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-3xl"></div>
      <div className="relative z-10 flex items-start gap-4">
        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
           <i className="fas fa-quote-left text-2xl text-white"></i>
        </div>
        <div>
          {/* CORREÇÃO AQUI: Aspas escapadas com &quot; */}
          <p className="font-medium text-lg leading-relaxed italic opacity-95">&quot;{quote.text}&quot;</p>
          <p className="text-sm font-bold mt-2 opacity-80 uppercase tracking-wider">— {quote.author}</p>
        </div>
      </div>
    </div>
  );
};

// --- DASHBOARD DO ALUNO (CLEAN & PRODUCTIVE) ---
const StudentDashboard = ({ 
    profile, 
    latestEssay, 
    latestTest, 
    campaigns, 
    examDate, 
    welcomeMessage, 
    gpsData, 
    blogPosts,
    writeStats,
    testStats
}: any) => {
  
  // Métricas de Hábito (Sem XP)
  const streak = profile.streak_days ?? 0;
  const writeCount = writeStats?.totalCorrections || 0;
  const testCount = testStats?.stats?.simuladosFeitos || 0;
  const questionsTotal = testStats?.stats?.questionsAnsweredTotal || 0;
  const writeAvg = writeStats?.averages?.avg_final_grade ? Math.round(writeStats.averages.avg_final_grade) : 0;
  const testAvg = testStats?.stats?.mediaGeral || 0;

  const shortcuts = [
    { title: "Redação", icon: "fa-pen-fancy", href: "/dashboard/applications/write", desc: "Pratique escrita", color: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-brand-purple" } },
    { title: "Simulados", icon: "fa-clipboard-check", href: "/dashboard/applications/test", desc: "Banco de questões", color: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-brand-green" } },
    { title: "Facillit Play", icon: "fa-play-circle", href: "/modulos/facillit-play", desc: "Aulas em vídeo", color: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-500" }, badge: "Novo" },
    { title: "Biblioteca", icon: "fa-book-open", href: "/dashboard/applications/library", desc: "Seus materiais", color: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-500" } },
    { title: "Estatísticas", icon: "fa-chart-pie", href: "/dashboard/profile", desc: "Meu desempenho", color: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-500" } },
  ];

  const topGpsActions = gpsData.actions.slice(0, 3);

  return (
    <div className="space-y-8 animate-fade-in-right pb-12">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-green mb-2">
            {welcomeMessage} {profile?.full_name?.split(' ')[0]}
          </h1>
          <p className="text-text-muted dark:text-gray-400 text-lg font-medium">Seu foco hoje determina seu sucesso amanhã.</p>
        </div>
        
        {/* Data / Countdown Minimalista */}
        <div className="hidden md:block text-right">
             <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
             {examDate && <p className="text-brand-purple font-bold text-sm">Faltam {Math.ceil((new Date(examDate.exam_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias para {examDate.name}</p>}
        </div>
      </div>

      {/* 2. RESUMO DE PRODUTIVIDADE (SUBSTITUI XP BAR) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            title="Sequência" 
            value={`${streak} dias`} 
            subtitle="Mantenha o ritmo!" 
            icon="fa-fire" 
            color="text-orange-500" 
          />
          <StatCard 
            title="Redações" 
            value={writeCount} 
            subtitle={`Média: ${writeAvg}`} 
            icon="fa-pen-nib" 
            color="text-brand-purple" 
            href="/dashboard/applications/write"
          />
           <StatCard 
            title="Questões" 
            value={questionsTotal} 
            subtitle={`Simulados: ${testCount}`} 
            icon="fa-check-double" 
            color="text-brand-green" 
            href="/dashboard/applications/test"
          />
           <StatCard 
            title="Desempenho" 
            value={`${testAvg}%`} 
            subtitle="Média Global de Testes" 
            icon="fa-chart-line" 
            color="text-blue-500" 
            href="/dashboard/profile"
          />
      </div>

      {/* 3. ATALHOS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {shortcuts.map((shortcut, idx) => (
           <ShortcutCard key={idx} {...shortcut} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUNA ESQUERDA (8) */}
        <div className="lg:col-span-8 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MotivationalWidget />
                
                {campaigns && campaigns.length > 0 ? (
                  <Link href="/dashboard/applications/test" className="relative overflow-hidden rounded-2xl p-6 bg-gray-900 text-white shadow-lg group flex flex-col justify-center h-full">
                      <div className="absolute inset-0 bg-[url('/assets/images/pattern.png')] opacity-20"></div>
                      <div className="relative z-10">
                          <div className="flex items-center justify-between mb-3">
                             <span className="text-[10px] font-bold bg-yellow-400 text-black px-2 py-1 rounded uppercase tracking-wide">Evento Oficial</span>
                             <i className="fas fa-chevron-right opacity-50 group-hover:translate-x-1 transition-transform"></i>
                          </div>
                          <h3 className="font-bold text-xl mb-1 line-clamp-2">{campaigns[0].title}</h3>
                          <p className="text-sm opacity-80">Participe do simulado e teste seus conhecimentos.</p>
                      </div>
                  </Link>
                ) : (
                  <div className="relative overflow-hidden rounded-2xl p-6 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border shadow-sm flex items-center justify-center text-center h-full">
                     <div>
                        <i className="fas fa-calendar-check text-3xl text-gray-200 mb-2"></i>
                        <p className="font-bold text-gray-400">Sem campanhas ativas</p>
                        <p className="text-xs text-gray-300">Aproveite para revisar.</p>
                     </div>
                  </div>
                )}
            </div>

            {/* GPS DE APRENDIZADO */}
            <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl text-dark-text dark:text-white flex items-center gap-2">
                        <i className="fas fa-map-signs text-brand-green"></i>
                        Recomendações de Estudo
                    </h3>
                </div>
                
                <div className="space-y-3">
                   {topGpsActions.length > 0 ? topGpsActions.map((action, i) => (
                      <div key={action.id || i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-white border border-transparent hover:border-gray-200 transition-all group cursor-pointer">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${action.bg_color || 'bg-blue-100'} text-white shadow-sm`}>
                             <i className={`fas fa-${action.icon_name ? action.icon_name.toLowerCase() : 'star'}`}></i>
                          </div>
                          <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                 <h4 className="font-bold text-dark-text dark:text-white">{action.title}</h4>
                                 {action.priority === 'high' && <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded uppercase">Prioritário</span>}
                              </div>
                              <p className="text-sm text-gray-500 leading-snug">{action.description}</p>
                          </div>
                          <Link href={action.link || '#'} className="bg-white dark:bg-dark-card text-brand-purple border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-brand-purple hover:text-white transition-colors whitespace-nowrap">
                             {action.button_text || 'Acessar'}
                          </Link>
                      </div>
                   )) : (
                     <div className="text-center py-8 text-gray-400">
                        <i className="fas fa-check-circle text-4xl mb-3 text-gray-200"></i>
                        <p>Você está em dia com suas atividades!</p>
                     </div>
                   )}
                </div>
            </div>

            {/* BLOG FACILLIT */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xl text-dark-text dark:text-white">Leitura Recomendada</h3>
                  <Link href="/recursos/blog" className="text-sm font-bold text-brand-purple hover:underline">Ir para o Blog</Link>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {blogPosts && blogPosts.length > 0 ? blogPosts.map((post: any) => (
                    <Link href={`/recursos/blog/${post.slug.current}`} key={post._id} className="group bg-white dark:bg-dark-card rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-dark-border hover:shadow-md transition-all">
                        <div className="relative h-32 w-full bg-gray-200">
                            {post.mainImage && (
                                <Image 
                                    src={urlFor(post.mainImage).width(400).height(250).url()} 
                                    alt={post.title} 
                                    fill 
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            )}
                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded">
                                {post.category || 'Geral'}
                            </div>
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold text-dark-text dark:text-white text-sm line-clamp-2 mb-2 group-hover:text-brand-purple transition-colors">
                                {post.title}
                            </h4>
                            <p className="text-xs text-gray-400">
                                {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                    </Link>
                  )) : (
                    <p className="col-span-3 text-center text-gray-500 py-4">Nenhum artigo recente encontrado.</p>
                  )}
               </div>
            </div>

        </div>

        {/* COLUNA DIREITA (4) - WIDGETS */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* COUNTDOWN */}
            <div className="glass-card p-1 rounded-2xl dark:bg-dark-card dark:border-dark-border">
                <CountdownWidget targetExam={examDate?.name} examDate={examDate?.exam_date} />
            </div>

            {/* ATIVIDADE RECENTE DETALHADA */}
            <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border">
                <h3 className="font-bold text-lg text-dark-text dark:text-white mb-4">Últimas Interações</h3>
                
                {/* Redação */}
                <div className="mb-5 pb-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                             <p className="text-xs font-bold text-gray-400 uppercase">Redação</p>
                             <p className="font-bold text-dark-text dark:text-white text-sm line-clamp-1">{latestEssay ? (latestEssay.title || 'Sem título') : 'Nenhuma redação'}</p>
                        </div>
                        {latestEssay && (
                            <span className={`text-xs font-bold px-2 py-1 rounded ${latestEssay.final_grade ? 'bg-purple-100 text-brand-purple' : 'bg-yellow-100 text-yellow-700'}`}>
                                {latestEssay.final_grade ?? 'Aguardando'}
                            </span>
                        )}
                    </div>
                    {latestEssay ? (
                        <p className="text-xs text-gray-400">Enviado em {new Date(latestEssay.submitted_at).toLocaleDateString('pt-BR')}</p>
                    ) : (
                        <Link href="/dashboard/applications/write" className="text-xs text-brand-purple font-bold hover:underline">+ Nova Redação</Link>
                    )}
                </div>

                {/* Simulado */}
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <div>
                             <p className="text-xs font-bold text-gray-400 uppercase">Simulado</p>
                             <p className="font-bold text-dark-text dark:text-white text-sm line-clamp-1">{latestTest ? (latestTest.tests?.title || 'Teste Geral') : 'Nenhum teste'}</p>
                        </div>
                        {latestTest && (
                             <span className="text-xs font-bold px-2 py-1 rounded bg-green-100 text-brand-green">
                                {latestTest.score}%
                            </span>
                        )}
                    </div>
                     {latestTest ? (
                        <p className="text-xs text-gray-400">Realizado em {new Date(latestTest.completed_at || new Date()).toLocaleDateString('pt-BR')}</p>
                    ) : (
                        <Link href="/dashboard/applications/test" className="text-xs text-brand-green font-bold hover:underline">+ Novo Teste</Link>
                    )}
                </div>
            </div>

            {/* BANNER APP */}
            <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-black p-6 text-white text-center relative overflow-hidden">
                <div className="relative z-10">
                    <i className="fas fa-mobile-alt text-3xl mb-3 text-gray-400"></i>
                    <h3 className="font-bold text-lg mb-2">Estude pelo Celular</h3>
                    <p className="text-sm opacity-70 mb-4">Acesse todos os recursos de qualquer lugar.</p>
                    <button className="bg-white text-black text-xs font-bold py-2 px-4 rounded-full hover:bg-gray-200 transition-colors">
                        Instalar App
                    </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

// --- DASHBOARD DE GESTÃO (PROFESSOR/DIRETOR - TURBO) ---
const ManagementDashboard = ({ profile, welcomeMessage, teacherStats }: { profile: UserProfile, welcomeMessage: string, teacherStats: any }) => {
  const { pendingEssaysCount, activeTestsCount, classesCount } = teacherStats;

  // Cards de Ação Rápida
  const actionCards = [
    { 
      title: "Correção de Redações", 
      icon: "fa-pen-fancy", 
      color: "text-brand-purple", 
      bg: "bg-purple-50 dark:bg-purple-900/20", 
      link: "/dashboard/applications/write", 
      desc: "Corrija textos pendentes e gerencie temas.",
      stat: pendingEssaysCount,
      statLabel: "Pendentes"
    },
    { 
      title: "Banco de Testes", 
      icon: "fa-clipboard-list", 
      color: "text-brand-green", 
      bg: "bg-green-50 dark:bg-green-900/20", 
      link: "/dashboard/applications/test", 
      desc: "Crie avaliações e monitore campanhas.",
      stat: activeTestsCount,
      statLabel: "Ativos"
    },
    { 
      title: "Minhas Turmas", 
      icon: "fa-users", 
      color: "text-blue-600", 
      bg: "bg-blue-50 dark:bg-blue-900/20", 
      link: "/dashboard/applications/edu", 
      desc: "Acompanhe o engajamento dos alunos.",
      stat: classesCount,
      statLabel: "Turmas"
    },
  ];

  return (
    <div className="animate-fade-in-right max-w-7xl mx-auto pb-12">
      {/* HEADER DE GESTÃO */}
      <div className="bg-white dark:bg-dark-card rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-dark-border mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <span className="bg-brand-purple/10 text-brand-purple px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    {profile.user_category === 'diretor' ? 'Direção' : 'Docência'}
                </span>
                <span className="text-gray-400 text-xs font-bold flex items-center gap-1">
                    <i className="fas fa-building"></i> {profile.schoolName || "Organização"}
                </span>
            </div>
            <h1 className="text-3xl font-black text-dark-text dark:text-white mb-1">Painel de Gestão</h1>
            <p className="text-text-muted dark:text-gray-400 text-lg">{welcomeMessage} Aqui está o panorama da sua instituição.</p>
          </div>
          
          <div className="flex gap-4">
              <div className="text-center px-4">
                  <span className="block text-2xl font-black text-dark-text dark:text-white">{pendingEssaysCount}</span>
                  <span className="text-xs text-gray-500 font-bold uppercase">Correções</span>
              </div>
               <div className="text-center px-4 border-l border-gray-200 dark:border-gray-700">
                  <span className="block text-2xl font-black text-dark-text dark:text-white">{classesCount}</span>
                  <span className="text-xs text-gray-500 font-bold uppercase">Turmas</span>
              </div>
          </div>
      </div>

      {/* GRID DE MÓDULOS COM STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {actionCards.map((card, i) => (
             <Link key={i} href={card.link} className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between h-full">
                <div>
                    <div className="flex justify-between items-start mb-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${card.bg} ${card.color}`}>
                            <i className={`fas ${card.icon}`}></i>
                        </div>
                        {card.stat > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                                {card.stat} {card.statLabel}
                            </span>
                        )}
                    </div>
                    <h3 className="text-xl font-bold text-dark-text dark:text-white mb-2 group-hover:text-brand-purple transition-colors">{card.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{card.desc}</p>
                </div>
                
                <div className="pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase">Acessar Módulo</span>
                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-brand-purple group-hover:text-white transition-all">
                        <i className="fas fa-arrow-right text-xs"></i>
                    </div>
                </div>
             </Link>
        ))}
      </div>

      {/* ÁREA DE ATIVIDADE RECENTE (Placeholder para futura expansão) */}
      <div className="mt-8 bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border opacity-70 hover:opacity-100 transition-opacity">
          <h3 className="font-bold text-dark-text dark:text-white mb-2"><i className="fas fa-bell mr-2 text-gray-400"></i> Avisos do Sistema</h3>
          <p className="text-sm text-gray-500">O sistema de relatórios avançados será liberado em breve para sua organização.</p>
      </div>

    </div>
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

    if (profile?.user_category === 'administrator') {
        redirect('/admin');
    }

    const getWelcomeMessage = (pronoun: string | null): string => {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
        return `${greeting},`;
    };
    const welcomeMessage = getWelcomeMessage(profile?.pronoun);
    const role = profile?.user_category;

    // --- LÓGICA CONDICIONAL DE DADOS ---

    if (role === 'aluno' || role === 'vestibulando') {
        // FETCH ALUNO
        const [essaysResult, writeStatsRes, testRes, campaignsRes, gpsData, blogPosts] = await Promise.all([
            getEssaysForStudent(),
            getStudentStatistics(),
            getStudentTestDashboardData(),
            getCampaignsForStudent(),
            getLearningGPSData(),
            getLatestBlogPosts()
        ]);

        let examDate: { name: string, exam_date: string } | null = null;
        if (profile?.target_exam) {
            const { data } = await supabase.from('exam_dates').select('name, exam_date').eq('name', profile.target_exam).single();
            examDate = data;
        }

        const latestEssay = essaysResult.data && essaysResult.data.length > 0 
            ? essaysResult.data[0] 
            : null;

        const latestTest = testRes?.recentAttempts && testRes.recentAttempts.length > 0 
            ? testRes.recentAttempts[0] 
            : null;

        const campaigns = campaignsRes || [];

        return (
            <StudentDashboard 
                profile={profile} 
                latestEssay={latestEssay} 
                latestTest={latestTest} 
                campaigns={campaigns} 
                examDate={examDate} 
                welcomeMessage={welcomeMessage}
                gpsData={gpsData}
                blogPosts={blogPosts}
                writeStats={writeStatsRes.data}
                testStats={testRes}
            />
        );

    } else {
        // FETCH PROFESSOR/DIRETOR
        // Busca redações pendentes e dados gerais
        const [pendingEssaysRes, teacherTestRes] = await Promise.all([
             getPendingEssaysForTeacher(user.id, profile.organization_id),
             getTeacherDashboardData()
        ]);

        const teacherStats = {
            pendingEssaysCount: pendingEssaysRes.data?.length || 0,
            activeTestsCount: teacherTestRes.activeTests?.length || 0,
            classesCount: teacherTestRes.classes?.length || 0
        };

        return <ManagementDashboard profile={profile} welcomeMessage={welcomeMessage} teacherStats={teacherStats} />;
    }
}