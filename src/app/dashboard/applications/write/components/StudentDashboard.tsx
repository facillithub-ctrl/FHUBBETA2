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
    Zap, ExternalLink, ChevronRight, Newspaper, Trophy, TrendingUp, Calendar 
} from 'lucide-react';

// --- TIPOS ---
type Stats = {
    totalCorrections: number;
    averages: { avg_final_grade: number; };
    pointToImprove: { name: string; average: number; };
    progression: { date: string; grade: number; }[];
} | null;

type RankInfo = { rank: number | null; state: string | null; } | null;
type FrequentError = { error_type: string; count: number };
// Atualizado para incluir imagem opcional
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

// Componente de Cartão de Notícia Moderno
const NewsCard = ({ event }: { event: CurrentEvent }) => {
    return (
        <a 
            href={event.link} 
            target={event.link.startsWith('http') ? "_blank" : "_self"}
            className="group block relative overflow-hidden rounded-2xl bg-white dark:bg-[#1a1b1e] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#42047e] to-[#07f49e] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="p-5 flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-[#42047e] dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Newspaper size={12} /> Blog
                    </span>
                    {event.publishedAt && (
                        <span className="text-[10px] text-gray-400 font-medium">
                            {new Date(event.publishedAt).toLocaleDateString('pt-BR')}
                        </span>
                    )}
                </div>
                
                <h4 className="font-bold text-gray-800 dark:text-white leading-snug mb-2 group-hover:text-[#42047e] transition-colors line-clamp-2">
                    {event.title}
                </h4>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 mb-4 flex-grow leading-relaxed">
                    {event.summary || "Confira este artigo completo no nosso blog."}
                </p>

                <div className="pt-3 border-t border-gray-50 dark:border-white/5 flex items-center justify-between mt-auto">
                    <span className="text-xs font-bold text-[#42047e] dark:text-[#07f49e] flex items-center gap-1 group-hover:gap-2 transition-all">
                        Ler artigo <ChevronRight size={14} />
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

  // Roteamento de Visualização
  if (view === 'edit') return <EssayEditor essay={currentEssay} prompts={prompts} onBack={() => setView('dashboard')} />;
  if (view === 'view_correction' && currentEssay?.id) return <EssayCorrectionView essayId={currentEssay.id} onBack={() => setView('dashboard')} />;
  if (view === 'prompts_library') return <PromptLibrary prompts={prompts} onSelectPrompt={(p) => { setCurrentEssay({ prompt_id: p.id, title: p.title }); setView('edit'); }} onBack={() => setView('dashboard')} />;

  // --- DASHBOARD UI ---
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 font-inter">
        
       {/* HEADER HERO */}
       <div className="relative rounded-[2rem] overflow-hidden bg-white dark:bg-[#1a1b1e] shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-white/5 p-8 md:p-10">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-[#42047e]/10 to-[#07f49e]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-[#42047e] to-[#07f49e] p-[2px] shadow-lg shadow-[#42047e]/20">
                        <div className="w-full h-full bg-white dark:bg-[#151518] rounded-[14px] flex items-center justify-center">
                             <PenTool className="text-[#42047e] dark:text-[#07f49e]" size={32} />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                            Facillit <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#42047e] to-[#07f49e]">Write</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-lg mt-1">
                            Sua jornada rumo à nota 1000 começa aqui.
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <button onClick={handleOpenLibrary} className="flex-1 md:flex-none h-12 px-6 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white font-bold hover:border-[#42047e] hover:text-[#42047e] transition-all flex items-center justify-center gap-2 shadow-sm">
                        <BookOpen size={18} /> Temas
                    </button>
                    <button onClick={handleCreateNew} className="flex-1 md:flex-none h-12 px-8 rounded-xl bg-gradient-to-r from-[#42047e] to-[#5a1bf0] hover:to-[#42047e] text-white font-bold shadow-lg shadow-[#42047e]/30 hover:shadow-[#42047e]/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                        <Plus size={18} strokeWidth={3} /> Nova Redação
                    </button>
                </div>
            </div>
      </div>

      {/* TABS DE NAVEGAÇÃO */}
      <div className="flex p-1 bg-gray-100/50 dark:bg-white/5 rounded-2xl w-fit backdrop-blur-sm border border-gray-200/50 dark:border-white/5">
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
                        px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300
                        ${isActive 
                            ? 'bg-white dark:bg-[#1a1b1e] text-[#42047e] shadow-md shadow-gray-200/50 dark:shadow-black/50' 
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }
                    `}
                >
                  <Icon size={16} /> {tab.label}
                </button>
              )
          })}
      </div>

      {/* CONTEÚDO: VISÃO GERAL */}
      {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500">
              
              {/* Coluna Principal (Estatísticas e Gráficos) */}
              <div className="lg:col-span-8 space-y-8">
                  
                  {/* Cards de Métricas */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div className="bg-white dark:bg-[#1a1b1e] p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
                             <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Zap size={60} /></div>
                             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sequência</p>
                             <div className="flex items-baseline gap-1">
                                <h3 className="text-4xl font-black text-gray-900 dark:text-white">{streak}</h3>
                                <span className="text-sm font-bold text-gray-500">dias</span>
                             </div>
                             <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden"><div className="bg-[#07f49e] h-full rounded-full" style={{ width: `${Math.min(streak * 10, 100)}%` }}></div></div>
                        </div>

                        <div className="bg-white dark:bg-[#1a1b1e] p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
                             <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingUp size={60} /></div>
                             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Média Geral</p>
                             <div className="flex items-baseline gap-1">
                                <h3 className="text-4xl font-black text-gray-900 dark:text-white">{statistics?.averages.avg_final_grade.toFixed(0) || '-'}</h3>
                                <span className="text-sm font-bold text-gray-400">/ 1000</span>
                             </div>
                             <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden"><div className="bg-[#42047e] h-full rounded-full" style={{ width: `${(statistics?.averages.avg_final_grade || 0) / 10}%` }}></div></div>
                        </div>

                        <div className="bg-gradient-to-br from-[#42047e] to-[#2E14ED] p-6 rounded-3xl shadow-lg text-white relative overflow-hidden">
                             <div className="absolute -right-4 -top-4 bg-white/10 w-24 h-24 rounded-full blur-xl"></div>
                             <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 flex items-center gap-1"><Trophy size={12} /> Ranking</p>
                             <h3 className="text-4xl font-black mb-1">#{rankInfo?.rank || '-'}</h3>
                             <p className="text-xs font-medium text-white/80 bg-white/10 px-2 py-1 rounded-lg w-fit">{rankInfo?.state || 'Regional'}</p>
                        </div>
                  </div>

                  {/* Gráfico de Evolução */}
                  <div className="bg-white dark:bg-[#1a1b1e] p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                              <BarChart2 className="text-[#42047e]" size={20} /> Evolução de Notas
                          </h3>
                      </div>
                      <div className="h-[300px] w-full">
                          <ProgressionChart data={statistics?.progression || []} />
                      </div>
                  </div>
              </div>

              {/* Coluna Lateral (Notícias e Contador) */}
              <div className="lg:col-span-4 space-y-8">
                   {/* Countdown */}
                   <div className="bg-white dark:bg-[#1a1b1e] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm p-2">
                       <CountdownWidget targetExam={targetExam} examDate={examDate} />
                   </div>

                   {/* Atualidades (Blog) */}
                   <div className="bg-gray-50 dark:bg-[#151518] rounded-3xl p-6 border border-gray-200 dark:border-white/5 h-[500px] flex flex-col">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Newspaper className="text-[#07f49e]" size={20} /> Atualidades & Dicas
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {currentEvents.length > 0 ? (
                                currentEvents.map(evt => <NewsCard key={evt.id} event={evt} />)
                            ) : (
                                <div className="text-center py-10 text-gray-400">
                                    <p>Nenhuma notícia encontrada.</p>
                                </div>
                            )}
                        </div>
                        <div className="pt-4 mt-2 border-t border-gray-200 dark:border-white/5 text-center">
                            <Link href="/recursos/blog?cat=Redação" className="text-sm font-bold text-[#42047e] hover:underline">
                                Ver tudo no Blog
                            </Link>
                        </div>
                   </div>
              </div>
          </div>
      )}

      {/* Outras abas (simplificadas para o exemplo, mas seguindo o estilo) */}
      {activeTab === 'history' && (
           <div className="bg-white dark:bg-[#1a1b1e] rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden animate-in fade-in">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-gray-50 dark:bg-white/5 text-xs text-gray-400 uppercase font-bold">
                          <tr>
                              <th className="px-6 py-4">Título</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4 text-center">Nota</th>
                              <th className="px-6 py-4">Data</th>
                              <th className="px-6 py-4"></th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
                          {essays.map(e => (
                              <tr key={e.id} onClick={() => handleSelectEssay(e)} className="hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors group">
                                  <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">{e.title || "Sem título"}</td>
                                  <td className="px-6 py-4">
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${e.status === 'corrected' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-yellow-50 border-yellow-200 text-yellow-600'}`}>
                                          {e.status === 'corrected' ? 'Corrigida' : 'Em análise'}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 text-center font-black text-lg text-gray-800 dark:text-white">{e.final_grade || '-'}</td>
                                  <td className="px-6 py-4 text-gray-500">{e.submitted_at ? new Date(e.submitted_at).toLocaleDateString() : '-'}</td>
                                  <td className="px-6 py-4 text-right">
                                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-400 group-hover:bg-[#42047e] group-hover:text-white transition-all">
                                          <ChevronRight size={16} />
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  {essays.length === 0 && <div className="p-12 text-center text-gray-400">Nenhuma redação encontrada. Comece a escrever agora!</div>}
               </div>
           </div>
      )}

      {activeTab === 'analytics' && (
          <div className="animate-in fade-in">
              <StatisticsWidget stats={statistics} frequentErrors={frequentErrors} />
          </div>
      )}
    </div>
  );
}