"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/hooks/useNotifications'; // Importe o hook que criamos
import { UserProfile } from '@/app/dashboard/types'; // Ajuste o caminho conforme seus tipos

interface TopbarProps {
  onToggleSidebar: () => void;
  userProfile: UserProfile; // Supondo que você receba isso
}

export default function Topbar({ onToggleSidebar, userProfile }: TopbarProps) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Formata data relativa (ex: "há 2 min")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000); // minutos
    if (diff < 60) return `${diff} min atrás`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-30">
      
      {/* Botão Menu Mobile */}
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="lg:hidden text-gray-500 hover:text-brand-purple">
          <i className="fas fa-bars text-xl"></i>
        </button>
        {/* Breadcrumbs ou Título poderiam vir aqui */}
      </div>

      <div className="flex items-center gap-6">
        
        {/* --- CENTRAL DE NOTIFICAÇÕES --- */}
        <div className="relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-gray-400 hover:text-brand-purple transition-colors rounded-full hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <i className="fas fa-bell text-xl"></i>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse"></span>
            )}
          </button>

          {/* Dropdown de Notificações */}
          {isNotifOpen && (
            <>
              {/* Overlay invisível para fechar ao clicar fora */}
              <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
              
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
                        {/* Indicador de não lido */}
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
            </>
          )}
        </div>

        {/* Avatar e Menu do Usuário (Já deve existir no seu código) */}
        <div className="flex items-center gap-3 pl-6 border-l border-gray-100 dark:border-gray-800">
           {/* ... Seu código de avatar existente ... */}
           <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{userProfile.fullName}</p>
              <p className="text-xs text-gray-400">Estudante</p>
           </div>
           <div className="w-10 h-10 rounded-full bg-brand-purple text-white flex items-center justify-center font-bold shadow-lg shadow-brand-purple/20">
              {userProfile.fullName[0]}
           </div>
        </div>
        
      </div>
    </header>
  );
}