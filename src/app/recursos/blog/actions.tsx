'use server'

import createClient from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- Validações ---
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// --- Newsletter ---
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
    if (error.code === '23505') { 
      return { error: "Este email já está inscrito!" }
    }
    return { error: "Erro ao inscrever. Tente novamente." }
  }

  return { success: "Inscrição realizada com sucesso!" }
}

// --- Comentários ---
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

  revalidatePath(`/recursos/blog/${postSlug}`)
  return { success: true }
}

// --- Likes (Novo) ---
export async function toggleLike(postSlug: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Login necessário" }

  const { data: existing } = await supabase
    .from('blog_likes')
    .select('id')
    .eq('post_slug', postSlug)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    await supabase.from('blog_likes').delete().eq('id', existing.id)
    return { liked: false }
  } else {
    await supabase.from('blog_likes').insert({ post_slug: postSlug, user_id: user.id })
    return { liked: true }
  }
}

// --- Salvar/Bookmark (Novo) ---
export async function toggleSave(postSlug: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Login necessário" }

  const { data: existing } = await supabase
    .from('blog_saves')
    .select('id')
    .eq('post_slug', postSlug)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    await supabase.from('blog_saves').delete().eq('id', existing.id)
    return { saved: false }
  } else {
    await supabase.from('blog_saves').insert({ post_slug: postSlug, user_id: user.id })
    return { saved: true }
  }
}

// --- Contagem de Engajamento ---
export async function getEngagementCounts(postSlug: string) {
  const supabase = await createClient()
  
  const { count: likes } = await supabase
    .from('blog_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_slug', postSlug)

  return { likes: likes || 0 }
}