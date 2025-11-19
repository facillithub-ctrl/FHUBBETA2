import { cache } from 'react';
import createSupabaseServerClient from '@/utils/supabase/server';

export type UserStats = {
  unreadNotifications: number;
  streak: number;
  level: number;
  points: number;
};

// O 'cache' permite que esta função seja chamada em vários componentes 
// durante a mesma requisição sem duplicar as chamadas ao Supabase.
export const getCachedUserStats = cache(async (userId: string): Promise<UserStats> => {
  const supabase = await createSupabaseServerClient();

  try {
    // Executamos as promessas em paralelo para ser mais rápido
    const [notificationsRes, gamificationRes] = await Promise.all([
      // 1. Contar notificações não lidas
      supabase
        .from('notifications') // Certifica-te que esta tabela existe, ou ajusta para a tua real
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false),
      
      // 2. Buscar dados de gamificação no perfil
      supabase
        .from('profiles')
        .select('streak_days, level, points') // Ajusta estes campos se o nome for diferente no teu DB
        .eq('id', userId)
        .single()
    ]);

    return {
      unreadNotifications: notificationsRes.count || 0,
      streak: gamificationRes.data?.streak_days || 0,
      level: gamificationRes.data?.level || 1,
      points: gamificationRes.data?.points || 0
    };
  } catch (error) {
    console.error("Erro ao buscar stats do utilizador:", error);
    // Retorna valores padrão em caso de erro para não quebrar a UI
    return {
      unreadNotifications: 0,
      streak: 0,
      level: 1,
      points: 0
    };
  }
});