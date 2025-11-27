"use client";

import Link from 'next/link';
import Image from 'next/image';
import createClient from '@/utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import type { UserProfile } from '@/app/dashboard/types';
import { 
    LayoutDashboard, PenTool, FileText, GraduationCap, BookOpen, 
    Gamepad2, Calendar, PlayCircle, Users, Target, FlaskConical, 
    CheckSquare, Lightbulb, ChevronLeft, ChevronRight, LogOut, ShieldCheck, X
} from 'lucide-react';

const allNavLinks = [
  { href: '/dashboard', slug: 'dashboard', icon: LayoutDashboard, label: 'Visão Geral' },
  { href: '/dashboard/applications/write', slug: 'write', icon: PenTool, label: 'Redação' },
  { href: '/dashboard/applications/test', slug: 'test', icon: FileText, label: 'Simulados' },
  { href: '/dashboard/applications/edu', slug: 'edu', icon: GraduationCap, label: 'Turmas' },
  { href: '/dashboard/applications/library', slug: 'library', icon: BookOpen, label: 'Biblioteca' },
  { href: '/dashboard/applications/games', slug: 'games', icon: Gamepad2, label: 'Games' },
  { href: '/dashboard/applications/day', slug: 'day', icon: Calendar, label: 'Agenda' },
  { href: '/dashboard/applications/play', slug: 'play', icon: PlayCircle, label: 'Play' },
  { href: '/dashboard/applications/connect', slug: 'connect', icon: Users, label: 'Comunidade' },
  { href: '/dashboard/applications/coach-career', slug: 'coach-career', icon: Target, label: 'Carreira' },
  { href: '/dashboard/applications/lab', slug: 'lab', icon: FlaskConical, label: 'Laboratório' },
  { href: '/dashboard/applications/task', slug: 'task', icon: CheckSquare, label: 'Tarefas' },
  { href: '/dashboard/applications/create', slug: 'create', icon: Lightbulb, label: 'Criação' },
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

  const activeNavLinks = allNavLinks.filter(link => {
    if (isAdmin) return true;
    if (userProfile.userCategory === 'diretor') return ['dashboard', 'edu', 'test', 'write'].includes(link.slug);
    if (link.slug === 'dashboard') return true;
    return userProfile.active_modules?.includes(link.slug);
  });

  return (
    <>
      <div onClick={() => setIsMobileOpen(false)} className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-500 ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />

      <aside 
        className={`fixed lg:relative top-0 left-0 h-full z-50 flex flex-col bg-[#050507] text-white border-r border-white/5 shadow-2xl transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isMobileOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full w-[280px]'} lg:translate-x-0 ${isDesktopCollapsed ? 'lg:w-[90px]' : 'lg:w-[280px]'}`}
      >
        {/* Header */}
        <div className="h-24 flex items-center px-6 relative">
            <div className={`flex items-center gap-3 transition-all duration-300 ${isDesktopCollapsed ? 'justify-center w-full' : ''}`}>
                <div className="relative w-10 h-10 flex-shrink-0 bg-gradient-to-tr from-[#42047e] to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-[#42047e]/20">
                   <Image src="/assets/images/LOGO/png/logoazul.svg" alt="FHub" width={24} height={24} className="brightness-0 invert object-contain" />
                </div>
                <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isDesktopCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                    <span className="font-bold text-xl tracking-tight text-white leading-none">Facillit</span>
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] mt-1">Workspace</span>
                </div>
            </div>
            <button onClick={() => setIsMobileOpen(false)} className="lg:hidden absolute right-4 text-white/50 hover:text-white p-2"><X size={20} /></button>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto px-4 space-y-2 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
            {isAdmin && (
                 <Link href="/admin" className={`relative group flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20 text-red-200 hover:text-white hover:border-red-500/40 ${isDesktopCollapsed ? 'justify-center px-0' : ''}`}>
                    <ShieldCheck size={22} className="flex-shrink-0 text-red-500 group-hover:scale-110 transition-transform" />
                    <span className={`font-semibold text-sm whitespace-nowrap transition-all duration-300 ${isDesktopCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>Admin Console</span>
                </Link>
            )}
            {activeNavLinks.map((link) => {
              const isActive = pathname?.includes(link.href) && (link.href !== '/dashboard' || pathname === '/dashboard');
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href} title={isDesktopCollapsed ? link.label : ''} className={`relative group flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'} ${isDesktopCollapsed ? 'justify-center' : ''}`}>
                  {isActive && <div className="absolute inset-0 bg-gradient-to-r from-[#42047e] to-blue-600 rounded-2xl opacity-100 shadow-lg shadow-[#42047e]/25 animate-in fade-in zoom-in-95 duration-300"></div>}
                  <Icon size={22} className={`relative z-10 flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-105' : 'group-hover:scale-110'}`} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`relative z-10 text-sm font-medium whitespace-nowrap transition-all duration-300 ${isDesktopCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>{link.label}</span>
                </Link>
              );
            })}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-[#0a0a0c] border-t border-white/5 space-y-2">
            <button onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)} className={`hidden lg:flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors w-full group ${isDesktopCollapsed ? 'justify-center' : ''}`}>
                {isDesktopCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${isDesktopCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>Recolher</span>
            </button>
            <button onClick={handleLogout} className={`flex items-center gap-4 p-3 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors w-full group ${isDesktopCollapsed ? 'justify-center' : ''}`}>
                <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${isDesktopCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>Sair</span>
            </button>
        </div>
      </aside>
    </>
  );
}