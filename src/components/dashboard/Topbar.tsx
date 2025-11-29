"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/hooks/useNotifications';
import { UserProfile } from '@/app/dashboard/types';
import { VerificationBadge } from '@/components/VerificationBadge'; 

interface TopbarProps {
  onToggleSidebar: () => void;
  userProfile: UserProfile;
}

export default function Topbar({ onToggleSidebar, userProfile }: TopbarProps) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  
  // Refs para click outside
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Tratamento de dados do usuário
  const displayName = userProfile?.fullName || 'Usuário';
  const displayInitial = displayName[0]?.toUpperCase() || 'U';
  const userNickname = userProfile?.nickname || 'user';
  // CORREÇÃO: Usa userCategory vindo do DB, em vez de hardcoded ou metadata antigo
  const displayRole = userProfile?.userCategory || 'Estudante'; 

  // Fecha dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 60) return `${diff} min atrás`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-30">
      
      {/* ESQUERDA: Toggle Sidebar + BUSCADOR */}
      <div className="flex items-center gap-4 flex-1">
        <button onClick={onToggleSidebar} className="lg:hidden text-gray-500 hover:text-brand-purple">
          <i className="fas fa-bars text-xl"></i>
        </button>

        {/* Buscador Adicionado */}
        <div className="hidden md:flex items-center bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-700 w-full max-w-md focus-within:ring-2 focus-within:ring-brand-purple/20 transition-all">
            <i className="fas fa-search text-gray-400 mr-3"></i>
            <input 
                type="text" 
                placeholder="Pesquisar por aulas, materiais ou ferramentas..." 
                className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-200 w-full placeholder-gray-400"
            />
        </div>
      </div>

      {/* DIREITA: Notificações + Perfil */}
      <div className="flex items-center gap-4 md:gap-6">
        
        {/* --- NOTIFICAÇÕES --- */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-gray-400 hover:text-brand-purple transition-colors rounded-full hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <i className="fas fa-bell text-xl"></i>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse"></span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden flex flex-col max-h-[500px] animate-fade-in-up">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
                  <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm">Notificações</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-brand-purple hover:underline font-medium">
                      Marcar todas como lidas
                    </button>
                  )}
                </div>

                <div className="overflow-y-auto flex-1 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      <i className="far fa-bell-slash text-3xl mb-2 opacity-30"></i>
                      <p className="text-sm">Tudo tranquilo por aqui.</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                        className={`p-4 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group relative ${!notif.is_read ? 'bg-purple-50/30 dark:bg-purple-900/10' : ''}`}
                      >
                        {!notif.is_read && <div className="absolute left-2 top-6 w-1.5 h-1.5 bg-brand-purple rounded-full"></div>}
                        <Link href={notif.link || '#'} className="block pl-2">
                           <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-sm ${!notif.is_read ? 'font-bold text-gray-800 dark:text-white' : 'font-medium text-gray-600 dark:text-gray-300'}`}>
                                {notif.title}
                              </h4>
                              <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{formatDate(notif.created_at)}</span>
                           </div>
                           <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                             {notif.message}
                           </p>
                        </Link>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="p-2 text-center border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <Link href="/dashboard/notifications" className="text-xs font-bold text-gray-500 hover:text-brand-purple">
                        Ver histórico completo
                    </Link>
                </div>
            </div>
          )}
        </div>

        {/* --- PERFIL DO USUÁRIO --- */}
        <div className="relative pl-6 border-l border-gray-100 dark:border-gray-800" ref={userMenuRef}>
            <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
            >
                <div className="text-right hidden md:block">
                    <div className="flex items-center justify-end gap-1">
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{displayName}</p>
                        {/* Verificado adicionado */}
                        <VerificationBadge badge={userProfile?.verification_badge} size="4px" />
                    </div>
                    {/* Role corrigida */}
                    <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase truncate max-w-[100px]">{displayRole}</p>
                </div>
                
                {userProfile?.avatarUrl ? (
                    <img src={userProfile.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-purple text-white flex items-center justify-center font-bold shadow-lg shadow-brand-purple/20">
                        {displayInitial}
                    </div>
                )}
                <i className={`fas fa-chevron-down text-xs text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {/* Dropdown Menu Adicionado */}
            {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 animate-fade-in-up z-50">
                    <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-700 mb-1">
                        <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{displayName}</p>
                        <p className="text-xs text-gray-400 truncate">{userProfile?.email}</p>
                    </div>

                    <Link 
                        href="/dashboard/account" 
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-brand-purple transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                    >
                        <i className="fas fa-cog w-4 text-center"></i>
                        Gerenciar Conta
                    </Link>

                    <Link 
                        href={`/u/${userNickname}`} 
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-brand-purple transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                    >
                        <i className="fas fa-globe w-4 text-center"></i>
                        Meu Perfil Público
                    </Link>
                    
                    <div className="border-t border-gray-50 dark:border-gray-700 my-1 mt-1"></div>

                    <form action="/auth/signout" method="post">
                        <button type="submit" className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <i className="fas fa-sign-out-alt w-4 text-center"></i>
                            Sair
                        </button>
                    </form>
                </div>
            )}
        </div>
        
      </div>
    </header>
  );
}