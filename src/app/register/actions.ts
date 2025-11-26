'use server'

import { createClient } from '@/utils/supabase/server'

export async function signup(data: any) {
  const supabase = await createClient()

  // Extrair dados correspondentes ao formulário da página
  const { 
    email, 
    password, 
    fullName, 
    pronoun, 
    cep, 
    street, 
    number, 
    complement, 
    neighborhood, 
    city, 
    state 
  } = data

  // 1. Criar utilizador no Auth com metadados básicos
  const { error: authError, data: authData } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        pronoun: pronoun,
      },
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  if (authData.user) {
    // 2. Inserir ou Atualizar dados na tabela 'profiles'
    // Usamos upsert para garantir que se o perfil foi criado via Trigger, apenas atualizamos
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name: fullName,
        pronoun: pronoun,
        address_cep: cep,
        address_street: street,
        address_number: number,
        address_complement: complement,
        address_neighborhood: neighborhood,
        address_city: city,
        address_state: state,
        user_category: 'aluno',
        has_completed_onboarding: false,
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
       console.error("Erro ao atualizar perfil (Server Action):", profileError)
       // Opcional: Retornar erro específico se necessário, mas o user auth foi criado
    }
  }

  return { success: true }
}