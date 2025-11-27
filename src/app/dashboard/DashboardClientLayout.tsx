"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { UserProfile } from "./types";

interface DashboardClientLayoutProps {
  children: React.ReactNode;
  user: UserProfile;
}

export default function DashboardClientLayout({ 
  children, 
  user 
}: DashboardClientLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile
  const [isCollapsed, setIsCollapsed] = useState(false);     // Desktop

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#000000] font-sans selection:bg-brand-purple/20">
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        user={user}
      />

      {/* Área Principal */}
      {/* Ajuste dinâmico da margem: lg:pl-20 (colapsado) vs lg:pl-72 (expandido) */}
      <div 
        className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-20" : "lg:pl-72"
        }`}
      >
        
        {/* Topbar */}
        <Topbar 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          user={user}
        />

        {/* Conteúdo */}
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl animate-fade-in-up">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}