'use client';

import React from 'react';
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

  const isActive = (path: string) => {
    if (path === '/education' && pathname === '/education') return true;
    if (path !== '/education' && pathname?.startsWith(path)) return true;
    return false;
  };

  const modules = [
    { title: 'Visão Geral', path: '/education', icon: <LayoutDashboard size={22} />, enabled: true },
    { title: 'Redação', path: '/education/applications/write', icon: <Pencil size={22} />, enabled: true },
    { title: 'Simulados', path: '/education/applications/test', icon: <CheckCircle size={22} />, enabled: true },
    { title: 'Biblioteca', path: '/education/applications/library', icon: <Library size={22} />, enabled: true },
    { title: 'Aulas', path: '/education/applications/edu', icon: <PlayCircle size={22} />, enabled: true },
    { title: 'Jogos', path: '/education/applications/games', icon: <Gamepad2 size={22} />, enabled: false }, 
  ];

  return (
    <>
      {/* Overlay Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed top-0 left-0 z-50 h-full bg-white border-r border-neutral-200 shadow-xl lg:shadow-none
          transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static
          ${isCollapsed ? 'w-[88px]' : 'w-72'}
        `}
      >
        <div className="flex flex-col h-full">
          
          {/* Header: Logo */}
          <div className={`h-20 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} border-b border-neutral-100`}>
            
            {!isCollapsed ? (
              <Link href="/education" className="flex items-center gap-3 group">
                <div className="relative w-8 h-8 transition-transform group-hover:scale-110">
                   <Image 
                     src="/assets/images/LOGO/isologo/azul.png" 
                     alt="FH" 
                     fill
                     className="object-contain"
                   />
                </div>
                <span className="font-bold text-xl text-neutral-800 tracking-tight">Education</span>
              </Link>
            ) : (
               <Link href="/education" className="relative w-9 h-9 hover:scale-110 transition-transform">
                 <Image src="/assets/images/LOGO/isologo/azul.png" alt="FH" fill className="object-contain"/>
               </Link>
            )}

            <button onClick={onCloseMobile} className="lg:hidden p-2 text-neutral-400 hover:text-neutral-600">
              <X size={24} />
            </button>

            {/* Desktop Collapse Button */}
            <button 
              onClick={toggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-neutral-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2 custom-scrollbar">
            
            {!isCollapsed && (
              <div className="px-4 mb-3 text-[11px] font-bold text-neutral-400 uppercase tracking-widest opacity-80">
                Menu Principal
              </div>
            )}

            {modules.map((item) => {
              if (!item.enabled) return null;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  title={isCollapsed ? item.title : ''}
                  className={`
                    flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative
                    ${active 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-medium' 
                      : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'}
                    ${isCollapsed ? 'justify-center px-0' : ''}
                  `}
                >
                  <div className={`relative z-10 flex items-center justify-center ${active ? 'text-white' : 'text-neutral-500 group-hover:text-blue-600 transition-colors'}`}>
                    {item.icon}
                  </div>
                  
                  {!isCollapsed && (
                    <span className="relative z-10 text-sm">
                      {item.title}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-neutral-100 space-y-2 bg-neutral-50/30">
             <Link
                href="/account" // Rota global absoluta para a conta
                title="Minha Conta"
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors
                  text-neutral-600 hover:bg-white hover:shadow-md border border-transparent hover:border-neutral-100
                  ${isCollapsed ? 'justify-center px-0' : ''}
                `}
              >
                <Settings size={22} className="text-neutral-500" />
                {!isCollapsed && <span className="text-sm font-medium">Minha Conta</span>}
              </Link>

              <Link
                href="/selection"
                title="Trocar Hub"
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors
                  text-neutral-600 hover:bg-red-50 hover:text-red-600 hover:shadow-sm border border-transparent
                  ${isCollapsed ? 'justify-center px-0' : ''}
                `}
              >
                <LogOut size={22} className="hover:text-red-600" />
                {!isCollapsed && <span className="text-sm font-medium">Trocar Hub</span>}
              </Link>
          </div>
        </div>
      </aside>
    </>
  );
}