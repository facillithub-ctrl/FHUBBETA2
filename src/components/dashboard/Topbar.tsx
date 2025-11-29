"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-30 transition-colors">
      
      {/* ESQUERDA: Toggle Sidebar + BUSCADOR */}
      <div className="flex items-center gap-4 flex-1">
        <button onClick={onToggleSidebar} className="lg:hidden text-gray-500 hover:text-brand-purple transition-colors">
          <i className="fas fa-bars text-xl"></i>
        </button>

        {/* Buscador */}
        <div className="hidden md:flex items-center bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-700 w-full max-w-md focus-within:ring-2 focus-within:ring-brand-purple/20 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/50">
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
            <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden flex flex-col max-h-[500px] animate-fade-in-up ring-1 ring-black/5">
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

        {/* --- PERFIL DO USUÁRIO (DROPDOWN PREMIUM) --- */}
        <div className="relative pl-6 border-l border-gray-100 dark:border-gray-800" ref={userMenuRef}>
            <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 hover:opacity-80 transition-all focus:outline-none group"
            >
                <div className="text-right hidden md:block">
                    <div className="flex items-center justify-end gap-1">
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{displayName}</p>
                        {/* Badge visível APENAS no desktop */}
                        <VerificationBadge badge={userProfile?.verification_badge} size="4px" />
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase truncate max-w-[100px]">{displayRole}</p>
                </div>
                
                {/* WRAPPER PARA AVATAR E SELO */}
                <div className="relative inline-block font-sans">
                    
                    {/* AVATAR COM CÍRCULO PERFEITO */}
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow-lg ring-2 ring-transparent group-hover:ring-brand-purple/20 transition-all">
                        {userProfile?.avatarUrl ? (
                            <Image 
                                src={userProfile.avatarUrl} 
                                alt="Avatar" 
                                fill
                                className="object-cover"
                                sizes="40px"
                            />
                        ) : (
                            <div className="w-full h-full bg-brand-purple text-white flex items-center justify-center font-bold text-lg">
                                {displayInitial}
                            </div>
                        )}
                    </div>

                    {/* SELO DE VERIFICADO NO CANTO DA FOTO (APENAS MOBILE - md:hidden) */}
                    {userProfile?.verification_badge && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center p-[3px] z-10 shadow-sm md:hidden">
                            <VerificationBadge badge={userProfile.verification_badge} size="12px" />
                        </div>
                    )}
                </div>
                
                <i className={`fas fa-chevron-down text-xs text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {/* --- MENU DROPDOWN REFORMULADO --- */}
            {isUserMenuOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden py-0 animate-fade-in-up z-50 ring-1 ring-black/5">
                    
                    {/* Header Premium com Gradiente */}
                    <div className="relative bg-brand-gradient p-6 text-white overflow-hidden">
                        {/* Efeito Decorativo */}
                        <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

                        <div className="relative z-10 flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-full border-4 border-white/20 shadow-inner overflow-hidden">
                                {userProfile?.avatarUrl ? (
                                    <Image src={userProfile.avatarUrl} alt="Avatar Large" fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-white/20 flex items-center justify-center font-bold text-2xl">{displayInitial}</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-lg truncate">{displayName}</h3>
                                    <VerificationBadge badge={userProfile?.verification_badge} size="12px" />
                                </div>
                                <p className="text-blue-100 text-xs truncate mb-1">{userProfile?.email}</p>
                                <span className="inline-block bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-white/10">
                                    {displayRole}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Corpo do Menu */}
                    <div className="p-3 space-y-1">
                        
                        {/* Botão Facillit Account Destacado */}
                        <Link 
                            href="/dashboard/account" 
                            className="block mb-3"
                            onClick={() => setIsUserMenuOpen(false)}
                        >
                            <div className="bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 p-3 rounded-xl flex items-center gap-3 transition-all group">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-royal-blue dark:text-blue-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                                    <i className="fas fa-user-shield"></i>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-white text-sm group-hover:text-royal-blue dark:group-hover:text-blue-400 transition-colors">Facillit Account</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Gerenciar conta e dados</p>
                                </div>
                                <i className="fas fa-chevron-right ml-auto text-gray-300 group-hover:text-royal-blue text-xs"></i>
                            </div>
                        </Link>

                        <div className="border-t border-gray-100 dark:border-gray-800 my-2 opacity-50"></div>

                        <Link 
                            href={`/u/${userNickname}`} 
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group"
                            onClick={() => setIsUserMenuOpen(false)}
                        >
                            <span className="w-6 text-center text-gray-400 group-hover:text-brand-purple"><i className="fas fa-globe"></i></span>
                            Meu Perfil Público
                        </Link>

                        <Link 
                            href="/recursos/ajuda" 
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group"
                            onClick={() => setIsUserMenuOpen(false)}
                        >
                            <span className="w-6 text-center text-gray-400 group-hover:text-green-500"><i className="fas fa-life-ring"></i></span>
                            Central de Ajuda
                        </Link>
                        
                        <div className="border-t border-gray-100 dark:border-gray-800 my-2"></div>

                        <form action="/auth/signout" method="post">
                            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium">
                                <span className="w-6 text-center"><i className="fas fa-sign-out-alt"></i></span>
                                Sair da Plataforma
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
        
      </div>
    </header>
  );
}