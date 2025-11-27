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

const ModuleShortcut = ({ icon, name, description, href, color }: { icon: string, name: string, description: string, href: string, color: string }) => (
    <Link href={href} className="group relative overflow-hidden bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
        <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${color} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150`}></div>
        <div className="flex items-center gap-4 relative z-10">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg`}>
                <i className={`fas ${icon} text-lg`}></i>
            </div>
            <div>
                <h4 className="font-bold text-dark-text dark:text-white text-sm">{name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{description}</p>
            </div>
        </div>
    </Link>
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
                <h5 className="font-bold text-sm text-dark-text dark:text-white group-hover:text-[#42047e] dark:group-hover:text-[#07f49e] transition-colors">
                    {event.title}
                    {isExternal && <i className="fas fa-external-link-alt text-[10px] ml-2 text-gray-400"></i>}
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
        
       {/* HEADER: Identidade Facillit Hub */}
       <header className="relative bg-white dark:bg-dark-card p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-dark-border overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#42047e]/10 to-[#07f49e]/10 rounded-bl-full pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#42047e] to-[#07f49e] p-0.5 shadow-xl">
                        <div className="w-full h-full bg-white dark:bg-dark-card rounded-[14px] flex items-center justify-center">
                             <Image src="/assets/images/marcas/Write.png" alt="Logo Write" width={40} height={40} className="object-contain" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-dark-text dark:text-white">
                            Facillit <GradientText>Write</GradientText>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Seu laboratório de produção textual inteligente.</p>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <button 
                        onClick={handleCreateNew} 
                        className="bg-[#42047e] hover:bg-[#360368] text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                    >
                        <i className="fas fa-plus"></i> Nova Redação
                    </button>
                </div>
            </div>
      </header>

      {/* NAVEGAÇÃO POR ABAS */}
      <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-xl w-fit mx-auto md:mx-0">
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
                {/* Cartões de Status */}
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Coluna Principal */}
                    <div className="lg:col-span-2 space-y-8">
                         {/* Atalhos de Integração */}
                         <div>
                            <div className="flex items-center gap-2 mb-4">
                                <i className="fas fa-cubes text-[#42047e] dark:text-[#07f49e]"></i>
                                <h3 className="font-bold text-lg text-dark-text dark:text-white">Ecossistema Facillit</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <ModuleShortcut 
                                    icon="fa-spell-check" 
                                    name="Facillit Test" 
                                    description="Simulados e gramática" 
                                    href="/dashboard/applications/test"
                                    color="from-pink-500 to-rose-500"
                                />
                                <ModuleShortcut 
                                    icon="fa-book-open" 
                                    name="Facillit Library" 
                                    description="Repertório sociocultural" 
                                    href="/dashboard/applications/library"
                                    color="from-blue-500 to-cyan-500"
                                />
                                <ModuleShortcut 
                                    icon="fa-calendar-day" 
                                    name="Facillit Day" 
                                    description="Organize seus estudos" 
                                    href="/dashboard/applications/day"
                                    color="from-purple-500 to-indigo-500"
                                />
                                 <ModuleShortcut 
                                    icon="fa-graduation-cap" 
                                    name="Facillit Edu" 
                                    description="Aulas e tarefas" 
                                    href="/dashboard/applications/edu"
                                    color="from-orange-500 to-amber-500"
                                />
                            </div>
                         </div>

                         {/* Gráfico Rápido */}
                         <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
                            <h3 className="font-bold text-lg text-dark-text dark:text-white mb-4">Sua Evolução</h3>
                            <div className="h-64">
                                {statistics ? (
                                    <ProgressionChart data={statistics.progression} actionPlans={actionPlans} />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400">
                                        Sem dados suficientes para o gráfico.
                                    </div>
                                )}
                            </div>
                         </div>
                    </div>

                    {/* Coluna Lateral */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Atualidades e Notícias */}
                        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border h-full flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#07f49e] animate-pulse"></div>
                                    <h3 className="font-bold text-lg text-dark-text dark:text-white">Atualidades</h3>
                                </div>
                                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-500">Feed</span>
                            </div>
                            
                            <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                                {currentEvents.length > 0 ? (
                                    currentEvents.map((event) => (
                                        <NewsCard key={event.id} event={event} />
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <i className="fas fa-newspaper text-gray-300 text-3xl mb-3"></i>
                                        <p className="text-sm text-gray-500">Nenhuma atualização recente.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
          </div>
      )}

      {/* === ABA: MINHAS CORREÇÕES (HISTÓRICO) === */}
      {activeTab === 'history' && (
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg border border-gray-100 dark:border-dark-border overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center">
                  <h2 className="font-bold text-lg text-dark-text dark:text-white">Histórico de Redações</h2>
                  <span className="bg-white dark:bg-gray-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                      Total: {essays.length}
                  </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Tema da Redação</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-center">Nota Final</th>
                            <th className="px-6 py-4">Data</th>
                            <th className="px-6 py-4 text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {essays.length > 0 ? essays.map((essay) => (
                            <tr key={essay.id} onClick={() => handleSelectEssay(essay)} className="group hover:bg-blue-50/30 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 group-hover:bg-[#42047e] group-hover:text-white transition-colors">
                                            <i className="fas fa-file-alt"></i>
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-800 dark:text-white group-hover:text-[#42047e] dark:group-hover:text-[#07f49e] transition-colors">
                                                {essay.title || "Redação sem título"}
                                            </p>
                                            {/* CORREÇÃO DO ERRO DE BUILD AQUI */}
                                            <p className="text-xs text-gray-400 font-mono mt-0.5">
                                                ID: {(essay.id || '').substring(0, 8)}...
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {essay.status === 'corrected' ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                            <i className="fas fa-check-circle"></i> Corrigida
                                        </span>
                                    ) : essay.status === 'submitted' ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                                            <i className="fas fa-clock"></i> Em Análise
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                            <i className="fas fa-pen"></i> Rascunho
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {essay.status === 'corrected' && essay.final_grade !== undefined && essay.final_grade !== null ? (
                                        <div className={`text-xl font-black ${getGradeColor(essay.final_grade)}`}>
                                            {essay.final_grade}
                                        </div>
                                    ) : (
                                        <span className="text-gray-300 text-2xl font-bold">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {essay.submitted_at ? new Date(essay.submitted_at).toLocaleDateString('pt-BR') : '-'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-[#42047e] hover:text-white dark:hover:bg-[#07f49e] dark:hover:text-black transition-all flex items-center justify-center text-gray-400">
                                        <i className="fas fa-arrow-right text-sm"></i>
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i className="fas fa-inbox text-2xl text-gray-400"></i>
                                    </div>
                                    <p className="text-gray-500">Você ainda não enviou nenhuma redação.</p>
                                    <button onClick={handleCreateNew} className="mt-4 text-[#42047e] font-bold hover:underline">Começar agora</button>
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
                            <h3 className="font-bold text-lg mb-6 text-dark-text dark:text-white">Análise de Evolução</h3>
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