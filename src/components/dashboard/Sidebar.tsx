"use client";

import Link from 'next/link';
import Image from 'next/image';
import createClient from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/app/dashboard/types';

const allNavLinks = [
  { href: '/dashboard', slug: 'dashboard', icon: 'fa-home', label: 'Dashboard' },
  { href: '/dashboard/applications/edu', slug: 'edu', icon: 'fa-graduation-cap', label: 'Facillit Edu' },
  { href: '/dashboard/applications/games', slug: 'games', icon: 'fa-gamepad', label: 'Facillit Games' },
  { href: '/dashboard/applications/write', slug: 'write', icon: 'fa-pencil-alt', label: 'Facillit Write' },
  { href: '/dashboard/applications/day', slug: 'day', icon: 'fa-calendar-check', label: 'Facillit Day' },
  { href: '/dashboard/applications/play', slug: 'play', icon: 'fa-play-circle', label: 'Facillit Play' },
  { href: '/dashboard/applications/library', slug: 'library', icon: 'fa-book-open', label: 'Facillit Library' },
  { href: '/dashboard/applications/connect', slug: 'connect', icon: 'fa-users', label: 'Facillit Connect' },
  { href: '/dashboard/applications/coach-career', slug: 'coach-career', icon: 'fa-bullseye', label: 'Facillit Coach' },
  { href: '/dashboard/applications/lab', slug: 'lab', icon: 'fa-flask', label: 'Facillit Lab' },
  { href: '/dashboard/applications/test', slug: 'test', icon: 'fa-file-alt', label: 'Facillit Test' },
  { href: '/dashboard/applications/task', slug: 'task', icon: 'fa-tasks', label: 'Facillit Task' },
  { href: '/dashboard/applications/create', slug: 'create', icon: 'fa-lightbulb', label: 'Facillit Create' },
  { href: '/admin', slug: 'admin', icon: 'fa-user-shield', label: 'Painel Admin' },
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
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const activeNavLinks = allNavLinks.filter(link => {
    if (userProfile.userCategory === 'administrator') return ['dashboard', 'admin'].includes(link.slug);
    if (userProfile.userCategory === 'diretor') return ['dashboard', 'edu'].includes(link.slug);
    if (link.slug === 'dashboard') return true;
    return userProfile.active_modules?.includes(link.slug);
  });

  // Classes dinâmicas para controlar a largura e a transição
  const sidebarWidthClass = isDesktopCollapsed ? 'lg:w-20' : 'lg:w-64';
  const textVisibilityClass = isDesktopCollapsed ? 'hidden' : 'block';
  const itemJustifyClass = isDesktopCollapsed ? 'lg:justify-center' : '';

  return (
    <>
      {/* Mobile Overlay */}
      <div
        onClick={() => setIsMobileOpen(false)}
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
            isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside 
        className={`fixed lg:relative top-0 left-0 h-full text-white flex flex-col z-50 transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
          ${sidebarWidthClass}
          overflow-x-hidden
        `}
        style={{ background: 'linear-gradient(180deg, #2E14ED 0%, #190894 100%)' }}
      >
        <div className={`flex items-center mb-8 h-16 px-4 ${isDesktopCollapsed ? 'lg:justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-8 h-8 flex-shrink-0">
                    <Image src="/assets/images/LOGO/png/logoazul.svg" alt="Logo" fill className="object-contain brightness-0 invert" />
                </div>
                <span className={`font-bold text-xl whitespace-nowrap transition-opacity duration-200 ${isDesktopCollapsed ? 'lg:opacity-0 lg:w-0 lg:hidden' : 'opacity-100'}`}>
                    Facillit
                </span>
            </div>
            <button onClick={() => setIsMobileOpen(false)} className="lg:hidden text-2xl text-white/80 hover:text-white">
                <i className="fas fa-times"></i>
            </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-3">
          <ul className="space-y-1">
            {activeNavLinks.map((link) => (
              <li key={link.href}>
                <Link 
                    href={link.href} 
                    title={isDesktopCollapsed ? link.label : ''}
                    className={`flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors ${itemJustifyClass}`}
                >
                  <i className={`fas ${link.icon} w-6 text-center text-lg flex-shrink-0`}></i>
                  <span className={`whitespace-nowrap text-sm font-medium transition-all duration-200 ${textVisibilityClass}`}>
                      {link.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-white/10 space-y-2">
            {/* Botão de Recolher (Apenas Desktop) */}
            <button 
                onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)} 
                title={isDesktopCollapsed ? 'Expandir' : 'Recolher'} 
                className={`hidden lg:flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors w-full text-left ${itemJustifyClass}`}
            >
                <i className={`fas ${isDesktopCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} w-6 text-center text-lg flex-shrink-0`}></i>
                <span className={`whitespace-nowrap text-sm font-medium ${textVisibilityClass}`}>Recolher</span>
            </button>

            <button 
                onClick={handleLogout} 
                title="Sair" 
                className={`flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors w-full text-left text-red-300 hover:text-red-100 ${itemJustifyClass}`}
            >
                <i className="fas fa-sign-out-alt w-6 text-center text-lg flex-shrink-0"></i>
                <span className={`whitespace-nowrap text-sm font-medium ${textVisibilityClass}`}>Sair</span>
            </button>
        </div>
      </aside>
    </>
  );
}