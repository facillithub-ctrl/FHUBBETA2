"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Essay, EssayPrompt, getEssaysForStudent, getUserActionPlans, getSavedFeedbacks, ActionPlan } from '../actions';
import EssayEditor from './EssayEditor';
import EssayCorrectionView from './EssayCorrectionView';
import StatisticsWidget from './StatisticsWidget';
import ProgressionChart from './ProgressionChart';
import PracticePlanWidget from './PracticePlanWidget'; // IMPORTADO
import CountdownWidget from '@/components/dashboard/CountdownWidget';

// ... (Mantenha os Types Stats, RankInfo, etc definidos anteriormente) ...
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

const GradientText = ({ children }: { children: React.ReactNode }) => (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#42047e] to-[#07f49e]">{children}</span>
);

const NewsCard = ({ event }: { event: CurrentEvent }) => {
    const isExternal = event.link.startsWith('http');
    const icon = event.type === 'notice' ? 'fa-bell' : 'fa-newspaper';
    return (
        <a href={event.link} target={isExternal ? "_blank" : "_self"} className="flex gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all group">
            <div className="w-10 h-10 rounded-full bg-[#42047e]/10 text-[#42047e] flex items-center justify-center flex-shrink-0">
                <i className={`fas ${icon}`}></i>
            </div>
            <div>
                <h5 className="font-bold text-sm text-gray-800 dark:text-white group-hover:text-[#42047e] transition-colors">{event.title}</h5>
                {event.summary && <p className="text-xs text-gray-500 line-clamp-2">{event.summary}</p>}
            </div>
        </a>
    );
};

export default function StudentDashboard({ initialEssays, prompts, statistics, streak, rankInfo, frequentErrors, currentEvents, targetExam, examDate }: Props) {
  const [essays, setEssays] = useState(initialEssays);
  const [view, setView] = useState<'dashboard' | 'edit' | 'view_correction'>('dashboard');
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'feedbacks' | 'analytics'>('overview');
  const [currentEssay, setCurrentEssay] = useState<Partial<Essay> | null>(null);
  
  // Estados para dados assíncronos
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [savedFeedbacks, setSavedFeedbacks] = useState<any[]>([]);
  
  const searchParams = useSearchParams();

  useEffect(() => {
      const loadData = async () => {
          const plans = await getUserActionPlans();
          if (plans.data) setActionPlans(plans.data);
          
          const feeds = await getSavedFeedbacks();
          if (feeds.data) setSavedFeedbacks(feeds.data);
      };
      loadData();
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

  const handleCreateNew = () => { setCurrentEssay(null); setView('edit'); };

  const handleBackToDashboard = async () => {
    const result = await getEssaysForStudent();
    if (result.data) setEssays(result.data);
    // Recarrega planos pois a nova redação pode ter gerado novos itens
    const plans = await getUserActionPlans();
    if (plans.data) setActionPlans(plans.data);
    
    setView('dashboard');
    setCurrentEssay(null);
    window.history.pushState({}, '', '/dashboard/applications/write');
  };

  if (view === 'edit') return <EssayEditor essay={currentEssay} prompts={prompts} onBack={handleBackToDashboard} />;
  if (view === 'view_correction' && currentEssay?.id) return <EssayCorrectionView essayId={currentEssay.id} onBack={handleBackToDashboard} />;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
        
        {/* HEADER */}
       <header className="bg-white dark:bg-dark-card p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-dark-border relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#42047e] to-[#07f49e] p-0.5 flex-shrink-0 shadow-lg">
                        <div className="w-full h-full bg-white dark:bg-dark-card rounded-[14px] flex items-center justify-center">
                             <i className="fas fa-pen-nib text-2xl text-[#42047e]"></i>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-800 dark:text-white">Facillit <GradientText>Write</GradientText></h1>
                        <p className="text-gray-500 font-medium">Laboratório de Redação Inteligente</p>
                    </div>
                </div>
                <button onClick={handleCreateNew} className="bg-[#42047e] hover:bg-[#360368] text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-1 flex items-center gap-2">
                    <i className="fas fa-plus"></i> Nova Redação
                </button>
            </div>
      </header>

      {/* MENU ABAS */}
      <div className="flex flex-wrap justify-center md:justify-start gap-2">
          {[
              { id: 'overview', label: 'Visão Geral', icon: 'fa-home' },
              { id: 'history', label: 'Minhas Redações', icon: 'fa-file-alt' },
              { id: 'feedbacks', label: 'Biblioteca IA', icon: 'fa-robot' },
              { id: 'analytics', label: 'Estatísticas', icon: 'fa-chart-bar' }
          ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                    activeTab === tab.id 
                    ? 'bg-white dark:bg-dark-card text-[#42047e] shadow-md border-b-2 border-[#42047e]' 
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                  <i className={`fas ${tab.icon}`}></i> {tab.label}
              </button>
          ))}
      </div>

      {/* CONTEÚDO: VISÃO GERAL */}
      {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
              {/* Grid Superior de Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-dark-card p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
                      <div className="flex justify-between mb-4"><div className="p-3 bg-purple-100 rounded-xl text-[#42047e]"><i className="fas fa-fire text-xl"></i></div><span className="text-xs font-bold text-gray-400 uppercase">Sequência</span></div>
                      <h3 className="text-3xl font-black text-gray-800 dark:text-white">{streak} <span className="text-sm font-medium text-gray-400">dias</span></h3>
                  </div>
                  <div className="bg-white dark:bg-dark-card p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
                      <div className="flex justify-between mb-4"><div className="p-3 bg-teal-100 rounded-xl text-[#07f49e]"><i className="fas fa-chart-line text-xl"></i></div><span className="text-xs font-bold text-gray-400 uppercase">Média</span></div>
                      <h3 className="text-3xl font-black text-gray-800 dark:text-white">{statistics?.averages.avg_final_grade.toFixed(0) || '-'}</h3>
                  </div>
                  <div className="bg-gradient-to-br from-[#42047e] to-[#07f49e] p-5 rounded-2xl shadow-lg text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-5 -mt-5"></div>
                      <div className="relative z-10">
                          <div className="flex justify-between mb-4"><div className="p-3 bg-white/20 rounded-xl backdrop-blur"><i className="fas fa-trophy text-xl"></i></div><span className="text-xs font-bold text-white/80 uppercase">Ranking</span></div>
                          <h3 className="text-3xl font-black">#{rankInfo?.rank || '-'}</h3>
                          <p className="text-sm text-white/80">{rankInfo?.state || 'Regional'}</p>
                      </div>
                  </div>
                  <div className="bg-white dark:bg-dark-card p-1 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
                      <div className="h-full flex flex-col justify-center items-center p-4"><CountdownWidget targetExam={targetExam} examDate={examDate} /></div>
                  </div>
              </div>

              {/* Grid Principal */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Coluna Esquerda (2/3) */}
                  <div className="lg:col-span-2 space-y-8">
                      
                      {/* WIDGET PLANO DE PRÁTICA */}
                      <div className="h-[350px]">
                          <PracticePlanWidget plans={actionPlans} />
                      </div>

                      {/* Gráfico */}
                      <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
                          <div className="flex justify-between items-center mb-6">
                              <h3 className="font-bold text-lg text-gray-800 dark:text-white">Evolução de Notas</h3>
                              <button onClick={() => setActiveTab('analytics')} className="text-xs font-bold text-[#42047e] bg-purple-50 px-3 py-1 rounded-full">Ver Detalhes</button>
                          </div>
                          <div className="h-64">
                              <ProgressionChart data={statistics?.progression || []} actionPlans={[]} />
                          </div>
                      </div>
                  </div>

                  {/* Coluna Direita (1/3) */}
                  <div className="lg:col-span-1 space-y-8">
                      {/* Notícias */}
                      <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border h-full flex flex-col">
                          <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">Atualidades</h3>
                          <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar pr-1">
                              {currentEvents.map(evt => <NewsCard key={evt.id} event={evt} />)}
                              {currentEvents.length === 0 && <p className="text-gray-400 text-center py-4">Sem notícias.</p>}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* ... (Outras abas History, Feedbacks e Analytics mantidas como no anterior) ... */}
      {/* Aba Feedbacks (Visualização) */}
      {activeTab === 'feedbacks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {savedFeedbacks.length > 0 ? (
                  savedFeedbacks.map(fb => (
                      <div key={fb.id} className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                          <div className="flex justify-between mb-4">
                              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-[#42047e]"><i className="fas fa-robot"></i></div>
                              <span className="text-xs text-gray-400">{new Date(fb.ai_feedback.created_at).toLocaleDateString()}</span>
                          </div>
                          <h4 className="font-bold text-gray-800 dark:text-white mb-2 line-clamp-1">{fb.title || "Sem título"}</h4>
                          <button onClick={() => handleSelectEssay(fb)} className="w-full py-2 bg-gray-50 hover:bg-[#42047e] hover:text-white rounded-lg text-sm font-bold text-gray-600 transition-colors">Ver Análise</button>
                      </div>
                  ))
              ) : (
                  <div className="col-span-full text-center py-20 text-gray-400">
                      <i className="fas fa-robot text-4xl mb-3"></i>
                      <p>Nenhum feedback de IA salvo ainda.</p>
                  </div>
              )}
          </div>
      )}
      
      {/* Abas History e Analytics são as mesmas do código anterior */}
      {activeTab === 'history' && (
          /* ... código da tabela de histórico ... */
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border p-6 animate-fade-in">
              <h3 className="font-bold text-lg mb-4">Histórico de Redações</h3>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="text-xs text-gray-400 uppercase border-b"><tr><th className="py-3">Título</th><th className="py-3">Status</th><th className="py-3">Nota</th><th className="py-3">Data</th><th className="py-3"></th></tr></thead>
                      <tbody className="text-sm">
                          {essays.map(e => (
                              <tr key={e.id} onClick={() => handleSelectEssay(e)} className="border-b hover:bg-gray-50 cursor-pointer">
                                  <td className="py-3 font-medium">{e.title || "Sem título"}</td>
                                  <td className="py-3"><span className={`px-2 py-1 rounded text-xs font-bold ${e.status === 'corrected' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{e.status}</span></td>
                                  <td className="py-3 font-bold">{e.final_grade || '-'}</td>
                                  <td className="py-3 text-gray-500">{new Date(e.submitted_at!).toLocaleDateString()}</td>
                                  <td className="py-3 text-right"><i className="fas fa-chevron-right text-gray-300"></i></td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}
      
      {activeTab === 'analytics' && (
          <div className="animate-fade-in">
              <StatisticsWidget stats={statistics} frequentErrors={frequentErrors} />
          </div>
      )}

    </div>
  );
}