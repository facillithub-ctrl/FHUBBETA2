// src/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
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

  // Dependência adicionada para satisfazer o linter
  const fetchNotifications = useCallback(async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

        if (data) {
        setNotifications(data as NotificationItem[]);
        setUnreadCount(data.filter((n: any) => !n.is_read).length);
        }
    } catch (error) {
        console.error("Erro ao buscar notificações", error);
    } finally {
        setLoading(false);
    }
  }, [supabase]); 

  const markAsRead = async (id: string) => {
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
  }, [fetchNotifications]); 

  return { notifications, unreadCount, markAsRead, markAllAsRead, loading, refetch: fetchNotifications };
}