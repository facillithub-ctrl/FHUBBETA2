'use server'

import { redirect } from 'next/navigation'
import createSupabaseServerClient from '@/utils/supabase/server'

/**
 * Gera um nickname único baseado no nome completo.
 * Remove espaços, acentos e verifica colisão no banco de dados.
 */
async function generateUniqueNickname(fullName: string, supabase: any) {
  // 1. Normalização: Lowercase, sem acentos, sem espaços, apenas letras e números
  const baseNickname = fullName
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/\s+/g, '') // Remove espaços internos
    .replace(/[^a-z0-9]/g, ''); // Remove caracteres especiais

  // Garante que temos pelo menos algo (fallback para 'user' se o nome for vazio)
  const cleanBase = baseNickname || 'user';
  
  let candidate = cleanBase;
  let isUnique = false;
  let attempts = 0;

  // 2. Loop de verificação de unicidade
  // Tenta o nome base, depois adiciona números aleatórios se necessário
  while (!isUnique && attempts < 5) {
    // Se não for a primeira tentativa, adiciona sufixo
    if (attempts > 0) {
      const suffix = Math.floor(Math.random() * 10000); // 0 a 9999
      candidate = `${cleanBase}${suffix}`;
    }

    // Verifica disponibilidade na tabela profiles
    const { data } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('nickname', candidate)
      .single();

    if (!data) {
      isUnique = true; // Não encontrou ninguém com esse nick, está livre
    } else {
      attempts++;
    }
  }

  // 3. Fallback de segurança (Timestamp) se falhar após 5 tentativas
  if (!isUnique) {
    candidate = `${cleanBase}${Date.now().toString().slice(-6)}`;
  }

  return candidate;
}

export async function signup(formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const category = formData.get('category') as string // 'student', 'teacher', etc.

  // --- GERAÇÃO AUTOMÁTICA DE NICKNAME ---
  // Gera um apelido único antes de criar a conta
  const nickname = await generateUniqueNickname(fullName, supabase);

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        user_category: category,
        nickname: nickname, // Salva o nickname gerado e único
        // Define o perfil como PÚBLICO por padrão para garantir visibilidade
        privacy_settings: { is_public: true }
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Se for institucional, pode ter logicas extras aqui
  
  redirect('/dashboard/onboarding')
} 