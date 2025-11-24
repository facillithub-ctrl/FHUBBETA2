"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Essay, EssayPrompt, getEssaysForStudent } from '../actions';
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


// --- SUB-COMPONENTES REESTILIZADOS ---

const StatCard = ({ title, value, icon, valueDescription }: { title: string, value: string | number, icon: string, valueDescription?: string }) => (
  <div className="glass-card p-5 flex items-center justify-between h-full">
    <div className="min-w-0 flex-1 mr-2">
      <p className="text-sm text-dark-text-muted truncate mb-1" title={title}>{title}</p>
      <p className="text-2xl font-bold text-dark-text dark:text-white truncate">
        {value} <span className="text-sm font-normal text-dark-text-muted ml-1">{valueDescription}</span>
      </p>
    </div>
    <div className="text-3xl text-lavender-blue flex-shrink-0 bg-royal-blue/10 w-12 h-12 rounded-full flex items-center justify-center">
      <i className={`fas ${icon}`}></i>
    </div>
  </div>
);

const ActionShortcuts = () => (
    <div className="glass-card p-6 h-full flex flex-col">
        <h3 className="font-bold mb-4 dark:text-white-text">Atalhos Rápidos</h3>
        <div className="space-y-3 flex-1">
            <Link href="/dashboard/applications/test" className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-transparent hover:border-royal-blue/30 transition-all hover:shadow-sm group">
                <div className="bg-royal-blue/10 text-royal-blue w-10 h-10 flex items-center justify-center rounded-lg text-lg group-hover:bg-royal-blue group-hover:text-white transition-colors">
                    <i className="fas fa-spell-check"></i>
                </div>
                <span className="text-sm font-medium dark:text-gray-200">Testar gramática</span>
                <i className="fas fa-chevron-right ml-auto text-xs text-gray-400 group-hover:text-royal-blue"></i>
            </Link>
             <Link href="/dashboard/applications/day" className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-transparent hover:border-royal-blue/30 transition-all hover:shadow-sm group">
                 <div className="bg-royal-blue/10 text-royal-blue w-10 h-10 flex items-center justify-center rounded-lg text-lg group-hover:bg-royal-blue group-hover:text-white transition-colors">
                    <i className="fas fa-calendar-check"></i>
                </div>
                <span className="text-sm font-medium dark:text-gray-200">Agendar redação</span>
                <i className="fas fa-chevron-right ml-auto text-xs text-gray-400 group-hover:text-royal-blue"></i>
            </Link>
             <Link href="/dashboard/applications/library" className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-transparent hover:border-royal-blue/30 transition-all hover:shadow-sm group">
                 <div className="bg-royal-blue/10 text-royal-blue w-10 h-10 flex items-center justify-center rounded-lg text-lg group-hover:bg-royal-blue group-hover:text-white transition-colors">
                    <i className="fas fa-book-open"></i>
                </div>
                <span className="text-sm font-medium dark:text-gray-200">Ver repertórios</span>
                <i className="fas fa-chevron-right ml-auto text-xs text-gray-400 group-hover:text-royal-blue"></i>
            </Link>
        </div>
    </div>
);

const CurrentEventsWidget = ({ events }: { events: CurrentEvent[] }) => (
    <div className="glass-card p-6 h-full flex flex-col">
        <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
            <i className="fas fa-newspaper text-royal-blue"></i> Atualidades
        </h3>
        {events.length > 0 ? (
            <ul className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar max-h-[250px]">
                {events.map(event => (
                    <li key={event.id}>
                        <a href={event.link} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                            <p className="font-bold text-sm dark:text-white text-royal-blue mb-1 line-clamp-1">{event.title}</p>
                            {event.summary && <p className="text-xs text-dark-text-muted line-clamp-2 leading-relaxed">{event.summary}</p>}
                        </a>
                    </li>
                ))}
            </ul>
        ) : (
            <div className="flex-1 flex items-center justify-center text-center flex-col text-dark-text-muted p-4">
                <i className="far fa-newspaper text-4xl mb-2 opacity-50"></i>
                <p className="text-sm">Nenhuma notícia recente.</p>
            </div>
        )}
    </div>
);


// --- COMPONENTE PRINCIPAL ---

export default function StudentDashboard({ initialEssays, prompts, statistics, streak, rankInfo, frequentErrors, currentEvents, targetExam, examDate }: Props) {
  const [essays, setEssays] = useState(initialEssays);
  const [view, setView] = useState<'dashboard' | 'edit' | 'view_correction'>('dashboard');
  const [currentEssay, setCurrentEssay] = useState<Partial<Essay> | null>(null);
  const searchParams = useSearchParams();

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
    <div className="pb-8">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-dark-text dark:text-white-text">Redação</h1>
            <p className="text-text-muted dark:text-gray-400">Acompanhe seu progresso e pratique sua escrita.</p>
        </div>
        <button onClick={handleCreateNew} className="bg-royal-blue text-white font-bold py-3 px-6 rounded-xl hover:bg-opacity-90 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2">
          <i className="fas fa-plus"></i> Nova Redação
        </button>
      </div>
      
      {/* --- LINHA SUPERIOR DE CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1">
            <StatCard 
                title="Sequência (Streak)" 
                value={streak} 
                valueDescription={`dia${streak === 1 ? '' : 's'}`} 
                icon="fa-fire" 
            />
        </div>
        <div className="lg:col-span-1">
            <StatCard 
                title={`Ranking ${rankInfo?.state || ''}`} 
                value={rankInfo?.rank ? `#${rankInfo.rank}` : 'N/A'}
                valueDescription=""
                icon="fa-trophy" 
            />
        </div>
        <div className="lg:col-span-2">
            <div className="glass-card p-0 h-full overflow-hidden">
                <CountdownWidget targetExam={targetExam} examDate={examDate} />
            </div>
        </div>
      </div>

      {/* --- LINHA DO MEIO DE CARDS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
            {statistics ? (
                <div className="h-full">
                     <ProgressionChart data={statistics.progression} />
                </div>
            ) : (
                <div className="glass-card h-full flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center mb-4 text-gray-400 text-2xl">
                        <i className="fas fa-chart-line"></i>
                    </div>
                    <p className="font-bold text-dark-text dark:text-white mb-1">Sem dados suficientes</p>
                    <p className="text-sm text-dark-text-muted">Envie sua primeira redação para ver sua progressão aqui.</p>
                </div>
            )}
        </div>
        
        <div className="lg:col-span-1">
            <div className="glass-card p-6 h-full">
                {statistics ? <StatisticsWidget stats={statistics} frequentErrors={frequentErrors}/> : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4 min-h-[300px]">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center mb-4 text-gray-400 text-2xl">
                            <i className="fas fa-chart-pie"></i>
                        </div>
                        <p className="font-bold text-dark-text dark:text-white mb-1">Estatísticas vazias</p>
                        <p className="text-sm text-dark-text-muted">Suas médias por competência aparecerão aqui após a primeira correção.</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* --- NOVA LINHA INFERIOR DE CARDS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* HISTÓRICO DE REDAÇÕES */}
        <div className="lg:col-span-2">
            <div className="glass-card p-6 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-dark-text dark:text-white-text">Minhas Redações</h2>
                    <span className="text-xs font-medium bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                        {essays.length} total
                    </span>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
                    {essays.length > 0 ? (
                        <ul className="space-y-3">
                            {essays.map(essay => (
                              <li key={essay.id} onClick={() => handleSelectEssay(essay)} className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl cursor-pointer flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 transition-all duration-200 group">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${essay.status === 'corrected' ? 'bg-green-500' : essay.status === 'submitted' ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
                                      <p className="font-bold text-dark-text dark:text-white-text truncate group-hover:text-royal-blue transition-colors" title={essay.title || "Sem título"}>
                                          {essay.title || "Redação sem título"}
                                      </p>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-dark-text-muted pl-4">
                                    {essay.status === 'draft' 
                                        ? 'Editado recentemente' 
                                        : `Enviada em: ${new Date(essay.submitted_at!).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'})}`}
                                  </p>
                                </div>
                                
                                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pl-4 sm:pl-0">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${
                                        essay.status === 'corrected' ? 'bg-green-100 text-green-700 border border-green-200' : 
                                        essay.status === 'submitted' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 
                                        'bg-gray-100 text-gray-600 border border-gray-200'
                                    }`}>
                                      {essay.status === 'corrected' ? 'Corrigida' : essay.status === 'submitted' ? 'Em Análise' : 'Rascunho'}
                                    </span>
                                    <i className="fas fa-chevron-right text-gray-300 group-hover:text-royal-blue transition-colors"></i>
                                </div>
                              </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <i className="fas fa-pen-alt text-3xl text-gray-300"></i>
                            </div>
                            <p className="text-dark-text font-medium mb-2">Nenhuma redação encontrada</p>
                            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">Comece a praticar hoje mesmo para melhorar sua escrita e alcançar a nota 1000.</p>
                            <button onClick={handleCreateNew} className="text-royal-blue font-bold text-sm hover:underline">Criar primeira redação</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="flex-1 min-h-[200px]">
                <ActionShortcuts />
            </div>
            <div className="flex-1 min-h-[300px]">
                <CurrentEventsWidget events={currentEvents} />
            </div>
        </div>
      </div>

    </div>
  );
}