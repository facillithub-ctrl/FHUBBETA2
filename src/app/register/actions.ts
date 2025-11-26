'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signup(data: any) {
  const supabase = await createClient()

  const { email, password, fullName, nickname, pronoun, addressCep, addressStreet, addressNumber, addressComplement, addressNeighborhood, addressCity, addressState, birthDate } = data

  // 1. Criar utilizador no Auth com metadados
  const { error: authError, data: authData } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        nickname: nickname,
        pronoun: pronoun,
        // Podemos salvar o endereço nos metadados também, ou apenas no perfil
        address_city: addressCity,
        address_state: addressState
      },
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  if (authData.user) {
    // 2. (Opcional) Inserir dados completos na tabela 'profiles' se o Trigger automático não cobrir todos os campos
    // Se você já tem um trigger que cria o perfil ao criar o user, use o update
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name: fullName,
        nickname: nickname,
        pronoun: pronoun,
        birth_date: birthDate,
        address_cep: addressCep,
        address_street: addressStreet,
        address_number: addressNumber,
        address_complement: addressComplement,
        address_neighborhood: addressNeighborhood,
        address_city: addressCity,
        address_state: addressState,
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
       console.error("Erro ao atualizar perfil:", profileError)
       // Não retornamos erro fatal aqui pois o user foi criado, mas idealmente tratamos isso
    }
  }

  return { success: true }
}