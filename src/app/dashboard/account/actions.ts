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
  // Adicionado para aceitar a config da IA
  ai_config?: any; 
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

  // 2. Busca o 'category_details' atual para não sobrescrevê-lo
  const { data: currentProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('category_details')
    .eq('id', user.id)
    .single();

  if (fetchError) {
    console.error("Erro ao buscar perfil atual:", fetchError);
    return { error: 'Não foi possível ler os dados atuais do perfil.' };
  }

  // 3. Prepara os dados do JSONB 'category_details'
  // (Remove 'undefined' dos valores para não apagar dados no merge)
  const newDetails = {
    country: payload.country,
    language: payload.language,
    bio: payload.bio,
    ai_config: payload.ai_config, // Adiciona a config da IA
  };
  Object.keys(newDetails).forEach(key => 
    newDetails[key as keyof typeof newDetails] === undefined && delete newDetails[key as keyof typeof newDetails]
  );
  
  const newCategoryDetails = {
    ...currentProfile.category_details,
    ...newDetails
  };

  // 4. Adiciona os dados do JSONB ao objeto de atualização
  mainProfileData.category_details = newCategoryDetails;
  mainProfileData.updated_at = new Date().toISOString();

  // 5. Executa o Update
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
  return { data: { success: true } };
}

// -----------------------------------------------------------------
// --- NOVO CÓDIGO (Etapa 3.1: Alterar Senha) ---
// -----------------------------------------------------------------
export async function updateUserPassword(newPassword: string) {
  // ... (código da função que já criámos)
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

// -----------------------------------------------------------------
// --- NOVO CÓDIGO (Para a Aba "Módulos") ---
// -----------------------------------------------------------------
/**
 * Atualiza a lista de módulos ativos do utilizador.
 */
export async function updateActiveModules(active_modules: string[]) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Usuário não autenticado.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ active_modules, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error) {
    console.error("Erro ao atualizar módulos:", error);
    return { error: `Erro ao salvar módulos: ${error.message}` };
  }

  revalidatePath('/dashboard/account'); // Revalida a página da conta
  revalidatePath('/dashboard'); // Revalida o dashboard (para a sidebar)
  return { data: { success: true } };
}