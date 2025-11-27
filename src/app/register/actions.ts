'use server'

import { redirect } from 'next/navigation'
import createSupabaseServerClient from '@/utils/supabase/server' // CORREÇÃO: Importação default correta

export async function signup(formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const category = formData.get('category') as string // 'student', 'teacher', etc.

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        user_category: category,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Se for institucional, pode ter logicas extras aqui
  
  redirect('/dashboard/onboarding')
}