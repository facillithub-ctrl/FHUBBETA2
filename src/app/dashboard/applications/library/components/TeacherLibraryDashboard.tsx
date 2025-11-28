'use client'

import { useState, useEffect } from 'react';
import LearningGPS from '@/components/learning-gps/LearningGPS';
import PublishContentModal from './PublishContentModal';
import { createLibraryServerClient } from '@/lib/librarySupabase'; // Usaremos client-side aqui para lista rápida
import Image from 'next/image';

export default function TeacherLibraryDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'content'>('overview');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishedItems, setPublishedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar conteúdos publicados (Simulação de fetch real)
  useEffect(() => {
    async function fetchMyContent() {
      if (activeTab === 'content') {
        setLoading(true);
        // Em um cenário real, filtraríamos pelo ID do professor. 
        // Aqui pegamos os últimos oficiais para demonstração.
        const libDb = createLibraryServerClient();
        const { data } = await libDb
          .from('official_contents')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        
        setPublishedItems(data || []);
        setLoading(false);
      }
    }
    fetchMyContent();
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

              {/* Métricas Rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard icon="fa-book-open" label="Conteúdos Ativos" value="24" color="text-blue-600 bg-blue-50" />
                <StatCard icon="fa-eye" label="Visualizações Totais" value="1.2k" color="text-green-600 bg-green-50" />
                <StatCard icon="fa-download" label="Downloads" value="450" color="text-purple-600 bg-purple-50" />
                <StatCard icon="fa-users" label="Alunos Engajados" value="92%" color="text-yellow-600 bg-yellow-50" />
              </div>

              {/* Lista de Atividade Recente (Placeholder) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-800 mb-4">Atividade Recente da Turma</h3>
                <div className="space-y-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                <i className="fas fa-user"></i>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-800"><b>Aluno Exemplo {i}</b> completou a leitura de "História da Arte".</p>
                                <p className="text-xs text-gray-400">Há {i * 15} minutos</p>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
           </div>
        )}

        {/* ABA: GERENCIAR CONTEÚDOS */}
        {activeTab === 'content' && (
           <div className="animate-fade-in space-y-6">
              <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800">Meus Materiais Publicados</h3>
                  <div className="flex gap-2">
                      <input type="text" placeholder="Buscar..." className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-royal-blue" />
                      <button onClick={() => setIsPublishModalOpen(true)} className="bg-royal-blue text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-700">
                          <i className="fas fa-plus"></i>
                      </button>
                  </div>
              </div>

              {loading ? (
                  <div className="text-center py-20 text-gray-400">Carregando seus materiais...</div>
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
                                    <div className="w-10 h-10 rounded bg-gray-100 relative overflow-hidden flex-shrink-0">
                                        {item.cover_image ? (
                                            <Image src={item.cover_image} alt="" fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400"><i className="fas fa-file"></i></div>
                                        )}
                                    </div>
                                    <span className="font-medium text-gray-900 line-clamp-1">{item.title}</span>
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
                                    Nenhum conteúdo encontrado.
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

// Subcomponente de Estatística
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