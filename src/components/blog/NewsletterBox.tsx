'use client'

import { useState } from 'react'
import { subscribeToNewsletter } from '@/app/recursos/blog/actions'
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface NewsletterBoxProps {
  simple?: boolean
  darkTheme?: boolean
}

export function NewsletterBox({ simple = false, darkTheme = false }: NewsletterBoxProps) {
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

  // --- Lógica de Estilo para o Tema Escuro ---
  const inputClass = darkTheme 
    ? "bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/20 focus:ring-brand-green/50" 
    : "bg-gray-50 border-gray-200 text-gray-900 focus:bg-white focus:ring-brand-purple/20";
    
  const buttonClass = darkTheme
    ? "bg-white text-brand-dark hover:bg-brand-green"
    : "bg-brand-purple text-white hover:bg-brand-dark";

  const textColor = darkTheme ? "text-white" : "text-gray-900";
  const subTextColor = darkTheme ? "text-gray-300" : "text-gray-600";

  // --- Versão Compacta (Sidebar / Cards) ---
  if (simple) {
    return (
      <div className="w-full">
        {message?.type === 'success' ? (
          <div className="bg-green-50 p-4 rounded-lg text-center animate-in fade-in">
            <CheckCircle size={20} className="text-green-600 mx-auto mb-2" />
            <p className="text-green-800 text-sm font-medium">{message.text}</p>
          </div>
        ) : (
          <form action={handleSubmit} className="space-y-3">
            <input 
              name="email" 
              type="email" 
              placeholder="Seu melhor e-mail" 
              required 
              className={`w-full px-4 py-3 rounded-lg border text-sm focus:outline-none transition-all ${inputClass}`} 
            />
            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full py-3 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70 ${buttonClass}`}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Inscrever-se'}
            </button>
            {message?.type === 'error' && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-medium bg-red-500/10 p-2 rounded">
                <AlertCircle size={12} /> {message.text}
              </p>
            )}
          </form>
        )}
      </div>
    )
  }

  // --- Versão Completa (Final do Post) ---
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-purple shadow-sm">
          <Mail size={28} />
        </div>
        
        <h3 className={`text-3xl font-bold mb-3 ${textColor}`}>Não perca nenhuma novidade</h3>
        <p className={`${subTextColor} mb-8 text-lg`}>
          Junte-se a nossa comunidade e receba dicas exclusivas de educação e tecnologia diretamente no seu e-mail.
        </p>

        {message?.type === 'success' ? (
          <div className="flex items-center justify-center gap-3 text-green-800 bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-green-100 shadow-sm animate-in zoom-in-95 duration-300">
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <span className="font-semibold text-lg">{message.text}</span>
          </div>
        ) : (
          <form action={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              name="email"
              type="email"
              placeholder="Digite seu e-mail principal..."
              required
              className="flex-1 px-6 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all shadow-sm text-gray-700 bg-white"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-brand-purple text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-brand-dark hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-purple/20 flex items-center justify-center gap-2 min-w-[160px]"
            >
              {loading && <Loader2 size={20} className="animate-spin" />}
              {loading ? 'Enviando...' : 'Inscrever agora'}
            </button>
          </form>
        )}
        
        {message?.type === 'error' && (
          <div className="mt-4 inline-flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={16} /> {message.text}
          </div>
        )}
        
        <p className="mt-6 text-xs text-gray-400">
          Respeitamos sua privacidade. Cancele a inscrição a qualquer momento.
        </p>
      </div>
    </div>
  )
}