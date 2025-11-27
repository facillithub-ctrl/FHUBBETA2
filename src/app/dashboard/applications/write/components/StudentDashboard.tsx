"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Essay, EssayPrompt, getEssaysForStudent, getUserActionPlans, ActionPlan } from '../actions';
import EssayEditor from './EssayEditor';
import EssayCorrectionView from './EssayCorrectionView';
import StatisticsWidget from './StatisticsWidget';
import ProgressionChart from './ProgressionChart';
import CountdownWidget from '@/components/dashboard/CountdownWidget';

// --- TIPOS ---
type Stats = {
    totalCorrections: number;
    averages: { avg_final_grade: number; avg_c1: number; avg_c2: number; avg_c3: number; avg_c4: number; avg_c5: number; };
    pointToImprove: { name: string; average: number; };
    progression: { date: string; grade: number; }[];
} | null;

type RankInfo = { rank: number | null; state: string | null; } | null;
type FrequentError = { error_type: string; count: number };
type CurrentEvent = { id: string; title: string; summary: string | null; link: string; type?: 'news' | 'notice' | 'blog' };

type Props = {
  initialEssays: Partial<Essay>[];
  prompts: EssayPrompt[];
  statistics: Stats;
  streak: number;
  rankInfo: RankInfo;
  frequentErrors: FrequentError[];
  currentEvents: CurrentEvent[];
  targetExam: string | null | undefined;
  examDate: string | null | undefined;
};

// --- COMPONENTES DE UI ---

const GradientText = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <span className={`text-transparent bg-clip-text bg-gradient-to-r from-[#42047e] to-[#07f49e] ${className}`}>
        {children}
    </span>
);

// Componente de Card do Ecossistema (Novo)
const EcosystemCard = ({ moduleName, icon, colorFrom, colorTo, actions }: { moduleName: string, icon: string, colorFrom: string, colorTo: string, actions: { label: string, href: string, icon: string }[] }) => (
    <div className="bg-white dark:bg-dark-card rounded-2xl p-1 border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-md transition-all group h-full flex flex-col">
        <div className={`bg-gradient-to-r ${colorFrom} ${colorTo} p-4 rounded-xl text-white mb-2`}>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm w-10 h-10 flex items-center justify-center">
                        <i className={`fas ${icon}`}></i>
                    </div>
                    <span className="font-bold text-md">{moduleName}</span>
                </div>
            </div>
        </div>
        <div className="p-2 space-y-1 flex-1">
            {actions.map((action, idx) => (
                <Link key={idx} href={action.href} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm text-gray-600 dark:text-gray-300 group/item">
                    <div className="flex items-center gap-3">
                        <div className="w-6 flex justify-center">
                            <i className={`fas ${action.icon} text-gray-400 group-hover/item:text-[#42047e] transition-colors`}></i>
                        </div>
                        <span className="font-medium">{action.label}</span>
                    </div>
                    <i className="fas fa-chevron-right text-[10px] text-gray-300 group-hover/item:text-[#42047e]"></i>
                </Link>
            ))}
        </div>
    </div>
);

const NewsCard = ({ event }: { event: CurrentEvent }) => {
    const isExternal = event.link.startsWith('http');
    const icon = event.type === 'notice' ? 'fa-bell' : event.type === 'blog' ? 'fa-rss' : 'fa-newspaper';
    
    return (
        <a href={event.link} target={isExternal ? "_blank" : "_self"} rel="noopener noreferrer" className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700 group">
            <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#42047e]/10 text-[#42047e] dark:bg-[#07f49e]/10 dark:text-[#07f49e] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i className={`fas ${icon}`}></i>
                </div>
            </div>
            <div className="flex-1">
                <h5 className="font-bold text-sm text-dark-text dark:text-white group-hover:text-[#42047e] dark:group-hover:text-[#07f49e] transition-colors flex items-center gap-2">
                    {event.title}
                    {isExternal && <i className="fas fa-external-link-alt text-[10px] text-gray-400"></i>}
                </h5>
                {event.summary && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{event.summary}</p>}
            </div>
        </a>
    );
};

// --- DASHBOARD PRINCIPAL ---

export default function StudentDashboard({ initialEssays, prompts, statistics, streak, rankInfo, frequentErrors, currentEvents, targetExam, examDate }: Props) {
  const [essays, setEssays] = useState(initialEssays);
  const [view, setView] = useState<'dashboard' | 'edit' | 'view_correction'>('dashboard');
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'analytics'>('overview');
  const [currentEssay, setCurrentEssay] = useState<Partial<Essay> | null>(null);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const searchParams = useSearchParams();

  // Busca Planos de Ação IA
  useEffect(() => {
      const fetchActionPlans = async () => {
          const res = await getUserActionPlans();
          if (res.data) setActionPlans(res.data);
      };
      fetchActionPlans();
  }, []);

  const handleSelectEssay = useCallback((essay: Partial<Essay>) => {
    setCurrentEssay(essay);
    setView(essay.status === 'corrected' ? 'view_correction' : 'edit');
  }, []);

  useEffect(() => {
    const essayIdFromUrl = searchParams.get('essayId');
    if (essayIdFromUrl) {
      const essayToOpen = initialEssays.find(e => e.id === essayIdFromUrl);
      if (essayToOpen) handleSelectEssay(essayToOpen);
    }
  }, [searchParams, initialEssays, handleSelectEssay]);

  const handleCreateNew = () => {
    setCurrentEssay(null);
    setView('edit');
  };

  const handleBackToDashboard = async () => {
    const result = await getEssaysForStudent();
    if (result.data) setEssays(result.data);
    setView('dashboard');
    setCurrentEssay(null);
    window.history.pushState({}, '', '/dashboard/applications/write');
  };

  const getGradeColor = (grade: number) => {
      if (grade >= 900) return "text-[#07f49e]"; 
      if (grade >= 800) return "text-green-500";
      if (grade >= 600) return "text-blue-500";
      if (grade >= 400) return "text-yellow-500";
      return "text-red-500";
  };

  if (view === 'edit') return <EssayEditor essay={currentEssay} prompts={prompts} onBack={handleBackToDashboard} />;
  if (view === 'view_correction' && currentEssay?.id) return <EssayCorrectionView essayId={currentEssay.id} onBack={handleBackToDashboard} />;

  return (
    <div className="space-y-8 animate-fade-in-right pb-10">
        
       {/* HEADER */}
       <header className="relative bg-white dark:bg-dark-card p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-dark-border overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#42047e]/10 to-[#07f49e]/10 rounded-bl-full pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#42047e] to-[#07f49e] p-0.5 shadow-xl flex-shrink-0">
                        <div className="w-full h-full bg-white dark:bg-dark-card rounded-[14px] flex items-center justify-center">
                             <i className="fas fa-pen-nib text-2xl text-[#42047e] dark:text-[#07f49e]"></i>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-dark-text dark:text-white">
                            Facillit <GradientText>Write</GradientText>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Seu laboratório de produção textual inteligente.</p>
                    </div>
                </div>
                
                <button 
                    onClick={handleCreateNew} 
                    className="bg-[#42047e] hover:bg-[#360368] text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
                >
                    <i className="fas fa-plus"></i> Nova Redação
                </button>
            </div>
      </header>

      {/* NAVEGAÇÃO POR ABAS */}
      <div className="flex flex-wrap justify-center md:justify-start gap-2 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-xl w-fit mx-auto md:mx-0">
          {['overview', 'history', 'analytics'].map((tab) => (
              <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                      activeTab === tab 
                      ? 'bg-white dark:bg-dark-card text-[#42047e] dark:text-[#07f49e] shadow-md' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                  }`}
              >
                  <i className={`fas ${tab === 'overview' ? 'fa-layer-group' : tab === 'history' ? 'fa-history' : 'fa-chart-pie'}`}></i>
                  {tab === 'overview' ? 'Visão Geral' : tab === 'history' ? 'Minhas Correções' : 'Estatísticas'}
              </button>
          ))}
      </div>

      {/* === ABA: VISÃO GERAL === */}
      {activeTab === 'overview' && (
          <div className="space-y-8">
                {/* 1. Cartões de Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="bg-white dark:bg-dark-card p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-[#42047e] dark:text-purple-300">
                                <i className="fas fa-fire text-xl"></i>
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase">Sequência</span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-dark-text dark:text-white">{streak}</h3>
                            <p className="text-sm text-gray-500">dias escrevendo</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-card p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-[#07f49e] dark:text-teal-300">
                                <i className="fas fa-chart-line text-xl"></i>
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase">Média Geral</span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-dark-text dark:text-white">
                                {statistics?.averages.avg_final_grade.toFixed(0) || '-'}
                            </h3>
                            <p className="text-sm text-gray-500">pontos</p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#42047e] to-[#07f49e] p-5 rounded-2xl shadow-lg text-white flex flex-col justify-between h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <i className="fas fa-trophy text-xl"></i>
                                </div>
                                <span className="text-xs font-bold text-white/80 uppercase">Ranking</span>
                            </div>
                            <div>
                                <h3 className="text-3xl font-black">#{rankInfo?.rank || '-'}</h3>
                                <p className="text-sm text-white/80">{rankInfo?.state || 'Regional'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-card p-1 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border h-full">
                         <div className="h-full flex flex-col justify-center items-center p-4">
                            <CountdownWidget targetExam={targetExam} examDate={examDate} />
                         </div>
                    </div>
                </div>

                {/* 2. Ecossistema Facillit */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-6 bg-[#42047e] rounded-full"></div>
                        <h3 className="font-bold text-xl text-dark-text dark:text-white">Ecossistema Integrado</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <EcosystemCard 
                            moduleName="Facillit Write" 
                            icon="fa-pen-nib" 
                            colorFrom="from-[#42047e]" 
                            colorTo="to-[#07f49e]"
                            actions={[
                                { label: "Nova Redação", href: "/dashboard/applications/write?action=new", icon: "fa-plus" },
                                { label: "Histórico", href: "/dashboard/applications/write?tab=history", icon: "fa-history" },
                                { label: "Temas da Semana", href: "/dashboard/applications/write/prompts", icon: "fa-lightbulb" }
                            ]}
                        />

                        <EcosystemCard 
                            moduleName="Facillit Test" 
                            icon="fa-check-double" 
                            colorFrom="from-pink-500" 
                            colorTo="to-rose-500"
                            actions={[
                                { label: "Simulado Rápido", href: "/dashboard/applications/test?mode=quick", icon: "fa-stopwatch" },
                                { label: "Teste de Gramática", href: "/dashboard/applications/test?topic=grammar", icon: "fa-spell-check" },
                                { label: "Questões de Crase", href: "/dashboard/applications/test?tag=crase", icon: "fa-align-left" }
                            ]}
                        />

                        <EcosystemCard 
                            moduleName="Facillit Library" 
                            icon="fa-book" 
                            colorFrom="from-blue-500" 
                            colorTo="to-cyan-500"
                            actions={[
                                { label: "Citações", href: "/dashboard/applications/library?cat=quotes", icon: "fa-quote-left" },
                                { label: "Alusões Históricas", href: "/dashboard/applications/library?cat=history", icon: "fa-landmark" },
                                { label: "Constituição", href: "/dashboard/applications/library?cat=law", icon: "fa-balance-scale" }
                            ]}
                        />

                        <EcosystemCard 
                            moduleName="Facillit Edu" 
                            icon="fa-graduation-cap" 
                            colorFrom="from-orange-500" 
                            colorTo="to-amber-500"
                            actions={[
                                { label: "Minhas Aulas", href: "/dashboard/applications/edu", icon: "fa-video" },
                                { label: "Tarefas", href: "/dashboard/applications/edu/tasks", icon: "fa-tasks" },
                                { label: "Tira-Dúvidas", href: "/dashboard/applications/edu/forum", icon: "fa-question-circle" }
                            ]}
                        />
                    </div>
                </div>

                {/* 3. Gráficos e Notícias */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-dark-text dark:text-white">Sua Evolução</h3>
                            <button 
                                onClick={() => setActiveTab('analytics')} 
                                className="text-xs font-bold text-[#42047e] bg-purple-50 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors"
                            >
                                Ver Detalhes
                            </button>
                        </div>
                        <div className="h-64">
                             {statistics ? (
                                 <ProgressionChart data={statistics.progression} actionPlans={actionPlans} />
                             ) : (
                                 <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                     Envie redações para visualizar seu progresso.
                                 </div>
                             )}
                        </div>
                    </div>
                    
                    <div className="lg:col-span-1 bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#07f49e] animate-pulse"></div>
                                <h3 className="font-bold text-lg text-dark-text dark:text-white">Atualidades</h3>
                            </div>
                            <Link href="/news" className="text-xs text-gray-400 hover:text-[#42047e]">Ver tudo</Link>
                        </div>
                        
                        <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px] pr-1 custom-scrollbar">
                            {currentEvents.length > 0 ? (
                                currentEvents.map((event) => (
                                    <NewsCard key={event.id} event={event} />
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <i className="fas fa-newspaper text-2xl mb-2"></i>
                                    <p className="text-sm">Sem notícias recentes.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
          </div>
      )}

      {/* === ABA: MINHAS CORREÇÕES === */}
      {activeTab === 'history' && (
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg border border-gray-100 dark:border-dark-border overflow-hidden animate-fade-in-right">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center">
                  <h2 className="font-bold text-lg text-dark-text dark:text-white">Histórico de Redações</h2>
                  <span className="bg-white dark:bg-gray-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm text-gray-600 dark:text-gray-300">
                      Total: {essays.length}
                  </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 font-bold tracking-wider border-b border-gray-100 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-4">Tema da Redação</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-center">Nota Final</th>
                            <th className="px-6 py-4">Data de Envio</th>
                            <th className="px-6 py-4 text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                        {essays.length > 0 ? essays.map((essay) => (
                            <tr key={essay.id} onClick={() => handleSelectEssay(essay)} className="group hover:bg-blue-50/30 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 group-hover:bg-[#42047e] group-hover:text-white transition-colors flex-shrink-0">
                                            <i className="fas fa-file-alt"></i>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 dark:text-white group-hover:text-[#42047e] dark:group-hover:text-[#07f49e] transition-colors line-clamp-1">
                                                {essay.title || "Redação sem título"}
                                            </p>
                                            {/* FIX DO ERRO DE BUILD: Tratamento de undefined */}
                                            <p className="text-xs text-gray-400 font-mono mt-0.5">
                                                ID: {(essay.id || '').substring(0, 8)}...
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {essay.status === 'corrected' ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                            <i className="fas fa-check-circle"></i> Corrigida
                                        </span>
                                    ) : essay.status === 'submitted' ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                                            <i className="fas fa-clock"></i> Em Análise
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                            <i className="fas fa-pen"></i> Rascunho
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {essay.status === 'corrected' && essay.final_grade !== undefined && essay.final_grade !== null ? (
                                        <div className={`text-lg font-black ${getGradeColor(essay.final_grade)}`}>
                                            {essay.final_grade}
                                        </div>
                                    ) : (
                                        <span className="text-gray-300 font-bold text-xl">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {essay.submitted_at ? new Date(essay.submitted_at).toLocaleDateString('pt-BR') : '-'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-[#42047e] hover:text-white dark:hover:bg-[#07f49e] dark:hover:text-black transition-all flex items-center justify-center text-gray-400 ml-auto">
                                        <i className="fas fa-chevron-right text-xs"></i>
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i className="fas fa-inbox text-2xl text-gray-400"></i>
                                    </div>
                                    <p className="text-gray-500 font-medium">Você ainda não enviou nenhuma redação.</p>
                                    <p className="text-sm text-gray-400 mb-4">Comece a praticar hoje mesmo!</p>
                                    <button onClick={handleCreateNew} className="text-[#42047e] font-bold hover:underline text-sm">Escrever primeira redação</button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
              </div>
          </div>
      )}

      {/* === ABA: ESTATÍSTICAS === */}
      {activeTab === 'analytics' && (
           <div className="animate-fade-in-right">
                {statistics ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
                            <h3 className="font-bold text-lg mb-6 text-dark-text dark:text-white">Análise Detalhada de Evolução</h3>
                            <div className="h-80">
                                <ProgressionChart data={statistics.progression} actionPlans={actionPlans} />
                            </div>
                        </div>
                        <div className="lg:col-span-1 bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
                            <StatisticsWidget stats={statistics} frequentErrors={frequentErrors}/>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border text-center px-4">
                        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <i className="fas fa-chart-pie text-3xl text-blue-400"></i>
                        </div>
                        <h3 className="text-xl font-bold text-dark-text dark:text-white mb-2">Coletando Dados</h3>
                        <p className="text-gray-500 max-w-md">
                            Envie e receba correções de redações para desbloquear seu painel de inteligência analítica.
                        </p>
                    </div>
                )}
           </div>
      )}
    </div>
  );
}