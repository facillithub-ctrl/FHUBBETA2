"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Essay, EssayPrompt, getEssaysForStudent, SavedStudyPlan, getStudentStudyPlans } from '../actions';
import EssayEditor from './EssayEditor';
import EssayCorrectionView from './EssayCorrectionView';
import StatisticsWidget from './StatisticsWidget';
import ProgressionChart from './ProgressionChart';
import CountdownWidget from '@/components/dashboard/CountdownWidget';

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

const StatCard = ({ title, value, icon, valueDescription }: { title: string, value: string | number, icon: string, valueDescription?: string }) => (
  <div className="glass-card p-4 flex items-center justify-between h-full shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-dark-card">
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
      <p className="text-2xl font-bold text-dark-text dark:text-white mt-1">
        {value} <span className="text-sm font-normal text-gray-400">{valueDescription}</span>
      </p>
    </div>
    <div className="text-3xl text-royal-blue/80 bg-royal-blue/10 p-3 rounded-full">
      <i className={`fas ${icon}`}></i>
    </div>
  </div>
);

const ActionShortcuts = () => (
    <div className="glass-card p-6 h-full bg-white dark:bg-dark-card shadow-sm">
        <h3 className="font-bold mb-4 text-lg dark:text-white">Atalhos Rápidos</h3>
        <div className="space-y-3">
            <Link href="/dashboard/applications/test" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                <div className="bg-green-100 text-green-600 w-10 h-10 flex items-center justify-center rounded-full"><i className="fas fa-spell-check"></i></div>
                <div><span className="block font-semibold text-sm text-gray-800 dark:text-white">Testar Gramática</span><span className="text-xs text-gray-500">Quiz rápido</span></div>
            </Link>
             <Link href="/dashboard/applications/day" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                 <div className="bg-purple-100 text-purple-600 w-10 h-10 flex items-center justify-center rounded-full"><i className="fas fa-calendar-plus"></i></div>
                <div><span className="block font-semibold text-sm text-gray-800 dark:text-white">Agendar Redação</span><span className="text-xs text-gray-500">Definir lembrete</span></div>
            </Link>
        </div>
    </div>
);

export default function StudentDashboard({ initialEssays, prompts, statistics, streak, rankInfo, frequentErrors, currentEvents, targetExam, examDate }: Props) {
  const [essays, setEssays] = useState(initialEssays);
  const [studyPlans, setStudyPlans] = useState<SavedStudyPlan[]>([]);
  const [view, setView] = useState<'dashboard' | 'edit' | 'view_correction'>('dashboard');
  const [currentEssay, setCurrentEssay] = useState<Partial<Essay> | null>(null);
  const searchParams = useSearchParams();

  const handleSelectEssay = useCallback((essay: Partial<Essay>) => {
    setCurrentEssay(essay);
    setView(essay.status === 'draft' ? 'edit' : 'view_correction');
  }, []);

  useEffect(() => {
    const essayIdFromUrl = searchParams.get('essayId');
    if (essayIdFromUrl) {
      const essayToOpen = initialEssays.find(e => e.id === essayIdFromUrl);
      if (essayToOpen) handleSelectEssay(essayToOpen);
    }
    
    getStudentStudyPlans().then(res => {
        if(res.data) setStudyPlans(res.data);
    });
  }, [searchParams, initialEssays, handleSelectEssay]);

  const handleCreateNew = () => {
    setCurrentEssay(null);
    setView('edit');
  };

  const handleBackToDashboard = async () => {
    const result = await getEssaysForStudent();
    if (result.data) setEssays(result.data);
    // Atualiza planos ao voltar para dashboard
    const plansRes = await getStudentStudyPlans();
    if(plansRes.data) setStudyPlans(plansRes.data);
    
    setView('dashboard');
    setCurrentEssay(null);
    window.history.pushState({}, '', '/dashboard/applications/write');
  };

  if (view === 'edit') return <EssayEditor essay={currentEssay} prompts={prompts} onBack={handleBackToDashboard} />;
  if (view === 'view_correction' && currentEssay?.id) return <EssayCorrectionView essayId={currentEssay.id} onBack={handleBackToDashboard} />;

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-dark-text dark:text-white">Redação Inteligente</h1>
            <p className="text-text-muted dark:text-gray-400">Acompanhe sua evolução e pratique com correção por IA.</p>
        </div>
        <button onClick={handleCreateNew} className="bg-royal-blue text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 transition-all hover:scale-105 flex items-center gap-2">
          <i className="fas fa-plus"></i> Nova Redação
        </button>
      </div>
      
      {/* --- MEUS PLANOS DE MELHORIA (NOVO) --- */}
      {studyPlans.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-900 to-royal-blue rounded-2xl p-6 text-white shadow-lg">
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2"><i className="fas fa-road"></i> Planos de Melhoria Ativos</h2>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">{studyPlans.length} planos</span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar snap-x">
                  {studyPlans.map(plan => (
                      <div key={plan.id} className="min-w-[280px] bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-colors cursor-pointer snap-center" onClick={() => alert('Em breve: Visualização detalhada do plano salvo.')}>
                          <div className="flex justify-between items-start mb-2">
                             <span className="bg-green-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">IA</span>
                             <span className="text-[10px] opacity-70">{new Date(plan.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="font-bold text-sm mb-1 truncate" title={plan.essay_title}>{plan.essay_title || "Plano Personalizado"}</p>
                          <p className="text-xs opacity-80 mb-3">Foco: {plan.content.weekly_schedule[0]?.focus || "Geral"}</p>
                          <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                              <div className="bg-green-400 h-full w-1/3"></div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Sequência Atual" value={streak} valueDescription="dias" icon="fa-fire" />
        <StatCard title="Ranking Estadual" value={rankInfo?.rank ? `#${rankInfo.rank}` : '-'} valueDescription={rankInfo?.state || 'SP'} icon="fa-trophy" />
        <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-xl shadow-sm p-1">
            <CountdownWidget targetExam={targetExam} examDate={examDate} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-white dark:bg-dark-card rounded-xl shadow-sm p-4">
            {statistics?.progression && statistics.progression.length > 0 ? (
                <ProgressionChart data={statistics.progression} />
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <i className="fas fa-chart-line text-4xl mb-2 opacity-20"></i>
                    <p>Realize sua primeira redação para ver seu gráfico de evolução.</p>
                </div>
            )}
        </div>
        <div className="lg:col-span-1">
            {statistics ? (
                <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 h-full">
                    <StatisticsWidget stats={statistics} frequentErrors={frequentErrors} />
                </div>
            ) : (
                 <ActionShortcuts />
            )}
        </div>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-dark-text dark:text-white">Histórico de Redações</h2>
          </div>
          
          {essays.length > 0 ? (
            <div className="divide-y dark:divide-gray-700">
                {essays.map(essay => (
                  <div key={essay.id} onClick={() => handleSelectEssay(essay)} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${essay.status === 'corrected' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                            <i className={`fas ${essay.status === 'corrected' ? 'fa-check' : 'fa-pencil-alt'}`}></i>
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-dark-text dark:text-white truncate max-w-xs md:max-w-md">{essay.title || "Redação sem título"}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {essay.submitted_at ? new Date(essay.submitted_at).toLocaleDateString() : 'Não enviada'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                         {essay.final_grade !== null && essay.final_grade !== undefined && (
                             <span className="font-bold text-lg text-royal-blue">{essay.final_grade}</span>
                         )}
                        <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${
                            essay.status === 'corrected' ? 'bg-green-100 text-green-700' : 
                            essay.status === 'submitted' ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-gray-200 text-gray-700'
                        }`}>
                          {essay.status === 'corrected' ? 'Corrigida' : essay.status === 'submitted' ? 'Em Análise' : 'Rascunho'}
                        </span>
                        <i className="fas fa-chevron-right text-gray-300"></i>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <i className="fas fa-feather-alt text-2xl"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-700 dark:text-white">Nenhuma redação encontrada</h3>
                <p className="text-gray-500 mb-6">Que tal começar a praticar hoje mesmo?</p>
                <button onClick={handleCreateNew} className="text-royal-blue font-bold hover:underline">Criar primeira redação</button>
            </div>
          )}
      </div>
    </div>
  );
}