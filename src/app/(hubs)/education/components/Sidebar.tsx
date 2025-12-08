'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Pencil, 
  CheckCircle, 
  Library, 
  Gamepad2, 
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  HelpCircle,
  X
} from 'lucide-react';
import Image from 'next/image';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  onCloseMobile: () => void;
}

export default function EducationSidebar({ 
  isOpen, 
  isCollapsed, 
  toggleCollapse, 
  onCloseMobile 
}: SidebarProps) {
  const pathname = usePathname();

  // Helper para estilo ativo
  const isActive = (path: string) => pathname === path || pathname?.startsWith(`${path}/`);

  // Lista de Módulos (No futuro, você pode filtrar isso baseado nas permissões do usuário)
  const modules = [
    { title: 'Visão Geral', path: '/education', icon: <LayoutDashboard size={20} />, enabled: true },
    { title: 'Redação', path: '/education/applications/write', icon: <Pencil size={20} />, enabled: true },
    { title: 'Simulados', path: '/education/applications/test', icon: <CheckCircle size={20} />, enabled: true },
    { title: 'Biblioteca', path: '/education/applications/library', icon: <Library size={20} />, enabled: true },
    { title: 'Aulas', path: '/education/applications/edu', icon: <PlayCircle size={20} />, enabled: true }, // Exemplo: desabilitado se o plano não permitir
    { title: 'Jogos', path: '/education/applications/games', icon: <Gamepad2 size={20} />, enabled: false }, 
  ];

  return (
    <>
      {/* Overlay Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed top-0 left-0 z-50 h-full bg-white border-r border-neutral-200 shadow-sm
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        <div className="flex flex-col h-full">
          
          {/* Header: Logo & Collapse Toggle */}
          <div className={`h-16 flex items-center border-b border-neutral-100 px-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            
            {!isCollapsed && (
              <Link href="/education" className="flex items-center gap-2 overflow-hidden">
                <div className="relative w-8 h-8 min-w-[2rem]">
                   <Image 
                     src="/assets/images/LOGO/isologo/azul.png" 
                     alt="FH" 
                     fill
                     className="object-contain"
                   />
                </div>
                <span className="font-bold text-lg text-neutral-800 whitespace-nowrap">Education</span>
              </Link>
            )}
            
            {isCollapsed && (
               <div className="relative w-8 h-8">
                 <Image src="/assets/images/LOGO/isologo/azul.png" alt="FH" fill className="object-contain"/>
               </div>
            )}

            {/* Mobile Close Button */}
            <button onClick={onCloseMobile} className="lg:hidden text-neutral-500">
              <X size={24} />
            </button>

            {/* Desktop Collapse Button */}
            <button 
              onClick={toggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-blue-600 transition-colors"
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-6 space-y-1 custom-scrollbar">
            
            {/* Título da Seção (Apenas se expandido) */}
            {!isCollapsed && (
              <div className="px-6 mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Módulos
              </div>
            )}

            {modules.map((item) => {
              if (!item.enabled) return null; // Não renderiza se não estiver habilitado

              const active = isActive(item.path);
              
              return (
                <div key={item.path} className="px-3">
                  <Link
                    href={item.path}
                    title={isCollapsed ? item.title : ''}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                      ${active 
                        ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100' 
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                  >
                    <div className={`${active ? 'text-blue-600' : 'text-neutral-500 group-hover:text-neutral-700'}`}>
                      {item.icon}
                    </div>
                    
                    {!isCollapsed && (
                      <span className="text-sm font-medium whitespace-nowrap">
                        {item.title}
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-3 border-t border-neutral-100 space-y-1">
             <Link
                href="/account" // Rota global de conta
                title="Minha Conta"
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors
                  text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900
                  ${isCollapsed ? 'justify-center' : ''}
                `}
              >
                <Settings size={20} />
                {!isCollapsed && <span className="text-sm font-medium">Configurações</span>}
              </Link>

              <Link
                href="/selection"
                title="Trocar Hub"
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors
                  text-neutral-600 hover:bg-red-50 hover:text-red-600
                  ${isCollapsed ? 'justify-center' : ''}
                `}
              >
                <LogOut size={20} />
                {!isCollapsed && <span className="text-sm font-medium">Trocar Hub</span>}
              </Link>
          </div>
        </div>
      </aside>
    </>
  );
}