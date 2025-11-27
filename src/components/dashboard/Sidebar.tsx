"use client";

import Link from 'next/link';
import Image from 'next/image';
import createClient from '@/utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import type { UserProfile } from '@/app/dashboard/types';
import { 
    LayoutDashboard, PenTool, FileText, GraduationCap, BookOpen, 
    Gamepad2, Calendar, PlayCircle, Users, Target, FlaskConical, 
    CheckSquare, Lightbulb, ChevronLeft, ChevronRight, LogOut, 
    ShieldCheck, X, Sparkles, Layers, Zap
} from 'lucide-react';

// Organização Lógica
const navSections = [
    {
        title: "Workspace",
        items: [
            { href: '/dashboard', slug: 'dashboard', icon: LayoutDashboard, label: 'Visão Geral' },
            { href: '/dashboard/applications/day', slug: 'day', icon: Calendar, label: 'Agenda' },
        ]
    },
    {
        title: "Estudos",
        items: [
            { href: '/dashboard/applications/write', slug: 'write', icon: PenTool, label: 'Redação' },
            { href: '/dashboard/applications/test', slug: 'test', icon: FileText, label: 'Simulados' },
            { href: '/dashboard/applications/edu', slug: 'edu', icon: GraduationCap, label: 'Turmas' },
            { href: '/dashboard/applications/library', slug: 'library', icon: BookOpen, label: 'Biblioteca' },
        ]
    },
    {
        title: "Comunidade",
        items: [
            { href: '/dashboard/applications/games', slug: 'games', icon: Gamepad2, label: 'Games' },
            { href: '/dashboard/applications/play', slug: 'play', icon: PlayCircle, label: 'Play' },
            { href: '/dashboard/applications/connect', slug: 'connect', icon: Users, label: 'Connect' },
        ]
    },
    {
        title: "Apps",
        items: [
            { href: '/dashboard/applications/coach-career', slug: 'coach-career', icon: Target, label: 'Carreira' },
            { href: '/dashboard/applications/lab', slug: 'lab', icon: FlaskConical, label: 'Laboratório' },
            { href: '/dashboard/applications/task', slug: 'task', icon: CheckSquare, label: 'Tarefas' },
            { href: '/dashboard/applications/create', slug: 'create', icon: Lightbulb, label: 'Studio' },
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

export default function Sidebar({ userProfile, isMobileOpen, setIsMobileOpen, isDesktopCollapsed, setIsDesktopCollapsed }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  if (!userProfile) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isAdmin = userProfile.userCategory === 'administrator';

  const hasAccess = (slug: string) => {
      if (isAdmin) return true;
      if (slug === 'dashboard') return true;
      if (userProfile.userCategory === 'diretor' && ['edu', 'test', 'write'].includes(slug)) return true;
      return userProfile.active_modules?.includes(slug);
  };

  return (
    <>
      {/* Overlay Mobile */}
      <div 
        onClick={() => setIsMobileOpen(false)} 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
      />

      <aside 
        className={`
            fixed lg:relative top-0 left-0 h-full z-50 flex flex-col
            bg-[#050505] text-[#888] border-r border-[#1a1a1a]
            transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
            ${isMobileOpen ? 'translate-x-0 w-[240px]' : '-translate-x-full w-[240px]'} 
            lg:translate-x-0 ${isDesktopCollapsed ? 'lg:w-[64px]' : 'lg:w-[240px]'}
        `}
      >
        {/* Header Ultra Minimalista */}
        <div className={`h-14 flex items-center px-4 mb-2 border-b border-[#1a1a1a] ${isDesktopCollapsed ? 'justify-center' : ''}`}>
            <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-gradient-to-tr from-[#42047e] to-[#07f49e] rounded-md flex items-center justify-center shadow-lg shadow-purple-900/20">
                    <Image src="/assets/images/LOGO/png/logoazul.svg" alt="FHub" width={16} height={16} className="brightness-0 invert" />
                </div>
                <span className={`font-semibold text-gray-200 text-sm tracking-tight transition-opacity duration-200 ${isDesktopCollapsed ? 'hidden opacity-0' : 'block opacity-100'}`}>
                    Facillit<span className="text-gray-500 font-normal">Hub</span>
                </span>
            </div>
            <button onClick={() => setIsMobileOpen(false)} className="lg:hidden ml-auto text-gray-500 hover:text-white"><X size={18} /></button>
        </div>

        {/* Links de Navegação */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-6 scrollbar-thin scrollbar-thumb-[#333] hover:scrollbar-thumb-[#444]">
            
            {isAdmin && (
                <div className="mb-4 px-2">
                    <Link 
                        href="/admin" 
                        className={`
                            flex items-center gap-3 p-2 rounded-md 
                            bg-red-500/10 text-red-400 border border-red-500/10 
                            hover:bg-red-500/15 hover:border-red-500/20 hover:text-red-300 transition-all 
                            ${isDesktopCollapsed ? 'justify-center px-0' : ''}
                        `}
                        title="Administração"
                    >
                        <ShieldCheck size={16} />
                        {!isDesktopCollapsed && <span className="text-xs font-semibold">Admin</span>}
                    </Link>
                </div>
            )}

            {navSections.map((section, idx) => {
                const validItems = section.items.filter(item => hasAccess(item.slug));
                if (validItems.length === 0) return null;

                return (
                    <div key={idx} className="space-y-0.5">
                        {!isDesktopCollapsed && (
                            <h4 className="px-3 mb-1.5 text-[10px] font-bold text-[#444] uppercase tracking-wider flex items-center gap-2">
                                {section.title}
                            </h4>
                        )}
                        
                        {validItems.map((link) => {
                            const isActive = pathname?.includes(link.href) && (link.href !== '/dashboard' || pathname === '/dashboard');
                            const Icon = link.icon;
                            
                            return (
                                <Link 
                                    key={link.href} 
                                    href={link.href}
                                    title={isDesktopCollapsed ? link.label : ''} 
                                    className={`
                                        group flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200
                                        ${isActive 
                                            ? 'bg-[#1a1a1a] text-white shadow-inner shadow-black/20' 
                                            : 'hover:bg-[#111] hover:text-gray-300'
                                        }
                                        ${isDesktopCollapsed ? 'justify-center px-0 h-9 w-9 mx-auto' : ''}
                                    `}
                                >
                                    <Icon 
                                        size={16} 
                                        className={`flex-shrink-0 transition-colors ${isActive ? 'text-[#07f49e]' : 'text-gray-500 group-hover:text-gray-300'}`} 
                                    />
                                    {!isDesktopCollapsed && (
                                        <span className={`text-[13px] font-medium ${isActive ? 'text-gray-100' : 'text-[#888] group-hover:text-gray-300'}`}>
                                            {link.label}
                                        </span>
                                    )}
                                    {/* Indicador Ativo (Ponto) */}
                                    {isActive && !isDesktopCollapsed && (
                                        <span className="ml-auto w-1 h-1 bg-[#07f49e] rounded-full shadow-[0_0_8px_rgba(7,244,158,0.5)]"></span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                )
            })}
        </div>
        
        {/* Footer */}
        <div className="p-2 border-t border-[#1a1a1a] bg-[#050505]">
            <button 
                onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)} 
                className={`flex items-center gap-3 p-2 rounded-md hover:bg-[#111] text-gray-500 hover:text-white transition-colors w-full group ${isDesktopCollapsed ? 'justify-center' : ''}`}
            >
                {isDesktopCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                {!isDesktopCollapsed && <span className="text-xs font-medium">Recolher</span>}
            </button>
        </div>
      </aside>
    </>
  );
}