'use client'

import { useState, useEffect } from 'react';
import LearningGPS from '@/components/learning-gps/LearningGPS';
import PublishContentModal from './PublishContentModal';
import Image from 'next/image';
import { getTeacherDashboardData, getOfficialContentsList, type TeacherStats, type RecentActivityItem } from '../actions';

// Utilitário de tempo relativo
const timeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes} min atrás`;
    if (hours < 24) return `${hours} h atrás`;
    return `${days} dias atrás`;
};

export default function TeacherLibraryDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'content'>('overview');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  
  // Estados de Dados Reais
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [publishedItems, setPublishedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar dados iniciais da Visão Geral
  useEffect(() => {
    async function loadStats() {
        if (activeTab === 'overview' && !stats) {
            try {
                const data = await getTeacherDashboardData();
                setStats(data.stats);
                setRecentActivity(data.recentActivity);
            } catch (e) {
                console.error("Erro ao carregar stats do professor", e);
            }
        }
    }
    loadStats();
  }, [activeTab, stats]);

  // Carregar lista de conteúdos ao trocar de aba
  useEffect(() => {
    async function loadContent() {
      if (activeTab === 'content') {
        setLoading(true);
        try {
          const items = await getOfficialContentsList();
          setPublishedItems(items);
        } catch (e) {
          console.error("Erro ao listar conteúdos", e);
        }
        setLoading(false);
      }
    }
    loadContent();
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      
      {/* 1. GPS (Visão da Turma) */}
      <section>
        <LearningGPS /> 
      </section>

      {/* 2. Abas de Navegação */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'overview' ? 'border-royal-blue text-royal-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <i className="fas fa-chart-line mr-2"></i>
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'content' ? 'border-royal-blue text-royal-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <i className="fas fa-book mr-2"></i>
            Gerenciar Conteúdos
          </button>
        </nav>
      </div>

      {/* 3. Conteúdo das Abas */}
      <div className="min-h-[500px]">
        
        {/* ABA: VISÃO GERAL */}
        {activeTab === 'overview' && (
           <div className="space-y-8 animate-fade-in">
              {/* Card de Ação Principal */}
              <div className="bg-gradient-to-r from-royal-blue to-blue-700 p-8 rounded-2xl text-white shadow-lg flex justify-between items-center relative overflow-hidden">
                 <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-2">Central do Educador</h2>
                    <p className="opacity-90 mb-6 max-w-xl">Publique materiais, acompanhe o engajamento e gerencie a biblioteca da sua turma em um só lugar.</p>
                    <button 
                      onClick={() => setIsPublishModalOpen(true)}
                      className="bg-white text-royal-blue px-6 py-3 rounded-lg font-bold shadow-md hover:bg-gray-100 transition-all flex items-center gap-2"
                    >
                      <i className="fas fa-cloud-upload-alt"></i> Publicar Novo Material
                    </button>
                 </div>
                 <i className="fas fa-chalkboard-teacher text-9xl absolute -right-4 -bottom-4 opacity-10 rotate-12"></i>
              </div>

              {/* Métricas Reais */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard 
                    icon="fa-book-open" 
                    label="Conteúdos Ativos" 
                    value={stats?.activeContents ?? '-'} 
                    color="text-blue-600 bg-blue-50" 
                />
                <StatCard 
                    icon="fa-eye" 
                    label="Visualizações Totais" 
                    value={stats?.totalViews ?? '-'} 
                    color="text-green-600 bg-green-50" 
                />
                <StatCard 
                    icon="fa-check-circle" 
                    label="Leituras Concluídas" 
                    value={stats?.totalDownloads ?? '-'} 
                    color="text-purple-600 bg-purple-50" 
                />
                <StatCard 
                    icon="fa-users" 
                    label="Alunos Engajados" 
                    value={stats?.engagedStudents ?? '-'} 
                    color="text-yellow-600 bg-yellow-50" 
                />
              </div>

              {/* Lista de Atividade Recente Real */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-800 mb-4">Atividade Recente da Turma</h3>
                <div className="space-y-4">
                    {recentActivity.length > 0 ? recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                                {activity.studentName.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-800">
                                    <b>{activity.studentName}</b> {activity.action} <span className="italic">&quot;{activity.contentTitle}&quot;</span>.
                                </p>
                                <p className="text-xs text-gray-400">{timeAgo(activity.time)}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-gray-400 text-sm py-4">Nenhuma atividade recente registrada.</p>
                    )}
                </div>
              </div>
           </div>
        )}

        {/* ABA: GERENCIAR CONTEÚDOS (Lista Real) */}
        {activeTab === 'content' && (
           <div className="animate-fade-in space-y-6">
              <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800">Meus Materiais Publicados</h3>
                  <div className="flex gap-2">
                      <button onClick={() => setIsPublishModalOpen(true)} className="bg-royal-blue text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-700 gap-2 text-sm font-bold">
                          <i className="fas fa-plus"></i> Novo Conteúdo
                      </button>
                  </div>
              </div>

              {loading ? (
                  <div className="text-center py-20 text-gray-400">
                      <i className="fas fa-circle-notch fa-spin text-2xl mb-2"></i>
                      <p>Carregando repositório...</p>
                  </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
                        <tr>
                        <th className="px-6 py-4 font-semibold">Título</th>
                        <th className="px-6 py-4 font-semibold">Tipo</th>
                        <th className="px-6 py-4 font-semibold">Matéria</th>
                        <th className="px-6 py-4 font-semibold text-center">Data</th>
                        <th className="px-6 py-4 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {publishedItems.length > 0 ? publishedItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded bg-gray-100 relative overflow-hidden flex-shrink-0 border border-gray-200">
                                        {item.cover_image || (item.content_type === 'book' ? null : null) ? (
                                            <Image src={item.cover_image || '/file.svg'} alt="" fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400"><i className={`fas fa-${item.content_type === 'video' ? 'play' : 'file-alt'}`}></i></div>
                                        )}
                                    </div>
                                    <span className="font-medium text-gray-900 line-clamp-1 max-w-[200px]" title={item.title}>{item.title}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-block px-2 py-1 text-[10px] font-bold rounded-full bg-blue-50 text-blue-600 uppercase border border-blue-100">
                                    {item.content_type}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.subject}</td>
                            <td className="px-6 py-4 text-center text-sm text-gray-500">
                                {new Date(item.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-gray-400 hover:text-royal-blue mx-2 transition-colors"><i className="fas fa-edit"></i></button>
                                <button className="text-gray-400 hover:text-red-500 transition-colors"><i className="fas fa-trash-alt"></i></button>
                            </td>
                        </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                    Nenhum conteúdo encontrado. Publique o primeiro!
                                </td>
                            </tr>
                        )}
                    </tbody>
                    </table>
                </div>
              )}
           </div>
        )}
      </div>

      {isPublishModalOpen && (
        <PublishContentModal onClose={() => setIsPublishModalOpen(false)} userId={user.id} />
      )}
    </div>
  );
}

const StatCard = ({ icon, label, value, color }: any) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-xl`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500 font-medium uppercase">{label}</div>
      </div>
    </div>
);