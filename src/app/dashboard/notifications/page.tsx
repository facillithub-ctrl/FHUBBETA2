"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function NotificationsPage() {
  const { notifications, loading, markAsRead, markAllAsRead, refetch } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Filtra as notificações baseadas na seleção
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  const handleMarkAsRead = async (id: string, link?: string) => {
    await markAsRead(id);
    // Se tiver link, a navegação é feita pelo componente Link, mas marcamos como lida antes
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
            Central de Notificações
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Acompanhe suas atualizações, correções e novidades.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={markAllAsRead}
            className="px-4 py-2 text-sm font-medium text-brand-purple bg-purple-50 hover:bg-purple-100 dark:bg-gray-800 dark:text-purple-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <i className="fas fa-check-double mr-2"></i>
            Marcar tudo como lido
          </button>
          <button 
            onClick={() => refetch()}
            className="p-2 text-gray-500 hover:text-brand-purple hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition-all"
            title="Atualizar"
          >
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>

      {/* Abas de Filtro e Conteúdo */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden min-h-[60vh] flex flex-col">
        
        {/* Barra de Filtros */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 px-6">
          <button
            onClick={() => setFilter('all')}
            className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
              filter === 'all' 
                ? 'border-brand-purple text-brand-purple' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
              filter === 'unread' 
                ? 'border-brand-purple text-brand-purple' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Não lidas
          </button>
        </div>

        {/* Lista */}
        <div className="divide-y divide-gray-50 dark:divide-gray-800 flex-1">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                 <i className="far fa-bell-slash text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Nenhuma notificação aqui</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-xs mx-auto">
                {filter === 'unread' 
                  ? 'Você leu todas as suas notificações pendentes.' 
                  : 'Quando você receber atualizações sobre suas redações ou cursos, elas aparecerão aqui.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div 
                key={notification.id}
                className={`group p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex gap-4 ${
                    !notification.is_read ? 'bg-purple-50/20 dark:bg-purple-900/5' : ''
                }`}
              >
                {/* Ícone baseado no tipo */}
                <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    !notification.is_read 
                        ? 'bg-purple-100 text-brand-purple dark:bg-purple-900/30 dark:text-purple-300' 
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                    <i className={`fas ${
                        notification.type === 'success' ? 'fa-check-circle' :
                        notification.type === 'warning' ? 'fa-exclamation-triangle' :
                        notification.type === 'error' ? 'fa-times-circle' :
                        'fa-info-circle'
                    }`}></i>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-base ${!notification.is_read ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                            {notification.title}
                        </h4>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ptBR })}
                        </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                        {notification.message}
                    </p>

                    <div className="flex items-center gap-4">
                        {notification.link && (
                            <Link 
                                href={notification.link}
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-sm font-semibold text-brand-purple hover:underline flex items-center gap-1"
                            >
                                Ver detalhes <i className="fas fa-arrow-right text-xs"></i>
                            </Link>
                        )}
                        {!notification.is_read && (
                            <button 
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
                            >
                                Marcar como lida
                            </button>
                        )}
                    </div>
                </div>

                {/* Bolinha de status (apenas visual) */}
                {!notification.is_read && (
                    <div className="w-2 h-2 rounded-full bg-brand-purple mt-2 flex-shrink-0"></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}