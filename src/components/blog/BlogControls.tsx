'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter } from 'lucide-react'
import { useState, useEffect } from 'react'

export function BlogControls({ categories }: { categories: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')

  // Debounce para não atualizar a URL a cada letra digitada instantaneamente
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (searchTerm) {
        params.set('q', searchTerm)
      } else {
        params.delete('q')
      }
      router.push(`/recursos/blog?${params.toString()}`)
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, router, searchParams])

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-12 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      {/* Barra de Busca */}
      <div className="relative w-full md:w-96">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          placeholder="Buscar artigos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filtros de Categoria (Tags) */}
      <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
        <button 
           onClick={() => router.push('/recursos/blog')}
           className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${!searchParams.get('cat') ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => {
                const params = new URLSearchParams(searchParams.toString())
                params.set('cat', cat.title)
                router.push(`/recursos/blog?${params.toString()}`)
            }}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${searchParams.get('cat') === cat.title ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {cat.title}
          </button>
        ))}
      </div>
    </div>
  )
}