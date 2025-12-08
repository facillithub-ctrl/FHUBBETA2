// src/app/dashboard/applications/library/components/LibraryHeader.tsx
'use client'

import { useState } from 'react';

interface LibraryHeaderProps {
  currentFolder?: string | null;
  onSearch: (query: string) => void;
}

export default function LibraryHeader({ currentFolder, onSearch }: LibraryHeaderProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      {/* Breadcrumbs (Simplificado) */}
      <div className="flex items-center text-sm text-gray-500">
        <span className="hover:text-gray-900 cursor-pointer">Meu Acervo</span>
        {currentFolder && (
          <>
            <i className="fas fa-chevron-right mx-2 text-xs"></i>
            <span className="font-medium text-gray-900">Pasta Atual</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Barra de Busca */}
        <div className="relative group">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-royal-blue transition-colors"></i>
          <input 
            type="text" 
            placeholder="Buscar arquivos..." 
            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-royal-blue w-64 transition-all"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {/* Toggle de Visualização */}
        <div className="bg-white border border-gray-200 rounded-lg p-1 flex">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-royal-blue' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <i className="fas fa-th-large"></i>
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-100 text-royal-blue' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <i className="fas fa-list"></i>
          </button>
        </div>

        {/* Botão Novo */}
        <button className="bg-royal-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
          <i className="fas fa-plus"></i>
          <span className="hidden sm:inline">Novo</span>
        </button>
      </div>
    </header>
  );
}