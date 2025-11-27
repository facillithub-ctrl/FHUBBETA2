'use client'

import { useState, useEffect, useCallback } from 'react'
import createClient from '@/utils/supabase/client'
import { postComment } from '@/app/recursos/blog/actions'
import { User, MessageSquare, Send, Loader2, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useToast } from '@/contexts/ToastContext' // Assumindo que você tem esse contexto

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
  const { addToast } = useToast()

  // UseCallback para estabilizar a função e evitar loop no useEffect
  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('post_slug', postSlug)
      .order('created_at', { ascending: false })
    if (data) setComments(data)
    setLoadingComments(false)
  }, [postSlug, supabase])

  useEffect(() => {
    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
    }
    getUser()
    fetchComments()
  }, [fetchComments, supabase]) // Dependências corrigidas

  async function handlePostComment(formData: FormData) {
    if (!user) return addToast({ title: "Erro", message: "Faça login para comentar", type: "error" })
    
    setIsSubmitting(true)
    formData.append('postSlug', postSlug)
    
    const result = await postComment(formData)
    
    if (result.success) {
      addToast({ title: "Sucesso", message: "Comentário enviado!", type: "success" })
      const form = document.getElementById('comment-form') as HTMLFormElement
      form?.reset()
      fetchComments() // Recarrega a lista real
    } else {
      addToast({ title: "Erro", message: result.error as string, type: "error" })
    }
    setIsSubmitting(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-12">
      <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
        <div className="p-2 bg-brand-purple/10 rounded-lg text-brand-purple">
            <MessageSquare size={24} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Comentários <span className="text-gray-400 text-lg ml-1">({comments.length})</span></h3>
      </div>

      {/* Formulário */}
      <div className="mb-10 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200 overflow-hidden">
             {user ? (
                 <span className="font-bold text-brand-purple">{user.email?.charAt(0).toUpperCase()}</span>
             ) : (
                 <User size={20} className="text-gray-400" />
             )}
        </div>
        <div className="flex-1">
            {user ? (
            <form id="comment-form" action={handlePostComment} className="relative">
                <textarea
                    name="content"
                    placeholder="Compartilhe sua opinião..."
                    rows={3}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none resize-none bg-gray-50 transition-all text-sm"
                    required
                />
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="absolute bottom-3 right-3 p-2 bg-brand-purple text-white rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50 shadow-sm"
                >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
            </form>
            ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                <p className="text-gray-500 mb-3">Você precisa estar conectado para comentar.</p>
                <a href="/login" className="inline-block px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-100 transition-colors shadow-sm">
                    Fazer Login
                </a>
            </div>
            )}
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-6">
        {loadingComments ? (
          <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-brand-purple" /></div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="group flex gap-4 animate-in fade-in">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-purple to-brand-green p-[2px] flex-shrink-0">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-brand-purple">U</span>
                  </div>
              </div>
              <div className="flex-1">
                <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none">
                    <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm text-gray-900">Usuário</span>
                        <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })}
                        </span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                </div>
                {/* Ações do Comentário (Futuro: Responder, Curtir) */}
                <div className="flex gap-4 mt-1 ml-2">
                    <button className="text-xs font-bold text-gray-400 hover:text-brand-purple transition-colors">Responder</button>
                    <button className="text-xs font-bold text-gray-400 hover:text-brand-purple transition-colors">Curtir</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-400 italic">Seja o primeiro a comentar!</p>
          </div>
        )}
      </div>
    </div>
  )
}