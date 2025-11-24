"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Essay, EssayPrompt } from '../actions';
import EssayEditor from './EssayEditor';
import EssayCorrectionView from './EssayCorrectionView';
import ProgressionChart from './ProgressionChart';
import StatisticsWidget from './StatisticsWidget';
import CountdownWidget from '@/components/dashboard/CountdownWidget';

// Tipos completos para garantir compatibilidade
type Props = {
  initialEssays: Partial<Essay>[];
  prompts: EssayPrompt[];
  statistics: any;
  streak: number;
  rankInfo: any;
  frequentErrors: any[];
  currentEvents: any[];
  targetExam: string | null | undefined;
  examDate: string | null | undefined;
};

export default function StudentDashboard({ 
    initialEssays, prompts, statistics, streak, rankInfo, frequentErrors, currentEvents, targetExam, examDate 
}: Props) {
  const [view, setView] = useState<'dashboard' | 'edit' | 'view_correction'>('dashboard');
  const [currentEssayId, setCurrentEssayId] = useState<string | null>(null);
  const [essays, setEssays] = useState(initialEssays);

  // Funções de Navegação
  const handleCreateNew = () => {
    setCurrentEssayId(null);
    setView('edit');
  };

  const handleViewEssay = (id: string) => {
      setCurrentEssayId(id);
      setView('view_correction');
  };

  const handleBack = () => {
      setView('dashboard');
      setCurrentEssayId(null);
  };

  // Renderização Condicional de Telas
  if (view === 'edit') return <EssayEditor prompts={prompts} onBack={handleBack} />;
  if (view === 'view_correction' && currentEssayId) return <EssayCorrectionView essayId={currentEssayId} onBack={handleBack} />;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
        
        {/* --- 1. HERO SECTION (Novo Design) --- */}
        <div className="relative bg-gradient-to-r from-[#1a0b2e] via-[#2e0259] to-[#42047e] p-8 sm:p-10 rounded-[2rem] text-white shadow-2xl overflow-hidden border border-[#ffffff]/10">
             {/* Efeitos de Fundo */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-[#07f49e] blur-[150px] opacity-20 rounded-full pointer-events-none -mr-20 -mt-20"></div>
             <div className="relative z-10 flex flex-col lg:flex-row justify-between items-end gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-xs font-bold text-[#07f49e] mb-3">
                        <i className="fas fa-fire"></i> Sequência: {streak} dias
                    </div>
                    <h1 className="text-4xl font-black mb-2 leading-tight tracking-tight">Central de Redação</h1>
                    <p className="text-white/70 max-w-lg text-lg">
                        Pronto para evoluir? Sua média atual é <strong className="text-white">{statistics?.averages.avg_final_grade.toFixed(0) || 0}</strong>. 
                        A IA sugere focar na <strong>Competência 1</strong> hoje.
                    </p>
                </div>
                <div className="flex gap-3 w-full lg:w-auto">
                    <button onClick={handleCreateNew} className="flex-1 lg:flex-none bg-[#07f49e] text-[#1a0b2e] font-black py-3.5 px-8 rounded-xl shadow-[0_0_20px_rgba(7,244,158,0.4)] hover:shadow-[0_0_30px_rgba(7,244,158,0.6)] hover:scale-105 transition-all flex items-center justify-center gap-2 group">
                        <i className="fas fa-pen group-hover:rotate-12 transition-transform"></i> Escrever Redação
                    </button>
                </div>
             </div>
        </div>

        {/* --- 2. ESTATÍSTICAS E GRÁFICOS (Restaurados e Melhorados) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Esquerda: Gráfico de Progressão */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 h-[420px] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-xl dark:text-white flex items-center gap-2">
                        <i className="fas fa-chart-line text-[#42047e]"></i> Evolução da Nota
                    </h3>
                </div>
                <div className="flex-1 w-full h-full">
                    {statistics?.progression ? (
                        <ProgressionChart data={statistics.progression} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">Sem dados suficientes.</div>
                    )}
                </div>
            </div>

            {/* Coluna Direita: Widget de Estatísticas Detalhado (Antigo restaurado) */}
            <div className="lg:col-span-1 h-[420px]">
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 h-full overflow-hidden">
                    <StatisticsWidget stats={statistics} frequentErrors={frequentErrors} />
                </div>
            </div>
        </div>

        {/* --- 3. LISTA DE REDAÇÕES (Funcionalidade Antiga com Design Novo) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista Principal */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="font-bold text-xl dark:text-white">Minhas Redações</h3>
                    <span className="bg-gray-100 dark:bg-gray-800 text-xs font-bold px-2 py-1 rounded text-gray-600 dark:text-gray-400">{essays.length} Total</span>
                </div>
                
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-4">
                    {essays.length > 0 ? (
                        <div className="space-y-3">
                            {essays.map((essay) => (
                                <div 
                                    key={essay.id} 
                                    onClick={() => handleViewEssay(essay.id!)}
                                    className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-transparent hover:border-[#42047e]/30 hover:bg-white dark:hover:bg-gray-800 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg shadow-sm ${essay.status === 'corrected' ? 'bg-[#07f49e]/20 text-[#07f49e]' : 'bg-yellow-100 text-yellow-600'}`}>
                                            <i className={`fas ${essay.status === 'corrected' ? 'fa-check' : 'fa-clock'}`}></i>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 dark:text-white group-hover:text-[#42047e] transition-colors line-clamp-1">
                                                {essay.title || "Sem título"}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Enviado em {new Date(essay.submitted_at!).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right">
                                        {essay.status === 'corrected' ? (
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-bold text-gray-400 uppercase">Nota</span>
                                                <span className="text-xl font-black text-[#42047e] dark:text-[#07f49e]">{essay.final_grade}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                                                Em Análise
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <i className="fas fa-folder-open text-4xl mb-3 opacity-50"></i>
                            <p>Nenhuma redação encontrada.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Widgets Laterais (Countdown e Atalhos) */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-0 overflow-hidden">
                     <CountdownWidget targetExam={targetExam} examDate={examDate} />
                </div>
                
                {/* Atualidades (Restaurado) */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex-1">
                    <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
                        <i className="fas fa-globe-americas text-[#07f49e]"></i> Atualidades
                    </h3>
                    <ul className="space-y-4">
                        {currentEvents.length > 0 ? currentEvents.map((event, idx) => (
                            <li key={idx}>
                                <a href={event.link} target="_blank" className="block group">
                                    <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#42047e] transition-colors">{event.title}</h5>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{event.summary}</p>
                                </a>
                            </li>
                        )) : <p className="text-sm text-gray-400">Nenhuma notícia hoje.</p>}
                    </ul>
                </div>
            </div>
        </div>
    </div>
  );
}