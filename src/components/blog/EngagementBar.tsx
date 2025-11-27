'use client'

import { useState, useEffect } from 'react'
import { Heart, Bookmark, Share2, Copy, Check } from 'lucide-react'
import { toggleLike, toggleSave, getEngagementCounts } from '@/app/recursos/blog/actions'
import { useToast } from '@/contexts/ToastContext'

export function EngagementBar({ postSlug }: { postSlug: string }) {
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    // Carrega contagem inicial (Simulado para otimizar, o ideal é checar estado real do user)
    getEngagementCounts(postSlug).then(data => setLikes(data.likes))
  }, [postSlug])

  const handleLike = async () => {
    // Otimistic UI update
    const newStatus = !isLiked
    setIsLiked(newStatus)
    setLikes(prev => newStatus ? prev + 1 : prev - 1)
    
    const result = await toggleLike(postSlug)
    if (result.error) {
        setIsLiked(!newStatus) // Revert
        setLikes(prev => !newStatus ? prev + 1 : prev - 1)
        addToast({ title: "Atenção", message: "Faça login para curtir", type: "warning" })
    }
  }

  const handleSave = async () => {
    setIsSaved(!isSaved)
    const result = await toggleSave(postSlug)
    if (result.error) {
        setIsSaved(!isSaved)
        addToast({ title: "Atenção", message: "Faça login para salvar", type: "warning" })
    } else {
        addToast({ title: result.saved ? "Salvo" : "Removido", message: result.saved ? "Artigo salvo na sua biblioteca" : "Removido dos salvos", type: "success" })
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    addToast({ title: "Link copiado!", message: "Compartilhe com seus amigos.", type: "success" })
  }

  return (
    <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-full px-6 py-3 shadow-sm">
        <button 
            onClick={handleLike}
            className={`flex items-center gap-2 text-sm font-bold transition-all ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
        >
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
            <span>{likes}</span>
        </button>
        
        <div className="w-px h-4 bg-gray-200"></div>

        <button 
            onClick={handleSave}
            className={`transition-all ${isSaved ? 'text-brand-purple' : 'text-gray-500 hover:text-brand-purple'}`}
            title="Salvar para ler depois"
        >
            <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
        </button>

        <button 
            onClick={handleShare}
            className="text-gray-500 hover:text-brand-green transition-all"
            title="Copiar Link"
        >
            {copied ? <Check size={20} /> : <Share2 size={20} />}
        </button>
    </div>
  )
}