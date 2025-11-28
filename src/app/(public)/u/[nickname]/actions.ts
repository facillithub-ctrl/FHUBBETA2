"use server";

import createClient from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleFollow(targetUserId: string, currentPath: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Você precisa estar logado.' };
  if (user.id === targetUserId) return { error: 'Você não pode seguir a si mesmo.' };

  // 1. Verificar se já segue
  const { data: existingFollow } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .single();

  if (existingFollow) {
    // UNFOLLOW
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('id', existingFollow.id);

    if (error) return { error: 'Erro ao deixar de seguir.' };
  } else {
    // FOLLOW
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: user.id, following_id: targetUserId });

    if (error) return { error: 'Erro ao seguir usuário.' };
  }

  revalidatePath(currentPath);
  return { success: true };
}