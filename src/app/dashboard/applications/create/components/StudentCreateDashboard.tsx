'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, FileText, LayoutTemplate, 
  Presentation, Sparkles, Clock, 
  Search, Filter, MoreVertical, 
  PenTool, BrainCircuit, ChevronRight, Home, Layout
} from 'lucide-react';
import LearningGPS from '@/components/learning-gps/LearningGPS';

interface Document {
  id: string;
  title: string;
  type: string;
  updated_at: string;
  status: string;
}

interface Props {
  documents: Document[];
  userProfile: any;
}

export default function StudentCreateDashboard({ documents, userProfile }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'all'>('overview');
  const firstName = userProfile?.full_name?.split(' ')[0] || 'Estudante';

  return (
    <div className="h-full overflow-y-auto bg-[#F8F9FA] dark:bg-[#09090B] p-6 md:p-8 space-y-6 animate-in fade-in duration-500 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
       
       {/* HERO */}
       <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-[#1a1b1e] border border-gray-200 dark:border-white/5 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 p-[2px]">
                        <div className="w-full h-full bg-white dark:bg-[#151518] rounded-[10px] flex items-center justify-center">
                             <PenTool className="text-blue-600" size={20} />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Facillit Create</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Estúdio de Criação e Mapas Mentais</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/applications/create/new">
                        <button className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md transition-all flex items-center gap-2">
                            <Plus size={16} /> Novo Projeto
                        </button>
                    </Link>
                </div>
            </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 text-sm font-medium flex items-center gap-2 transition-all border-b-2 ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
          >
            <Home size={16} /> Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-3 text-sm font-medium flex items-center gap-2 transition-all border-b-2 ${activeTab === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
          >
            <Layout size={16} /> Todos os Projetos
          </button>
      </div>

      {/* CONTEÚDO */}
      {activeTab === 'overview' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300 pb-10">
              
              <LearningGPS studentId={userProfile.id} />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Esquerda: Ações */}
                  <div className="lg:col-span-8 space-y-6">
                      <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                          <Sparkles className="text-yellow-500" size={18} /> Iniciar Criação
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <CreateCard title="Documento de Texto" desc="Resumos e anotações." icon={FileText} color="text-blue-600" bg="bg-blue-50" href="/dashboard/applications/create/new?type=doc" />
                          <CreateCard title="Mapa Mental" desc="Conecte ideias." icon={BrainCircuit} color="text-purple-600" bg="bg-purple-50" href="/dashboard/applications/create/new?type=mindmap" />
                          <CreateCard title="Slides" desc="Apresentações visuais." icon={Presentation} color="text-orange-600" bg="bg-orange-50" href="/dashboard/applications/create/new?type=slides" />
                          <CreateCard title="Facillit AI" desc="Gere conteúdo automático." icon={Sparkles} color="text-emerald-600" bg="bg-emerald-50" href="/dashboard/applications/create/ai" isSpecial />
                      </div>
                  </div>

                  {/* Direita: Recentes */}
                  <div className="lg:col-span-4">
                       <div className="bg-white dark:bg-[#1a1b1e] rounded-xl border border-gray-200 dark:border-white/5 shadow-sm h-full flex flex-col min-h-[300px]">
                            <div className="p-5 border-b border-gray-100 dark:border-white/5">
                                <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                    <Clock className="text-blue-600" size={16} /> Recentes
                                </h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
                                {documents.length > 0 ? (
                                    documents.slice(0, 5).map(doc => (
                                        <Link key={doc.id} href={`/dashboard/applications/create/${doc.id}`} className="block group">
                                            <div className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${doc.type === 'mindmap' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {doc.type === 'mindmap' ? <BrainCircuit size={14} /> : <FileText size={14} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-gray-800 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                                                        {doc.title || 'Sem Título'}
                                                    </h4>
                                                    <p className="text-[10px] text-gray-400">
                                                        {new Date(doc.updated_at).toLocaleDateString('pt-BR')}
                                                    </p>
                                                </div>
                                                <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-600" />
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                                            <Clock size={20} className="text-gray-300" />
                                        </div>
                                        <p className="text-xs text-gray-400">Nenhum projeto recente.</p>
                                    </div>
                                )}
                            </div>
                       </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'all' && (
           <div className="bg-white dark:bg-[#1a1b1e] rounded-xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden animate-in fade-in mb-10">
                <div className="p-5 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold text-gray-800 dark:text-white">Todos os Arquivos</h3>
                    <div className="relative w-full sm:w-auto">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Filtrar..." className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                    </div>
                </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-gray-50 dark:bg-white/5 text-[11px] text-gray-400 uppercase font-bold tracking-wider">
                          <tr>
                              <th className="px-6 py-3">Nome</th>
                              <th className="px-6 py-3">Tipo</th>
                              <th className="px-6 py-3">Status</th>
                              <th className="px-6 py-3">Última Edição</th>
                              <th className="px-6 py-3 text-right">Ações</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
                          {documents.map(doc => (
                              <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                                  <td className="px-6 py-3 font-medium">
                                      <Link href={`/dashboard/applications/create/${doc.id}`} className="hover:text-blue-600 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                                          {doc.title || "Sem título"}
                                      </Link>
                                  </td>
                                  <td className="px-6 py-3 capitalize text-gray-500">{doc.type === 'doc' ? 'Documento' : doc.type}</td>
                                  <td className="px-6 py-3">
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-gray-50 border-gray-200 text-gray-600">
                                          RASCUNHO
                                      </span>
                                  </td>
                                  <td className="px-6 py-3 text-xs text-gray-500">{new Date(doc.updated_at).toLocaleDateString()}</td>
                                  <td className="px-6 py-3 text-right">
                                      <button className="p-1 hover:bg-gray-200 rounded text-gray-400"><MoreVertical size={16} /></button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  {documents.length === 0 && <div className="p-12 text-center text-sm text-gray-400">Nenhum documento encontrado.</div>}
               </div>
           </div>
      )}
    </div>
  );
}

const CreateCard = ({ title, desc, icon: Icon, color, bg, href, isSpecial }: any) => (
    <Link href={href} className="group block h-full">
        <div className={`
            h-full p-5 rounded-xl border transition-all duration-300 flex flex-col justify-between
            bg-white dark:bg-[#1a1b1e] border-gray-200 dark:border-white/5 
            hover:shadow-md hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-900
            ${isSpecial ? 'border-emerald-200' : ''}
        `}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                </div>
                {isSpecial && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded">IA</span>}
            </div>
            <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">{title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
        </div>
    </Link>
);