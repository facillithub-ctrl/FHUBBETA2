"use client";

import Link from 'next/link';
import Image from 'next/image';
import createClient from '@/utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import type { UserProfile } from '@/app/dashboard/types';
import { 
    LayoutDashboard, PenTool, FileText, GraduationCap, BookOpen, 
    Gamepad2, Calendar, PlayCircle, Users, Target, FlaskConical, 
    CheckSquare, Lightbulb, ChevronLeft, ChevronRight,
    ShieldCheck, X, Sparkles, Home, Book, Grid, Info, Box
} from 'lucide-react';

// Configuração de Navegação com Badges e Seções
const navSections = [
    {
        title: "Página Inicial",
        icon: Home, // Ícone da seção se estiver colapsado
        items: [
            { href: '/dashboard', slug: 'dashboard', icon: LayoutDashboard, label: 'Visão Geral' },
            { href: '/dashboard/applications/day', slug: 'day', icon: Calendar, label: 'Minha Agenda' },
        ]
    },
    {
        title: "Módulos de Estudo",
        icon: Book,
        items: [
            { href: '/dashboard/applications/write', slug: 'write', icon: PenTool, label: 'Write', },
            { href: '/dashboard/applications/test', slug: 'test', icon: FileText, label: 'Test' },
            { href: '/dashboard/applications/edu', slug: 'edu', icon: GraduationCap, label: 'Edu' },
            { href: '/dashboard/applications/library', slug: 'library', icon: BookOpen, label: 'Library', badge: 'Novo' },
        ]
    },
    {
        title: "Apps & Comunidade",
        icon: Grid,
        items: [
            { href: '/dashboard/applications/games', slug: 'games', icon: Gamepad2, label: 'Games' },
            { href: '/dashboard/applications/connect', slug: 'connect', icon: Users, label: 'Connect' },
            { href: '/dashboard/applications/task', slug: 'task', icon: CheckSquare, label: 'Tarefas' },
            { href: '/dashboard/applications/create', slug: 'create', icon: Lightbulb, label: 'Create', badge: 'Beta' },
        ]
    },
    {
        title: "Informações",
        icon: Info,
        items: [
            { href: '/recursos/blog', slug: 'blog', icon: Sparkles, label: 'Blog & Dicas' },
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

  const isAdmin = userProfile.userCategory === 'administrator';

  const hasAccess = (slug: string) => {
      if (slug === 'blog') return true;
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
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
      />

      <aside 
        className={`
            fixed lg:relative top-0 left-0 h-full z-50 flex flex-col
            bg-white border-r border-gray-100 shadow-[2px_0_20px_rgba(0,0,0,0.02)]
            transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
            ${isMobileOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full w-[260px]'} 
            lg:translate-x-0 ${isDesktopCollapsed ? 'lg:w-[72px]' : 'lg:w-[260px]'}
        `}
      >
        {/* Header da Sidebar */}
        <div className={`h-20 flex items-center px-6 mb-2 ${isDesktopCollapsed ? 'justify-center px-0' : ''}`}>
            <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 flex items-center justify-center">
                   <Image src="/assets/images/LOGO/isologo/preto.png" alt="Logo" width={36} height={36} className="object-contain" />
                </div>
                <div className={`flex flex-col transition-opacity duration-200 ${isDesktopCollapsed ? 'hidden opacity-0' : 'block opacity-100'}`}>
                    <span className="font-bold text-gray-900 text-lg leading-none tracking-tight">Facillit<span className="text-black">Hub</span></span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">Workspace</span>
                </div>
            </div>
            <button onClick={() => setIsMobileOpen(false)} className="lg:hidden ml-auto text-gray-400 hover:text-gray-900 bg-gray-50 p-1.5 rounded-lg"><X size={18} /></button>
        </div>

        {/* Links de Navegação */}
        <div className="flex-1 overflow-y-auto px-4 space-y-8 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
            
            {isAdmin && (
                <div className="mb-2">
                    <Link 
                        href="/admin" 
                        className={`
                            flex items-center gap-3 p-2.5 rounded-xl
                            bg-gradient-to-r from-red-50 to-white border border-red-100 text-red-600
                            hover:shadow-md hover:shadow-red-100/50 hover:border-red-200 transition-all group
                            ${isDesktopCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : ''}
                        `}
                        title="Administração"
                    >
                        <ShieldCheck size={18} className="group-hover:scale-110 transition-transform" />
                        {!isDesktopCollapsed && <span className="text-sm font-bold">Painel Admin</span>}
                    </Link>
                </div>
            )}

            {navSections.map((section, idx) => {
                const validItems = section.items.filter(item => hasAccess(item.slug));
                if (validItems.length === 0) return null;

                return (
                    <div key={idx} className="space-y-2">
                        {!isDesktopCollapsed && (
                            <h4 className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                                {section.title}
                            </h4>
                        )}
                        {isDesktopCollapsed && (
                             <div className="w-8 h-[1px] bg-gray-100 mx-auto my-4"></div>
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
                                        relative group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-300 ease-out
                                        ${isActive 
                                            ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20' 
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                        }
                                        ${isDesktopCollapsed ? 'justify-center px-0 h-11 w-11 mx-auto' : ''}
                                    `}
                                >
                                    <Icon 
                                        size={isDesktopCollapsed ? 20 : 18} 
                                        strokeWidth={2}
                                        className={`flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-brand-purple'}`} 
                                    />
                                    
                                    {!isDesktopCollapsed && (
                                        <span className={`text-[13px] font-semibold tracking-wide ${isActive ? 'text-white' : ''}`}>
                                            {link.label}
                                        </span>
                                    )}

                                    {/* Badges (Novo, Beta, etc) */}
                                    {!isDesktopCollapsed && link.badge && !isActive && (
                                        <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                            link.badge === 'Novo' ? 'bg-green-50 text-green-600 border-green-100' : 
                                            link.badge === 'Beta' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {link.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                )
            })}
        </div>
        
        {/* Footer (Collapse) */}
        <div className="p-4 border-t border-gray-100 bg-white">
            <button 
                onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)} 
                className={`
                    flex items-center gap-3 p-2.5 rounded-xl w-full
                    text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-all
                    ${isDesktopCollapsed ? 'justify-center' : ''}
                `}
            >
                {isDesktopCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                {!isDesktopCollapsed && <span className="text-xs font-semibold">Recolher Menu</span>}
            </button>
        </div>
      </aside>
    </>
  );
}