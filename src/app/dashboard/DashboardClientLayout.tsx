"use client";

import { useState, ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

interface DashboardClientLayoutProps {
  children: ReactNode;
  user?: any; // Recebe os dados do usuário do Server Component
}

export default function DashboardClientLayout({ 
  children, 
  user 
}: DashboardClientLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#0f0f12] font-sans">
      
      {/* Sidebar: Controlada pelo estado */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />

      {/* Wrapper do Conteúdo Principal */}
      {/* lg:pl-72 empurra o conteúdo para a direita quando a sidebar está fixa no desktop */}
      <div className="flex flex-col min-h-screen transition-all duration-300 ease-in-out lg:pl-72">
        
        {/* Topbar: Passamos a função para abrir o menu no mobile */}
        <Topbar 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          user={user}
        />

        {/* Área de Conteúdo das Páginas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="mx-auto max-w-7xl animate-fade-in-up">
            {children}
          </div>
        </main>
        
        {/* Footer Simples da Dashboard (Opcional) */}
        <footer className="px-8 py-4 text-center text-xs text-gray-400 dark:text-gray-600">
          &copy; {new Date().getFullYear()} Facillit Hub. Todos os direitos reservados.
        </footer>

      </div>
    </div>
  );
}