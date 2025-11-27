'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface BlogControlsProps {
    categories: any[]
    simpleMode?: boolean // Modo apenas busca (usado na Hero)
    onlyCategories?: boolean // Modo apenas categorias (usado na lista)
}

export function BlogControls({ categories, simpleMode = false, onlyCategories = false }: BlogControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== (searchParams.get('q') || '')) {
          const params = new URLSearchParams(searchParams.toString())
          if (searchTerm) {
            params.set('q', searchTerm)
          } else {
            params.delete('q')
          }
          router.push(`/recursos/blog?${params.toString()}`, { scroll: false })
      }
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, router, searchParams])

  // Renderiza apenas a barra de busca (Estilo Hero)
  if (simpleMode) {
      return (
        <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-purple transition-colors">
            <Search size={20} />
            </div>
            <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all shadow-sm text-base"
            placeholder="Pesquisar por tópicos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      )
  }

  // Renderiza apenas as categorias (Estilo Sticky Bar)
  if (onlyCategories) {
      return (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide w-full items-center">
            <button 
            onClick={() => router.push('/recursos/blog')}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all border ${!searchParams.get('cat') ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-purple hover:text-brand-purple'}`}
            >
            Todos
            </button>
            {categories.map((cat) => (
            <button
                key={cat._id}
                onClick={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.set('cat', cat.title)
                    router.push(`/recursos/blog?${params.toString()}`, { scroll: false })
                }}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all border ${searchParams.get('cat') === cat.title ? 'bg-brand-purple text-white border-brand-purple' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-purple hover:text-brand-purple'}`}
            >
                {cat.title}
            </button>
            ))}
        </div>
      )
  }

  return null
}