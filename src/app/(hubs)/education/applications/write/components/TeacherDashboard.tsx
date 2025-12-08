"use client";

import { useState, useMemo } from 'react';
import CorrectionInterface from './CorrectionInterface';
import EssayCorrectionView from './EssayCorrectionView';
import type { UserProfile } from '@/app/(hubs)/education/dashboard/types';

type EssayListItem = {
  id: string;
  title: string | null;
  submitted_at: string | null;
  profiles: { full_name: string | null } | null;
  essay_corrections?: { final_grade: number }[] | null;
};

type TeacherDashboardProps = {
  userProfile: UserProfile;
  pendingEssays: EssayListItem[];
  correctedEssays: EssayListItem[];
};

export default function TeacherDashboard({ userProfile, pendingEssays, correctedEssays }: TeacherDashboardProps) {
  const [view, setView] = useState<'list' | 'correct' | 'view_correction'>('list');
  const [selectedEssayId, setSelectedEssayId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'corrected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  const isInstitutional = !!userProfile.organization_id;

  const filteredEssays = useMemo(() => {
    const list = activeTab === 'pending' ? pendingEssays : correctedEssays;
    if (!searchTerm) return list;
    const lowerTerm = searchTerm.toLowerCase();
    return list.filter(essay => 
      (essay.title && essay.title.toLowerCase().includes(lowerTerm)) ||
      (essay.profiles?.full_name && essay.profiles.full_name.toLowerCase().includes(lowerTerm))
    );
  }, [activeTab, pendingEssays, correctedEssays, searchTerm]);

  const handleSelectEssay = (essayId: string) => {
    setSelectedEssayId(essayId);
    setView(activeTab === 'pending' ? 'correct' : 'view_correction');
  };

  const handleBack = () => {
    setSelectedEssayId(null);
    setView('list');
  };

  if (view === 'correct' && selectedEssayId) {
    return <CorrectionInterface essayId={selectedEssayId} onBack={handleBack} />;
  }

  if (view === 'view_correction' && selectedEssayId) {
    return <EssayCorrectionView essayId={selectedEssayId} onBack={handleBack} />;
  }

  return (
    <div className="space-y-6 animate-fade-in-right">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-text dark:text-white">Painel do Corretor</h1>
          <p className="text-text-muted dark:text-gray-400">
            {isInstitutional 
              ? `Redações da instituição: ${userProfile.schoolName}` 
              : 'Fila global de redações.'}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-full md:w-auto">
          <button onClick={() => setActiveTab('pending')} className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-white dark:bg-dark-card text-royal-blue shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>Pendentes ({pendingEssays.length})</button>
          <button onClick={() => setActiveTab('corrected')} className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'corrected' ? 'bg-white dark:bg-dark-card text-green-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>Corrigidas ({correctedEssays.length})</button>
        </div>
        <div className="relative w-full md:w-72">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input type="text" placeholder="Buscar aluno..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg bg-transparent dark:border-gray-600 dark:text-white focus:outline-none"/>
        </div>
      </div>

      {filteredEssays.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEssays.map(essay => (
            <div key={essay.id} onClick={() => handleSelectEssay(essay.id)} className="group bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 cursor-pointer hover:shadow-lg transition-all flex flex-col h-full relative overflow-hidden">
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${activeTab === 'pending' ? 'bg-yellow-400' : 'bg-green-500'}`}></div>
              <div className="flex justify-between items-start mb-4 pl-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg font-bold text-royal-blue dark:text-blue-400">
                     {essay.profiles?.full_name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-dark-text dark:text-white line-clamp-1">{essay.profiles?.full_name || 'Aluno'}</p>
                    <p className="text-xs text-text-muted">{essay.submitted_at ? new Date(essay.submitted_at).toLocaleDateString('pt-BR') : '-'}</p>
                  </div>
                </div>
                {activeTab === 'corrected' && essay.essay_corrections && essay.essay_corrections.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded"><span className="text-lg font-black text-green-600 dark:text-green-400">{essay.essay_corrections[0].final_grade}</span></div>
                )}
              </div>
              <div className="pl-3 mb-4 flex-grow"><h3 className="font-semibold text-base text-dark-text dark:text-white line-clamp-2">{essay.title || "Redação sem título"}</h3></div>
              <div className="pl-3 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center mt-auto">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${activeTab === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{activeTab === 'pending' ? 'Aguardando' : 'Corrigida'}</span>
                <span className="text-royal-blue font-bold text-sm group-hover:translate-x-1 transition-transform flex items-center gap-1">{activeTab === 'pending' ? 'Corrigir' : 'Ver'} <i className="fas fa-arrow-right"></i></span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-dark-card rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-3xl text-gray-300 dark:text-gray-600"><i className={`fas ${activeTab === 'pending' ? 'fa-clipboard-check' : 'fa-search'}`}></i></div>
            <h3 className="text-xl font-bold text-dark-text dark:text-white mb-2">Fila vazia</h3>
            <p className="text-text-muted">{searchTerm ? `Nenhum resultado para "${searchTerm}"` : 'Nenhuma redação encontrada nesta categoria.'}</p>
        </div>
      )}
    </div>
  );
}