"use client";

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
    Essay, EssayPrompt, getUserActionPlans, getSavedFeedbacks, ActionPlan 
} from '../actions';
import EssayEditor from './EssayEditor';
import EssayCorrectionView from './EssayCorrectionView';
import StatisticsWidget from './StatisticsWidget';
import ProgressionChart from './ProgressionChart';
import PracticePlanWidget from './PracticePlanWidget';
import PromptLibrary from './PromptLibrary';
import CountdownWidget from '@/components/dashboard/CountdownWidget';
import { 
    PenTool, BookOpen, Plus, Home, History, MessageSquare, BarChart2, 
    Zap, ChevronRight, Newspaper, Trophy, TrendingUp
} from 'lucide-react';

// --- TIPOS CORRIGIDOS PARA EVITAR ERRO DE BUILD ---
type Stats = {
    totalCorrections: number;
    averages: { 
        avg_final_grade: number;
        avg_c1: number;
        avg_c2: number;
        avg_c3: number;
        avg_c4: number;
        avg_c5: number;
    };
    pointToImprove: { name: string; average: number; };
    progression: { date: string; grade: number; }[];
} | null;

type RankInfo = { rank: number | null; state: string | null; } | null;
type FrequentError = { error_type: string; count: number };
type CurrentEvent = { id: string; title: string; summary: string | null; link: string; type?: 'blog' | 'news'; publishedAt?: string };

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

// Componente de Cartão de Notícia
const NewsCard = ({ event }: { event: CurrentEvent }) => {
    return (
        <a 
            href={event.link} 
            target={event.link.startsWith('http') ? "_blank" : "_self"}
            className="group block relative overflow-hidden rounded-xl bg-white dark:bg-[#1a1b1e] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md hover:border-[#42047e]/30 transition-all duration-300"
        >
            <div className="p-4 flex flex-col h-full">
                <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-900/20 text-[#42047e] dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Newspaper size={10} /> Blog
                    </span>
                    {event.publishedAt && (
                        <span className="text-[10px] text-gray-400 font-medium">
                            {new Date(event.publishedAt).toLocaleDateString('pt-BR')}
                        </span>
                    )}
                </div>
                <h4 className="font-bold text-sm text-gray-800 dark:text-white leading-snug mb-1 group-hover:text-[#42047e] transition-colors line-clamp-2">
                    {event.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                    {event.summary || "Confira este artigo completo no nosso blog."}
                </p>
                <div className="pt-2 border-t border-gray-50 dark:border-white/5 flex items-center justify-end mt-auto">
                    <span className="text-[10px] font-bold text-[#42047e] dark:text-[#07f49e] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Ler agora <ChevronRight size={12} />
                    </span>
                </div>
            </div>
        </a>
    );
};

export default function StudentDashboard({ initialEssays, prompts, statistics, streak, rankInfo, frequentErrors, currentEvents, targetExam, examDate }: Props) {
  const [essays, setEssays] = useState(initialEssays);
  const [view, setView] = useState<'dashboard' | 'edit' | 'view_correction' | 'prompts_library'>('dashboard');
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'comments' | 'analytics'>('overview');
  const [currentEssay, setCurrentEssay] = useState<Partial<Essay> | null>(null);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const searchParams = useSearchParams();

  useEffect(() => {
      const loadData = async () => {
          const plans = await getUserActionPlans();
          if (plans.data) setActionPlans(plans.data);
      };
      loadData();
  }, []);

  const handleSelectEssay = useCallback((essay: any) => {
    setCurrentEssay(essay);
    const hasAIFeedback = essay.ai_feedback && (Array.isArray(essay.ai_feedback) ? essay.ai_feedback.length > 0 : true);
    const isCorrected = essay.status === 'corrected';
    if (isCorrected || hasAIFeedback) {
        setView('view_correction');
    } else {
        setView('edit');
    }
  }, []);

  useEffect(() => {
    const essayIdFromUrl = searchParams.get('essayId');
    if (essayIdFromUrl) {
      const essayToOpen = initialEssays.find(e => e.id === essayIdFromUrl);
      if (essayToOpen) handleSelectEssay(essayToOpen);
    }
  }, [searchParams, initialEssays, handleSelectEssay]);

  const handleCreateNew = () => { setCurrentEssay(null); setView('edit'); };
  const handleOpenLibrary = () => { setView('prompts_library'); };

  if (view === 'edit') return <EssayEditor essay={currentEssay} prompts={prompts} onBack={() => setView('dashboard')} />;
  if (view === 'view_correction' && currentEssay?.id) return <EssayCorrectionView essayId={currentEssay.id} onBack={() => setView('dashboard')} />;
  if (view === 'prompts_library') return <PromptLibrary prompts={prompts} onSelectPrompt={(p) => { setCurrentEssay({ prompt_id: p.id, title: p.title }); setView('edit'); }} onBack={() => setView('dashboard')} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 font-inter">
       {/* HERO COMPACTO */}
       <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-[#1a1b1e] border border-gray-200 dark:border-white/5 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#42047e] to-[#07f49e] p-[2px]">
                        <div className="w-full h-full bg-white dark:bg-[#151518] rounded-[10px] flex items-center justify-center">
                             <PenTool className="text-[#42047e] dark:text-[#07f49e]" size={20} />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Facillit Write</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Laboratório de Redação Inteligente</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleOpenLibrary} className="px-4 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-semibold hover:border-[#42047e] text-gray-700 dark:text-white transition-all flex items-center gap-2">
                        <BookOpen size={16} /> Temas
                    </button>
                    <button onClick={handleCreateNew} className="px-5 py-2 rounded-lg bg-[#42047e] hover:bg-[#350365] text-white text-sm font-semibold shadow-md transition-all flex items-center gap-2">
                        <Plus size={16} /> Escrever
                    </button>
                </div>
            </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
          {[
              { id: 'overview', label: 'Visão Geral', icon: Home },
              { id: 'history', label: 'Minhas Redações', icon: History },
              { id: 'comments', label: 'Feedbacks', icon: MessageSquare },
              { id: 'analytics', label: 'Estatísticas', icon: BarChart2 }
          ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id as any)} 
                    className={`
                        px-4 py-3 text-sm font-medium flex items-center gap-2 transition-all border-b-2
                        ${isActive 
                            ? 'border-[#42047e] text-[#42047e] dark:text-white' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }
                    `}
                >
                  <Icon size={16} /> {tab.label}
                </button>
              )
          })}
      </div>

      {/* DASHBOARD CONTENT */}
      {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in slide-in-from-bottom-2 duration-300">
              <div className="lg:col-span-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-[#1a1b1e] p-5 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col justify-between">
                             <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sequência</span>
                                <Zap size={16} className="text-yellow-500" />
                             </div>
                             <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{streak} <span className="text-sm font-normal text-gray-500">dias</span></h3>
                             </div>
                        </div>

                        <div className="bg-white dark:bg-[#1a1b1e] p-5 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col justify-between">
                             <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Média</span>
                                <TrendingUp size={16} className="text-[#07f49e]" />
                             </div>
                             <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{statistics?.averages.avg_final_grade.toFixed(0) || '-'}</h3>
                             </div>
                        </div>

                        <div className="bg-gradient-to-br from-[#42047e] to-[#2E14ED] p-5 rounded-xl text-white shadow-md flex flex-col justify-between relative overflow-hidden">
                             <div className="absolute right-0 top-0 w-16 h-16 bg-white/10 rounded-bl-full"></div>
                             <div className="flex justify-between items-start mb-2 relative z-10">
                                <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Ranking</span>
                                <Trophy size={16} className="text-yellow-300" />
                             </div>
                             <div className="relative z-10">
                                <h3 className="text-2xl font-bold">#{rankInfo?.rank || '-'}</h3>
                                <span className="text-[10px] opacity-80">{rankInfo?.state || 'Geral'}</span>
                             </div>
                        </div>
                  </div>

                  <div className="bg-white dark:bg-[#1a1b1e] p-6 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                          <BarChart2 className="text-[#42047e]" size={16} /> Evolução de Notas
                      </h3>
                      <div className="h-[280px] w-full">
                          <ProgressionChart data={statistics?.progression || []} />
                      </div>
                  </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                   <div className="bg-white dark:bg-[#1a1b1e] rounded-xl border border-gray-100 dark:border-white/5 shadow-sm p-1">
                       <CountdownWidget targetExam={targetExam} examDate={examDate} />
                   </div>

                   <div className="bg-gray-50 dark:bg-[#151518] rounded-xl p-5 border border-gray-200 dark:border-white/5 h-[420px] flex flex-col">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Newspaper className="text-[#07f49e]" size={16} /> Atualidades & Dicas
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                            {currentEvents.length > 0 ? (
                                currentEvents.map(evt => <NewsCard key={evt.id} event={evt} />)
                            ) : (
                                <div className="text-center py-8 text-xs text-gray-400">Nenhuma notícia.</div>
                            )}
                        </div>
                        <Link href="/recursos/blog?cat=Redação" className="block text-center mt-3 text-xs font-bold text-[#42047e] hover:underline">
                            Ver Blog Completo
                        </Link>
                   </div>
              </div>
          </div>
      )}

      {/* OUTRAS ABAS */}
      {activeTab === 'history' && (
           <div className="bg-white dark:bg-[#1a1b1e] rounded-xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-gray-50 dark:bg-white/5 text-[11px] text-gray-400 uppercase font-bold tracking-wider">
                          <tr>
                              <th className="px-6 py-3">Título</th>
                              <th className="px-6 py-3">Status</th>
                              <th className="px-6 py-3 text-center">Nota</th>
                              <th className="px-6 py-3">Data</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
                          {essays.map(e => (
                              <tr key={e.id} onClick={() => handleSelectEssay(e)} className="hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                                  <td className="px-6 py-3 font-medium text-gray-800 dark:text-white">{e.title || "Sem título"}</td>
                                  <td className="px-6 py-3">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${e.status === 'corrected' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                                          {e.status === 'corrected' ? 'CORRIGIDA' : 'EM ANÁLISE'}
                                      </span>
                                  </td>
                                  <td className="px-6 py-3 text-center font-bold">{e.final_grade || '-'}</td>
                                  <td className="px-6 py-3 text-xs text-gray-500">{e.submitted_at ? new Date(e.submitted_at).toLocaleDateString() : '-'}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  {essays.length === 0 && <div className="p-8 text-center text-sm text-gray-400">Nenhuma redação encontrada.</div>}
               </div>
           </div>
      )}

      {activeTab === 'analytics' && (
          <div className="animate-in fade-in">
              {/* O erro de build foi corrigido aqui ao tipar o objeto statistics corretamente no início do arquivo */}
              <StatisticsWidget stats={statistics} frequentErrors={frequentErrors} />
          </div>
      )}
    </div>
  );
}