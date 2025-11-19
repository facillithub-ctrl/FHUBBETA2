"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { UserProfile } from '@/app/dashboard/types';
import type { UserStats } from '@/app/dashboard/data-access'; // Importamos o tipo
import Link from 'next/link';
import Image from 'next/image';

type TopbarProps = {
  userProfile: UserProfile;
  toggleSidebar: () => void;
  stats?: UserStats; // Agora tipado corretamente
};

export default function Topbar({ 
  userProfile, 
  toggleSidebar, 
  stats = { unreadNotifications: 0, streak: 0, level: 1, points: 0 } 
}: TopbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isSearchFocused, setSearchFocused] = useState(false);

  // Efeito para detetar scroll e aplicar o fundo "vidro"
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determina o título e ícone com base no URL atual
  const getPageInfo = () => {
    if (pathname.includes('/write')) return { title: 'Redação Inteligente', icon: 'fa-pen-nib' };
    if (pathname.includes('/test')) return { title: 'Simulados & Testes', icon: 'fa-clipboard-check' };
    if (pathname.includes('/profile')) return { title: 'Meu Perfil', icon: 'fa-user-circle' };
    if (pathname.includes('/settings')) return { title: 'Configurações', icon: 'fa-cog' };
    if (pathname.includes('/edu')) return { title: 'Área Escolar', icon: 'fa-graduation-cap' };
    return { title: 'Dashboard', icon: 'fa-th-large' };
  };

  const pageInfo = getPageInfo();

  return (
    <header 
      className={`sticky top-0 z-30 transition-all duration-300 ease-in-out px-4 md:px-6 py-3
        ${scrolled 
          ? 'bg-white/80 dark:bg-[#1A1A1D]/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm' 
          : 'bg-transparent'
        }`}
    >
      <div className="flex items-center justify-between gap-4">
        
        {/* --- ESQUERDA: Menu + Título --- */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-xl text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>

          {/* Breadcrumbs & Título (Desktop) */}
          <div className="hidden md:flex flex-col">
             <div className="flex items-center text-xs text-text-secondary font-medium space-x-2">
                <span className="opacity-60">Facillit Hub</span>
                <i className="fas fa-chevron-right text-[8px] opacity-40"></i>
                <span className="text-brand-purple dark:text-brand-green">{pageInfo.title}</span>
             </div>
             <h1 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
                <i className={`fas ${pageInfo.icon} text-brand-purple text-sm`}></i>
                {pageInfo.title}
             </h1>
          </div>

          {/* Logo Texto (Mobile) */}
          <div className="md:hidden font-bold text-brand-purple text-lg">
             Facillit<span className="text-brand-green">.</span>
          </div>
        </div>

        {/* --- CENTRO: Barra de Busca --- */}
        <div className={`hidden md:flex flex-1 max-w-md transition-all duration-300 ${isSearchFocused ? 'scale-105' : 'scale-100'}`}>
           <div className="relative w-full group">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${isSearchFocused ? 'text-brand-purple' : 'text-gray-400'}`}>
                <i className="fas fa-search"></i>
              </div>
              <input
                type="text"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Pesquisar..."
                className="block w-full pl-10 pr-3 py-2.5 text-sm 
                         bg-bg-secondary dark:bg-black/20 
                         border-none ring-1 ring-transparent focus:ring-brand-purple/50
                         rounded-2xl text-text-primary dark:text-white 
                         placeholder-gray-400 transition-all shadow-inner"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-xs bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 text-gray-400 font-mono">⌘K</span>
              </div>
           </div>
        </div>

        {/* --- DIREITA: Stats & Perfil --- */}
        <div className="flex items-center gap-3 md:gap-5">
          
          {/* Streak Widget */}
          <div className="hidden md:flex items-center gap-2 bg-orange-50 dark:bg-orange-900/10 px-3 py-1.5 rounded-full border border-orange-100 dark:border-orange-800/30">
             <i className="fas fa-fire text-orange-500 animate-pulse"></i>
             <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{stats.streak} dias</span>
          </div>

          {/* Notificações */}
          <button className="relative p-2.5 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:text-brand-purple transition-all group">
             <i className="fas fa-bell text-text-secondary group-hover:text-brand-purple"></i>
             {stats.unreadNotifications > 0 && (
               <span className="absolute top-0 right-0 flex h-3 w-3">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
               </span>
             )}
          </button>

          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden md:block"></div>

          {/* Dropdown Perfil */}
          <Link href="/dashboard/profile" className="flex items-center gap-3 pl-1 hover:opacity-80 transition-opacity">
             <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-text-primary dark:text-white leading-none truncate max-w-[120px]">
                    {userProfile.nickname || userProfile.fullName?.split(' ')[0]}
                </p>
                <p className="text-[10px] text-text-secondary font-medium mt-1 uppercase tracking-wide">
                    {userProfile.userCategory || 'Estudante'}
                </p>
             </div>
             <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-full p-0.5 bg-gradient-to-br from-brand-purple to-brand-green shadow-md">
               <div className="relative w-full h-full rounded-full overflow-hidden bg-white dark:bg-black">
                 {userProfile.avatarUrl ? (
                    <Image 
                        src={userProfile.avatarUrl} 
                        alt="Avatar" 
                        fill
                        className="object-cover"
                    />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand-purple text-white font-bold">
                        {userProfile.fullName?.[0] || 'U'}
                    </div>
                 )}
               </div>
               {/* Bolinha de Status Online */}
               <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-black rounded-full"></div>
             </div>
          </Link>

        </div>
      </div>
    </header>
  );
}