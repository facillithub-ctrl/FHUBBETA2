// src/hooks/useNotifications.ts
import { useState, useEffect } from 'react';
import createClient from '@/utils/supabase/client';

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
  type: 'info' | 'success' | 'warning' | 'error';
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20); // Traz as últimas 20 para ser rápido

    if (data) {
      setNotifications(data as NotificationItem[]);
      setUnreadCount(data.filter((n: any) => !n.is_read).length);
    }
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    // Otimização Otimista (atualiza a UI antes do banco)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Opcional: Escutar novas notificações em tempo real (se quiser gastar cota do Realtime)
    // Se preferir economizar (como pediu), pode remover este bloco e só atualizar ao recarregar
    const channel = supabase
      .channel('realtime-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
          const newNotif = payload.new as NotificationItem;
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { notifications, unreadCount, markAsRead, markAllAsRead, loading, refetch: fetchNotifications };
}