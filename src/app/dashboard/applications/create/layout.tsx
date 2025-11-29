import React from 'react';
import { CreateSidebar } from './components/CreateSidebar';

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Sidebar de Navegação */}
      <CreateSidebar />
      
      {/* Área Principal (Toolbar + Editor) */}
      <main className="flex-1 flex flex-col relative min-w-0 bg-zinc-50 dark:bg-zinc-950">
        {children}
      </main>
    </div>
  );
}