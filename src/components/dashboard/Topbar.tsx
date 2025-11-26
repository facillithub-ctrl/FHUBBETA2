"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { UserProfile } from '@/app/dashboard/types';
import createClient from '@/utils/supabase/client';
import { Bell, Search, Menu, ChevronRight, Command, LogOut, User, Settings, Grid } from 'lucide-react';

type TopbarProps = {
  userProfile: UserProfile;
  toggleSidebar: () => void;
};

// Breadcrumbs Inteligentes
const Breadcrumbs = () => {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(Boolean);

  // Mapa para nomes amigáveis
  const pathMap: Record<string, string> = {
    dashboard: 'Hub',
    applications: 'Apps',
    write: 'Redação',
    edu: 'Educação',
    settings: 'Configurações',
    account: 'Minha Conta',
  };

  return (
    <div className="hidden md:flex items-center gap-2 text-sm select-none">
      <span className="font-medium text-gray-400 transition-colors hover:text-gray-600">Facillit</span>
      {paths.map((path, index) => (
        <div key={index} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
          <ChevronRight size={14} className="text-gray-300" />
          <span className={`
            capitalize font-medium transition-colors cursor-pointer
            ${index === paths.length - 1 
                ? 'text-[#42047e] bg-[#42047e]/5 px-2 py-0.5 rounded-lg' 
                : 'text-gray-500 hover:text-gray-900'
            }
          `}>
            {pathMap[path] || path.replace('-', ' ')}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function Topbar({ userProfile, toggleSidebar }: TopbarProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();

  // Fecha dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setShowProfileMenu(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-[80px] px-6 sm:px-8 bg-white/80 backdrop-blur-xl border-b border-gray-100/80 transition-all duration-500">
      
      {/* Esquerda: Menu Mobile & Breadcrumbs */}
      <div className="flex items-center gap-5">
        <button 
          onClick={toggleSidebar} 
          className="lg:hidden p-2.5 text-gray-500 hover:text-[#42047e] hover:bg-[#42047e]/5 rounded-xl transition-all active:scale-95"
        >
          <Menu size={24} strokeWidth={2.5} />
        </button>
        
        <Breadcrumbs />
      </div>

      {/* Direita: Ferramentas e Perfil */}
      <div className="flex items-center gap-3 sm:gap-5">
        
        {/* Barra de Pesquisa Global */}
        <div className={`
            hidden md:flex items-center relative transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
            ${isSearchFocused ? 'w-[340px]' : 'w-[240px]'}
        `}>
          <Search 
            size={18} 
            className={`absolute left-4 transition-colors duration-300 ${isSearchFocused ? 'text-[#42047e]' : 'text-gray-400'}`} 
          />
          
          <input 
            type="text" 
            placeholder="Pesquisar (⌘K)" 
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={`
              w-full h-[46px] pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 
              bg-gray-50/50 border border-transparent rounded-2xl outline-none
              transition-all duration-300
              ${isSearchFocused ? 'bg-white border-[#42047e]/20 shadow-[0_4px_20px_rgba(66,4,126,0.08)]' : 'hover:bg-gray-50 hover:border-gray-200'}
            `}
          />
          
          {/* Atalho Visual */}
          <div className={`absolute right-3 pointer-events-none transition-opacity duration-300 ${isSearchFocused ? 'opacity-0' : 'opacity-100'}`}>
            <kbd className="hidden lg:flex items-center h-6 px-2 text-[10px] font-bold text-gray-400 bg-white border border-gray-200 rounded-lg shadow-sm">
                <Command size={10} className="mr-1" /> K
            </kbd>
          </div>
        </div>

        {/* Divisor Vertical */}
        <div className="hidden sm:block w-px h-8 bg-gray-200/60 mx-1"></div>

        {/* Ações Rápidas */}
        <div className="flex items-center gap-2">
            
            {/* Grid de Apps */}
            <button className="p-2.5 text-gray-400 hover:text-[#42047e] hover:bg-gray-50 rounded-xl transition-all" title="Módulos">
                <Grid size={20} />
            </button>

            {/* Notificações */}
            <div className="relative" ref={notifRef}>
                <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`
                        relative p-2.5 rounded-xl transition-all duration-200
                        ${showNotifications ? 'bg-[#42047e]/10 text-[#42047e]' : 'text-gray-400 hover:text-[#42047e] hover:bg-gray-50'}
                    `}
                >
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                </button>

                {/* Dropdown de Notificações */}
                {showNotifications && (
                    <div className="absolute top-full right-0 mt-4 w-[380px] bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right z-50">
                        <div className="flex items-center justify-between p-4 border-b border-gray-50 bg-gray-50/50 backdrop-blur-sm">
                            <h4 className="font-bold text-gray-800 text-sm">Notificações</h4>
                            <button className="text-xs font-semibold text-[#42047e] hover:underline">Marcar todas como lidas</button>
                        </div>
                        <div className="p-12 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-gradient-to-tr from-[#42047e]/10 to-[#07f49e]/10 rounded-full flex items-center justify-center mb-4">
                                <Bell size={24} className="text-[#42047e]" />
                            </div>
                            <p className="text-sm text-gray-600 font-medium">Tudo tranquilo por aqui!</p>
                            <p className="text-xs text-gray-400 mt-1 max-w-[200px]">Você não tem novas notificações pendentes no momento.</p>
                        </div>
                        <div className="p-3 border-t border-gray-50 bg-gray-50/30 text-center">
                            <Link href="/dashboard/notifications" className="text-xs font-medium text-gray-500 hover:text-[#42047e] transition-colors">
                                Ver histórico completo
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Menu de Perfil */}
        <div className="relative pl-1" ref={profileRef}>
            <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 group pl-2 pr-1 py-1 rounded-full border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all duration-300"
            >
                {/* Texto do Perfil (Desktop) */}
                <div className="hidden lg:flex flex-col items-end mr-1">
                    <span className="text-sm font-bold text-gray-700 group-hover:text-[#42047e] transition-colors leading-none">
                        {userProfile.fullName?.split(' ')[0]}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mt-0.5">
                        {userProfile.userCategory || 'Usuário'}
                    </span>
                </div>
                
                {/* Avatar */}
                <div className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-br from-[#42047e] to-[#07f49e] shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all">
                    <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
                        {userProfile.avatarUrl ? (
                            <Image src={userProfile.avatarUrl} alt="Profile" fill className="rounded-full object-cover" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#42047e] to-[#07f49e] flex items-center justify-center text-white font-bold text-xs">
                                {userProfile.fullName?.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>
            </button>

            {/* Dropdown do Perfil */}
            {showProfileMenu && (
                <div className="absolute top-full right-0 mt-4 w-64 bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100 p-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                    <div className="px-3 py-3 mb-2 flex items-center gap-3 bg-gray-50 rounded-xl border border-gray-50">
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#42047e] font-bold shadow-sm">
                            {userProfile.fullName?.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-gray-900 truncate">{userProfile.fullName}</p>
                            <p className="text-xs text-gray-500 truncate">{userProfile.email}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <Link href="/dashboard/account" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#42047e] rounded-xl transition-colors">
                            <User size={18} className="text-gray-400" /> Minha Conta
                        </Link>
                        <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#42047e] rounded-xl transition-colors">
                            <Settings size={18} className="text-gray-400" /> Configurações
                        </Link>
                    </div>
                    
                    <div className="h-px bg-gray-100 my-2" />
                    
                    <button 
                        onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} 
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <LogOut size={18} /> Sair
                    </button>
                </div>
            )}
        </div>

      </div>
    </header>
  );
}