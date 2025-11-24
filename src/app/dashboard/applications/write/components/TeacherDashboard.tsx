"use client";

import { useState, useMemo } from 'react';
import CorrectionInterface from './CorrectionInterface';
import EssayCorrectionView from './EssayCorrectionView';
import type { UserProfile } from '@/app/dashboard/types';
import Image from 'next/image';
import { getStudentMiniHistory } from '../actions';

// Tipagem aprimorada
type EssayListItem = {
  id: string;
  title: string | null;
  submitted_at: string | null;
  status: 'submitted' | 'corrected' | 'draft';
  profiles: { 
      id: string;
      full_name: string | null; 
      avatar_url: string | null;
      address_state: string | null;
      user_category: string | null;
      school_name: string | null;
  } | null;
  essay_corrections?: { final_grade: number }[] | null;
};

type TeacherDashboardProps = {
  userProfile: UserProfile;
  pendingEssays: EssayListItem[];
  correctedEssays: EssayListItem[];
};

// Componente de Filtro por Estado
const StateFilter = ({ selectedState, onChange }: { selectedState: string, onChange: (state: string) => void }) => {
    const states = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
    return (
        <select 
            value={selectedState} 
            onChange={(e) => onChange(e.target.value)}
            className="p-2.5 rounded-lg border border-gray-300 bg-white dark:bg-dark-card dark:border-gray-600 text-sm focus:ring-2 focus:ring-royal-blue outline-none min-w-[150px]"
        >
            <option value="">Todos os Estados</option>
            {states.map(uf => <option key={uf} value={uf}>{uf}</option>)}
        </select>
    );
};

// Modal de Perfil do Aluno
const StudentProfileModal = ({ student, history, onClose }: { student: any, history: any[], onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Fundo decorativo */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-[#42047e] to-[#07f49e]"></div>
            
            <div className="relative flex flex-col items-center -mt-2 mb-6">
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white p-1 shadow-lg">
                    <div className="w-full h-full rounded-full bg-gray-200 relative overflow-hidden">
                         {student.avatar_url ? <Image src={student.avatar_url} alt="Avatar" fill className="object-cover" /> : <span className="flex items-center justify-center h-full font-bold text-xl text-gray-500">{student.full_name?.[0]}</span>}
                    </div>
                </div>
                <h3 className="font-bold text-xl dark:text-white mt-3 text-center">{student.full_name}</h3>
                <p className="text-sm text-text-muted text-center flex items-center gap-2 mt-1">
                    <i className="fas fa-map-marker-alt text-royal-blue"></i> {student.address_state || 'N/A'} • {student.school_name || 'Sem escola'}
                </p>
                <span className="text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full mt-3 uppercase tracking-wide">{student.user_category}</span>
            </div>
            
            <h4 className="font-bold text-sm mb-3 uppercase tracking-wider text-gray-500 border-b pb-2">Histórico Recente</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {history.length > 0 ? history.map((h, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 transition-colors">
                        <div>
                            <p className="text-sm font-medium text-dark-text dark:text-white line-clamp-1">{h.title || 'Sem título'}</p>
                            <p className="text-xs text-text-muted">{new Date(h.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="font-bold text-royal-blue text-lg">{h.grade}</span>
                        </div>
                    </div>
                )) : <p className="text-sm text-gray-500 text-center py-4">Nenhum histórico disponível.</p>}
            </div>
            <button onClick={onClose} className="mt-6 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-xl font-bold transition-colors">Fechar</button>
        </div>
    </div>
);

export default function TeacherDashboard({ userProfile, pendingEssays, correctedEssays }: TeacherDashboardProps) {
  const [view, setView] = useState<'list' | 'correct' | 'view_correction'>('list');
  const [selectedEssayId, setSelectedEssayId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'corrected'>('pending');
  const [selectedState, setSelectedState] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estado para modal do aluno
  const [viewingStudent, setViewingStudent] = useState<any | null>(null);
  const [studentHistory, setStudentHistory] = useState<any[]>([]);

  // Cálculos de Estatísticas Rápidas
  const stats = useMemo(() => {
      return {
          totalCorrected: correctedEssays.length,
          pendingCount: pendingEssays.length,
          avgGrade: correctedEssays.length > 0 
            ? correctedEssays.reduce((acc, curr) => acc + (curr.essay_corrections?.[0]?.final_grade || 0), 0) / correctedEssays.length 
            : 0
      };
  }, [correctedEssays, pendingEssays]);

  const handleSelectEssay = (essayId: string, status: 'pending' | 'corrected') => {
    setSelectedEssayId(essayId);
    setView(status === 'pending' ? 'correct' : 'view_correction');
  };

  const handleStudentClick = async (e: React.MouseEvent, student: any) => {
      e.stopPropagation(); // Impede abrir a correção
      if (!student) return;
      const { data } = await getStudentMiniHistory(student.id);
      setStudentHistory(data || []);
      setViewingStudent(student);
  };

  const handleBack = () => { setSelectedEssayId(null); setView('list'); };

  // Lógica de Filtragem
  const essaysToShow = useMemo(() => {
      const source = activeTab === 'pending' ? pendingEssays : correctedEssays;
      return source.filter(essay => {
          const matchState = selectedState ? essay.profiles?.address_state === selectedState : true;
          const matchSearch = searchQuery ? essay.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || essay.title?.toLowerCase().includes(searchQuery.toLowerCase()) : true;
          return matchState && matchSearch;
      });
  }, [activeTab, pendingEssays, correctedEssays, selectedState, searchQuery]);

  if (view === 'correct' && selectedEssayId) return <CorrectionInterface essayId={selectedEssayId} onBack={handleBack} />;
  if (view === 'view_correction' && selectedEssayId) return <EssayCorrectionView essayId={selectedEssayId} onBack={handleBack} />;

  return (
    <div className="space-y-8 animate-fade-in-right pb-10">
      {viewingStudent && <StudentProfileModal student={viewingStudent} history={studentHistory} onClose={() => setViewingStudent(null)} />}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-black text-dark-text dark:text-white">Painel de Correção</h1>
            <p className="text-sm text-text-muted">Gerencie sua fila, visualize alunos e acompanhe métricas.</p>
        </div>
        
        {/* Card de Estatísticas do Corretor */}
        <div className="flex gap-4 text-sm">
            <div className="bg-white dark:bg-dark-card px-5 py-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <div className="bg-green-100 text-green-600 w-10 h-10 rounded-full flex items-center justify-center"><i className="fas fa-check-double"></i></div>
                <div>
                    <span className="block font-black text-lg leading-none">{stats.totalCorrected}</span>
                    <span className="text-xs text-gray-500 uppercase font-bold">Corrigidas</span>
                </div>
            </div>
            <div className="bg-white dark:bg-dark-card px-5 py-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <div className="bg-yellow-100 text-yellow-600 w-10 h-10 rounded-full flex items-center justify-center"><i className="fas fa-star"></i></div>
                <div>
                    <span className="block font-black text-lg leading-none">{stats.avgGrade.toFixed(0)}</span>
                    <span className="text-xs text-gray-500 uppercase font-bold">Média Dada</span>
                </div>
            </div>
        </div>
      </div>

      {/* Barra de Ferramentas: Abas + Filtros */}
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg p-5 flex flex-col lg:flex-row gap-4 justify-between items-center border border-gray-100 dark:border-gray-700">
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl w-full lg:w-auto">
            <button onClick={() => setActiveTab('pending')} className={`flex-1 lg:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-white dark:bg-gray-700 shadow text-royal-blue' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
                Pendentes <span className="ml-2 bg-royal-blue text-white text-[10px] px-2 py-0.5 rounded-full">{pendingEssays.length}</span>
            </button>
            <button onClick={() => setActiveTab('corrected')} className={`flex-1 lg:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'corrected' ? 'bg-white dark:bg-gray-700 shadow text-royal-blue' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
                Corrigidas <span className="ml-2 bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">{correctedEssays.length}</span>
            </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-grow">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input 
                    type="text" 
                    placeholder="Buscar por aluno ou título..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white dark:bg-dark-card dark:border-gray-600 text-sm w-full focus:ring-2 focus:ring-royal-blue outline-none"
                />
            </div>
            <StateFilter selectedState={selectedState} onChange={setSelectedState} />
        </div>
      </div>

      {/* Lista de Redações */}
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 font-bold border-b dark:border-gray-700">
                    <tr>
                        <th className="px-6 py-5">Aluno</th>
                        <th className="px-6 py-5">Título da Redação</th>
                        <th className="px-6 py-5 text-center">Estado</th>
                        <th className="px-6 py-5">Data de Envio</th>
                        <th className="px-6 py-5 text-right">{activeTab === 'corrected' ? 'Nota Final' : 'Ação'}</th>
                    </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                    {essaysToShow.length > 0 ? essaysToShow.map(essay => (
                        <tr key={essay.id} onClick={() => handleSelectEssay(essay.id, activeTab)} className="hover:bg-blue-50/50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors group">
                            <td className="px-6 py-4">
                                <div 
                                    className="flex items-center gap-3 group/student p-1 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-all w-fit pr-3 cursor-help" 
                                    onClick={(e) => handleStudentClick(e, essay.profiles)}
                                    title="Clique para ver perfil do aluno"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 relative overflow-hidden shadow-sm">
                                        {essay.profiles?.avatar_url ? <Image src={essay.profiles.avatar_url} alt="Avatar" fill className="object-cover" /> : essay.profiles?.full_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-dark-text dark:text-white group-hover/student:text-royal-blue transition-colors">{essay.profiles?.full_name || 'Anônimo'}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">{essay.profiles?.user_category || 'Estudante'}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300 max-w-xs truncate">
                                {essay.title || "Sem título"}
                            </td>
                            <td className="px-6 py-4 text-center">
                                {essay.profiles?.address_state ? (
                                    <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-md text-xs font-bold shadow-sm border border-gray-200 dark:border-gray-600">
                                        {essay.profiles.address_state}
                                    </span>
                                ) : <span className="text-gray-400">-</span>}
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                {new Date(essay.submitted_at!).toLocaleDateString()} <span className="text-xs text-gray-400 ml-1">{new Date(essay.submitted_at!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                {activeTab === 'corrected' ? (
                                    <span className="font-black text-xl text-[#42047e] bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-lg">{essay.essay_corrections?.[0]?.final_grade}</span>
                                ) : (
                                    <button className="bg-royal-blue text-white px-5 py-2.5 rounded-full font-bold text-xs hover:bg-opacity-90 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                                        Corrigir <i className="fas fa-arrow-right ml-1"></i>
                                    </button>
                                )}
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={5} className="p-12 text-center text-gray-500">
                                <div className="flex flex-col items-center justify-center opacity-50">
                                    <i className="fas fa-inbox text-4xl mb-3"></i>
                                    <p className="text-lg">Nenhuma redação encontrada.</p>
                                    <p className="text-sm">Tente ajustar os filtros de busca.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}