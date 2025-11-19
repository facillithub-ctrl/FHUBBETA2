"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Essay, EssayPrompt, getEssaysForStudent } from '../actions';
import EssayEditor from './EssayEditor';
import EssayCorrectionView from './EssayCorrectionView';
import StatisticsWidget from './StatisticsWidget';
import ProgressionChart from './ProgressionChart';
import PromptSelector from './PromptSelector'; // Importação separada agora
import Link from 'next/link';

// --- TIPOS (Mantidos para consistência) ---
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

// --- COMPONENTES VISUAIS AUXILIARES ---

const WriteHero = ({ onNewEssay }: { onNewEssay: () => void }) => (
  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-purple to-brand-purple/80 text-white p-8 mb-8 shadow-lg">
    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div>
        <h1 className="text-3xl font-black mb-2">Estúdio de Redação ✍️</h1>
        <p className="text-white/90 text-lg max-w-xl">
          A prática leva à nota 1000. Escolhe um tema, controla o tempo e recebe feedback instantâneo com IA.
        </p>
      </div>
      <button 
        onClick={onNewEssay}
        className="group bg-brand-green text-brand-purple font-black py-3 px-6 rounded-xl shadow-lg hover:bg-white hover:scale-105 transition-all flex items-center gap-2"
      >
        <i className="fas fa-plus text-lg group-hover:rotate-90 transition-transform"></i>
        Nova Redação
      </button>
    </div>
    {/* Decorativos de fundo */}
    <div className="absolute -right-10 -bottom-20 text-9xl opacity-10 rotate-12">
      <i className="fas fa-feather-alt"></i>
    </div>
    <div className="absolute top-0 left-0 w-full h-full bg-white/5 backdrop-blur-[1px]"></div>
  </div>
);

const MetricCard = ({ label, value, subtext, icon, trend }: { label: string, value: string | number, subtext?: string, icon: string, trend?: 'up' | 'down' | 'neutral' }) => (
  <div className="bg-white dark:bg-dark-card rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between h-full relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
     <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-brand-purple/10 text-brand-purple rounded-xl group-hover:bg-brand-purple group-hover:text-white transition-colors">
           <i className={`fas ${icon} text-xl`}></i>
        </div>
        {trend && (
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {trend === 'up' ? '↑ Subindo' : '- Estável'}
            </span>
        )}
     </div>
     <div>
        <h3 className="text-3xl font-black text-text-primary dark:text-white mb-1">{value}</h3>
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        {subtext && <p className="text-xs text-text-muted mt-1 opacity-80">{subtext}</p>}
     </div>
  </div>
);

const EssayListItem = ({ essay, onClick }: { essay: Partial<Essay>, onClick: () => void }) => {
    const statusColors = {
        draft: 'bg-gray-100 text-gray-600 border-gray-200',
        submitted: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        corrected: 'bg-green-50 text-green-700 border-green-200',
        canceld: 'bg-red-50 text-red-700 border-red-200' // Caso exista
    };
    const statusLabels = {
        draft: 'Rascunho',
        submitted: 'Em Análise',
        corrected: 'Corrigida',
        canceld: 'Cancelada'
    };
    
    // @ts-ignore - Garantir acesso seguro ao status
    const status = essay.status || 'draft';
    const colorClass = statusColors[status as keyof typeof statusColors] || statusColors.draft;
    const label = statusLabels[status as keyof typeof statusLabels] || 'Desconhecido';

    return (
        <div 
            onClick={onClick}
            className="group flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all cursor-pointer"
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${status === 'corrected' ? 'bg-brand-green/20 text-brand-green' : 'bg-gray-100 text-gray-400'}`}>
                    <i className={`fas ${status === 'corrected' ? 'fa-check' : status === 'draft' ? 'fa-pen' : 'fa-clock'}`}></i>
                </div>
                <div>
                    <h4 className="font-bold text-text-primary dark:text-white group-hover:text-brand-purple transition-colors line-clamp-1">
                        {essay.title || "Sem título"}
                    </h4>
                    <p className="text-xs text-text-secondary">
                        {essay.submitted_at ? new Date(essay.submitted_at).toLocaleDateString('pt-BR') : 'Editado recentemente'}
                    </p>
                </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
                {label}
            </div>
        </div>
    );
}

// --- COMPONENTE PRINCIPAL ---

export default function StudentDashboard({ initialEssays, prompts, statistics, streak, rankInfo, frequentErrors, currentEvents }: Props) {
  const [essays, setEssays] = useState(initialEssays);
  const [view, setView] = useState<'dashboard' | 'edit' | 'view_correction' | 'select_prompt'>('dashboard');
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
      if (essayToOpen) handleSelectEssay(essayToOpen);
    }
  }, [searchParams, initialEssays, handleSelectEssay]);

  const startNewEssayFlow = () => {
    setCurrentEssay(null);
    setView('select_prompt'); // Agora vai para a seleção de tema primeiro
  };

  const handlePromptSelected = (prompt: EssayPrompt) => {
    // Aqui criaríamos o rascunho no banco idealmente, mas para simplificar:
    setCurrentEssay({ title: prompt.title, prompt_id: prompt.id }); // Mock inicial
    setView('edit');
  };

  const handleBackToDashboard = async () => {
    const result = await getEssaysForStudent();
    if (result.data) setEssays(result.data);
    setView('dashboard');
    setCurrentEssay(null);
    window.history.pushState({}, '', '/dashboard/applications/write');
  };

  // Roteamento de Vistas
  if (view === 'edit') return <EssayEditor essay={currentEssay} prompts={prompts} onBack={handleBackToDashboard} />;
  if (view === 'view_correction' && currentEssay?.id) return <EssayCorrectionView essayId={currentEssay.id} onBack={handleBackToDashboard} />;
  if (view === 'select_prompt') return <PromptSelector prompts={prompts} onSelect={handlePromptSelected} onBack={() => setView('dashboard')} />;

  return (
    <div className="pb-10 max-w-7xl mx-auto">
      
      <WriteHero onNewEssay={startNewEssayFlow} />
      
      {/* Grid Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         
         {/* 1. Métricas Principais (Topo) */}
         <div className="lg:col-span-3">
            <MetricCard 
                label="Média Geral" 
                value={statistics?.averages.avg_final_grade.toFixed(0) || '-'} 
                icon="fa-chart-line"
                trend={statistics ? 'up' : 'neutral'} // Lógica real seria comparando com anterior
            />
         </div>
         <div className="lg:col-span-3">
            <MetricCard 
                label="Redações Feitas" 
                value={statistics?.totalCorrections || 0} 
                icon="fa-file-alt"
            />
         </div>
         <div className="lg:col-span-3">
            <MetricCard 
                label="Ofensiva" 
                value={`${streak} dias`} 
                icon="fa-fire"
                subtext="Mantenha o ritmo!"
            />
         </div>
         <div className="lg:col-span-3">
            <MetricCard 
                label="Ranking" 
                value={rankInfo?.rank ? `#${rankInfo.rank}` : '-'} 
                subtext={rankInfo?.state || 'Nacional'}
                icon="fa-trophy"
            />
         </div>

         {/* 2. Gráfico de Evolução (Maior destaque) */}
         <div className="lg:col-span-8 min-h-[300px] bg-white dark:bg-dark-card rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-text-primary dark:text-white">A Tua Evolução</h3>
                <select className="text-xs bg-bg-secondary dark:bg-gray-800 border-none rounded-lg px-3 py-1">
                    <option>Últimos 6 meses</option>
                </select>
            </div>
            <div className="h-[250px] w-full">
                {statistics ? (
                    <ProgressionChart data={statistics.progression} />
                ) : (
                    <div className="h-full flex items-center justify-center text-text-muted">
                        Ainda sem dados suficientes para o gráfico.
                    </div>
                )}
            </div>
         </div>

         {/* 3. Widgets Laterais (Insights) */}
         <div className="lg:col-span-4 flex flex-col gap-6">
             {/* Card de Estatísticas Detalhadas */}
             <div className="bg-white dark:bg-dark-card rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex-1">
                {statistics ? (
                    <StatisticsWidget stats={statistics} frequentErrors={frequentErrors} />
                ) : (
                    <p className="text-center py-10 text-text-muted">Estatísticas indisponíveis.</p>
                )}
             </div>
         </div>

         {/* 4. Lista de Redações (Histórico) */}
         <div className="lg:col-span-8 bg-white dark:bg-dark-card rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-lg text-text-primary dark:text-white">Histórico Recente</h3>
                 <Link href="#" className="text-sm text-brand-purple font-bold hover:underline">Ver todas</Link>
             </div>
             <div className="flex flex-col gap-2">
                 {essays.length > 0 ? (
                     essays.slice(0, 5).map(essay => (
                         <EssayListItem key={essay.id} essay={essay} onClick={() => handleSelectEssay(essay)} />
                     ))
                 ) : (
                     <div className="text-center py-10">
                         <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                             <i className="fas fa-file-signature"></i>
                         </div>
                         <p className="text-text-muted">Ainda não tens redações.</p>
                         <button onClick={startNewEssayFlow} className="mt-2 text-brand-purple font-bold text-sm hover:underline">Criar a primeira</button>
                     </div>
                 )}
             </div>
         </div>

         {/* 5. Notícias / Atualidades */}
         <div className="lg:col-span-4 bg-white dark:bg-dark-card rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
             <h3 className="font-bold text-lg text-text-primary dark:text-white mb-4 flex items-center gap-2">
                 <i className="fas fa-globe-americas text-brand-green"></i> Repertório Sócio-cultural
             </h3>
             <div className="space-y-4">
                 {currentEvents.length > 0 ? currentEvents.map(event => (
                     <a 
                        key={event.id} 
                        href={event.link} 
                        target="_blank" 
                        className="block p-4 bg-bg-secondary dark:bg-gray-800/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                     >
                        <p className="text-xs text-brand-purple font-bold mb-1 uppercase tracking-wider">Atualidade</p>
                        <h4 className="font-bold text-sm text-text-primary dark:text-white mb-1 line-clamp-2">{event.title}</h4>
                        <p className="text-xs text-text-muted line-clamp-2">{event.summary}</p>
                     </a>
                 )) : (
                    <p className="text-text-muted text-sm">Nenhuma notícia recente.</p>
                 )}
             </div>
         </div>

      </div>
    </div>
  );
}