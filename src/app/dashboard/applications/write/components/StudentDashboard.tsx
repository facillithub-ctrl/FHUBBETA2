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
import Image from 'next/image';

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
    <GlassCard className="p-6 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1">
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
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <i className="fas fa-arrow-up"></i> {trend}
                </span>
            )}
        </div>
    </GlassCard>
);

const ActionPlanList = () => {
    // Mock de planos de ação (idealmente viria do backend)
    const plans = [
        { id: 1, title: "Melhorar uso de conectivos", progress: 75, total: 4, done: 3 },
        { id: 2, title: "Revisar regras de crase", progress: 30, total: 3, done: 1 },
        { id: 3, title: "Estrutura da Proposta de Intervenção", progress: 0, total: 5, done: 0 },
    ];

    return (
        <div className="space-y-4">
            {plans.map(plan => (
                <div key={plan.id} className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10 hover:border-brand-purple/30 transition-colors group">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-dark-text dark:text-white group-hover:text-brand-purple transition-colors">{plan.title}</h4>
                        <span className="text-xs font-bold text-gray-500">{plan.done}/{plan.total}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-brand-purple to-brand-green transition-all duration-1000" 
                            style={{ width: `${plan.progress}%` }}
                        ></div>
                    </div>
                </div>
            ))}
             <button className="w-full py-3 mt-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-500 font-bold hover:border-brand-purple hover:text-brand-purple transition-all flex items-center justify-center gap-2">
                <i className="fas fa-plus"></i> Novo Plano Manual
            </button>
        </div>
    );
};

export default function StudentDashboard({ initialEssays, prompts, statistics, streak, rankInfo, frequentErrors, currentEvents, targetExam, examDate }: Props) {
  const [essays, setEssays] = useState(initialEssays);
  const [view, setView] = useState<'dashboard' | 'edit' | 'view_correction'>('dashboard');
  const [activeTab, setActiveTab] = useState<'overview' | 'plans'>('overview'); // Nova Navegação
  const [currentEssay, setCurrentEssay] = useState<Partial<Essay> | null>(null);
  const searchParams = useSearchParams();

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
        {/* --- HEADER & HERO --- */}
        <div className="flex flex-col gap-8">
             <div className="relative rounded-[2.5rem] overflow-hidden bg-brand-dark p-10 md:p-14 text-white shadow-2xl ring-1 ring-white/10">
                {/* Efeitos de Fundo */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-purple via-brand-dark to-brand-green opacity-80"></div>
                <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-brand-green/30 rounded-full blur-[128px] mix-blend-screen animate-pulse"></div>
                <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] bg-brand-purple/40 rounded-full blur-[100px] mix-blend-screen"></div>
                
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold mb-6 text-brand-green shadow-lg">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Oficina de Redação Ativa
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight leading-tight">
                            Sua Jornada <br/>rumo à <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-white">Nota 1000</span>
                        </h1>
                        <p className="text-white/70 text-lg max-w-lg mx-auto lg:mx-0 font-medium">
                            Pratique com temas atualizados, receba correções detalhadas e siga um plano de ação personalizado.
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => { setCurrentEssay(null); setView('edit'); }}
                        className="group relative px-8 py-5 bg-white text-brand-purple font-black text-lg rounded-2xl shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(7,244,158,0.5)] hover:scale-105 transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="relative flex items-center gap-3">
                            <i className="fas fa-pen-nib text-brand-green"></i> Escrever Agora
                        </span>
                    </button>
                </div>
            </div>

            {/* --- TABS DE NAVEGAÇÃO --- */}
            <div className="flex justify-center">
                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-sm inline-flex">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'overview' ? 'bg-brand-purple text-white shadow-md' : 'text-gray-500 hover:text-brand-purple'}`}
                    >
                        Visão Geral
                    </button>
                    <button 
                        onClick={() => setActiveTab('plans')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'plans' ? 'bg-brand-purple text-white shadow-md' : 'text-gray-500 hover:text-brand-purple'}`}
                    >
                        Meus Planos <span className="bg-brand-green text-brand-dark text-[10px] px-1.5 rounded-md">Novo</span>
                    </button>
                </div>
            </div>
        </div>

        {activeTab === 'overview' ? (
            <div className="space-y-8 animate-fade-in-up">
                {/* --- STATS ROW --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatBadge icon="fa-fire" value={streak} label="Dias Seguidos" colorClass="text-orange-500 bg-orange-500" trend="Estável" />
                    <StatBadge icon="fa-trophy" value={rankInfo?.rank ? `#${rankInfo.rank}` : '-'} label="Ranking Estadual" colorClass="text-yellow-500 bg-yellow-500" />
                    <StatBadge icon="fa-file-alt" value={essays.length} label="Redações Feitas" colorClass="text-blue-500 bg-blue-500" trend="+2 este mês" />
                    <GlassCard className="p-0 overflow-hidden bg-gradient-to-br from-brand-purple/5 to-brand-green/5 border-brand-purple/10">
                        <CountdownWidget targetExam={targetExam} examDate={examDate} />
                    </GlassCard>
                </div>

                {/* --- MAIN CONTENT --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Evolution & History */}
                    <div className="lg:col-span-2 space-y-8">
                        <GlassCard className="p-8 min-h-[400px]">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-dark-text dark:text-white">Sua Evolução</h3>
                                    <p className="text-sm text-gray-500">Acompanhe o histórico das suas notas.</p>
                                </div>
                                <select className="bg-gray-50 dark:bg-white/5 border-none rounded-xl text-xs font-bold p-3 text-gray-600 dark:text-white cursor-pointer hover:bg-gray-100 transition-colors">
                                    <option>Últimos 6 meses</option>
                                    <option>Todo o período</option>
                                </select>
                            </div>
                            {statistics?.progression ? (
                                <ProgressionChart data={statistics.progression} />
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center text-center opacity-50">
                                    <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <i className="fas fa-chart-line text-3xl text-gray-300"></i>
                                    </div>
                                    <p className="font-medium text-gray-500">Gráfico indisponível</p>
                                </div>
                            )}
                        </GlassCard>

                        <GlassCard className="p-8">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-dark-text dark:text-white">Histórico Recente</h3>
                                    <p className="text-sm text-gray-500">Suas últimas submissões.</p>
                                </div>
                                <Link href="#" className="text-sm font-bold text-brand-purple hover:text-brand-green transition-colors flex items-center gap-1">
                                    Ver tudo <i className="fas fa-arrow-right"></i>
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {essays.length > 0 ? essays.slice(0, 5).map(essay => (
                                    <div key={essay.id} onClick={() => handleSelectEssay(essay)} className="group flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-transparent hover:border-brand-purple/20 shadow-sm hover:shadow-md transition-all cursor-pointer">
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg shadow-sm transition-colors ${essay.status === 'corrected' ? 'bg-brand-green/10 text-brand-green group-hover:bg-brand-green group-hover:text-white' : 'bg-gray-200 text-gray-500'}`}>
                                                <i className={`fas ${essay.status === 'corrected' ? 'fa-check' : 'fa-clock'}`}></i>
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-dark-text dark:text-white truncate text-base group-hover:text-brand-purple transition-colors">{essay.title || "Sem título"}</h4>
                                                <p className="text-xs text-gray-500 flex items-center gap-2">
                                                    <i className="far fa-calendar"></i> {new Date(essay.submitted_at || Date.now()).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                        </div>
                                        {essay.final_grade && (
                                            <div className="text-right pl-4">
                                                <p className="text-xs text-gray-400 uppercase font-bold">Nota</p>
                                                <p className="text-xl font-black text-brand-purple">{essay.final_grade}</p>
                                            </div>
                                        )}
                                    </div>
                                )) : (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500">Ainda não tens redações. Que tal começar agora?</p>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>

                    {/* Right: Widgets */}
                    <div className="space-y-8">
                        <GlassCard className="p-8 bg-gradient-to-br from-white to-gray-50 dark:from-[#1A1A1D] dark:to-[#111114]">
                            <StatisticsWidget stats={statistics} frequentErrors={frequentErrors} />
                        </GlassCard>

                        <GlassCard className="p-8 relative overflow-hidden bg-brand-purple text-white border-none">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                            <h3 className="font-bold text-lg mb-4 relative z-10 flex items-center gap-2">
                                <i className="fas fa-lightbulb text-yellow-300"></i> Dica do Dia
                            </h3>
                            <p className="text-white/80 text-sm leading-relaxed relative z-10">
                                "Evite o uso excessivo do gerúndio. Em vez de 'estarei fazendo', prefira 'farei'. Isso torna seu texto mais direto e elegante."
                            </p>
                            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                                <span className="text-xs font-bold opacity-60">Gramática</span>
                                <button className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">Ler mais</button>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        ) : (
            // --- ABA DE PLANOS DE AÇÃO ---
            <div className="animate-fade-in-right">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <GlassCard className="p-8">
                            <h2 className="text-2xl font-black text-dark-text dark:text-white mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green flex items-center justify-center"><i className="fas fa-tasks"></i></div>
                                Meus Planos de Estudo
                            </h2>
                            <ActionPlanList />
                        </GlassCard>
                    </div>
                    <div>
                         <GlassCard className="p-8 text-center">
                            <div className="w-20 h-20 mx-auto bg-brand-purple/10 rounded-full flex items-center justify-center text-brand-purple text-3xl mb-4">
                                <i className="fas fa-robot"></i>
                            </div>
                            <h3 className="font-bold text-lg mb-2 text-dark-text dark:text-white">IA Coach</h3>
                            <p className="text-sm text-gray-500 mb-6">Nossa IA analisa suas redações e cria planos automáticos para você.</p>
                            <Link href="/dashboard/applications/test" className="block w-full py-3 rounded-xl bg-brand-dark text-white font-bold text-sm hover:bg-brand-purple transition-colors">
                                Fazer Diagnóstico
                            </Link>
                         </GlassCard>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}