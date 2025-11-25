"use client";

import Link from 'next/link';
import Image from 'next/image';
import createClient from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
// CORREÇÃO 1: Importar UserStats
import type { UserProfile, UserStats } from '@/app/dashboard/types';

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
  stats: UserStats; // CORREÇÃO 2: Adicionar stats à tipagem
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
  isDesktopCollapsed: boolean;
  setIsDesktopCollapsed: (isCollapsed: boolean) => void;
};

// CORREÇÃO 3: Receber stats nas props
export default function Sidebar({ userProfile, stats, isMobileOpen, setIsMobileOpen, isDesktopCollapsed, setIsDesktopCollapsed }: SidebarProps) {
  const router = useRouter();
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

      <aside 
        className={`fixed lg:relative top-0 left-0 h-full text-white p-4 flex flex-col z-40 transition-all duration-300
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
          lg:translate-x-0 ${isDesktopCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
        style={{ background: 'linear-gradient(180deg, #2E14ED, #190894, #5E55F9)' }}
      >
        <div className="flex items-center justify-between mb-8 h-8">
            <div className={`flex items-center gap-3 ${isDesktopCollapsed ? 'lg:justify-center lg:w-full' : ''}`}>
                <Image src="/assets/images/LOGO/png/logoazul.svg" alt="Facillit Hub Logo" width={32} height={32} className="brightness-0 invert flex-shrink-0" />
                <span className={`font-bold text-xl whitespace-nowrap transition-opacity ${isDesktopCollapsed ? 'lg:opacity-0 lg:hidden' : ''}`}>Facillit</span>
            </div>
            <button onClick={() => setIsMobileOpen(false)} className="lg:hidden text-2xl text-white/80 hover:text-white">
                <i className="fas fa-times"></i>
            </button>
        </div>
        
        {/* Se quiser exibir stats no futuro, você pode usar a variável 'stats' aqui. Ex: stats.streak */}

        <nav className="flex-1">
          <ul>
            {activeNavLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} title={link.label} className={`flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-colors ${isDesktopCollapsed ? 'lg:justify-center' : ''}`}>
                  <i className={`fas ${link.icon} w-6 text-center text-lg`}></i>
                  <span className={isDesktopCollapsed ? 'lg:hidden' : ''}>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="pt-4 border-t border-white/10">
            <button 
                onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)} 
                title={isDesktopCollapsed ? 'Expandir' : 'Recolher'} 
                className={`hidden lg:flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-colors w-full text-left ${isDesktopCollapsed ? 'lg:justify-center' : ''}`}
            >
                <i className={`fas ${isDesktopCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} w-6 text-center`}></i>
                <span className={isDesktopCollapsed ? 'hidden' : ''}>Recolher</span>
            </button>
            <button onClick={handleLogout} title="Sair" className={`flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-colors w-full text-left mt-2 ${isDesktopCollapsed ? 'lg:justify-center' : ''}`}>
                <i className="fas fa-sign-out-alt w-6 text-center"></i>
                <span className={isDesktopCollapsed ? 'hidden' : ''}>Sair</span>
            </button>
        </div>
      </aside>
    </>
  );
}