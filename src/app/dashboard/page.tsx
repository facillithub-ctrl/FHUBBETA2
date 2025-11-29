import createSupabaseServerClient from '@/utils/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
// Actions
import { getEssaysForStudent, getStudentStatistics, getPendingEssaysForTeacher } from '@/app/dashboard/applications/write/actions';
import { getStudentTestDashboardData, getCampaignsForStudent, getTeacherDashboardData } from '@/app/dashboard/applications/test/actions';
import { client, urlFor } from '@/lib/sanity';
import CountdownWidget from '@/components/dashboard/CountdownWidget';
import LearningGPS from '@/components/learning-gps/LearningGPS';
import type { UserProfile } from './types';

// --- FETCH BLOG ---
async function getLatestBlogPosts() {
  const query = `*[_type == "post"] | order(publishedAt desc)[0...2] {
      _id, title, slug, mainImage, publishedAt,
      "category": categories[0]->title,
      "author": author->{name}
  }`;
  try { return await client.fetch(query); } catch (e) { return []; }
}

// --- COMPONENTES VISUAIS ---

const StatCard = ({ title, value, subtitle, icon, color, href }: any) => {
  const inner = (
    <div className="bg-white dark:bg-dark-card p-6 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all h-full group relative overflow-hidden min-h-[140px]">
       <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg transition-transform group-hover:scale-110 ${color.bg} ${color.text}`}>
                  <i className={`fas ${icon}`}></i>
              </div>
              {href && <i className="fas fa-arrow-right text-gray-300 group-hover:text-gray-500 transition-colors -mr-1 -mt-1"></i>}
          </div>
          <h4 className={`text-3xl font-black ${color.textValue || 'text-gray-900 dark:text-white'} tracking-tight mt-2`}>{value}</h4>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{title}</p>
          {subtitle && <p className="text-[10px] text-gray-400 font-medium mt-1 opacity-80">{subtitle}</p>}
       </div>
    </div>
  );
  return href ? <Link href={href} className="block h-full">{inner}</Link> : inner;
};

const ModuleShortcut = ({ title, icon, color, href, desc, badge }: any) => (
  <Link 
    href={href}
    className="group bg-white dark:bg-dark-card p-5 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-lg hover:border-brand-purple/20 transition-all flex items-center gap-4 h-full"
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:rotate-6 ${color.bg} ${color.text}`}>
        <i className={`fas ${icon}`}></i>
    </div>
    <div className="flex-1 min-w-0 py-1">
        <div className="flex items-center gap-2 mb-0.5">
            <h4 className="font-bold text-gray-800 dark:text-white text-base truncate group-hover:text-brand-purple transition-colors">{title}</h4>
            {badge && <span className="text-[9px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-wide">{badge}</span>}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{desc}</p>
    </div>
    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-300 group-hover:bg-brand-purple group-hover:text-white transition-all opacity-0 group-hover:opacity-100">
        <i className="fas fa-chevron-right text-xs"></i>
    </div>
  </Link>
);

const MotivationalWidget = () => {
  const quotes = [
    { text: "A persistência é o caminho do êxito.", author: "Chaplin" },
    { text: "O sucesso é a soma de pequenos esforços.", author: "Collier" },
    { text: "Não pare até se orgulhar.", author: "Anônimo" },
  ];
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const quote = quotes[dayOfYear % quotes.length];

  return (
    <div className="relative overflow-hidden rounded-3xl p-8 bg-brand-gradient text-white shadow-lg flex flex-col justify-center h-full min-h-[180px]">
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white opacity-10 rounded-full blur-3xl"></div>
      <div className="relative z-10">
        <div className="bg-white/20 w-fit p-2 rounded-lg mb-4 backdrop-blur-sm">
            <i className="fas fa-quote-left text-xl text-white"></i>
        </div>
        <p className="font-medium text-lg leading-relaxed italic opacity-95 max-w-md">&quot;{quote.text}&quot;</p>
        <p className="text-xs font-bold mt-3 opacity-70 uppercase tracking-wider flex items-center gap-2">
            <span className="w-4 h-0.5 bg-white/50 rounded-full"></span> {quote.author}
        </p>
      </div>
    </div>
  );
};

// --- DASHBOARD DO ALUNO ---
const StudentDashboard = ({ 
    profile, latestEssay, latestTest, campaigns, examDate, welcomeMessage, blogPosts, writeStats, testStats
}: any) => {
  
  const streak = profile.streak_days ?? 0;
  const writeCount = writeStats?.totalCorrections || 0;
  const testCount = testStats?.stats?.simuladosFeitos || 0;
  const testAvg = testStats?.stats?.mediaGeral || 0;

  // Definição dos Módulos
  const modules = [
    { title: "Redação", icon: "fa-pen-fancy", href: "/dashboard/applications/write", desc: "Laboratório de escrita", color: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-brand-purple" } },
    { title: "Simulados", icon: "fa-clipboard-check", href: "/dashboard/applications/test", desc: "Banco de Questões", color: { bg: "bg-green-50 dark:bg-green-900/20", text: "text-brand-green" } },
    { title: "Biblioteca", icon: "fa-book-open", href: "/dashboard/applications/library", desc: "Seu acervo digital", color: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-500" } },
    { title: "Play", icon: "fa-play-circle", href: "/modulos/facillit-play", desc: "Videoaulas & Lives", color: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-500" }, badge: "Novo" },
    { title: "Games", icon: "fa-gamepad", href: "/modulos/facillit-games", desc: "Aprenda jogando", color: { bg: "bg-yellow-50 dark:bg-yellow-900/20", text: "text-yellow-600" } },
    { title: "Perfil", icon: "fa-user-circle", href: "/dashboard/profile", desc: "Dados e Configurações", color: { bg: "bg-gray-100 dark:bg-white/10", text: "text-gray-600" } },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in-right pb-20 pt-4 px-4 md:px-8">
      
      {/* 1. HEADER & METRICS */}
      <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                {welcomeMessage} <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-green">{profile?.full_name?.split(' ')[0]}</span>.
              </h1>
              <p className="text-text-muted dark:text-gray-400 font-medium mt-2 text-lg">Aqui está o seu panorama de estudos de hoje.</p>
            </div>
            
            {examDate && (
                <div className="flex items-center gap-3 bg-white dark:bg-dark-card px-5 py-3 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Foco no Exame</p>
                        <p className="text-sm font-bold text-brand-purple">{examDate.name}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-100 dark:bg-gray-700 mx-2"></div>
                    <div className="text-center">
                        <span className="block text-2xl font-black text-gray-900 dark:text-white leading-none">
                            {Math.ceil((new Date(examDate.exam_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Dias</span>
                    </div>
                </div>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Sequência Atual" value={`${streak} Dias`} icon="fa-fire" color={{bg: 'bg-orange-50', text: 'text-orange-500', textValue: 'text-orange-500'}} />
              <StatCard title="Redações Feitas" value={writeCount} subtitle="Total corrigido" icon="fa-pen-nib" color={{bg: 'bg-purple-50', text: 'text-brand-purple'}} href="/dashboard/applications/write" />
              <StatCard title="Simulados" value={testCount} subtitle="Questões resolvidas" icon="fa-check-double" color={{bg: 'bg-green-50', text: 'text-brand-green'}} href="/dashboard/applications/test" />
              <StatCard title="Média Geral" value={`${testAvg}%`} subtitle="Performance" icon="fa-chart-line" color={{bg: 'bg-blue-50', text: 'text-blue-500'}} href="/dashboard/profile" />
          </div>
      </div>

      {/* 2. MAIN BENTO GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* --- COLUNA ESQUERDA (PRINCIPAL - 8/12) --- */}
        <div className="xl:col-span-8 space-y-8">
            
            {/* GPS DE APRENDIZAGEM (Expanded) */}
            <section className="bg-white dark:bg-dark-card rounded-3xl p-1.5 shadow-sm border border-gray-100 dark:border-dark-border">
                <LearningGPS />
            </section>

            {/* MÓDULOS (GRID) */}
            <section>
                <div className="flex items-center justify-between mb-5 px-2">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <i className="fas fa-th-large text-brand-purple"></i> Módulos de Estudo
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {modules.map((mod, idx) => (
                        <ModuleShortcut key={idx} {...mod} />
                    ))}
                </div>
            </section>

            {/* BLOG FEED (Wide Cards) */}
            <section>
               <div className="flex justify-between items-end mb-5 px-2">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Últimas do Blog</h3>
                  <Link href="/recursos/blog" className="text-xs font-bold text-brand-purple hover:underline bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg transition-colors">Ver todos os artigos</Link>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {blogPosts?.map((post: any) => (
                    <Link href={`/recursos/blog/${post.slug.current}`} key={post._id} className="flex flex-col bg-white dark:bg-dark-card rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-dark-border hover:shadow-xl hover:-translate-y-1 transition-all h-full group">
                        <div className="h-40 relative bg-gray-200 w-full">
                            {post.mainImage && <Image src={urlFor(post.mainImage).url()} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />}
                            <div className="absolute top-4 left-4">
                                <span className="text-[10px] font-bold text-brand-purple bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wide">{post.category || 'Geral'}</span>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <h4 className="font-bold text-lg text-dark-text dark:text-white line-clamp-2 leading-tight mb-2 group-hover:text-brand-purple transition-colors">{post.title}</h4>
                            <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-gray-400 font-medium">
                                <span>{new Date(post.publishedAt).toLocaleDateString('pt-BR')}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span>Leitura de 5 min</span>
                            </div>
                        </div>
                    </Link>
                  ))}
               </div>
            </section>

        </div>

        {/* --- COLUNA DIREITA (SIDEBAR - 4/12) --- */}
        <div className="xl:col-span-4 space-y-8">
            
            {/* MOTIVATIONAL / CAMPAIGN */}
            <div className="grid grid-cols-1 gap-6">
                <MotivationalWidget />
                
                {campaigns && campaigns.length > 0 ? (
                  <Link href="/dashboard/applications/test" className="relative overflow-hidden rounded-3xl p-8 bg-gray-900 text-white shadow-xl group flex flex-col justify-between min-h-[180px]">
                      <div className="absolute inset-0 bg-[url('/assets/images/pattern.png')] opacity-20"></div>
                      <div className="relative z-10">
                          <span className="text-[10px] font-bold bg-yellow-400 text-black px-3 py-1.5 rounded-full uppercase tracking-wide mb-3 inline-block">Evento Oficial</span>
                          <h3 className="font-bold text-2xl mt-1 leading-tight">{campaigns[0].title}</h3>
                          <p className="text-sm text-gray-300 mt-2 line-clamp-2">{campaigns[0].description || 'Participe do simulado e teste seus conhecimentos.'}</p>
                      </div>
                      <div className="relative z-10 flex items-center gap-2 mt-6 text-sm font-bold text-yellow-400 group-hover:gap-3 transition-all">
                          Participar Agora <i className="fas fa-arrow-right"></i>
                      </div>
                  </Link>
                ) : (
                  <div className="bg-white dark:bg-dark-card rounded-3xl p-8 border border-gray-100 dark:border-dark-border flex flex-col items-center justify-center text-center gap-3 min-h-[180px]">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                          <i className="fas fa-calendar-check text-xl"></i>
                      </div>
                      <div>
                          <p className="font-bold text-gray-700 dark:text-gray-300">Sem eventos ativos</p>
                          <p className="text-xs text-gray-400">Aproveite para revisar conteúdos.</p>
                      </div>
                  </div>
                )}
            </div>

            {/* ATIVIDADE RECENTE */}
            <div className="bg-white dark:bg-dark-card rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-dark-border h-fit">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-base text-dark-text dark:text-white flex items-center gap-2">
                        <i className="fas fa-history text-gray-400"></i> Histórico
                    </h3>
                    <Link href="/dashboard/profile" className="text-xs font-bold text-gray-400 hover:text-brand-purple">Ver tudo</Link>
                </div>
                
                <div className="space-y-6 relative">
                    {/* Linha do tempo */}
                    <div className="absolute left-3.5 top-3 bottom-3 w-0.5 bg-gray-100 dark:bg-gray-800"></div>
                    
                    {/* Item 1: Redação */}
                    <div className="relative pl-10">
                        <div className="absolute left-0 top-0.5 w-7 h-7 rounded-xl bg-purple-50 border-4 border-white dark:border-dark-card flex items-center justify-center text-[10px] text-brand-purple z-10 shadow-sm">
                            <i className="fas fa-pen"></i>
                        </div>
                        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                            <div className="flex justify-between items-start mb-1">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Redação</p>
                                <span className="text-[10px] text-gray-400">{latestEssay ? new Date(latestEssay.submitted_at).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}) : '--/--'}</span>
                            </div>
                            <p className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 mb-2">{latestEssay?.title || 'Nenhuma redação'}</p>
                            
                            {latestEssay ? (
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${latestEssay.final_grade ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {latestEssay.final_grade ? `Nota: ${latestEssay.final_grade}` : 'Em correção'}
                                    </span>
                                    <Link href="/dashboard/applications/write" className="text-[10px] font-bold text-brand-purple hover:underline ml-auto">Ver Detalhes</Link>
                                </div>
                            ) : (
                                <Link href="/dashboard/applications/write?action=new" className="text-xs font-bold text-brand-purple flex items-center gap-1 hover:gap-2 transition-all">Começar agora <i className="fas fa-arrow-right"></i></Link>
                            )}
                        </div>
                    </div>

                    {/* Item 2: Simulado */}
                    <div className="relative pl-10">
                        <div className="absolute left-0 top-0.5 w-7 h-7 rounded-xl bg-green-50 border-4 border-white dark:border-dark-card flex items-center justify-center text-[10px] text-brand-green z-10 shadow-sm">
                            <i className="fas fa-check"></i>
                        </div>
                        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                            <div className="flex justify-between items-start mb-1">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Simulado</p>
                                <span className="text-[10px] text-gray-400">{latestTest ? new Date(latestTest.completed_at).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}) : '--/--'}</span>
                            </div>
                            <p className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 mb-2">{latestTest?.tests?.title || 'Nenhum teste'}</p>
                            
                            {latestTest ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-lg">
                                        Acertos: {latestTest.score}%
                                    </span>
                                    <Link href="/dashboard/applications/test" className="text-[10px] font-bold text-brand-green hover:underline ml-auto">Ver Detalhes</Link>
                                </div>
                            ) : (
                                <Link href="/dashboard/applications/test" className="text-xs font-bold text-brand-green flex items-center gap-1 hover:gap-2 transition-all">Começar agora <i className="fas fa-arrow-right"></i></Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* APP BANNER */}
            <div className="rounded-3xl bg-gradient-to-br from-gray-900 to-black p-6 text-white relative overflow-hidden group cursor-pointer shadow-lg">
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform">
                    <i className="fas fa-mobile-alt text-8xl"></i>
                </div>
                <div className="relative z-10">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-3 group-hover:bg-white group-hover:text-black transition-all">
                        <i className="fas fa-download"></i>
                    </div>
                    <h3 className="font-bold text-lg mb-1">Baixe o App</h3>
                    <p className="text-xs opacity-70 mb-0">Disponível em breve para iOS e Android.</p>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

// --- ROTA PRINCIPAL ---
export default async function DashboardPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (profile?.user_category === 'administrator') redirect('/admin');

    const welcomeMessage = new Date().getHours() < 12 ? 'Bom dia,' : 'Boa tarde,';

    // ALUNO
    if (['aluno', 'vestibulando'].includes(profile?.user_category || '')) {
        const [essays, stats, tests, campaigns, posts] = await Promise.all([
            getEssaysForStudent(),
            getStudentStatistics(),
            getStudentTestDashboardData(),
            getCampaignsForStudent(),
            getLatestBlogPosts()
        ]);

        let examDate = null;
        if (profile.target_exam) {
            const { data } = await supabase.from('exam_dates').select('name, exam_date').eq('name', profile.target_exam).single();
            examDate = data;
        }

        return <StudentDashboard 
            profile={profile} 
            latestEssay={essays.data?.[0]} 
            latestTest={tests?.recentAttempts?.[0]} 
            campaigns={campaigns} 
            examDate={examDate} 
            welcomeMessage={welcomeMessage} 
            blogPosts={posts} 
            writeStats={stats.data} 
            testStats={tests} 
        />;
    } 
    
    // GESTOR/PROFESSOR
    const [pendingEssaysRes, teacherTestRes] = await Promise.all([
            getPendingEssaysForTeacher(user.id, profile.organization_id),
            getTeacherDashboardData()
    ]);
    const teacherStats = {
        pendingEssaysCount: pendingEssaysRes.data?.length || 0,
        activeTestsCount: teacherTestRes.activeTests?.length || 0,
        classesCount: teacherTestRes.classes?.length || 0
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Painel de Gestão</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Pendentes" value={teacherStats.pendingEssaysCount} subtitle="Redações a corrigir" icon="fa-pen-fancy" color={{bg: 'bg-purple-100', text: 'text-brand-purple'}} href="/dashboard/applications/write" />
                <StatCard title="Testes Ativos" value={teacherStats.activeTestsCount} subtitle="Em andamento" icon="fa-clipboard-list" color={{bg: 'bg-green-100', text: 'text-brand-green'}} href="/dashboard/applications/test" />
                <StatCard title="Turmas" value={teacherStats.classesCount} subtitle="Registradas" icon="fa-users" color={{bg: 'bg-blue-100', text: 'text-blue-600'}} href="/dashboard/applications/edu" />
            </div>
        </div>
    );
}