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
type Stats = any; // Simplificado para evitar erros de build temporários
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

// --- SUB-COMPONENTES ---
const StatCard = ({ title, value, icon, valueDescription }: { title: string, value: string | number, icon: string, valueDescription?: string }) => (
  <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 p-4 rounded-xl flex items-center justify-between h-full">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-white">
        {value} <span className="text-sm font-normal">{valueDescription}</span>
      </p>
    </div>
    <div className="text-3xl text-[#42047e]">
      <i className={`fas ${icon}`}></i>
    </div>
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
      if (essayToOpen) handleSelectEssay(essayToOpen);
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Meu Desempenho</h1>
        <button onClick={handleCreateNew} className="bg-gradient-to-r from-[#42047e] to-[#07f49e] text-white font-bold py-2 px-4 rounded-lg shadow hover:opacity-90">
          <i className="fas fa-plus mr-2"></i> Nova Redação
        </button>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Sequência" value={streak} valueDescription={`dia${streak === 1 ? '' : 's'}`} icon="fa-fire" />
        <StatCard title="Ranking" value={rankInfo?.rank ? `#${rankInfo.rank}` : '-'} valueDescription={rankInfo?.state || ''} icon="fa-trophy" />
        <div className="lg:col-span-2 bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <CountdownWidget targetExam={targetExam} examDate={examDate} />
        </div>
      </div>

      {/* History List */}
      <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Histórico</h2>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {essays.length > 0 ? essays.map(essay => (
              <li key={essay.id} onClick={() => handleSelectEssay(essay)} className="py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 px-2 rounded-lg transition">
                <div>
                  <p className="font-bold text-gray-800 dark:text-white">{essay.title || "Redação sem título"}</p>
                  <p className="text-sm text-gray-500">{essay.status === 'draft' ? 'Rascunho' : new Date(essay.submitted_at!).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${essay.status === 'corrected' ? 'bg-green-100 text-green-700' : essay.status === 'submitted' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                  {essay.status === 'corrected' ? 'Corrigida' : essay.status === 'submitted' ? 'Em Análise' : 'Rascunho'}
                </span>
              </li>
            )) : (<p className="text-gray-500 text-center py-4">Começa a tua primeira redação hoje!</p>)}
          </ul>
      </div>
    </div>
  );
}