'use client'

import { useState, useEffect } from 'react'
import createClient from '@/utils/supabase/client'
import { postComment } from '@/app/recursos/blog/actions' // Caminho ajustado
import { User, MessageSquare, Send, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
}

export function CommentsSection({ postSlug }: { postSlug: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      // 1. Pega usuário
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // 2. Pega comentários
      const { data } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('post_slug', postSlug)
        // .eq('is_approved', true) // Descomente se habilitar moderação no SQL
        .order('created_at', { ascending: false })

      if (data) setComments(data)
      setLoadingComments(false)
    }
    loadData()
  }, [postSlug]) // Dependência simplificada para evitar loop

  async function handlePostComment(formData: FormData) {
    if (!user) return alert("Faça login para comentar")
    
    setIsSubmitting(true)
    formData.append('postSlug', postSlug)
    
    const result = await postComment(formData)
    
    if (result.success) {
      // Atualiza lista localmente para feedback instantâneo
      const newComment = {
        id: Math.random().toString(),
        content: formData.get('content') as string,
        created_at: new Date().toISOString(),
        user_id: user.id
      }
      setComments([newComment, ...comments])
      
      // Limpa formulário
      const form = document.getElementById('comment-form') as HTMLFormElement
      form?.reset()
    } else {
      alert(result.error)
    }
    setIsSubmitting(false)
  }

  return (
    <div className="pt-10 border-t border-gray-100">
      <div className="flex items-center gap-2 mb-8">
        <MessageSquare className="text-blue-600" />
        <h3 className="text-2xl font-bold text-gray-900">Comentários ({comments.length})</h3>
      </div>

      {/* Formulário */}
      <div className="mb-10 bg-gray-50 p-6 rounded-xl border border-gray-100">
        {user ? (
          <form id="comment-form" action={handlePostComment}>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white font-bold">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <textarea
                  name="content"
                  placeholder="Escreva seu comentário..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-white"
                  required
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Publicar
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-3">Você precisa estar logado para participar da conversa.</p>
            <a href="/login" className="inline-block px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors">
              Fazer Login
            </a>
          </div>
        )}
      </div>

      {/* Lista */}
      <div className="space-y-6">
        {loadingComments ? (
          <div className="text-center py-8">
            <Loader2 className="animate-spin mx-auto text-blue-600" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-500">
                <User size={20} />
              </div>
              <div className="flex-1">
                <div className="bg-white border border-gray-100 p-4 rounded-lg rounded-tl-none shadow-sm">
                  <p className="text-gray-800 text-sm">{comment.content}</p>
                </div>
                <div className="flex items-center gap-4 mt-1 ml-1 text-xs text-gray-400">
                  <span>Usuário</span>
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center italic py-8">Seja o primeiro a comentar!</p>
        )}
      </div>
    </div>
  )
}