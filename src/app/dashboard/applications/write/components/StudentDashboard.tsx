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

const StatCard = ({ title, value, icon, valueDescription }: { title: string, value: string | number, icon: string, valueDescription?: string }) => (
  <div className="glass-card p-4 flex items-center justify-between h-full">
    <div>
      <p className="text-sm text-dark-text-muted">{title}</p>
      <p className="text-2xl font-bold text-dark-text dark:text-white">
        {value} <span className="text-sm font-normal">{valueDescription}</span>
      </p>
    </div>
    <div className="text-3xl text-lavender-blue">
      <i className={`fas ${icon}`}></i>
    </div>
  </div>
);

const ActionShortcuts = () => (
    <div className="glass-card p-6 h-full">
        <h3 className="font-bold mb-3 dark:text-white-text">Atalhos</h3>
        <div className="space-y-2">
            <Link href="/dashboard/applications/test" className="flex items-center gap-3 p-2 rounded-md hover:bg-black/10 transition-colors">
                <div className="bg-royal-blue/10 text-royal-blue w-8 h-8 flex items-center justify-center rounded-lg text-sm">
                    <i className="fas fa-spell-check"></i>
                </div>
                <span className="text-sm font-medium dark:text-gray-200">Testar gramática</span>
            </Link>
             <Link href="/dashboard/applications/day" className="flex items-center gap-3 p-2 rounded-md hover:bg-black/10 transition-colors">
                 <div className="bg-royal-blue/10 text-royal-blue w-8 h-8 flex items-center justify-center rounded-lg text-sm">
                    <i className="fas fa-calendar-check"></i>
                </div>
                <span className="text-sm font-medium dark:text-gray-200">Agendar redação</span>
            </Link>
             <Link href="/dashboard/applications/library" className="flex items-center gap-3 p-2 rounded-md hover:bg-black/10 transition-colors">
                 <div className="bg-royal-blue/10 text-royal-blue w-8 h-8 flex items-center justify-center rounded-lg text-sm">
                    <i className="fas fa-book-open"></i>
                </div>
                <span className="text-sm font-medium dark:text-gray-200">Ver argumentos</span>
            </Link>
        </div>
    </div>
);

const CurrentEventsWidget = ({ events }: { events: CurrentEvent[] }) => (
    <div className="glass-card p-6 h-full flex flex-col">
        <h3 className="font-bold text-lg mb-4 dark:text-white">Fique por Dentro</h3>
        {events.length > 0 ? (
            <ul className="space-y-3 overflow-y-auto flex-1">
                {events.map(event => (
                    <li key={event.id}>
                        <a href={event.link} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-md hover:bg-black/10 transition-colors">
                            <p className="font-semibold text-sm dark:text-white">{event.title}</p>
                            {event.summary && <p className="text-xs text-dark-text-muted mt-1">{event.summary}</p>}
                        </a>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-sm text-dark-text-muted m-auto text-center">Nenhuma notícia recente disponível.</p>
        )}
    </div>
);

export default function StudentDashboard({ initialEssays, prompts, statistics, streak, rankInfo, frequentErrors, currentEvents, targetExam, examDate }: Props) {
  const [essays, setEssays] = useState(initialEssays);
  const [view, setView] = useState<'dashboard' | 'edit' | 'view_correction'>('dashboard');
  const [currentEssay, setCurrentEssay] = useState<Partial<Essay> | null>(null);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const searchParams = useSearchParams();

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

  if (view === 'edit') return <EssayEditor essay={currentEssay} prompts={prompts} onBack={handleBackToDashboard} />;
  if (view === 'view_correction' && currentEssay?.id) return <EssayCorrectionView essayId={currentEssay.id} onBack={handleBackToDashboard} />;

  return (
    <div>
       <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-dark-text dark:text-white-text">Meu Desempenho em Redação</h1>
        <button onClick={handleCreateNew} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90">
          <i className="fas fa-plus mr-2"></i> Nova Redação
        </button>
      </div>

      {/* --- LINHA SUPERIOR --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1">
            <StatCard
                title="Sequência de Escrita"
                value={streak}
                valueDescription={`dia${streak === 1 ? '' : 's'}`}
                icon="fa-fire"
            />
        </div>
        <div className="lg:col-span-1">
            <StatCard
                title="Ranking Estadual"
                value={rankInfo?.rank ? `#${rankInfo.rank}` : 'N/A'}
                valueDescription={rankInfo?.state || ''}
                icon="fa-trophy"
            />
        </div>
        <div className="lg:col-span-2">
            <div className="glass-card p-6 h-full">
                <CountdownWidget targetExam={targetExam} examDate={examDate} />
            </div>
        </div>
      </div>

      {/* --- LINHA DO MEIO --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
            <ProgressionChart
                data={statistics ? statistics.progression : []}
                actionPlans={actionPlans}
            />
        </div>

        <div className="lg:col-span-1">
            <div className="glass-card p-6 h-full">
                {statistics ? <StatisticsWidget stats={statistics} frequentErrors={frequentErrors}/> : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-center dark:text-white-text">Suas estatísticas aparecerão aqui.</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* --- LINHA INFERIOR --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-dark-text dark:text-white-text mb-4">Histórico de Redações</h2>
            <div className="glass-card p-4">
                <ul className="divide-y divide-white/20">
                    {essays.length > 0 ? essays.map(essay => (
                      <li key={essay.id} onClick={() => handleSelectEssay(essay)} className="p-4 hover:bg-black/10 rounded-lg cursor-pointer flex justify-between items-center">
                        <div>
                          <p className="font-bold text-dark-text dark:text-white-text">{essay.title || "Redação sem título"}</p>
                          <p className="text-sm text-gray-500 dark:text-dark-text-muted">{essay.status === 'draft' ? 'Rascunho' : `Enviada em: ${new Date(essay.submitted_at!).toLocaleDateString()}`}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${essay.status === 'corrected' ? 'bg-green-100 text-green-800' : essay.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-800'}`}>
                          {essay.status === 'corrected' ? 'Corrigida' : essay.status === 'submitted' ? 'Aguardando correção' : 'Rascunho'}
                        </span>
                      </li>
                    )) : (<p className="p-4 text-center text-gray-500 dark:text-dark-text-muted">Você ainda não tem nenhuma redação. Comece uma nova!</p>)}
                </ul>
            </div>
        </div>
        <div className="lg:col-span-1 flex flex-col">
             <h2 className="text-2xl font-bold text-dark-text dark:text-white-text mb-4">Atalhos e Notícias</h2>
             <div className="flex-grow grid grid-rows-2 gap-6">
                <ActionShortcuts />
                <CurrentEventsWidget events={currentEvents} />
             </div>
        </div>
      </div>
    </div>
  );
}