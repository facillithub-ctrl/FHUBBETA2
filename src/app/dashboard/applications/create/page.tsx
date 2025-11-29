'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Plus, FileText, LayoutTemplate, 
  Clock, MoreVertical, Search, Filter, 
  PenTool, Presentation, Sparkles 
} from 'lucide-react';

export default function CreateDashboard() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-8">
      
      {/* Header do Dashboard */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          Facillit Create
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Crie mapas mentais, resumos visuais e slides para consolidar seu aprendizado.
        </p>
      </header>

      {/* Ações Rápidas (Cards de Criação) */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <CreateActionCard 
          icon={FileText} 
          title="Novo Documento" 
          subtitle="Página em branco" 
          color="bg-blue-500"
          href="/dashboard/applications/create/new" 
        />
        <CreateActionCard 
          icon={LayoutTemplate} 
          title="Mapa Mental" 
          subtitle="A partir de modelo" 
          color="bg-purple-500"
          href="/dashboard/applications/create/new?template=mindmap" 
        />
        <CreateActionCard 
          icon={Presentation} 
          title="Slides" 
          subtitle="Para apresentação" 
          color="bg-orange-500"
          href="/dashboard/applications/create/new?template=slides" 
        />
        <CreateActionCard 
          icon={Sparkles} 
          title="Criar com IA" 
          subtitle="Geração automática" 
          color="bg-emerald-500"
          href="/dashboard/applications/create/ai" 
        />
      </section>

      {/* Área de Projetos Recentes */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        
        {/* Toolbar da Tabela */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-zinc-400" />
            <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">Projetos Recentes</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Buscar projetos..." 
                className="pl-8 pr-3 py-1.5 text-sm bg-zinc-100 dark:bg-zinc-800 border-none rounded-md focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button className="p-1.5 text-zinc-500 hover:bg-zinc-100 rounded-md">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Lista de Arquivos */}
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          <ProjectRow 
            title="Resumo de Biologia - Células" 
            type="Documento" 
            date="Editado há 2h" 
            tags={['Biologia', 'Resumo']} 
          />
          <ProjectRow 
            title="Mapa Mental: Revolução Francesa" 
            type="Mapa Mental" 
            date="Ontem" 
            tags={['História', 'Visual']} 
          />
          <ProjectRow 
            title="Apresentação Seminário Física" 
            type="Slides" 
            date="24 Out, 2024" 
            tags={['Física', 'Grupo']} 
          />
           <ProjectRow 
            title="Anotações de Aula - Matemática" 
            type="Documento" 
            date="20 Out, 2024" 
            tags={['Matemática']} 
          />
        </div>
      </div>
    </div>
  );
}

// Componentes Auxiliares do Dashboard

const CreateActionCard = ({ icon: Icon, title, subtitle, color, href }: any) => (
  <Link href={href} className="group relative overflow-hidden bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-all hover:border-blue-500/30">
    <div className={`absolute top-0 left-0 w-1 h-full ${color}`} />
    <div className="mb-3 w-10 h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
      <Icon size={20} className="text-zinc-700 dark:text-zinc-300" />
    </div>
    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
    <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>
  </Link>
);

const ProjectRow = ({ title, type, date, tags }: any) => (
  <div className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
        <FileText size={20} />
      </div>
      <div>
        <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] uppercase font-bold text-zinc-400">{type}</span>
          <span className="text-[10px] text-zinc-400">• {date}</span>
        </div>
      </div>
    </div>
    
    <div className="flex items-center gap-6">
      <div className="hidden md:flex gap-2">
        {tags.map((tag: string, i: number) => (
          <span key={i} className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-400 font-medium">
            {tag}
          </span>
        ))}
      </div>
      <button className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
        <MoreVertical size={18} />
      </button>
    </div>
  </div>
);