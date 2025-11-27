"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  Settings, 
  HelpCircle, 
  LogOut, 
  X,
  UserCircle,
  ChevronRight,
  BoxSelect
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

// Módulos habilitados simulados (Isso viria do seu banco de dados)
const myModules = [
  { name: "Facillit Write", href: "/dashboard/modules/write", color: "text-purple-500" },
  { name: "Facillit Math", href: "/dashboard/modules/math", color: "text-blue-500" },
  { name: "Facillit Code", href: "/dashboard/modules/code", color: "text-green-500" },
];

const mainItems = [
  { name: "Visão Geral", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Conquistas", icon: Trophy, href: "/dashboard/achievements" },
  { name: "Configurações", icon: Settings, href: "/dashboard/settings" },
];

const supportItems = [
  { name: "Ajuda & Suporte", icon: HelpCircle, href: "/recursos/ajuda" },
];

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

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
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-[#0f0f12] border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          
          {/* Header da Marca */}
          <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/20">
                  F
                </div>
                <span className="text-lg font-bold bg-clip-text text-transparent bg-brand-gradient">
                  Facillit Hub
                </span>
             </div>
             {/* Botão fechar apenas no mobile */}
             <button 
               onClick={() => setIsOpen(false)} 
               className="ml-auto lg:hidden text-gray-500 hover:text-brand-purple"
             >
               <X size={20} />
             </button>
          </div>

          {/* Navegação */}
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 custom-scrollbar">
            
            {/* Seção Principal */}
            <div>
              <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Menu Principal
              </p>
              <div className="space-y-1">
                {mainItems.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm group ${
                      isActive(item.href)
                        ? "bg-brand-gradient text-white font-medium shadow-md shadow-purple-500/20"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-brand-purple"
                    }`}
                  >
                    <item.icon size={18} className={isActive(item.href) ? "text-white" : "group-hover:scale-105 transition-transform"} />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="h-px bg-gray-200 dark:bg-gray-800 mx-2" />

            {/* Seção Meus Módulos (Habilitados) */}
            <div>
              <div className="px-4 flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Meus Módulos
                </p>
                <Link href="/dashboard/modules" className="text-[10px] text-brand-purple hover:underline">
                  Ver todos
                </Link>
              </div>
              
              <div className="space-y-1">
                {/* Link Pai para a lista completa */}
                <Link 
                   href="/dashboard/modules"
                   className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm mb-2 ${
                      isActive("/dashboard/modules") 
                      ? "bg-brand-gradient text-white" 
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                   }`}
                >
                   <BoxSelect size={18} />
                   <span>Gerenciar Módulos</span>
                </Link>

                {/* Lista dos módulos específicos */}
                <div className="ml-3 border-l border-gray-200 dark:border-gray-800 pl-3 space-y-1">
                  {myModules.map((module) => (
                    <Link
                      key={module.href}
                      href={module.href}
                      className="flex items-center justify-between group py-2 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <span className={`text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-brand-purple transition-colors`}>
                        {module.name}
                      </span>
                      <ChevronRight size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-200 dark:bg-gray-800 mx-2" />

            {/* Seção Suporte */}
            <div>
              <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Ajuda
              </p>
              <div className="space-y-1">
                {supportItems.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-brand-purple transition-all"
                  >
                    <item.icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* Footer - Sair */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <button className="flex items-center justify-center w-full gap-2 px-4 py-2 text-xs font-semibold text-red-500 transition-colors bg-red-50 dark:bg-red-900/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 group">
              <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Desconectar</span>
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}