"use server";

import createSupabaseServerClient from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Tipo para os dados que podem ser atualizados
type UpdateProfilePayload = {
  fullName?: string;
  nickname?: string;
  birthDate?: string;
  avatarUrl?: string;
  country?: string;
  language?: string;
  bio?: string;
  ai_config?: any; 
  // CORREÇÃO 1: Adicionar o campo ao tipo
  privacy_settings?: any;
};

export async function updateAccountProfile(payload: UpdateProfilePayload) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Usuário não autenticado.' };
  }

  // 1. Separa os dados que vão para colunas principais
  const mainProfileData: { [key: string]: any } = {};
  
  if (payload.fullName !== undefined) mainProfileData.full_name = payload.fullName;
  if (payload.nickname !== undefined) mainProfileData.nickname = payload.nickname;
  if (payload.birthDate !== undefined) mainProfileData.birth_date = payload.birthDate;
  if (payload.avatarUrl !== undefined) mainProfileData.avatar_url = payload.avatarUrl;

  // CORREÇÃO 2: Processar e salvar privacy_settings
  // Como é uma coluna JSONB direta na tabela profiles, adicionamos aqui:
  if (payload.privacy_settings !== undefined) {
    mainProfileData.privacy_settings = payload.privacy_settings;
  }

  // 2. Busca o 'category_details' atual para não sobrescrevê-lo (Lógica existente da IA)
  // (Apenas executamos essa busca se houver dados de category_details para atualizar)
  if (payload.country !== undefined || payload.language !== undefined || payload.bio !== undefined || payload.ai_config !== undefined) {
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('category_details')
        .eq('id', user.id)
        .single();

      if (!fetchError && currentProfile) {
          const newDetails = {
            country: payload.country,
            language: payload.language,
            bio: payload.bio,
            ai_config: payload.ai_config,
          };
          
          // Remove undefined
          Object.keys(newDetails).forEach(key => 
            newDetails[key as keyof typeof newDetails] === undefined && delete newDetails[key as keyof typeof newDetails]
          );
          
          mainProfileData.category_details = {
            ...currentProfile.category_details,
            ...newDetails
          };
      }
  }

  mainProfileData.updated_at = new Date().toISOString();

  // 3. Executa o Update
  const { error: updateError } = await supabase
    .from('profiles')
    .update(mainProfileData)
    .eq('id', user.id);

  if (updateError) {
    console.error("Erro ao atualizar perfil:", updateError);
    return { error: `Erro ao salvar: ${updateError.message}` };
  }

  revalidatePath('/dashboard/account');
  revalidatePath('/dashboard');
  
  // Revalidar também a página pública do usuário se o nickname tiver mudado ou se for uma atualização de privacidade
  if (payload.nickname || payload.privacy_settings) {
     // Idealmente, precisaríamos do nickname antigo ou novo para revalidar a rota específica, 
     // mas revalidar o layout geral ajuda.
  }

  return { data: { success: true } };
}

// ... (O resto do arquivo activeModules e updateUserPassword mantém-se igual)
export async function updateUserPassword(newPassword: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });
  if (error) {
    console.error("Erro ao alterar senha:", error);
    return { error: `Erro ao alterar senha: ${error.message}` };
  }
  return { data };
}

export async function updateActiveModules(active_modules: string[]) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Usuário não autenticado.' };

  const { error } = await supabase
    .from('profiles')
    .update({ active_modules, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error) return { error: `Erro: ${error.message}` };

  revalidatePath('/dashboard/account');
  revalidatePath('/dashboard');
  return { data: { success: true } };
}