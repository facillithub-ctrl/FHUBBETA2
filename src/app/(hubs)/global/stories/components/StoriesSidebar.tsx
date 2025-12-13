"use client";

import { Search, TrendingUp, Users } from 'lucide-react';

export default function StoriesSidebar() {
  return (
    <div className="hidden lg:flex flex-col gap-6 pl-8 pt-4 h-full min-w-[350px]">
      
      {/* Search Bar - Estilo "Pílula" Clean */}
      <div className="sticky top-2 bg-[#f8f9fa] dark:bg-black z-20 pb-2">
          <div className="relative group">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-purple transition-colors">
                <Search size={18} />
             </div>
             <input 
               type="text" 
               placeholder="Buscar no Facillit" 
               className="w-full bg-white border border-gray-200 rounded-full py-3 pl-12 pr-4 text-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none shadow-sm transition-all"
             />
          </div>
      </div>

      {/* Card: O que estão lendo (Trending) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
         <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <TrendingUp size={18} className="text-brand-purple" />
            <h3 className="font-black text-lg text-gray-900">Em Alta</h3>
         </div>
         
         <div className="divide-y divide-gray-50">
            {[ 
                { title: "Torto Arado", subtitle: "Literatura Brasileira", posts: "15.2K posts" },
                { title: "O Hobbit", subtitle: "Fantasia • J.R.R Tolkien", posts: "8.5K posts" },
                { title: "#Maratona2025", subtitle: "Desafio da Comunidade", posts: "5K posts" },
                { title: "Café com Deus Pai", subtitle: "Espiritualidade", posts: "3.2K posts" }
            ].map((item, i) => (
                <div key={i} className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[11px] text-gray-500 font-medium mb-0.5">{item.subtitle}</p>
                            <p className="font-bold text-[15px] text-gray-900 leading-tight">{item.title}</p>
                            <p className="text-[12px] text-gray-400 mt-0.5">{item.posts}</p>
                        </div>
                        <span className="text-gray-300 text-xs font-bold">#{i + 1}</span>
                    </div>
                </div>
            ))}
         </div>
         <button className="w-full py-3 text-brand-purple text-sm font-bold hover:bg-gray-50 transition-colors text-left px-4">
            Mostrar mais
         </button>
      </div>

      {/* Card: Comunidades */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
         <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-brand-green" />
            <h3 className="font-black text-lg text-gray-900">Clubes Recomendados</h3>
         </div>
         <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                    SF
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-sm text-gray-900 truncate">Sci-Fi Brasil</p>
                    <p className="text-xs text-gray-500 truncate">@scifibr • 45k membros</p>
                </div>
                <button className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity">
                    Entrar
                </button>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                    RM
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-sm text-gray-900 truncate">Romance de Época</p>
                    <p className="text-xs text-gray-500 truncate">@romance • 12k membros</p>
                </div>
                <button className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity">
                    Entrar
                </button>
            </div>
         </div>
      </div>

      {/* Footer Links */}
      <div className="px-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-gray-400">
         <a href="#" className="hover:underline">Termos</a>
         <a href="#" className="hover:underline">Privacidade</a>
         <a href="#" className="hover:underline">Cookies</a>
         <a href="#" className="hover:underline">Acessibilidade</a>
         <span>© 2025 Facillit Hub</span>
      </div>
    </div>
  );
}