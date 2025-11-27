'use client'

import { useState } from 'react'
import { subscribeToNewsletter } from '@/app/recursos/blog/actions' // Caminho ajustado para o novo local
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export function NewsletterBox() {
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage(null)
    
    const result = await subscribeToNewsletter(formData)
    
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else if (result.success) {
      setMessage({ type: 'success', text: result.success as string })
    }
    
    setLoading(false)
  }

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center relative overflow-hidden">
      <div className="relative z-10">
        <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
          <Mail size={24} />
        </div>
        <h3 className="text-2xl font-bold text-blue-900 mb-2">Fique por dentro das novidades</h3>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto">
          Receba dicas de educação, tecnologia e atualizações do Facillit Hub diretamente no seu e-mail.
        </p>

        {message?.type === 'success' ? (
          <div className="flex items-center justify-center gap-2 text-green-700 bg-green-50 p-4 rounded-lg animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle size={20} />
            <span className="font-medium">{message.text}</span>
          </div>
        ) : (
          <form action={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              name="email"
              type="email"
              placeholder="Seu melhor e-mail"
              required
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              Inscrever
            </button>
          </form>
        )}
        
        {message?.type === 'error' && (
          <p className="mt-3 text-red-600 text-sm flex items-center justify-center gap-1">
            <AlertCircle size={14} /> {message.text}
          </p>
        )}
      </div>
    </div>
  )
}