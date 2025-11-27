"use client";

import { useState, useMemo } from 'react';
import CorrectionInterface from './CorrectionInterface';
import EssayCorrectionView from './EssayCorrectionView';
import type { UserProfile } from '@/app/dashboard/types';

// Tipo ajustado para corresponder ao que vem do banco de dados
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

  // Filtra redações com base na aba ativa e no termo de pesquisa
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
    // Opcional: chamar router.refresh() aqui se quiser atualizar a lista ao voltar
  };

  // Renderiza a interface de correção ou visualização
  if (view === 'correct' && selectedEssayId) {
    return <CorrectionInterface essayId={selectedEssayId} onBack={handleBack} />;
  }

  if (view === 'view_correction' && selectedEssayId) {
    return <EssayCorrectionView essayId={selectedEssayId} onBack={handleBack} />;
  }

  return (
    <div className="space-y-6 animate-fade-in-right">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-text dark:text-white">Painel do Corretor</h1>
          <p className="text-text-muted dark:text-gray-400">
            {isInstitutional 
              ? `Gerenciando redações da instituição: ${userProfile.schoolName}` 
              : 'Gerenciando fila global de redações.'}
          </p>
        </div>
      </div>

      {/* Barra de Ferramentas: Abas e Pesquisa */}
      <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Abas */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-full md:w-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-bold transition-all ${
              activeTab === 'pending' 
                ? 'bg-white dark:bg-dark-card text-royal-blue shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            Pendentes ({pendingEssays.length})
          </button>
          <button
            onClick={() => setActiveTab('corrected')}
            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-bold transition-all ${
              activeTab === 'corrected' 
                ? 'bg-white dark:bg-dark-card text-green-600 shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            Corrigidas ({correctedEssays.length})
          </button>
        </div>

        {/* Campo de Pesquisa */}
        <div className="relative w-full md:w-72">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input 
            type="text" 
            placeholder="Buscar por aluno ou título..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-transparent dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-royal-blue focus:outline-none"
          />
        </div>
      </div>

      {/* Grid de Cartões */}
      {filteredEssays.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEssays.map(essay => (
            <div 
              key={essay.id} 
              onClick={() => handleSelectEssay(essay.id)}
              className="group bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 cursor-pointer hover:shadow-lg hover:border-royal-blue/30 transition-all duration-300 relative overflow-hidden flex flex-col h-full"
            >
              {/* Indicador Lateral Colorido */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${activeTab === 'pending' ? 'bg-yellow-400' : 'bg-green-500'}`}></div>

              {/* Cabeçalho do Cartão */}
              <div className="flex justify-between items-start mb-4 pl-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg font-bold text-royal-blue dark:text-blue-400">
                     {essay.profiles?.full_name?.charAt(0).toUpperCase() || <i className="fas fa-user"></i>}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-dark-text dark:text-white line-clamp-1" title={essay.profiles?.full_name || ''}>
                        {essay.profiles?.full_name || 'Aluno Desconhecido'}
                    </p>
                    <p className="text-xs text-text-muted flex items-center gap-1">
                        <i className="far fa-clock"></i>
                        {essay.submitted_at ? new Date(essay.submitted_at).toLocaleDateString('pt-BR') : 'Data N/A'}
                    </p>
                  </div>
                </div>
                {activeTab === 'corrected' && essay.essay_corrections && essay.essay_corrections.length > 0 && (
                    <div className="flex flex-col items-end bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                        <span className="text-xl font-black text-green-600 dark:text-green-400">{essay.essay_corrections[0].final_grade}</span>
                        <span className="text-[10px] text-green-700 dark:text-green-300 font-bold uppercase">Nota</span>
                    </div>
                )}
              </div>

              {/* Título da Redação */}
              <div className="pl-3 mb-4 flex-grow">
                <h3 className="font-semibold text-base text-dark-text dark:text-white line-clamp-2" title={essay.title || ''}>
                    {essay.title || "Sem título definido"}
                </h3>
              </div>

              {/* Rodapé do Cartão */}
              <div className="pl-3 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center mt-auto">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    activeTab === 'pending' 
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200' 
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200'
                }`}>
                    {activeTab === 'pending' ? 'Aguardando' : 'Corrigida'}
                </span>
                <span className="text-royal-blue font-bold text-sm group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    {activeTab === 'pending' ? 'Corrigir' : 'Ver'} <i className="fas fa-arrow-right"></i>
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Estado Vazio
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-dark-card rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-3xl text-gray-300 dark:text-gray-600">
                <i className={`fas ${activeTab === 'pending' ? 'fa-clipboard-check' : 'fa-search'}`}></i>
            </div>
            <h3 className="text-xl font-bold text-dark-text dark:text-white mb-2">
                {searchTerm ? 'Nenhum resultado encontrado' : (activeTab === 'pending' ? 'Fila de correção vazia!' : 'Nenhuma correção realizada.')}
            </h3>
            <p className="text-text-muted max-w-md mx-auto">
                {searchTerm 
                    ? `Não encontramos redações correspondentes a "${searchTerm}".` 
                    : (activeTab === 'pending' ? 'Ótimo trabalho! Você não tem redações pendentes no momento.' : 'As redações que você corrigir aparecerão aqui.')}
            </p>
            {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="mt-4 text-royal-blue font-bold hover:underline">
                    Limpar pesquisa
                </button>
            )}
        </div>
      )}
    </div>
  );
}