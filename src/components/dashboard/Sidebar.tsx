"use client";

import Link from 'next/link';
import Image from 'next/image';
import createClient from '@/utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import type { UserProfile } from '@/app/dashboard/types';

// Lista de links
const allNavLinks = [
  { href: '/dashboard', slug: 'dashboard', icon: 'fa-home', label: 'Dashboard' },
  { href: '/dashboard/applications/write', slug: 'write', icon: 'fa-pencil-alt', label: 'Facillit Write' },
  { href: '/dashboard/applications/test', slug: 'test', icon: 'fa-file-alt', label: 'Facillit Test' },
  { href: '/dashboard/applications/edu', slug: 'edu', icon: 'fa-graduation-cap', label: 'Facillit Edu' },
  { href: '/dashboard/applications/games', slug: 'games', icon: 'fa-gamepad', label: 'Facillit Games' },
  { href: '/dashboard/applications/day', slug: 'day', icon: 'fa-calendar-check', label: 'Facillit Day' },
  // ... (pode adicionar todos os outros módulos aqui se desejar)
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
  const pathname = usePathname(); 
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const activeNavLinks = allNavLinks.filter(link => {
    if (userProfile.userCategory === 'administrator') {
        return ['dashboard', 'admin'].includes(link.slug);
    }
    if (userProfile.userCategory === 'diretor') {
        return ['dashboard', 'edu'].includes(link.slug);
    }
    // Mostra 'dashboard' e módulos ativos para 'individual' e outros
    if (link.slug === 'dashboard') return true;
    return userProfile.active_modules?.includes(link.slug);
  });

  return (
    <>
      <div
        onClick={() => setIsMobileOpen(false)}
        className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity ${
            isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* 1. FUNDO SÓLIDO (brand-purple) e layout flutuante */}
      <aside 
        className={`fixed lg:relative top-0 left-0 h-full text-white flex flex-col z-40 transition-all duration-300
          bg-brand-purple
          md:h-[calc(100vh-2rem)] md:my-4 md:ml-4 md:rounded-2xl
          ${isMobileOpen ? 'translate-x-0 w-64 shadow-xl' : '-translate-x-full w-64'}
          lg:translate-x-0 ${isDesktopCollapsed ? 'lg:w-24' : 'lg:w-64'}`}
      >
        {/* 2. CABEÇALHO COM LOGO */}
        <div className={`flex items-center p-4 mb-6 h-16 ${isDesktopCollapsed ? 'lg:justify-center' : 'lg:justify-between'}`}>
            <Link href="/dashboard" className={`flex items-center gap-3 ${isDesktopCollapsed ? 'lg:justify-center lg:w-full' : ''}`}>
                <Image src="/assets/images/LOGO/png/logoazul.svg" alt="Facillit Hub Logo" width={32} height={32} className="brightness-0 invert flex-shrink-0" />
                <span className={`font-bold text-xl whitespace-nowrap transition-opacity ${isDesktopCollapsed ? 'lg:opacity-0 lg:hidden' : ''}`}>Facillit</span>
            </Link>
            <button onClick={() => setIsMobileOpen(false)} className="lg:hidden text-2xl text-white/80 hover:text-white">
                <i className="fas fa-times"></i>
            </button>
        </div>
        
        {/* 3. NAVEGAÇÃO (com novo estilo de link ativo) */}
        <nav className="flex-1 px-3 space-y-2 overflow-y-auto">
            {activeNavLinks.map((link) => {
              const isActive = (link.href === '/dashboard' && pathname === link.href) || 
                               (link.href !== '/dashboard' && pathname.startsWith(link.href));

              return (
                <Link 
                  key={link.href}
                  href={link.href} 
                  title={link.label} 
                  className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 relative
                    ${isDesktopCollapsed ? 'lg:justify-center' : ''}
                    ${isActive 
                      ? 'font-bold text-white bg-gradient-to-r from-brand-purple to-brand-green shadow-lg' // 4. ESTILO ATIVO (Gradiente)
                      : 'text-white/70 hover:bg-white/10 hover:text-white' // Estilo Inativo
                    }
                  `}
                >
                  <i className={`fas ${link.icon} w-6 text-center text-lg`}></i>
                  <span className={isDesktopCollapsed ? 'lg:hidden' : ''}>{link.label}</span>
                </Link>
              );
            })}
        </nav>
        
        {/* 5. RODAPÉ (com novas funções "Gerenciar Conta") */}
        <div className="pt-4 p-3 border-t border-white/10">
            <Link 
                href="/dashboard/account"
                title="Gerenciar Conta" 
                className={`flex items-center gap-4 p-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors w-full text-left
                          ${pathname.startsWith('/dashboard/account') ? 'bg-white/10' : ''}
                          ${isDesktopCollapsed ? 'lg:justify-center' : ''}`}
            >
                <i className="fas fa-user-cog w-6 text-center"></i>
                <span className={isDesktopCollapsed ? 'hidden' : ''}>Gerenciar Conta</span>
            </Link>
            <Link 
                href="/recursos/ajuda"
                title="Ajuda" 
                className={`flex items-center gap-4 p-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors w-full text-left ${isDesktopCollapsed ? 'lg:justify-center' : ''}`}
            >
                <i className="fas fa-question-circle w-6 text-center"></i>
                <span className={isDesktopCollapsed ? 'hidden' : ''}>Ajuda</span>
            </Link>
            <button onClick={handleLogout} title="Sair" className={`flex items-center gap-4 p-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors w-full text-left mt-2 ${isDesktopCollapsed ? 'lg:justify-center' : ''}`}>
                <i className="fas fa-sign-out-alt w-6 text-center"></i>
                <span className={isDesktopCollapsed ? 'hidden' : ''}>Sair</span>
            </button>
        </div>
      </aside>
    </>
  );
}