"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Essay, EssayPrompt, getEssaysForStudent, getUserActionPlans, saveStudyPlan } from '../actions';
import EssayEditor from './EssayEditor';
import EssayCorrectionView from './EssayCorrectionView';
import StatisticsWidget from './StatisticsWidget';
import ProgressionChart from './ProgressionChart';
import CountdownWidget from '@/components/dashboard/CountdownWidget';
import { useToast } from '@/contexts/ToastContext';

// Tipos
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

// --- COMPONENTES VISUAIS ---

const GlassCard = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
    <div 
        onClick={onClick}
        className={`bg-white/80 dark:bg-[#1A1A1D]/70 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-lg rounded-[2rem] transition-all duration-300 ${className}`}
    >
        {children}
    </div>
);

const StatBadge = ({ icon, value, label, colorClass, trend }: any) => (
    <GlassCard className="p-6 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-3xl opacity-20 transition-all group-hover:opacity-30 ${colorClass}`}></div>
        <div className="relative z-10 flex justify-between items-start">
            <div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 ${colorClass} bg-opacity-10 text-opacity-100 transition-transform group-hover:scale-110`}>
                    <i className={`fas ${icon}`}></i>
                </div>
                <h4 className="text-3xl font-black text-dark-text dark:text-white tracking-tight">{value}</h4>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-1">{label}</p>
            </div>
            {trend && (
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <i className="fas fa-arrow-up"></i> {trend}
                </span>
            )}
        </div>
    </GlassCard>
);

// Componente de Tarefa Individual (Checkbox)
const ActionTask = ({ task, onToggle }: { task: {id:string, text:string, completed:boolean}, onToggle: () => void }) => (
    <div 
        onClick={onToggle}
        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${task.completed ? 'bg-green-50 dark:bg-green-900/10 border-green-200' : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 hover:border-brand-purple/30'}`}
    >
        <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-gray-600 group-hover:border-brand-purple'}`}>
            {task.completed && <i className="fas fa-check text-xs"></i>}
        </div>
        <span className={`text-sm font-medium transition-all ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'}`}>{task.text}</span>
    </div>
);

export default function StudentDashboard({ initialEssays, prompts, statistics, streak, rankInfo, frequentErrors, currentEvents, targetExam, examDate }: Props) {
  const [essays, setEssays] = useState(initialEssays);
  const [view, setView] = useState<'dashboard' | 'edit' | 'view_correction'>('dashboard');
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'stats'>('overview');
  const [currentEssay, setCurrentEssay] = useState<Partial<Essay> | null>(null);
  const [actionPlans, setActionPlans] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  // Busca Planos de Ação ao entrar na aba
  useEffect(() => {
      if (activeTab === 'plans') {
          getUserActionPlans().then(res => setActionPlans(res.data));
      }
  }, [activeTab]);

  // Atualiza tarefa e salva no banco
  const handleToggleTask = async (essayId: string, taskIndex: number) => {
      const planIndex = actionPlans.findIndex(p => p.essay_id === essayId);
      if (planIndex === -1) return;

      const updatedPlans = [...actionPlans];
      const task = updatedPlans[planIndex].tasks[taskIndex];
      task.completed = !task.completed;
      
      // Atualização otimista da UI
      setActionPlans(updatedPlans);

      // Salva no banco
      await saveStudyPlan(essayId, updatedPlans[planIndex].tasks);
  };

  const handleSelectEssay = useCallback((essay: Partial<Essay>) => {
    setCurrentEssay(essay);
    setView(essay.status === 'corrected' ? 'view_correction' : 'edit');
  }, []);

  useEffect(() => {
    const essayIdFromUrl = searchParams.get('essayId');
    if (essayIdFromUrl) {
        const found = initialEssays.find(e => e.id === essayIdFromUrl);
        if (found) handleSelectEssay(found);
    }
  }, [searchParams, initialEssays, handleSelectEssay]);

  const handleBack = async () => {
      const res = await getEssaysForStudent();
      if (res.data) setEssays(res.data as any);
      setView('dashboard');
      setCurrentEssay(null);
  };

  if (view === 'edit') return <EssayEditor essay={currentEssay} prompts={prompts} onBack={handleBack} />;
  if (view === 'view_correction' && currentEssay?.id) return <EssayCorrectionView essayId={currentEssay.id} onBack={handleBack} />;

  return (
    <div className="pb-12 space-y-8">
       {/* Header & Tabs */}
       <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
           <div>
               <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-green">
                   Central de Redação
               </h1>
               <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie seus textos e evolução.</p>
           </div>
           
           <div className="flex bg-white dark:bg-white/5 p-1.5 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 backdrop-blur-sm">
               {['overview', 'plans', 'stats'].map(tab => (
                   <button
                       key={tab}
                       onClick={() => setActiveTab(tab as any)}
                       className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === tab ? 'bg-brand-purple text-white shadow-md scale-105' : 'text-gray-500 hover:text-brand-purple'}`}
                   >
                       {tab === 'overview' ? 'Visão Geral' : tab === 'plans' ? 'Meus Planos' : 'Estatísticas'}
                   </button>
               ))}
           </div>
       </div>

       {/* --- CONTEÚDO DAS ABAS --- */}
       
       {/* 1. VISÃO GERAL */}
       {activeTab === 'overview' && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
               {/* Hero Card */}
               <div className="lg:col-span-2 bg-brand-dark text-white rounded-[2rem] p-8 relative overflow-hidden shadow-2xl border border-white/10">
                   <div className="absolute inset-0 bg-gradient-to-br from-brand-purple via-brand-dark to-brand-green opacity-90"></div>
                   <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-brand-green/20 rounded-full blur-[128px] mix-blend-screen animate-pulse"></div>
                   
                   <div className="relative z-10">
                       <div className="flex justify-between items-start mb-8">
                           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-brand-green">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Próximo Passo
                           </div>
                           <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-bold flex items-center gap-2">
                               🔥 {streak} dias seguidos
                           </div>
                       </div>
                       <h2 className="text-3xl font-black mb-4">Escreva sobre "O Futuro da IA na Educação"</h2>
                       <p className="text-white/70 mb-8 max-w-lg text-sm leading-relaxed">
                           Estudantes que praticam este tema aumentam a nota da Competência 2 em média 40 pontos.
                       </p>
                       <div className="flex gap-3">
                           <button onClick={() => {setCurrentEssay(null); setView('edit')}} className="px-6 py-3 bg-white text-brand-dark font-bold rounded-xl hover:bg-brand-green hover:text-white transition-colors shadow-lg flex items-center gap-2">
                               <i className="fas fa-pen"></i> Começar Redação
                           </button>
                           <button onClick={() => setActiveTab('plans')} className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 backdrop-blur-md transition-colors border border-white/10">
                               Ver Metas
                           </button>
                       </div>
                   </div>
               </div>

               {/* Side Widgets */}
               <div className="space-y-6">
                    <div className="bg-white dark:bg-dark-card p-6 rounded-[2rem] shadow-md border border-gray-100 dark:border-white/5 h-full">
                        <CountdownWidget targetExam={targetExam} examDate={examDate} />
                    </div>
               </div>

               {/* Recent History */}
               <div className="lg:col-span-3 bg-white dark:bg-dark-card p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                   <div className="flex justify-between items-center mb-6">
                       <h3 className="font-bold text-lg dark:text-white">Histórico Recente</h3>
                       <div className="text-xs text-gray-400">{essays.length} redações totais</div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {essays.length > 0 ? essays.slice(0, 3).map(essay => (
                           <div key={essay.id} onClick={() => handleSelectEssay(essay)} className="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-white hover:shadow-lg border border-transparent hover:border-brand-purple/20 cursor-pointer transition-all group">
                               <div className="flex justify-between items-start mb-3">
                                   <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide ${essay.status === 'corrected' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                       {essay.status === 'corrected' ? 'Corrigida' : 'Em Análise'}
                                   </span>
                                   {essay.final_grade && <span className="font-black text-brand-purple text-lg">{essay.final_grade}</span>}
                               </div>
                               <h4 className="font-bold text-dark-text dark:text-white truncate mb-1 group-hover:text-brand-purple transition-colors">{essay.title || "Sem título"}</h4>
                               <p className="text-xs text-gray-500 flex items-center gap-2">
                                   <i className="far fa-clock"></i> {new Date(essay.submitted_at!).toLocaleDateString()}
                               </p>
                           </div>
                       )) : (
                           <div className="col-span-3 text-center py-8 text-gray-400">Nenhuma redação encontrada.</div>
                       )}
                   </div>
               </div>
           </div>
       )}

       {/* 2. PLANOS DE AÇÃO */}
       {activeTab === 'plans' && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-right">
               <div className="lg:col-span-2 space-y-6">
                   {actionPlans.length > 0 ? actionPlans.map((plan, i) => {
                       const completed = plan.tasks.filter((t: any) => t.completed).length;
                       const total = plan.tasks.length;
                       const progress = total > 0 ? (completed / total) * 100 : 0;

                       return (
                           <GlassCard key={i} className="p-6 hover:border-brand-purple/30">
                               <div className="flex justify-between items-start mb-4">
                                   <div>
                                       <h3 className="font-bold text-lg text-dark-text dark:text-white">{plan.essay_title}</h3>
                                       <p className="text-xs text-gray-500">Gerado em {new Date(plan.created_at).toLocaleDateString()}</p>
                                   </div>
                                   <div className="text-right">
                                       <span className="text-2xl font-black text-brand-purple">{Math.round(progress)}%</span>
                                       <p className="text-[10px] font-bold text-gray-400 uppercase">Concluído</p>
                                   </div>
                               </div>
                               
                               {/* Barra de Progresso do Card */}
                               <div className="w-full bg-gray-100 dark:bg-white/10 h-2 rounded-full mb-6 overflow-hidden">
                                   <div className="h-full bg-gradient-to-r from-brand-purple to-brand-green transition-all duration-500" style={{ width: `${progress}%` }}></div>
                               </div>

                               <div className="space-y-2">
                                   {plan.tasks.map((task: any, tIdx: number) => (
                                       <ActionTask key={task.id || tIdx} task={task} onToggle={() => handleToggleTask(plan.essay_id, tIdx)} />
                                   ))}
                               </div>
                           </GlassCard>
                       );
                   }) : (
                       <div className="bg-white dark:bg-dark-card p-12 rounded-[2rem] text-center border border-dashed border-gray-300 dark:border-gray-700">
                           <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🌱</div>
                           <h3 className="font-bold text-lg mb-2">Nenhum Plano Ativo</h3>
                           <p className="text-gray-500 mb-6">Corrija uma redação e use o botão "Gerar Plano IA" para criar metas personalizadas.</p>
                           <button onClick={() => {setCurrentEssay(null); setView('edit')}} className="text-brand-purple font-bold hover:underline">Escrever Redação</button>
                       </div>
                   )}
               </div>
               
               {/* Sidebar do Plano */}
               <div className="space-y-6">
                   <div className="bg-brand-purple text-white p-8 rounded-[2rem] relative overflow-hidden text-center shadow-xl">
                       <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-10"></div>
                       <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md text-2xl">
                           <i className="fas fa-robot text-brand-green"></i>
                       </div>
                       <h3 className="font-bold text-xl mb-2">IA Coach</h3>
                       <p className="text-white/80 text-sm mb-6 leading-relaxed">
                           Nossa IA analisa seus erros recorrentes e cria tarefas práticas para você evoluir mais rápido.
                       </p>
                       <Link href="/dashboard/applications/test" className="block w-full py-3.5 bg-white text-brand-purple font-bold rounded-xl hover:bg-brand-green hover:text-white transition-all shadow-lg">
                           Fazer Diagnóstico Geral
                       </Link>
                   </div>
               </div>
           </div>
       )}

       {/* 3. ESTATÍSTICAS */}
       {activeTab === 'stats' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
                <div className="grid grid-cols-2 gap-4 lg:col-span-2">
                    <StatBadge icon="fa-chart-line" value={statistics?.totalCorrections || 0} label="Redações" colorClass="text-blue-500 bg-blue-500" />
                    <StatBadge icon="fa-star" value={statistics?.averages.avg_final_grade.toFixed(0) || 0} label="Média Geral" colorClass="text-purple-500 bg-purple-500" />
                </div>
               <div className="bg-white dark:bg-dark-card p-8 rounded-[2rem] shadow-md border border-gray-100">
                    <h3 className="font-bold text-lg mb-6 dark:text-white">Evolução da Nota</h3>
                    <ProgressionChart data={statistics?.progression || []} />
               </div>
               <div className="bg-white dark:bg-dark-card p-8 rounded-[2rem] shadow-md border border-gray-100">
                    <StatisticsWidget stats={statistics} frequentErrors={frequentErrors} />
               </div>
           </div>
       )}
    </div>
  );
}