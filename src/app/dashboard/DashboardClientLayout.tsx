"use client";

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';

export default function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Sidebar (Fixed Left) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Content Wrapper */}
      <div className="lg:pl-72 transition-all duration-300">
        
        {/* Topbar (Fixed Top, width ajustado pelo lg:left-72 no componente Topbar) */}
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Main Content Area */}
        <main className="pt-28 px-6 md:px-10 pb-10">
            {children}
        </main>
      </div>
    </div>
  );
}