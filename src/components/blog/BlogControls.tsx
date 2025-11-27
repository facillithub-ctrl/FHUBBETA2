'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, Filter } from 'lucide-react'
import { useState, useEffect } from 'react'

interface BlogControlsProps {
    categories: any[]
    simpleMode?: boolean 
    onlyCategories?: boolean 
}

export function BlogControls({ categories, simpleMode = false, onlyCategories = false }: BlogControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const currentCat = searchParams.get('cat')

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== (searchParams.get('q') || '')) {
          const params = new URLSearchParams(searchParams.toString())
          if (searchTerm) params.set('q', searchTerm)
          else params.delete('q')
          router.push(`/recursos/blog?${params.toString()}`, { scroll: false })
      }
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, router, searchParams])

  if (simpleMode) {
      // Mantenha o código existente para simpleMode...
      return (
        <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-purple transition-colors">
                <Search size={22} />
            </div>
            <input
                type="text"
                className="block w-full pl-14 pr-6 py-5 border-0 rounded-2xl bg-white text-gray-900 placeholder-gray-400 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-brand-purple transition-all shadow-xl shadow-brand-purple/5 text-lg"
                placeholder="O que você quer aprender hoje?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-4 text-gray-400 hover:text-red-500">
                    <X size={20} />
                </button>
            )}
        </div>
      )
  }

  if (onlyCategories) {
      return (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-2 scrollbar-hide w-full px-1">
            <div className="flex-shrink-0 mr-2 text-gray-400">
                <Filter size={16} />
            </div>
            <button 
                onClick={() => router.push('/recursos/blog')}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${!currentCat ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-900/20' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
            >
                Tudo
            </button>
            {categories.map((cat) => (
            <button
                key={cat._id}
                onClick={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    if(currentCat === cat.title) {
                        params.delete('cat'); // Toggle off
                    } else {
                        params.set('cat', cat.title)
                    }
                    router.push(`/recursos/blog?${params.toString()}`, { scroll: false })
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${currentCat === cat.title ? 'bg-brand-purple text-white border-brand-purple shadow-lg shadow-brand-purple/25' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-purple/50 hover:text-brand-purple'}`}
            >
                {cat.title}
            </button>
            ))}
        </div>
      )
  }

  return null
}