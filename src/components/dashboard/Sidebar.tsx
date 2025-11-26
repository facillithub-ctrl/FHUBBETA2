"use client";

import Link from 'next/link';
import Image from 'next/image';
import createClient from '@/utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import type { UserProfile } from '@/app/dashboard/types';
import { 
  LayoutDashboard, GraduationCap, Gamepad2, PenTool, CalendarCheck, 
  PlayCircle, BookOpen, Users, Target, FlaskConical, 
  FileText, ListTodo, Lightbulb, ShieldAlert, 
  ChevronLeft, ChevronRight, LogOut, Settings, 
  Sparkles, LifeBuoy, Command
} from 'lucide-react';
import { useState, useEffect } from 'react';

// Definição rica dos menus
const menuStructure = [
  {
    category: "Principal",
    items: [
      { slug: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard, href: '/dashboard', description: 'Seu centro de comando' },
    ]
  },
  {
    category: "Estudos & IA",
    items: [
      { slug: 'edu', label: 'Facillit Edu', icon: GraduationCap, href: '/dashboard/applications/edu', description: 'Plataforma de ensino' },
      { slug: 'write', label: 'Redação Inteligente', icon: PenTool, href: '/dashboard/applications/write', description: 'Correção por IA' },
      { slug: 'test', label: 'Simulados', icon: FileText, href: '/dashboard/applications/test', description: 'Testes e provas' },
      { slug: 'library', label: 'Biblioteca', icon: BookOpen, href: '/dashboard/applications/library', description: 'Acervo digital' },
      { slug: 'lab', label: 'Laboratório', icon: FlaskConical, href: '/dashboard/applications/lab', description: 'Experimentos virtuais' },
    ]
  },
  {
    category: "Engajamento",
    items: [
      { slug: 'games', label: 'Gamificação', icon: Gamepad2, href: '/dashboard/applications/games', description: 'Aprenda jogando' },
      { slug: 'play', label: 'Facillit Play', icon: PlayCircle, href: '/dashboard/applications/play', description: 'Conteúdo em vídeo' },
      { slug: 'connect', label: 'Comunidade', icon: Users, href: '/dashboard/applications/connect', description: 'Conecte-se com outros' },
    ]
  },
  {
    category: "Produtividade",
    items: [
      { slug: 'day', label: 'Agenda', icon: CalendarCheck, href: '/dashboard/applications/day', description: 'Seu dia a dia' },
      { slug: 'task', label: 'Tarefas', icon: ListTodo, href: '/dashboard/applications/task', description: 'Gestão de pendências' },
      { slug: 'coach-career', label: 'Carreira', icon: Target, href: '/dashboard/applications/coach-career', description: 'Planejamento futuro' },
      { slug: 'create', label: 'Estúdio', icon: Lightbulb, href: '/dashboard/applications/create', description: 'Ferramentas criativas' },
    ]
  },
  {
    category: "Sistema",
    items: [
      { slug: 'admin', label: 'Administração', icon: ShieldAlert, href: '/admin', description: 'Painel de controle' },
    ]
  }
];

type SidebarProps = {
  userProfile: UserProfile;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
  isDesktopCollapsed: boolean;
  setIsDesktopCollapsed: (isCollapsed: boolean) => void;
};

export default function Sidebar({ 
  userProfile, 
  isMobileOpen, 
  setIsMobileOpen, 
  isDesktopCollapsed, 
  setIsDesktopCollapsed 
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [isHoveringSidebar, setIsHoveringSidebar] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Filtra os links com base nas permissões do usuário
  const filteredMenu = menuStructure.map(group => ({
    ...group,
    items: group.items.filter(link => {
      if (userProfile.userCategory === 'administrator') return ['dashboard', 'admin'].includes(link.slug);
      if (userProfile.userCategory === 'diretor') return ['dashboard', 'edu'].includes(link.slug);
      if (link.slug === 'dashboard') return true;
      return userProfile.active_modules?.includes(link.slug);
    })
  })).filter(group => group.items.length > 0);

  // Determina se deve expandir ao passar o mouse (opcional, desativado por padrão para UX mais estável)
  // const shouldExpand = isDesktopCollapsed && isHoveringSidebar;

  return (
    <>
      {/* Overlay Mobile (Fundo escuro com blur) */}
      <div
        onClick={() => setIsMobileOpen(false)}
        className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-500 ${
            isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar Container Principal */}
      <aside 
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 flex flex-col h-full bg-white border-r border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)]
          transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]
          ${isMobileOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full w-[280px]'}
          lg:translate-x-0 
          ${isDesktopCollapsed ? 'lg:w-[88px]' : 'lg:w-[280px]'}
        `}
        onMouseEnter={() => setIsHoveringSidebar(true)}
        onMouseLeave={() => setIsHoveringSidebar(false)}
      >
        {/* 1. Header da Marca */}
        <div className="h-24 flex items-center px-6 relative">
          <div className={`flex items-center gap-4 w-full transition-all duration-300 ${isDesktopCollapsed ? 'justify-center' : 'justify-start'}`}>
            
            {/* Logo Ícone */}
            <div className="relative group cursor-pointer">
                <div className="absolute -inset-2 bg-gradient-to-tr from-[#42047e]/20 to-[#07f49e]/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-[#42047e] to-[#07f49e] flex items-center justify-center text-white font-bold text-xl shadow-sm">
                    F
                </div>
            </div>
            
            {/* Logo Texto (Escondido no modo colapsado) */}
            <div className={`flex flex-col overflow-hidden whitespace-nowrap transition-all duration-300 ${
              isDesktopCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
            }`}>
              <span className="text-xl font-bold tracking-tight text-gray-900 leading-none">
                Facillit<span className="text-[#07f49e]">.</span>
              </span>
              <span className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase mt-1">
                Hub Educacional
              </span>
            </div>
          </div>
        </div>

        {/* 2. Navegação Principal */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-4 custom-scrollbar space-y-8">
          {filteredMenu.map((group, idx) => (
            <div key={idx} className="relative">
              
              {/* Título da Categoria */}
              {!isDesktopCollapsed && (
                <h3 className="px-3 mb-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  {group.category}
                  <div className="h-px flex-1 bg-gray-50"></div>
                </h3>
              )}
              
              {/* Separador visual quando colapsado */}
              {isDesktopCollapsed && idx > 0 && (
                 <div className="mx-auto w-10 h-px bg-gray-100 my-4" />
              )}

              <ul className="space-y-1.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <li key={item.slug}>
                      <Link 
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`
                          group relative flex items-center h-12 rounded-xl transition-all duration-300 outline-none
                          ${isDesktopCollapsed ? 'justify-center px-0' : 'px-3.5'}
                          ${isActive 
                            ? 'bg-[#42047e]/5 text-[#42047e]' 
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                      >
                        {/* Indicador Ativo (Barra lateral) */}
                        {isActive && (
                          <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-lg bg-gradient-to-b from-[#42047e] to-[#07f49e] transition-all duration-300 ${isDesktopCollapsed ? 'h-6' : 'h-8'}`} />
                        )}

                        {/* Ícone */}
                        <Icon 
                          size={22} 
                          strokeWidth={isActive ? 2.5 : 2}
                          className={`
                            flex-shrink-0 transition-transform duration-300
                            ${isActive ? 'text-[#42047e] scale-105' : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-105'}
                          `}
                        />

                        {/* Texto e Descrição (Expandido) */}
                        <div className={`ml-3.5 flex flex-col overflow-hidden whitespace-nowrap transition-all duration-300 ${
                          isDesktopCollapsed ? 'hidden opacity-0 w-0' : 'block opacity-100'
                        }`}>
                          <span className="text-sm font-medium leading-none">{item.label}</span>
                          {/* Descrição opcional para dar mais contexto */}
                          {/* <span className="text-[10px] text-gray-400 mt-1 truncate">{item.description}</span> */}
                        </div>

                        {/* Tooltip Sofisticado (Colapsado) */}
                        {isDesktopCollapsed && (
                          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-4 py-2.5 bg-gray-900 text-white rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 shadow-xl translate-x-[-10px] group-hover:translate-x-0 min-w-max">
                            <div className="font-semibold text-xs">{item.label}</div>
                            <div className="text-[10px] text-gray-400 font-medium">{item.description}</div>
                            {/* Seta do Tooltip */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                          </div>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* 3. Rodapé da Conta (Perfil Rico) */}
        <div className="p-4 border-t border-gray-100 bg-white z-10">
            <div className={`
                relative overflow-hidden transition-all duration-500
                ${isDesktopCollapsed 
                    ? 'rounded-2xl bg-transparent p-0' 
                    : 'rounded-2xl bg-gradient-to-b from-white to-gray-50 border border-gray-100 shadow-sm p-3'
                }
            `}>
                {/* Botão de Colapso (Visível apenas quando expandido, no topo do card) */}
                {!isDesktopCollapsed && (
                    <button 
                        onClick={() => setIsDesktopCollapsed(true)}
                        className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-[#42047e] hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                        <ChevronLeft size={16} />
                    </button>
                )}

                {/* Área do Usuário */}
                <div className={`flex items-center ${isDesktopCollapsed ? 'justify-center flex-col gap-4' : 'gap-3'}`}>
                    
                    {/* Avatar com Anel de Status */}
                    <Link href="/dashboard/account" className="relative flex-shrink-0 group">
                        <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#42047e] to-[#07f49e] shadow-md group-hover:shadow-lg transition-shadow">
                            <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
                                {userProfile.avatarUrl ? (
                                    <Image src={userProfile.avatarUrl} alt="User" width={40} height={40} className="rounded-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-[#42047e] font-bold text-sm">
                                        {userProfile.fullName?.charAt(0)}
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Indicador Online */}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </Link>

                    {/* Info Text (Expandido) */}
                    <div className={`flex-1 min-w-0 transition-all duration-300 ${isDesktopCollapsed ? 'hidden opacity-0' : 'block opacity-100'}`}>
                        <Link href="/dashboard/account" className="block group-hover:text-[#42047e]">
                            <p className="text-sm font-bold text-gray-900 truncate leading-tight">
                                {userProfile.fullName}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Sparkles size={10} className="text-[#42047e] fill-[#42047e]" />
                                <p className="text-[10px] font-semibold text-[#42047e] uppercase tracking-wide truncate">
                                    Facillit Account
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Ações Rápidas (Expandido) */}
                {!isDesktopCollapsed && (
                    <div className="flex items-center justify-between border-t border-gray-200/60 mt-3 pt-2">
                        <Link href="/dashboard/settings">
                            <button className="p-2 text-gray-400 hover:text-[#42047e] hover:bg-white rounded-lg transition-colors" title="Configurações">
                                <Settings size={16} />
                            </button>
                        </Link>
                        <div className="h-4 w-px bg-gray-200"></div>
                        <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-white rounded-lg transition-colors" title="Suporte">
                            <LifeBuoy size={16} />
                        </button>
                        <div className="h-4 w-px bg-gray-200"></div>
                        <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors" title="Sair">
                            <LogOut size={16} />
                        </button>
                    </div>
                )}

                {/* Botão Expandir (Colapsado) */}
                {isDesktopCollapsed && (
                    <button 
                        onClick={() => setIsDesktopCollapsed(false)}
                        className="mt-3 w-full flex justify-center p-2.5 text-gray-400 hover:text-[#42047e] hover:bg-gray-50 rounded-xl transition-all group"
                        title="Expandir Menu"
                    >
                        <ChevronRight size={20} className="group-hover:scale-110 transition-transform" />
                    </button>
                )}
            </div>
        </div>
      </aside>
    </>
  );
}