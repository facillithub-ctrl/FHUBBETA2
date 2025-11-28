// src/app/dashboard/applications/library/components/TeacherLibraryDashboard.tsx
'use client'

import { useState } from 'react';
import PublishContentModal from './PublishContentModal'; // Vamos criar abaixo
import Image from 'next/image';

export default function TeacherLibraryDashboard({ user }: { user: any }) {
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header do Professor */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão da Biblioteca</h1>
          <p className="text-gray-500">Publique materiais didáticos e acompanhe o engajamento dos alunos.</p>
        </div>
        <button 
          onClick={() => setIsPublishModalOpen(true)}
          className="bg-royal-blue text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 transform hover:-translate-y-1"
        >
          <i className="fas fa-plus-circle"></i>
          Publicar Novo Conteúdo
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard icon="fa-book" label="Conteúdos Publicados" value="24" color="bg-blue-100 text-blue-600" />
        <StatCard icon="fa-eye" label="Visualizações Totais" value="1.2k" color="bg-green-100 text-green-600" />
        <StatCard icon="fa-download" label="Downloads Realizados" value="450" color="bg-purple-100 text-purple-600" />
        <StatCard icon="fa-users" label="Alunos Ativos" value="98%" color="bg-yellow-100 text-yellow-600" />
      </div>

      {/* Meus Materiais Publicados */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Minhas Publicações Recentes</h3>
          <button className="text-sm text-royal-blue hover:underline">Ver todas</button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-3">Título</th>
              <th className="px-6 py-3">Tipo</th>
              <th className="px-6 py-3">Data</th>
              <th className="px-6 py-3 text-center">Acessos</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Exemplo estático - deve vir do banco */}
            <PublicationRow title="Apostila de Redação Nota 1000" type="PDF" date="28/11/2025" views={124} />
            <PublicationRow title="Aula 01 - Introdução à Biologia" type="Vídeo" date="25/11/2025" views={89} />
            <PublicationRow title="Guia de Estudos - História" type="Artigo" date="20/11/2025" views={256} />
          </tbody>
        </table>
      </div>

      {/* Modal de Publicação */}
      {isPublishModalOpen && (
        <PublishContentModal onClose={() => setIsPublishModalOpen(false)} userId={user.id} />
      )}
    </div>
  );
}

// Subcomponentes para limpeza do código
const StatCard = ({ icon, label, value, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-xl`}>
      <i className={`fas ${icon}`}></i>
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 font-medium uppercase">{label}</div>
    </div>
  </div>
);

const PublicationRow = ({ title, type, date, views }: any) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <td className="px-6 py-4 font-medium text-gray-900">{title}</td>
    <td className="px-6 py-4">
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${type === 'PDF' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
        {type}
      </span>
    </td>
    <td className="px-6 py-4 text-sm text-gray-500">{date}</td>
    <td className="px-6 py-4 text-center text-sm font-bold text-gray-700">{views}</td>
    <td className="px-6 py-4 text-right">
      <button className="text-gray-400 hover:text-royal-blue mx-2"><i className="fas fa-edit"></i></button>
      <button className="text-gray-400 hover:text-red-500"><i className="fas fa-trash"></i></button>
    </td>
  </tr>
);