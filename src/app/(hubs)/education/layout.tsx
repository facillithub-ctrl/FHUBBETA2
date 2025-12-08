'use client';

import React, { useState } from 'react';
import EducationSidebar from './components/Sidebar';
import EducationTopbar from './components/Topbar';

export default function EducationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      
      {/* Sidebar Controlada */}
      <EducationSidebar 
        isOpen={isSidebarOpen} 
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onCloseMobile={() => setIsSidebarOpen(false)} 
      />

      {/* Área de Conteúdo */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative">
        
        {/* Topbar */}
        <EducationTopbar 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 scroll-smooth">
          <div className="w-full max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}