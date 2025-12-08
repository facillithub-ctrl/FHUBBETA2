'use client'; // <--- ESTA LINHA É OBRIGATÓRIA QUANDO SE USA useState

import React, { useState } from 'react';
// Certifique-se que moveu a Sidebar e Topbar para esta pasta conforme combinamos
import EducationSidebar from './components/Sidebar';
import EducationTopbar from './components/Topbar';

export default function EducationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar Local */}
      <EducationSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar Local */}
        <EducationTopbar 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}