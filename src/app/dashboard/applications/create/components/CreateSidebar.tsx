'use client';

import React from 'react';
import { 
  Plus, Search, FileText, Folder, Star, Clock, 
  Settings, ChevronRight, MoreHorizontal, LayoutTemplate
} from 'lucide-react';

export const CreateSidebar = () => {
  return (
    <aside className="w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col hidden md:flex shrink-0">
      
      {/* Header da Sidebar */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/50">
        <button className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-blue-600 dark:hover:bg-blue-700 py-2.5 rounded-lg transition-all shadow-sm text-sm font-medium">
          <Plus size={16} />
          Novo Documento
        </button>
      </div>

      {/* Busca Rápida */}
      <div className="px-4 py-3">
        <div className="relative group">
          <Search className="absolute left-2.5 top-2.5 text-zinc-400 group-focus-within:text-blue-500 transition-colors" size={15} />
          <input 
            type="text" 
            placeholder="Buscar documentos..." 
            className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Menu Principal */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
        
        {/* Workspace */}
        <div>
          <h3 className="px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Workspace
          </h3>
          <nav className="space-y-0.5">
            <SidebarItem icon={Clock} label="Recentes" />
            <SidebarItem icon={Star} label="Favoritos" />
            <SidebarItem icon={FileText} label="Meus Rascunhos" active />
            <SidebarItem icon={LayoutTemplate} label="Templates" />
          </nav>
        </div>

        {/* Pastas */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2 group cursor-pointer">
            <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Pastas
            </h3>
            <Plus size={14} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <nav className="space-y-0.5">
            <FolderItem label="Planejamento 2024" />
            <FolderItem label="Artigos do Blog" />
            <FolderItem label="Reuniões Semanais" />
            <FolderItem label="Ideias de Produto" />
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900">
        <button className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-sm w-full transition-colors">
          <Settings size={16} />
          Configurações do Editor
        </button>
      </div>
    </aside>
  );
};

const SidebarItem = ({ icon: Icon, label, active }: any) => (
  <button className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
    active 
      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-medium shadow-sm ring-1 ring-blue-100 dark:ring-blue-900/30' 
      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
  }`}>
    <Icon size={16} className={active ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'} />
    {label}
  </button>
);

const FolderItem = ({ label }: any) => (
  <button className="w-full flex items-center justify-between group px-3 py-1.5 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
    <div className="flex items-center gap-2">
      <ChevronRight size={14} className="text-zinc-400" />
      <Folder size={14} className="text-zinc-400 group-hover:text-yellow-500 transition-colors" />
      <span className="truncate max-w-[140px]">{label}</span>
    </div>
    <MoreHorizontal size={14} className="opacity-0 group-hover:opacity-100 text-zinc-400" />
  </button>
);