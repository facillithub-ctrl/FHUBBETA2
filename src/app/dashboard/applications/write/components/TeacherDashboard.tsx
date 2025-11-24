"use client";

import { useState } from 'react';
import CorrectionInterface from './CorrectionInterface';
import EssayCorrectionView from './EssayCorrectionView';
import type { UserProfile } from '@/app/dashboard/types';
import Image from 'next/image';

// Tipagem corrigida para refletir o que vem da API
type EssayListItem = {
  id: string;
  title: string | null;
  submitted_at: string | null;
  profiles: { full_name: string | null; } | null;
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
  
  const isInstitutional = !!userProfile.organization_id;

  const handleSelectEssay = (essayId: string, status: 'pending' | 'corrected') => {
    setSelectedEssayId(essayId);
    setView(status === 'pending' ? 'correct' : 'view_correction');
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
  
  const essaysToShow = activeTab === 'pending' ? pendingEssays : correctedEssays;

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho com gradiente de texto */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-green">
                Painel de Correção
            </h1>
            {isInstitutional && (
                <p className="text-sm text-dark-text-muted mt-1">
                    Instituição: <span className="font-semibold text-brand-purple">{userProfile.schoolName}</span>
                </p>
            )}
        </div>
        
        <button 
            className="bg-brand-purple hover:bg-brand-green text-white font-bold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-brand-green/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            onClick={() => alert('Em breve: Modal para criar temas globais ou para turmas específicas.')}
        >
          <i className="fas fa-plus"></i> Novo Tema
        </button>
      </div>

      {/* Abas Estilizadas (Glassmorphism) */}
      <div className="glass-card p-1 flex space-x-2 rounded-xl max-w-md">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all duration-300 ${
            activeTab === 'pending' 
              ? 'bg-white/90 dark:bg-white/10 text-brand-purple shadow-sm' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Pendentes <span className="ml-2 bg-brand-purple/10 px-2 py-0.5 rounded-full text-xs">{pendingEssays.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('corrected')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all duration-300 ${
            activeTab === 'corrected' 
              ? 'bg-white/90 dark:bg-white/10 text-brand-green shadow-sm' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Corrigidas <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">{correctedEssays.length}</span>
        </button>
      </div>

      {/* Lista de Redações (Cards Glass) */}
      <div className="grid gap-4">
        {essaysToShow.length > 0 ? essaysToShow.map(essay => (
          <div 
            key={essay.id} 
            onClick={() => handleSelectEssay(essay.id, activeTab)} 
            className="glass-card p-5 hover:border-brand-purple/40 cursor-pointer transition-all duration-200 group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
                {/* Avatar Placeholder */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-purple to-brand-green p-[2px]">
                    <div className="w-full h-full rounded-full bg-white dark:bg-dark-card flex items-center justify-center font-bold text-brand-purple text-lg">
                        {essay.profiles?.full_name?.charAt(0) || '?'}
                    </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-dark-text dark:text-white text-lg group-hover:text-brand-purple transition-colors">
                      {essay.title || "Redação sem título"}
                  </h3>
                  <p className="text-sm text-dark-text-muted flex items-center gap-2">
                    <i className="far fa-user"></i> {essay.profiles?.full_name || 'Aluno desconhecido'}
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <i className="far fa-clock"></i> {new Date(essay.submitted_at!).toLocaleDateString('pt-BR')}
                  </p>
                </div>
            </div>

            {activeTab === 'corrected' ? (
               <div className="text-right">
                    <p className="text-xs text-dark-text-muted uppercase font-bold">Nota Final</p>
                    <p className="text-2xl font-black text-brand-green">{essay.essay_corrections?.[0]?.final_grade ?? 'N/A'}</p>
               </div>
            ) : (
                <span className="px-4 py-1.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold border border-yellow-200">
                    Aguardando
                </span>
            )}
          </div>
        )) : (
            <div className="text-center py-16 glass-card flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-300 text-3xl">
                    <i className="fas fa-folder-open"></i>
                </div>
                <p className="text-dark-text-muted text-lg">
                    Nenhuma redação encontrada nesta categoria.
                </p>
            </div>
        )}
      </div>
    </div>
  );
}