"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Trophy, 
  Settings, 
  HelpCircle, 
  LogOut, 
  X,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from "lucide-react";
import { UserProfile, MODULE_DEFINITIONS } from "@/app/dashboard/types";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  user: UserProfile;
}

const mainItems = [
  { name: "Visão Geral", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Conquistas", icon: Trophy, href: "/dashboard/achievements" },
  { name: "Configurações", icon: Settings, href: "/dashboard/settings" },
];

const supportItems = [
  { name: "Ajuda & Suporte", icon: HelpCircle, href: "/recursos/ajuda" },
];

export default function Sidebar({ 
  isOpen, 
  setIsOpen, 
  isCollapsed, 
  setIsCollapsed, 
  user 
}: SidebarProps) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const userModules = user.active_modules
    ?.map(slug => MODULE_DEFINITIONS[slug])
    .filter(Boolean) || [];

  return (
    <>
      {/* Overlay Mobile */}
      <div 
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 left-0 z-50 h-full bg-white dark:bg-[#0f0f12] border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out 
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "w-20" : "w-72"}
        `}
      >
        {/* Background Decorativo (Gradiente Sutil) */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-brand-purple/5 pointer-events-none" />

        <div className="flex flex-col h-full relative z-10">
          
          {/* Header Sidebar */}
          <div className={`h-20 flex items-center ${isCollapsed ? "justify-center" : "justify-between px-6"} border-b border-gray-100 dark:border-gray-800`}>
             <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
                {/* Logo Text (Some ao colapsar) */}
                <span className={`text-xl font-bold bg-clip-text text-transparent bg-brand-gradient whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? "opacity-0 w-0" : "opacity-100"}`}>
                  Facillit Hub
                </span>
             </Link>
             
             {/* Botão Fechar (Mobile) */}
             <button 
               onClick={() => setIsOpen(false)} 
               className="lg:hidden text-gray-500 hover:text-brand-purple"
             >
               <X size={20} />
             </button>
          </div>

          {/* Botão Colapsar (Desktop) - Flutuante na borda */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-3 top-24 w-6 h-6 bg-white dark:bg-[#1a1a1e] border border-gray-200 dark:border-gray-700 rounded-full items-center justify-center text-gray-500 hover:text-brand-purple hover:border-brand-purple transition-all shadow-sm z-50"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* Navegação */}
          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8 custom-scrollbar">
            
            {/* Grupo Principal */}
            <div>
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 animate-fade-in">
                  Menu
                </p>
              )}
              <div className="space-y-1">
                {mainItems.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    title={isCollapsed ? item.name : ""}
                    className={`relative flex items-center ${isCollapsed ? "justify-center px-0" : "px-3"} py-3 rounded-xl transition-all duration-200 group overflow-hidden
                      ${isActive(item.href)
                        ? "text-white shadow-lg shadow-purple-500/20"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-brand-purple"
                      }
                    `}
                  >
                    {/* Background Ativo com Gradiente */}
                    {isActive(item.href) && (
                      <div className="absolute inset-0 bg-brand-gradient opacity-100 rounded-xl" />
                    )}

                    <item.icon 
                      size={22} 
                      className={`relative z-10 transition-transform duration-300 ${isActive(item.href) ? "scale-100" : "group-hover:scale-110"}`} 
                    />
                    
                    <span className={`relative z-10 ml-3 font-medium whitespace-nowrap transition-all duration-200 ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"}`}>
                      {item.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-800 mx-2" />

            {/* Módulos */}
            <div>
              {!isCollapsed && (
                <div className="px-3 flex items-center justify-between mb-3 animate-fade-in">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aplicações</p>
                  <Link href="/dashboard/account" className="text-[10px] text-brand-purple hover:underline">Editar</Link>
                </div>
              )}
              
              <div className="space-y-1.5">
                {userModules.length > 0 ? (
                  userModules.map((module) => (
                    <Link
                      key={module.href}
                      href={module.href}
                      title={isCollapsed ? module.name : ""}
                      className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} py-2.5 px-3 rounded-xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 group
                        ${isActive(module.href) ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/20' : ''}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${isActive(module.href) ? 'bg-white dark:bg-transparent shadow-sm' : 'bg-gray-50 dark:bg-gray-800'}`}>
                           <i className={`fas ${module.iconClass} text-sm ${module.color}`}></i>
                        </div>
                        <span className={`text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors ${isCollapsed ? "hidden" : "block"}`}>
                          {module.name}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  !isCollapsed && (
                    <div className="p-4 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/20">
                      <p className="text-xs text-gray-500 mb-2">Sem módulos ativos</p>
                      <Link href="/dashboard/onboarding" className="text-xs font-bold text-brand-purple">Ativar agora</Link>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Suporte (Fundo) */}
            <div className="mt-auto">
               <div className="space-y-1">
                {supportItems.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    title={isCollapsed ? item.name : ""}
                    className={`flex items-center ${isCollapsed ? "justify-center" : ""} gap-3 px-3 py-3 rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-brand-green transition-all group`}
                  >
                    <item.icon size={22} className="group-hover:rotate-12 transition-transform" />
                    <span className={`${isCollapsed ? "hidden" : "block"} font-medium`}>{item.name}</span>
                  </Link>
                ))}
               </div>
            </div>

          </div>

          {/* Footer User (Compacto vs Completo) */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            {isCollapsed ? (
               <button className="w-full flex justify-center text-gray-400 hover:text-red-500 transition-colors">
                 <LogOut size={20} />
               </button>
            ) : (
               <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-700 dark:text-white truncate">{user.full_name || "Usuário"}</p>
                    <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                  </div>
                  <button className="text-gray-400 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <LogOut size={18} />
                  </button>
               </div>
            )}
          </div>

        </div>
      </aside>
    </>
  );
}