"use server";

import { revalidatePath } from 'next/cache';
import createSupabaseServerClient from '@/utils/supabase/server';
import type { Update } from '@/app/(hubs)/education/dashboard/types';

// Helper de Segurança para verificar se o usuário é admin
async function isAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_category')
    .eq('id', user.id)
    .single();

  return profile?.user_category === 'administrator';
}

// Função para criar ou editar uma atualização
export async function upsertUpdate(updateData: Partial<Update>) {
    if (!(await isAdmin())) return { error: 'Acesso não autorizado.' };
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase.from('updates').upsert(updateData).select().single();
    
    if (error) return { error: error.message };
    
    revalidatePath('/admin/updates');
    revalidatePath('/recursos/atualizacoes');
    return { data };
}

// Função para deletar uma atualização
export async function deleteUpdate(updateId: string) {
    if (!(await isAdmin())) return { error: 'Acesso não autorizado.' };
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.from('updates').delete().eq('id', updateId);

    if (error) return { error: error.message };

    revalidatePath('/admin/updates');
    revalidatePath('/recursos/atualizacoes');
    return { success: true };
}