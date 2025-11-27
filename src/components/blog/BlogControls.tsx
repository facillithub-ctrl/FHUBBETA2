'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export function BlogControls({ categories }: { categories: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (searchTerm) {
        params.set('q', searchTerm)
      } else {
        params.delete('q')
      }
      router.push(`/recursos/blog?${params.toString()}`, { scroll: false })
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, router, searchParams])

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-4 md:p-5 flex flex-col md:flex-row gap-6 items-center justify-between transition-all">
      
      {/* Filtros de Categoria (Pills) */}
      <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide mask-linear-fade">
        <button 
           onClick={() => router.push('/recursos/blog')}
           className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${!searchParams.get('cat') ? 'bg-brand-purple text-white shadow-md shadow-brand-purple/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-brand-purple'}`}
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
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${searchParams.get('cat') === cat.title ? 'bg-brand-purple text-white shadow-md shadow-brand-purple/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-brand-purple'}`}
          >
            {cat.title}
          </button>
        ))}
      </div>

      {/* Barra de Busca Moderna */}
      <div className="relative w-full md:w-80 group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-purple transition-colors">
          <Search size={18} />
        </div>
        <input
          type="text"
          className="block w-full pl-11 pr-10 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all duration-300 text-sm font-medium"
          placeholder="O que você procura?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
            <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500 transition-colors"
            >
                <X size={16} />
            </button>
        )}
      </div>
    </div>
  )
}