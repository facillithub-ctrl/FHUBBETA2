'use client';

import React, { useState } from 'react';
import CreateSidebar from './components/CreateSidebar';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-full min-h-screen bg-[#fdfbf7]">
      {/* Sidebar Específica do Facillit Create */}
      <aside 
        className={`
          transition-all duration-300 ease-in-out border-r border-gray-200 bg-white
          ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}
        `}
      >
        <CreateSidebar />
      </aside>

      {/* Conteúdo Principal (Dashboard ou Editor) */}
      <main className="flex-1 flex flex-col relative transition-all duration-300">
        
        {/* Botão Flutuante para alternar a Sidebar (útil no modo Editor para ganhar espaço) */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-4 left-4 z-40 p-2 bg-white/80 backdrop-blur rounded-full shadow-sm hover:shadow text-gray-500 hover:text-brand-purple transition-all"
          title={isSidebarOpen ? "Fechar Menu" : "Abrir Menu"}
        >
          {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>

        {children}
      </main>
    </div>
  );
}