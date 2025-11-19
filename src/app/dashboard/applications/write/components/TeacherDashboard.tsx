"use client";

import { useState } from 'react';
import CorrectionInterface from './CorrectionInterface';
import EssayCorrectionView from './EssayCorrectionView';
import type { UserProfile } from '@/app/dashboard/types';

// ... tipos mantêm-se iguais ...

export default function TeacherDashboard({ userProfile, pendingEssays, correctedEssays }: TeacherDashboardProps) {
  const [view, setView] = useState<'list' | 'correct' | 'view_correction'>('list');
  const [selectedEssayId, setSelectedEssayId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'corrected'>('pending');
  
  const isInstitutional = !!userProfile.organization_id;

  const handleSelectEssay = (essayId: string, status: 'pending' | 'corrected') => {
    setSelectedEssayId(essayId);
    setView(status === 'pending' ? 'correct' : 'view_correction');
  };

  // ... lógica de renderização condicional mantém-se ...

  const essaysToShow = activeTab === 'pending' ? pendingEssays : correctedEssays;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#42047e] to-[#07f49e] mb-2">
          Painel do Corretor
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
            {isInstitutional 
                ? `Gestão de redações: ${userProfile.schoolName}` 
                : "Gestão global de redações"}
        </p>
      </header>

      {/* Tabs Estilizadas */}
      <div className="flex space-x-2 mb-6 bg-white dark:bg-[#121212] p-1 rounded-xl w-fit shadow-sm border border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'pending' 
            ? 'bg-[#42047e] text-white shadow-md' 
            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Pendentes <span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{pendingEssays.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('corrected')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'corrected' 
            ? 'bg-[#07f49e] text-[#42047e] shadow-md' 
            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Corrigidas <span className="ml-2 bg-black/10 px-1.5 py-0.5 rounded-full text-xs">{correctedEssays.length}</span>
        </button>
      </div>

      {/* Lista de Cards Modernos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {essaysToShow.length > 0 ? essaysToShow.map(essay => (
            <div 
                key={essay.id}
                onClick={() => handleSelectEssay(essay.id, activeTab)}
                className="group bg-white dark:bg-[#121212] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-[#07f49e] transition-all cursor-pointer shadow-sm hover:shadow-md relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#42047e] to-[#07f49e] opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase ${activeTab === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {activeTab === 'pending' ? 'Aguardando' : 'Finalizada'}
                    </span>
                    <span className="text-xs text-gray-400">
                        {new Date(essay.submitted_at!).toLocaleDateString()}
                    </span>
                </div>

                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2 line-clamp-2">
                    {essay.title || "Redação sem título"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {essay.profiles?.full_name || 'Aluno Anónimo'}
                </p>

                {activeTab === 'corrected' && (
                    <div className="flex items-center justify-between border-t dark:border-gray-800 pt-4 mt-2">
                        <span className="text-sm font-medium text-gray-500">Nota Final</span>
                        <span className="text-xl font-black text-[#42047e] dark:text-[#07f49e]">
                            {essay.essay_corrections?.[0]?.final_grade ?? '-'}
                        </span>
                    </div>
                )}

                <div className="mt-4 flex justify-end">
                    <span className="text-sm font-bold text-[#42047e] dark:text-[#07f49e] group-hover:translate-x-1 transition-transform flex items-center">
                        {activeTab === 'pending' ? 'Corrigir Agora' : 'Ver Detalhes'} <i className="fas fa-arrow-right ml-2"></i>
                    </span>
                </div>
            </div>
        )) : (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-gray-400 bg-white dark:bg-[#121212] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                <i className="fas fa-inbox text-4xl mb-4 opacity-50"></i>
                <p>Não há redações nesta categoria.</p>
            </div>
        )}
      </div>
    </div>
  );
}