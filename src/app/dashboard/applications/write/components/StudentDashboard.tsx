"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
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
type CurrentEvent = { id: string; title: string; summary: string | null; link: string };

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

// --- COMPONENTES DE UI AUXILIARES ---

const GradientText = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <span className={`text-transparent bg-clip-text bg-gradient-to-r from-[#42047e] to-[#07f49e] ${className}`}>
        {children}
    </span>
);

const LevelBadge = ({ count }: { count: number }) => {
    let level = "Iniciante";
    let color = "bg-gray-100 text-gray-600";
    let nextLevel = 5;

    if (count >= 5) { level = "Praticante"; color = "bg-blue-100 text-blue-700"; nextLevel = 15; }
    if (count >= 15) { level = "Escritor"; color = "bg-purple-100 text-purple-700"; nextLevel = 30; }
    if (count >= 30) { level = "Mestre da Caneta"; color = "bg-teal-100 text-teal-700"; nextLevel = 50; }
    if (count >= 50) { level = "Nota 1000"; color = "bg-yellow-100 text-yellow-700"; nextLevel = 100; }

    const progress = Math.min(100, (count / nextLevel) * 100);

    return (
        <div className="flex flex-col gap-1 w-full max-w-[150px]">
            <div className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit ${color}`}>
                Nível: {level}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                <div className="bg-gradient-to-r from-[#42047e] to-[#07f49e] h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-[10px] text-gray-400 text-right">{count}/{nextLevel} para upar</p>
        </div>
    );
};

const StatCard = ({ title, value, icon, subtitle, color = "purple" }: { title: string, value: string | number, icon: string, subtitle?: string, color?: "purple" | "teal" | "blue" }) => {
    const iconColors = {
        purple: "bg-purple-100 text-[#42047e] dark:bg-purple-900/30 dark:text-purple-300",
        teal: "bg-teal-100 text-[#07f49e] dark:bg-teal-900/30 dark:text-teal-300",
        blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
    };

    return (
        <div className="bg-white dark:bg-dark-card p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border flex items-center gap-4 hover:shadow-md transition-shadow duration-300">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${iconColors[color]}`}>
                <i className={`fas ${icon}`}></i>
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
                <h4 className="text-2xl font-black text-dark-text dark:text-white">{value}</h4>
                {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
            </div>
        </div>
    );
};

const ActionShortcut = ({ href, icon, title, description }: { href: string, icon: string, title: string, description: string }) => (
    <Link href={href} className="group flex items-center gap-4 p-4 bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border hover:border-[#42047e] dark:hover:border-[#07f49e] transition-all shadow-sm hover:shadow-md">
        <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-[#42047e] dark:text-[#07f49e] group-hover:scale-110 transition-transform">
            <i className={`fas ${icon}`}></i>
        </div>
        <div>
            <p className="font-bold text-sm text-dark-text dark:text-white group-hover:text-[#42047e] dark:group-hover:text-[#07f49e] transition-colors">{title}</p>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
        <i className="fas fa-chevron-right ml-auto text-gray-300 group-hover:text-[#42047e] transition-colors"></i>
    </Link>
);

// --- COMPONENTE PRINCIPAL ---

export default function StudentDashboard({ initialEssays, prompts, statistics, streak, rankInfo, frequentErrors, currentEvents, targetExam, examDate }: Props) {
  const [essays, setEssays] = useState(initialEssays);
  const [view, setView] = useState<'dashboard' | 'edit' | 'view_correction'>('dashboard');
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'analytics'>('overview');
  const [currentEssay, setCurrentEssay] = useState<Partial<Essay> | null>(null);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const searchParams = useSearchParams();

  // Busca Planos de Ação
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

  // Verifica URL para abrir redação específica
  useEffect(() => {
    const essayIdFromUrl = searchParams.get('essayId');
    if (essayIdFromUrl) {
      const essayToOpen = initialEssays.find(e => e.id === essayIdFromUrl);
      if (essayToOpen) {
        handleSelectEssay(essayToOpen);
      }
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

  // Função auxiliar para cor da nota
  const getGradeColor = (grade: number) => {
      if (grade >= 900) return "text-[#07f49e]"; // Verde neon da marca
      if (grade >= 800) return "text-green-500";
      if (grade >= 600) return "text-blue-500";
      if (grade >= 400) return "text-yellow-500";
      return "text-red-500";
  };

  // --- RENDERIZAÇÃO DAS VIEWS DE EDIÇÃO/CORREÇÃO ---
  if (view === 'edit') return <EssayEditor essay={currentEssay} prompts={prompts} onBack={handleBackToDashboard} />;
  if (view === 'view_correction' && currentEssay?.id) return <EssayCorrectionView essayId={currentEssay.id} onBack={handleBackToDashboard} />;

  // --- RENDERIZAÇÃO DO DASHBOARD PRINCIPAL ---
  return (
    <div className="space-y-8 animate-fade-in-right">
        
       {/* 1. HEADER & BOAS VINDAS */}
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
            <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-[#42047e] to-[#07f49e] w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
                    <i className="fas fa-pen-nib"></i>
                </div>
                <div>
                    <h1 className="text-2xl font-black text-dark-text dark:text-white">
                        Painel de <GradientText>Redação</GradientText>
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Acompanhe sua evolução e pratique constantemente.</p>
                </div>
            </div>
            
            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <LevelBadge count={essays.length} />
                <button 
                    onClick={handleCreateNew} 
                    className="bg-gradient-to-r from-[#42047e] to-[#5e55f9] hover:from-[#360368] hover:to-[#4b44d4] text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
                >
                    <i className="fas fa-plus"></i> Nova Redação
                </button>
            </div>
      </header>

      {/* 2. ABAS DE NAVEGAÇÃO */}
      <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {['overview', 'history', 'analytics'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`
                        whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-colors
                        ${activeTab === tab 
                            ? 'border-[#42047e] text-[#42047e] dark:text-[#07f49e] dark:border-[#07f49e]' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                        }
                    `}
                >
                    {tab === 'overview' && <><i className="fas fa-home mr-2"></i>Visão Geral</>}
                    {tab === 'history' && <><i className="fas fa-history mr-2"></i>Histórico</>}
                    {tab === 'analytics' && <><i className="fas fa-chart-pie mr-2"></i>Desempenho</>}
                </button>
            ))}
          </nav>
      </div>

      {/* 3. CONTEÚDO DA ABA: VISÃO GERAL */}
      {activeTab === 'overview' && (
          <div className="space-y-8">
                {/* Quick Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard 
                        title="Sequência (Streak)" 
                        value={streak} 
                        subtitle={streak === 1 ? "dia seguido" : "dias seguidos"} 
                        icon="fa-fire" 
                        color="purple" 
                    />
                    <StatCard 
                        title="Média Geral" 
                        value={statistics?.averages.avg_final_grade.toFixed(0) || '-'} 
                        subtitle="últimas correções" 
                        icon="fa-chart-line" 
                        color="teal" 
                    />
                    <StatCard 
                        title="Ranking (Estado)" 
                        value={rankInfo?.rank ? `#${rankInfo.rank}` : '-'} 
                        subtitle={rankInfo?.state || 'Brasil'} 
                        icon="fa-trophy" 
                        color="blue" 
                    />
                    <div className="bg-gradient-to-br from-[#42047e] to-[#07f49e] p-0.5 rounded-2xl shadow-sm">
                        <div className="bg-white dark:bg-dark-card rounded-[14px] h-full p-4 flex flex-col justify-center items-center text-center relative overflow-hidden">
                             {/* Countdown Mini Widget */}
                             <p className="text-xs font-bold text-gray-500 dark:text-gray-300 mb-1 uppercase tracking-wider">Foco no Objetivo</p>
                             <div className="scale-90">
                                <CountdownWidget targetExam={targetExam} examDate={examDate} />
                             </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Coluna Principal: Ações e Notícias */}
                    <div className="lg:col-span-2 space-y-8">
                         {/* Atalhos */}
                         <div>
                            <h3 className="font-bold text-lg mb-4 text-dark-text dark:text-white">O que você quer fazer hoje?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ActionShortcut 
                                    href="/dashboard/applications/test" 
                                    icon="fa-spell-check" 
                                    title="Praticar Gramática" 
                                    description="Faça testes rápidos de português."
                                />
                                <ActionShortcut 
                                    href="/dashboard/applications/library" 
                                    icon="fa-book-open" 
                                    title="Explorar Repertórios" 
                                    description="Leia citações e alusões históricas."
                                />
                            </div>
                         </div>

                         {/* Notícias */}
                         <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg text-dark-text dark:text-white">Atualidades & Notícias</h3>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md">Em alta</span>
                            </div>
                            {currentEvents.length > 0 ? (
                                <div className="space-y-4">
                                    {currentEvents.slice(0, 3).map(event => (
                                        <a href={event.link} target="_blank" rel="noopener noreferrer" key={event.id} className="flex gap-4 group">
                                            <div className="min-w-[4px] rounded-full bg-gray-200 group-hover:bg-[#07f49e] transition-colors"></div>
                                            <div>
                                                <h4 className="font-bold text-sm text-dark-text dark:text-white group-hover:text-royal-blue transition-colors">{event.title}</h4>
                                                {event.summary && <p className="text-xs text-gray-500 line-clamp-2 mt-1">{event.summary}</p>}
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400">Nenhuma notícia no momento.</p>
                            )}
                         </div>
                    </div>

                    {/* Coluna Lateral: Últimas Redações (Mini) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border h-full">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg text-dark-text dark:text-white">Recentes</h3>
                                <button onClick={() => setActiveTab('history')} className="text-xs font-bold text-[#42047e] hover:underline">Ver todas</button>
                            </div>
                            
                            {essays.length > 0 ? (
                                <div className="space-y-3">
                                    {essays.slice(0, 4).map(essay => (
                                        <div key={essay.id} onClick={() => handleSelectEssay(essay)} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-sm text-dark-text dark:text-white line-clamp-1 group-hover:text-[#42047e] transition-colors">{essay.title || "Sem título"}</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                                        {essay.submitted_at ? new Date(essay.submitted_at).toLocaleDateString('pt-BR') : 'Rascunho'}
                                                    </p>
                                                </div>
                                                {/* CORREÇÃO VISUAL DA NOTA */}
                                                {essay.status === 'corrected' && essay.final_grade !== undefined && essay.final_grade !== null ? (
                                                    <span className={`font-black text-sm ${getGradeColor(essay.final_grade)}`}>
                                                        {essay.final_grade}
                                                    </span>
                                                ) : (
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                                        essay.status === 'submitted' 
                                                            ? 'bg-yellow-50 text-yellow-600 border-yellow-200' 
                                                            : 'bg-gray-100 text-gray-500 border-gray-200'
                                                    }`}>
                                                        {essay.status === 'submitted' ? 'Análise' : 'Editando'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                                        <i className="fas fa-feather"></i>
                                    </div>
                                    <p className="text-sm text-gray-500">Nenhuma redação ainda.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
          </div>
      )}

      {/* 4. CONTEÚDO DA ABA: HISTÓRICO */}
      {activeTab === 'history' && (
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden animate-fade-in-right">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Título / Tema</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Nota</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Data de Envio</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {essays.length > 0 ? essays.map((essay) => (
                            <tr key={essay.id} onClick={() => handleSelectEssay(essay)} className="hover:bg-blue-50/50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-sm text-gray-800 dark:text-white group-hover:text-[#42047e] transition-colors">{essay.title || "Sem título"}</p>
                                    <p className="text-xs text-gray-400 truncate max-w-[200px] mt-1">ID: {essay.id.substring(0, 8)}...</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                        essay.status === 'corrected' 
                                            ? 'bg-green-50 text-green-700 border-green-200' 
                                            : essay.status === 'submitted' 
                                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                                                : 'bg-gray-100 text-gray-600 border-gray-200'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                            essay.status === 'corrected' ? 'bg-green-500' : essay.status === 'submitted' ? 'bg-yellow-500' : 'bg-gray-400'
                                        }`}></span>
                                        {essay.status === 'corrected' ? 'Corrigida' : essay.status === 'submitted' ? 'Em Correção' : 'Rascunho'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {/* CORREÇÃO AQUI: Exibe a nota real ou traço */}
                                    {essay.status === 'corrected' && essay.final_grade !== undefined && essay.final_grade !== null ? (
                                        <span className={`text-lg font-black ${getGradeColor(essay.final_grade)}`}>
                                            {essay.final_grade}
                                        </span>
                                    ) : (
                                        <span className="text-gray-300 font-bold text-lg">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {essay.submitted_at ? new Date(essay.submitted_at).toLocaleDateString('pt-BR') : <span className="italic text-gray-400">Não enviado</span>}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-400 hover:text-[#42047e] dark:hover:text-white transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    Você ainda não possui redações no histórico.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
              </div>
          </div>
      )}

      {/* 5. CONTEÚDO DA ABA: ESTATÍSTICAS */}
      {activeTab === 'analytics' && (
           <div className="animate-fade-in-right grid grid-cols-1 lg:grid-cols-3 gap-8">
                {statistics ? (
                    <>
                        <div className="lg:col-span-2 bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
                            <ProgressionChart data={statistics.progression} actionPlans={actionPlans} />
                        </div>
                        <div className="lg:col-span-1 bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
                            <StatisticsWidget stats={statistics} frequentErrors={frequentErrors}/>
                        </div>
                    </>
                ) : (
                    <div className="lg:col-span-3 bg-white dark:bg-dark-card p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border text-center">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <i className="fas fa-chart-bar text-4xl"></i>
                        </div>
                        <h3 className="text-xl font-bold text-dark-text dark:text-white mb-2">Dados Insuficientes</h3>
                        <p className="text-gray-500 max-w-md mx-auto">Precisamos de pelo menos uma redação corrigida para gerar seus relatórios de desempenho e gráficos de evolução.</p>
                    </div>
                )}
           </div>
      )}
    </div>
  );
}