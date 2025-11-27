'use server'

import createClient from '@/utils/supabase/server' // <--- CORRIGIDO: Sem as chaves { }
import { revalidatePath } from 'next/cache'

// Validação simples de email
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function subscribeToNewsletter(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  
  if (!email || !isValidEmail(email)) {
    return { error: "Email inválido" }
  }

  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email })

  if (error) {
    if (error.code === '23505') { // Código Postgres para violação de unique (email duplicado)
      return { error: "Este email já está inscrito!" }
    }
    return { error: "Erro ao inscrever. Tente novamente." }
  }

  return { success: "Inscrição realizada com sucesso!" }
}

export async function postComment(formData: FormData) {
  const supabase = await createClient()

  // Verifica usuário logado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Você precisa estar logado para comentar." }
  }

  const content = formData.get('content') as string
  const postSlug = formData.get('postSlug') as string

  if (!content || content.length < 3) {
    return { error: "Comentário muito curto." }
  }

  const { error } = await supabase
    .from('blog_comments')
    .insert({
      content,
      post_slug: postSlug,
      user_id: user.id
    })

  if (error) {
    console.error(error)
    return { error: "Erro ao enviar comentário." }
  }

  // Atualiza a página do post para mostrar o novo comentário imediatamente
  revalidatePath(`/recursos/blog/${postSlug}`)
  return { success: true }
}