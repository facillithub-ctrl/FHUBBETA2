'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
// CORREÇÃO: Removemos as chaves { } porque é um export default
import createClient from '@/utils/supabase/server' 

export async function login(formData: FormData) {
  // Nota: o await aqui é necessário se o teu createClient usar cookies() do Next.js 15
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Retornamos o erro para ser exibido no formulário (opcional)
    // Se o teu front-end não estiver preparado para ler o retorno, 
    // ele vai apenas redirecionar ou falhar silenciosamente.
    return { error: 'Credenciais inválidas. Verifique seu e-mail e senha.' }
  }

  revalidatePath('/', 'layout')
  
  // Redireciona para a nova página de seleção
  redirect('/selection')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  
  // Após cadastro, também mandamos para a seleção (ou onboarding se preferires)
  redirect('/selection')
}